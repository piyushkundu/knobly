'use client';
import { useEffect, useRef } from 'react';
import { CheckCircle2, Columns, Send, Trophy, X } from 'lucide-react';
import type { StyleEvaluation } from '@/lib/style-task-evaluation';

export default function StyleSubmissionResult({ result, changed, onClose, onCompare, onResubmit }: {
    result: StyleEvaluation; changed: boolean; onClose:()=>void; onCompare:()=>void; onResubmit:()=>void;
}) {
    const dialog=useRef<HTMLDialogElement>(null);
    useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close();},[]);
    return <dialog ref={dialog} className="sc-result-dialog" aria-labelledby="style-result-title" onCancel={event=>{event.preventDefault();onClose();}}>
        <header><div><span>PROJECT REVIEW / प्रोजेक्ट की जाँच</span><h2 id="style-result-title">Your submission result</h2></div><button onClick={onClose} aria-label="Close submission result"><X size={20}/></button></header>
        <div className="sc-result-body">
            <div className="sc-result-score"><Trophy size={32}/><strong>{result.score}<small>/100</small></strong><span>Grade {result.grade}</span><p>{result.feedback}</p></div>
            <p className="sc-result-method">Code-based practice score: HTML structure, target content, CSS skills and syntax. Use Compare to check visual similarity.</p>
            {changed&&<p className="sc-result-stale" role="status">Your code changed after this submission. Submit again for an updated result.</p>}
            <div className="sc-result-breakdown">{result.breakdown.map(item=><div key={item.label}><span>{item.label}</span><b>{item.score}/{item.max}</b><progress value={item.score} max={item.max} aria-label={item.label}/></div>)}</div>
            <section><h3><CheckCircle2 size={16}/>What you did well / क्या सही किया</h3><ul>{(result.strengths.length?result.strengths:['You have started building your project.']).map(text=><li key={text}>{text}</li>)}</ul></section>
            <section><h3>Improve next / अब क्या सुधारें</h3><ul>{result.improvements.map(text=><li key={text}>{text}</li>)}</ul></section>
            {!!result.matchedSkills.length&&<div className="sc-result-skills">{result.matchedSkills.map(skill=><code key={skill}>{skill}</code>)}</div>}
            {!!result.missingSkills.length&&<section><h3>Missing CSS skills</h3><div className="sc-result-skills is-missing">{result.missingSkills.map(skill=><code key={skill}>{skill}</code>)}</div></section>}
            {!!result.syntaxErrors.length&&<section className="sc-result-errors"><h3>CSS errors</h3><ul>{result.syntaxErrors.map((text,index)=><li key={index}>{text}</li>)}</ul></section>}
        </div>
        <footer><button onClick={onClose} autoFocus>Continue editing</button><button onClick={onCompare}><Columns size={14}/>Compare target</button><button className="sc-result-submit" onClick={onResubmit}><Send size={14}/>Submit again</button></footer>
    </dialog>;
}
