'use client';

import Link from 'next/link';
import { ArrowLeft, Home, BookOpen, Code2, GitBranch, FunctionSquare, FileText, BarChart3, List, Circle, ChevronRight, Sparkles, GraduationCap, Zap, LayoutDashboard, StickyNote, Brain, Keyboard, PenLine } from 'lucide-react';

const quickLinks = [
    { label: 'Home', href: '/', icon: <Home size={13} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={13} /> },
    { label: 'Notes', href: '/notes', icon: <StickyNote size={13} /> },
    { label: 'Python', href: '/python', icon: <Code2 size={13} /> },
    { label: 'MCQ', href: '/mcq', icon: <Brain size={13} /> },
    { label: 'Shortcuts', href: '/shortcuts', icon: <Keyboard size={13} /> },
];

const pythonTopics = [
    {
        title: 'Fundamentals',
        href: '/python/fundamentals',
        icon: <Code2 size={22} style={{ color: '#facc15' }} />,
        gradient: 'linear-gradient(135deg, #854d0e, #a16207, #ca8a04)',
        border: '#eab308',
        glow: 'rgba(234,179,8,0.15)',
        desc: 'Variables, data types, operators, I/O, and basic Python concepts',
        chapter: 1,
    },
    {
        title: 'Control Statements',
        href: '/python/control-statements',
        icon: <GitBranch size={22} style={{ color: '#60a5fa' }} />,
        gradient: 'linear-gradient(135deg, #1e3a5f, #1e40af, #2563eb)',
        border: '#3b82f6',
        glow: 'rgba(59,130,246,0.15)',
        desc: 'if-else, loops (for, while), break, continue, and pattern programs',
        chapter: 2,
    },
    {
        title: 'Lists',
        href: '/python/lists',
        icon: <List size={22} style={{ color: '#fdba74' }} />,
        gradient: 'linear-gradient(135deg, #7c2d12, #c2410c, #ea580c)',
        border: '#f97316',
        glow: 'rgba(249,115,22,0.15)',
        desc: 'List operations, methods, slicing, comprehensions, and nested lists',
        chapter: 3,
    },
    {
        title: 'Tuples',
        href: '/python/tuples',
        icon: <Circle size={22} style={{ color: '#f9a8d4' }} />,
        gradient: 'linear-gradient(135deg, #831843, #be185d, #db2777)',
        border: '#ec4899',
        glow: 'rgba(236,72,153,0.15)',
        desc: 'Tuple creation, operations, packing/unpacking, and immutability',
        chapter: 4,
    },
    {
        title: 'File Handling',
        href: '/python/file-handling',
        icon: <FileText size={22} style={{ color: '#6ee7b7' }} />,
        gradient: 'linear-gradient(135deg, #064e3b, #047857, #059669)',
        border: '#10b981',
        glow: 'rgba(16,185,129,0.15)',
        desc: 'Reading, writing, appending files and working with CSV data',
        chapter: 5,
    },
    {
        title: 'NumPy',
        href: '/python/numpy',
        icon: <BarChart3 size={22} style={{ color: '#67e8f9' }} />,
        gradient: 'linear-gradient(135deg, #164e63, #0e7490, #0891b2)',
        border: '#06b6d4',
        glow: 'rgba(6,182,212,0.15)',
        desc: 'Arrays, operations, broadcasting, statistics, and linear algebra',
        chapter: 6,
    },
];

export default function PythonPage() {
    return (
        <div className="wallpaper-default min-h-screen overflow-y-auto">
            {/* ── Premium Top Bar ── */}
            <header className="sticky top-0 z-20" style={{ background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
                <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <ArrowLeft size={16} style={{ color: '#94a3b8' }} />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold truncate" style={{ color: '#f1f5f9', fontFamily: 'var(--font-gaming)' }}>PYTHON</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {quickLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                                style={{ color: '#94a3b8', background: 'transparent' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                        <Link href="/" className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Home size={16} style={{ color: '#94a3b8' }} />
                        </Link>
                    </div>
                </div>
                <div className="h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #6366f1 20%, #a855f7 50%, #ec4899 80%, transparent 100%)' }} />
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">

                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden rounded-3xl mb-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)' }}>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #e94560 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
                    <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #533483 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
                    <div className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #facc15 0%, transparent 70%)' }} />

                    {/* Python logo pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

                    <div className="relative z-10 p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} style={{ color: '#facc15' }} />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: '#fde68a' }}>Complete Course</span>
                        </div>
                        <h2 id="python-programming" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: '#ffffff' }}>
                            Python Programming
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed max-w-xl mb-6" style={{ color: '#e2e8f0' }}>
                            Master Python from fundamentals to advanced concepts — a complete journey through one of the world&#39;s most popular programming languages.
                        </p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-4">
                            {[
                                { icon: <BookOpen size={14} />, label: '6 Chapters', color: '#93c5fd' },
                                { icon: <GraduationCap size={14} />, label: 'Beginner Friendly', color: '#86efac' },
                                { icon: <Zap size={14} />, label: 'Practice Questions', color: '#fde68a' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ color: stat.color }}>{stat.icon}</span>
                                    <span className="text-xs font-medium" style={{ color: stat.color }}>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Chapter label ── */}
                <div className="flex items-center gap-3 mb-4 px-1">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: '#a78bfa' }}>Chapters</span>
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />
                </div>

                {/* ── Topic Cards Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pythonTopics.map((topic) => (
                        <Link key={topic.href} href={topic.href}
                            className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: topic.gradient, border: `1px solid ${topic.border}30`, boxShadow: `0 4px 20px ${topic.glow}` }}>

                            <div className="p-5">
                                {/* Chapter badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        Ch. {topic.chapter}
                                    </span>
                                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" style={{ color: 'rgba(255,255,255,0.3)' }} />
                                </div>

                                {/* Icon + Title */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {topic.icon}
                                    </div>
                                    <h3 id="topictitle" className="text-base font-bold" style={{ color: '#ffffff' }}>{topic.title}</h3>
                                </div>

                                {/* Description */}
                                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{topic.desc}</p>

                                {/* Bottom hover indicator */}
                                <div className="mt-4 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    <div className="h-full w-0 group-hover:w-full transition-all duration-500 rounded-full" style={{ background: `linear-gradient(90deg, ${topic.border}, transparent)` }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ═══ HANDWRITTEN NOTES — Single Card ═══ */}
                <Link href="/python/handwritten-notes" className="group block mt-8 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 40%, #533483 100%)', boxShadow: '0 4px 24px rgba(83,52,131,0.25)' }}>
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)', transform: 'translate(20%, -30%)' }} />
                    <div className="flex items-center gap-5 p-5 md:p-6">
                        <div className="hidden sm:block w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                            <img src="/images/python_notes.png" alt="Python Notes" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <PenLine size={12} style={{ color: '#fbbf24' }} />
                                <span className="text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: '#fbbf24' }}>O-Level M3-R5</span>
                            </div>
                            <h3 className="text-base md:text-lg font-extrabold mb-1" style={{ color: '#ffffff' }}>
                                ✍️ Python Handwritten Notes
                            </h3>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                11 Chapters • 275+ Pages • Free PDF Download
                            </p>
                        </div>
                        <ChevronRight size={20} className="flex-shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                </Link>

                {/* ── Footer note ── */}
                <div className="mt-8 text-center py-4">
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                        📘 More chapters coming soon — stay tuned!
                    </p>
                </div>
            </main>
        </div>
    );
}
