'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { ArrowLeft, Columns, Download, Maximize2, Play, X } from 'lucide-react';
import type { StyleCourseId, StyleDraft, StyleTask } from '@/lib/style-course-types';
import { previewDocument } from '@/lib/style-course-demo';
import { PRACTICE_SHORTCUTS } from '@/lib/task-practice-shortcuts';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr:false, loading:()=> <p className="sc-editor-loading">Loading code editor…</p> });
type Api = { editor: Monaco.editor.IStandaloneCodeEditor; monaco: typeof Monaco };
const noSubscribe = () => () => {};
const HYDRATING = '__knobly_style_hydrating__';
const serverDraft = () => HYDRATING;
function validDraft(value: string | null): StyleDraft | null {
    try { const parsed = JSON.parse(value || 'null'); return typeof parsed?.html === 'string' && typeof parsed?.css === 'string' ? { html:parsed.html, css:parsed.css } : null; } catch { return null; }
}

export default function StylePlayground(props: { course: StyleCourseId; title: string; draftId: string; initial: StyleDraft; task?: StyleTask; backHref: string }) {
    const storageKey = `knobly_style_draft_v1:${props.course}:${props.draftId}`;
    // Read browser storage once after hydration. Never reuse the HTML compiler's keys.
    const [readSaved] = useState(() => {
        let loaded = false, value: string | null = null;
        return () => { if (!loaded) { loaded=true; try { value=localStorage.getItem(storageKey); } catch {} } return value; };
    });
    const raw = useSyncExternalStore(noSubscribe, readSaved, serverDraft);
    if (raw === HYDRATING) return <div className="style-course sc-studio" data-course={props.course}><p className="sc-editor-loading">Loading saved workspace…</p></div>;
    const saved = validDraft(raw);
    return <PlaygroundSession key={`${storageKey}:${saved ? 'restored' : 'new'}`} {...props} initial={saved || props.initial} storageKey={storageKey} restored={!!saved} />;
}

function PlaygroundSession({ course, title, draftId, initial, task, backHref, storageKey, restored }: { course: StyleCourseId; title: string; draftId: string; initial: StyleDraft; task?: StyleTask; backHref: string; storageKey: string; restored: boolean }) {
    const [draft,setDraft] = useState(initial);
    const [output,setOutput] = useState(initial);
    const [file,setFile] = useState<'html'|'css'>('html');
    const [practice,setPractice] = useState(!task);
    const [auto,setAuto] = useState(!task);
    const [view,setView] = useState<'preview'|'target'|'compare'>('preview');
    const [api,setApi] = useState<Api|null>(null);
    const [shortcuts,setShortcuts] = useState(false);
    const [fullscreen,setFullscreen] = useState(false);
    const [confirmation,setConfirmation] = useState<'clear'|'solution'|null>(null);
    const [notice,setNotice] = useState(restored ? 'Your saved draft was restored.' : '');
    const runRef = useRef<()=>void>(()=>{});
    const draftRef = useRef(draft);
    const shortcutDialog = useRef<HTMLDialogElement>(null), fullDialog = useRef<HTMLDialogElement>(null);
    const confirmDialog = useRef<HTMLDialogElement>(null);
    const preview = useMemo(()=>previewDocument(output,course),[output,course]);
    const run = useCallback(()=>{setOutput(draft);if(view==='target')setView('preview');},[draft,view]);
    useEffect(()=>{runRef.current=run;},[run]);
    useEffect(()=>{draftRef.current=draft;},[draft]);
    const saveDraft = useCallback(()=>{
        try { localStorage.setItem(storageKey,JSON.stringify(draftRef.current)); return true; } catch { return false; }
    },[storageKey]);
    useEffect(()=>{
        const timer = setTimeout(saveDraft,600);
        return()=>clearTimeout(timer);
    },[draft,saveDraft]);
    useEffect(()=>{
        const flush=()=>{saveDraft();};
        window.addEventListener('pagehide',flush);
        return()=>{window.removeEventListener('pagehide',flush);flush();};
    },[saveDraft]);
    useEffect(()=>{if(!auto)return;const timer=setTimeout(()=>setOutput(draft),500);return()=>clearTimeout(timer);},[auto,draft]);
    useEffect(()=>{
        if(!api)return;
        const action=api.editor.addAction({id:'knobly.style.run',label:'Run preview',keybindings:[api.monaco.KeyCode.F5,api.monaco.KeyMod.CtrlCmd|api.monaco.KeyMod.Alt|api.monaco.KeyCode.Enter],precondition:'editorTextFocus',run:()=>runRef.current()});
        return()=>action.dispose();
    },[api]);
    useEffect(()=>{
        if(!api||!practice)return;
        let stopped=false,dispose:(()=>void)|undefined;
        const actions={showShortcuts:()=>setShortcuts(true),save:()=>{setNotice(saveDraft()?'Draft saved in this browser.':'Browser storage is unavailable. Download your code to keep it.');}};
        if(file==='html')void import('@/lib/task-practice-editor').then(module=>{if(!stopped)dispose=module.installPracticeEditor(api.editor,api.monaco,actions);});
        else void import('@/lib/task-practice-shortcuts').then(module=>{if(!stopped){const bindings=module.installPracticeShortcuts(api.editor,api.monaco,actions);dispose=()=>bindings.forEach(item=>item.dispose());}});
        return()=>{stopped=true;dispose?.();};
    },[api,practice,file,saveDraft]);
    useEffect(()=>{
        const dialog=shortcutDialog.current;
        if(shortcuts&&!dialog?.open)dialog?.showModal();
        if(!shortcuts&&dialog?.open)dialog.close();
    },[shortcuts]);
    useEffect(()=>{
        const dialog=fullDialog.current;
        if(fullscreen&&!dialog?.open)dialog?.showModal();
        if(!fullscreen&&dialog?.open)dialog.close();
    },[fullscreen]);
    useEffect(()=>{
        const dialog=confirmDialog.current;
        if(confirmation&&!dialog?.open)dialog?.showModal();
        if(!confirmation&&dialog?.open)dialog.close();
    },[confirmation]);
    const mount: OnMount = (editor,monaco)=>setApi({editor,monaco});
    const replaceDraft = (value: StyleDraft, message: string) => { setDraft(value);setOutput(value);setNotice(message); };
    const download = () => {
        let html=previewDocument(draft,course).replace('href="/style-course/w3.css"','href="https://www.w3schools.com/w3css/4/w3.css"');
        html=html.replace(/<head>/i,`<head><base href="${window.location.origin}/">`);
        const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download=`${course}-${draftId}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    const previewPane = (full=false) => <div className={`sc-output-panes ${view==='compare' ? 'sc-output-compare' : ''}`}>
        {task && view!=='preview' && <section><h3>Target reference</h3><iframe src={task.target} title={full?'Fullscreen target reference':'Target reference'} sandbox="allow-scripts" /></section>}
        {(!task||view!=='target') && <section>{view==='compare'&&<h3>My preview</h3>}<iframe srcDoc={preview} title={full?'Fullscreen live preview':'Live CSS preview'} sandbox="allow-scripts allow-forms" /></section>}
    </div>;
    return <div className="style-course sc-studio" data-course={course}>
        <header className="sc-studio-header"><Link href={backHref} aria-label="Back to course"><ArrowLeft size={18}/></Link><div className="sc-studio-title"><strong>{title}</strong><small>{course==='css'?'CSS':'W3.CSS'} · HTML + CSS studio</small></div><div className="sc-studio-actions"><button className="sc-secondary" onClick={download} aria-label="Download code"><Download size={14}/><span>Download</span></button><button type="button" role="switch" aria-checked={auto} className={auto?'sc-primary':'sc-secondary'} onClick={()=>setAuto(value=>!value)}>Auto Run {auto?'On':'Off'}</button><button className="sc-primary" onClick={run}><Play size={14}/>Run</button></div></header>
        {task && <details className="sc-studio-goal"><summary><strong>Task goal:</strong> {task.subtitle}</summary><ol>{task.steps.map(step=><li key={step}>{step}</li>)}</ol>{task.note&&<p>{task.note}</p>}</details>}
        <div className="sc-workspace"><section className="sc-editor-pane" aria-label="Code workspace"><div className="sc-editor-toolbar"><div className="sc-file-tabs" role="group" aria-label="Editor files"><button aria-pressed={file==='html'} onClick={()=>setFile('html')}>index.html</button><button aria-pressed={file==='css'} onClick={()=>setFile('css')}>style.css</button></div><div className="sc-mode-tabs" role="group" aria-label="Editor mode"><button aria-pressed={!practice} onClick={()=>setPractice(false)}>Exam</button><button aria-pressed={practice} onClick={()=>setPractice(true)}>Practice</button></div><button className="sc-clear" onClick={()=>setConfirmation('clear')}>Clear</button></div>
            <div className="sc-editor-tools"><span>{practice?'Suggestions and editing shortcuts on':'Independent exam practice'}{course==='w3css'?' · W3.CSS included':''}</span><button onClick={()=>setShortcuts(true)}>Shortcuts</button><button onClick={()=>void api?.editor.getAction('editor.action.formatDocument')?.run()}>Format</button></div>
            <div className="sc-monaco"><Editor height="100%" path={`style-course/${course}/${draftId}/${file==='html'?'index.html':'style.css'}`} language={file==='html'?'html':'css'} value={draft[file]} onChange={value=>setDraft(current=>({...current,[file]:value||''}))} onMount={mount} theme="vs" options={{fontSize:14,minimap:{enabled:false},wordWrap:'on',scrollBeyondLastLine:false,automaticLayout:true,padding:{top:16},tabSize:2,quickSuggestions:practice,wordBasedSuggestions:'off',suggestOnTriggerCharacters:practice,tabCompletion:practice?'on':'off',autoClosingBrackets:practice?'languageDefined':'never',autoClosingQuotes:practice?'languageDefined':'never',formatOnPaste:practice,formatOnType:practice}}/></div>
            <div className="sc-editor-bottom"><span role="status">{notice || 'Draft saved only in this browser.'}</span>{task&&<button onClick={()=>setConfirmation('solution')}>Show solution</button>}</div>
        </section><section className="sc-preview-pane"><div className="sc-preview-toolbar"><div role="group" aria-label="Output view"><button aria-pressed={view==='preview'} onClick={()=>setView('preview')}>My preview</button>{task&&<><button aria-pressed={view==='target'} onClick={()=>setView('target')}>Target task</button><button aria-pressed={view==='compare'} onClick={()=>setView('compare')}><Columns size={12}/>Compare</button></>}</div><button onClick={()=>setFullscreen(true)} aria-label={`Open ${view} fullscreen`}><Maximize2 size={13}/><span>Fullscreen</span></button></div>{previewPane()}</section></div>
        <dialog ref={shortcutDialog} className="sc-shortcuts-dialog" aria-label="Editor shortcuts" onCancel={e=>{e.preventDefault();setShortcuts(false);}}><header><h2>Editing shortcuts</h2><button aria-label="Close shortcuts" onClick={()=>setShortcuts(false)}><X size={18}/></button></header><p>Practice mode supports VS Code-style editing. Some browser or system shortcuts may be reserved. Run: Ctrl+Alt+Enter or F5.</p><div className="sc-shortcut-list">{PRACTICE_SHORTCUTS.filter(item=>item.group!=='Task').map(item=><div key={item.keys}><kbd>{item.keys}</kbd><span>{item.label}</span></div>)}</div></dialog>
        <dialog ref={fullDialog} className="sc-full-dialog" aria-label="Fullscreen output" onCancel={e=>{e.preventDefault();setFullscreen(false);}}><header><strong>{view==='target'?'Target reference':view==='compare'?'Compare outputs':'My preview'}</strong><button aria-label="Close fullscreen" onClick={()=>setFullscreen(false)}><X size={18}/>Close</button></header>{previewPane(true)}</dialog>
        <dialog ref={confirmDialog} className="sc-shortcuts-dialog" aria-label="Replace current code" onCancel={event=>{event.preventDefault();setConfirmation(null);}}><h2>{confirmation==='clear'?'Clear your code?':'Load the worked solution?'}</h2><p>This replaces the HTML and CSS in this draft. Download your work first if you want to keep a copy.</p><div className="sc-actions"><button className="sc-secondary" autoFocus onClick={()=>setConfirmation(null)}>Keep my code</button><button className="sc-primary" onClick={()=>{if(confirmation==='clear')replaceDraft({html:'',css:''},'Code cleared.');else if(task)replaceDraft(task.solution,'Worked solution loaded.');setConfirmation(null);}}>{confirmation==='clear'?'Clear both files':'Load solution'}</button></div></dialog>
    </div>;
}
