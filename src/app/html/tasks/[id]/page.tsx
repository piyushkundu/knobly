'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    ArrowLeft, Home, FileCode, ChevronLeft, ChevronRight, 
    Lock, Shield, KeyRound, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

const TASKS: Record<string, { title: string; file: string }> = {
    '1': { title: 'My Profile Page', file: 'task1.html' },
    '2': { title: 'Basic HTML Tags', file: 'task2.html' },
    '3': { title: 'India - A Diverse Nation', file: 'task3.html' },
    '4': { title: 'Indian History Timeline', file: 'task4(1).html' },
    '5': { title: 'Operating Systems (Lists)', file: 'task5.html' },
    '5.1': { title: 'Operating Systems (Table)', file: 'task5.1.html' },
    '5.2': { title: 'Internet Usage Statistics', file: 'task5.2.html' },
    '5.3': { title: 'History of the Internet', file: 'task5.3.html' },
    '5.4': { title: 'Wonders of Space', file: 'task5.4.html' },
    '6': { title: 'Weekly Study Schedule', file: 'task6.html' },
    '7': { title: 'Simple Webpage (No CSS)', file: 'task7.html' },
    '8': { title: 'Registration Form', file: 'task8.html' },
    '9': { title: 'Solar System Basics', file: 'task9.html' },
    '10': { title: 'Full Website Layout', file: 'task10.html' },
    '11': { title: 'Premium Demo Website', file: 'task11.html' },
};

const TASK_ORDER = ['1', '2', '3', '4', '5', '5.1', '5.2', '5.3', '5.4', '6', '7', '8', '9', '10', '11'];

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const task = TASKS[id];
    const currentIndex = TASK_ORDER.indexOf(id);
    const prevId = currentIndex > 0 ? TASK_ORDER[currentIndex - 1] : null;
    const nextId = currentIndex < TASK_ORDER.length - 1 ? TASK_ORDER[currentIndex + 1] : null;

    const [unlocked, setUnlocked] = useState<boolean | null>(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPasswordBox, setShowPasswordBox] = useState(false);

    const checkLockStatus = async () => {
        // Immediate check from localStorage
        try {
            const cached = localStorage.getItem('knobly_unlocked_html_tasks');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.includes(id)) {
                    setUnlocked(true);
                }
            }
        } catch (e) {}

        try {
            const res = await fetch('/api/html-tasks', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                const isUnlocked = Array.isArray(data.unlockedTasks) && data.unlockedTasks.includes(id);
                setUnlocked(isUnlocked);
                if (Array.isArray(data.unlockedTasks)) {
                    try {
                        localStorage.setItem('knobly_unlocked_html_tasks', JSON.stringify(data.unlockedTasks));
                    } catch (e) {}
                }
            } else {
                setUnlocked((prev) => (prev !== null ? prev : false));
            }
        } catch {
            setUnlocked((prev) => (prev !== null ? prev : false));
        }
    };

    useEffect(() => {
        checkLockStatus();
        if (id) {
            try {
                const raw = localStorage.getItem('knobly_opened_html_tasks');
                const list: string[] = raw ? JSON.parse(raw) : [];
                if (!list.includes(id)) {
                    list.push(id);
                    localStorage.setItem('knobly_opened_html_tasks', JSON.stringify(list));
                }
            } catch (e) {}
        }
    }, [id]);

    const handleUnlockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const res = await fetch('/api/html-tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: adminPassword,
                    taskId: id,
                    action: 'unlock',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Password verification failed');
            } else {
                // Update localStorage with unlocked task
                try {
                    const cached = localStorage.getItem('knobly_unlocked_html_tasks');
                    let list: string[] = cached ? JSON.parse(cached) : [];
                    if (!list.includes(id)) list.push(id);
                    localStorage.setItem('knobly_unlocked_html_tasks', JSON.stringify(list));
                } catch (e) {}

                setSuccessMsg('Task unlocked successfully!');
                setTimeout(() => {
                    setUnlocked(true);
                }, 600);
            }
        } catch {
            setErrorMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ color: '#1f2937' }}>
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Task Not Found</h1>
                    <p className="text-xs text-gray-500 mb-4">The requested task #{id} does not exist.</p>
                    <Link href="/html/tasks" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors">
                        ← Back to Tasks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ color: '#1f2937' }}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 shrink-0" title="Go Back"><ArrowLeft size={20} /></button>
                        <FileCode size={16} className="text-blue-600 shrink-0" />
                        <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate">Task {id}: {task.title}</h1>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {unlocked && (
                            <Link
                                href={`/html/tasks/${id}/compiler`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm transition-all mr-1"
                            >
                                <FileCode size={13} />
                                <span className="hidden sm:inline">Start in Compiler</span>
                                <span className="sm:hidden">Compiler</span>
                            </Link>
                        )}
                        {prevId && (
                            <Link href={`/html/tasks/${prevId}`} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors" title={`Task ${prevId}`}>
                                <ChevronLeft size={16} />
                            </Link>
                        )}
                        {nextId && (
                            <Link href={`/html/tasks/${nextId}`} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors" title={`Task ${nextId}`}>
                                <ChevronRight size={16} />
                            </Link>
                        )}
                        <Link href="/" className="text-gray-500 hover:text-gray-900 ml-1"><Home size={18} /></Link>
                    </div>
                </div>
            </header>

            {/* Content State: Loading, Locked, or Unlocked */}
            {unlocked === null ? (
                <div className="flex-1 flex items-center justify-center bg-slate-50">
                    <div className="text-center text-slate-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-orange-500" />
                        <p className="text-xs font-medium">Checking task status...</p>
                    </div>
                </div>
            ) : !unlocked ? (
                <div className="flex-1 flex items-center justify-center p-4 bg-slate-100/70">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-xl text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Lock size={28} />
                        </div>

                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block mb-2">
                            Locked by Instructor
                        </span>

                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Task #{id}: {task.title}
                        </h2>

                        <p className="text-xs text-slate-500 leading-relaxed mb-6">
                            This practice task is locked to follow the step-by-step syllabus. Complete the related tags in the Elements guide first or request your instructor to unlock it.
                        </p>

                        {!showPasswordBox ? (
                            <div className="space-y-3">
                                <Link
                                    href="/html/elements"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
                                >
                                    <span>Learn Required Tags in Elements Guide</span>
                                </Link>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                                        ← Back to Tasks
                                    </button>

                                    {/* Small Lock Icon for Admin */}
                                    <button
                                        onClick={() => setShowPasswordBox(true)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-700 transition-colors p-1"
                                        title="Admin Unlock"
                                    >
                                        <Lock size={12} />
                                        <span>Admin Unlock</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUnlockSubmit} className="space-y-3 text-left pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Shield size={13} className="text-amber-600" />
                                        <span>Enter Admin Password</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordBox(false)}
                                        className="text-[11px] text-slate-400 hover:text-slate-600"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {errorMsg && (
                                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                                        <span>{errorMsg}</span>
                                    </div>
                                )}

                                {successMsg && (
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        type="password"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Admin password..."
                                        autoFocus
                                        required
                                        className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <KeyRound size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !adminPassword}
                                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw size={13} className="animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <span>Unlock Task Now</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                /* Iframe content when unlocked */
                <div className="flex-1 bg-white relative">
                    <iframe
                        src={`/html-tasks/${task.file}`}
                        className="w-full h-[calc(100vh-49px)] border-0"
                        title={task.title}
                    />
                    {/* Floating Compiler Button */}
                    <Link
                        href={`/html/tasks/${id}/compiler`}
                        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-xs font-bold shadow-2xl hover:scale-105 transition-all duration-200"
                        style={{
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            boxShadow: '0 8px 30px rgba(249, 115, 22, 0.4)',
                        }}
                    >
                        <FileCode size={16} />
                        <span>Start Project in Compiler</span>
                        <ChevronRight size={14} />
                    </Link>
                </div>
            )}
        </div>
    );
}
