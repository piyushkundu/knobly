'use client';

import Link from 'next/link';
import { ArrowLeft, Home, BookOpen, Download, ExternalLink, PenLine, LayoutDashboard, Code2, Brain, FileText } from 'lucide-react';

const quickLinks = [
    { label: 'Home', href: '/', icon: <Home size={13} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={13} /> },
    { label: 'Python', href: '/python', icon: <Code2 size={13} /> },
    { label: 'MCQ', href: '/mcq', icon: <Brain size={13} /> },
];

const chapters = [
    { id: 1, title: 'Introduction to Programming', desc: 'Programming fundamentals, problem-solving approaches, और computational thinking सीखें।', pages: 24, link: '/python-notes/chapter1.pdf', color: '#3b82f6' },
    { id: 3, title: 'Introduction to Python', desc: 'Python basics, syntax, variables, data types, और basic operations।', pages: 28, link: '/python-notes/chapter3.pdf', color: '#8b5cf6' },
    { id: 4, title: 'Operators, Expressions & Statements', desc: 'Python operators, expressions, conditional statements, loops, और control structures।', pages: 36, link: '/python-notes/chapter4.pdf', color: '#10b981' },
    { id: 5, title: 'Sequence Data Types — List', desc: 'Lists, list methods, slicing, indexing, और list comprehensions।', pages: 12, link: '/python-notes/chapter5.pdf', color: '#f97316' },
    { id: 6, title: 'Sequence Data Types — Tuple', desc: 'Tuples, tuple operations, packing/unpacking, और immutability।', pages: 6, link: '/python-notes/chapter6.pdf', color: '#ec4899' },
    { id: 7, title: 'Sequence Data Types — Dictionary', desc: 'Dictionaries, key-value pairs, methods, और dictionary comprehensions।', pages: 9, link: '/python-notes/chapter7.pdf', color: '#06b6d4' },
    { id: 8, title: 'Library Functions', desc: 'Built-in functions, math module, string functions, और random module।', pages: 30, link: '/python-notes/chapter8.pdf', color: '#ef4444' },
    { id: 9, title: 'User Defined Functions', desc: 'Function creation, arguments, return values, scope, और recursion।', pages: 26, link: '/python-notes/chapter9.pdf', color: '#f59e0b' },
    { id: 10, title: 'File Processing in Python', desc: 'File handling, read/write operations, और different file formats।', pages: 26, link: '/python-notes/chapter10.pdf', color: '#6366f1' },
    { id: 11, title: 'Modules in Python', desc: 'Importing modules, custom modules, और standard libraries।', pages: 22, link: '/python-notes/chapter11.pdf', color: '#14b8a6' },
    { id: 12, title: 'NumPy Basics', desc: 'NumPy arrays, mathematical operations, और data analysis।', pages: 34, link: '/python-notes/chapter12.pdf', color: '#a855f7' },
];

const totalPages = chapters.reduce((sum, ch) => sum + ch.pages, 0);

export default function HandwrittenNotesPage() {
    return (
        <div style={{ background: '#f8fafc' }} className="min-h-screen">
            {/* ── Top Bar ── */}
            <header className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e2e8f0' }}>
                <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/python" className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                            <ArrowLeft size={16} style={{ color: '#64748b' }} />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-sm font-bold" style={{ color: '#0f172a' }}>Python Handwritten Notes</h1>
                            <div className="flex items-center gap-1.5">
                                <PenLine size={8} style={{ color: '#f59e0b' }} />
                                <span className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: '#f59e0b' }}>O-Level M3-R5</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {quickLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:bg-gray-100"
                                style={{ color: '#64748b' }}>
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #f59e0b, #8b5cf6, #3b82f6, #10b981)' }} />
            </header>

            {/* ── Hero Banner ── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 30%, #533483 60%, #e94560 100%)' }}>
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 md:py-14 flex items-center gap-8">
                    <div className="hidden md:block w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl" style={{ border: '3px solid rgba(255,255,255,0.15)' }}>
                        <img src="/images/python_notes.png" alt="Python Notes" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <PenLine size={14} style={{ color: '#fbbf24' }} />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: '#fbbf24' }}>Handwritten Notes</span>
                        </div>
                        <h2 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
                            Python Programming Notes
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '32rem', marginBottom: '1rem' }}>
                            O-Level M3-R5 complete chapter-wise handwritten PDF notes — exam preparation ke liye best material। Free download करें!
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: `${chapters.length} Chapters`, icon: '📖' },
                                { label: `${totalPages}+ Pages`, icon: '📄' },
                                { label: 'Free PDF', icon: '📥' },
                                { label: 'Hindi + English', icon: '🇮🇳' },
                            ].map((s, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.1)', color: '#fde68a', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    {s.icon} {s.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Chapter Cards ── */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: '#8b5cf6' }}>All Chapters</span>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {chapters.map((ch) => (
                        <div key={ch.id} className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                            <div className="h-1.5" style={{ background: ch.color }} />
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full" style={{ background: `${ch.color}12`, color: ch.color, border: `1px solid ${ch.color}25` }}>
                                        Chapter {ch.id}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <FileText size={12} style={{ color: '#94a3b8' }} />
                                        <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>{ch.pages} pages</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold mb-2" style={{ color: '#0f172a' }}>{ch.title}</h3>

                                {/* Description */}
                                <p className="text-xs leading-relaxed mb-4" style={{ color: '#64748b' }}>{ch.desc}</p>

                                {/* Download button */}
                                <a href={ch.link} target="_blank" rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
                                    style={{ background: ch.color }}>
                                    <Download size={14} />
                                    Download PDF
                                    <ExternalLink size={12} style={{ opacity: 0.6 }} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-center py-8">
                    <p className="text-sm font-semibold" style={{ color: '#475569' }}>✍️ All notes are handwritten for easy understanding</p>
                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>© 2025 Knobly Web | O-Level Python M3-R5</p>
                </div>
            </main>
        </div>
    );
}
