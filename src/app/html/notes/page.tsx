'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Home, FileText, Sparkles, Code2, Layers, 
    BookOpen, PenTool, ExternalLink
} from 'lucide-react';

const quickLinks = [
    { label: 'Home', href: '/', icon: <Home size={13} /> },
    { label: 'HTML Main', href: '/html', icon: <Code2 size={13} /> },
    { label: 'Elements', href: '/html/elements', icon: <Layers size={13} /> },
    { label: 'Practice Tasks', href: '/html/tasks', icon: <FileText size={13} /> },
];

const HTML_NOTES_URL = 'https://drive.google.com/file/d/1tEpMU-0Bxa4-bXMuNsZ319PtMcXEDprK/view?usp=drivesdk';

export default function HtmlNotesPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-orange-50/20 text-slate-800">
            {/* ── Top Bar ── */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-xs">
                <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                if (typeof window !== 'undefined' && window.history.length > 1) {
                                    router.back();
                                } else {
                                    router.push('/html');
                                }
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                            title="Go Back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xs sm:text-sm font-bold text-gray-900">HTML Handwritten Notes</h1>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                    Available Now
                                </span>
                            </div>
                            <span className="text-[9px] text-gray-600 uppercase tracking-wider">
                                O-Level M2-R5 Web Design
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                        <Link 
                            href="/" 
                            className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Home size={16} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Handwritten Notes ── */}
            <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
                <div className="relative overflow-hidden bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-500/5 p-8 md:p-14 text-center">
                    {/* Background Glows */}
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

                    {/* Animated Icon */}
                    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-purple-500/30 transform hover:scale-105 hover:rotate-3 transition-transform">
                        <PenTool size={42} strokeWidth={2.2} />
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 border-2 border-white" />
                        </span>
                    </div>

                    {/* Badge */}
                    <div className="flex justify-center mb-4">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={13} className="text-purple-600" />
                            Handwritten Visual Notes Collection
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        HTML Handwritten Notes
                    </h2>
                    <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        HTML के हस्तलिखित नोट्स अब उपलब्ध हैं
                    </p>

                    {/* Subtitle / Desc */}
                    <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
                        Read the HTML & Web Publishing handwritten notes for NIELIT O-Level M2-R5. Open the PDF in Google Drive to study and revise at your own pace.
                    </p>

                    <div className="mb-8">
                        <a href={HTML_NOTES_URL} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-600"
                            style={{ color: '#ffffff' }}>
                            <BookOpen size={18} />
                            <span>Open Handwritten Notes</span>
                            <ExternalLink size={15} />
                        </a>
                        <p className="mt-3 text-xs text-slate-500">PDF · Opens in Google Drive in a new tab</p>
                    </div>

                    {/* Feature Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-10 text-left">
                        {[
                            { emoji: '📄', title: '100% Free PDF', desc: 'Direct download & print' },
                            { emoji: '🎨', title: 'Visual Diagrams', desc: 'Tag tree & box model' },
                            { emoji: '🇮🇳', title: 'Hindi + English', desc: 'Easy bilingual notes' },
                            { emoji: '🎯', title: 'O-Level M2-R5', desc: 'Exam focused syllabus' },
                        ].map((feature, i) => (
                            <div 
                                key={i} 
                                className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors"
                            >
                                <div className="text-2xl mb-1.5">{feature.emoji}</div>
                                <h4 className="text-xs font-bold text-slate-900">{feature.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link 
                            href="/html" 
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <BookOpen size={16} />
                            <span>Start HTML Tutorial</span>
                        </Link>
                        <Link 
                            href="/html/elements" 
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 transition-all shadow-xs"
                        >
                            <Layers size={16} />
                            <span>View All Tags</span>
                        </Link>
                        <Link 
                            href="/html/tasks" 
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs sm:text-sm hover:bg-emerald-100 transition-all shadow-xs"
                        >
                            <FileText size={16} />
                            <span>Practice Tasks</span>
                        </Link>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="mt-8 text-center text-xs text-slate-500">
                    <p>Designed for NIELIT O-Level M2-R5 Web Design & Publishing | Knobly Web Platform</p>
                </div>
            </main>
        </div>
    );
}
