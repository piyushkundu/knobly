'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, BookOpen, Brain, Code2, Home, Keyboard, LayoutDashboard, Menu, StickyNote, Terminal, X } from 'lucide-react';
import type { StyleCourseId } from '@/lib/style-course-types';
import { CourseBackdrop, CourseMark } from './CourseArtwork';

export default function CourseShell({ course, children }: { course: StyleCourseId; children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const base = `/web-design/${course}`;
    const name = course === 'css' ? 'CSS' : 'W3.CSS';
    const links = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: `${base}/notes`, label: 'Notes', icon: StickyNote },
        { href: base, label: name, icon: Code2 },
        { href: `${base}/compiler`, label: 'Compiler', icon: Terminal },
        { href: `${base}/quiz`, label: 'MCQ', icon: Brain },
        { href: '/shortcuts', label: 'Shortcuts', icon: Keyboard },
    ];
    return <div className="style-course sc-site" data-course={course}>
        <CourseBackdrop course={course} />
        <header className="sc-topbar"><div className="sc-topbar-inner">
            <div className="sc-brand-wrap"><Link className="sc-home-back" href="/" aria-label="Back to Knobly"><ArrowLeft size={19} /></Link><Link className="sc-brand" href={base}><CourseMark course={course} className="sc-brand-mark" /><span>{name}<small>{course === 'css' ? 'Web Design' : 'CSS Framework'}</small></span></Link></div>
            <nav className={menuOpen ? 'sc-course-nav is-open' : 'sc-course-nav'} id={`course-navigation-${course}`} aria-label="Course navigation">{links.map(({href,label,icon:Icon})=><Link href={href} key={label} onClick={()=>setMenuOpen(false)}><Icon size={15}/><span>{label}</span></Link>)}</nav>
            <div className="sc-header-actions"><Link className="sc-compiler-link" href={`${base}/compiler`} aria-label={`Open ${name} web compiler`}><Terminal size={14}/><span>Web Compiler</span><i/></Link><button type="button" className="sc-menu-toggle" aria-label={menuOpen ? 'Close course menu' : 'Open course menu'} aria-expanded={menuOpen} aria-controls={`course-navigation-${course}`} onClick={()=>setMenuOpen(value=>!value)}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button></div>
        </div></header>
        {children}
        <footer className="sc-footer"><div><CourseMark course={course}/><strong>Keep learning. Keep creating.</strong><span>One concept, one experiment, one project at a time.</span></div><nav aria-label="Related courses"><Link href="/html"><BookOpen size={14}/>HTML</Link><Link href="/web-design/css">CSS</Link><Link href="/web-design/w3css">W3.CSS</Link></nav></footer>
    </div>;
}
