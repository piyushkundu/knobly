'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, Home, FileCode, ExternalLink, Lock, Unlock, 
    KeyRound, CheckCircle2, AlertCircle, X, Shield, Sparkles, RefreshCw, Code2, Eye
} from 'lucide-react';

interface TaskItem {
    id: string;
    title: string;
    desc: string;
    topics: string;
    color: string;
}

const TASKS: TaskItem[] = [
    { id: '1', title: 'My Profile Page', desc: 'Create a personal profile using basic HTML tags: p, pre, br, hr', topics: 'p, pre, br, hr, bgcolor', color: 'bg-blue-500' },
    { id: '2', title: 'Basic HTML Tags', desc: 'Demonstrate bold, italic, underline, pre, br, center and heading tags', topics: 'b, i, u, pre, br, center, h1, h2, hr', color: 'bg-green-500' },
    { id: '3', title: 'India - A Diverse Nation', desc: 'Article about India using headings, images, font colors, and hr', topics: 'h1-h5, img, font, br, hr, align', color: 'bg-orange-500' },
    { id: '4', title: 'Indian History Timeline', desc: 'History page using semantic elements: header, nav, section, footer', topics: 'header, nav, section, footer, address, ul', color: 'bg-red-500' },
    { id: '5', title: 'Operating Systems (Lists)', desc: 'OS information page with unordered and ordered lists', topics: 'ul, ol, li, h1-h3, p, hr', color: 'bg-purple-500' },
    { id: '5.1', title: 'Operating Systems (Table)', desc: 'OS comparison using tables with borders and cellpadding', topics: 'table, tr, th, td, border, cellpadding', color: 'bg-purple-400' },
    { id: '5.2', title: 'Internet Usage Statistics', desc: 'Global internet stats with colspan and rowspan tables', topics: 'table, colspan, rowspan, th, td, caption', color: 'bg-indigo-500' },
    { id: '5.3', title: 'History of the Internet', desc: 'Internet timeline with description lists and tables', topics: 'dl, dt, dd, table, iframe, ol', color: 'bg-indigo-400' },
    { id: '5.4', title: 'Wonders of Space', desc: 'Space exploration page with images, tables, and multimedia', topics: 'img, table, audio, video, iframe', color: 'bg-cyan-500' },
    { id: '6', title: 'Weekly Study Schedule', desc: 'Complex table with colspan, rowspan, and colored cells', topics: 'table, colspan, rowspan, bgcolor, th, td', color: 'bg-teal-500' },
    { id: '7', title: 'Simple Webpage (No CSS)', desc: 'Complete webpage using only semantic HTML tags, no CSS', topics: 'header, nav, main, article, section, footer', color: 'bg-amber-500' },
    { id: '8', title: 'Registration Form', desc: 'Complete registration form with all input types', topics: 'form, input, select, textarea, radio, checkbox', color: 'bg-rose-500' },
    { id: '9', title: 'Solar System Basics', desc: 'Solar system page with tables, lists, and audio', topics: 'table, ol, ul, audio, img, details', color: 'bg-sky-500' },
    { id: '10', title: 'Full Website Layout', desc: 'Multi-section website with marquee, nav, tables, forms, media', topics: 'marquee, nav, table, form, video, iframe', color: 'bg-emerald-500' },
    { id: '11', title: 'Premium Demo Website', desc: 'Professional-looking demo site with header, sections, and footer', topics: 'header, section, article, aside, footer, figure', color: 'bg-violet-500' },
];

export default function TasksPage() {
    const router = useRouter();
    const [unlockedTasks, setUnlockedTasks] = useState<string[]>([]);
    const [openedTasks, setOpenedTasks] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state for Admin Unlock
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('all');
    const [adminPassword, setAdminPassword] = useState('');
    const [modalAction, setModalAction] = useState<'unlock' | 'lock'>('unlock');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch current unlocked tasks from backend API
    const fetchTasksState = async () => {
        // First check localStorage for immediate render
        try {
            const cached = localStorage.getItem('knobly_unlocked_html_tasks');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    setUnlockedTasks(parsed);
                }
            }
        } catch (e) {}

        try {
            const res = await fetch('/api/html-tasks', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data.unlockedTasks)) {
                    setUnlockedTasks(data.unlockedTasks);
                    try {
                        localStorage.setItem('knobly_unlocked_html_tasks', JSON.stringify(data.unlockedTasks));
                    } catch (e) {}
                }
            }
        } catch (err) {
            console.error('Failed to load tasks status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadOpenedTasks = () => {
        try {
            const raw = localStorage.getItem('knobly_opened_html_tasks');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) setOpenedTasks(list);
            }
        } catch (e) {}
    };

    const recordTaskOpen = (taskId: string) => {
        try {
            const raw = localStorage.getItem('knobly_opened_html_tasks');
            const list: string[] = raw ? JSON.parse(raw) : [];
            if (!list.includes(taskId)) {
                list.push(taskId);
                localStorage.setItem('knobly_opened_html_tasks', JSON.stringify(list));
                setOpenedTasks([...list]);
            }
        } catch (e) {}
    };

    useEffect(() => {
        fetchTasksState();
        loadOpenedTasks();
    }, []);

    const openUnlockModal = (taskId: string = 'all', action: 'unlock' | 'lock' = 'unlock') => {
        setSelectedTaskId(taskId);
        setModalAction(action);
        setAdminPassword('');
        setErrorMessage('');
        setSuccessMessage('');
        setModalOpen(true);
    };

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setSubmitLoading(true);

        try {
            const res = await fetch('/api/html-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: adminPassword,
                    taskId: selectedTaskId,
                    action: modalAction,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || 'Password verification failed');
            } else {
                const updatedList = Array.isArray(data.unlockedTasks) ? data.unlockedTasks : [];
                setUnlockedTasks(updatedList);
                try {
                    localStorage.setItem('knobly_unlocked_html_tasks', JSON.stringify(updatedList));
                } catch (e) {}

                setSuccessMessage(data.message || 'Task status updated successfully!');
                setTimeout(() => {
                    setModalOpen(false);
                    setSuccessMessage('');
                }, 900);
            }
        } catch {
            setErrorMessage('Network error. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const isTaskUnlocked = (id: string) => unlockedTasks.includes(id);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* ── Header ── */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()} 
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                            title="Go Back"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                                <FileCode size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-slate-900 leading-tight">HTML Practice Tasks</h1>
                                <span className="text-[10px] text-slate-400 font-medium">15 Hands-on Projects</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/html/compiler"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                            title="Open Web Compiler"
                        >
                            <FileCode size={13} />
                            <span className="hidden sm:inline">Web Compiler</span>
                        </Link>

                        {/* Small Lock Icon for Admin */}
                        <button
                            onClick={() => openUnlockModal('all', 'unlock')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 border border-slate-200 hover:border-amber-300 transition-all shadow-sm"
                            title="Admin Unlock Controls"
                        >
                            <Lock size={13} className="text-amber-600" />
                            <span className="hidden sm:inline">Admin Access</span>
                        </button>

                        <Link 
                            href="/" 
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                            title="Home"
                        >
                            <Home size={16} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-orange-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-sm mb-3">
                            <Sparkles size={12} />
                            <span>Structured Practice Curriculum</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Hands-on Practice Tasks</h2>
                        <p className="text-amber-100 text-xs sm:text-sm leading-relaxed mb-4">
                            Tasks start locked to ensure step-by-step learning. As you complete tag sections in the Elements guide, each task will be unlocked by the instructor!
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm font-semibold">
                                Total: {TASKS.length} Tasks
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm font-semibold text-emerald-200">
                                Unlocked: {unlockedTasks.length} Tasks
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm font-semibold text-sky-200">
                                Opened: {openedTasks.length}/{TASKS.length} ({Math.round((openedTasks.length / TASKS.length) * 100)}%)
                            </span>
                            <span className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm font-semibold text-amber-200">
                                Locked: {TASKS.length - unlockedTasks.length} Tasks
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Tasks Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {TASKS.map((task) => {
                        const unlocked = isTaskUnlocked(task.id);
                        const isOpened = openedTasks.includes(task.id);

                        return (
                            <div 
                                key={task.id}
                                className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                                    unlocked 
                                        ? 'bg-white border-emerald-200 shadow-sm hover:shadow-md hover:-translate-y-1' 
                                        : 'bg-slate-50/90 border-slate-200 shadow-sm hover:border-slate-300'
                                }`}
                            >
                                {/* Top Accent */}
                                <div className={`h-1.5 w-full ${unlocked ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                                <div className="p-5">
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-9 h-9 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-sm ${
                                                unlocked ? task.color : 'bg-slate-400'
                                            }`}>
                                                {task.id}
                                            </span>
                                            <div>
                                                <h3 className={`text-sm font-bold leading-tight ${unlocked ? 'text-slate-900' : 'text-slate-600'}`}>
                                                    {task.title}
                                                </h3>
                                                <span className="text-[10px] text-slate-400 font-mono">Task #{task.id}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge & Small Lock Icon */}
                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                            {isOpened && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <CheckCircle2 size={10} />
                                                    <span>Opened</span>
                                                </span>
                                            )}
                                            {unlocked ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <Unlock size={10} />
                                                    <span>Open</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                                                    <Lock size={10} />
                                                    <span>Locked</span>
                                                </span>
                                            )}

                                            {/* Small Lock Icon to Toggle/Unlock */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openUnlockModal(task.id, unlocked ? 'lock' : 'unlock');
                                                }}
                                                className="w-6 h-6 rounded-md hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-amber-700 transition-colors"
                                                title={unlocked ? 'Lock Task (Admin)' : 'Unlock Task (Admin)'}
                                            >
                                                {unlocked ? <Lock size={12} /> : <KeyRound size={12} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className={`text-xs mb-3 leading-relaxed ${unlocked ? 'text-slate-600' : 'text-slate-500'}`}>
                                        {task.desc}
                                    </p>

                                    {/* Topics Covered */}
                                    <div className="bg-white/80 rounded-lg p-2 border border-slate-200/80 mb-4">
                                        <span className="text-[10px] font-semibold text-slate-400 block mb-0.5 uppercase tracking-wider">Tags Tested</span>
                                        <code className="text-[11px] text-slate-700 font-mono font-medium block truncate">
                                            {task.topics}
                                        </code>
                                    </div>
                                </div>

                                {/* Card Footer Action */}
                                <div className="px-5 pb-5 pt-0">
                                    {unlocked ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link 
                                                href={`/html/tasks/${task.id}`}
                                                onClick={() => recordTaskOpen(task.id)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
                                                title="View Task Demo Preview"
                                            >
                                                <Eye size={13} />
                                                <span>Preview</span>
                                            </Link>
                                            <Link 
                                                href={`/html/tasks/${task.id}/compiler`}
                                                onClick={() => recordTaskOpen(task.id)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm hover:shadow transition-all"
                                                title="Code project in live compiler with AI evaluation"
                                            >
                                                <Code2 size={13} />
                                                <span>Compiler</span>
                                            </Link>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openUnlockModal(task.id, 'unlock')}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 bg-slate-200/80 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                                        >
                                            <Lock size={13} className="text-slate-400" />
                                            <span>Locked by Instructor (Tap to Unlock)</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* ── Admin Unlock Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold">Admin Task Control</h3>
                                    <p className="text-[11px] text-slate-300">
                                        {modalAction === 'unlock' ? 'Unlock task for students' : 'Lock task'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAdminSubmit} className="p-5 space-y-4">
                            {errorMessage && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                                    <AlertCircle size={15} className="shrink-0 text-red-500" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {successMessage && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {/* Target Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Select Target Task
                                </label>
                                <select
                                    value={selectedTaskId}
                                    onChange={(e) => setSelectedTaskId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="all">🌟 All Tasks ({TASKS.length} Tasks)</option>
                                    {TASKS.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            Task {t.id}: {t.title} {isTaskUnlocked(t.id) ? '✓ Unlocked' : '🔒 Locked'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Choice */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Action
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalAction('unlock')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            modalAction === 'unlock' 
                                                ? 'bg-emerald-600 text-white shadow-sm' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Unlock size={13} />
                                        <span>Unlock Task</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setModalAction('lock')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                            modalAction === 'lock' 
                                                ? 'bg-amber-600 text-white shadow-sm' 
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        <Lock size={13} />
                                        <span>Lock Task</span>
                                    </button>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Admin Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Enter 8-digit admin password..."
                                        required
                                        autoFocus
                                        className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-widest"
                                    />
                                    <KeyRound size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Password is verified securely on the server.
                                </p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading || !adminPassword}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {submitLoading ? (
                                        <>
                                            <RefreshCw size={13} className="animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <span>Confirm {modalAction === 'unlock' ? 'Unlock' : 'Lock'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
