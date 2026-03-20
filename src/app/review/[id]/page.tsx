'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import Link from 'next/link';

/* ── Types ── */
interface Option { id: string; option_text: string; is_correct: boolean; question_id: string; }
interface Question { id: string; question_text: string; question_type: string; marks: number; chapter?: string; difficulty?: string; explanation?: string; exam_options: Option[]; created_at?: any; }
interface Attempt { id: string; test_id: string; user_id: string; score?: number; accuracy?: number; status: string; started_at?: string; submitted_at?: string; }
interface TestData { id: string; title: string; duration_minutes: number; total_marks: number; total_points?: number; }

function getCleanOptionText(text: string): string {
    if (!text) return '';
    if (typeof text !== 'string') return String(text);
    if (text.trim().startsWith('{') && text.includes('"text"')) {
        try { return JSON.parse(text).text || text; } catch { return text; }
    }
    return text;
}

function isOptionCorrect(val: any): boolean {
    if (val === true || val === 1) return true;
    if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === '1';
    }
    return false;
}

export default function ReviewPage() {
    const { id: attemptId } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [testData, setTestData] = useState<TestData | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [stats, setStats] = useState({ correct: 0, wrong: 0, skipped: 0, totalPoints: 0, pointsEarned: 0, timeTaken: '' });
    const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skip'>('all');

    useEffect(() => {
        if (!user || !attemptId) return;

        const load = async () => {
            try {
                // 1) Attempt
                const aSnap = await getDoc(doc(db, 'exam_attempts', attemptId));
                if (!aSnap.exists()) { setLoading(false); return; }
                const att = { id: aSnap.id, ...aSnap.data() } as Attempt;
                setAttempt(att);

                // 2) Test Details
                const tSnap = await getDoc(doc(db, 'exam_tests', att.test_id));
                const tData = tSnap.exists() ? { id: tSnap.id, ...tSnap.data() } as TestData : null;
                setTestData(tData);

                // 3) Responses for this attempt
                const rSnap = await getDocs(query(collection(db, 'exam_responses'), where('attempt_id', '==', attemptId)));
                const respMap: Record<string, any> = {};
                rSnap.docs.forEach(d => {
                    const r = { id: d.id, ...d.data() };
                    respMap[(r as any).question_id] = r;
                });
                setResponses(respMap);

                // 4) Questions + Options (batched)
                const qSnap = await getDocs(query(collection(db, 'exam_questions'), where('test_id', '==', att.test_id)));
                const questionIds = qSnap.docs.map(d => d.id);
                let allOptions: Option[] = [];
                if (questionIds.length > 0) {
                    const batches: string[][] = [];
                    for (let i = 0; i < questionIds.length; i += 30) batches.push(questionIds.slice(i, i + 30));
                    const optResults = await Promise.all(
                        batches.map(b => getDocs(query(collection(db, 'exam_options'), where('question_id', 'in', b))))
                    );
                    optResults.forEach(snap => snap.docs.forEach(o => allOptions.push({ id: o.id, ...o.data() } as Option)));
                }
                const optionsByQ: Record<string, Option[]> = {};
                allOptions.forEach(o => {
                    if (!optionsByQ[o.question_id]) optionsByQ[o.question_id] = [];
                    optionsByQ[o.question_id].push(o);
                });

                const qs: Question[] = qSnap.docs.map(d => {
                    const q = { id: d.id, ...d.data() } as Question;
                    q.exam_options = (optionsByQ[q.id] || []).sort((a, b) => a.id > b.id ? 1 : -1);
                    return q;
                });
                if (qs.length > 0 && qs[0].created_at) {
                    qs.sort((a, b) => (a.created_at?.seconds || 0) - (b.created_at?.seconds || 0));
                }
                setQuestions(qs);

                // 5) Compute stats
                let correct = 0, wrong = 0, skipped = 0;
                const totalQ = qs.length || 1;
                qs.forEach(q => {
                    const type = (q.question_type || '').toUpperCase();
                    const isObj = type === 'MCQ' || type === 'TF';
                    const resp = respMap[q.id];
                    if (isObj) {
                        const correctOptions = q.exam_options.filter(o => isOptionCorrect(o.is_correct));
                        const correctOpt = correctOptions[correctOptions.length - 1];
                        if (resp?.option_id && correctOpt && resp.option_id === correctOpt.id) correct++;
                        else if (resp?.option_id) wrong++;
                        else skipped++;
                    } else {
                        if (resp?.short_answer) wrong++;
                        else skipped++;
                    }
                });
                // Calculate proportional points: Total Points / Total Questions * correct
                const testTotalPoints = tData?.total_points || (tData as any)?.xp_reward || tData?.total_marks || totalQ;
                const pointsPerQ = testTotalPoints / totalQ;
                const totalPoints = Math.round(correct * pointsPerQ);
                let timeTaken = '';
                if (att.started_at && att.submitted_at) {
                    const diff = Math.max(1, Math.round((new Date(att.submitted_at).getTime() - new Date(att.started_at).getTime()) / 60000));
                    timeTaken = `~${diff} min`;
                }
                setStats({ correct, wrong, skipped, totalPoints: testTotalPoints, pointsEarned: totalPoints, timeTaken });
            } catch (err) {
                console.error('[Review] Load error:', err);
            }
            setLoading(false);
        };

        load();
    }, [user, attemptId]);

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#f8fafc' }}>
                <div className="animate-spin h-8 w-8 rounded-full" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6366f1' }}></div>
                <span className="text-sm font-medium" style={{ color: '#6366f1' }}>Analyzing results...</span>
            </div>
        );
    }

    /* ── Not Found ── */
    if (!attempt || !testData) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f8fafc' }}>
                <div className="max-w-md w-full text-center space-y-4 rounded-3xl p-8" style={{ background: '#ffffff', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                    <div className="text-4xl mb-2">❌</div>
                    <h1 className="text-xl font-black" style={{ color: '#0f172a' }}>Review Not Found</h1>
                    <p className="text-sm" style={{ color: '#64748b' }}>This attempt could not be found or loaded.</p>
                    <button onClick={() => router.push('/dashboard')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const totalQForAccuracy = questions.length || 1;
    const accuracy = Math.round((stats.correct / totalQForAccuracy) * 100) || 0;
    const score = stats.correct || 0;

    /* ── Helpers ── */
    const getStatus = (q: Question) => {
        const type = (q.question_type || '').toUpperCase();
        const isObj = type === 'MCQ' || type === 'TF';
        const resp = responses[q.id];
        if (isObj) {
            const correctOptions = q.exam_options.filter(o => isOptionCorrect(o.is_correct));
            const correctOpt = correctOptions[correctOptions.length - 1];
            if (resp?.option_id && correctOpt) {
                if (resp.option_id === correctOpt.id) return { label: 'Correct', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: '✓' };
                return { label: 'Wrong', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: '✗' };
            }
            return { label: 'Skipped', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', icon: '—' };
        }
        if (resp?.short_answer) return { label: 'Review', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: '✎' };
        return { label: 'Skipped', color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', icon: '—' };
    };

    const getDiffStyle = (d: string) => {
        if (d === 'HARD') return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
        if (d === 'MEDIUM') return { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
        return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
    };

    /* ── RENDER ── */
    return (
        <div className="min-h-screen" style={{ background: '#f8fafc' }}>

            {/* ═══ HEADER ═══ */}
            <header className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/dashboard" className="h-9 w-9 rounded-xl flex items-center justify-center transition hover:scale-105" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>←</span>
                        </Link>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-bold truncate" style={{ color: '#0f172a' }}>Performance Analysis</h1>
                                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}>
                                    ● Completed
                                </span>
                            </div>
                            <p className="text-[11px] truncate max-w-xs sm:max-w-lg" style={{ color: '#94a3b8' }}>{testData.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]" style={{ color: '#94a3b8' }}>
                        <span className="hidden sm:inline">⏱ {testData.duration_minutes} min paper</span>
                        <span className="hidden sm:inline h-4 w-px" style={{ background: '#e2e8f0' }}></span>
                        <span className="hidden sm:inline">⚡ {stats.timeTaken || 'Finished'}</span>
                        <button onClick={logout} className="h-8 px-2 sm:px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all hover:scale-105 text-[10px] font-bold" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444' }} title="Logout">
                            <span style={{ fontSize: '12px' }}>⏻</span> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ═══ MAIN ═══ */}
            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* ── Stat Cards ── */}
                <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Score */}
                    <div className="rounded-2xl p-4 sm:p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Points Earned</span>
                            <span style={{ fontSize: '18px' }}>📊</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black" style={{ color: '#0f172a' }}>{stats.pointsEarned}</span>
                            <span className="text-sm" style={{ color: '#94a3b8' }}>/ {stats.totalPoints}</span>
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>
                            {accuracy >= 80 ? 'Excellent performance!' : accuracy >= 50 ? 'Good, keep improving!' : 'Keep practicing!'}
                        </p>
                    </div>

                    {/* Accuracy */}
                    <div className="rounded-2xl p-4 sm:p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Accuracy</span>
                            <span style={{ fontSize: '18px' }}>🎯</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black" style={{ color: accuracy >= 80 ? '#10b981' : accuracy >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {accuracy}%
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>Correct vs total attempted</p>
                    </div>

                    {/* Correct */}
                    <div className="rounded-2xl p-4 sm:p-5" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 2px 12px rgba(16,185,129,0.08)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#10b981' }}>Correct</span>
                            <div className="h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#10b981', color: '#fff' }}>✓</div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black" style={{ color: '#059669' }}>{stats.correct}</div>
                        <p className="text-[10px] mt-1" style={{ color: '#10b981' }}>Correct answers</p>
                    </div>

                    {/* Wrong */}
                    <div className="rounded-2xl p-4 sm:p-5" style={{ background: '#fef2f2', border: '1px solid #fecaca', boxShadow: '0 2px 12px rgba(239,68,68,0.08)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>Wrong</span>
                            <div className="h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#ef4444', color: '#fff' }}>✗</div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black" style={{ color: '#dc2626' }}>{stats.wrong}</div>
                        <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>Wrong answers</p>
                    </div>

                    {/* Skipped */}
                    <div className="rounded-2xl p-4 sm:p-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Skipped</span>
                            <div className="h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#94a3b8', color: '#fff' }}>—</div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-black" style={{ color: '#475569' }}>{stats.skipped}</div>
                        <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>Unanswered questions</p>
                    </div>
                </section>

                {/* ── Legend ── */}
                <section className="flex flex-wrap items-center gap-4 px-1 text-[11px]" style={{ color: '#64748b' }}>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#10b981' }}></span>Correct option</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ef4444' }}></span>Your wrong selection</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#94a3b8' }}></span>Not selected</div>
                    <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#3b82f6' }}></span>Short answer</div>
                </section>

                {/* ── Questions ── */}
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                        <div className="flex items-center gap-2">
                            <span style={{ color: '#6366f1', fontSize: '16px' }}>🔍</span>
                            <h2 className="text-sm sm:text-base font-bold" style={{ color: '#0f172a' }}>Detailed Question Review</h2>
                        </div>
                        {/* Filter Buttons */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                            {[
                                { key: 'all' as const, label: 'All', count: questions.length, color: '#6366f1', bg: '#eef2ff' },
                                { key: 'correct' as const, label: 'Correct', count: stats.correct, color: '#10b981', bg: '#ecfdf5' },
                                { key: 'wrong' as const, label: 'Wrong', count: stats.wrong, color: '#ef4444', bg: '#fef2f2' },
                                { key: 'skip' as const, label: 'Skipped', count: stats.skipped, color: '#64748b', bg: '#f1f5f9' },
                            ].map(f => (
                                <button key={f.key} onClick={() => setFilter(f.key)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                                    style={filter === f.key
                                        ? { background: f.bg, color: f.color, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                                        : { background: 'transparent', color: '#94a3b8' }
                                    }>
                                    {f.label}
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={filter === f.key
                                        ? { background: f.color, color: '#ffffff' }
                                        : { background: '#e2e8f0', color: '#94a3b8' }
                                    }>{f.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {questions.filter(q => {
                        if (filter === 'all') return true;
                        const status = getStatus(q);
                        if (filter === 'correct') return status.label === 'Correct';
                        if (filter === 'skip') return status.label === 'Skipped';
                        return status.label === 'Wrong';
                    }).map((q, idx) => {
                        const status = getStatus(q);
                        const diff = getDiffStyle(q.difficulty || 'EASY');
                        const type = (q.question_type || '').toUpperCase();
                        const isObj = type === 'MCQ' || type === 'TF';
                        const resp = responses[q.id];

                        return (
                            <article key={q.id} className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                                <div className="p-4 sm:p-5">
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono" style={{ background: '#e2e8f0' }}>Q{idx + 1}</span>
                                                    Question
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
                                                    {q.difficulty || 'EASY'}
                                                </span>
                                            </div>
                                            <h3 className="text-sm sm:text-[15px] font-semibold leading-snug" style={{ color: '#0f172a' }}>
                                                {q.question_text}
                                            </h3>
                                            <p className="mt-1 text-[10px]" style={{ color: '#94a3b8' }}>
                                                {q.chapter && <span className="uppercase tracking-wider">{q.chapter} · </span>}
                                                {q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Options (MCQ/TF) */}
                                    {isObj ? (
                                        <div className="mt-3 space-y-2">
                                            {q.exam_options.length === 0 ? (
                                                <div className="p-3 rounded-xl text-xs" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                                                    ⚠️ Options could not be loaded.
                                                </div>
                                            ) : (
                                                q.exam_options.map(opt => {
                                                    const cleanText = getCleanOptionText(opt.option_text);
                                                    const isSelected = resp?.option_id === opt.id;
                                                    const correctOptions = q.exam_options.filter(o => isOptionCorrect(o.is_correct));
                                                    const correctOpt = correctOptions[correctOptions.length - 1];
                                                    const isCorrect = correctOpt ? correctOpt.id === opt.id : false;

                                                    let style: React.CSSProperties = { background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' };
                                                    let icon = <div className="mt-0.5 h-4 w-4 rounded-full flex-shrink-0" style={{ border: '2px solid #cbd5e1' }}></div>;

                                                    if (isCorrect) {
                                                        style = { background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', boxShadow: '0 0 12px rgba(16,185,129,0.12)' };
                                                        icon = <div className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white font-bold" style={{ background: '#10b981' }}>✓</div>;
                                                    }
                                                    if (isSelected && !isCorrect) {
                                                        style = { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', boxShadow: '0 0 12px rgba(239,68,68,0.08)' };
                                                        icon = <div className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] text-white font-bold" style={{ background: '#ef4444' }}>✗</div>;
                                                    }

                                                    return (
                                                        <div key={opt.id} className="p-3 rounded-xl text-xs sm:text-sm flex items-start gap-3 transition-all" style={style}>
                                                            {icon}
                                                            <span className="flex-1 leading-snug">{cleanText}</span>
                                                            {isSelected && <span className="text-[9px] font-bold uppercase flex-shrink-0 mt-0.5" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>(Your pick)</span>}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        /* Short Answer */
                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                            <div className="p-3 rounded-xl text-xs sm:text-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: '#94a3b8' }}>
                                                    ✏️ Your answer
                                                </p>
                                                <p className="whitespace-pre-wrap" style={{ color: '#0f172a' }}>
                                                    {resp?.short_answer || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No answer provided</span>}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl text-xs sm:text-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: '#94a3b8' }}>
                                                    💡 Evaluation note
                                                </p>
                                                <p style={{ color: '#64748b' }}>
                                                    Short answers are checked manually. Marks may change after teacher review.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {q.explanation && q.explanation.trim() && (
                                        <div className="mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                                            <p className="text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1 font-bold" style={{ color: '#6366f1' }}>
                                                ℹ️ Explanation
                                            </p>
                                            <p className="text-xs sm:text-[13px] leading-relaxed" style={{ color: '#475569' }}>
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>

                {/* ── Footer ── */}
                <div className="pt-4 pb-8 flex justify-center">
                    <button onClick={() => router.push('/dashboard')} className="px-6 py-3 rounded-2xl text-sm font-bold text-white flex items-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        ← Back to Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
