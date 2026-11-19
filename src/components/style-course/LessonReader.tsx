'use client';
import { createElement, useState, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronDown, ChevronRight, Code2, Copy, Eye, FileCode2, Lightbulb, List, Play, Search, Sparkles, Target } from 'lucide-react';
import type { CourseNode, CourseSummary, StyleDraft, StyleLesson } from '@/lib/style-course-types';
import LessonCompletion, { useCourseProgress } from './CourseProgress';
import { previewDocument } from '@/lib/style-course-demo';
import VisualLessonLab from './VisualLessonLab';
import FoundationLesson from './FoundationLesson';
import LockedNotes from './LockedNotes';

export function sourceNodeStyle(value = ''): CSSProperties {
    const style: Record<string, string> = {};
    for (const declaration of value.split(/;(?![^()]*\))/)) {
        const split = declaration.indexOf(':');
        if (split < 0) continue;
        const name = declaration.slice(0,split).trim();
        const cssValue = declaration.slice(split+1).trim();
        if (!name || !cssValue || /expression\s*\(|javascript:|!important/i.test(cssValue)) continue;
        if (/url\s*\(/i.test(cssValue) && !/url\(["']?\/(practice-media|style-course)\//i.test(cssValue)) continue;
        const key = name.startsWith('--') ? name : name.replace(/^-ms-/, 'ms-').replace(/-([a-z])/g, (_,letter:string)=>letter.toUpperCase());
        style[key] = cssValue;
    }
    return style;
}

function sourceInteraction(event: MouseEvent<HTMLDivElement>) {
    const element = event.target as HTMLElement;
    const toggle = element.closest<HTMLElement>('[data-lesson-toggle]');
    if (toggle && event.currentTarget.contains(toggle)) {
        const panel = event.currentTarget.querySelector<HTMLElement>(`[id="${toggle.dataset.lessonToggle}"]`);
        if (panel) {
            const opening = panel.hidden || panel.classList.contains('w3-hide') || panel.style.display === 'none';
            panel.classList.remove('w3-hide');
            if (opening && panel.style.display === 'none') panel.style.display = '';
            panel.hidden = !opening;
            toggle.setAttribute('aria-expanded', String(opening));
        }
    }
    const close = element.closest<HTMLElement>('[data-lesson-close]');
    if (close && event.currentTarget.contains(close) && close.parentElement) close.parentElement.hidden = true;
}

function sourceTopics(items: CourseNode[]): { id:string; title:string }[] {
    return items.flatMap(node=>[
        ...(/^h[1-4]$/.test(node.tag || '') && node.attrs?.id ? [{id:node.attrs.id,title:nodeText(node)}] : []),
        ...sourceTopics(node.children || []),
    ]);
}
function nodeText(node: CourseNode): string {
    return node.text ?? (node.children || []).map(nodeText).join('');
}

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
    const props: Record<string, unknown> = {};
    if (node.attrs?.class) props.className = node.attrs.class;
    if (node.attrs?.style) props.style = sourceNodeStyle(node.attrs.style);
    if (node.attrs?.id) props.id = node.attrs.id;
    if (node.attrs?.tabindex) props.tabIndex = Number(node.attrs.tabindex);
    if (tag === 'img') return <Image {...props} src={node.attrs?.src || '/practice-media/study.svg'} alt={node.attrs?.alt || 'Example image'} width={240} height={160} unoptimized />;
    if (node.attrs?.colspan) props.colSpan = Number(node.attrs.colspan);
    if (node.attrs?.rowspan) props.rowSpan = Number(node.attrs.rowspan);
    if (tag === 'a') { props.href = node.attrs?.href; if (String(props.href).startsWith('https://')) { props.target='_blank'; props.rel='noopener noreferrer'; } }
    if (tag === 'button') {
        props.type = 'button';
        if (node.attrs?.['data-lesson-toggle']) { props['data-lesson-toggle']=node.attrs['data-lesson-toggle']; props['aria-controls']=node.attrs['data-lesson-toggle']; props['aria-expanded']=false; }
        if (node.attrs?.['data-lesson-close']) { props['data-lesson-close']='true'; props['aria-label']='Remove example list item'; }
    }
    const safeTag = tag === 'h1' || tag === 'h2' ? 'h3' : tag;
    if (tag === 'h1' || tag === 'h2') props['data-source-heading'] = tag;
    const tableChildren = tag === 'table' ? node.children?.map((child,index) => child.tag === 'tr' ? <tbody key={index}><ReadNode node={child} /></tbody> : <ReadNode key={index} node={child} />) : children;
    const element = createElement(safeTag, props, tableChildren);
    return tag === 'table' ? <div className="sc-table-scroll">{element}</div> : element;
}
export default function LessonReader({ course, lesson, demo, embedded=false }: { course: CourseSummary; lesson: StyleLesson; demo: StyleDraft; embedded?:boolean }) {
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
    const topics = sourceTopics(lesson.nodes);
    const sourceClass = ['cssintro.html','cssproperties.html','w3css.html'].includes(lesson.source) ? `sc-source-${lesson.source.replace('.html','')}` : '';
    const sectionId=(name:string)=>embedded?`${lesson.id}-${name}`:name;
    const Surface=embedded?'div':'main';
    const Title=embedded?'h2':'h1';
    const isFoundation=course.id==='css'&&lesson.group==='Foundations & selectors';
    return <div className={embedded?'sc-embedded-lesson':'sc-reader-layout'}>
        {!embedded&&<>
        <button type="button" className="sc-mobile-chapters" aria-expanded={chaptersOpen} aria-controls="course-chapter-sidebar" onClick={()=>setChaptersOpen(value=>!value)}><span><List size={14}/> Browse {course.lessons.length} chapters</span><ChevronDown size={16}/></button>
        <aside id="course-chapter-sidebar" className={`sc-sidebar ${chaptersOpen?'is-open':''}`}><div className="sc-sidebar-head"><Link className="sc-back" href={base}><ArrowLeft size={14}/>Course overview</Link><BookOpen size={14}/></div><h2>{course.name} Learning Guide</h2><label className="sc-sidebar-search"><Search size={13}/><input value={query} aria-label="Search chapter navigation" placeholder="Find a chapter…" onChange={event=>setQuery(event.target.value)}/></label><nav aria-label="Chapter navigation">{groups.map(group=><div key={group}>{filtered.some(item=>item.group===group)&&<div className="sc-sidebar-group">{group}</div>}{filtered.filter(item=>item.group===group).map(item=><Link key={item.id} href={`${base}/learn/${item.id}`} aria-current={item.id === lesson.id ? 'page' : undefined} onClick={()=>setChaptersOpen(false)}><span>{completed.includes(item.id)?<Check size={11}/>:course.lessons.indexOf(item)+1}</span>{item.title.replace(/^\d+\.\s*/, '')}{item.id===lesson.id&&<ChevronRight size={12}/>}</Link>)}</div>)}</nav>{filtered.length===0&&<p className="sc-empty">No matching chapters</p>}<div className="sc-sidebar-foot"><strong>Your progress</strong><progress value={completedCount} max={course.lessons.length} aria-label="Learning progress"/><span>{completedCount} of {course.lessons.length} chapters completed</span></div></aside>
        </>}
        <Surface className={embedded?'sc-lesson-chapter':'sc-lesson'}>{!embedded&&<nav className="sc-breadcrumb" aria-label="Breadcrumb"><Link href={base}>{course.name}</Link><ChevronRight size={11}/><span>{lesson.group}</span><span className="sc-chapter-position">CHAPTER {String(index+1).padStart(2,'0')} / {course.lessons.length}</span></nav>}
            <section id={sectionId('overview')} className="sc-card sc-lesson-banner"><div className="sc-kicker"><Sparkles size={12}/>{lesson.group}</div><Title className="sc-chapter-title">{lesson.title.replace(/^\d+\.\s*/, '')}</Title><nav className="sc-lesson-sections" aria-label="Lesson sections"><a href={`#${sectionId('overview')}`}><BookOpen size={12}/>Overview</a><a href={`#${sectionId('lesson-example')}`}><Code2 size={12}/>Example</a><a href={`#${sectionId('lesson-reference')}`}><Braces size={12}/>Reference</a><a href={`#${sectionId('lesson-practice')}`}><Target size={12}/>Practice</a></nav><div className="sc-overview-grid"><div className="sc-explain"><Lightbulb size={20}/><div><strong>Understand the concept</strong><p>{lesson.summary}</p></div></div><div className="sc-remember"><strong>Keep this in mind</strong><p>{lesson.remember}</p></div></div>
                <div className="sc-reading-roadmap"><span>01 · Understand</span><ArrowRight size={12}/><span>02 · See every example</span><ArrowRight size={12}/><span>03 · Try it yourself</span></div>
            </section>
            {course.id==='css'&&<FoundationLesson lesson={lesson.id}/>}
            {!isFoundation&&<div id={sectionId('lesson-visual')}><VisualLessonLab course={course.id} lesson={lesson.id}/></div>}
            {topics.length>1&&<nav className="sc-card sc-lesson-topics" aria-label="Topics in this lesson"><div><List size={17}/><h2>In this chapter</h2><span>{topics.length} topics</span></div><div>{topics.map((topic,position)=><a key={topic.id} href={`#${topic.id}`}><span>{String(position+1).padStart(2,'0')}</span>{topic.title.replace(/^\d+\.\s*/, '')}<ChevronRight size={12}/></a>)}</div></nav>}
            <section id={sectionId('lesson-reference')} className="sc-illustrated-reference"><div className="sc-reference-intro"><div><h2>Detailed explanation & examples</h2><p>Compare each visual with the code directly below it.</p></div><Braces size={20}/></div><div className={`sc-reading sc-rich-source ${sourceClass}`} onClick={sourceInteraction}>{lesson.nodes.map((node,index) => <ReadNode key={index} node={node}/>)}</div></section>
            <section id={sectionId('lesson-example')} className="sc-card"><div className="sc-section-heading"><h2>Try a complete example</h2><Link className="sc-primary" href={`${base}/compiler?lesson=${lesson.id}`}><Play size={13}/>Try this lesson</Link></div>
                <div className="sc-example-workspace"><div className="sc-example-tabs" role="group" aria-label="Example files"><button type="button" aria-pressed={activeFile==='html'} onClick={()=>setFile('html')}><FileCode2 size={13}/>index.html</button>{demo.css&&<button type="button" aria-pressed={activeFile==='css'} onClick={()=>setFile('css')}><Braces size={13}/>style.css</button>}<button type="button" aria-pressed={result} aria-controls={sectionId('lesson-live-result')} onClick={()=>setResult(value=>!value)}><Eye size={13}/>{result?'Hide result':'Show result'}</button></div><StyleCode code={activeFile==='html'?demo.html:demo.css} label={activeFile==='html'?'index.html':'style.css'}/>{result&&<div id={sectionId('lesson-live-result')} className="sc-example-result"><div><span/><CheckCircle2 size={12}/>Live result</div><iframe title={`${lesson.title} live example`} srcDoc={previewDocument(demo,course.id)} sandbox="allow-scripts"/></div>}</div><p className="sc-example-hint"><Lightbulb size={11}/>Open the compiler to change the code and experiment with the result.</p>
            </section>
            {!embedded&&<LockedNotes/>}
            <section id={sectionId('lesson-practice')} className="sc-card sc-practice-panel"><div className="sc-kicker">YOUR TURN TO CREATE</div><h2>Put it into practice.</h2><p>{lesson.practice}</p><div className="sc-actions"><Link className="sc-primary" href={`${base}/compiler?lesson=${lesson.id}`}><Code2 size={14}/>Open compiler<ArrowRight size={15}/></Link><LessonCompletion course={course.id} lesson={lesson.id}/></div></section>
            {!embedded&&<nav className="sc-page-nav" aria-label="Previous and next chapters">{index > 0 ? <Link href={`${base}/learn/${course.lessons[index-1].id}`}><ArrowLeft size={15} />Previous chapter</Link> : <span />}{index+1 < course.lessons.length ? <Link href={`${base}/learn/${course.lessons[index+1].id}`}>Next chapter<ArrowRight size={15} /></Link> : <Link href={`${base}/tasks`}>Start practice tasks<ArrowRight size={15} /></Link>}</nav>}
        </Surface>
    </div>;
}
