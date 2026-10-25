'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Play, Send, Award, CheckCircle2, XCircle, AlertCircle,
    Code2, Eye, RefreshCw, Trophy, Star, Target, TrendingUp,
    Zap, ChevronRight, X, BarChart3, Tag, Lightbulb, ThumbsUp,
    ChevronDown, FileCode, Loader2, ExternalLink, Columns, Sun, Moon,
    Maximize2, Minimize2
} from 'lucide-react';

interface TaskInfo {
    id: string;
    title: string;
    desc: string;
    topics: string;
    file: string;
}

const TASKS: Record<string, TaskInfo> = {
    '1': { id: '1', title: 'My Profile Page', desc: 'Create a personal profile using basic HTML tags: p, pre, br, hr', topics: 'p, pre, br, hr, bgcolor', file: 'task1.html' },
    '2': { id: '2', title: 'Basic HTML Tags', desc: 'Demonstrate bold, italic, underline, pre, br, center and heading tags', topics: 'b, i, u, pre, br, center, h1, h2, hr', file: 'task2.html' },
    '3': { id: '3', title: 'India - A Diverse Nation', desc: 'Article about India using headings, images, font colors, and hr', topics: 'h1-h5, img, font, br, hr, align', file: 'task3.html' },
    '4': { id: '4', title: 'Indian History Timeline', desc: 'History page using semantic elements: header, nav, section, footer', topics: 'header, nav, section, footer, address, ul', file: 'task4(1).html' },
    '5': { id: '5', title: 'Operating Systems (Lists)', desc: 'OS information page with unordered and ordered lists', topics: 'ul, ol, li, h1-h3, p, hr', file: 'task5.html' },
    '5.1': { id: '5.1', title: 'Operating Systems (Table)', desc: 'OS comparison using tables with borders and cellpadding', topics: 'table, tr, th, td, border, cellpadding', file: 'task5.1.html' },
    '5.2': { id: '5.2', title: 'Internet Usage Statistics', desc: 'Global internet stats with colspan and rowspan tables', topics: 'table, colspan, rowspan, th, td, caption', file: 'task5.2.html' },
    '5.3': { id: '5.3', title: 'History of the Internet', desc: 'Internet timeline with description lists and tables', topics: 'dl, dt, dd, table, iframe, ol', file: 'task5.3.html' },
    '5.4': { id: '5.4', title: 'Wonders of Space', desc: 'Space exploration page with images, tables, and multimedia', topics: 'img, table, audio, video, iframe', file: 'task5.4.html' },
    '6': { id: '6', title: 'Weekly Study Schedule', desc: 'Complex table with colspan, rowspan, and colored cells', topics: 'table, colspan, rowspan, bgcolor, th, td', file: 'task6.html' },
    '7': { id: '7', title: 'Simple Webpage (No CSS)', desc: 'Complete webpage using only semantic HTML tags, no CSS', topics: 'header, nav, main, article, section, footer', file: 'task7.html' },
    '8': { id: '8', title: 'Registration Form', desc: 'Complete registration form with all input types', topics: 'form, input, select, textarea, radio, checkbox', file: 'task8.html' },
    '9': { id: '9', title: 'Solar System Basics', desc: 'Solar system page with tables, lists, and audio', topics: 'table, ol, ul, audio, img, details', file: 'task9.html' },
    '10': { id: '10', title: 'Full Website Layout', desc: 'Multi-section website with marquee, nav, tables, forms, media', topics: 'marquee, nav, table, form, video, iframe', file: 'task10.html' },
    '11': { id: '11', title: 'Premium Demo Website', desc: 'Professional-looking demo site with header, sections, and footer', topics: 'header, section, article, aside, footer, figure', file: 'task11.html' },
};

interface Evaluation {
    score: number;
    grade: string;
    tagAnalysis: {
        used: string[];
        missing: string[];
        extra: string[];
    };
    feedback: string;
    strengths: string[];
    improvements: string[];
    detailedBreakdown: {
        tagUsage: number;
        structure: number;
        contentRelevance: number;
        codeQuality: number;
        creativity: number;
    };
}

function getDefaultCode(task: TaskInfo) {
    return '';
}

function getGradeColor(grade: string) {
    switch (grade) {
        case 'A+': return { bg: '#059669', text: '#065f46', light: '#ecfdf5', border: '#10b981' };
        case 'A': return { bg: '#0d9488', text: '#115e59', light: '#f0fdfa', border: '#14b8a6' };
        case 'B+': return { bg: '#0284c7', text: '#075985', light: '#f0f9ff', border: '#0ea5e9' };
        case 'B': return { bg: '#2563eb', text: '#1e40af', light: '#eff6ff', border: '#3b82f6' };
        case 'C': return { bg: '#d97706', text: '#92400e', light: '#fffbeb', border: '#f59e0b' };
        case 'D': return { bg: '#ea580c', text: '#9a3412', light: '#fff7ed', border: '#f97316' };
        case 'F': return { bg: '#dc2626', text: '#991b1b', light: '#fef2f2', border: '#ef4444' };
        default: return { bg: '#6b7280', text: '#374151', light: '#f9fafb', border: '#9ca3af' };
    }
}

function getScoreEmoji(score: number) {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 70) return '👏';
    if (score >= 60) return '👍';
    if (score >= 40) return '💪';
    return '📝';
}

export default function TaskCompilerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const task = TASKS[id];

    const [code, setCode] = useState('');
    const [activeView, setActiveView] = useState<'editor' | 'preview' | 'split'>('split');
    
    // Right panel mode: 'preview' (student live code) | 'target' (reference task iframe) | 'compare' (split both)
    const [previewMode, setPreviewMode] = useState<'preview' | 'target' | 'compare'>('preview');
    
    // Theme: 'white' (light mode - DEFAULT as requested) | 'dark'
    const [theme, setTheme] = useState<'white' | 'dark'>('white');

    const [previewHtml, setPreviewHtml] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [evalError, setEvalError] = useState('');
    const [showTaskInfo, setShowTaskInfo] = useState(true);
    const [lineCount, setLineCount] = useState(1);
    const [targetModalOpen, setTargetModalOpen] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumberRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Load saved code from localStorage (or start completely blank)
    useEffect(() => {
        if (task) {
            const saved = localStorage.getItem(`knobly_task_code_${id}`);
            // If saved code exists and is not the previous boilerplate template, keep student's work; otherwise start blank
            if (saved && !saved.includes('<!-- Yahan apna HTML code likhein... -->') && !saved.includes('<!-- Required tags:')) {
                setCode(saved);
                setPreviewHtml(saved);
            } else {
                setCode('');
                setPreviewHtml('');
                localStorage.removeItem(`knobly_task_code_${id}`);
            }
        }
    }, [id, task]);

    // Update line count
    useEffect(() => {
        setLineCount(code.split('\n').length);
    }, [code]);

    // Keep body class in sync with compiler theme (prevents global light-mode styles from corrupting dark mode)
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.remove('light-mode');
            document.documentElement.classList.add('dark');
        } else {
            document.body.classList.add('light-mode');
            document.documentElement.classList.remove('dark');
        }

        return () => {
            const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('knobly-theme') : null;
            if (savedTheme === 'dark') {
                document.body.classList.remove('light-mode');
                document.documentElement.classList.add('dark');
            } else {
                document.body.classList.add('light-mode');
                document.documentElement.classList.remove('dark');
            }
        };
    }, [theme]);

    // Auto-save to localStorage
    useEffect(() => {
        if (code && task) {
            const timer = setTimeout(() => {
                localStorage.setItem(`knobly_task_code_${id}`, code);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [code, id, task]);

    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
    }, []);

    const handleRun = useCallback(() => {
        setPreviewHtml(code);
        // If currently in target mode, switch to preview so user sees the result of Run
        if (previewMode === 'target') {
            setPreviewMode('preview');
        }
    }, [code, previewMode]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newCode);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }, 0);
        }
        // Ctrl+Enter to run
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleRun();
        }
    }, [code, handleRun]);

    // Sync scroll between textarea and line numbers
    const handleScroll = useCallback(() => {
        if (textareaRef.current && lineNumberRef.current) {
            lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    const handleSubmit = async () => {
        if (!code.trim()) {
            setEvalError('Pehle apna HTML code likhein, phir submit karein!');
            return;
        }

        setIsEvaluating(true);
        setEvalError('');
        setEvaluation(null);
        setShowResult(false);

        try {
            const res = await fetch('/api/evaluate-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: id, studentCode: code }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Evaluation failed');
            }

            setEvaluation(data.evaluation);
            setShowResult(true);
        } catch (err) {
            setEvalError(err instanceof Error ? err.message : 'Evaluation me error aaya. Please try again.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Kya aap code clear karna chahte hain?')) {
            setCode('');
            setPreviewHtml('');
            localStorage.removeItem(`knobly_task_code_${id}`);
        }
    };

    if (!task) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center bg-white border border-slate-200 rounded-3xl p-8 max-w-sm shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={24} />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 mb-1">Task Not Found</h1>
                    <p className="text-xs text-slate-500 mb-4">Task #{id} doesn&apos;t exist.</p>
                    <Link
                        href="/html/tasks"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={14} /> Back to Tasks
                    </Link>
                </div>
            </div>
        );
    }

    const requiredTags = task.topics.split(',').map(t => t.trim());
    const isWhite = theme === 'white';

    return (
        <div
            className={`min-h-screen flex flex-col transition-colors duration-200 ${
                isWhite ? 'bg-slate-100 text-slate-800' : 'bg-[#090d16] text-slate-100'
            }`}
            style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                ...(!isWhite ? { backgroundColor: '#090d16', color: '#f8fafc' } : {})
            }}
        >
            
            {/* ═══════════ TOP HEADER BAR ═══════════ */}
            <header
                style={!isWhite ? { backgroundColor: '#0f1422', borderColor: '#1e293b' } : {}}
                className={`h-13 px-3 sm:px-4 flex items-center justify-between border-b sticky top-0 z-40 transition-colors ${
                    isWhite
                        ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-xs'
                        : 'bg-[#0f1422]/95 backdrop-blur-md border-slate-800'
                }`}>
                {/* Left: Back & Title */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            isWhite ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Go Back"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-sm text-white shrink-0">
                        <FileCode size={16} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1
                                style={!isWhite ? { color: '#ffffff' } : {}}
                                className={`text-xs sm:text-sm font-extrabold truncate ${isWhite ? 'text-slate-900' : 'text-white'}`}
                            >
                                Task {id}: {task.title}
                            </h1>
                            <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isWhite
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            }`}>
                                <span>HTML Studio</span>
                            </span>
                        </div>
                        <p
                            style={!isWhite ? { color: '#94a3b8' } : {}}
                            className={`text-[10px] truncate ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                            Live HTML Compiler • AI Task Evaluation
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    
                    {/* View Target Task Quick Button */}
                    <button
                        onClick={() => {
                            if (activeView === 'editor') setActiveView('split');
                            setPreviewMode(previewMode === 'target' ? 'preview' : 'target');
                        }}
                        style={previewMode === 'target' ? { backgroundColor: '#f97316', color: '#ffffff' } : !isWhite ? { color: '#fdba74' } : {}}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            previewMode === 'target'
                                ? 'bg-orange-500 text-white shadow-orange-500/20'
                                : isWhite
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
                                    : 'bg-orange-500/15 text-orange-300 border border-orange-500/40 hover:bg-orange-500/25'
                        }`}
                        title="Toggle Target Project Output"
                    >
                        <Target size={13} color={previewMode === 'target' ? '#ffffff' : !isWhite ? '#fdba74' : undefined} className={previewMode === 'target' ? 'animate-pulse' : ''} />
                        <span style={previewMode === 'target' ? { color: '#ffffff' } : !isWhite ? { color: '#fdba74' } : {}} className="hidden md:inline">
                            {previewMode === 'target' ? 'Showing Target' : 'View Target Task'}
                        </span>
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={() => {
                            if (activeView === 'editor') setActiveView('split');
                            setPreviewMode(previewMode === 'compare' ? 'preview' : 'compare');
                        }}
                        style={previewMode === 'compare' ? { backgroundColor: '#4f46e5', color: '#ffffff' } : !isWhite ? { color: '#f1f5f9' } : {}}
                        className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            previewMode === 'compare'
                                ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                                : isWhite
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                        title="Compare Target Output & Your Output Side-by-Side"
                    >
                        <Columns size={13} color={previewMode === 'compare' || !isWhite ? '#ffffff' : undefined} />
                        <span style={previewMode === 'compare' || !isWhite ? { color: '#ffffff' } : {}} className="hidden lg:inline">
                            Compare
                        </span>
                    </button>

                    {/* View Switcher: Editor / Split / Preview */}
                    <div className={`hidden md:flex rounded-xl p-0.5 border ${
                        isWhite ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/90 border-slate-700'
                    }`}>
                        <button
                            onClick={() => setActiveView('editor')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                activeView === 'editor'
                                    ? isWhite ? 'bg-white text-slate-900 shadow-xs' : 'bg-orange-500 text-white font-bold shadow-xs'
                                    : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                            }`}
                            title="Editor Only"
                        >
                            <Code2 size={13} color={activeView === 'editor' && !isWhite ? '#ffffff' : undefined} />
                        </button>
                        <button
                            onClick={() => setActiveView('split')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                activeView === 'split'
                                    ? isWhite ? 'bg-white text-slate-900 shadow-xs' : 'bg-orange-500 text-white font-bold shadow-xs'
                                    : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                            }`}
                            title="Split View"
                        >
                            <Columns size={13} color={activeView === 'split' && !isWhite ? '#ffffff' : undefined} />
                        </button>
                        <button
                            onClick={() => setActiveView('preview')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                activeView === 'preview'
                                    ? isWhite ? 'bg-white text-slate-900 shadow-xs' : 'bg-orange-500 text-white font-bold shadow-xs'
                                    : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                            }`}
                            title="Preview Only"
                        >
                            <Eye size={13} color={activeView === 'preview' && !isWhite ? '#ffffff' : undefined} />
                        </button>
                    </div>

                    {/* Theme Toggle (White default / Dark) */}
                    <button
                        onClick={() => setTheme(isWhite ? 'dark' : 'white')}
                        className={`p-2 rounded-xl transition-all border ${
                            isWhite
                                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                                : 'bg-slate-800 border-slate-700 text-amber-300 hover:text-amber-200 hover:bg-slate-700'
                        }`}
                        title={isWhite ? 'Switch to Dark Mode' : 'Switch to White Mode'}
                    >
                        {isWhite ? <Moon size={14} /> : <Sun size={14} color="#fcd34d" />}
                    </button>

                    {/* Run Button */}
                    <button
                        onClick={handleRun}
                        style={{ color: '#ffffff' }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm hover:shadow"
                        title="Run HTML Code (Ctrl+Enter)"
                    >
                        <Play size={12} fill="currentColor" />
                        <span>Run</span>
                    </button>

                    {/* Submit & AI Check Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isEvaluating}
                        style={{ color: '#ffffff' }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all shadow-sm hover:shadow disabled:opacity-50"
                        title="Submit code for AI score and feedback"
                    >
                        {isEvaluating ? (
                            <>
                                <Loader2 size={13} className="animate-spin" />
                                <span className="hidden sm:inline">Checking...</span>
                            </>
                        ) : (
                            <>
                                <Send size={12} />
                                <span>Submit</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* ═══════════ TASK INFO & TARGET BANNER ═══════════ */}
            {showTaskInfo && (
                <div
                    style={!isWhite ? { backgroundColor: '#101726', borderColor: '#1e293b' } : {}}
                    className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
                        isWhite
                            ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-amber-200/80 text-slate-800'
                            : 'bg-slate-900 border-slate-800 text-slate-100'
                    }`}
                >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isWhite ? 'bg-orange-500/20 text-orange-600' : 'bg-orange-500/25 text-orange-400'
                        }`}>
                            <Target size={13} color={!isWhite ? '#fb923c' : undefined} />
                        </div>
                        <div className="text-xs leading-snug">
                            <strong
                                style={!isWhite ? { color: '#fb923c' } : {}}
                                className={`font-bold mr-1.5 ${isWhite ? 'text-orange-700' : 'text-orange-400'}`}
                            >
                                Task Goal:
                            </strong>
                            <span
                                style={!isWhite ? { color: '#f1f5f9' } : {}}
                                className={isWhite ? 'text-slate-700' : 'text-slate-100 font-medium'}
                            >
                                {task.desc}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Required Tags Pills */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <span
                                style={!isWhite ? { color: '#cbd5e1' } : {}}
                                className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${
                                    isWhite ? 'text-slate-400' : 'text-slate-300 font-bold'
                                }`}
                            >
                                Tags:
                            </span>
                            {requiredTags.slice(0, 6).map(tag => (
                                <code
                                    key={tag}
                                    style={!isWhite ? { backgroundColor: '#1e293b', color: '#fdba74', borderColor: '#f97316' } : {}}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                        isWhite
                                            ? 'bg-white text-orange-700 border border-orange-200 shadow-2xs'
                                            : 'bg-slate-800 text-orange-300 border border-orange-500/40 shadow-xs'
                                    }`}
                                >
                                    &lt;{tag}&gt;
                                </code>
                            ))}
                            {requiredTags.length > 6 && (
                                <span
                                    style={!isWhite ? { color: '#94a3b8' } : {}}
                                    className={`text-[10px] font-semibold ${isWhite ? 'text-slate-400' : 'text-slate-400'}`}
                                >
                                    +{requiredTags.length - 6} more
                                </span>
                            )}
                        </div>

                        {/* Open Modal Preview of Target */}
                        <button
                            onClick={() => setTargetModalOpen(true)}
                            className={`p-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
                                isWhite
                                    ? 'text-orange-700 hover:bg-orange-100'
                                    : 'text-orange-400 hover:bg-slate-800 hover:text-orange-300'
                            }`}
                            title="Full Screen Target Preview"
                        >
                            <Maximize2 size={13} />
                        </button>

                        {/* Dismiss */}
                        <button
                            onClick={() => setShowTaskInfo(false)}
                            className={`p-1 rounded-md transition-colors ${
                                isWhite ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                            title="Hide Banner"
                        >
                            <X size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════ ERROR BANNER ═══════════ */}
            {evalError && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle size={14} className="shrink-0 text-red-500" />
                    <span className="flex-1 font-medium">{evalError}</span>
                    <button onClick={() => setEvalError('')} className="text-red-400 hover:text-red-700">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ═══════════ MAIN WORKSPACE (EDITOR + PREVIEW) ═══════════ */}
            <main className={`flex-1 flex overflow-hidden ${
                activeView === 'split' ? 'flex-col md:flex-row' : 'flex-col'
            }`}>
                
                {/* ────────── LEFT PANE: CODE EDITOR ────────── */}
                {(activeView === 'editor' || activeView === 'split') && (
                    <div
                        style={!isWhite ? { backgroundColor: '#0e1320', borderColor: '#1e293b' } : {}}
                        className={`flex flex-col min-w-0 ${
                            activeView === 'split'
                                ? 'flex-1 md:w-1/2 border-b md:border-b-0 md:border-r'
                                : 'flex-1'
                        } ${isWhite ? 'border-slate-200 bg-white' : 'border-slate-800 bg-[#0e1320]'}`}
                    >
                        
                        {/* Editor Header Bar */}
                        <div
                            style={!isWhite ? { backgroundColor: '#131b2e', borderColor: '#1e293b' } : {}}
                            className={`px-3 py-2 flex items-center justify-between border-b ${
                                isWhite ? 'bg-slate-50 border-slate-200' : 'bg-[#141b2d] border-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span
                                    style={!isWhite ? { color: '#f8fafc' } : {}}
                                    className={`text-xs font-bold font-mono ${isWhite ? 'text-slate-700' : 'text-slate-100'}`}
                                >
                                    index.html
                                </span>
                                <span
                                    style={!isWhite ? { backgroundColor: '#1e293b', color: '#cbd5e1', borderColor: '#334155' } : {}}
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                        isWhite ? 'bg-white text-slate-500 border border-slate-200' : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}
                                >
                                    {lineCount} lines
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleReset}
                                    style={!isWhite ? { color: '#cbd5e1' } : {}}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                        isWhite
                                            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Reset Code"
                                >
                                    <RefreshCw size={11} />
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>

                        {/* Editor Code Area */}
                        <div className="flex-1 relative overflow-hidden flex">
                            {/* Line Numbers */}
                            <div
                                ref={lineNumberRef}
                                style={!isWhite ? { backgroundColor: '#0b101d', borderColor: '#1e293b', color: '#94a3b8', lineHeight: '22px' } : { lineHeight: '22px' }}
                                className={`w-11 py-3 text-right pr-2.5 font-mono text-xs select-none overflow-hidden shrink-0 border-r ${
                                    isWhite
                                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                                        : 'bg-[#0c101c] border-slate-800 text-slate-400'
                                }`}
                            >
                                {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
                                    <div key={i} className="h-[22px] leading-[22px] text-[11px]">
                                        {i + 1}
                                    </div>
                                ))}
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={handleCodeChange}
                                onKeyDown={handleKeyDown}
                                onScroll={handleScroll}
                                spellCheck={false}
                                placeholder="<!DOCTYPE html>&#10;<html>&#10;<head>&#10;    <title>...</title>&#10;</head>&#10;<body>&#10;    <!-- Apna HTML code yahan shuru se likhein... -->&#10;</body>&#10;</html>"
                                style={{
                                    lineHeight: '22px',
                                    tabSize: 4,
                                    ...(!isWhite ? { backgroundColor: '#090d16', color: '#f8fafc' } : {})
                                }}
                                className={`flex-1 p-3 font-mono text-xs outline-none resize-none overflow-auto border-0 focus:ring-0 ${
                                    isWhite
                                        ? 'bg-white text-slate-900 caret-orange-600 selection:bg-orange-100'
                                        : 'bg-[#090d16] text-slate-100 caret-orange-400 selection:bg-orange-500/30'
                                }`}
                            />
                        </div>
                    </div>
                )}

                {/* ────────── RIGHT PANE: PREVIEW / TARGET / COMPARE ────────── */}
                {(activeView === 'preview' || activeView === 'split') && (
                    <div
                        style={!isWhite ? { backgroundColor: '#0b0f19' } : {}}
                        className={`flex flex-col min-w-0 ${
                            activeView === 'split' ? 'flex-1 md:w-1/2' : 'flex-1'
                        } ${isWhite ? 'bg-slate-50' : 'bg-[#0b0f19]'}`}
                    >
                        
                        {/* Preview Header with 3 Tab Switchers */}
                        <div
                            style={!isWhite ? { backgroundColor: '#131b2e', borderColor: '#1e293b' } : {}}
                            className={`px-3 py-1.5 flex items-center justify-between border-b gap-2 ${
                                isWhite ? 'bg-slate-100/80 border-slate-200' : 'bg-[#141b2d] border-slate-800'
                            }`}
                        >
                            {/* Tabs */}
                            <div
                                style={!isWhite ? { backgroundColor: '#1a233a', borderColor: '#334155' } : {}}
                                className={`flex items-center rounded-xl p-0.5 border ${
                                    isWhite ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-800/80 border-slate-700'
                                }`}
                            >
                                <button
                                    onClick={() => setPreviewMode('preview')}
                                    style={previewMode === 'preview' ? { backgroundColor: '#059669', color: '#ffffff' } : !isWhite ? { color: '#cbd5e1' } : {}}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        previewMode === 'preview'
                                            ? isWhite
                                                ? 'bg-emerald-500 text-white shadow-xs'
                                                : 'bg-emerald-600 text-white shadow-xs'
                                            : isWhite
                                                ? 'text-slate-600 hover:text-slate-900'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                                    }`}
                                >
                                    <Eye size={12} color={previewMode === 'preview' || !isWhite ? '#ffffff' : undefined} />
                                    <span style={previewMode === 'preview' ? { color: '#ffffff' } : !isWhite ? { color: '#f1f5f9' } : {}}>My Preview</span>
                                </button>

                                <button
                                    onClick={() => setPreviewMode('target')}
                                    style={previewMode === 'target' ? { backgroundColor: '#f97316', color: '#ffffff' } : !isWhite ? { color: '#cbd5e1' } : {}}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        previewMode === 'target'
                                            ? 'bg-orange-500 text-white shadow-xs'
                                            : isWhite
                                                ? 'text-slate-600 hover:text-slate-900'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                                    }`}
                                >
                                    <Target size={12} color={previewMode === 'target' ? '#ffffff' : !isWhite ? '#fdba74' : undefined} />
                                    <span style={previewMode === 'target' ? { color: '#ffffff' } : !isWhite ? { color: '#fdba74' } : {}}>Target Task</span>
                                </button>

                                <button
                                    onClick={() => setPreviewMode('compare')}
                                    style={previewMode === 'compare' ? { backgroundColor: '#4f46e5', color: '#ffffff' } : !isWhite ? { color: '#cbd5e1' } : {}}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        previewMode === 'compare'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : isWhite
                                                ? 'text-slate-600 hover:text-slate-900'
                                                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                                    }`}
                                    title="Compare Target Output and Your Output"
                                >
                                    <Columns size={12} color={previewMode === 'compare' || !isWhite ? '#ffffff' : undefined} />
                                    <span style={previewMode === 'compare' || !isWhite ? { color: '#ffffff' } : {}}>Compare</span>
                                </button>
                            </div>

                            {/* Right tools */}
                            <div className="flex items-center gap-1">
                                <a
                                    href={`/html-tasks/${task.file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={!isWhite ? { color: '#cbd5e1' } : {}}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                        isWhite
                                            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                                    title="Open Target Task in New Tab"
                                >
                                    <ExternalLink size={11} />
                                    <span className="hidden sm:inline">Open Target</span>
                                </a>
                            </div>
                        </div>

                        {/* Preview Content Area */}
                        <div className="flex-1 relative overflow-hidden bg-white">
                            
                            {/* CASE 1: Student Live Output */}
                            {previewMode === 'preview' && (
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={previewHtml}
                                    className="w-full h-full border-0 bg-white"
                                    title="Student Live Output Preview"
                                    sandbox="allow-scripts"
                                />
                            )}

                            {/* CASE 2: Target Task Reference (The Project to Build) */}
                            {previewMode === 'target' && (
                                <div className="w-full h-full flex flex-col">
                                    <div
                                        style={!isWhite ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#fef3c7' } : {}}
                                        className={`px-3 py-2 flex items-center justify-between text-xs border-b ${
                                            isWhite ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-900 border-slate-800 text-amber-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                            <span className="font-bold">🎯 Target Output Reference:</span>
                                            <span className={isWhite ? 'text-amber-800' : 'text-amber-300'}>Aapko yeh webpage banana hai!</span>
                                        </div>
                                        <button
                                            onClick={() => setPreviewMode('preview')}
                                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-colors ${
                                                isWhite
                                                    ? 'bg-amber-200/70 hover:bg-amber-200 text-amber-900'
                                                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                            }`}
                                        >
                                            Switch to My Output →
                                        </button>
                                    </div>
                                    <iframe
                                        src={`/html-tasks/${task.file}`}
                                        className="flex-1 w-full border-0 bg-white"
                                        title={`Target Task Reference ${task.title}`}
                                    />
                                </div>
                            )}

                            {/* CASE 3: Side-by-Side / Stacked Compare */}
                            {previewMode === 'compare' && (
                                <div className={`w-full h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x ${
                                    isWhite ? 'divide-slate-200 bg-slate-100' : 'divide-slate-800 bg-slate-950'
                                }`}>
                                    {/* Left / Top: Target Output */}
                                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                                        <div
                                            style={!isWhite ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#fdba74' } : {}}
                                            className={`px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b ${
                                                isWhite ? 'bg-orange-50 border-orange-200 text-orange-900' : 'bg-slate-900 border-slate-800 text-orange-300'
                                            }`}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Target size={12} className={isWhite ? 'text-orange-600' : 'text-orange-400'} />
                                                <span>Target Project (Goal)</span>
                                            </span>
                                            <span className={`text-[10px] font-normal ${isWhite ? 'text-orange-600' : 'text-orange-400'}`}>Reference</span>
                                        </div>
                                        <div className="flex-1 relative overflow-hidden">
                                            <iframe
                                                src={`/html-tasks/${task.file}`}
                                                className="w-full h-full border-0 bg-white"
                                                title="Compare Target Output"
                                            />
                                        </div>
                                    </div>

                                    {/* Right / Bottom: Student Live Code Output */}
                                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                                        <div
                                            style={!isWhite ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#6ee7b7' } : {}}
                                            className={`px-3 py-1.5 flex items-center justify-between text-[11px] font-bold border-b ${
                                                isWhite ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-900 border-slate-800 text-emerald-300'
                                            }`}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Eye size={12} className={isWhite ? 'text-emerald-600' : 'text-emerald-400'} />
                                                <span>Your Current Output</span>
                                            </span>
                                            <button
                                                onClick={handleRun}
                                                className={`text-[10px] underline font-semibold ${
                                                    isWhite ? 'text-emerald-700' : 'text-emerald-400 hover:text-emerald-300'
                                                }`}
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                        <div className="flex-1 relative overflow-hidden">
                                            <iframe
                                                srcDoc={previewHtml}
                                                className="w-full h-full border-0 bg-white"
                                                title="Compare Student Output"
                                                sandbox="allow-scripts"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* ═══════════ TARGET TASK POPUP MODAL (FULL SCREEN REFERENCE) ═══════════ */}
            {targetModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setTargetModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                                    <Target size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold">Target Reference — Task {id}: {task.title}</h3>
                                    <p className="text-[11px] text-slate-300">Aapko aisa webpage design banana hai</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={`/html-tasks/${task.file}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    title="Open Fullscreen in New Tab"
                                >
                                    <ExternalLink size={15} />
                                </a>
                                <button
                                    onClick={() => setTargetModalOpen(false)}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 relative bg-white">
                            <iframe
                                src={`/html-tasks/${task.file}`}
                                className="w-full h-full border-0"
                                title="Target Task Modal Preview"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div
                            style={!isWhite ? { backgroundColor: '#131b2e', borderColor: '#1e293b', color: '#e2e8f0' } : {}}
                            className={`p-3 border-t flex items-center justify-between text-xs ${
                                isWhite ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                        >
                            <span>Required Tags: <strong className={isWhite ? 'text-slate-800' : 'text-white'}>{task.topics}</strong></span>
                            <button
                                onClick={() => setTargetModalOpen(false)}
                                className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-sm"
                            >
                                Start Coding Now →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ AI EVALUATION RESULT MODAL (CLEAN LIGHT DESIGN) ═══════════ */}
            {showResult && evaluation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Score Header */}
                        <div
                            className="p-6 text-center border-b border-slate-100"
                            style={{
                                background: `linear-gradient(180deg, ${getGradeColor(evaluation.grade).light} 0%, #ffffff 100%)`,
                            }}
                        >
                            <div className="text-5xl mb-2">
                                {getScoreEmoji(evaluation.score)}
                            </div>

                            <div
                                className="text-5xl font-black mb-1 tracking-tight"
                                style={{ color: getGradeColor(evaluation.grade).border }}
                            >
                                {evaluation.score}<span className="text-2xl text-slate-400 font-bold">/100</span>
                            </div>

                            <div
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 shadow-2xs"
                                style={{
                                    background: getGradeColor(evaluation.grade).light,
                                    color: getGradeColor(evaluation.grade).text,
                                    border: `1px solid ${getGradeColor(evaluation.grade).border}40`,
                                }}
                            >
                                <Award size={14} />
                                <span>Grade: {evaluation.grade}</span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed max-w-md mx-auto font-medium">
                                {evaluation.feedback}
                            </p>
                        </div>

                        {/* Detailed Score Breakdown */}
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <BarChart3 size={14} className="text-orange-500" />
                                <span>Score Breakdown</span>
                            </h3>

                            <div className="space-y-2.5">
                                {[
                                    { label: 'Tag Usage', value: evaluation.detailedBreakdown.tagUsage, max: 40, color: '#f97316' },
                                    { label: 'HTML Structure', value: evaluation.detailedBreakdown.structure, max: 20, color: '#10b981' },
                                    { label: 'Content Relevance', value: evaluation.detailedBreakdown.contentRelevance, max: 20, color: '#3b82f6' },
                                    { label: 'Code Quality', value: evaluation.detailedBreakdown.codeQuality, max: 10, color: '#8b5cf6' },
                                    { label: 'Creativity', value: evaluation.detailedBreakdown.creativity, max: 10, color: '#ec4899' },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-slate-600">{item.label}</span>
                                            <span className="font-bold" style={{ color: item.color }}>
                                                {item.value} / {item.max}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(100, (item.value / item.max) * 100)}%`,
                                                    backgroundColor: item.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tag Analysis */}
                        <div className="p-5 border-b border-slate-100 space-y-3">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag size={14} className="text-orange-500" />
                                <span>Tag Analysis</span>
                            </h3>

                            {/* Used Tags */}
                            {evaluation.tagAnalysis.used.length > 0 && (
                                <div>
                                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1.5">
                                        <CheckCircle2 size={12} /> Correctly Used Tags
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {evaluation.tagAnalysis.used.map(t => (
                                            <span
                                                key={t}
                                                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            >
                                                &lt;{t}&gt;
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing Tags */}
                            {evaluation.tagAnalysis.missing.length > 0 && (
                                <div>
                                    <span className="text-[11px] font-bold text-red-700 flex items-center gap-1 mb-1.5">
                                        <XCircle size={12} /> Missing Required Tags
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {evaluation.tagAnalysis.missing.map(t => (
                                            <span
                                                key={t}
                                                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-50 text-red-700 border border-red-200"
                                            >
                                                &lt;{t}&gt;
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-slate-100">
                            {/* Strengths */}
                            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3">
                                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                                    <ThumbsUp size={13} />
                                    <span>Strengths</span>
                                </h4>
                                <ul className="space-y-1.5">
                                    {evaluation.strengths.map((s, i) => (
                                        <li key={i} className="text-[11px] text-emerald-900 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3">
                                <h4 className="text-xs font-bold text-orange-800 flex items-center gap-1.5 mb-2">
                                    <Lightbulb size={13} />
                                    <span>Improvement Tips</span>
                                </h4>
                                <ul className="space-y-1.5">
                                    {evaluation.improvements.map((s, i) => (
                                        <li key={i} className="text-[11px] text-orange-900 leading-relaxed flex items-start gap-1.5">
                                            <span className="text-orange-500 font-bold">•</span>
                                            <span>{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="p-4 bg-slate-50 flex gap-2.5">
                            <button
                                onClick={() => setShowResult(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all shadow-2xs"
                            >
                                ← Edit & Improve Code
                            </button>
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    handleSubmit();
                                }}
                                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={13} />
                                <span>Re-evaluate</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ AI EVALUATING FULLSCREEN OVERLAY ═══════════ */}
            {isEvaluating && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 animate-pulse">
                            <Zap size={28} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                AI Evaluating Code...
                            </h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Tags, structure aur content check kiya ja raha hai. Kuch hi seconds me result aayega...
                            </p>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
