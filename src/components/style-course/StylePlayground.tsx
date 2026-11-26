'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { OnMount } from '@monaco-editor/react';
import { ArrowLeft, Code2, Columns, Download, Eye, FileCode, Loader2, Maximize2, Moon, Play, Send, Sun, Target, X, ZoomIn, ZoomOut } from 'lucide-react';
import TaskPracticeTools, { type TaskEditorApi } from '@/components/html/TaskPracticeTools';
import TaskFullscreenPreview from '@/components/html/TaskFullscreenPreview';
import type { StyleCourseId, StyleDraft, StyleTask } from '@/lib/style-course-types';
import { previewDocument } from '@/lib/style-course-demo';
import { workspaceZip } from '@/lib/style-workspace';
import type { StyleEvaluation } from '@/lib/style-task-evaluation';
import StyleSubmissionResult from './StyleSubmissionResult';
import { openStyleDraft, removeStyleDraft, STYLE_TASK_IDLE_CHECK_MS, STYLE_TASK_IDLE_MS, styleTaskDraftExpired } from '@/lib/style-task-draft';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr:false, loading:()=> <p className="sc-editor-loading">Loading code editor…</p> });
type StudioTask = Pick<StyleTask, 'id' | 'title' | 'subtitle' | 'target' | 'steps' | 'skills'>;
type Props = { course: StyleCourseId; title: string; draftId: string; initial: StyleDraft; task?: StudioTask; backHref: string };
const noSubscribe = () => () => {};
const HYDRATING = '__knobly_style_hydrating__';
const serverDraft = () => HYDRATING;
function validDraft(value: string | null): (StyleDraft & {lastActive?:number}) | null {
    try { const parsed = JSON.parse(value || 'null'); return typeof parsed?.html === 'string' && typeof parsed?.css === 'string' ? { html:parsed.html, css:parsed.css, lastActive:typeof parsed.lastActive==='number'?parsed.lastActive:undefined } : null; } catch { return null; }
}

export default function StylePlayground(props: Props) {
    const storageKey = `knobly_style_draft_v1:${props.course}:${props.draftId}`;
    // Restore both files before mounting the editor; never touch HTML task draft keys.
    const [readSaved] = useState(() => {
        let loaded = false, value: string | null = null;
        return () => { if (!loaded) { loaded=true; try { value=localStorage.getItem(storageKey); } catch {} } return value; };
    });
    const raw = useSyncExternalStore(noSubscribe, readSaved, serverDraft);
    if (raw === HYDRATING) return <div className="sc-studio" data-course={props.course}><p className="sc-editor-loading">Loading saved workspace…</p></div>;
    const saved = validDraft(raw);
    return <PlaygroundSession key={`${storageKey}:${saved ? 'restored' : 'new'}`} {...props} initial={saved || props.initial} lastActive={saved?.lastActive} storageKey={storageKey} restored={!!saved}/>;
}

function PlaygroundSession({ course, title, draftId, initial, task, backHref, storageKey, restored, lastActive }: Props & { storageKey: string; restored: boolean; lastActive?:number }) {
    const [opened] = useState(()=>openStyleDraft(initial,lastActive,Date.now(),!!task));
    const [draft,setDraft] = useState(opened.draft);
    const [output,setOutput] = useState(opened.draft);
    const [file,setFile] = useState<'html'|'css'>('html');
    const [practice,setPractice] = useState(!task);
    const [auto,setAuto] = useState(!task);
    const [view,setView] = useState<'preview'|'target'|'compare'>(task ? 'target' : 'preview');
    const [layout,setLayout] = useState<'editor'|'split'|'preview'>('split');
    const [dark,setDark] = useState(false);
    const [fontSize,setFontSize] = useState(16);
    const [api,setApi] = useState<TaskEditorApi|null>(null);
    const [fullscreen,setFullscreen] = useState(false);
    const [clear,setClear] = useState(false);
    const [notice,setNotice] = useState(opened.expired?'Code cleared after 1 hour without editing.':restored ? 'Your saved HTML and CSS were restored.' : '');
    const [submitting,setSubmitting] = useState(false);
    const [submitError,setSubmitError] = useState('');
    const [submission,setSubmission] = useState<{evaluation:StyleEvaluation;draft:StyleDraft}|null>(null);
    const [showResult,setShowResult] = useState(false);
    const requestRef = useRef<AbortController|null>(null);
    const draftRef = useRef(draft), runRef = useRef<()=>void>(()=>{});
    const apiRef = useRef<TaskEditorApi|null>(null);
    const lastEditedRef = useRef(opened.lastActive), expiredRef=useRef(opened.expired), resettingRef=useRef(false);
    const confirmDialog = useRef<HTMLDialogElement>(null);
    const preview = useMemo(()=>previewDocument(output,course),[output,course]);
    const resetWorkspace = useCallback((expired=false)=>{
        const previousActivity=lastEditedRef.current;
        expiredRef.current=expired;resettingRef.current=true;
        if(!expired)lastEditedRef.current=Date.now();
        const empty={html:'',css:''};draftRef.current=empty;
        requestRef.current?.abort();requestRef.current=null;
        const editorApi=apiRef.current;
        const prefix=`style-course/${course}/${draftId}/`;
        for(const model of editorApi?.monaco.editor.getModels()||[]) {
            const path=model.uri.path.replace(/^\//,'');
            if(path===prefix+'index.html'||path===prefix+'style.css')model.setValue('');
        }
        setDraft(empty);setOutput(empty);setSubmission(null);setShowResult(false);setSubmitError('');setSubmitting(false);setFullscreen(false);
        setNotice(expired?'Code cleared after 1 hour without editing.':'Both files cleared.');
        try { removeStyleDraft(localStorage,storageKey,expired?previousActivity:Infinity); } catch {}
        resettingRef.current=false;
    },[course,draftId,storageKey]);
    const expireIfIdle = useCallback(()=>{
        if(!task||expiredRef.current||!styleTaskDraftExpired(lastEditedRef.current,Date.now()))return false;
        resetWorkspace(true);return true;
    },[task,resetWorkspace]);
    const run = useCallback(()=>{if(expireIfIdle())return;setOutput(draftRef.current);if(view==='target')setView('preview');},[view,expireIfIdle]);
    useEffect(()=>{runRef.current=run;},[run]);
    useEffect(()=>{draftRef.current=draft;},[draft]);
    const saveDraft = useCallback(()=>{
        if(expireIfIdle()||expiredRef.current)return true;
        try {
            if(!draftRef.current.html&&!draftRef.current.css)return removeStyleDraft(localStorage,storageKey);
            localStorage.setItem(storageKey,JSON.stringify({...draftRef.current,lastActive:lastEditedRef.current}));return true;
        } catch { return false; }
    },[storageKey,expireIfIdle]);
    useEffect(()=>{if(opened.expired)try { removeStyleDraft(localStorage,storageKey,opened.lastActive); } catch {}},[opened,storageKey]);
    useEffect(()=>{const timer=setTimeout(saveDraft,600);return()=>clearTimeout(timer);},[draft,saveDraft]);
    useEffect(()=>{const flush=()=>{saveDraft();};window.addEventListener('pagehide',flush);return()=>{window.removeEventListener('pagehide',flush);flush();};},[saveDraft]);
    useEffect(()=>{if(!auto)return;const timer=setTimeout(()=>{if(!expireIfIdle())setOutput(draftRef.current);},500);return()=>clearTimeout(timer);},[auto,draft,expireIfIdle]);
    useEffect(()=>{
        if(!task||expiredRef.current)return;
        const timer=setTimeout(expireIfIdle,Math.max(0,STYLE_TASK_IDLE_MS-(Date.now()-lastEditedRef.current)));
        return()=>clearTimeout(timer);
    },[draft,task,expireIfIdle]);
    useEffect(()=>{
        if(!task)return;
        const check=()=>{expireIfIdle();};
        const visible=()=>{if(document.visibilityState==='visible')check();};
        const timer=setInterval(check,STYLE_TASK_IDLE_CHECK_MS);
        window.addEventListener('focus',check);window.addEventListener('keydown',check,true);document.addEventListener('visibilitychange',visible);
        return()=>{clearInterval(timer);window.removeEventListener('focus',check);window.removeEventListener('keydown',check,true);document.removeEventListener('visibilitychange',visible);};
    },[task,expireIfIdle]);
    useEffect(()=>{
        if(!api)return;
        const binding=api.editor.addAction({id:'knobly.style.run',label:'Run preview',keybindings:[api.monaco.KeyCode.F5,api.monaco.KeyMod.CtrlCmd|api.monaco.KeyMod.Alt|api.monaco.KeyCode.Enter],precondition:'editorTextFocus',run:()=>runRef.current()});
        return()=>binding.dispose();
    },[api]);
    useEffect(()=>{
        if(!api||!practice)return;
        let cancelled=false,dispose:(()=>void)|undefined;
        void import('@/lib/css-practice-suggestions').then(module=>{if(!cancelled)dispose=module.installCssSuggestions(api.editor,api.monaco);}).catch(()=>{if(!cancelled)setNotice('CSS suggestions could not load. Switch Exam → Practice to retry. Your code is kept.');});
        return()=>{cancelled=true;dispose?.();};
    },[api,practice]);
    useEffect(()=>()=>{requestRef.current?.abort();requestRef.current=null;},[]);
    useEffect(()=>{
        const keydown=(event: KeyboardEvent)=>{if((event.key==='F5'&&!event.ctrlKey&&!event.metaKey)||((event.ctrlKey||event.metaKey)&&event.altKey&&event.key==='Enter')){event.preventDefault();runRef.current();}};
        window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
    },[]);
    useEffect(()=>{const dialog=confirmDialog.current;if(clear&&!dialog?.open)dialog?.showModal();if(!clear&&dialog?.open)dialog.close();},[clear]);
    const mount: OnMount = (editor,monaco)=>{apiRef.current={editor,monaco};setApi({editor,monaco});if(expiredRef.current)resetWorkspace(true);};
    const submit = async () => {
        if(!task||requestRef.current||expireIfIdle())return;
        if(!draft.html.trim()){setSubmitError('Pehle apna HTML code likhein, phir Submit karein.');return;}
        const submitted={...draft},controller=new AbortController();requestRef.current=controller;
        setSubmitting(true);setSubmitError('');setShowResult(false);saveDraft();setOutput(submitted);
        const timeout=setTimeout(()=>controller.abort(),20_000);
        try {
            const response=await fetch('/api/evaluate-style-task',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({course,taskId:task.id,...submitted}),signal:controller.signal});
            const data=await response.json();
            if(!response.ok)throw Error(typeof data.error==='string'?data.error:'Your project could not be reviewed. Please try again.');
            if(!data.evaluation||typeof data.evaluation.score!=='number'||!Array.isArray(data.evaluation.breakdown))throw Error('The review response was incomplete. Please try again.');
            if(requestRef.current===controller){setSubmission({evaluation:data.evaluation,draft:submitted});setShowResult(true);}
        } catch(error) {
            if(requestRef.current===controller)setSubmitError(controller.signal.aborted?'Review timed out. Your code is safe; please submit again.':error instanceof Error?error.message:'Review failed. Please try again.');
        } finally {clearTimeout(timeout);if(requestRef.current===controller){requestRef.current=null;setSubmitting(false);}}
    };
    const download = () => {
        if(expireIfIdle())return;
        const url=URL.createObjectURL(new Blob([workspaceZip(draft,course)],{type:'application/zip'}));
        const link=document.createElement('a');link.href=url;link.download=`${course}-${draftId}.zip`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        setNotice('Downloaded index.html and style.css together. Extract the ZIP and open index.html.');
    };
    const panes = <div className={`sc-output-panes ${view==='compare' ? 'sc-output-compare' : ''}`}>
        {task&&view!=='preview'&&<section>{view==='compare'&&<h3 className="sc-target-label">Target task</h3>}<iframe src={task.target} title="Target reference" sandbox="allow-scripts"/></section>}
        {(!task||view!=='target')&&<section>{view==='compare'&&<h3 className="sc-student-label">My preview</h3>}<iframe srcDoc={preview} title="Live CSS preview" sandbox="allow-scripts allow-forms"/></section>}
    </div>;
    return <main className="sc-studio" data-course={course} data-theme={dark?'dark':'light'}>
        <header className="sc-studio-header">
            <Link href={backHref} className="sc-studio-icon" aria-label="Back to task or lesson"><ArrowLeft size={18}/></Link><span className="sc-studio-mark"><FileCode size={18}/></span>
            <div className="sc-studio-title"><h1>{title}</h1><small>{course==='css'?'CSS':'W3.CSS'} Studio · HTML + CSS live compiler</small></div>
            <div className="sc-studio-actions">
                <div className="sc-layout-switch" role="group" aria-label="Workspace layout">{([{id:'editor',icon:Code2,label:'Editor only'},{id:'split',icon:Columns,label:'Split view'},{id:'preview',icon:Eye,label:'Preview only'}] as const).map(({id,icon:Icon,label})=><button key={id} className="sc-studio-icon" onClick={()=>setLayout(id)} aria-label={label} aria-pressed={layout===id}><Icon size={15}/></button>)}</div>
                <button className="sc-studio-icon" onClick={()=>setDark(value=>!value)} aria-label={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={16}/>:<Moon size={16}/>}</button>
                <button className="sc-studio-button sc-download-project" onClick={download} title="Download index.html and style.css in one ZIP"><Download size={14}/><span>Download</span></button>
                <button type="button" role="switch" aria-checked={auto} className={`sc-studio-button sc-auto-run ${auto?'is-on':''}`} onClick={()=>setAuto(value=>!value)}><span className="sc-toggle-track"><i/></span>Auto Run</button>
                <button className="sc-studio-run" onClick={run}><Play size={14} fill="currentColor"/>Run</button>
                {task&&<button className="sc-studio-submit" onClick={()=>void submit()} disabled={submitting}>{submitting?<Loader2 size={14} className="sc-submit-spinner"/>:<Send size={14}/>}<span>{submitting?'Checking…':'Submit'}</span></button>}
            </div>
        </header>
        {task&&<details className="sc-studio-goal"><summary><Target size={15}/><strong>Task Goal:</strong><span>{task.subtitle}</span></summary><div><ol>{task.steps.map(step=><li key={step}>{step}</li>)}</ol></div></details>}
        {submitError&&<div className="sc-submit-error" role="alert"><span>{submitError}</span><button onClick={()=>setSubmitError('')} aria-label="Dismiss submission error"><X size={15}/></button></div>}
        <div className="sc-workspace" data-layout={layout}>
            <section className="sc-editor-pane" aria-label="Code workspace" hidden={layout==='preview'}>
                <TaskPracticeTools mode={practice?'practice':'exam'} onModeChange={mode=>setPractice(mode==='practice')} api={api} isWhite={!dark} onSave={saveDraft} onClear={()=>setClear(true)} language={file}
                    leading={<><div className="sc-file-tabs" role="group" aria-label="Editor files">{(['html','css'] as const).map(value=><button key={value} aria-pressed={file===value} onClick={()=>setFile(value)}><i data-file={value}/>{value==='html'?'index.html':'style.css'}</button>)}</div><span className="sc-line-count">{draft[file].split('\n').length} lines</span></>}
                    trailing={<div className="sc-code-zoom"><button aria-label="Zoom out code" disabled={fontSize<=10} onClick={()=>setFontSize(value=>Math.max(10,value-1))}><ZoomOut size={12}/></button><button onClick={()=>setFontSize(16)} title="Reset code zoom">{fontSize}px</button><button aria-label="Zoom in code" disabled={fontSize>=24} onClick={()=>setFontSize(value=>Math.min(24,value+1))}><ZoomIn size={12}/></button></div>}/>
                <div className="sc-monaco"><Editor height="100%" path={`style-course/${course}/${draftId}/${file==='html'?'index.html':'style.css'}`} language={file} value={draft[file]} onChange={value=>{if(resettingRef.current||expireIfIdle())return;const active=api?.editor.getModel()?.getLanguageId()==='css'?'css':api?'html':file;lastEditedRef.current=Date.now();expiredRef.current=false;const next={...draftRef.current,[active]:value||''};draftRef.current=next;setDraft(next);setNotice('');}} onMount={mount} theme={dark?'vs-dark':'vs'} options={{fontSize,fontFamily:"'JetBrains Mono', 'Fira Code', Consolas, monospace",minimap:{enabled:false},wordWrap:'on',scrollBeyondLastLine:false,automaticLayout:true,padding:{top:12,bottom:12},tabSize:4,colorDecorators:practice,colorDecoratorsActivatedOn:'clickAndHover',quickSuggestions:practice,wordBasedSuggestions:'off',suggestOnTriggerCharacters:practice,tabCompletion:practice?'on':'off',autoClosingBrackets:practice?'languageDefined':'never',autoClosingQuotes:practice?'languageDefined':'never',linkedEditing:practice&&file==='html',formatOnPaste:practice,formatOnType:practice,smoothScrolling:true}}/></div>
                <footer className="sc-editor-bottom"><span role="status">{notice||(task?'HTML + style.css · Auto-saved · Clears after 1h without editing.':'HTML + style.css · Draft saved in this browser.')}</span>{submission?<button className="sc-last-result" onClick={()=>setShowResult(true)}>Last result: {submission.evaluation.score}/100</button>:<span>{file.toUpperCase()}</span>}</footer>
            </section>
            <section className="sc-preview-pane" aria-label="Output workspace" hidden={layout==='editor'}>
                <div className="sc-preview-toolbar"><div role="group" aria-label="Output view"><button data-view="preview" aria-pressed={view==='preview'} onClick={()=>setView('preview')}><Eye size={13}/>My Preview</button>{task&&<><button data-view="target" aria-pressed={view==='target'} onClick={()=>setView('target')}><Target size={13}/>Target Task</button><button data-view="compare" aria-pressed={view==='compare'} onClick={()=>setView('compare')}><Columns size={13}/>Compare</button></>}</div><button className="sc-output-fullscreen" onClick={()=>setFullscreen(true)} aria-label={`Open ${view} fullscreen`}><Maximize2 size={13}/><span>Open {view==='target'?'target':view==='compare'?'compare':'preview'} fullscreen</span></button></div>
                {task&&view==='target'&&<div className="sc-target-notice"><Target size={13}/><strong>Target Output Reference:</strong><span>Recreate this webpage with HTML and CSS.</span></div>}
                {panes}
            </section>
        </div>
        {fullscreen&&<TaskFullscreenPreview mode={task?view:'preview'} targetSrc={task?.target||''} previewHtml={preview} previewKey={0} sandbox="allow-scripts allow-forms" onClose={()=>setFullscreen(false)}/>}
        {showResult&&submission&&<StyleSubmissionResult result={submission.evaluation} changed={draft.html!==submission.draft.html||draft.css!==submission.draft.css} onClose={()=>setShowResult(false)} onCompare={()=>{setShowResult(false);setView('compare');setLayout('split');}} onResubmit={()=>void submit()}/>}
        <dialog ref={confirmDialog} className="sc-clear-dialog" aria-label="Clear current project" onCancel={event=>{event.preventDefault();setClear(false);}}><header><h2>Clear both files?</h2><button aria-label="Close clear dialog" onClick={()=>setClear(false)}><X size={18}/></button></header><p>This clears index.html and style.css. Download your project first if you want to keep it.</p><div><button autoFocus onClick={()=>setClear(false)}>Keep my code</button><button className="sc-clear-confirm" onClick={()=>{resetWorkspace();setClear(false);}}>Clear both files</button></div></dialog>
    </main>;
}
