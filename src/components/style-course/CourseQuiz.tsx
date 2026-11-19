'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { StyleCourseId, StyleQuestion } from '@/lib/style-course-types';

export default function CourseQuiz({ course, questions }: { course: StyleCourseId; questions: StyleQuestion[] }) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [index, setIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const q = questions[index], answered = answers[index] !== undefined;
    const score = questions.filter((item,i)=>answers[i]===item.correctAnswer).length;
    return <main className="sc-main sc-quiz"><section className="sc-hero sc-small-hero"><div className="sc-kicker">CHECK YOUR UNDERSTANDING</div><h1>Quick revision</h1><p>{questions.length} questions · Choose an answer to see feedback. Your results stay in this page.</p></section>
        {finished ? <section className="sc-card"><h2>You scored {score} / {questions.length}</h2><p>Revise the lessons for the questions you missed, then try again.</p><div className="sc-actions"><button className="sc-primary" onClick={()=>{setAnswers({});setIndex(0);setFinished(false);}}>Try again</button><Link className="sc-secondary" href={`/web-design/${course}`}>Back to lessons</Link></div>{questions.map((item,i)=><details key={item.question} className="sc-review"><summary>{answers[i]===item.correctAnswer ? '✓' : '↻'} {item.question}</summary><p>Correct: {item.options[item.correctAnswer]}</p><p>Your answer: {item.options[answers[i]] ?? 'Not answered'}</p></details>)}</section> : <section className="sc-card"><div className="sc-section-heading"><span className="sc-kicker">QUESTION {index+1} / {questions.length}</span><span>Score: {score}</span></div><h2>{q.question}</h2><div className="sc-quiz-options">{q.options.map((option,i)=><button key={option} type="button" disabled={answered} className={answered ? i===q.correctAnswer ? 'sc-correct' : i===answers[index] ? 'sc-incorrect' : '' : ''} onClick={()=>setAnswers(current=>({...current,[index]:i}))}>{String.fromCharCode(65+i)}. {option}</button>)}</div>{answered && <div className="sc-remember" role="status"><strong>{answers[index]===q.correctAnswer ? 'Correct!' : 'Review this concept'}</strong><p>{q.explanation}</p></div>}<button className="sc-primary" disabled={!answered} onClick={()=>index+1===questions.length ? setFinished(true) : setIndex(current=>current+1)}>{index+1===questions.length ? 'See results' : 'Next question'}</button></section>}
    </main>;
}
