'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Code2, BookOpen, FileCode, Play, Sparkles, ChevronRight } from 'lucide-react';

const sections = [
    {
        title: 'Introduction',
        href: '/html/intro',
        desc: 'What is HTML, tags, attributes, and creating your first page',
        icon: BookOpen,
        gradient: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        hoverBorder: 'hover:border-orange-300',
        tag: 'Start Here',
        tagColor: 'bg-orange-100 text-orange-700',
    },
    {
        title: 'Elements & Tags',
        href: '/html/elements',
        desc: 'All 18 chapters — Headings, paragraphs, images, links, lists, tables, forms & more',
        icon: Code2,
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        hoverBorder: 'hover:border-blue-300',
        tag: '18 Sections',
        tagColor: 'bg-blue-100 text-blue-700',
    },
    {
        title: 'Practice Tasks',
        href: '/html/tasks',
        desc: '15 hands-on tasks with built-in compiler to practice and master HTML',
        icon: FileCode,
        gradient: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        hoverBorder: 'hover:border-amber-300',
        tag: '15 Tasks',
        tagColor: 'bg-amber-100 text-amber-700',
    },
    {
        title: 'Live Compiler',
        href: '/html/compiler',
        desc: 'Write and preview HTML code in real-time with instant output',
        icon: Play,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        hoverBorder: 'hover:border-emerald-300',
        tag: 'Interactive',
        tagColor: 'bg-emerald-100 text-emerald-700',
    },
];

export default function HtmlPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20" style={{ color: '#1f2937' }}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <Code2 size={14} className="text-white" />
                            </div>
                            <h1 className="text-base font-bold text-gray-900">HTML</h1>
                        </div>
                    </div>
                    <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors">
                        <Home size={18} />
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 sm:p-8 mb-8 shadow-lg shadow-orange-500/20">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="absolute top-4 right-8 text-white/10 text-6xl sm:text-8xl font-black select-none">&lt;/&gt;</div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-yellow-200" />
                            <span className="text-[10px] sm:text-xs font-bold text-orange-100 uppercase tracking-[0.2em]">Complete Course</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                            Learn HTML
                        </h1>
                        <p className="text-sm sm:text-base text-orange-100 max-w-lg leading-relaxed">
                            Master the building blocks of the web — from basic tags to semantic elements, forms, tables, and multimedia.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-sm">18 Chapters</span>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-sm">15 Tasks</span>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-sm">Live Compiler</span>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-sm">O-Level Syllabus</span>
                        </div>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {sections.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Link
                                key={s.href}
                                href={s.href}
                                className={`group relative bg-white rounded-2xl border ${s.border} ${s.hoverBorder} p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                            >
                                {/* Top accent line */}
                                <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={22} className={s.iconColor} />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${s.tagColor}`}>
                                        {s.tag}
                                    </span>
                                </div>

                                <h3 id="stitle" className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 group-hover:text-blue-700 transition-colors">
                                    {s.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">
                                    {s.desc}
                                </p>

                                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Open <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Elements & Tags', value: '18', color: 'text-blue-600' },
                        { label: 'Practice Tasks', value: '15', color: 'text-amber-600' },
                        { label: 'Code Examples', value: '50+', color: 'text-emerald-600' },
                        { label: 'Reference Tables', value: '10+', color: 'text-purple-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                            <p className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
