'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Wifi, Cpu, Download, FileText, Eye, BookOpen, PenTool, Sparkles, ExternalLink, ChevronRight, Clock, FileCheck } from 'lucide-react';

const handwrittenNotes = [
    {
        title: 'Chapter 1 — Introduction to IoT',
        subtitle: 'Applications, Devices, Protocols & Communication Model',
        fileName: 'IOT CHAPTER 1 (1).pdf',
        downloadName: 'IoT-Chapter-1-Handwritten-Notes.pdf',
        chapter: 1,
        color: '#06b6d4',
        gradientFrom: '#06b6d4',
        gradientTo: '#0891b2',
        bgColor: '#ecfeff',
        borderColor: '#22d3ee',
        pages: '~20',
        size: '19.8 MB',
        topics: ['IoT Introduction', 'IoT Architecture', 'Communication Models', 'IoT Protocols', 'Development Tools'],
    },
    {
        title: 'Chapter 2 — Things and Connections',
        subtitle: 'Control Systems, Open/Closed Loop & Real-Time Systems',
        fileName: 'IOT CHAPTER 2.pdf',
        downloadName: 'IoT-Chapter-2-Handwritten-Notes.pdf',
        chapter: 2,
        color: '#8b5cf6',
        gradientFrom: '#8b5cf6',
        gradientTo: '#7c3aed',
        bgColor: '#f5f3ff',
        borderColor: '#a78bfa',
        pages: '~12',
        size: '7.4 MB',
        topics: ['Control Systems', 'Open Loop Systems', 'Closed Loop Systems', 'Real-Time Systems', 'IoT Connectivity'],
    },
];

export default function HandwrittenNotesPage() {
    return (
        <div className="min-h-screen bg-white relative overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30" />
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="notebook-lines" x="0" y="0" width="100%" height="32" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="31" x2="100%" y2="31" stroke="#d4a574" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#notebook-lines)" />
                    </svg>
                </div>
                <svg className="absolute top-20 left-0 w-full h-32 opacity-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="notesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="50%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                    <path d="M-50,50 Q100,20 250,50 T550,50 T850,50 T1150,50 T1450,50" fill="none" stroke="url(#notesGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="15,10,5,10">
                        <animate attributeName="stroke-dashoffset" from="0" to="40" dur="3s" repeatCount="indefinite" />
                    </path>
                </svg>
                <div className="absolute top-32 right-20 w-40 h-40 opacity-[0.06] animate-notes-float">
                    <PenTool className="w-full h-full text-amber-500" />
                </div>
                <div className="absolute top-40 left-10 w-20 h-20 opacity-[0.06] animate-notes-pulse">
                    <FileText className="w-full h-full text-orange-500" />
                </div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-amber-100/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/iot" className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                <ArrowLeft size={18} />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                                    <PenTool size={18} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Handwritten Notes</h1>
                                    <p className="text-[10px] text-gray-400 -mt-0.5">IoT — M4-R5 Exam Notes</p>
                                </div>
                            </div>
                        </div>
                        <nav className="hidden md:flex items-center gap-1">
                            {[{ label: 'Home', href: '/' }, { label: 'IoT Course', href: '/iot' }, { label: 'MCQ', href: '/mcq' }].map(l => (
                                <Link key={l.href} href={l.href} className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50/80 transition-all duration-200">{l.label}</Link>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                                <PenTool size={12} /><span>Notes</span>
                            </div>
                            <Link href="/" className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                                <Home size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-[2rem] bg-white border border-amber-100 shadow-2xl shadow-amber-100/50 mb-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-100/30 to-yellow-100/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />

                    {/* Notebook decoration */}
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/4 hidden xl:block">
                        <div className="relative w-56 h-56">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                <defs>
                                    <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#f59e0b" />
                                        <stop offset="50%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                                {/* Notebook shape */}
                                <rect x="40" y="30" width="120" height="150" rx="8" fill="none" stroke="url(#noteGrad)" strokeWidth="3" opacity="0.3">
                                    <animate attributeName="strokeDashoffset" from="0" to="540" dur="20s" repeatCount="indefinite" />
                                </rect>
                                {/* Lines on notebook */}
                                {[60, 80, 100, 120, 140, 160].map((y, i) => (
                                    <line key={i} x1="55" y1={y} x2="145" y2={y} stroke="url(#noteGrad)" strokeWidth="1" opacity="0.15" />
                                ))}
                                {/* Pen icon */}
                                <line x1="155" y1="25" x2="175" y2="5" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" opacity="0.5">
                                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
                                </line>
                                <circle cx="175" cy="5" r="3" fill="#f59e0b" opacity="0.6">
                                    <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                                </circle>
                                {/* Margin line */}
                                <line x1="52" y1="30" x2="52" y2="180" stroke="#ef4444" strokeWidth="1.5" opacity="0.2" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative z-10 p-8 md:p-12 lg:pr-72">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider border border-amber-200">
                                <PenTool size={12} />Handwritten
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-200">
                                <FileText size={12} />PDF Notes
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-[1.1] tracking-tight">
                            <span className="relative">
                                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">Handwritten</span>
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                                    <path d="M0,5 Q50,0 100,5 T200,5" stroke="#f59e0b" strokeWidth="3" fill="none" opacity="0.3" />
                                </svg>
                            </span>
                            <br />
                            <span className="text-3xl md:text-4xl font-bold text-gray-600">IoT Exam Notes 📝</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
                            Chapter 1 aur Chapter 2 ke detailed handwritten notes — exam revision ke liye perfect! Download karo aur offline padho.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="#notes" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300">
                                <Download size={18} />Download Notes
                            </a>
                            <Link href="/iot" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-700 font-bold border-2 border-gray-200 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50/50 transition-all duration-300">
                                <BookOpen size={18} />Back to Course
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: <FileText size={22} />, label: 'PDF Notes', value: '2', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
                        { icon: <BookOpen size={22} />, label: 'Chapters Covered', value: 'Ch 1 & 2', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50' },
                        { icon: <PenTool size={22} />, label: 'Type', value: 'Handwritten', color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50' },
                        { icon: <FileCheck size={22} />, label: 'Exam Ready', value: '100%', color: 'from-emerald-400 to-green-500', bg: 'bg-emerald-50' },
                    ].map((stat, i) => (
                        <div key={i} className={`group p-5 rounded-2xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 ${stat.bg}`}>
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                {stat.icon}
                            </div>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Notes Cards */}
                <div id="notes" className="mb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Download Notes</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {handwrittenNotes.map((note) => (
                            <div key={note.chapter} className="group relative rounded-[1.5rem] overflow-hidden bg-white border-2 border-gray-100 hover:border-amber-200 shadow-lg hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1">
                                {/* Top accent bar */}
                                <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${note.gradientFrom}, ${note.gradientTo})` }} />

                                <div className="p-8">
                                    {/* Chapter badge + icon */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" style={{ background: `linear-gradient(135deg, ${note.gradientFrom}dd, ${note.gradientTo})` }}>
                                            <PenTool size={28} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chapter {note.chapter}</span>
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold border" style={{ backgroundColor: note.bgColor, color: note.color, borderColor: note.borderColor }}>
                                                Handwritten
                                            </span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-amber-700 transition-colors">{note.title}</h4>
                                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">{note.subtitle}</p>

                                    {/* Topics covered */}
                                    <div className="mb-5">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Topics Covered</p>
                                        <div className="flex flex-wrap gap-2">
                                            {note.topics.map((topic, i) => (
                                                <span key={i} className="px-3 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* File info */}
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <FileText size={13} className="text-amber-500" />{note.pages} Pages
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <Download size={13} className="text-blue-500" />{note.size}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                            <FileCheck size={13} className="text-emerald-500" />PDF
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <a
                                            href={`/iot/notes/${note.fileName}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 text-sm"
                                            style={{ background: `linear-gradient(135deg, ${note.gradientFrom}, ${note.gradientTo})` }}
                                        >
                                            <Eye size={16} />View PDF
                                        </a>
                                        <a
                                            href={`/iot/notes/${note.fileName}`}
                                            download={note.downloadName}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold border-2 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all duration-300 text-sm text-gray-700 border-gray-200"
                                        >
                                            <Download size={16} />Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coming Soon Teaser */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 md:p-12 text-center mb-12">
                    <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%"><pattern id="notes-cta" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="30" cy="30" r="2" fill="white" /></pattern><rect width="100%" height="100%" fill="url(#notes-cta)" /></svg>
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-bold mb-4">
                            <Sparkles size={14} />Coming Soon
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-4">More Chapters Coming Soon! ✍️</h3>
                        <p className="text-amber-100 mb-6 max-w-2xl mx-auto">Chapter 3, 4, 5 aur Soft Skills ke handwritten notes bhi jaldi add honge — stay tuned!</p>
                        <Link href="/iot" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-amber-600 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                            <BookOpen size={18} />Explore Full Course
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-8 border-t border-amber-100">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <PenTool className="text-amber-500" size={20} />
                        <span className="text-lg font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Write. Learn. Succeed.</span>
                        <FileText className="text-amber-500" size={20} />
                    </div>
                    <p className="text-sm text-gray-500">Handwritten notes — exam revision ke liye best! 📝✨</p>
                </div>
            </main>

            <style jsx global>{`
                @keyframes notes-float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
                @keyframes notes-pulse { 0%, 100% { transform: scale(1); opacity: 0.06; } 50% { transform: scale(1.1); opacity: 0.09; } }
                .animate-notes-float { animation: notes-float 8s ease-in-out infinite; }
                .animate-notes-pulse { animation: notes-pulse 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
