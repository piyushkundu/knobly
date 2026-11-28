'use client';

import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Check, CheckCheck, ChevronLeft, CircleHelp, Clock3, CloudCheck, CloudOff, Flag, Grid2X2, Keyboard, Loader2, LockKeyhole, LogOut, RotateCcw, Send, ShieldCheck, X } from 'lucide-react';
import type { ExamAnswers, ExamInfo, ExamQuestion } from '@/types/exam';
import { examShortcut, examSummary, filteredQuestions, hasExamAnswer, readExamMetadata, timerLevel, type ExamLanguage, type ExamSaveStatus, type PaletteFilter } from '@/lib/exam-presentation';
import ExamText from './ExamText';
import styles from './ExamWorkspace.module.css';

export interface ExamWorkspaceProps {
    test: ExamInfo;
    questions: ExamQuestion[];
    answers: ExamAnswers;
    currentIndex: number;
    visited: ReadonlySet<string>;
    timeLeft: number;
    warningCount: number;
    maxWarnings?: number;
    submitting?: boolean;
    saveStatus: ExamSaveStatus;
    saveError?: string;
    metadataScope: string;
    bookmarkScope: string;
    preview?: boolean;
    previewControls?: ReactNode;
    bookmarkControl?: ReactNode;
    onSelect: (questionId:string, optionId:string) => void;
    onShortAnswer: (questionId:string, value:string) => void;
    onClear: (questionId:string) => void;
    onNavigate: (index:number) => void;
    onSubmit: () => void;
    onExit: () => void;
    onRetrySave: () => void;
}

const formatTime = (seconds:number) => `${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
const labels = { all: 'All', unanswered: 'Unanswered', review: 'Review' };

export default function ExamWorkspace(props: ExamWorkspaceProps) {
    const { test, questions, answers, currentIndex, visited, timeLeft, warningCount, maxWarnings = 3, submitting = false, saveStatus, saveError, onSelect, onShortAnswer, onClear, onNavigate, onSubmit, onExit, onRetrySave } = props;
    const question = questions[currentIndex];
    const [language, setLanguage] = useState<ExamLanguage>('both');
    const [fontSize, setFontSize] = useState(19);
    const [review, setReview] = useState<Set<string>>(new Set());
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
    const [metadataLoaded, setMetadataLoaded] = useState(false);
    const [storageNotice, setStorageNotice] = useState({id:'',text:''});
    const [filter, setFilter] = useState<PaletteFilter>('all');
    const [online, setOnline] = useState(true);
    const [dialog, setDialog] = useState<'submit'|'exit'|'shortcuts'|null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null), drawerRef = useRef<HTMLDialogElement>(null);
    const questionBodyRef = useRef<HTMLDivElement>(null);
    const dialogTitle = useId(), drawerTitle = useId(), questionTitle = useId();
    const reviewKey = `knobly_exam_review_v1:${props.metadataScope}`;
    const bookmarkKey = `knobly_exam_bookmarks_v1:${props.bookmarkScope}`;
    const summary = examSummary(questions, answers, review);
    const progress = summary.total ? Math.round(summary.answered / summary.total * 100) : 0;
    const level = timerLevel(timeLeft);
    const currentAnswered = hasExamAnswer(answers[question?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setReview(new Set(readExamMetadata(reviewKey).review));
            setBookmarks(new Set(readExamMetadata(bookmarkKey).bookmarks));
            setMetadataLoaded(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [reviewKey, bookmarkKey]);
    useEffect(() => {
        if (!metadataLoaded) return;
        try {
            localStorage.setItem(reviewKey, JSON.stringify({review:[...review]}));
            localStorage.setItem(bookmarkKey, JSON.stringify({bookmarks:[...bookmarks]}));
        } catch { /* Interaction below reports when persistence is unavailable. */ }
    }, [review, bookmarks, metadataLoaded, reviewKey, bookmarkKey]);
    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        update();window.addEventListener('online',update);window.addEventListener('offline',update);
        return () => {window.removeEventListener('online',update);window.removeEventListener('offline',update);};
    }, []);
    useEffect(() => {
        const node = modalRef.current;
        if (dialog && !node?.open) node?.showModal();
        if (!dialog && node?.open) node.close();
    }, [dialog]);
    useEffect(() => {
        const node = drawerRef.current;
        if (drawerOpen && !node?.open) node?.showModal();
        if (!drawerOpen && node?.open) node.close();
    }, [drawerOpen]);
    useEffect(() => { questionBodyRef.current?.scrollTo({top:0,behavior:'instant'}); }, [currentIndex]);

    const toggleReview = () => {
        if (!question || submitting) return;
        setReview(previous => {const next = new Set(previous);if(next.has(question.id))next.delete(question.id);else next.add(question.id);return next;});
    };
    const toggleBookmark = () => {
        const next = new Set(bookmarks);
        if (next.has(question.id)) next.delete(question.id); else next.add(question.id);
        setBookmarks(next);
        try {localStorage.setItem(bookmarkKey,JSON.stringify({bookmarks:[...next]}));setStorageNotice({id:question.id,text:next.has(question.id)?'Saved for revision in this browser':'Removed from saved revision'});}
        catch {setStorageNotice({id:question.id,text:'Saved for this session. Browser storage is unavailable.'});}
    };
    const navigate = (index:number) => {if(submitting||index<0||index>=questions.length)return;onNavigate(index);setDrawerOpen(false);};
    const next = () => currentIndex === questions.length-1 ? setDialog('submit') : navigate(currentIndex+1);
    const shortcut = useEffectEvent((event:KeyboardEvent) => {
        const target = event.target as HTMLElement|null;
        if(event.defaultPrevented)return;
        const editing = !!target?.closest('input,textarea,select,[contenteditable="true"]');
        const command = examShortcut(event,editing,!!dialog||drawerOpen||submitting);
        if (!command || !question) return;
        if (command.action === 'option') {const option=question.exam_options?.[command.index];if(question.question_type!=='SHORT'&&option){event.preventDefault();onSelect(question.id,option.id);}}
        else if(command.action==='next'){event.preventDefault();next();}
        else if(command.action==='previous'){event.preventDefault();navigate(currentIndex-1);}
        else {event.preventDefault();toggleReview();}
    });
    useEffect(() => {const listener=(event:KeyboardEvent)=>shortcut(event);window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);}, []);
    if (!question) return null;

    const palette = <>
        <div className={styles.paletteHeading}><span className={styles.paletteIcon}><Grid2X2 size={19}/></span><div><h2>Question palette</h2><p>Jump to any question</p></div><span className={styles.countBadge}>{summary.total}</span></div>
        <div className={styles.stats}>
            <div><span className={styles.statGreen}><CheckCheck size={14}/> Answered</span><strong>{summary.answered}</strong></div>
            <div><span><CircleHelp size={14}/> Remaining</span><strong>{summary.unanswered}</strong></div>
            <div><span className={styles.statAmber}><Flag size={14}/> Review</span><strong>{summary.review}</strong></div>
        </div>
        <div className={styles.progressCaption}><span>Your progress</span><strong>{progress}%</strong></div>
        <div className={styles.progress} role="progressbar" aria-label="Questions answered" aria-valuenow={summary.answered} aria-valuemin={0} aria-valuemax={summary.total}><span style={{width:`${progress}%`}}/></div>
        <div className={styles.filters} aria-label="Filter questions">{(['all','unanswered','review'] as const).map(value=><button key={value} onClick={()=>setFilter(value)} aria-pressed={filter===value}>{labels[value]}</button>)}</div>
        <nav className={styles.paletteGrid} aria-label="Go to question">
            {filteredQuestions(questions,answers,review,filter).map(({question:q,index})=>{
                const answered=hasExamAnswer(answers[q.id]), flagged=review.has(q.id), current=index===currentIndex;
                const status=flagged?'marked for review':answered?'answered':visited.has(q.id)?'visited, unanswered':'not visited';
                return <button type="button" key={q.id} disabled={submitting} className={`${styles.paletteNumber} ${answered?styles.answered:''} ${visited.has(q.id)&&!answered?styles.visited:''} ${flagged?styles.flagged:''} ${current?styles.current:''}`} onClick={()=>navigate(index)} aria-current={current?'step':undefined} aria-label={`Question ${index+1}, ${status}${answered&&flagged?', answered':''}${current?', current':''}`}>
                    <span>{index+1}</span>{flagged?<Flag size={10} fill="currentColor"/>:answered?<Check size={11}/>:visited.has(q.id)?<i/>:null}
                </button>;
            })}
            {filteredQuestions(questions,answers,review,filter).length===0&&<div className={styles.emptyPalette}><CheckCheck size={25}/><strong>{filter==='review'?'No questions marked':'All questions answered'}</strong><p>{filter==='review'?'Use the flag to revisit a question.':'You can review your answers before submitting.'}</p><button onClick={()=>setFilter('all')}>Show all questions</button></div>}
        </nav>
        <div className={styles.legend}><span><i className={styles.legendCurrent}/>Current</span><span><Check size={12}/>Answered</span><span><Flag size={12}/>Review</span><span><i className={styles.legendVisited}/>Visited</span></div>
        <div className={styles.paletteFooter}><ShieldCheck size={16}/><p>Stay focused. Your answers matter.<small>Tab, copy & fullscreen rules remain active.</small></p></div>
        <button className={styles.exitButton} onClick={()=>setDialog('exit')} disabled={submitting}><LogOut size={15}/> Exit to dashboard</button>
    </>;

    const state = !online?'offline':saveStatus;
    const savedLabel = state==='saving'?'Saving answers…':state==='offline'?'Offline · answers kept on this page':state==='error'?'Not synced · retry saving':props.preview?'Saved in local preview':'All changes saved';
    return <div className={styles.workspace} data-exam-workspace="true">
        {props.preview&&<div className={styles.previewBanner}><LockKeyhole size={12}/><span>LOCAL PREVIEW · Sample questions · No real exam attempt or score is saved.</span>{props.previewControls}</div>}
        <header className={styles.header}>
            <div className={styles.brand}><span className={styles.logo}>K<span>.</span></span><div><span className={styles.eyebrow}>KNOBLY EXAM SPACE</span><h1 title={test.title}>{test.title}</h1></div></div>
            <div className={styles.headerActions}>
                <span className={styles.security} title={`${warningCount} of ${maxWarnings} security warnings`}><ShieldCheck size={16}/><span>{warningCount}/{maxWarnings}<small>Warnings</small></span></span>
                <div className={styles.timer} data-level={level} aria-label={`${formatTime(timeLeft)} remaining`}><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="16" pathLength="100" strokeDasharray="100" strokeDashoffset={100-Math.min(100,Math.max(0,timeLeft/(test.duration_minutes*60)*100))}/><path d="M20 12v8l5 3"/></svg><div><small>TIME LEFT</small><strong>{formatTime(timeLeft)}</strong></div></div>
                <button className={styles.submitButton} disabled={submitting} onClick={()=>setDialog('submit')}>{submitting?<Loader2 className={styles.spin} size={16}/>:<Send size={16}/>}<span>{submitting?'Submitting…':'Submit test'}</span></button>
            </div>
        </header>
        <div className={styles.sessionBar}><span><LockKeyhole size={13}/> Secure exam <i/> {test.duration_minutes} min <i/> {questions.length} questions</span><span className={styles.sync} data-state={state} role="status">{state==='saving'?<Loader2 className={styles.spin} size={14}/>:state==='offline'||state==='error'?<CloudOff size={14}/>:<CloudCheck size={15}/>}<span>{savedLabel}</span>{(state==='error'||state==='offline')&&<button onClick={onRetrySave} disabled={submitting||!online}>Retry</button>}</span></div>
        {saveError&&<div className={styles.saveError} role="alert">{saveError}</div>}
        <div className={styles.main}>
            <section className={styles.questionArea} aria-label="Exam question">
                <div className={styles.readingTools}>
                    <span><span className={styles.liveDot}/> IN PROGRESS <small>Do your best</small></span>
                    <div className={styles.readingActions}><label className={styles.languageLabel}>Language<select aria-label="Question language" value={language} onChange={event=>setLanguage(event.target.value as ExamLanguage)}><option value="both">Hindi + English</option><option value="hi">Hindi</option><option value="en">English</option></select></label><div className={styles.fontTools} role="group" aria-label="Text size"><button disabled={fontSize<=17} onClick={()=>setFontSize(value=>value-1)} aria-label="Decrease text size">A−</button><button onClick={()=>setFontSize(19)} aria-label="Reset text size">A</button><button disabled={fontSize>=25} onClick={()=>setFontSize(value=>value+1)} aria-label="Increase text size">A+</button></div><button className={styles.keyboardButton} onClick={()=>setDialog('shortcuts')} aria-label="Keyboard shortcuts"><Keyboard size={18}/></button></div>
                </div>
                <div className={styles.questionScroll} ref={questionBodyRef}>
                    <article className={styles.questionCard} style={{'--exam-text-size':`${fontSize}px`} as CSSProperties} aria-labelledby={questionTitle}>
                        <div className={styles.questionMeta}><div className={styles.questionNumber}><span>{String(currentIndex+1).padStart(2,'0')}</span><div><strong>Question {currentIndex+1}<small> of {questions.length}</small></strong></div></div><div className={styles.questionBadges}><span className={styles.marks}>{question.marks??1} marks</span>{props.bookmarkControl??(<button className={`${styles.bookmark} ${bookmarks.has(question.id)?styles.bookmarked:''}`} aria-label={bookmarks.has(question.id)?'Remove saved revision':'Save for revision'} aria-pressed={bookmarks.has(question.id)} title="Save for later revision in this browser" onClick={toggleBookmark}>{bookmarks.has(question.id)?<BookmarkCheck size={19}/>:<Bookmark size={19}/>}</button>)}</div></div>
                        <div className={styles.questionContent} key={question.id}>
                            {question.chapter&&<span className={styles.chapter}>{question.chapter}</span>}
                            <h2 id={questionTitle} className={styles.questionText}><ExamText text={question.question_text} language={language}/></h2>
                            <p className={styles.answerHint}>{question.question_type==='SHORT'?'Write your answer below':'Choose one answer'}<span>{review.has(question.id)&&<><Flag size={12}/> Marked for review</>}</span></p>
                            {question.question_type==='SHORT'?<label className={styles.shortAnswer}>Your answer<textarea value={answers[question.id]?.short_answer||''} onChange={event=>onShortAnswer(question.id,event.target.value)} disabled={submitting} rows={7} placeholder="Type your answer here…"/></label>:<div className={styles.options} role="radiogroup" aria-labelledby={questionTitle}>{question.exam_options.map((option,index)=>{
                                const selected=answers[question.id]?.option_id===option.id;
                                return <button type="button" role="radio" aria-checked={selected} disabled={submitting} key={option.id} className={`${styles.option} ${selected?styles.selected:''}`} onClick={()=>onSelect(question.id,option.id)} onKeyDown={event=>{if(['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(event.key)){event.preventDefault();const nextIndex=(index+(['ArrowDown','ArrowRight'].includes(event.key)?1:-1)+question.exam_options.length)%question.exam_options.length;onSelect(question.id,question.exam_options[nextIndex].id);const radios=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');radios?.[nextIndex]?.focus();}}}>
                                    <span className={styles.optionLetter}>{String.fromCharCode(65+index)}</span><span className={styles.optionText}><ExamText text={option.option_text} language={language}/></span><span className={styles.optionIndicator}>{selected&&<Check size={15} strokeWidth={3}/>}</span>
                                </button>;
                            })}</div>}
                            <div className={styles.questionBottom}><span data-answered={currentAnswered}>{currentAnswered?<CheckCheck size={14}/>:<CircleHelp size={14}/>} {currentAnswered?'Answer selected':'Not answered yet'}</span><button onClick={toggleReview} disabled={submitting} aria-pressed={review.has(question.id)}><Flag size={14} fill={review.has(question.id)?'currentColor':'none'}/>{review.has(question.id)?'Remove review':'Mark for review'}</button></div>
                        </div>
                    </article>
                    <p className={styles.revisionNotice} role="status">{storageNotice.id===question.id?storageNotice.text:'One question at a time. You’ve got this.'}</p>
                    {level!=='normal'&&<p className={styles.timeNotice} data-level={level}><Clock3 size={14}/>{level==='urgent'?'5 minutes or less remaining. Review unanswered questions.':'10 minutes or less remaining.'}</p>}
                </div>
                <footer className={styles.navigation}><button className={styles.previous} onClick={()=>navigate(currentIndex-1)} disabled={currentIndex===0||submitting}><ArrowLeft size={17}/><span>Previous</span></button><button className={styles.clear} onClick={()=>onClear(question.id)} disabled={!currentAnswered||submitting}><RotateCcw size={15}/><span>Clear answer</span></button><div className={styles.navigationRight}><button className={styles.markNext} onClick={()=>{if(!review.has(question.id))toggleReview();next();}} disabled={submitting}><Flag size={15}/><span>Mark & next</span></button><button className={styles.next} onClick={next} disabled={submitting}><span>{currentIndex===questions.length-1?'Review & finish':'Save & next'}</span><ArrowRight size={17}/></button></div></footer>
            </section>
            <aside className={styles.palette} aria-label="Question palette">{palette}</aside>
        </div>
        <button className={styles.mobilePaletteButton} onClick={()=>setDrawerOpen(true)} aria-label="Open question palette"><Grid2X2 size={17}/><span>Questions</span><strong>{summary.answered}/{summary.total}</strong></button>
        <dialog className={styles.drawer} ref={drawerRef} aria-labelledby={drawerTitle} onCancel={event=>{event.preventDefault();setDrawerOpen(false);}}><div className={styles.drawerHeading}><h2 id={drawerTitle}>Your questions</h2><button onClick={()=>setDrawerOpen(false)} aria-label="Close question palette"><X size={19}/></button></div><div className={styles.drawerPalette}>{palette}</div></dialog>
        <dialog className={styles.modal} ref={modalRef} aria-labelledby={dialogTitle} onCancel={event=>{event.preventDefault();setDialog(null);}}>
            <div className={styles.modalHead}><span className={styles.modalIcon}>{dialog==='shortcuts'?<Keyboard size={23}/>:dialog==='exit'?<LogOut size={23}/>:<Send size={23}/>}</span><button onClick={()=>setDialog(null)} aria-label="Close dialog"><X size={19}/></button></div>
            <h2 id={dialogTitle}>{dialog==='shortcuts'?'A little faster. Just as focused.':dialog==='exit'?'Leave this test?':'Ready to submit your test?'}</h2>
            <p className={styles.modalDescription}>{dialog==='shortcuts'?'Keyboard shortcuts':dialog==='exit'?'The exam timer keeps running while you are away.':'Take one last look at your progress.'}</p>
            {dialog==='shortcuts'?<div className={styles.shortcuts}>{[['1–4','Choose option'],['N / →','Next question'],['P / ←','Previous question'],['R','Toggle review'],['Tab','Move between controls'],['↑ / ↓','Move between focused options']].map(([key,text])=><div key={key}><kbd>{key}</kbd><span>{text}</span></div>)}<p>Shortcuts pause while typing or using a dialog.</p></div>:dialog==='submit'?<><div className={styles.submitStats}><div><strong>{summary.total}</strong><span>Total questions</span></div><div><strong>{summary.answered}</strong><span>Answered</span></div><div><strong>{summary.unanswered}</strong><span>Unanswered</span></div><div><strong>{summary.review}</strong><span>Marked for review</span></div></div>{summary.unanswered>0&&<p className={styles.submitWarning}><CircleHelp size={16}/>{summary.unanswered} questions are still unanswered.</p>}<p className={styles.summaryNote}>Review flags can include answered questions. Your latest answers will be submitted.</p></>:null}
            <div className={styles.modalActions}><button autoFocus className={styles.returnButton} onClick={()=>setDialog(null)}><ChevronLeft size={15}/>Return to test</button>{dialog!=='shortcuts'&&<button className={styles.confirmButton} disabled={submitting} onClick={()=>{setDialog(null);if(dialog==='exit')onExit();else onSubmit();}}>{dialog==='exit'?'Leave test':'Confirm submission'}<ArrowRight size={15}/></button>}</div>
        </dialog>
    </div>;
}
