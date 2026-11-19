import Link from 'next/link';
import { BookOpen, Code2, Home, Layers } from 'lucide-react';
import type { StyleCourseId } from '@/lib/style-course-types';

export default function CourseShell({ course, children }: { course: StyleCourseId; children: React.ReactNode }) {
    const base = `/web-design/${course}`;
    return <div className="style-course" data-course={course}>
        <header className="sc-topbar"><Link className="sc-brand" href={base}><span className="sc-logo">{course === 'css' ? <Code2 size={21} /> : <Layers size={21} />}</span><span>{course === 'css' ? 'CSS' : 'W3.CSS'} Learning Studio<small>NIELIT O-Level · Learn, try, build</small></span></Link>
            <nav aria-label="Course navigation"><Link href="/" aria-label="Knobly home"><Home size={16} /></Link><Link href="/html">HTML</Link><Link href="/web-design/css">CSS</Link><Link href="/web-design/w3css">W3.CSS</Link><Link href={`${base}/tasks`}>Tasks</Link><Link href={`${base}/compiler`}><Code2 size={14} />Compiler</Link></nav>
        </header>
        {children}
        <footer className="sc-footer"><BookOpen size={14} /> Knobly Web · Understand the concept. Change the code. Build it yourself.</footer>
    </div>;
}
