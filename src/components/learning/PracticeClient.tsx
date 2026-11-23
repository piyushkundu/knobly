'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle2, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/auth/LoginModal';
import OptionText from '@/components/exam/OptionText';
import QuestionBookmark from './QuestionBookmark';
import { practiceRequest, type StudentSession } from './useLearning';
import styles from './learning.module.css';

export default function PracticeClient() {
    const { user, loading: authLoading } = useAuth(), search = useSearchParams(), router = useRouter();
    const kind = search.get('mode') === 'wrong' ? 'wrong' : search.get('mode') === 'bookmarks' ? 'bookmarks' : 'daily';
    const [session, setSession] = useState<StudentSession | null>(null), [answers, setAnswers] = useState<Record<string, string>>({}), [index, setIndex] = useState(0);
    const [error, setError] = useState(''), [busy, setBusy] = useState(false), [saveStatus, setSaveStatus] = useState('Saved');
    const [preparing, setPreparing] = useState('Preparing your personal practice…');
    const initial = useRef<{ key: string; request: Promise<StudentSession> } | null>(null);
    const activeRequest = useRef('');
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null), saving = useRef<Promise<unknown>>(Promise.resolve());
    const saveVersion = useRef(0);
    const [explanation, setExplanation] = useState(''), [explaining, setExplaining] = useState(false);
    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        const key = user.uid + ':' + kind;
        activeRequest.current = key;
        setSession(null); setAnswers({}); setIndex(0); setError(''); setSaveStatus('Saved');
        saveVersion.current++;
        if (initial.current?.key !== key) initial.current = { key, request: (async () => {
            for (let step = 0; step < 100; step++) {
                const value = await practiceRequest<StudentSession | { preparing: true; analysed: number; remaining: number }>(user, { action: 'start', kind });
                if (activeRequest.current !== key) throw Error('Practice preparation cancelled.');
                if (!('preparing' in value)) return value;
                if (!cancelled) setPreparing('Finding your revision questions… ' + value.analysed + ' past tests checked.');
            }
            throw Error('Please finish your learning analysis on Dashboard, then open this practice again.');
        })() };
        initial.current.request.then(value => { if (!cancelled) { setSession(value); setAnswers(value.answers); setIndex(value.index); setError(''); } })
            .catch(error => { if (!cancelled) setError(error.message); });
        return () => { cancelled = true; if (activeRequest.current === key) activeRequest.current = ''; };
    }, [user, kind]);
    useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);
    useEffect(() => {
        if (saveStatus === 'Saved') return;
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [saveStatus]);
    useEffect(() => { setExplanation(''); }, [index]);
    const queueSave = (nextAnswers: Record<string, string>, nextIndex: number) => {
        if (!session || !user || session.status === 'completed') return;
        const version = saveVersion.current;
        const work = saving.current.catch(() => {}).then(() => practiceRequest(user, { action: 'draft', id: session.id, answers: nextAnswers, index: nextIndex }));
        saving.current = work;
        work.then(() => { if (version === saveVersion.current) setSaveStatus('Saved'); })
            .catch(() => { if (version === saveVersion.current) setSaveStatus('Not saved — retry'); });
        return work;
    };
    const change = (nextAnswers: Record<string, string>, nextIndex: number) => {
        saveVersion.current++;
        setAnswers(nextAnswers); setIndex(nextIndex); setSaveStatus('Saving…');
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => { void queueSave(nextAnswers, nextIndex); }, 700);
    };
    const submit = async () => {
        if (!session || !user) return;
        if (Object.keys(answers).length < session.questions.length && !window.confirm('Some questions are unanswered. Submit this practice anyway?')) return;
        setBusy(true); setError('');
        if (saveTimer.current) clearTimeout(saveTimer.current);
        try {
            await saving.current.catch(() => {});
            const completed = await practiceRequest<StudentSession>(user, { action: 'submit', id: session.id, answers, index });
            setSession(completed); setSaveStatus('Saved');
        } catch (error) { setError(error instanceof Error ? error.message : 'Submission failed. Your answers are still here.'); }
        finally { setBusy(false); }
    };
    if (authLoading) return <div className={styles.loading}><Loader2 className="animate-spin"/>Loading your practice…</div>;
    if (!user) return <LoginModal isOpen onClose={() => { window.location.href = '/dashboard'; }}/>;
    if (!session || initial.current?.key !== user.uid + ':' + kind) return <div className={styles.loading}>{error ? <><p role="alert">{error}</p><Link href="/dashboard">Back to Dashboard</Link></> : <><Loader2 className="animate-spin"/>{preparing}</>}</div>;
    const question = session.questions[index], complete = session.status === 'completed', selected = answers[question.id];
    const answered = Object.keys(answers).length;
    return <div className={styles.page}>
        <header className={styles.practiceHeader}><Link href="/dashboard" onClick={async event => {
            if (complete) return;
            event.preventDefault();
            if (saveTimer.current) clearTimeout(saveTimer.current);
            try { await queueSave(answers, index); router.push('/dashboard'); }
            catch { setError('Your answers could not be saved yet. Please retry before leaving.'); }
        }}><ArrowLeft size={17}/>Dashboard</Link><div><strong>{kind === 'daily' ? 'Daily 10' : kind === 'wrong' ? 'Wrong Answers Notebook' : 'Bookmarked Questions'}</strong><small>{complete ? 'Review & learn' : 'Practice at your pace'} · {session.day} · India time</small></div><span className={styles.chip}>{complete ? 'Completed' : saveStatus}</span></header>
        <main className={styles.practiceGrid}>
            <div>
                {complete && <section className={styles.result}><CheckCircle2 size={30}/><div><h1>{session.score} / {session.questions.length} correct</h1><p>{Math.round((session.score || 0) / session.questions.length * 100)}% accuracy · {session.questions.length - answered} skipped</p><small>{kind === 'daily' ? 'Daily league counts one completed Daily 10 per India calendar day.' : 'Revision helps you practise; exam points stay separate.'}</small></div><Link href="/dashboard">View progress <ArrowRight size={16}/></Link></section>}
                <section className={styles.questionCard}>
                    <div className={styles.questionMeta}><span className={styles.eyebrow}>QUESTION {index + 1} OF {session.questions.length}</span><QuestionBookmark questionId={question.id}/></div>
                    <div className={styles.tags}><span>{question.category}</span><span>{question.topic}</span></div>
                    <h1 className={styles.questionText}>{question.text.split('\n').map((line, i) => <span key={i} lang={/[\u0900-\u097f]/.test(line) ? 'hi' : 'en'}>{line}</span>)}</h1>
                    <p className={styles.reason}><Sparkles size={14}/>{question.reason}</p>
                    <div className={styles.options}>{question.options.map((option, i) => {
                        const correct = complete && option.id === question.correctOptionId, wrong = complete && selected === option.id && !correct;
                        return <button key={option.id} type="button" disabled={complete || busy} aria-pressed={selected === option.id}
                            className={[styles.option, selected === option.id ? styles.selected : '', correct ? styles.correct : '', wrong ? styles.wrong : ''].join(' ')}
                            onClick={() => change({ ...answers, [question.id]: option.id }, index)}>
                            <b>{String.fromCharCode(65 + i)}</b><span><OptionText testId={question.testId} text={option.text}/></span>
                            {correct && <CheckCircle2 size={19}/>}
                        </button>;
                    })}</div>
                    {!complete && selected && <button className={styles.textButton} onClick={() => { const next = { ...answers }; delete next[question.id]; change(next, index); }}>Clear this answer</button>}
                    {complete && <div className={styles.explanation}><strong>{selected ? selected === question.correctOptionId ? 'Correct — well done!' : 'Review the correct answer above.' : 'You skipped this question.'}</strong>
                        {question.explanation && <p>{question.explanation}</p>}
                        <button disabled={explaining} onClick={async () => {
                            setExplaining(true);
                            try {
                                const res = await fetch('/api/ai/explain-question', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                                    question_text: question.text, options: question.options.map(o => o.text),
                                    correct_option: question.options.find(o => o.id === question.correctOptionId)?.text,
                                    user_answer: question.options.find(o => o.id === selected)?.text || 'Skipped', language: 'Hindi' }) });
                                const data = await res.json(); setExplanation(data.explanation || 'Explanation is unavailable right now.');
                            } catch { setExplanation('Please try the explanation again.'); }
                            finally { setExplaining(false); }
                        }}><Sparkles size={14}/>{explaining ? 'Explaining…' : 'Explain in Hindi'}</button>
                        {explanation && <p className="whitespace-pre-wrap">{explanation}</p>}
                    </div>}
                    {error && <p role="alert" className={styles.error}>{error}</p>}
                    {saveStatus.startsWith('Not saved') && !complete && <button className={styles.textButton} onClick={() => queueSave(answers, index)}>Retry saving answers</button>}
                    <div className={styles.questionNav}><button disabled={index === 0 || busy} onClick={() => complete ? setIndex(index - 1) : change(answers, index - 1)}><ArrowLeft size={16}/>Previous</button><span>{answered}/{session.questions.length} answered</span>
                        {index < session.questions.length - 1 ? <button disabled={busy} onClick={() => complete ? setIndex(index + 1) : change(answers, index + 1)}>Next<ArrowRight size={16}/></button> : !complete ? <button className={styles.primary} disabled={busy} onClick={submit}>{busy ? 'Submitting…' : 'Finish practice'}<CheckCircle2 size={16}/></button> : <Link href="/dashboard">Dashboard<ArrowRight size={16}/></Link>}</div>
                </section>
            </div>
            <aside className={styles.palette}><span className={styles.eyebrow}>YOUR PRACTICE</span><h2>{complete ? 'Review every question' : 'A little practice, every day.'}</h2><div className={styles.bar}><i style={{ width: answered / session.questions.length * 100 + '%' }}/></div><p>{answered} of {session.questions.length} answered</p>
                <div className={styles.paletteButtons}>{session.questions.map((q, i) => <button key={q.id} aria-label={'Question ' + (i + 1)} aria-current={index === i ? 'step' : undefined}
                    className={index === i ? styles.current : answers[q.id] ? styles.answered : ''} onClick={() => complete ? setIndex(i) : change(answers, i)}>{i + 1}</button>)}</div>
                <p className={styles.note}><Bookmark size={15}/>Save any question for your next revision.</p>
                <p className={styles.note}>This set draws from {new Set(session.questions.map(q => q.testId)).size} active tests.</p>
                {!complete && <button className={styles.primary} disabled={busy} onClick={submit}>Finish practice<CheckCircle2 size={16}/></button>}
                {complete && <Link href="/practice?mode=wrong" className={styles.secondary}><RotateCcw size={15}/>Revise mistakes</Link>}
                <p className={styles.note}>No exam-rank points are changed by this practice. Answers save while you work; wait for “Saved” before leaving.</p>
            </aside>
        </main>
    </div>;
}
