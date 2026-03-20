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

function isOptionCorrect(val: any): boolean {
    if (val === true || val === 1) return true;
    if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === '1';
    }
    return false;
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
    const [resultData, setResultData] = useState<{ score: number, total: number, accuracy: number, pointsEarned: number, statusType: string, correctCount: number, wrongCount: number, skippedCount: number } | null>(null);

    const shortInputRef = useRef<HTMLTextAreaElement>(null);

    // --------------------------------------------------
    // INIT LOAD
    // --------------------------------------------------
    useEffect(() => {
        if (!user || user.uid === undefined) return;

        const init = async () => {
            try {
                // 1. Load Test + Questions in parallel
                const [docSnap, qSnap] = await Promise.all([
                    getDoc(doc(db, 'exam_tests', testId)),
                    getDocs(query(collection(db, 'exam_questions'), where('test_id', '==', testId)))
                ]);
                if (!docSnap.exists()) {
                    setLoading(false);
                    return;
                }
                const tData = { id: docSnap.id, ...docSnap.data() } as TestData;
                setTestData(tData);

                // 2. Load ALL options for ALL questions in ONE query
                const questionIds = qSnap.docs.map(d => d.id);
                let allOptions: Option[] = [];
                if (questionIds.length > 0) {
                    const batches: string[][] = [];
                    for (let i = 0; i < questionIds.length; i += 30) {
                        batches.push(questionIds.slice(i, i + 30));
                    }
                    const optResults = await Promise.all(
                        batches.map(batch => getDocs(query(collection(db, 'exam_options'), where('question_id', 'in', batch))))
                    );
                    optResults.forEach(snap => {
                        snap.docs.forEach(o => allOptions.push({ id: o.id, ...o.data() } as Option));
                    });
                }

                // 3. Map options to questions
                const optionsByQuestion: Record<string, Option[]> = {};
                allOptions.forEach(o => {
                    const qid = (o as any).question_id;
                    if (!optionsByQuestion[qid]) optionsByQuestion[qid] = [];
                    optionsByQuestion[qid].push(o);
                });

                const loadedQ: QuestionData[] = qSnap.docs.map(d => {
                    const quest = { id: d.id, ...d.data() } as QuestionData;
                    quest.exam_options = shuffleArray(optionsByQuestion[quest.id] || []);
                    return quest;
                });
                setQuestions(shuffleArray(loadedQ));

                // Set timer from test data (attempt is created on Start click)
                const duration = Math.max(1, tData.duration_minutes || 60);
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
            const sortedOptions = [...(q.exam_options || [])].sort((a, b) => a.id > b.id ? 1 : -1);
            const correctOptions = sortedOptions.filter(o => isOptionCorrect(o.is_correct));
            const correctOpt = correctOptions[correctOptions.length - 1];

            if (correctOpt && correctOpt.id === resp.option_id) {
                score++;
                correctCount++;
            }
        });

        const totalQ = questions.length || 1;
        const accuracy = Math.round((correctCount / totalQ) * 100);
        // Points per question = Total Points (xp_reward) / Total Questions
        const totalPoints = testData.xp_reward || totalQ;
        const pointsPerQ = totalPoints / totalQ;
        const pointsEarned = Math.round(correctCount * pointsPerQ);

        await updateDoc(doc(db, 'exam_attempts', attempt.id), {
            status: type,
            submitted_at: new Date().toISOString(),
            score,
            accuracy,
            points_earned: pointsEarned,
            xp_earned: pointsEarned,
        });

        // Award points ONLY on first attempt for this test
        if (pointsEarned > 0 && user) {
            const priorQ = query(
                collection(db, 'exam_attempts'),
                where('user_id', '==', user.uid),
                where('test_id', '==', testData.id),
                where('status', 'in', ['SUBMITTED', 'AUTO_SUBMITTED'])
            );
            const priorSnap = await getDocs(priorQ);
            const isFirstAttempt = priorSnap.docs.filter(d => d.id !== attempt.id).length === 0;

            if (isFirstAttempt) {
                const qState = query(collection(db, 'exam_user_state'), where('user_id', '==', user.uid));
                const stateSnap = await getDocs(qState);
                if (!stateSnap.empty) {
                    const stDoc = stateSnap.docs[0];
                    const currentData = stDoc.data();
                    // Read existing points from either field (whichever has the value)
                    const currentTotal = currentData.total_points || currentData.total_xp || 0;
                    const newTotal = currentTotal + pointsEarned;
                    // Sync BOTH fields so no points are ever lost
                    await updateDoc(stDoc.ref, {
                        total_points: newTotal,
                        total_xp: newTotal
                    });
                }
            }
        }

        if (isFullscreenAny()) {
            try { await exitFullscreenAny(); } catch (e) { }
        }

        const answeredCount = Object.values(responsesMap).filter(r => r && r.option_id).length;
        const wrongCount = answeredCount - correctCount;
        const skippedCount = totalQ - answeredCount;

        setResultData({ score, total: totalQ, accuracy, pointsEarned, statusType: type, correctCount, wrongCount, skippedCount });
    };

    // --------------------------------------------------
    // RENDER HELPERS
    // --------------------------------------------------
    if (loading) {
        return <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}><div className="animate-spin h-8 w-8 rounded-full border-3 border-indigo-200 border-t-indigo-500 mb-3"></div><span className="text-sm font-medium" style={{ color: '#6366f1' }}>Loading exam...</span></div>;
    }

    if (!testData || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
                <div className="max-w-md w-full text-center space-y-4 rounded-3xl p-8" style={{ background: '#ffffff', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                    <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-2" style={{ background: '#fef2f2', border: '2px solid #fecaca' }}><span className="text-2xl">❌</span></div>
                    <h1 className="text-xl font-black" style={{ color: '#0f172a' }}>Exam Invalid</h1>
                    <p className="text-sm font-medium" style={{ color: '#64748b' }}>This exam could not be loaded or has no questions.</p>
                    <button onClick={() => router.push('/dashboard')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const existingResp = responsesMap[currentQ.id] || {};

    const getPaletteClass = (qId: string, idx: number) => {
        if (idx === currentIndex) return "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-200";
        const ans = responsesMap[qId];
        if (ans && (ans.option_id || (ans.short_answer && ans.short_answer.trim() !== ''))) {
            return "bg-emerald-500 border-emerald-400 text-white";
        }
        if (visitedSet.has(qId)) {
            return "bg-amber-400 border-amber-300 text-white";
        }
        return "bg-gray-100 border-gray-200 text-gray-500";
    };

    const isTimerPulse = timeLeft !== null && timeLeft < 60 && !examFinished;

    // Click to re-enter fullscreen when user clicks anywhere
    const handleContainerClick = () => {
        if (examStarted && !examFinished && !isFullscreenAny()) {
            try {
                const el = document.documentElement as any;
                if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
            } catch (e) { }
        }
    };

    // Create attempt when user clicks Start (deferred from init for faster load)
    const createAttemptAndStart = async () => {
        if (!user || !testData) return;
        try {
            const attRef = await addDoc(collection(db, 'exam_attempts'), {
                user_id: user.uid,
                test_id: testId,
                started_at: new Date().toISOString(),
                status: 'IN_PROGRESS',
                created_at: serverTimestamp()
            });
            setAttempt({ id: attRef.id });
        } catch (e) { console.error('Attempt create error:', e); }
        try {
            const el = document.documentElement as any;
            if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        } catch (e) { }
        setExamStarted(true);
    };

    return (
        <div className="min-h-screen overflow-x-hidden" data-exam-page="true" style={{ background: '#f0f2f5' }} onClick={handleContainerClick}>

            {/* Warning Overlay */}
            {warningMsg && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => { e.stopPropagation(); try { if (!isFullscreenAny()) { const el = document.documentElement as any; if (el.requestFullscreen) el.requestFullscreen().catch(() => { }); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); } } catch (e) { } setWarningMsg(null); }}>
                    <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                        <div className="p-5 text-center" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderBottom: '1px solid #fecaca' }}>
                            <div className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: '#fee2e2', border: '2px solid #fca5a5' }}>
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: '#dc2626' }}>Security Breach</h3>
                            <p className="text-base font-bold mt-1" style={{ color: '#0f172a' }}>{warningMsg.title}</p>
                            <p className="text-xs mt-1" style={{ color: '#991b1b' }}>{warningMsg.desc}</p>
                        </div>
                        <div className="p-4">
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#fee2e2' }}>
                                <div className="h-full rounded-full animate-[shrinkX_5s_linear_forwards] origin-left" style={{ background: '#ef4444' }}></div>
                            </div>
                            <p className="mt-2 text-center text-[10px] font-bold" style={{ color: '#ef4444' }}>Warning {warningCount} of {MAX_WARNINGS}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Overlay */}
            {confirmMsg && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={e => e.stopPropagation()}>
                    <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
                        <div className="p-6 text-center">
                            <div className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: '#eef2ff', border: '2px solid #c7d2fe' }}>
                                <span className="text-2xl">❓</span>
                            </div>
                            <h3 className="text-base font-bold" style={{ color: '#0f172a' }}>{confirmMsg.title}</h3>
                            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{confirmMsg.text}</p>
                        </div>
                        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setConfirmMsg(null)} className="py-2.5 rounded-xl text-xs font-bold transition hover:bg-gray-100" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>Cancel</button>
                            <button onClick={() => { confirmMsg.onConfirm(); setConfirmMsg(null); }} className="py-2.5 rounded-xl text-xs font-bold text-white transition hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>Yes, Proceed</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Drawer */}
            {mobileDrawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" onClick={e => e.stopPropagation()}>
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setMobileDrawerOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] flex flex-col shadow-2xl animate-fade-in-right" style={{ background: '#ffffff', borderLeft: '1px solid #e2e8f0' }}>
                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>📋 Palette & Info</h2>
                            <button onClick={() => setMobileDrawerOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: '#f1f5f9', color: '#64748b' }}>✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-5">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: '#94a3b8' }}>Questions</span>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((q, idx) => (
                                        <button key={q.id} onClick={() => { setCurrentIndex(idx); setVisitedSet(v => new Set(v).add(q.id)); setMobileDrawerOpen(false); }}
                                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs border transition font-bold ${getPaletteClass(q.id, idx)}`}>
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl p-3 space-y-1.5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className="flex items-center gap-2 text-[10px] font-medium" style={{ color: '#64748b' }}><span className="h-3 w-3 rounded-md bg-emerald-500"></span>Answered</div>
                                <div className="flex items-center gap-2 text-[10px] font-medium" style={{ color: '#64748b' }}><span className="h-3 w-3 rounded-md bg-amber-400"></span>Visited</div>
                                <div className="flex items-center gap-2 text-[10px] font-medium" style={{ color: '#64748b' }}><span className="h-3 w-3 rounded-md bg-indigo-500"></span>Current</div>
                                <div className="flex items-center gap-2 text-[10px] font-medium" style={{ color: '#64748b' }}><span className="h-3 w-3 rounded-md" style={{ background: '#e2e8f0' }}></span>Not Visited</div>
                            </div>
                            <div className="rounded-xl p-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold" style={{ color: '#dc2626' }}>⚠️ Warnings</span>
                                    <span className="text-sm font-black" style={{ color: '#dc2626' }}>{warningCount}/{MAX_WARNINGS}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#fee2e2' }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${(warningCount / MAX_WARNINGS) * 100}%`, background: '#ef4444' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <button onClick={() => { setConfirmMsg({ title: 'Exit Exam?', text: 'Timer continues if you leave.', onConfirm: () => router.push('/dashboard') }); }}
                                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Overlay */}
            {resultData && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)' }} onClick={e => e.stopPropagation()}>
                    <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: resultData.accuracy >= 70 ? 'linear-gradient(135deg, #10b981, #34d399)' : resultData.accuracy >= 40 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #ef4444, #f87171)', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
                                    {resultData.accuracy >= 70 ? '🏆' : resultData.accuracy >= 40 ? '📊' : '💪'}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black" style={{ color: '#0f172a' }}>{resultData.statusType === 'AUTO_SUBMITTED' ? 'Auto-Submitted' : 'Exam Submitted'}</h2>
                                    <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                                        {resultData.accuracy >= 70 ? '🎉 Excellent Performance!' : resultData.accuracy >= 40 ? '👍 Good Effort!' : '📈 Keep Practicing!'}
                                    </p>
                                </div>
                            </div>
                            {resultData.statusType === 'AUTO_SUBMITTED' && (
                                <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                                    ⚠️ Auto-submitted: Time expired or warnings limit
                                </div>
                            )}

                            <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe' }}>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#6366f1' }}>🪙 Points</div>
                                        <div className="text-xl font-black" style={{ color: '#4338ca' }}>+{resultData.pointsEarned}</div>
                                        <div className="text-[9px] font-medium" style={{ color: '#818cf8' }}>of {testData?.xp_reward || resultData.total}</div>
                                    </div>
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: resultData.accuracy >= 70 ? '#059669' : resultData.accuracy >= 40 ? '#d97706' : '#dc2626' }}>📊 Accuracy</div>
                                        <div className="text-xl font-black" style={{ color: resultData.accuracy >= 70 ? '#047857' : resultData.accuracy >= 40 ? '#b45309' : '#b91c1c' }}>{resultData.accuracy}%</div>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1.5 px-1">
                                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>Question Breakdown</span>
                                        <span className="text-[9px] font-bold" style={{ color: '#6366f1' }}>{resultData.correctCount}/{resultData.total} Correct</span>
                                    </div>
                                    <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.5)' }}>
                                        {resultData.correctCount > 0 && <div className="h-full transition-all" style={{ width: `${(resultData.correctCount / resultData.total) * 100}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />}
                                        {resultData.wrongCount > 0 && <div className="h-full transition-all" style={{ width: `${(resultData.wrongCount / resultData.total) * 100}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)' }} />}
                                        {resultData.skippedCount > 0 && <div className="h-full transition-all" style={{ width: `${(resultData.skippedCount / resultData.total) * 100}%`, background: '#cbd5e1' }} />}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center rounded-xl p-2.5" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                    <div className="text-sm mb-0.5">✅</div>
                                    <div className="text-lg font-black" style={{ color: '#059669' }}>{resultData.correctCount}</div>
                                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#10b981' }}>Correct</div>
                                </div>
                                <div className="text-center rounded-xl p-2.5" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                    <div className="text-sm mb-0.5">❌</div>
                                    <div className="text-lg font-black" style={{ color: '#dc2626' }}>{resultData.wrongCount}</div>
                                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>Wrong</div>
                                </div>
                                <div className="text-center rounded-xl p-2.5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <div className="text-sm mb-0.5">⏭️</div>
                                    <div className="text-lg font-black" style={{ color: '#64748b' }}>{resultData.skippedCount}</div>
                                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Skipped</div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <button onClick={() => router.push(`/review/${attempt?.id || ''}`)} className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 mb-3 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 8px 25px rgba(109,40,217,0.4)' }}>
                                📋 Full Analysis
                            </button>
                            <button onClick={() => router.push('/dashboard')} className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition hover:bg-gray-100" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Overlay */}
            {!examStarted && !examFinished && (
                <div className="fixed inset-0 z-30 flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)' }} onClick={e => e.stopPropagation()}>
                    <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>K</div>
                                <div>
                                    <h2 className="text-lg font-black" style={{ color: '#0f172a' }}>Secure Exam Mode</h2>
                                    <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Anti-cheat protocols are active</p>
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe' }}>
                                <h3 className="text-sm font-bold mb-2" style={{ color: '#3730a3' }}>{testData?.title || 'Exam'}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-base font-black" style={{ color: '#6366f1' }}>{testData?.duration_minutes || 30}</div>
                                        <div className="text-[9px] font-bold uppercase" style={{ color: '#94a3b8' }}>Minutes</div>
                                    </div>
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-base font-black" style={{ color: '#10b981' }}>{questions.length}</div>
                                        <div className="text-[9px] font-bold uppercase" style={{ color: '#94a3b8' }}>Questions</div>
                                    </div>
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-base font-black" style={{ color: '#f59e0b' }}>{testData?.xp_reward || questions.length}</div>
                                        <div className="text-[9px] font-bold uppercase" style={{ color: '#94a3b8' }}>Total Points</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-4">
                            <div className="rounded-xl p-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#dc2626' }}>⚠️ Exam Rules</p>
                                <ul className="space-y-1.5">
                                    {['Right click & Copy/Paste are **disabled**', 'Exiting fullscreen triggers a **warning**', 'Switching tabs triggers a **warning**', '**3 warnings** = auto-submit'].map((r, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[11px] font-medium" style={{ color: '#991b1b' }}>
                                            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }}></span>
                                            <span dangerouslySetInnerHTML={{ __html: r.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <button onClick={createAttemptAndStart} className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 8px 25px rgba(109,40,217,0.4)' }}>
                                ▶ Enter Fullscreen & Start Exam
                            </button>
                            <p className="mt-3 text-center text-[10px] font-medium" style={{ color: '#94a3b8' }}>By clicking Start, you agree to the monitoring rules.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MAIN EXAM SHELL — FUTURISTIC FULLSCREEN ═══ */}
            <div className={`fixed inset-0 flex flex-col ${!examStarted || examFinished ? 'blur-sm pointer-events-none' : ''}`} style={{ background: '#f0f2f7' }}>

                {/* ── Header ── */}
                <header className="exam-header flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3730a3, #6d28d9, #7c3aed)', boxShadow: '0 4px 20px rgba(109,40,217,0.45)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 0 14px rgba(139,92,246,0.35)' }}>K</div>
                        <div className="min-w-0">
                            <h1 className="truncate max-w-[160px] sm:max-w-sm text-[14px] sm:text-lg font-black tracking-wide" style={{ color: '#ffffff' }}>{testData.title || 'Exam'}</h1>
                            <p className="hidden sm:block text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>🔒 Secure Exam</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {/* Warnings */}
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]" style={{ background: warningCount > 0 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                            <span style={{ color: '#ffffff' }}>🛡️</span>
                            <span className="font-bold" style={{ color: '#ffffff' }}>{warningCount}/{MAX_WARNINGS}</span>
                        </div>
                        {/* Timer — PREMIUM */}
                        <div className="flex items-center gap-3 rounded-2xl px-4 sm:px-5 py-2" style={{ background: isTimerPulse ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.2)', border: isTimerPulse ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.15)', boxShadow: isTimerPulse ? '0 0 20px rgba(239,68,68,0.25)' : '0 0 12px rgba(0,0,0,0.15)' }}>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] uppercase tracking-[0.2em] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>TIME</span>
                                <span className={`text-xl sm:text-2xl font-black tabular-nums tracking-wider`} style={{ color: isTimerPulse ? '#fca5a5' : '#ffffff', textShadow: isTimerPulse ? '0 0 12px rgba(239,68,68,0.5)' : '0 0 8px rgba(255,255,255,0.2)' }}>
                                    {timeLeft !== null ? formatTimer(timeLeft) : '--:--'}
                                </span>
                            </div>
                            <div className="relative flex-shrink-0">
                                <span className="block h-3 w-3 rounded-full animate-pulse" style={{ background: isTimerPulse ? '#ef4444' : '#4ade80', boxShadow: `0 0 10px ${isTimerPulse ? '#ef4444' : '#4ade80'}` }}></span>
                                <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: isTimerPulse ? '#ef4444' : '#4ade80' }}></span>
                            </div>
                        </div>
                        {/* Submit — RED */}
                        <button onClick={() => setConfirmMsg({ title: 'Submit Exam?', text: 'Are you sure you want to finish?', onConfirm: () => finalizeSubmit('SUBMITTED') })}
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}>
                            ✓ Submit
                        </button>
                    </div>
                </header>

                {/* ── Content Area — NO TOP TRACKER ── */}
                <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
                    {/* Left: Question — ENLARGED */}
                    <section className="w-full lg:w-[75%] flex flex-col overflow-hidden h-full" style={{ background: '#f8fafc' }}>
                        {/* Question Header */}
                        <div className="flex-shrink-0 px-5 sm:px-8 py-3.5 flex items-center justify-between" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 2px 10px rgba(109,40,217,0.3)' }}>
                                    <span className="text-base font-black text-white">{currentIndex + 1}</span>
                                </div>
                                <div>
                                    <div className="text-base font-bold" style={{ color: '#0f172a' }}>Question {currentIndex + 1} <span className="font-medium" style={{ color: '#94a3b8' }}>/ {questions.length}</span></div>
                                    <div className="text-[11px] font-semibold" style={{ color: '#10b981' }}>✓ {countAnswered()} answered</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                                    ⭐ {testData ? Math.round((testData.xp_reward || questions.length) / (questions.length || 1)) : 1} pts
                                </span>
                            </div>
                        </div>

                        {/* Question Card — LARGER */}
                        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6">
                            <div className="max-w-4xl mx-auto">
                                {currentQ.chapter && (
                                    <p className="text-[12px] font-bold mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 2px 8px rgba(109,40,217,0.25)' }}>📚 {currentQ.chapter}</p>
                                )}
                                <p className="text-[17px] sm:text-[18px] leading-relaxed font-semibold" style={{ color: '#0f172a' }}>
                                    {currentQ.question_text}
                                </p>

                                <div className="mt-6 space-y-3">
                                    {(currentQ.question_type === 'MCQ' || currentQ.question_type === 'TF') && (currentQ.exam_options || []).map((opt, oi) => {
                                        const isSelected = existingResp.option_id === opt.id;
                                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                                        return (
                                            <button key={opt.id} onClick={() => handleOptionClick(currentQ.id, opt.id)}
                                                className="w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 flex items-start gap-4 group active:scale-[0.99]"
                                                style={isSelected
                                                    ? { background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', border: '2px solid #7c3aed', color: '#ffffff', boxShadow: '0 4px 20px rgba(109,40,217,0.3)' }
                                                    : { background: '#ffffff', border: '1.5px solid #e2e8f0', color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                                <div className="mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center text-[13px] font-black flex-shrink-0 transition-all"
                                                    style={isSelected ? { background: 'rgba(255,255,255,0.25)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)' } : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                                                    {letters[oi] || oi + 1}
                                                </div>
                                                <div className="flex-1 pt-1.5 text-[14px] sm:text-[15px] font-medium">{opt.option_text}</div>
                                                {isSelected && <span className="mt-1.5 text-xl text-white">✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                                {currentQ.question_type === 'SHORT' && (
                                    <div className="mt-6">
                                        <label className="text-[12px] font-bold mb-2 block" style={{ color: '#64748b' }}>✏️ Your Answer</label>
                                        <textarea rows={4}
                                            value={existingResp.short_answer || ''}
                                            onChange={(e) => handleShortAnswerChange(currentQ.id, e.target.value)}
                                            className="w-full rounded-2xl px-5 py-4 text-[15px] outline-none transition focus:ring-2 focus:ring-purple-400"
                                            style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                                            placeholder="Type your answer here..." />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex-shrink-0 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-3" style={{ background: 'linear-gradient(180deg, #ffffff, #f8fafc)', borderTop: '1px solid #e2e8f0' }}>
                            <button onClick={() => { if (currentIndex > 0) { setCurrentIndex(c => c - 1); setVisitedSet(v => new Set(v).add(questions[currentIndex - 1].id)); } }}
                                disabled={currentIndex === 0}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold transition-all hover:bg-gray-50 active:scale-[0.97] disabled:opacity-30" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                ← Previous
                            </button>
                            <div className="flex items-center gap-2 text-[12px] font-bold" style={{ color: '#94a3b8' }}>
                                <span>Q {currentIndex + 1} / {questions.length}</span>
                                <span className="h-1 w-1 rounded-full" style={{ background: '#cbd5e1' }}></span>
                                <span style={{ color: '#10b981' }}>{countAnswered()} done</span>
                            </div>
                            <button onClick={() => {
                                if (currentIndex < questions.length - 1) {
                                    setCurrentIndex(c => c + 1);
                                    setVisitedSet(v => new Set(v).add(questions[currentIndex + 1].id));
                                } else {
                                    setConfirmMsg({ title: 'Submit Exam?', text: 'Are you sure you want to finish?', onConfirm: () => finalizeSubmit('SUBMITTED') });
                                }
                            }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.97]" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 4px 18px rgba(109,40,217,0.35)' }}>
                                {currentIndex === questions.length - 1 ? 'Finish ✓' : 'Next →'}
                            </button>
                        </div>
                    </section>

                    {/* Right: Palette Sidebar — COMPACT */}
                    <aside className="hidden lg:flex w-full lg:w-[25%] flex-col overflow-hidden h-full" style={{ background: '#ffffff', borderLeft: '1px solid #e2e8f0' }}>
                        {/* Palette Header */}
                        <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', borderBottom: 'none' }}>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">📋</span>
                                <h3 className="text-sm font-bold text-white">Question Palette</h3>
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>{countAnswered()}/{questions.length}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="flex-shrink-0 px-4 py-2" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                <span style={{ color: '#6d28d9' }}>Progress</span>
                                <span style={{ color: '#0f172a' }}>{questions.length > 0 ? Math.round((countAnswered() / questions.length) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${questions.length > 0 ? (countAnswered() / questions.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #6d28d9, #7c3aed)', boxShadow: '0 0 8px rgba(109,40,217,0.4)' }}></div>
                            </div>
                        </div>
                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="grid grid-cols-5 xl:grid-cols-6 gap-1.5">
                                {questions.map((q, idx) => (
                                    <button key={q.id} onClick={() => { setCurrentIndex(idx); setVisitedSet(v => new Set(v).add(q.id)); }}
                                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-[11px] border-2 transition-all font-bold hover:scale-110 ${getPaletteClass(q.id, idx)}`}>
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex-shrink-0 px-4 py-2.5" style={{ borderTop: '1px solid #e2e8f0' }}>
                            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                                <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#64748b' }}><span className="h-2.5 w-2.5 rounded" style={{ background: '#10b981' }}></span>Answered</div>
                                <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#64748b' }}><span className="h-2.5 w-2.5 rounded" style={{ background: '#fbbf24' }}></span>Visited</div>
                                <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#64748b' }}><span className="h-2.5 w-2.5 rounded" style={{ background: '#6d28d9' }}></span>Current</div>
                                <div className="flex items-center gap-1.5 font-semibold" style={{ color: '#64748b' }}><span className="h-2.5 w-2.5 rounded" style={{ background: '#e2e8f0' }}></span>Unanswered</div>
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex-shrink-0 px-4 py-3 flex flex-col gap-2" style={{ borderTop: '1px solid #e2e8f0' }}>
                            <div className="text-[10px] font-medium flex items-center gap-1.5" style={{ color: '#64748b' }}>
                                <span>🛡️</span><strong style={{ color: '#0f172a' }}>Anti-cheat:</strong> Tab, Copy, Fullscreen
                            </div>
                            <button onClick={() => setConfirmMsg({ title: 'Submit Exam?', text: 'Are you sure you want to finish?', onConfirm: () => finalizeSubmit('SUBMITTED') })}
                                className="w-full py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#ffffff', boxShadow: '0 2px 10px rgba(220,38,38,0.35)' }}>
                                ✓ Submit Exam
                            </button>
                            <button onClick={() => { setConfirmMsg({ title: 'Exit Exam?', text: 'Timer continues if you leave.', onConfirm: () => router.push('/dashboard') }); }}
                                className="w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition hover:bg-gray-50" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                ← Dashboard
                            </button>
                        </div>
                    </aside>
                </main>
            </div>

            {/* Mobile floating trigger */}
            {examStarted && !examFinished && (
                <div onClick={(e) => { e.stopPropagation(); setMobileDrawerOpen(true); }}
                    className="lg:hidden fixed top-1/2 -translate-y-1/2 right-0 z-40 h-20 w-9 flex items-center justify-center cursor-pointer rounded-l-2xl" style={{ background: 'linear-gradient(180deg, #6d28d9, #7c3aed)', boxShadow: '0 0 20px rgba(109,40,217,0.4)' }} title="Open Palette">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-white text-xs font-bold">◀</span>
                        <span className="text-white text-[8px] font-bold">{countAnswered()}/{questions.length}</span>
                    </div>
                </div>
            )}

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
                /* ═══ CSS ISOLATION — MAXIMUM SPECIFICITY to override globals.css ═══ */
                /* Double attribute selector [x][x] gives higher specificity than any single class rule */
                [data-exam-page][data-exam-page] .exam-header,
                [data-exam-page][data-exam-page] .exam-header * {
                    color: #ffffff !important;
                }
                [data-exam-page][data-exam-page] .exam-header h1 {
                    color: #ffffff !important;
                }
                [data-exam-page][data-exam-page] .exam-header p {
                    color: rgba(255,255,255,0.7) !important;
                }
                /* Sidebar palette header (purple bg) */
                [data-exam-page][data-exam-page] aside > div:first-child,
                [data-exam-page][data-exam-page] aside > div:first-child * {
                    color: #ffffff !important;
                }
                /* All text-white classes */
                [data-exam-page][data-exam-page] .text-white {
                    color: #ffffff !important;
                }
                /* Textarea inside exam page */
                [data-exam-page][data-exam-page] textarea {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    border: 1.5px solid #e2e8f0 !important;
                }
                [data-exam-page][data-exam-page] textarea::placeholder {
                    color: #94a3b8 !important;
                }
            `}</style>
        </div>
    );
}
