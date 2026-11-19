'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, BookOpen, Code2, FileText, Search, Target } from 'lucide-react';
import type { CourseSummary } from '@/lib/style-course-types';
import { useCourseProgress } from './CourseProgress';

export default function CourseHub({ course }: { course: CourseSummary }) {
    const [query, setQuery] = useState('');
    const { completed } = useCourseProgress(course.id);
    const base = `/web-design/${course.id}`;
    const count = course.lessons.filter(lesson => completed.includes(lesson.id)).length;
    const filtered = course.lessons.filter(lesson => `${lesson.title} ${lesson.group}`.toLowerCase().includes(query.toLowerCase()));
    return <main className="sc-main">
        <section className="sc-hero"><div className="sc-kicker">YOUR WEB DESIGN LEARNING PATH</div><h1>Learn <span>{course.name}</span>.<br />Bring your ideas to life.</h1><p>{course.description}</p><p className="sc-hindi">Concept samjhein, example ka output dekhein, phir khud code likhkar practice karein.</p><div className="sc-actions"><Link className="sc-primary" href={`${base}/learn/${course.lessons[0].id}`}><BookOpen size={17} />Start learning<ArrowRight size={16} /></Link><Link className="sc-secondary" href={`${base}/tasks`}><Target size={17} />Explore tasks</Link></div><div className="sc-stats"><span><b>{course.lessons.length}</b> Chapters</span><span><b>{course.exampleCount}</b> Code examples</span><span><b>{course.tasks.length}</b> Practical projects</span></div></section>
        <section className="sc-shortcuts" aria-label="Learning tools">
            <Link href={`${base}/compiler`}><Code2 size={22} /><strong>Live compiler</strong><span>HTML + CSS · Run and compare</span></Link>
            <Link href={`${base}/notes`}><FileText size={22} /><strong>Handwritten notes</strong><span>Open the course PDF</span></Link>
            <Link href={`${base}/quiz`}><Target size={22} /><strong>Quick revision</strong><span>{course.quizCount} questions with feedback</span></Link>
            <Link href={course.id === 'css' ? '/web-design/w3css' : '/web-design/css'}><BookOpen size={22} /><strong>{course.id === 'css' ? 'Learn W3.CSS next' : 'Revise CSS basics'}</strong><span>Keep building your foundation</span></Link>
        </section>
        <section className="sc-chapters"><div className="sc-section-heading"><div><div className="sc-kicker">STEP BY STEP</div><h2>Your learning path</h2><p>{count} of {course.lessons.length} chapters completed on this browser.</p></div><label className="sc-search"><Search size={17} /><input aria-label="Search course chapters" placeholder="Find a chapter…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
            <progress className="sc-progress" aria-label="Course progress" value={count} max={course.lessons.length} />
            <div className="sc-chapter-grid">{filtered.map(lesson => <Link className="sc-chapter" key={lesson.id} href={`${base}/learn/${lesson.id}`}><span className="sc-number">{completed.includes(lesson.id) ? '✓' : String(course.lessons.indexOf(lesson) + 1).padStart(2, '0')}</span><div><small>{lesson.group}</small><h3>{lesson.title.replace(/^\d+\.\s*/, '')}</h3><span>Explanation · Examples · Try it</span></div><ArrowRight size={17} /></Link>)}</div>{filtered.length === 0 && <p role="status" className="sc-empty">No chapters found. Try a topic such as border, text or display.</p>}
        </section>
        <section className="sc-card sc-next"><div><div className="sc-kicker">PUT IT INTO PRACTICE</div><h2>Ready to build something?</h2><p>Read the task, study its target output and recreate it in the compiler.</p></div><Link className="sc-primary" href={`${base}/tasks`}>View all {course.tasks.length} tasks<ArrowRight size={16} /></Link></section>
    </main>;
}
