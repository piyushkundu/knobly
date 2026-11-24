'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type * as Monaco from 'monaco-editor';
import { MoreHorizontal, Trash2, X } from 'lucide-react';
import { PRACTICE_MEDIA, mediaExample, type TaskEditorMode } from '@/lib/task-practice';
import { PRACTICE_SHORTCUTS } from '@/lib/task-practice-shortcuts';
import TaskCompilerNewBadge from './TaskCompilerNewBadge';

export interface TaskEditorApi {
    editor: Monaco.editor.IStandaloneCodeEditor;
    monaco: typeof Monaco;
}

export default function TaskPracticeTools({ mode, onModeChange, api, isWhite, onSave, onClear, leading, trailing, language = 'html' }: {
    mode: TaskEditorMode;
    onModeChange: (mode: TaskEditorMode) => void;
    api: TaskEditorApi | null;
    isWhite: boolean;
    onSave: () => boolean;
    onClear: () => void;
    leading: ReactNode;
    trailing: ReactNode;
    language?: 'html' | 'css';
}) {
    const [panel, setPanel] = useState<'shortcuts' | 'media' | null>(null);
    const [status, setStatus] = useState('');
    const [copyStatus, setCopyStatus] = useState('');
    const [ready, setReady] = useState(false);
    const [shortcutSearch, setShortcutSearch] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const saveRef = useRef(onSave);
    useEffect(() => { saveRef.current = onSave; }, [onSave]);

    useEffect(() => {
        if (!menuOpen) return;
        const dismissOutside = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
        };
        const dismissEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('pointerdown', dismissOutside);
        document.addEventListener('keydown', dismissEscape);
        return () => {
            document.removeEventListener('pointerdown', dismissOutside);
            document.removeEventListener('keydown', dismissEscape);
        };
    }, [menuOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!panel || mode !== 'practice' || !dialog) return;
        if (!dialog.open) dialog.showModal();
        return () => { if (dialog.open) dialog.close(); };
    }, [panel, mode]);

    useEffect(() => {
        setReady(false);
        if (mode !== 'practice' || !api) return;
        let cancelled = false;
        let dispose: (() => void) | undefined;
        setStatus('Loading practice shortcuts…');
        const install = language === 'html'
            ? import('@/lib/task-practice-editor').then(({ installPracticeEditor }) => installPracticeEditor)
            : import('@/lib/task-practice-shortcuts').then(({ installPracticeShortcuts }) => (editor: TaskEditorApi['editor'], monaco: TaskEditorApi['monaco'], actions: Parameters<typeof installPracticeShortcuts>[2]) => {
                const bindings = installPracticeShortcuts(editor, monaco, actions);
                return () => bindings.forEach(binding => binding.dispose());
            });
        install.then(installEditor => {
            if (cancelled || api.editor.getModel() === null) return;
            dispose = installEditor(api.editor, api.monaco, {
                showShortcuts: () => setPanel('shortcuts'),
                save: () => setSaveStatus(saveRef.current() ? 'Task draft saved.' : 'Draft could not be saved in this browser.'),
            });
            setReady(true);
            setStatus(language === 'html' ? 'Type ! or html, then Tab / Enter · Suggestions and closing tags are on' : 'CSS property suggestions and VS Code-style editing shortcuts are on');
        }).catch(() => {
            if (!cancelled) setStatus('Shortcuts could not load. Switch to Exam and back to retry; your code is kept.');
        });
        return () => { cancelled = true; dispose?.(); };
    }, [mode, api, language]);

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
        <div>
            <div role="toolbar" aria-label="Code editor toolbar" className="flex flex-wrap items-center gap-1.5 border-b px-2 py-1.5 sm:px-3" style={{ ...palette, backgroundColor: isWhite ? '#f8fafc' : '#131b2e' }}>
                <div className="flex shrink-0 items-center gap-2">{leading}</div>
                <div role="group" aria-label="Editor mode" className="inline-flex shrink-0 items-center gap-0.5 rounded-xl border p-0.5 shadow-inner" style={{ backgroundColor: isWhite ? '#eaf0f8' : '#0b1222', borderColor: isWhite ? '#dbe3ef' : '#334155' }}>
                    {(['exam', 'practice'] as const).map(value => (
                        <button key={value} type="button" aria-label={`${value === 'exam' ? 'Exam' : 'Practice'} mode`} aria-pressed={mode === value}
                            onClick={() => { onModeChange(value); setMenuOpen(false); api?.editor.focus(); }}
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition-shadow focus-visible:outline-2 focus-visible:outline-blue-500"
                            title={value === 'practice' ? status || `Assisted ${language.toUpperCase()} editing with VS Code-style shortcuts` : 'Original exam editor'}
                            style={mode === value ? value === 'practice' ? { backgroundImage: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#ffffff', boxShadow: '0 2px 5px #2563eb25' } : { backgroundColor: isWhite ? '#ffffff' : '#334155', color: palette.color, boxShadow: '0 1px 4px #0f172a15' } : { color: isWhite ? '#475569' : '#cbd5e1' }}>
                            {value === 'exam' ? 'Exam' : 'Practice'}
                            {value === 'practice' && <TaskCompilerNewBadge feature="practice" />}
                        </button>
                    ))}
                </div>
                <p className="sr-only" role="status">
                    {mode === 'exam' ? 'Original editor · Your code stays when you switch modes.' : status || 'VS Code-style HTML editing · Your code stays when you switch modes.'}
                </p>
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    {trailing}
                    <button type="button" onClick={onClear} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-red-500" style={{ backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }} title="Clear code"><Trash2 size={11} />Clear</button>
                    {mode === 'practice' && <div ref={menuRef} className="relative">
                        <button type="button" aria-label="Practice tools" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} title="Practice tools" className="inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-bold" style={palette}><MoreHorizontal size={14} /><span className="hidden xl:inline">Tools</span></button>
                        {menuOpen && <div className="absolute right-0 top-full z-50 mt-2 w-52 space-y-1 rounded-xl border p-1.5 shadow-xl" style={palette}>
                            {[
                                ...(language === 'html' ? [
                                    { label: 'Expand abbreviation', disabled: !ready, action: () => { api?.editor.focus(); api?.editor.getAction('knobly.practice.emmet')?.run(); } },
                                    { label: 'HTML structure', disabled: !ready, action: () => api?.editor.getAction('knobly.practice.structure')?.run() },
                                ] : []),
                                { label: `Format ${language.toUpperCase()}`, disabled: !api, action: () => api?.editor.getAction('editor.action.formatDocument')?.run() },
                                { label: 'Shortcuts', action: () => setPanel('shortcuts') },
                                { label: 'Sample media', action: () => setPanel('media') },
                            ].map(item => <button key={item.label} type="button" disabled={item.disabled} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:brightness-95 disabled:opacity-50" style={palette} onClick={() => { setMenuOpen(false); item.action(); }}>{item.label}</button>)}
                        </div>}
                    </div>}
                </div>
            </div>
            {mode === 'practice' && saveStatus && <p role="status" className="sr-only">{saveStatus}</p>}
            {mode === 'practice' && panel && <dialog ref={dialogRef} aria-labelledby="practice-panel-title" onCancel={() => setPanel(null)} className="m-auto max-h-[82dvh] w-[calc(100%-2rem)] max-w-4xl overflow-auto rounded-2xl border p-0 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm" style={palette}>
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-5 py-4" style={palette}>
                    <h2 id="practice-panel-title" className="text-sm font-bold">{panel === 'shortcuts' ? 'Practice shortcuts' : 'Sample images & video'}</h2>
                    <button type="button" aria-label="Close practice tools" onClick={() => setPanel(null)} className="rounded-lg border p-1.5" style={palette}><X size={16} /></button>
                </div>
            {panel === 'shortcuts' && (
                <div id="practice-shortcuts" className="p-5" style={palette}>
                    <p className="mb-3 text-xs">Windows editing shortcuts while the code editor has focus. Ctrl+Enter inserts a line; Ctrl+Alt+Enter or F5 runs the preview. Press chord keys in sequence, for example Ctrl+K, then Ctrl+C. On Mac, Ctrl means Command and Alt means Option for these practice bindings.</p>
                    <label className="block text-xs font-semibold">Search shortcuts
                        <input type="search" value={shortcutSearch} onChange={event => setShortcutSearch(event.target.value)} placeholder="Search a key or action, e.g. duplicate, Ctrl+Enter" className="my-2 w-full rounded-lg border p-2 text-sm sm:max-w-lg" style={palette} />
                    </label>
                    <div className="max-h-72 overflow-auto">
                        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                            {PRACTICE_SHORTCUTS.filter(item => `${item.keys} ${item.label} ${item.group}`.toLowerCase().includes(shortcutSearch.toLowerCase().trim())).map(item => <div key={item.keys} className="text-xs"><dt className="font-mono font-bold">{item.keys}</dt><dd className="mt-0.5" style={{ color: isWhite ? '#475569' : '#cbd5e1' }}>{item.label} <span className="text-[10px]">· {item.group}</span></dd></div>)}
                        </dl>
                    </div>
                    <p className="mt-3 text-xs">This editor supports editing, search, selection, folding and preview in the current file. Desktop terminal, Git, extensions and debugger commands need VS Code Desktop. Some browser / OS keys, such as closing a browser tab, take priority.</p>
                    <a href="https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs underline" style={{ color: isWhite ? '#1d4ed8' : '#93c5fd' }}>Official VS Code shortcut reference</a>
                </div>
            )}
            {panel === 'media' && (
                <div id="practice-media" className="p-5" style={palette}>
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
            </dialog>}
        </div>
    );
}
