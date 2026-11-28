'use client';

import { useState, useEffect, useEffectEvent, useMemo, use, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
    collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
    query, where, serverTimestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

import ExamWorkspace from '@/components/exam/ExamWorkspace';
import { htmlOptionHindi } from '@/lib/html-test-option-language';
import { createExamAnswerSync } from '@/lib/exam-answer-sync';
import { startExamCountdown } from '@/lib/exam-countdown';
import type { ExamSaveStatus } from '@/lib/exam-presentation';
import QuestionBookmark from '@/components/learning/QuestionBookmark';
import { practiceResume } from '@/lib/practice-resume';

// --- Types ---
interface TestData {
    id: string;
    title: string;
    duration_minutes: number;
    xp_reward: number;
    mode?:string;
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
type FullscreenElement = HTMLElement & {webkitRequestFullscreen?:()=>Promise<void>;mozRequestFullScreen?:()=>Promise<void>;msRequestFullscreen?:()=>Promise<void>};
type FullscreenDocument = Document & {webkitExitFullscreen?:()=>Promise<void>;mozCancelFullScreen?:()=>Promise<void>;msExitFullscreen?:()=>Promise<void>;webkitFullscreenElement?:Element;mozFullScreenElement?:Element;msFullscreenElement?:Element};
type ResponsesMap = Record<string, { option_id: string | null; short_answer: string | null }>;

// --- Helpers ---
function requestFullscreenAny() {
    const el = document.documentElement as FullscreenElement;
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
    const doc = document as FullscreenDocument;
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
    const doc = document as FullscreenDocument;
    return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function isOptionCorrect(val: unknown): boolean {
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


    const [loading, setLoading] = useState(true);
    const [testData, setTestData] = useState<TestData | null>(null);
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [attempt, setAttempt] = useState<AttemptData | null>(null);

    const [examStarted, setExamStarted] = useState(false);
    const [examFinished, setExamFinished] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responsesMap, setResponsesMap] = useState<ResponsesMap>({});
    const responsesRef = useRef<ResponsesMap>({});
    const writerRef = useRef<{id:string;sync:ReturnType<typeof createExamAnswerSync>}|null>(null);
    const submittingRef = useRef(false),finishedRef = useRef(false);
    const [submitting,setSubmitting] = useState(false);
    const [saveStatus,setSaveStatus] = useState<ExamSaveStatus>('saved');
    const [saveError,setSaveError] = useState(''),[submitError,setSubmitError] = useState('');
    useEffect(()=>{responsesRef.current=responsesMap;},[responsesMap]);
    useEffect(()=>()=>{writerRef.current?.sync.dispose();},[]);
    const workspaceQuestions=useMemo(()=>questions.map(question=>({...question,
        marks:question.marks??Math.round(Number(testData?.xp_reward||questions.length)/(questions.length||1)),
        exam_options:(question.exam_options||[]).map(option=>{const hindi=htmlOptionHindi(testId,option.option_text);return {...option,option_text:hindi?option.option_text+' | '+hindi:option.option_text};}),
    })),[questions,testId,testData?.xp_reward]);
    const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [resumeAttempt, setResumeAttempt] = useState<{ id: string; deadline: number } | null>(null);
    const [startError, setStartError] = useState('');
    const deadlineRef = useRef<number | null>(null);
    const startingRef = useRef(false);

    // Anti cheat
    const [warningCount, setWarningCount] = useState(0);
    const MAX_WARNINGS = 3;
    const warningCountRef = useRef(0);
    const [warningMsg, setWarningMsg] = useState<{ title: string, desc: string } | null>(null);

    // Dialogs

    // UI State
    const [resultData, setResultData] = useState<{ score: number, total: number, accuracy: number, pointsEarned: number, statusType: string, correctCount: number, wrongCount: number, skippedCount: number } | null>(null);


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
                const allOptions: Option[] = [];
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
                    const qid = (o as Option & {question_id:string}).question_id;
                    if (!optionsByQuestion[qid]) optionsByQuestion[qid] = [];
                    optionsByQuestion[qid].push(o);
                });

                const loadedQ: QuestionData[] = qSnap.docs.map(d => {
                    const quest = { id: d.id, ...d.data() } as QuestionData;
                    quest.exam_options = shuffleArray(optionsByQuestion[quest.id] || []);
                    return quest;
                });
                let orderedQuestions = shuffleArray(loadedQ);
                const resumeId = new URLSearchParams(window.location.search).get('resume');
                if (resumeId) {
                    const savedAttempt = await getDoc(doc(db, 'exam_attempts', resumeId));
                    const plan = savedAttempt.exists() ? practiceResume(savedAttempt.data(), user.uid, { id: testId, mode: tData.mode, duration_minutes: tData.duration_minutes }) : null;
                    if (!plan) { setStartError('This practice cannot be resumed. It may have expired or already been submitted.'); setQuestions(orderedQuestions); return; }
                    const savedAnswers = await getDocs(query(collection(db, 'exam_responses'), where('attempt_id', '==', resumeId)));
                    const restored: ResponsesMap = {};
                    savedAnswers.forEach(answer => {
                        const value = answer.data(), question = loadedQ.find(q => q.id === value.question_id);
                        if (question && (question.exam_options?.some(option => option.id === value.option_id) || question.question_type === 'SHORT'))
                            restored[question.id] = { option_id: value.option_id || null, short_answer: value.short_answer || null };
                    });
                    if (plan.order.length) {
                        const positions = new Map(plan.order.map((id, i) => [id, i]));
                        orderedQuestions = [...loadedQ].sort((a, b) => (positions.get(a.id) ?? 99999) - (positions.get(b.id) ?? 99999));
                    }
                    setResponsesMap(restored);
                    setCurrentIndex(Math.max(0, orderedQuestions.findIndex(q => !restored[q.id])));
                    setResumeAttempt({ id: resumeId, deadline: plan.deadline });
                    setTimeLeft(plan.seconds);
                }
                setQuestions(orderedQuestions);

                // Set timer from test data (attempt is created on Start click)
                const duration = Math.max(1, tData.duration_minutes || 60);
                if (!resumeId) setTimeLeft(duration * 60);

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
    const submitAtDeadline=useEffectEvent(()=>{void finalizeSubmit('AUTO_SUBMITTED');});
    useEffect(()=>{
        if(!examStarted||examFinished||deadlineRef.current===null)return;
        return startExamCountdown(deadlineRef.current,setTimeLeft,submitAtDeadline);
    },[examStarted,examFinished]);

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

    const handleCheat = useEffectEvent(async (eventType: string) => {
        if (!examStarted || examFinished || submittingRef.current || finishedRef.current) return;
        const nextWarning=++warningCountRef.current;
        setWarningCount(nextWarning);
        if(nextWarning>=MAX_WARNINGS)void finalizeSubmit('AUTO_SUBMITTED');

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
            } catch {}
        }

        // Auto hide warning center after 5s
        setTimeout(() => {
            setWarningMsg(null);
        }, 5000);

    });

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
    }, [examStarted, examFinished]);

    // --------------------------------------------------
    // OPERATIONS
    // --------------------------------------------------
    const getAnswerWriter = () => {
        if(!attempt)return null;
        if(writerRef.current?.id!==attempt.id) {
            writerRef.current?.sync.dispose();
            const id=attempt.id;
            writerRef.current={id,sync:createExamAnswerSync(async(questionId,answer)=>{
                await setDoc(doc(db,'exam_responses',id+'_'+questionId),{attempt_id:id,question_id:questionId,...answer,updated_at:serverTimestamp()},{merge:true});
            },(status,error)=>{setSaveStatus(status);setSaveError(error||'');})};
        }
        return writerRef.current.sync;
    };
    const saveAnswer = (questionId:string,answer:ResponsesMap[string],delay=0) => {
        if(!examStarted||examFinished||submittingRef.current||!attempt)return;
        const next={...responsesRef.current,[questionId]:answer};
        responsesRef.current=next;setResponsesMap(next);
        getAnswerWriter()?.queue(questionId,answer,delay);
    };
    const handleOptionClick = (questionId:string,optionId:string) => saveAnswer(questionId,{option_id:optionId,short_answer:null});
    const handleShortAnswerChange = (questionId:string,value:string) => saveAnswer(questionId,{option_id:null,short_answer:value},500);
    const handleClearAnswer = (questionId:string) => saveAnswer(questionId,{option_id:null,short_answer:null});
    const retryAnswerSave = () => {void getAnswerWriter()?.flush().catch(()=>{});};
    const exitExam = async () => {
        try {await getAnswerWriter()?.flush();router.push('/dashboard');}
        catch { /* The save status explains the error; keep the answers open. */ }
    };

    const finalizeSubmit = async (type = 'SUBMITTED') => {
        if (examFinished || finishedRef.current || submittingRef.current || !attempt || !testData) return;
        submittingRef.current=true;setSubmitting(true);setSubmitError('');
        try {
        await getAnswerWriter()?.flush();

        let score = 0;
        let correctCount = 0;
        questions.forEach((q) => {
            const resp = responsesRef.current[q.id];
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
            try { await exitFullscreenAny(); } catch {}
        }

        const answeredCount = Object.values(responsesRef.current).filter(r => r && r.option_id).length;
        const wrongCount = answeredCount - correctCount;
        const skippedCount = totalQ - answeredCount;

        setResultData({ score, total: totalQ, accuracy, pointsEarned, statusType: type, correctCount, wrongCount, skippedCount });
        finishedRef.current=true;setExamFinished(true);
        } catch(error) {setSubmitError(error instanceof Error?error.message:'Your test could not be submitted. Keep this page open and try again.');}
        finally {submittingRef.current=false;setSubmitting(false);}
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

    if (startError) return <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-indigo-50 p-8 text-center"><p role="alert" className="max-w-md text-slate-700">{startError}</p><button className="rounded-xl bg-indigo-600 px-5 py-3 text-white" onClick={() => router.push('/dashboard')}>Back to Dashboard</button></div>;

    // Click to re-enter fullscreen when user clicks anywhere
    const handleContainerClick = () => {
        if (examStarted && !examFinished && !isFullscreenAny()) {
            try {
                const el = document.documentElement as FullscreenElement;
                if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
                else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
                else if (el.msRequestFullscreen) el.msRequestFullscreen();
            } catch {}
        }
    };

    // Create attempt when user clicks Start (deferred from init for faster load)
    const createAttemptAndStart = async () => {
        if (!user || !testData || startingRef.current) return;
        startingRef.current = true;
        try {
            if (resumeAttempt) {
                if (resumeAttempt.deadline <= Date.now()) { setStartError('This practice time has expired. Return to Dashboard to choose a new attempt.'); return; }
                deadlineRef.current = resumeAttempt.deadline;
                setTimeLeft(Math.ceil((resumeAttempt.deadline - Date.now()) / 1000));
                setAttempt({ id: resumeAttempt.id });
            } else {
            const startedAt = new Date().toISOString();
            const attRef = await addDoc(collection(db, 'exam_attempts'), {
                user_id: user.uid,
                test_id: testId,
                started_at: startedAt,
                question_order: questions.map(question => question.id),
                status: 'IN_PROGRESS',
                created_at: serverTimestamp()
            });
            setAttempt({ id: attRef.id });
            deadlineRef.current = Date.parse(startedAt) + Math.max(1, testData.duration_minutes || 60) * 60_000;
            }
        } catch (e) { console.error('Attempt create error:', e); setStartError('Your attempt could not be saved. Please return to Dashboard and try again.'); return; }
        finally { startingRef.current = false; }
        try {
            const el = document.documentElement as FullscreenElement;
            if (el.requestFullscreen) el.requestFullscreen().catch(() => { });
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
            else if (el.msRequestFullscreen) el.msRequestFullscreen();
        } catch {}
        setExamStarted(true);
    };

    return (
        <div className="min-h-screen overflow-x-hidden" data-exam-page="true" style={{ background: '#f0f2f5' }} onClick={handleContainerClick}>

            {/* Warning Overlay */}
            {warningMsg && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => { e.stopPropagation(); try { if (!isFullscreenAny()) { const el = document.documentElement as FullscreenElement; if (el.requestFullscreen) el.requestFullscreen().catch(() => { }); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); } } catch {} setWarningMsg(null); }}>
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
                                    <p className="text-[11px] font-medium" style={{ color: '#475569' }}>
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
                                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Skipped</div>
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
                                    <p className="text-[11px] font-medium" style={{ color: '#475569' }}>Anti-cheat protocols are active</p>
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe' }}>
                                <h3 className="text-sm font-bold mb-2" style={{ color: '#3730a3' }}>{testData?.title || 'Exam'}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-base font-black" style={{ color: '#6366f1' }}>{testData?.duration_minutes || 30}</div>
                                        <div className="text-[9px] font-bold uppercase" style={{ color: '#475569' }}>Minutes</div>
                                    </div>
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-base font-black" style={{ color: '#10b981' }}>{questions.length}</div>
                                        <div className="text-[9px] font-bold uppercase" style={{ color: '#475569' }}>Questions</div>
                                    </div>
                                    <div className="text-center rounded-xl py-2 px-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
                                        <div className="text-base font-black" style={{ color: '#f59e0b' }}>{testData?.xp_reward || questions.length}</div>
                                        <div className="text-[9px] font-bold uppercase" style={{ color: '#475569' }}>Total Points</div>
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
                                {resumeAttempt ? '▶ Enter Fullscreen & Resume Practice' : '▶ Enter Fullscreen & Start Exam'}
                            </button>
                            <p className="mt-3 text-center text-[10px] font-medium" style={{ color: '#475569' }}>By clicking Start, you agree to the monitoring rules.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ MAIN EXAM SHELL — FUTURISTIC FULLSCREEN ═══ */}
            {examStarted&&!examFinished&&<ExamWorkspace key={attempt?.id||testId} test={testData} questions={workspaceQuestions}
                answers={responsesMap} currentIndex={currentIndex} visited={visitedSet} timeLeft={timeLeft??0} warningCount={warningCount} maxWarnings={MAX_WARNINGS}
                submitting={submitting} saveStatus={saveStatus} saveError={submitError||saveError} metadataScope={[user?.uid,attempt?.id||testId].join(':')} bookmarkScope={user?.uid||'guest'}
                bookmarkControl={<QuestionBookmark questionId={questions[currentIndex].id} compact/>}
                onSelect={handleOptionClick} onShortAnswer={handleShortAnswerChange} onClear={handleClearAnswer}
                onNavigate={index=>{setCurrentIndex(index);setVisitedSet(previous=>new Set(previous).add(questions[index].id));}}
                onSubmit={()=>void finalizeSubmit('SUBMITTED')} onExit={()=>void exitExam()} onRetrySave={retryAnswerSave}/>}

            <style jsx global>{`@keyframes shrinkX { from { transform:scaleX(1); } to { transform:scaleX(0); } }`}</style>
        </div>
    );
}
