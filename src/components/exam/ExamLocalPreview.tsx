'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExamAnswers, ExamQuestion } from '@/types/exam';
import type { ExamSaveStatus } from '@/lib/exam-presentation';
import ExamWorkspace from './ExamWorkspace';
import styles from './ExamWorkspace.module.css';

const examples = [
    {text:'निम्न में से कौन-सा आउटपुट डिवाइस नहीं है? | Which of the following is not an output device?',options:['डिजिटल कैमरा | Digital camera','सीआरटी मॉनिटर | CRT monitor','ईयरफोन | Earphones','प्लॉटर | Plotter']},
    {text:'सीपीयू का पूरा नाम क्या है? | What is the full form of CPU?',options:['सेंट्रल प्रोसेसिंग यूनिट | Central Processing Unit','कंप्यूटर प्रोसेसिंग यूटिलिटी | Computer Processing Utility','सेंट्रल प्रोग्राम यूनिट | Central Program Unit','कंट्रोल प्रोसेसिंग यूनिट | Control Processing Unit']},
    {text:'कंप्यूटर की अस्थायी मेमोरी कौन-सी है? | Which computer memory is volatile?',options:['रैम | RAM','रोम | ROM','हार्ड डिस्क | Hard disk','ऑप्टिकल डिस्क | Optical disc']},
    {text:'इनपुट डिवाइस का एक उदाहरण चुनें। | Choose an example of an input device.',options:['स्कैनर | Scanner','स्पीकर | Speaker','मॉनिटर | Monitor','प्रिंटर | Printer']},
    {text:'ऑपरेटिंग सिस्टम का मुख्य कार्य क्या है? | What is a primary function of an operating system?',options:['हार्डवेयर और सॉफ्टवेयर संसाधनों का प्रबंधन | Managing hardware and software resources','केवल चित्र बनाना | Only creating images','केवल वेबसाइट खोलना | Only opening websites','केवल दस्तावेज़ प्रिंट करना | Only printing documents']},
    {text:'नेटवर्क से जुड़े कंप्यूटरों को क्या लाभ मिलता है? | What is a benefit of connecting computers in a network?',options:['डेटा और संसाधनों को साझा करना | Sharing data and resources','सभी फाइलें अपने आप मिटना | Automatically deleting all files','कीबोर्ड की आवश्यकता समाप्त होना | Removing the need for a keyboard','इंटरनेट की गति हमेशा दोगुनी होना | Always doubling internet speed']},
    {text:'निम्न Python code का output क्या होगा?\nWhat will the following Python code print?\nprint(2 + 3)',options:['5','23','2 + 3','Error']},
    {text:'वेब पेज में मुख्य शीर्षक के लिए कौन-सा HTML element उपयोग होता है? | Which HTML element is used for a main heading?',options:['<h1>','<p>','<span>','<title>']},
    {text:'ऑनलाइन सुरक्षा के लिए मजबूत पासवर्ड क्यों ज़रूरी है? | Why is a strong password important for online security?',options:['अनधिकृत पहुँच से बचाने में मदद करता है | Helps protect against unauthorised access','मॉनिटर का आकार बढ़ाता है | Increases monitor size','इंटरनेट हमेशा मुफ्त करता है | Always makes internet free','सभी फाइलें साझा करता है | Shares every file']},
    {text:'इनपुट और आउटपुट डिवाइस में अंतर अपने शब्दों में समझाएँ।\nExplain the difference between input and output devices in your own words.',options:[]},
];
const questions:ExamQuestion[]=Array.from({length:50},(_,index)=>{
    const example=examples[index%examples.length];
    return {id:`local-question-${index+1}`,question_text:example.text,question_type:example.options.length?'MCQ':'SHORT',marks:2,chapter:index%10===6?'Python basics':index%10===7?'Web design':'Computer fundamentals',exam_options:example.options.map((option,i)=>({id:`local-option-${index+1}-${i}`,option_text:option}))};
});
const test = {id:'local-interface-preview',title:'IT TOOLS CHAPTER 1 TEST',duration_minutes:50,xp_reward:100};
const starter:ExamAnswers=Object.fromEntries([2,3,5,8,12,13,15,18].map(number=>[`local-question-${number}`,{option_id:`local-option-${number}-0`,short_answer:null}]));

// Same workspace as the real route; only this development-only adapter uses sample data.
export default function ExamLocalPreview() {
    const [answers,setAnswers]=useState<ExamAnswers>(starter);
    const [index,setIndex]=useState(0),[remaining,setRemaining]=useState(49*60+57);
    const [visited,setVisited]=useState<Set<string>>(new Set(['local-question-1',...Object.keys(starter)]));
    const [status,setStatus]=useState<ExamSaveStatus>('saved');
    const [finished,setFinished]=useState(false),[submitting,setSubmitting]=useState(false),[cycle,setCycle]=useState(0);
    const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
    const completion=useRef<HTMLDialogElement>(null);
    useEffect(()=>{if(finished)return;const timer=setInterval(()=>setRemaining(value=>Math.max(0,value-1)),1000);return()=>clearInterval(timer);},[finished]);
    useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current);},[]);
    useEffect(()=>{if(finished)completion.current?.showModal();else completion.current?.close();},[finished]);
    const save=(next:ExamAnswers)=>{
        setAnswers(next);setStatus('saving');
        if(timeout.current)clearTimeout(timeout.current);
        timeout.current=setTimeout(()=>setStatus('saved'),450);
    };
    const reset=()=>{setAnswers(starter);setIndex(0);setRemaining(49*60+57);setVisited(new Set(['local-question-1',...Object.keys(starter)]));setStatus('saved');setFinished(false);setSubmitting(false);setCycle(value=>value+1);};
    return <><ExamWorkspace key={cycle} test={test} questions={questions} answers={answers} currentIndex={index} visited={visited} timeLeft={remaining} warningCount={0} saveStatus={status} submitting={submitting}
        metadataScope={`local-preview-${cycle}`} bookmarkScope="local-preview" preview
        previewControls={<select aria-label="Preview timer state" onChange={event=>setRemaining(Number(event.target.value))} defaultValue="2997" style={{fontSize:9,color:'#735415',background:'#fff9e9',border:'1px solid #e8d9b4',borderRadius:4,padding:'2px 5px'}}><option value="2997">Normal timer</option><option value="599">10-minute alert</option><option value="299">5-minute alert</option></select>}
        onSelect={(questionId,optionId)=>save({...answers,[questionId]:{option_id:optionId,short_answer:null}})} onShortAnswer={(questionId,value)=>save({...answers,[questionId]:{option_id:null,short_answer:value}})}
        onClear={questionId=>{const next={...answers};delete next[questionId];save(next);}} onNavigate={next=>{setIndex(next);setVisited(value=>new Set(value).add(questions[next].id));}}
        onSubmit={()=>{setSubmitting(true);if(timeout.current)clearTimeout(timeout.current);timeout.current=setTimeout(()=>{setSubmitting(false);setFinished(true);},450);}} onExit={()=>setFinished(true)} onRetrySave={()=>setStatus('saved')}/>
        <dialog className={styles.modal} ref={completion} onCancel={event=>{event.preventDefault();setFinished(false);}} style={{fontFamily:'var(--font-body), sans-serif'}}><h2>Local preview complete</h2><p className={styles.modalDescription}>You’ve tried the new exam interface. No real attempt, score or database record was created.</p><div className={styles.modalActions}><button className={styles.returnButton} onClick={()=>setFinished(false)}>Return to preview</button><button className={styles.confirmButton} onClick={reset}>Try again from the start</button></div></dialog>
    </>;
}
