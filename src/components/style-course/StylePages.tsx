import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpen, Code2, Target } from 'lucide-react';
import { courseSummary, getStyleCourse } from '@/lib/style-courses';
import { lessonDraft } from '@/lib/style-course-demo';
import type { StyleCourseId } from '@/lib/style-course-types';
import CourseShell from './CourseShell';
import CourseHub from './CourseHub';
import CourseReader from './CourseReader';
import LockedNotes from './LockedNotes';
import CourseQuiz from './CourseQuiz';
import StylePlayground from './StylePlayground';

export function StyleHome({ id }: { id: StyleCourseId }) {
    return <CourseShell course={id}><CourseHub course={courseSummary(id)} /></CourseShell>;
}
export function StyleLessonPage({ id, slug }: { id: StyleCourseId; slug: string }) {
    const course = getStyleCourse(id), lesson = course.lessons.find(item => item.id === slug);
    if (!lesson) notFound();
    return <CourseShell course={id}><CourseReader key={id} course={courseSummary(id)} initialId={slug} chapters={course.lessons.map(item=>({lesson:item,demo:lessonDraft(id,item)}))}/></CourseShell>;
}
export function StyleTasksPage({ id }: { id: StyleCourseId }) {
    const course = getStyleCourse(id), base = `/web-design/${id}`;
    return <CourseShell course={id}><main className="sc-main"><section className="sc-hero sc-small-hero"><div className="sc-kicker">LEARN BY BUILDING</div><h1>{course.name} practice tasks</h1><p>Study the target, follow the checklist and recreate each design. Practice mode offers editing help; Exam mode lets you work independently.</p><Link className="sc-secondary" href={base}><BookOpen size={16} />Back to lessons</Link></section>
        <div className="sc-task-grid">{course.tasks.map((task,index) => <article className="sc-card sc-task-card" key={task.id}><span className="sc-number">{index+1}</span><h2>{task.title}</h2><p>{task.subtitle}</p><div className="sc-tags">{task.skills.map(skill=><code key={skill}>{skill}</code>)}</div><ol>{task.steps.map(step=><li key={step}>{step}</li>)}</ol><div className="sc-actions"><Link className="sc-secondary" href={`${base}/tasks/${task.id}`}>View task<Target size={14} /></Link><Link className="sc-primary" href={`${base}/tasks/${task.id}/compiler`}>Start coding<Code2 size={14} /></Link></div></article>)}</div>
    </main></CourseShell>;
}
export function StyleTaskPage({ id, taskId }: { id: StyleCourseId; taskId: string }) {
    const course = getStyleCourse(id), task = course.tasks.find(item=>item.id===taskId);
    if (!task) notFound();
    const base = `/web-design/${id}`;
    return <CourseShell course={id}><main className="sc-main"><section className="sc-card"><div className="sc-kicker">{course.name} PRACTICAL PROJECT</div><h1>{task.title}</h1><p>{task.subtitle}</p>{task.note && <div className="sc-remember"><strong>Practice focus</strong><p>{task.note}</p></div>}<h2>Your checklist</h2><ol>{task.steps.map(step=><li key={step}>{step}</li>)}</ol><div className="sc-tags">{task.skills.map(skill=><code key={skill}>{skill}</code>)}</div><div className="sc-actions"><Link className="sc-primary" href={`${base}/tasks/${task.id}/compiler`}>Start in compiler<ArrowRight size={16} /></Link><Link className="sc-secondary" href={`${base}/learn/${task.lesson}`}>Revise related lesson<BookOpen size={15} /></Link><Link className="sc-secondary" href={`${base}/tasks`}>All tasks</Link></div></section><section className="sc-card"><h2>Target output</h2><p>Recreate this reference. Move your pointer over it to check hover effects.</p><iframe className="sc-target" src={task.target} title={`${task.title} target output`} sandbox="allow-scripts" /></section></main></CourseShell>;
}
export function StyleNotesPage({ id }: { id: StyleCourseId }) {
    const course = getStyleCourse(id);
    return <CourseShell course={id}><main className="sc-main"><div className="sc-kicker">{course.name} STUDY MATERIAL</div><LockedNotes full/><div className="sc-actions"><Link className="sc-primary" href={`/web-design/${id}/learn/${course.lessons[0].id}`}><BookOpen size={16}/>Continue with illustrated lessons</Link><Link className="sc-secondary" href={`/web-design/${id}`}>Course overview</Link></div></main></CourseShell>;
}
export function StyleQuizPage({ id }: { id: StyleCourseId }) {
    const course = getStyleCourse(id);
    return <CourseShell course={id}><CourseQuiz course={id} questions={course.quiz} /></CourseShell>;
}
export function StyleCompilerPage({ id, taskId, lessonId }: { id: StyleCourseId; taskId?: string; lessonId?: string }) {
    const course = getStyleCourse(id), task = taskId ? course.tasks.find(item=>item.id===taskId) : undefined;
    const lesson = lessonId ? course.lessons.find(item=>item.id===lessonId) : undefined;
    if ((taskId && !task) || (lessonId && !lesson)) notFound();
    const first = course.lessons[0];
    return <StylePlayground key={`${id}:${taskId || lessonId || 'playground'}`} course={id} title={task?.title || lesson?.title || `${course.name} playground`} draftId={taskId || lessonId || 'playground'} initial={task?.starter || lessonDraft(id, lesson || first)} task={task} backHref={task ? `/web-design/${id}/tasks/${task.id}` : lesson ? `/web-design/${id}/learn/${lesson.id}` : `/web-design/${id}`} />;
}
