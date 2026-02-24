'use client';

import { useState, useEffect, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Test } from '@/types/test';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: testId } = use(params);
    const { user } = useAuth();
    const [test, setTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [showAllCorrect, setShowAllCorrect] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const testSnap = await getDoc(doc(db, 'tests', testId));
                if (testSnap.exists()) setTest({ id: testSnap.id, ...testSnap.data() } as Test);

                if (user) {
                    const resultSnap = await getDoc(doc(db, 'test_results', `${user.uid}_${testId}`));
                    if (resultSnap.exists()) setAnswers(resultSnap.data().answers || {});
                }
            } catch (err) {
                console.error('[Knobly] Review load error:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [testId, user]);

    if (loading) return <div className="wallpaper-default min-h-screen flex items-center justify-center"><div className="animate-pulse text-cyan-400 text-sm">Loading review...</div></div>;
    if (!test) return <div className="wallpaper-default min-h-screen flex items-center justify-center"><div className="text-red-400">Test not found</div></div>;

    return (
        <div className="wallpaper-default min-h-screen">
            <header className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-gray-400 hover:text-white"><ArrowLeft size={20} /></Link>
                        <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-gaming)' }}>REVIEW</h1>
                    </div>
                    <button onClick={() => setShowAllCorrect(!showAllCorrect)}
                        className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-600/30">
                        {showAllCorrect ? 'Hide' : 'Show'} Correct Answers
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {test.questions.map((q, i) => {
                    const userAnswer = answers[i];
                    const isCorrect = userAnswer === q.correct_answer;
                    const answered = userAnswer !== undefined;

                    return (
                        <div key={i} className="glass-card rounded-2xl p-5">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Q{i + 1}</span>
                                {answered ? (
                                    isCorrect ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <XCircle size={16} className="text-red-400 shrink-0" />
                                ) : <HelpCircle size={16} className="text-gray-500 shrink-0" />}
                            </div>
                            <p className="text-sm text-white font-medium mb-4">{q.text}</p>
                            <div className="grid gap-2">
                                {q.options.map((opt, oi) => {
                                    const isUserPick = userAnswer === oi;
                                    const isCorrectOpt = q.correct_answer === oi;
                                    let style = 'bg-white/[0.02] text-gray-300 border-white/5';
                                    if (showAllCorrect && isCorrectOpt) style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                                    else if (isUserPick && isCorrect) style = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                                    else if (isUserPick && !isCorrect) style = 'bg-red-500/15 text-red-300 border-red-500/30';

                                    return (
                                        <div key={oi} className={`rounded-xl p-3 text-sm border ${style}`}>
                                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                                            {isUserPick && <span className="ml-2 text-[9px] uppercase font-bold">(Your answer)</span>}
                                            {showAllCorrect && isCorrectOpt && <span className="ml-2 text-[9px] uppercase font-bold text-emerald-400">✓ Correct</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            {q.explanation && showAllCorrect && (
                                <div className="mt-3 text-xs text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <strong className="text-cyan-400">Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
