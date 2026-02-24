'use client';

import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
    query, where, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

// --- Types ---
interface TestData {
    id: string;
    title: string;
    track_id: string;
    duration_minutes: number;
    xp_reward: number;
    [key: string]: any;
}
interface Option {
    id: string;
    option_text: string;
    is_correct: boolean;
}
interface QuestionData {
    id: string;
    question_text: string;
    question_type: string;
    chapter?: string;
    marks?: number;
    exam_options?: Option[];
}
interface AttemptData {
    id: string;
}
type ResponsesMap = Record<string, { option_id: string | null; short_answer: string | null }>;

// --- Helpers ---
function requestFullscreenAny() {
    const el = document.documentElement as any;
    if (el.requestFullscreen) {
        return el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
        return el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
        return el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
        return el.msRequestFullscreen();
    }
    return Promise.reject('Fullscreen API is not supported.');
}

function exitFullscreenAny() {
    const doc = document as any;
    if (doc.exitFullscreen) {
        return doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
        return doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
        return doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
        return doc.msExitFullscreen();
    }
    return Promise.resolve();
}

function isFullscreenAny() {
    const doc = document as any;
    return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
}

function formatTimer(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function TestPlayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: testId } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const startBtnRef = useRef<HTMLButtonElement>(null);
    const warningCenterRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<TestData | null>(null);
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [attempt, setAttempt] = useState<AttemptData | null>(null);

    const [examStarted, setExamStarted] = useState(false);
    const [examFinished, setExamFinished] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responsesMap, setResponsesMap] = useState<ResponsesMap>({});
    const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Anti cheat
    const [warningCount, setWarningCount] = useState(0);
    const MAX_WARNINGS = 3;
    const [warningMsg, setWarningMsg] = useState<{ title: string, desc: string } | null>(null);

    // Dialogs
    const [confirmMsg, setConfirmMsg] = useState<{ title: string, text: string, onConfirm: () => void } | null>(null);

    // UI State
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [resultData, setResultData] = useState<{ score: number, total: number, accuracy: number, xpEarned: number, statusType: string } | null>(null);

    const shortInputRef = useRef<HTMLTextAreaElement>(null);

    // --------------------------------------------------
    // INIT LOAD
    // --------------------------------------------------
    useEffect(() => {
        if (!user || user.uid === undefined) return;

        const init = async () => {
            try {
                // 1. Load Test
                const docSnap = await getDoc(doc(db, 'exam_tests', testId));
                if (!docSnap.exists()) {
                    setLoading(false);
                    return;
                }
                const tData = { id: docSnap.id, ...docSnap.data() } as TestData;
                setTestData(tData);

                // 2. Load Questions
                const qSnap = await getDocs(query(collection(db, 'exam_questions'), where('test_id', '==', testId)));
                const loadedQ: QuestionData[] = [];
                for (const d of qSnap.docs) {
                    const quest = { id: d.id, ...d.data() } as QuestionData;
                    const optsSnap = await getDocs(query(collection(db, 'exam_options'), where('question_id', '==', quest.id)));
                    quest.exam_options = optsSnap.docs.map(o => ({ id: o.id, ...o.data() } as Option));
                    if (quest.exam_options.length > 0) {
                        quest.exam_options = shuffleArray(quest.exam_options);
                    }
                    loadedQ.push(quest);
                }
                setQuestions(shuffleArray(loadedQ));

                // 3. Create Attempt
                const duration = Math.max(1, tData.duration_minutes || 60);
                const attRef = await addDoc(collection(db, 'exam_attempts'), {
                    user_id: user.uid,
                    test_id: testId,
                    started_at: new Date().toISOString(),
                    status: 'IN_PROGRESS',
                    created_at: serverTimestamp()
                });
                setAttempt({ id: attRef.id });
                setTimeLeft(duration * 60);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            init();
        }
    }, [testId, user]);

    // Track visited for first question after load
    useEffect(() => {
        if (questions.length > 0 && !visitedSet.has(questions[0].id)) {
            setVisitedSet(prev => new Set(prev).add(questions[0].id));
        }
    }, [questions, visitedSet]);

    // --------------------------------------------------
    // TIMER
    // --------------------------------------------------
    useEffect(() => {
        if (!examStarted || examFinished || timeLeft === null) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    finalizeSubmit('AUTO_SUBMITTED');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [examStarted, examFinished, timeLeft]);

    // --------------------------------------------------
    // PROCTOR LOG
    // --------------------------------------------------
    const logProctor = async (eventType: string, details: string) => {
        if (!attempt || !user) return;
        try {
            await addDoc(collection(db, 'exam_proctor_log'), {
                attempt_id: attempt.id,
                user_id: user.uid,
                event_type: eventType,
                details,
                created_at: serverTimestamp()
            });
        } catch (err) {
            console.warn('Proctor log failed', err);
        }
    };

    const handleCheat = useCallback(async (eventType: string) => {
        if (!examStarted || examFinished) return;

        setWarningCount(w => {
            const newW = w + 1;
            if (newW >= MAX_WARNINGS) {
                finalizeSubmit('AUTO_SUBMITTED');
            }
            return newW;
        });

        let title = 'Security Alert';
        let desc = 'Suspicious activity detected.';
        let isFsErr = false;

        if (eventType === 'COPY') {
            title = 'Copying is Blocked';
            desc = 'Keyboard shortcuts and Menu Copy are disabled.';
            await logProctor('COPY', 'User tried to copy exam content.');
        } else if (eventType === 'TAB') {
            title = 'Focus Lost';
            desc = 'You switched tabs or minimized the browser.';
            await logProctor('TAB_SWITCH', 'User changed tab or window.');
        } else if (eventType === 'FULLSCREEN_EXIT') {
            title = 'Fullscreen Exited';
            desc = 'You must remain in fullscreen mode. Click anywhere to return.';
            isFsErr = true;
            await logProctor('FULLSCREEN_EXIT', 'User exited fullscreen.');
        }

        setWarningMsg({ title, desc });

        // If it was a fullscreen error, try to request it back immediately (often blocked without user gesture)
        if (isFsErr) {
            try {
                requestFullscreenAny().catch(() => { });
            } catch (e) { }
        }

        // Auto hide warning center after 5s
        setTimeout(() => {
            setWarningMsg(null);
        }, 5000);

    }, [examStarted, examFinished, attempt, user]);

    // Attach cheat listeners
    useEffect(() => {
        if (!examStarted || examFinished) return;

        const onCopy = (e: ClipboardEvent) => { e.preventDefault(); handleCheat('COPY'); };
        const onCut = (e: ClipboardEvent) => { e.preventDefault(); handleCheat('COPY'); };
        const onPaste = (e: ClipboardEvent) => { e.preventDefault(); };
        const onContextMenu = (e: MouseEvent) => { e.preventDefault(); };

        const onKeyDown = (e: KeyboardEvent) => {
            // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
                (e.ctrlKey && (e.key === 'C' || e.key === 'c')) ||
                (e.ctrlKey && (e.key === 'V' || e.key === 'v')) ||
                (e.ctrlKey && (e.key === 'P' || e.key === 'p'))
            ) {
                e.preventDefault();
                handleCheat('COPY');
            }
        };

        const onVisibilityChange = () => { if (document.hidden) handleCheat('TAB'); };
        const onBlur = () => { handleCheat('TAB'); };

        const onFullscreenChange = () => {
            if (!isFullscreenAny()) handleCheat('FULLSCREEN_EXIT');
        };

        const onWebkitFullscreenChange = () => {
            if (!isFullscreenAny()) handleCheat('FULLSCREEN_EXIT');
        };

        document.addEventListener('copy', onCopy);
        document.addEventListener('cut', onCut);
        document.addEventListener('paste', onPaste);
        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('blur', onBlur);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onWebkitFullscreenChange);

        return () => {
            document.removeEventListener('copy', onCopy);
            document.removeEventListener('cut', onCut);
            document.removeEventListener('paste', onPaste);
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onWebkitFullscreenChange);
        };
    }, [examStarted, examFinished, handleCheat]);

    // --------------------------------------------------
    // OPERATIONS
    // --------------------------------------------------
    const handleOptionClick = async (questionId: string, optionId: string) => {
        if (!examStarted || examFinished || !attempt) return;

        setResponsesMap(prev => ({
            ...prev,
            [questionId]: { option_id: optionId, short_answer: null }
        }));

        const respId = `${attempt.id}_${questionId}`;
        const payload = {
            attempt_id: attempt.id,
            question_id: questionId,
            option_id: optionId,
            short_answer: null,
            updated_at: serverTimestamp()
        };
        await setDoc(doc(db, 'exam_responses', respId), payload, { merge: true });
    };

    let shortSaveTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleShortAnswerChange = (questionId: string, val: string) => {
        if (!examStarted || examFinished || !attempt) return;

        setResponsesMap(prev => ({
            ...prev,
            [questionId]: { option_id: null, short_answer: val }
        }));

        if (shortSaveTimeout.current) clearTimeout(shortSaveTimeout.current);
        shortSaveTimeout.current = setTimeout(async () => {
            const respId = `${attempt.id}_${questionId}`;
            const payload = {
                attempt_id: attempt.id,
                question_id: questionId,
                option_id: null,
                short_answer: val,
                updated_at: serverTimestamp()
            };
            await setDoc(doc(db, 'exam_responses', respId), payload, { merge: true });
        }, 500);
    };

    const countAnswered = () => {
        return Object.values(responsesMap).filter(r => r && (r.option_id || (r.short_answer && r.short_answer.toString().trim() !== ''))).length;
    };

    const finalizeSubmit = async (type = 'SUBMITTED') => {
        if (examFinished || !attempt || !testData) return;
        setExamFinished(true);
        setMobileDrawerOpen(false);

        let score = 0;
        let correctCount = 0;
        questions.forEach((q) => {
            const resp = responsesMap[q.id];
            if (!resp || !resp.option_id) return;
            const correctOpt = (q.exam_options || []).find(o => o.is_correct);
            if (correctOpt && correctOpt.id === resp.option_id) {
                score += (q.marks || 1);
                correctCount++;
            }
        });

        const totalQ = questions.length || 1;
        const accuracy = Math.round((correctCount / totalQ) * 100);
        const xpEarned = testData.xp_reward || 0;

        await updateDoc(doc(db, 'exam_attempts', attempt.id), {
            status: type,
            submitted_at: new Date().toISOString(),
            score,
            accuracy,
            xp_earned: xpEarned,
        });

        if (xpEarned > 0 && user) {
            const qState = query(collection(db, 'exam_user_state'), where('user_id', '==', user.uid));
            const stateSnap = await getDocs(qState);
            if (!stateSnap.empty) {
                const stDoc = stateSnap.docs[0];
                await updateDoc(stDoc.ref, {
                    total_xp: (stDoc.data().total_xp || 0) + xpEarned
                });
            }
        }

        if (isFullscreenAny()) {
            try { await exitFullscreenAny(); } catch (e) { }
        }

        setResultData({ score, total: totalQ, accuracy, xpEarned, statusType: type });
    };

    // --------------------------------------------------
    // RENDER HELPERS
    // --------------------------------------------------
    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">Loading...</div>;
    }

    if (!testData || questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-4">
                    <h1 className="text-xl text-white font-bold">Exam Invalid</h1>
                    <p className="text-slate-400">This exam could not be loaded or has no questions.</p>
                    <button onClick={() => router.push('/dashboard')} className="px-4 py-2 bg-sky-500/20 text-sky-300 rounded-xl hover:bg-sky-500/30 transition">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const existingResp = responsesMap[currentQ.id] || {};

    const getPaletteClass = (qId: string, idx: number) => {
        if (idx === currentIndex) return "bg-sky-500/90 border-sky-300 text-white shadow-k-glow";
        const ans = responsesMap[qId];
        if (ans && (ans.option_id || (ans.short_answer && ans.short_answer.trim() !== ''))) {
            return "bg-emerald-500/80 border-emerald-300 text-white";
        }
        if (visitedSet.has(qId)) {
            return "bg-amber-500/80 border-amber-300 text-white";
        }
        return "bg-slate-800 border-slate-700 text-slate-400";
    };

    const isTimerPulse = timeLeft !== null && timeLeft < 60 && !examFinished;

    return (
        <div className="min-h-screen text-slate-100 overflow-x-hidden selection:bg-rose-500/30 selection:text-rose-200">
            <Script src="https://unpkg.com/@phosphor-icons/web" strategy="lazyOnload" />

            {/* Background elements (matching HTML exactly) */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
                <div className="absolute inset-0 bg-k-grid bg-[size:42px_42px] opacity-[0.32] mix-blend-soft-light" style={{ backgroundImage: 'var(--background-image-k-grid)' }}></div>
                <div className="absolute -top-24 -left-10 h-72 w-72 bg-sky-500/25 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-28 -right-12 h-80 w-80 bg-rose-500/25 blur-3xl rounded-full"></div>
            </div>

            {/* Warning Overlay - clicking anywhere tries to re-enter fullscreen */}
            {warningMsg && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 cursor-pointer"
                    title="Click anywhere to return to exam"
                    onClick={() => {
                        try {
                            if (!isFullscreenAny()) {
                                const el = document.documentElement as any;
                                if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
                                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                                else if (el.msRequestFullscreen) el.msRequestFullscreen();
                            }
                        } catch (e) { }
                        setWarningMsg(null);
                    }}
                >
                    <div className="w-full max-w-sm rounded-3xl border border-rose-400/80 bg-gradient-to-br from-rose-900 via-slate-950 to-rose-900 shadow-[0_0_32px_rgba(248,113,113,0.6)] px-5 py-6 flex flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center animate-pulse">
                                <i className="ph ph-warning-octagon text-3xl text-rose-400"></i>
                            </div>
                        </div>
                        <h3 className="text-sm uppercase tracking-[0.2em] text-rose-300 font-bold mb-1">Security Breach</h3>
                        <p className="text-lg font-semibold text-white mb-1">{warningMsg.title}</p>
                        <p className="text-xs text-rose-200 max-w-[250px] leading-relaxed">{warningMsg.desc}</p>
                        <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 w-full animate-[shrinkX_5s_linear_forwards] origin-left"></div>
                        </div>
                        <p className="mt-3 text-[11px] font-mono text-rose-400">Warning {warningCount} of {MAX_WARNINGS}</p>
                    </div>
                </div>
            )}

            {/* Confirm Overlay */}
            {confirmMsg && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
                    <div className="w-full max-w-xs sm:max-w-sm rounded-3xl border border-white/10 bg-slate-900 shadow-2xl p-5 transform transition-all">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
                                <i className="ph ph-question text-2xl text-sky-400"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white">{confirmMsg.title}</h3>
                                <p className="text-xs text-slate-400 mt-1">{confirmMsg.text}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button onClick={() => setConfirmMsg(null)} className="w-full py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition">Cancel</button>
                                <button onClick={() => { confirmMsg.onConfirm(); setConfirmMsg(null); }} className="w-full py-2 rounded-xl border border-sky-500/50 bg-sky-500/20 text-sky-100 text-xs font-medium hover:bg-sky-500/30 transition shadow-lg">Yes, Proceed</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Drawer Overlay */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-slate-900 border-l border-white/10 flex flex-col shadow-2xl animate-fade-in-right">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <i className="ph ph-squares-four text-sky-400"></i> Palette & Info
                            </h2>
                            <button onClick={() => setMobileDrawerOpen(false)} className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white">
                                <i className="ph ph-x"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Questions</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((q, idx) => (
                                        <button key={q.id} onClick={() => { setCurrentIndex(idx); setVisitedSet(v => new Set(v).add(q.id)); setMobileDrawerOpen(false); }}
                                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs border transition font-medium ${getPaletteClass(q.id, idx)}`}>
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 space-y-2 text-[11px]">
                                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span><span className="text-slate-300">Answered</span></div>
                                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span><span className="text-slate-300">Visited</span></div>
                                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span><span className="text-slate-300">Current</span></div>
                                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-600"></span><span className="text-slate-400">Not Visited</span></div>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-rose-400 uppercase tracking-wider block mb-2">Security Status</span>
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-rose-200">Warnings Issued</span>
                                        <span className="text-sm font-bold text-rose-400">{warningCount} / {MAX_WARNINGS}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(warningCount / MAX_WARNINGS) * 100}%` }}></div>
                                    </div>
                                    <p className="text-[10px] text-rose-300/70 mt-2 leading-tight">If you reach {MAX_WARNINGS} warnings, the exam will auto-submit.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-slate-950 flex flex-col gap-2">
                            <p className="text-[10px] text-slate-500 text-center mb-1">Use the top button to submit.</p>
                            <button onClick={() => {
                                setConfirmMsg({
                                    title: 'Exit Exam?', text: 'Timer continues if you leave.', onConfirm: () => router.push('/dashboard')
                                });
                            }} className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition">
                                <i className="ph ph-arrow-u-up-left text-sm"></i> Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Overlay */}
            {resultData && (
                <div className="fixed inset-0 z-[80] bg-slate-950/95 backdrop-blur-md flex items-center justify-center px-3 sm:px-5 py-4">
                    <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col">
                        <header className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/95">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center text-slate-950 font-semibold text-lg" style={{ boxShadow: 'var(--shadow-k-neon)' }}>K</div>
                                <div className="leading-tight">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">Exam Submitted</h2>
                                    <p className="text-[11px] text-slate-400">Your results are ready.</p>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 p-5 overflow-y-auto scrollbar-thin">
                            <div className="flex flex-col gap-5">
                                <div className="rounded-2xl border border-white/12 bg-slate-950/50 px-4 py-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><i className="ph ph-chart-bar text-lg text-sky-300"></i> Performance Summary</h3>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-center">
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Score</div>
                                            <div className="text-2xl font-bold text-white mt-1">{resultData.score}<span className="text-base text-slate-500 font-normal">/{resultData.total}</span></div>
                                        </div>
                                        <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-center">
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Accuracy</div>
                                            <div className={`text-2xl font-bold mt-1 ${resultData.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{resultData.accuracy}%</div>
                                        </div>
                                        <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-center">
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">XP Earned</div>
                                            <div className="text-2xl font-bold text-sky-400 mt-1">+{resultData.xpEarned}</div>
                                        </div>
                                        <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-center">
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Status</div>
                                            <div className={`text-xs font-bold mt-2 uppercase tracking-wider ${resultData.statusType === 'AUTO_SUBMITTED' ? 'text-rose-400' : 'text-emerald-400'}`}>{resultData.statusType.replace('_', ' ')}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => router.push(`/review/${attempt?.id || ''}`)} className="w-full py-3 rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-100 font-medium flex items-center justify-center gap-2 hover:bg-sky-500/30 transition shadow-lg">
                                        <i className="ph ph-list-magnifying-glass text-lg"></i> Review Full Analysis & Answers
                                    </button>
                                    <button onClick={() => router.push('/dashboard')} className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium flex items-center justify-center gap-2 hover:bg-slate-700 transition">
                                        <i className="ph ph-house text-lg"></i> Back to Dashboard
                                    </button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            )}

            {/* Start Overlay */}
            {!examStarted && !examFinished && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-slate-950 font-semibold" style={{ boxShadow: 'var(--shadow-k-neon)' }}>K</div>
                            <div className="leading-tight">
                                <h2 className="text-lg font-semibold text-white">Secure Exam Mode</h2>
                                <p className="text-[11px] text-slate-400">Strict anti-cheat protocols are active.</p>
                            </div>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4">
                            <ul className="text-[11px] text-rose-100 space-y-2">
                                <li className="flex items-start gap-2"><i className="ph ph-prohibit text-sm text-rose-400 mt-0.5"></i><span><strong>Right click & Copy</strong> are disabled.</span></li>
                                <li className="flex items-start gap-2"><i className="ph ph-arrows-out-simple text-sm text-rose-400 mt-0.5"></i><span><strong>Exiting fullscreen</strong> triggers a warning.</span></li>
                                <li className="flex items-start gap-2"><i className="ph ph-browsers text-sm text-rose-400 mt-0.5"></i><span><strong>Switching tabs</strong> triggers a warning.</span></li>
                            </ul>
                        </div>
                        <button onClick={() => {
                            // Call fullscreen directly from the click handler (user gesture)
                            try {
                                const el = document.documentElement as any;
                                if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
                                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                                else if (el.msRequestFullscreen) el.msRequestFullscreen();
                            } catch (e) { }
                            setExamStarted(true);
                        }} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-sky-400/80 bg-sky-500/20 text-[13px] text-sky-50 hover:bg-sky-500/30 active:scale-[0.97] transition font-semibold tracking-wide shadow-lg">
                            <i className="ph ph-play-circle text-lg"></i> Enter Fullscreen & Start
                        </button>
                        <p className="mt-3 text-center text-[10px] text-slate-500">By clicking Start, you agree to the monitoring rules.</p>
                    </div>
                </div>
            )}

            {/* Main Exam Shell */}
            <div className={`min-h-screen flex items-center justify-center px-2 sm:px-5 py-2 sm:py-4 ${!examStarted || examFinished ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="w-full max-w-6xl max-h-[96vh] sm:max-h-[94vh] rounded-[20px] sm:rounded-[26px] border border-white/15 bg-slate-900/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 border-b border-white/10 bg-slate-950/95">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="hidden sm:flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80"></span>
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80"></span>
                            </div>
                            <div className="h-7 w-px bg-slate-700/70 mx-1 hidden sm:block"></div>
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-slate-950 font-semibold text-sm sm:text-lg flex-shrink-0" style={{ boxShadow: 'var(--shadow-k-neon)' }}>K</div>
                                <div className="leading-tight min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h1 className="truncate max-w-[120px] sm:max-w-xs text-[13px] sm:text-base font-semibold tracking-tight">{testData.title || 'Live Exam'}</h1>
                                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border border-sky-400/60 bg-slate-900/90 text-sky-200 uppercase tracking-[0.16em]">
                                            Track {testData.track_id ? `: ${testData.track_id}` : ''}
                                        </span>
                                    </div>
                                    <p className="hidden sm:block text-[11px] text-slate-400">Secure exam · Autosave · Level based XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <div className="hidden md:flex flex-col items-end text-[10px] leading-tight">
                                <span className="inline-flex items-center gap-1 text-slate-300"><i className="ph ph-shield-check text-xs text-emerald-300"></i> Anti-cheat active</span>
                                <span className={`text-slate-500 ${warningCount > 0 ? (warningCount >= 2 ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold') : ''}`}>Warnings: {warningCount} / {MAX_WARNINGS}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-sky-400/70 bg-sky-500/15 px-2.5 sm:px-3 py-1 sm:py-1.5 min-w-[90px] sm:min-w-[110px]" style={{ boxShadow: 'var(--shadow-k-glow)' }}>
                                <div className="flex flex-col items-end leading-tight w-full">
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-sky-200">Time left</span>
                                    <span className={`text-base sm:text-xl font-semibold tabular-nums ${isTimerPulse ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                                        {timeLeft !== null ? formatTimer(timeLeft) : '--:--'}
                                    </span>
                                </div>
                                <span className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-sky-300/80 flex items-center justify-center flex-shrink-0">
                                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-400 animate-pulse"></span>
                                </span>
                            </div>
                            <button onClick={() => setConfirmMsg({ title: 'Submit Exam?', text: 'Are you sure you want to finish?', onConfirm: () => finalizeSubmit('SUBMITTED') })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-[11px] font-medium border border-rose-400/80 bg-rose-500/20 text-rose-50 hover:bg-rose-500/30 active:scale-[0.97] transition">
                                <i className="ph ph-check-circle text-xs"></i> Submit
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 p-2 sm:p-4 lg:p-5 overflow-hidden">
                        {/* Left */}
                        <section className="w-full lg:w-[65%] flex flex-col gap-3 sm:gap-4 overflow-hidden h-full">
                            <div className="flex-shrink-0 rounded-2xl border border-white/12 bg-slate-950/95 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-3 shadow-lg">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-sky-500/25 to-emerald-400/40 flex items-center justify-center text-sky-100 border border-sky-400/70">
                                        <i className="ph ph-target text-lg"></i>
                                    </div>
                                    <div>
                                        <div className="text-xs sm:text-sm font-medium text-slate-100">Question {currentIndex + 1} of {questions.length}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            <span>{countAnswered()}</span> / <span>{questions.length}</span> answered
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 rounded-2xl border border-white/12 bg-slate-950/95 px-3.5 sm:px-5 py-4 sm:py-5 shadow-xl overflow-y-auto flex flex-col">
                                <div className="flex items-start justify-between gap-2 flex-shrink-0">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-900 border border-slate-700 text-slate-300 uppercase tracking-[0.16em]">
                                            Question {currentIndex + 1}
                                        </div>
                                        <h2 className="mt-2 text-[13px] sm:text-[15px] font-semibold leading-snug text-sky-200">
                                            {currentQ.chapter ? `[${currentQ.chapter}]` : 'Question'}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end text-[10px] text-slate-400 flex-shrink-0">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                                            <i className="ph ph-star text-[11px] text-amber-300"></i>
                                            <span>{currentQ.marks || 1} mark{(currentQ.marks || 1) > 1 ? 's' : ''}</span>
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-3 text-[13px] sm:text-[15px] leading-relaxed text-white flex-shrink-0 font-medium">
                                    {currentQ.question_text}
                                </p>

                                <div className="mt-4 space-y-2.5 pb-2">
                                    {(currentQ.question_type === 'MCQ' || currentQ.question_type === 'TF') && (currentQ.exam_options || []).map(opt => {
                                        const isSelected = existingResp.option_id === opt.id;
                                        return (
                                            <button key={opt.id} onClick={() => handleOptionClick(currentQ.id, opt.id)}
                                                className={`w-full text-left text-[13px] px-3.5 py-3 rounded-xl border transition flex items-start gap-3 group ${isSelected ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100' : 'border-slate-700/80 bg-slate-900/40 hover:bg-slate-800 text-slate-300 hover:text-slate-100 active:scale-[0.98]'}`}>
                                                <div className={`mt-[3px] h-4 w-4 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'border-emerald-400 bg-emerald-500/20' : 'border-slate-500/60'}`}>
                                                    <div className={`h-2 w-2 rounded-full transition-colors ${isSelected ? 'bg-emerald-400' : 'bg-transparent'}`}></div>
                                                </div>
                                                <div className="flex-1">{opt.option_text}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {currentQ.question_type === 'SHORT' && (
                                    <div className="mt-4 pb-2">
                                        <label className="text-[11px] text-slate-400 mb-1 inline-flex items-center gap-1">
                                            <i className="ph ph-pencil-line text-xs"></i> Short answer
                                        </label>
                                        <textarea rows={3}
                                            value={existingResp.short_answer || ''}
                                            onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                                            className="w-full rounded-2xl bg-slate-900/80 border border-slate-700/90 px-3 py-2.5 text-[13px] outline-none focus:border-sky-400/80 text-white placeholder-slate-600"
                                            placeholder="Type your answer here..." />
                                    </div>
                                )}

                                <div className="flex-1"></div>

                                <div className="mt-4 flex-shrink-0 flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                                    <button onClick={() => { if (currentIndex > 0) { setCurrentIndex(c => c - 1); setVisitedSet(v => new Set(v).add(questions[currentIndex - 1].id)); } }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/80 text-[12px] text-slate-200 hover:bg-slate-800 active:scale-[0.97] transition">
                                        <i className="ph ph-arrow-left text-xs"></i> Previous
                                    </button>
                                    <span className="text-[11px] text-slate-400 font-mono">Q {currentIndex + 1}</span>
                                    <button onClick={() => {
                                        if (currentIndex < questions.length - 1) {
                                            setCurrentIndex(c => c + 1);
                                            setVisitedSet(v => new Set(v).add(questions[currentIndex + 1].id));
                                        } else {
                                            setConfirmMsg({ title: 'Submit Exam?', text: 'Are you sure you want to finish?', onConfirm: () => finalizeSubmit('SUBMITTED') });
                                        }
                                    }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sky-400/80 bg-sky-500/20 text-[12px] text-sky-50 hover:bg-sky-500/30 active:scale-[0.97] transition">
                                        <span>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
                                        <i className={`ph ${currentIndex === questions.length - 1 ? 'ph-check' : 'ph-arrow-right'} text-xs`}></i>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Right: Palette */}
                        <aside className="hidden lg:flex w-full lg:w-[35%] flex-col gap-3 sm:gap-4 overflow-hidden h-full">
                            <div className="rounded-2xl border border-white/12 bg-slate-950/95 px-3.5 sm:px-4 py-3.5 flex flex-col shadow-lg flex-1 min-h-0 overflow-hidden">
                                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <i className="ph ph-squares-four text-lg text-sky-300"></i>
                                        <h3 className="text-sm font-semibold tracking-tight">Question palette</h3>
                                    </div>
                                </div>
                                <div className="overflow-y-auto flex-1 pr-1 custom-scroll">
                                    <div className="mt-1 grid grid-cols-5 xl:grid-cols-6 gap-1.5 text-[11px]">
                                        {questions.map((q, idx) => (
                                            <button key={q.id} onClick={() => { setCurrentIndex(idx); setVisitedSet(v => new Set(v).add(q.id)); }}
                                                className={`h-9 w-9 lg:h-7 lg:w-7 rounded-lg flex items-center justify-center text-xs border transition font-medium ${getPaletteClass(q.id, idx)}`}>
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-3 flex-shrink-0 grid grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                                    <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-md bg-emerald-500/80"></span><span>Answered</span></div>
                                    <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-md bg-amber-400/80"></span><span>Visited</span></div>
                                    <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-md bg-sky-500/80"></span><span>Current</span></div>
                                    <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-md bg-slate-700"></span><span>Not visited</span></div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 rounded-2xl border border-white/12 bg-slate-950/95 px-3.5 sm:px-4 py-3.5 flex flex-col gap-3 shadow-lg text-[11px]">
                                <div className="flex items-center gap-2">
                                    <i className="ph ph-shield-warning text-lg text-emerald-300"></i>
                                    <p className="text-slate-300 leading-snug"><strong>Anti-cheat enabled:</strong> Copy, Paste, Tab Switch, and Fullscreen exit are monitored.</p>
                                </div>
                                <button onClick={() => {
                                    setConfirmMsg({ title: 'Exit Exam?', text: 'Timer continues if you leave.', onConfirm: () => router.push('/dashboard') });
                                }} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-200 active:scale-[0.97] transition">
                                    <i className="ph ph-arrow-bend-up-left text-xs"></i> Back to Dashboard
                                </button>
                            </div>
                        </aside>
                    </main>
                </div>
            </div>

            {/* Mobile floating trigger */}
            {examStarted && !examFinished && (
                <div onClick={() => setMobileDrawerOpen(true)}
                    className="lg:hidden fixed top-1/2 -translate-y-1/2 right-0 z-40 h-16 w-8 bg-white/10 backdrop-blur-md border border-white/20 border-r-0 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-300 cursor-pointer group rounded-l-[50px] rounded-br-none" style={{ animation: 'var(--animate-drop-pulse)' }} title="Open Palette">
                    <i className="ph ph-caret-left text-xl text-white group-hover:text-sky-300 ml-1"></i>
                </div>
            )}

            {/* Custom keyframes for warning center progress bar shrink */}
            <style jsx global>{`
                @keyframes shrinkX {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
                @keyframes fadeInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-fade-in-right {
                    animation: fadeInRight 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
