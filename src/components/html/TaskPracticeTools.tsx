'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Monaco from 'monaco-editor';
import { isPracticeNew, PRACTICE_NEW_UNTIL, PRACTICE_MEDIA, mediaExample, type TaskEditorMode } from '@/lib/task-practice';
import { PRACTICE_SHORTCUTS } from '@/lib/task-practice-shortcuts';

export interface TaskEditorApi {
    editor: Monaco.editor.IStandaloneCodeEditor;
    monaco: typeof Monaco;
}

export default function TaskPracticeTools({ mode, onModeChange, api, isWhite, onSave }: {
    mode: TaskEditorMode;
    onModeChange: (mode: TaskEditorMode) => void;
    api: TaskEditorApi | null;
    isWhite: boolean;
    onSave: () => boolean;
}) {
    const [isNew, setIsNew] = useState(false);
    const [panel, setPanel] = useState<'shortcuts' | 'media' | null>(null);
    const [status, setStatus] = useState('');
    const [copyStatus, setCopyStatus] = useState('');
    const [ready, setReady] = useState(false);
    const [shortcutSearch, setShortcutSearch] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const saveRef = useRef(onSave);
    useEffect(() => { saveRef.current = onSave; }, [onSave]);

    useEffect(() => {
        const now = Date.now();
        setIsNew(isPracticeNew(now));
        if (now >= PRACTICE_NEW_UNTIL) return;
        const timer = setTimeout(() => setIsNew(false), PRACTICE_NEW_UNTIL - now);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setReady(false);
        if (mode !== 'practice' || !api) return;
        let cancelled = false;
        let dispose: (() => void) | undefined;
        setStatus('Loading practice shortcuts…');
        import('@/lib/task-practice-editor').then(({ installPracticeEditor }) => {
            if (cancelled || api.editor.getModel() === null) return;
            dispose = installPracticeEditor(api.editor, api.monaco, {
                showShortcuts: () => setPanel('shortcuts'),
                save: () => setSaveStatus(saveRef.current() ? 'Task draft saved.' : 'Draft could not be saved in this browser.'),
            });
            setReady(true);
            setStatus('Type ! or html, then Tab / Enter · Suggestions and closing tags are on');
        }).catch(() => {
            if (!cancelled) setStatus('Shortcuts could not load. Switch to Exam and back to retry; your code is kept.');
        });
        return () => { cancelled = true; dispose?.(); };
    }, [mode, api]);

    useEffect(() => {
        if (!copyStatus) return;
        const timer = setTimeout(() => setCopyStatus(''), 3000);
        return () => clearTimeout(timer);
    }, [copyStatus]);
    useEffect(() => {
        if (!saveStatus) return;
        const timer = setTimeout(() => setSaveStatus(''), 3000);
        return () => clearTimeout(timer);
    }, [saveStatus]);

    const copy = async (asset: typeof PRACTICE_MEDIA[number], example: boolean) => {
        const url = new URL(asset.path, window.location.origin).href;
        try {
            await navigator.clipboard.writeText(example ? mediaExample(asset, window.location.origin) : url);
            setCopyStatus(`${asset.title}: ${example ? 'HTML' : 'link'} copied`);
        } catch { setCopyStatus('Copy unavailable. Select the link below and copy it manually.'); }
    };

    const palette = isWhite
        ? { backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }
        : { backgroundColor: '#131b2e', color: '#f1f5f9', borderColor: '#475569' };
    const button = 'rounded-lg border px-3 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';

    return (
        <section aria-label="Compiler modes" style={palette} className="border-b px-3 py-2 sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Editor mode" className="flex flex-wrap gap-1 rounded-xl border p-1" style={{ borderColor: palette.borderColor }}>
                    {(['exam', 'practice'] as const).map(value => (
                        <button key={value} type="button" aria-pressed={mode === value}
                            onClick={() => { onModeChange(value); api?.editor.focus(); }}
                            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold focus-visible:outline-2 focus-visible:outline-blue-500"
                            style={mode === value ? { backgroundColor: '#1d4ed8', color: '#ffffff' } : { color: palette.color }}>
                            {value === 'exam' ? 'Exam mode' : 'Practice mode'}
                            {value === 'practice' && isNew && <span style={{ backgroundColor: '#fef3c7', color: '#78350f' }} className="rounded px-1 py-0.5 text-[9px] font-extrabold">NEW</span>}
                        </button>
                    ))}
                </div>
                <p className="min-w-0 flex-1 basis-40 text-xs" role="status" style={{ color: isWhite ? '#475569' : '#cbd5e1' }}>
                    {mode === 'exam' ? 'Original editor · Your code stays when you switch modes.' : status || 'VS Code-style HTML editing · Your code stays when you switch modes.'}
                </p>
                {mode === 'practice' && <>
                    <button type="button" className={button} style={palette} disabled={!ready} onClick={() => { api?.editor.focus(); api?.editor.getAction('knobly.practice.emmet')?.run(); }}>Expand</button>
                    <button type="button" className={button} style={palette} disabled={!ready} onClick={() => api?.editor.getAction('knobly.practice.structure')?.run()}>HTML structure</button>
                    <button type="button" className={button} style={palette} onClick={() => api?.editor.getAction('editor.action.formatDocument')?.run()} disabled={!api}>Format</button>
                    <button type="button" className={button} style={palette} aria-expanded={panel === 'shortcuts'} aria-controls="practice-shortcuts" onClick={() => setPanel(panel === 'shortcuts' ? null : 'shortcuts')}>Shortcuts</button>
                    <button type="button" className={button} style={palette} aria-expanded={panel === 'media'} aria-controls="practice-media" onClick={() => setPanel(panel === 'media' ? null : 'media')}>Sample media</button>
                </>}
            </div>
            {mode === 'practice' && saveStatus && <p role="status" className="mt-2 text-xs">{saveStatus}</p>}
            {mode === 'practice' && panel === 'shortcuts' && (
                <div id="practice-shortcuts" className="mt-3 rounded-xl border p-3" style={palette}>
                    <h2 className="mb-2 text-sm font-bold">Practice shortcuts</h2>
                    <p className="mb-3 text-xs">Windows editing shortcuts while the code editor has focus. Ctrl+Enter inserts a line; Ctrl+Alt+Enter or F5 runs the preview. Press chord keys in sequence, for example Ctrl+K, then Ctrl+C. On Mac, Ctrl means Command and Alt means Option for these practice bindings.</p>
                    <label className="block text-xs font-semibold">Search shortcuts
                        <input type="search" value={shortcutSearch} onChange={event => setShortcutSearch(event.target.value)} placeholder="Search a key or action, e.g. duplicate, Ctrl+Enter" className="my-2 w-full rounded-lg border p-2 text-sm sm:max-w-lg" style={palette} />
                    </label>
                    <div className="max-h-72 overflow-auto">
                        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                            {PRACTICE_SHORTCUTS.filter(item => `${item.keys} ${item.label} ${item.group}`.toLowerCase().includes(shortcutSearch.toLowerCase().trim())).map(item => <div key={item.keys} className="text-xs"><dt className="font-mono font-bold">{item.keys}</dt><dd className="mt-0.5" style={{ color: isWhite ? '#475569' : '#cbd5e1' }}>{item.label} <span className="text-[10px]">· {item.group}</span></dd></div>)}
                        </dl>
                    </div>
                    <p className="mt-3 text-xs">This single-file HTML editor supports editing, search, selection, folding and preview. Desktop terminal, Git, extensions, multi-file Explorer and debugger commands need VS Code Desktop. Some browser / OS keys, such as closing a browser tab, take priority.</p>
                    <a href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs underline" style={{ color: isWhite ? '#1d4ed8' : '#93c5fd' }}>Official VS Code shortcut reference</a>
                </div>
            )}
            {mode === 'practice' && panel === 'media' && (
                <div id="practice-media" className="mt-3 rounded-xl border p-3" style={palette}>
                    <h2 className="text-sm font-bold">Sample images &amp; video</h2>
                    <p className="mb-3 mt-1 text-xs">Free Knobly practice assets. Copy a full link into src, or copy the complete HTML example. Nothing is inserted over your code.</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {PRACTICE_MEDIA.map(asset => <article key={asset.id} className="min-w-0 rounded-lg border p-2" style={palette}>
                            {asset.kind === 'image'
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={asset.path} alt={asset.alt} width="320" height="180" loading="lazy" className="h-24 w-full rounded object-cover" />
                                : <video src={asset.path} controls preload="none" aria-label={asset.alt} className="h-24 w-full rounded bg-slate-950" />}
                            <h3 className="my-2 text-xs font-bold">{asset.title}</h3>
                            <label className="block text-[10px]">Media link
                                <input aria-label={`${asset.title} URL`} readOnly onFocus={event => event.target.select()} value={typeof window === 'undefined' ? asset.path : new URL(asset.path, window.location.origin).href} className="my-1 w-full rounded border p-1 font-mono text-[11px]" style={palette} />
                            </label>
                            <div className="mt-1 flex flex-wrap gap-2">
                                <button type="button" className={button} style={palette} onClick={() => copy(asset, false)}>Copy link</button>
                                <button type="button" className={button} style={palette} onClick={() => copy(asset, true)}>Copy HTML</button>
                            </div>
                        </article>)}
                    </div>
                    <p role="status" className="mt-2 text-xs font-semibold">{copyStatus}</p>
                </div>
            )}
        </section>
    );
}
