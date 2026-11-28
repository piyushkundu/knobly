'use client';
import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { practiceRequest, type LearningOverview } from './useLearning';
export default function QuestionBookmark({ questionId, compact = false }: { questionId: string; compact?:boolean }) {
    const { user } = useAuth();
    const [saved, setSaved] = useState<Set<string>>(new Set()), [busy, setBusy] = useState(false), [error, setError] = useState('');
    useEffect(() => {
        let cancelled = false;
        if (user) practiceRequest<LearningOverview>(user).then(data => { if (!cancelled) setSaved(new Set(data.bookmarks)); }).catch(() => {});
        return () => { cancelled = true; };
    }, [user]);
    if (!user) return null;
    const active = saved.has(questionId);
    return <div className="text-right">
        <button type="button" aria-label={active?'Remove saved revision':'Save for revision'} title={active?'Saved for revision':'Save for revision'} aria-pressed={active} disabled={busy} onClick={async () => {
            setBusy(true); setError('');
            try {
                await practiceRequest(user, { action: 'bookmark', questionId, saved: !active });
                setSaved(current => { const next = new Set(current); if (active) next.delete(questionId); else next.add(questionId); return next; });
            } catch (error) { setError(error instanceof Error ? error.message : 'Could not save question'); }
            finally { setBusy(false); }
        }} className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 disabled:opacity-50" style={compact?{padding:7,borderRadius:8,background:active?'#f3efff':'#fff',borderColor:active?'#d7cdfa':'#e4e7f0',color:active?'#6652c9':'#8c91a5'}:undefined}>
            {active ? <BookmarkCheck size={compact?18:14}/> : <Bookmark size={compact?18:14}/>} {!compact&&(busy ? 'Saving…' : active ? 'Saved for revision' : 'Save for revision')}
        </button>{error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>;
}
