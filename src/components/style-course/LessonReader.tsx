'use client';
import { createElement, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check, Copy, Lightbulb, Play } from 'lucide-react';
import type { CourseNode, CourseSummary, StyleDraft, StyleLesson } from '@/lib/style-course-types';
import LessonCompletion from './CourseProgress';

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
    const base = `/web-design/${course.id}`;
    const index = course.lessons.findIndex(item => item.id === lesson.id);
    return <div className="sc-reader-layout">
        <aside className="sc-sidebar"><Link className="sc-back" href={base}><ArrowLeft size={15} />Course overview</Link><h2>{course.name} chapters</h2><nav aria-label="Chapter navigation">{course.lessons.map((item, i) => <Link key={item.id} href={`${base}/learn/${item.id}`} aria-current={item.id === lesson.id ? 'page' : undefined}><span>{i+1}</span>{item.title.replace(/^\d+\.\s*/, '')}</Link>)}</nav></aside>
        <main className="sc-lesson"><nav className="sc-breadcrumb"><Link href={base}>{course.name}</Link><span>/</span><span>Chapter {index+1} of {course.lessons.length}</span></nav>
            <section className="sc-card"><div className="sc-kicker">{lesson.group}</div><h1>{lesson.title.replace(/^\d+\.\s*/, '')}</h1><div className="sc-explain"><Lightbulb size={20} /><div><strong>Easy explanation</strong><p>{lesson.summary}</p></div></div><div className="sc-remember"><strong>Remember</strong><p>{lesson.remember}</p></div>
                <div className="sc-section-heading"><h2>Start with this example</h2><Link className="sc-primary" href={`${base}/compiler?lesson=${lesson.id}`}><Play size={14} />Try this lesson</Link></div>
                <StyleCode code={demo.html} label="index.html" />{demo.css && <StyleCode code={demo.css} label="style.css" />}
            </section>
            <section className="sc-card"><h2>Detailed explanation & examples</h2><div className="sc-reading">{lesson.nodes.map((node,index) => <ReadNode key={index} node={node} />)}</div>
                {lesson.visual && <div className="sc-visual"><button type="button" className="sc-secondary" aria-expanded={visual} onClick={() => setVisual(value=>!value)}>{visual ? 'Hide visual examples' : 'Show visual examples'}</button>{visual && <iframe src={lesson.visual} title={`${lesson.title} visual examples`} sandbox="allow-scripts" loading="lazy" />}</div>}
            </section>
            <section className="sc-card"><div className="sc-kicker">YOUR TURN</div><h2>Try it yourself</h2><p>{lesson.practice}</p><div className="sc-actions"><Link className="sc-primary" href={`${base}/compiler?lesson=${lesson.id}`}>Open compiler<ArrowRight size={15} /></Link><LessonCompletion course={course.id} lesson={lesson.id} /></div></section>
            <nav className="sc-page-nav" aria-label="Previous and next chapters">{index > 0 ? <Link href={`${base}/learn/${course.lessons[index-1].id}`}><ArrowLeft size={15} />Previous chapter</Link> : <span />}{index+1 < course.lessons.length ? <Link href={`${base}/learn/${course.lessons[index+1].id}`}>Next chapter<ArrowRight size={15} /></Link> : <Link href={`${base}/tasks`}>Start practice tasks<ArrowRight size={15} /></Link>}</nav>
        </main>
    </div>;
}
