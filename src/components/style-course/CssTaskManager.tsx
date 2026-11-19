'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Code2, KeyRound, LockKeyhole, RefreshCw, UnlockKeyhole, X } from 'lucide-react';
import type { CourseSummary } from '@/lib/style-course-types';

type Task = CourseSummary['tasks'][number];
type Selection = { taskId: string; action: 'lock' | 'unlock' };

export default function CssTaskManager({ tasks, lockedTask }: { tasks: Task[]; lockedTask?: Task }) {
    const router = useRouter();
    const [unlocked, setUnlocked] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selection, setSelection] = useState<Selection | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [saving, setSaving] = useState(false);
    const version = useRef(0), busy = useRef(false), dialog = useRef<HTMLDialogElement>(null);
    const validIds = useRef(new Set(tasks.map(task => task.id)));
    const parseIds = useCallback((value: unknown) => {
        if (!Array.isArray(value) || value.some(id => typeof id !== 'string')) throw new Error('Task status is unavailable. Please retry.');
        return value.filter(id => validIds.current.has(id));
    }, []);
    const refresh = useCallback(async () => {
        if (busy.current) return;
        const request = ++version.current;
        try {
            const response = await fetch('/api/css-tasks', { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error('Task status is unavailable. Please retry.');
            const ids = parseIds(data.unlockedTasks);
            if (request === version.current) { setUnlocked(ids); setLoadError(''); }
        } catch {
            if (request === version.current) { setUnlocked([]); setLoadError('Task status is unavailable. Please retry.'); }
        } finally { if (request === version.current) setLoading(false); }
    }, [parseIds]);
    useEffect(() => {
        void refresh();
        const check = () => { void refresh(); };
        window.addEventListener('focus', check);
        // This sequence counter intentionally reads its latest value to reject stale requests.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        return () => { ++version.current; window.removeEventListener('focus', check); };
    }, [refresh, lockedTask?.id]);
    useEffect(() => {
        if (selection && !dialog.current?.open) dialog.current?.showModal();
        if (!selection && dialog.current?.open) dialog.current.close();
    }, [selection]);
    const close = () => { if (!busy.current) { setSelection(null); setPassword(''); setError(''); } };
    const open = (taskId: string, action: 'lock' | 'unlock') => { setPassword(''); setError(''); setNotice(''); setSelection({ taskId, action }); };
    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!selection || !password || busy.current) return;
        busy.current = true; ++version.current; setSaving(true); setError('');
        try {
            const response = await fetch('/api/css-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...selection, password }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'The change could not be saved. Please retry.');
            setUnlocked(parseIds(data.unlockedTasks)); setLoadError(''); setLoading(false);
            setNotice(selection.action === 'unlock' ? 'Tasks unlocked for students.' : 'Tasks locked for students.');
            setPassword(''); setSelection(null); router.refresh();
        } catch (reason) { setError(reason instanceof Error ? reason.message : 'The change could not be saved. Please retry.'); }
        finally { busy.current = false; setSaving(false); setLoading(false); }
    };
    const available = (id: string) => !loading && !loadError && unlocked.includes(id);
    return <div className="sc-task-access">
        {loadError && <div className="sc-task-status" role="alert"><AlertCircle size={16}/>{loadError}<button type="button" className="sc-secondary" onClick={() => void refresh()}><RefreshCw size={13}/>Retry</button></div>}
        {notice && <p className="sc-task-status" role="status">{notice}</p>}
        {lockedTask ? <section className="sc-card sc-task-locked-screen"><span className="sc-task-lock-emblem"><LockKeyhole size={30}/></span><div className="sc-kicker">INSTRUCTOR CONTROLLED</div><h1>{lockedTask.title}</h1><p>{available(lockedTask.id) ? 'This task is unlocked. Open it to continue.' : 'This task is locked by the instructor. Use the same instructor password as HTML tasks to unlock it for students.'}</p><div className="sc-actions">{available(lockedTask.id) ? <button className="sc-primary" type="button" onClick={() => router.refresh()}>Open task<ArrowRight size={15}/></button> : <button className="sc-primary" type="button" onClick={() => open(lockedTask.id, 'unlock')}><KeyRound size={15}/>Instructor unlock</button>}<Link className="sc-secondary" href="/web-design/css/tasks">All CSS tasks</Link></div></section> : <>
            <div className="sc-task-lock-toolbar"><span>{loading ? 'Checking task status…' : `${unlocked.length} unlocked · ${tasks.length - unlocked.length} locked`}</span><button type="button" className="sc-secondary" onClick={() => open('all', 'unlock')}><LockKeyhole size={14}/>Instructor controls</button></div>
            <div className="sc-task-grid">{tasks.map((task, index) => <article className={`sc-card sc-task-card ${available(task.id) ? '' : 'sc-task-is-locked'}`} key={task.id}><div className="sc-task-card-status"><span className="sc-number">{index + 1}</span><span>{available(task.id) ? <UnlockKeyhole size={13}/> : <LockKeyhole size={13}/>} {loading ? 'Checking…' : available(task.id) ? 'Unlocked' : 'Locked'}</span><button type="button" aria-label={`${available(task.id) ? 'Lock' : 'Unlock'} ${task.title}`} onClick={() => open(task.id, available(task.id) ? 'lock' : 'unlock')}><KeyRound size={15}/></button></div><h2>{task.title}</h2><p>{task.subtitle}</p><div className="sc-tags">{task.skills.map(skill => <code key={skill}>{skill}</code>)}</div><div className="sc-actions">{available(task.id) ? <><Link className="sc-secondary" href={`/web-design/css/tasks/${task.id}`}>View task<ArrowRight size={14}/></Link><Link className="sc-primary" href={`/web-design/css/tasks/${task.id}/compiler`}>Start coding<Code2 size={14}/></Link></> : <button className="sc-secondary" type="button" onClick={() => open(task.id, 'unlock')}><LockKeyhole size={14}/>Locked by instructor</button>}</div></article>)}</div>
        </>}
        <dialog ref={dialog} className="sc-task-lock-dialog" aria-labelledby="css-task-lock-title" onCancel={event => { event.preventDefault(); close(); }}>
            <form onSubmit={submit}><div className="sc-task-dialog-heading"><span><KeyRound size={20}/><strong id="css-task-lock-title">Instructor controls</strong></span><button type="button" aria-label="Close instructor controls" disabled={saving} onClick={close}><X size={19}/></button></div><p>Changes apply to all students. The password is the same as HTML tasks.</p><label>Choose task<select value={selection?.taskId || 'all'} disabled={saving} onChange={event => setSelection(current => current && { ...current, taskId: event.target.value })}><option value="all">All CSS tasks</option>{tasks.map(task => <option value={task.id} key={task.id}>{task.title}</option>)}</select></label><label>Action<select value={selection?.action || 'unlock'} disabled={saving} onChange={event => setSelection(current => current && { ...current, action: event.target.value as Selection['action'] })}><option value="unlock">Unlock for students</option><option value="lock">Lock for students</option></select></label><label>Instructor password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} autoComplete="off" disabled={saving}/></label>{error && <p className="sc-task-dialog-error" role="alert">{error}</p>}<div className="sc-actions"><button className="sc-primary" disabled={saving || !password} type="submit">{saving ? 'Saving…' : selection?.action === 'lock' ? 'Confirm lock' : 'Confirm unlock'}</button><button className="sc-secondary" disabled={saving} type="button" onClick={close}>Cancel</button></div></form>
        </dialog>
    </div>;
}
