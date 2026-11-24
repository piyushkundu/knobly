'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Code2, FileCode, Home, ListChecks, Maximize2, X } from 'lucide-react';
import TaskFullscreenPreview from '@/components/html/TaskFullscreenPreview';
import type { StyleCourseId, StyleTask } from '@/lib/style-course-types';

export default function StyleTaskView({ course, task, previous, next }: {
    course: StyleCourseId;
    task: Pick<StyleTask, 'id' | 'title' | 'subtitle' | 'target' | 'steps' | 'skills' | 'lesson'>;
    previous?: string;
    next?: string;
}) {
    const [instructions, setInstructions] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const base = `/web-design/${course}`;
    const compiler = `${base}/tasks/${task.id}/compiler`;
    return <main className="sc-task-reference">
        <header className="sc-task-reference-header">
            <Link href={`${base}/tasks`} aria-label="Back to tasks" className="sc-studio-icon"><ArrowLeft size={19}/></Link>
            <span className="sc-studio-mark"><FileCode size={18}/></span>
            <div className="sc-studio-title"><h1>{task.title}</h1><small>Target website · Look at the design and build it yourself</small></div>
            <div className="sc-studio-actions">
                <button className="sc-studio-button" onClick={()=>setInstructions(value=>!value)} aria-expanded={instructions} aria-controls="task-instructions"><ListChecks size={15}/><span>Instructions</span></button>
                <button className="sc-studio-button" onClick={()=>setFullscreen(true)} aria-label="Open target fullscreen"><Maximize2 size={15}/></button>
                {previous&&<Link className="sc-studio-icon sc-task-neighbour" href={`${base}/tasks/${previous}`} aria-label="Previous task"><ChevronLeft size={17}/></Link>}
                {next&&<Link className="sc-studio-icon sc-task-neighbour" href={`${base}/tasks/${next}`} aria-label="Next task"><ChevronRight size={17}/></Link>}
                <Link className="sc-studio-run" href={compiler}><Code2 size={15}/><span>Start in Compiler</span></Link>
                <Link className="sc-studio-icon sc-task-neighbour" href={base} aria-label="Course home"><Home size={17}/></Link>
            </div>
        </header>
        <div className="sc-task-reference-body">
            <iframe src={task.target} title={`${task.title} target website`} sandbox="allow-scripts" className="sc-task-reference-frame"/>
            {instructions&&<aside className="sc-task-instructions" id="task-instructions" aria-label="Task instructions"><header><h2>Build this website</h2><button className="sc-studio-icon" aria-label="Close instructions" onClick={()=>setInstructions(false)}><X size={17}/></button></header><p>{task.subtitle}</p><ol>{task.steps.map(step=><li key={step}>{step}</li>)}</ol><div className="sc-task-skill-list">{task.skills.map(skill=><code key={skill}>{skill}</code>)}</div><Link href={`${base}/learn/${task.lesson}`} className="sc-studio-button">Revise related lesson</Link></aside>}
        </div>
        <Link href={compiler} className="sc-task-start"><Code2 size={17}/>Start Project in Compiler<ChevronRight size={16}/></Link>
        {fullscreen&&<TaskFullscreenPreview mode="target" targetSrc={task.target} previewHtml="" previewKey={0} sandbox="allow-scripts" onClose={()=>setFullscreen(false)}/>}
    </main>;
}
