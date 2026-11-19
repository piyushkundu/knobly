'use client';
import { memo, useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, LockKeyhole, Search } from 'lucide-react';
import type { CourseSummary, StyleDraft, StyleLesson } from '@/lib/style-course-types';
import { activeReadingChapter, courseChapterFromPath } from '@/lib/style-course-reading';
import LessonReader from './LessonReader';
import { useCourseProgress } from './CourseProgress';

const ChapterContent=memo(LessonReader);

export interface ReadingChapter { lesson:StyleLesson; demo:StyleDraft }
export default function CourseReader({ course, chapters, initialId }: {course:CourseSummary;chapters:ReadingChapter[];initialId:string}) {
    const [activeId,setActiveId]=useState(initialId);
    const [query,setQuery]=useState('');
    const [chaptersOpen,setChaptersOpen]=useState(false);
    const active=useRef(initialId);
    const sections=useRef(new Map<string,HTMLElement>());
    const sidebar=useRef<HTMLElement>(null);
    const { completed }=useCourseProgress(course.id);
    const base=`/web-design/${course.id}`;
    const current=chapters.find(item=>item.lesson.id===activeId)?.lesson || chapters[0].lesson;
    const index=chapters.findIndex(item=>item.lesson.id===current.id);
    const groups=[...new Set(course.lessons.map(item=>item.group))];
    const filtered=course.lessons.filter(item=>`${item.title} ${item.group}`.toLowerCase().includes(query.toLowerCase()));
    const count=course.lessons.filter(item=>completed.includes(item.id)).length;

    useEffect(()=>{
        const ids=chapters.map(item=>item.lesson.id);
        let frame=0;
        const scan=()=>{
            frame=0;
            const positions=ids.flatMap(id=>{
                const section=sections.current.get(id);
                if (!section) return [];
                const bounds=section.getBoundingClientRect();
                return [{id,top:bounds.top,bottom:bounds.bottom}];
            });
            const next=activeReadingChapter(positions);
            if (!next || next===active.current) return;
            active.current=next;
            setActiveId(next);
            // Native history keeps the continuous document mounted and preserves editor state.
            if (courseChapterFromPath(window.location.pathname,course.id,ids)) {
                window.history.replaceState(window.history.state,'',`${base}/learn/${next}${window.location.search}`);
            }
        };
        const schedule=()=>{if (!frame) frame=requestAnimationFrame(scan);};
        const restore=()=>{
            const id=courseChapterFromPath(window.location.pathname,course.id,ids);
            if (!id) return;
            active.current=id; setActiveId(id);
            sections.current.get(id)?.scrollIntoView({block:'start',behavior:'instant'});
        };
        let target: HTMLElement | null=null;
        try { target=window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null; } catch {}
        const section=sections.current.get(initialId);
        if (target && section?.contains(target)) target.scrollIntoView({block:'start',behavior:'instant'});
        else if (initialId!==ids[0]) section?.scrollIntoView({block:'start',behavior:'instant'});
        window.addEventListener('scroll',schedule,{passive:true});
        window.addEventListener('resize',schedule);
        window.addEventListener('popstate',restore);
        const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
        const surface=section?.parentElement;
        if (surface) resize?.observe(surface);
        schedule();
        return ()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('popstate',restore);resize?.disconnect();if(frame)cancelAnimationFrame(frame);};
    },[base,chapters,course.id,initialId]);

    useEffect(()=>{
        const box=sidebar.current;
        const selected=box?.querySelector<HTMLElement>('[aria-current="page"]');
        if (!box || !selected) return;
        const bounds=selected.getBoundingClientRect(), outer=box.getBoundingClientRect();
        if (bounds.top<outer.top+20 || bounds.bottom>outer.bottom-20) box.scrollTop+=bounds.top-outer.top-100;
    },[activeId]);

    const jump=(event:MouseEvent<HTMLAnchorElement>, id:string)=>{
        if (event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const section=sections.current.get(id);
        if (!section) return;
        event.preventDefault();
        setChaptersOpen(false);
        // Scroll updates the active chapter naturally; it never marks a lesson complete.
        section.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    };
    return <div className="sc-reader-layout sc-continuous-reader">
        <button type="button" className="sc-mobile-chapters" aria-controls="continuous-chapter-sidebar" aria-expanded={chaptersOpen} onClick={()=>setChaptersOpen(value=>!value)}><span><BookOpen size={14}/>Chapter {index+1}: {current.title.replace(/^\d+\.\s*/,'')}</span><ChevronDown size={15}/></button>
        <aside ref={sidebar} id="continuous-chapter-sidebar" className={`sc-sidebar ${chaptersOpen?'is-open':''}`}><div className="sc-sidebar-head"><Link className="sc-back" href={base}><ArrowLeft size={14}/>Course overview</Link><BookOpen size={14}/></div><h2>{course.name} Learning Guide</h2><label className="sc-sidebar-search"><Search size={13}/><input aria-label="Search chapter navigation" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a chapter…"/></label>
            <nav aria-label="Chapter navigation">{groups.map(group=><div key={group}>{filtered.some(item=>item.group===group)&&<div className="sc-sidebar-group">{group}</div>}{filtered.filter(item=>item.group===group).map(item=><a key={item.id} href={`${base}/learn/${item.id}`} onClick={event=>jump(event,item.id)} aria-current={item.id===activeId?'page':undefined}><span>{completed.includes(item.id)?<Check size={11}/>:course.lessons.indexOf(item)+1}</span>{item.title.replace(/^\d+\.\s*/,'')}{item.id===activeId&&<ChevronRight size={12}/>}</a>)}</div>)}</nav>
            {!filtered.length&&<p className="sc-empty">No matching chapters</p>}
            <div className="sc-sidebar-foot"><strong>Your progress</strong><progress value={count} max={course.lessons.length} aria-label="Learning progress"/><span>{count} of {course.lessons.length} chapters completed</span><Link className="sc-sidebar-note-lock" href={`${base}/notes`}><LockKeyhole size={12}/>Notes · Coming Soon</Link></div>
        </aside>
        <main className="sc-lesson sc-reading-stream"><h1 className="sc-visually-hidden">{course.name} complete learning guide</h1><div className="sc-stream-position"><span><BookOpen size={13}/><strong>{current.title.replace(/^\d+\.\s*/,'')}</strong></span><small>{index+1} / {chapters.length} · Keep scrolling</small></div>
            {chapters.map(({lesson,demo},position)=><article key={lesson.id} id={`chapter-${lesson.id}`} ref={element=>{if(element)sections.current.set(lesson.id,element);else sections.current.delete(lesson.id);}} className="sc-stream-chapter" aria-label={`Chapter ${position+1}: ${lesson.title}`}>
                <ChapterContent course={course} lesson={lesson} demo={demo} embedded/>
                {position+1<chapters.length&&<div className="sc-chapter-bridge"><span><ChevronDown size={17}/></span><div><small>KEEP SCROLLING · NEXT CHAPTER</small><strong>{chapters[position+1].lesson.title.replace(/^\d+\.\s*/,'')}</strong></div></div>}
            </article>)}
            <section className="sc-card sc-reading-finish"><BookOpen size={25}/><h2>You have reached the end of the guide.</h2><p>Revise a chapter using the sidebar, or put your skills into practice.</p><Link href={`${base}/tasks`} className="sc-primary">Explore practice projects<ArrowRight size={15}/></Link></section>
        </main>
    </div>;
}
