'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Award, BookOpen, Braces, Check, CheckCircle2, ChevronRight, Code2, Compass, FileText, Globe2, Layers, Lightbulb, Play, Search, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { CourseSummary } from '@/lib/style-course-types';
import { useCourseProgress } from './CourseProgress';
import CourseArtwork from './CourseArtwork';

export default function CourseHub({ course }: { course: CourseSummary }) {
    const [query, setQuery] = useState('');
    const [group, setGroup] = useState('All chapters');
    const { completed } = useCourseProgress(course.id);
    const base = `/web-design/${course.id}`;
    const count = course.lessons.filter(lesson => completed.includes(lesson.id)).length;
    const nextLesson = course.lessons.find(lesson=>!completed.includes(lesson.id)) || course.lessons[0];
    const isCss = course.id === 'css';
    const foundation = isCss ? course.lessons.filter(lesson=>lesson.group==='Foundations & selectors') : course.lessons.slice(0,3);
    const reference = isCss ? course.lessons.filter(lesson=>lesson.group==='Properties & layout') : course.lessons.slice(3).filter(lesson=>lesson.group!=='More practice');
    const progress = (lessons: typeof course.lessons) => lessons.filter(lesson=>completed.includes(lesson.id)).length;
    const groups = ['All chapters', ...new Set(course.lessons.map(lesson=>lesson.group))];
    const filtered = course.lessons.filter(lesson => (group==='All chapters'||lesson.group===group) && `${lesson.title} ${lesson.group}`.toLowerCase().includes(query.toLowerCase()));
    const stages = [
        { title: isCss ? 'CSS Foundations' : 'Framework Basics', detail: `${progress(foundation)}/${foundation.length} chapters`, icon: BookOpen, href: `${base}/learn/${foundation[0].id}`, done: progress(foundation)===foundation.length, current: progress(foundation)<foundation.length, color:'blue' },
        { title: isCss ? 'Properties & Layout' : 'Classes & Components', detail: `${progress(reference)}/${reference.length} chapters`, icon: isCss ? Braces : Layers, href:`${base}/learn/${reference[0].id}`, done:progress(reference)===reference.length, current:progress(foundation)===foundation.length&&progress(reference)<reference.length, color:'violet' },
        { title: 'Practice Projects', detail: `${course.tasks.length} hands-on tasks`, icon: Target, href:`${base}/tasks`, done:false, current:false, color:'green' },
        { title: 'Handwritten Notes', detail:'Read & revise', icon: FileText, href:`${base}/notes`, done:false, current:false, color:'pink' },
    ];
    return <main className="sc-main sc-course-home">
        <section className="sc-hero sc-premium-hero">
            <CourseArtwork course={course.id}/>
            <div className="sc-hero-content"><div className="sc-hero-badges"><span><Sparkles size={13}/>Complete Course</span><span><TrendingUp size={13}/>Beginner Friendly</span></div>
                <h1>Learn <span className="sc-gradient-title">{course.name}<svg viewBox="0 0 220 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 6Q55 0 110 6T218 6"/></svg></span><small>{isCss ? 'Web Styling & Design' : 'Responsive Web Design'}</small></h1>
                <p>{isCss ? 'Turn simple HTML into beautiful websites. Master selectors, colours, layouts and responsive design with visual examples and projects you can build yourself.' : 'Build beautiful, responsive websites with simple classes. Learn colours, cards, tables and layouts through visual examples and real projects.'}</p>
                <div className="sc-actions"><Link className="sc-primary sc-hero-start" href={`${base}/learn/${nextLesson.id}`}><Play size={17} fill="currentColor"/>{count>0 ? 'Continue Learning' : isCss ? 'Start: CSS Foundations' : 'Start: W3.CSS Basics'}</Link><a className="sc-secondary sc-hero-explore" href="#course-modules"><Compass size={18}/>Explore Modules</a></div>
                <div className="sc-hero-proof"><span><CheckCircle2 size={14}/>{course.lessons.length} guided chapters</span><span><Code2 size={14}/>{course.exampleCount} code examples</span><span><Target size={14}/>{course.tasks.length} real projects</span></div>
            </div>
        </section>
        <section className="sc-learning-path" aria-labelledby="learning-path-title"><div className="sc-premium-heading"><div className="sc-heading-icon"><Globe2 size={24}/></div><div><h2 id="learning-path-title">Your Learning Path</h2><p>Follow the trail to master {course.name}</p></div><div className="sc-path-legend"><span><i className="is-complete"/>Completed</span><span><i className="is-current"/>Start Here</span><span><i/>Next Modules</span></div></div>
            <div className="sc-timeline">{stages.map(({title,detail,icon:Icon,href,done,current,color},index)=><Link className={`sc-path-stop ${done?'is-complete':current?'is-current':''}`} href={href} key={title} aria-label={`${title}: ${detail}`}><div className={`sc-path-node sc-tone-${color}`}>{done?<CheckCircle2 size={27}/>:<Icon size={27}/>}<span>{done?<Check size={10}/>:index+1}</span></div><strong>{title}</strong><small>{done?'Completed':detail}</small></Link>)}</div>
        </section>
        <section id="course-modules" className="sc-modules" aria-labelledby="module-heading"><div className="sc-premium-heading"><div className="sc-heading-icon"><BookOpen size={22}/></div><div><h2 id="module-heading">{course.name} Modules</h2><p>Your complete toolkit — from first concepts to finished projects</p></div><span className="sc-section-pill"><Sparkles size={12}/>Learn at your pace</span></div>
            <div className="sc-module-grid">{stages.map(({title,detail,icon:Icon,href,done,current,color},index)=><article className={`sc-module-card sc-tone-${color}`} key={title}><div className="sc-module-top"><div className="sc-module-icon"><Icon size={27}/></div><span>{done?'Completed':current?'Start Here':index===2?`${course.tasks.length} Projects`:'Available Now'}</span></div><small className="sc-module-order">MODULE 0{index+1}</small><h3>{title}</h3><p>{index===0 ? isCss?'Understand CSS syntax, selectors, the cascade and ways to style your HTML.':'Understand the framework and learn how to add W3.CSS to your web pages.' : index===1 ? isCss?'Explore borders, spacing, typography, positioning and flexible layouts.':'Discover ready-made classes for colours, borders, tables, panels and images.' : index===2 ? 'Recreate target designs in the live compiler. Write, run and compare your work.' : 'Keep the handwritten course PDF close by for study and quick revision.'}</p><div className="sc-module-meta"><span>{index<2?<BookOpen size={13}/>:index===2?<Target size={13}/>:<FileText size={13}/>} {detail}</span><span>{index<2?'Guided lessons':index===2?'Live compiler':'PDF collection'}</span></div><Link href={href} className="sc-module-action">{done?'Revise Module':index===2?'Start Practising':index===3?'Open Notes':'Explore Module'}<ArrowRight size={16}/></Link></article>)}</div>
        </section>
        <section id="chapter-library" className="sc-chapters" aria-labelledby="chapter-library-heading"><div className="sc-premium-heading"><div className="sc-heading-icon"><Layers size={22}/></div><div><h2 id="chapter-library-heading">Explore Every Chapter</h2><p>Pick a topic, try an example, and make it your own.</p></div><label className="sc-search"><Search size={17}/><input aria-label="Search course chapters" placeholder="Search a chapter…" value={query} onChange={event=>setQuery(event.target.value)}/></label></div>
            <div className="sc-library-toolbar"><div className="sc-group-tabs" role="group" aria-label="Chapter categories">{groups.map(item=><button type="button" key={item} aria-pressed={group===item} onClick={()=>setGroup(item)}>{item}<span>{item==='All chapters'?course.lessons.length:course.lessons.filter(lesson=>lesson.group===item).length}</span></button>)}</div><span className="sc-completion-label"><CheckCircle2 size={14}/>{count}/{course.lessons.length} completed</span></div>
            <progress className="sc-progress" aria-label="Course progress" value={count} max={course.lessons.length}/><div className="sc-chapter-grid">{filtered.map(lesson=><Link className={`sc-chapter ${completed.includes(lesson.id)?'is-complete':''}`} key={lesson.id} href={`${base}/learn/${lesson.id}`}><span className="sc-number">{completed.includes(lesson.id)?<Check size={18}/>:String(course.lessons.indexOf(lesson)+1).padStart(2,'0')}</span><div><small>{lesson.group}</small><h3>{lesson.title.replace(/^\d+\.\s*/,'')}</h3><span>Understand <i/> Experiment <i/> Build</span></div><ChevronRight size={17}/></Link>)}</div>{filtered.length===0&&<div className="sc-empty" role="status"><Search size={27}/><strong>No chapters found</strong><p>Try a topic such as borders, text or display.</p><button className="sc-secondary" onClick={()=>{setQuery('');setGroup('All chapters');}}>Show all chapters</button></div>}
        </section>
        <section className="sc-course-features" aria-label="How you learn"><div><span className="sc-feature-icon"><Lightbulb size={25}/></span><h3>See the difference</h3><p>Read clear explanations and see how the CSS changes the output.</p></div><div><span className="sc-feature-icon"><Code2 size={25}/></span><h3>Make it your own</h3><p>Experiment in the HTML + CSS compiler with editing help in Practice mode.</p></div><div><span className="sc-feature-icon"><Award size={25}/></span><h3>Build your confidence</h3><p>Revise with {course.quizCount} questions and put your learning into a complete project.</p></div></section>
        <section className="sc-course-cta"><div className="sc-cta-orb"/><div><span><Sparkles size={14}/>YOUR NEXT GREAT DESIGN STARTS HERE</span><h2>Build your next<br/>beautiful website.</h2><p>Open the compiler, try an idea, and see what you can build.</p></div><div className="sc-cta-actions"><Link className="sc-primary" href={`${base}/compiler`}><Code2 size={18}/>Open Live Compiler<ArrowRight size={17}/></Link><Link href={`${base}/quiz`}>Test your knowledge<ArrowRight size={14}/></Link></div></section>
    </main>;
}
