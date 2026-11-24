import Link from 'next/link';
import { ArrowRight, Code2, LockKeyhole, Target } from 'lucide-react';
import type { CourseSummary } from '@/lib/style-course-types';

export default function LessonTaskCard({ course, task }: { course: string; task: CourseSummary['tasks'][number] }) {
    const href = `/web-design/${course}/tasks/${task.id}`;
    const displayPractice = task.skills.includes('display: inline-block');
    return <section id={`lesson-task-${task.id}`} className="sc-card sc-inline-task" aria-label={task.title + ' practice task'}>
        <div className="sc-inline-task-art" aria-hidden="true">{(displayPractice ? ['Block', 'Inline', 'Inline-block'] : ['HTML', 'CSS', 'JS']).map(label => <div key={label}><span>{label}</span></div>)}</div>
        <div className="sc-inline-task-copy"><div className="sc-kicker"><Target size={13}/>YOUR NEXT CHALLENGE</div><h3>{task.title}</h3><p>{task.subtitle}</p>{task.inlineDescription && <p className="sc-inline-task-hindi">{task.inlineDescription}</p>}<div className="sc-tags">{task.skills.slice(0, 6).map(skill => <code key={skill}>{skill}</code>)}</div>
            <div className="sc-actions"><Link className="sc-primary" href={href}>View task & start<ArrowRight size={15}/></Link><Link className="sc-secondary" href={href + '/compiler'}><Code2 size={14}/>Task compiler</Link></div><small className="sc-inline-task-access"><LockKeyhole size={12}/>Instructor-controlled, like the other CSS tasks.</small>
        </div>
    </section>;
}
