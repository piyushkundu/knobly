'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function TaskFullscreenPreview({ mode, targetSrc, previewHtml, previewKey, onClose }: {
    mode: 'preview' | 'target' | 'compare';
    targetSrc: string;
    previewHtml: string;
    previewKey: number;
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const title = mode === 'target' ? 'Target fullscreen' : mode === 'compare' ? 'Compare fullscreen' : 'My preview fullscreen';
    useEffect(() => {
        const dialog = dialogRef.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);
    return (
        <dialog ref={dialogRef} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}
            className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 p-0 backdrop:bg-black/60"
            style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
            <div className="flex h-full min-h-0 flex-col">
                <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2" style={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155' }}>
                    <h2 className="text-sm font-bold" style={{ color: '#ffffff' }}>{title}</h2>
                    <button type="button" autoFocus onClick={onClose} aria-label="Close fullscreen" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: '#334155', color: '#ffffff' }}><X size={15} />Close</button>
                </header>
                <div className={`flex min-h-0 flex-1 ${mode === 'compare' ? 'flex-col sm:flex-row' : ''}`}>
                    {mode !== 'preview' && <section className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {mode === 'compare' && <h3 className="border-b px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#fff7ed', color: '#9a3412' }}>Target task</h3>}
                        <iframe src={targetSrc} title="Fullscreen target output" className="min-h-0 w-full flex-1 border-0 bg-white" />
                    </section>}
                    {mode !== 'target' && <section className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {mode === 'compare' && <h3 className="border-b px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#ecfdf5', color: '#065f46' }}>My preview</h3>}
                        <iframe key={previewKey} srcDoc={previewHtml} title="Fullscreen student output" className="min-h-0 w-full flex-1 border-0 bg-white"
                            sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox" />
                    </section>}
                </div>
            </div>
        </dialog>
    );
}
