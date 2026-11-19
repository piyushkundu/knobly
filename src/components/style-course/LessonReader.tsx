'use client';
import { createElement, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronDown, ChevronRight, Code2, Copy, Eye, FileCode2, Lightbulb, List, Play, Search, Sparkles, Target } from 'lucide-react';
import type { CourseNode, CourseSummary, StyleDraft, StyleLesson } from '@/lib/style-course-types';
import LessonCompletion, { useCourseProgress } from './CourseProgress';
import { previewDocument } from '@/lib/style-course-demo';

export function StyleCode({ code, label = 'Example' }: { code: string; label?: string }) {
    const [status, setStatus] = useState('Copy');
    const copy = async () => { try { await navigator.clipboard.writeText(code); setStatus('Copied'); } catch { setStatus('Select code to copy'); } };
    return <div className="sc-code"><div className="sc-code-bar"><span>{label}</span><button type="button" onClick={copy}>{status === 'Copied' ? <Check size={13} /> : <Copy size={13} />}{status}</button></div><pre><code>{code}</code></pre></div>;
}
function ReadNode({ node }: { node: CourseNode }) {
    if (node.text !== undefined) return node.text;
    if (node.code !== undefined) return <StyleCode code={node.code} />;
    const children = node.children?.map((child, index) => <ReadNode key={index} node={child} />);
    const tag = node.tag || 'div';
    if (tag === 'br') return <br />;
    if (tag === 'img') return <Image className="sc-reading-image" src={node.attrs?.src || '/practice-media/study.svg'} alt={node.attrs?.alt || 'Example image'} width={240} height={160} unoptimized />;
    const props: Record<string, unknown> = {};
    if (node.attrs?.colspan) props.colSpan = Number(node.attrs.colspan);
    if (node.attrs?.rowspan) props.rowSpan = Number(node.attrs.rowspan);
    if (tag === 'a') { props.href = node.attrs?.href; if (String(props.href).startsWith('https://')) { props.target='_blank'; props.rel='noopener noreferrer'; } }
    const safeTag = tag === 'h1' || tag === 'h2' ? 'h3' : tag;
    const tableChildren = tag === 'table' ? node.children?.map((child,index) => child.tag === 'tr' ? <tbody key={index}><ReadNode node={child} /></tbody> : <ReadNode key={index} node={child} />) : children;
    const element = createElement(safeTag, props, tableChildren);
    return tag === 'table' ? <div className="sc-table-scroll">{element}</div> : element;
}
export default function LessonReader({ course, lesson, demo }: { course: CourseSummary; lesson: StyleLesson; demo: StyleDraft }) {
    const [visual, setVisual] = useState(false);
    const [file, setFile] = useState<'html'|'css'>('html');
    const [result, setResult] = useState(false);
    const [query, setQuery] = useState('');
    const [chaptersOpen, setChaptersOpen] = useState(false);
    const { completed } = useCourseProgress(course.id);
    const base = `/web-design/${course.id}`;
    const index = course.lessons.findIndex(item => item.id === lesson.id);
    const groups = [...new Set(course.lessons.map(item=>item.group))];
    const filtered = course.lessons.filter(item=>`${item.title} ${item.group}`.toLowerCase().includes(query.toLowerCase()));
    const completedCount = course.lessons.filter(item=>completed.includes(item.id)).length;
    const activeFile = file === 'css' && demo.css ? 'css' : 'html';
    return <div className="sc-reader-layout">
        <button type="button" className="sc-mobile-chapters" aria-expanded={chaptersOpen} aria-controls="course-chapter-sidebar" onClick={()=>setChaptersOpen(value=>!value)}><span><List size={14}/> Browse {course.lessons.length} chapters</span><ChevronDown size={16}/></button>
        <aside id="course-chapter-sidebar" className={`sc-sidebar ${chaptersOpen?'is-open':''}`}><div className="sc-sidebar-head"><Link className="sc-back" href={base}><ArrowLeft size={14}/>Course overview</Link><BookOpen size={14}/></div><h2>{course.name} Learning Guide</h2><label className="sc-sidebar-search"><Search size={13}/><input value={query} aria-label="Search chapter navigation" placeholder="Find a chapter…" onChange={event=>setQuery(event.target.value)}/></label><nav aria-label="Chapter navigation">{groups.map(group=><div key={group}>{filtered.some(item=>item.group===group)&&<div className="sc-sidebar-group">{group}</div>}{filtered.filter(item=>item.group===group).map(item=><Link key={item.id} href={`${base}/learn/${item.id}`} aria-current={item.id === lesson.id ? 'page' : undefined} onClick={()=>setChaptersOpen(false)}><span>{completed.includes(item.id)?<Check size={11}/>:course.lessons.indexOf(item)+1}</span>{item.title.replace(/^\d+\.\s*/, '')}{item.id===lesson.id&&<ChevronRight size={12}/>}</Link>)}</div>)}</nav>{filtered.length===0&&<p className="sc-empty">No matching chapters</p>}<div className="sc-sidebar-foot"><strong>Your progress</strong><progress value={completedCount} max={course.lessons.length} aria-label="Learning progress"/><span>{completedCount} of {course.lessons.length} chapters completed</span></div></aside>
        <main className="sc-lesson"><nav className="sc-breadcrumb" aria-label="Breadcrumb"><Link href={base}>{course.name}</Link><ChevronRight size={11}/><span>{lesson.group}</span><span className="sc-chapter-position">CHAPTER {String(index+1).padStart(2,'0')} / {course.lessons.length}</span></nav>
            <section id="overview" className="sc-card sc-lesson-banner"><div className="sc-kicker"><Sparkles size={12}/>{lesson.group}</div><h1>{lesson.title.replace(/^\d+\.\s*/, '')}</h1><nav className="sc-lesson-sections" aria-label="Lesson sections"><a href="#overview"><BookOpen size={12}/>Overview</a><a href="#lesson-example"><Code2 size={12}/>Example</a><a href="#lesson-reference"><Braces size={12}/>Reference</a><a href="#lesson-practice"><Target size={12}/>Practice</a></nav><div className="sc-overview-grid"><div className="sc-explain"><Lightbulb size={20}/><div><strong>Understand the concept</strong><p>{lesson.summary}</p></div></div><div className="sc-remember"><strong>Keep this in mind</strong><p>{lesson.remember}</p></div></div>
                <div id="lesson-example" className="sc-section-heading"><h2>Start with this example</h2><Link className="sc-primary" href={`${base}/compiler?lesson=${lesson.id}`}><Play size={13}/>Try this lesson</Link></div>
                <div className="sc-example-workspace"><div className="sc-example-tabs" role="group" aria-label="Example files"><button type="button" aria-pressed={activeFile==='html'} onClick={()=>setFile('html')}><FileCode2 size={13}/>index.html</button>{demo.css&&<button type="button" aria-pressed={activeFile==='css'} onClick={()=>setFile('css')}><Braces size={13}/>style.css</button>}<button type="button" aria-pressed={result} aria-controls="lesson-live-result" onClick={()=>setResult(value=>!value)}><Eye size={13}/>{result?'Hide result':'Show result'}</button></div><StyleCode code={activeFile==='html'?demo.html:demo.css} label={activeFile==='html'?'index.html':'style.css'}/>{result&&<div id="lesson-live-result" className="sc-example-result"><div><span/><CheckCircle2 size={12}/>Live result</div><iframe title={`${lesson.title} live example`} srcDoc={previewDocument(demo,course.id)} sandbox="allow-scripts"/></div>}</div><p className="sc-example-hint"><Lightbulb size={11}/>Open the compiler to change the code and experiment with the result.</p>
            </section>
            <section id="lesson-reference" className="sc-card"><div className="sc-reference-intro"><div><h2>Detailed explanation & examples</h2><p>Explore each property, compare values, and study the examples.</p></div><Braces size={20}/></div><div className="sc-reading">{lesson.nodes.map((node,index) => <div className="sc-reference-block" key={index}><ReadNode node={node}/></div>)}</div>
                {lesson.visual && <div className="sc-visual"><button type="button" className="sc-secondary" aria-expanded={visual} onClick={() => setVisual(value=>!value)}>{visual ? 'Hide visual examples' : 'Show visual examples'}</button>{visual && <iframe src={lesson.visual} title={`${lesson.title} visual examples`} sandbox="allow-scripts" loading="lazy" />}</div>}
            </section>
            <section id="lesson-practice" className="sc-card sc-practice-panel"><div className="sc-kicker">YOUR TURN TO CREATE</div><h2>Put it into practice.</h2><p>{lesson.practice}</p><div className="sc-actions"><Link className="sc-primary" href={`${base}/compiler?lesson=${lesson.id}`}><Code2 size={14}/>Open compiler<ArrowRight size={15}/></Link><LessonCompletion course={course.id} lesson={lesson.id}/></div></section>
            <nav className="sc-page-nav" aria-label="Previous and next chapters">{index > 0 ? <Link href={`${base}/learn/${course.lessons[index-1].id}`}><ArrowLeft size={15} />Previous chapter</Link> : <span />}{index+1 < course.lessons.length ? <Link href={`${base}/learn/${course.lessons[index+1].id}`}>Next chapter<ArrowRight size={15} /></Link> : <Link href={`${base}/tasks`}>Start practice tasks<ArrowRight size={15} /></Link>}</nav>
        </main>
    </div>;
}
