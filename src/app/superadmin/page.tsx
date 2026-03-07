'use client';
import { useState } from 'react';
import { useSuperAdmin } from './useSuperAdmin';
import {
    LayoutDashboard, FlaskConical, HelpCircle, BarChart3, Users, Medal, Bell,
    Plus, Trash2, Pencil, Play, Lock, X, Eye, RefreshCw, Upload, Send,
    Globe, Youtube, ChevronRight, LogOut, Shield, Loader2, Search, Save, Crown
} from 'lucide-react';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
    { id: 'tests', label: 'Test Engine', icon: <FlaskConical size={15} /> },
    { id: 'questions', label: 'Questions', icon: <HelpCircle size={15} /> },
    { id: 'results', label: 'Results', icon: <BarChart3 size={15} /> },
    { id: 'users', label: 'Users', icon: <Users size={15} /> },
    { id: 'gamification', label: 'Levels & Badges', icon: <Medal size={15} /> },
    { id: 'resources', label: 'Resources', icon: <Bell size={15} /> },
];

const inp = "w-full p-2.5 rounded-lg text-sm bg-[rgba(0,0,0,0.4)] border border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition";
const glassCard = "bg-[rgba(15,23,42,0.85)] backdrop-blur-xl border border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]";
const btn = "px-4 py-2 rounded-lg text-xs font-bold transition-all";

export default function SuperAdminPage() {
    const d = useSuperAdmin();
    const [tab, setTab] = useState('dashboard');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [sideOpen, setSideOpen] = useState(false);

    // Test form
    const emptyTest = { id: null as any, title: '', track_id: 'OLEVEL', mode: 'PRACTICE', duration_minutes: 30, total_marks: 20, xp_reward: 50, live_start: '', live_end: '', is_active: true, category: '' };
    const [testForm, setTestForm] = useState(emptyTest);
    const [saving, setSaving] = useState(false);

    // Question form
    const [selTestId, setSelTestId] = useState('');
    const [showQModal, setShowQModal] = useState(false);
    const [qForm, setQForm] = useState({ id: null as any, text: '', type: 'MCQ', marks: 1, difficulty: 'EASY', options: [{ text: '', is_correct: false }, { text: '', is_correct: false }] });
    const [importMode, setImportMode] = useState(false);
    const [importText, setImportText] = useState('');
    const [importLog, setImportLog] = useState('');

    // Result filters
    const [resTestId, setResTestId] = useState('');
    const [resUserId, setResUserId] = useState('');
    const [attemptDetail, setAttemptDetail] = useState<any>(null);

    // User search
    const [userSearch, setUserSearch] = useState('');
    const [profileModal, setProfileModal] = useState<any>(null);

    // Gamification
    const [levelForm, setLevelForm] = useState({ track_id: 'OLEVEL', level_no: '', required_xp: '', title: '' });
    const [editLevelId, setEditLevelId] = useState<string | null>(null);
    const [badgeForm, setBadgeForm] = useState({ badge_name: '', badge_icon: '', xp_reward: '', description: '' });
    const [editBadgeId, setEditBadgeId] = useState<string | null>(null);

    // Resources
    const [notifMsg, setNotifMsg] = useState('');
    const [notifLink, setNotifLink] = useState('');
    const [appForm, setAppForm] = useState({ name: '', link: '', icon: '' });
    const [videoForm, setVideoForm] = useState({ id: '', title: '' });

    // --------------- LOGIN ---------------
    if (!d.user || !d.isAdmin) return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#020617' }}>
            <div className={`${glassCard} w-full max-w-sm p-8 relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-rose-500" />
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Shield size={28} style={{ color: '#f59e0b' }} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wider font-mono">SUPER ADMIN</h1>
                    <p className="text-xs text-gray-400 mt-1">Knobly Web</p>
                </div>
                <form onSubmit={e => { e.preventDefault(); d.login(loginEmail, loginPass); }} className="flex flex-col gap-3">
                    <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" required className={inp} placeholder="Admin Identity" />
                    <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type="password" required className={inp} placeholder="Passcode" />
                    {d.authError && <div className="text-rose-400 text-xs text-center bg-rose-500/10 p-2 rounded border border-rose-500/20">{d.authError}</div>}
                    <button type="submit" disabled={d.loading} className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-lg text-sm mt-2 transition">
                        {d.loading ? 'AUTHENTICATING...' : 'ACCESS TERMINAL'}
                    </button>
                </form>
            </div>
        </div>
    );

    const filteredUsers = userSearch ? d.users.filter(u => (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase())) : d.users;

    // --------------- MAIN LAYOUT ---------------
    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#020617', color: '#e2e8f0' }}>
            <div className="flex flex-1 overflow-hidden relative">
                {/* Overlay */}
                {sideOpen && <div className="fixed inset-0 bg-black/80 z-20 md:hidden" onClick={() => setSideOpen(false)} />}

                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-slate-950 border-r border-white/5 flex flex-col transition-transform md:static md:translate-x-0 ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-black text-sm">K</div>
                            <div><div className="text-xs font-bold text-white">ADMIN OS</div><div className="text-[9px] text-gray-500">v7.0 Next.js</div></div>
                        </div>
                        <button onClick={() => setSideOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X size={18} /></button>
                    </div>
                    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => { setTab(t.id); setSideOpen(false); if (t.id === 'results') d.loadResults(); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-3 border-t border-white/5 bg-black/20">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                                {d.user?.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden flex-1"><div className="text-[10px] font-bold text-white truncate">{d.user?.email}</div><div className="text-[9px] text-amber-500 font-bold">Super Admin</div></div>
                        </div>
                        <button onClick={d.logout} className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded border border-rose-500/10 flex items-center justify-center gap-1">
                            <LogOut size={11} /> LOGOUT
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="h-12 shrink-0 border-b border-white/5 flex items-center justify-between px-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSideOpen(true)} className="md:hidden text-white"><ChevronRight size={20} /></button>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">{TABS.find(t => t.id === tab)?.label}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {d.syncing && <span className="text-[10px] text-amber-500 flex items-center gap-1 animate-pulse"><Loader2 size={11} className="animate-spin" />SYNCING</span>}
                            <button onClick={d.refreshAll} className="w-7 h-7 rounded hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"><RefreshCw size={14} /></button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-5">

                        {/* ════ DASHBOARD ════ */}
                        {tab === 'dashboard' && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Users', value: d.stats.users, color: '#3b82f6' },
                                    { label: 'Total Tests', value: d.stats.tests, color: '#10b981' },
                                    { label: 'Questions', value: d.stats.questions, color: '#8b5cf6' },
                                    { label: 'Total Apps', value: d.stats.apps, color: '#f59e0b' },
                                ].map((s, i) => (
                                    <div key={i} className={`${glassCard} p-4`} style={{ borderLeft: `3px solid ${s.color}` }}>
                                        <div className="text-gray-400 text-[10px] font-bold uppercase mb-1">{s.label}</div>
                                        <div className="text-2xl font-bold text-white font-mono">{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ════ TESTS ════ */}
                        {tab === 'tests' && (
                            <div className="flex flex-col lg:flex-row gap-5 h-full">
                                <div className="w-full lg:w-1/3 flex flex-col gap-2">
                                    <button onClick={() => setTestForm(emptyTest)} className="w-full py-2.5 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-white text-xs font-bold flex items-center justify-center gap-2 transition">
                                        <Plus size={14} /> CREATE NEW TEST
                                    </button>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[65vh]">
                                        {d.tests.map(t => (
                                            <div key={t.id} onClick={() => setTestForm({ ...t })} className={`p-3 rounded-lg border cursor-pointer transition-all group relative ${testForm.id === t.id ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-white text-xs truncate w-3/4">{t.title}</h4>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${t.mode === 'LIVE' ? 'text-rose-400 border-rose-400/30' : 'text-emerald-400 border-emerald-400/30'}`}>{t.mode}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500">{t.track_id} • {t.total_marks}mk • {t.duration_minutes}m • {t.category || 'General'}</div>
                                                <button onClick={e => { e.stopPropagation(); if (confirm('Delete test?')) d.deleteTest(t.id); }} className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`w-full lg:w-2/3 ${glassCard} p-5 overflow-y-auto`}>
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Pencil size={14} className="text-amber-500" /> {testForm.id ? 'EDIT TEST' : 'NEW TEST'}</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Title</label><input value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })} className={inp} /></div>
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Track</label>
                                                <select value={testForm.track_id} onChange={e => setTestForm({ ...testForm, track_id: e.target.value })} className={inp}><option value="OLEVEL">OLEVEL</option><option value="CCC">CCC</option></select></div>
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Mode</label>
                                                <select value={testForm.mode} onChange={e => setTestForm({ ...testForm, mode: e.target.value })} className={inp}><option value="PRACTICE">PRACTICE</option><option value="LIVE">LIVE</option></select></div>
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Category</label><input value={testForm.category || ''} onChange={e => setTestForm({ ...testForm, category: e.target.value })} className={inp} placeholder="e.g. Python, IT Tools" /></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Minutes</label><input value={testForm.duration_minutes} onChange={e => setTestForm({ ...testForm, duration_minutes: Number(e.target.value) })} type="number" className={inp} /></div>
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Marks</label><input value={testForm.total_marks} onChange={e => setTestForm({ ...testForm, total_marks: Number(e.target.value) })} type="number" className={inp} /></div>
                                            <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">XP Reward</label><input value={testForm.xp_reward} onChange={e => setTestForm({ ...testForm, xp_reward: Number(e.target.value) })} type="number" className={inp} /></div>
                                        </div>
                                        {testForm.mode === 'LIVE' && (
                                            <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div><label className="text-[10px] font-bold text-amber-500/80 uppercase block mb-1">Live Start</label><input value={testForm.live_start || ''} onChange={e => setTestForm({ ...testForm, live_start: e.target.value })} type="datetime-local" className={inp} /></div>
                                                <div><label className="text-[10px] font-bold text-amber-500/80 uppercase block mb-1">Live End</label><input value={testForm.live_end || ''} onChange={e => setTestForm({ ...testForm, live_end: e.target.value })} type="datetime-local" className={inp} /></div>
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-3 pt-2">
                                            {testForm.id && <button onClick={() => setTestForm(emptyTest)} className={`${btn} text-gray-400 hover:text-white`}>CANCEL</button>}
                                            <button onClick={async () => { setSaving(true); await d.saveTest(testForm); setTestForm(emptyTest); setSaving(false); }} disabled={saving} className={`${btn} bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2`}>
                                                {saving && <Loader2 size={12} className="animate-spin" />} {testForm.id ? 'UPDATE' : 'CREATE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ════ QUESTIONS ════ */}
                        {tab === 'questions' && (
                            <div className="space-y-4">
                                <div className={`${glassCard} p-4 flex flex-col md:flex-row md:items-center gap-3`}>
                                    <HelpCircle size={20} className="text-amber-500 hidden md:block" />
                                    <select value={selTestId} onChange={e => { setSelTestId(e.target.value); if (e.target.value) d.loadQuestions(e.target.value); }} className={`${inp} md:w-96`}>
                                        <option value="">-- Select a Test --</option>
                                        {d.tests.map(t => <option key={t.id} value={t.id}>{t.title} ({t.track_id})</option>)}
                                    </select>
                                    {selTestId && <>
                                        <button onClick={() => { setQForm({ id: null, text: '', type: 'MCQ', marks: 1, difficulty: 'EASY', options: [{ text: '', is_correct: false }, { text: '', is_correct: false }] }); setShowQModal(true); }} className={`${btn} bg-emerald-600/20 text-emerald-400 border border-emerald-600/50`}><Plus size={12} className="inline mr-1" />ADD</button>
                                        <button onClick={() => setImportMode(!importMode)} className={`${btn} bg-blue-600/20 text-blue-400 border border-blue-600/50`}><Upload size={12} className="inline mr-1" />{importMode ? 'CLOSE' : 'IMPORT'}</button>
                                    </>}
                                </div>
                                {importMode && selTestId && (
                                    <div className={`${glassCard} p-4 border border-blue-500/30 grid grid-cols-1 md:grid-cols-2 gap-4`}>
                                        <div>
                                            <h3 className="text-xs font-bold text-blue-400 uppercase mb-2">1. Paste Questions</h3>
                                            <textarea value={importText} onChange={e => setImportText(e.target.value)} className={`${inp} h-48 font-mono text-xs`} placeholder="Paste formatted text..." />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-emerald-400 uppercase mb-2">2. Format (A-D)</h3>
                                            <div className="bg-black/30 p-3 rounded text-[10px] font-mono text-gray-300 border border-white/5">
                                                <div className="text-amber-500">What is CPU?<br />A. Monitor<br />B. Processor*<br />C. Mouse<br />D. Keys<br />Marks: 1</div>
                                                <div className="text-gray-400 mt-2 text-[9px]">* = Correct • Empty line between Qs</div>
                                            </div>
                                            <button onClick={async () => { setImportLog('Importing...'); const c = await d.importQuestions(selTestId, importText); setImportLog(`✅ Imported ${c} questions!`); setImportText(''); }} className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs">PROCESS & IMPORT</button>
                                            {importLog && <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-black/40 p-2 rounded">{importLog}</div>}
                                        </div>
                                    </div>
                                )}
                                {selTestId && (
                                    <div className={`${glassCard} rounded-xl overflow-hidden overflow-x-auto`}>
                                        <table className="w-full text-left text-sm min-w-[600px]">
                                            <thead className="bg-white/5 text-gray-400 text-xs uppercase"><tr><th className="p-3 w-10 text-center">#</th><th className="p-3">Question Text</th><th className="p-3 w-24">Type</th><th className="p-3 w-20 text-center">Marks</th><th className="p-3 w-28 text-center">Actions</th></tr></thead>
                                            <tbody className="divide-y divide-white/5">
                                                {d.questions.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500 text-xs">No questions. Add or import.</td></tr>}
                                                {d.questions.map((q: any, i) => (
                                                    <tr key={q.id} className="hover:bg-white/5">
                                                        <td className="p-3 text-center text-gray-500">{i + 1}</td>
                                                        <td className="p-3 truncate max-w-lg">{q.question_text}</td>
                                                        <td className="p-3 text-xs"><span className="px-2 py-0.5 rounded bg-white/10">{q.question_type}</span></td>
                                                        <td className="p-3 text-center font-mono">{q.marks}</td>
                                                        <td className="p-3 text-center flex justify-center gap-2">
                                                            <button onClick={async () => { const opts = await d.getOptionsForQuestion(q.id); setQForm({ id: q.id, text: q.question_text, type: q.question_type, marks: q.marks, difficulty: q.difficulty, options: opts.map((o: any) => ({ text: o.option_text, is_correct: o.is_correct })) }); setShowQModal(true); }} className="text-blue-400 hover:text-white"><Pencil size={13} /></button>
                                                            <button onClick={() => { if (confirm('Delete?')) d.deleteQuestion(q.id, selTestId); }} className="text-red-400 hover:text-white"><Trash2 size={13} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ════ RESULTS ════ */}
                        {tab === 'results' && (
                            <div className="space-y-4">
                                <div className={`${glassCard} p-4 flex flex-col md:flex-row gap-3 md:items-center`}>
                                    <span className="text-xs font-bold text-amber-500 uppercase">Filters:</span>
                                    <select value={resTestId} onChange={e => setResTestId(e.target.value)} className={`${inp} md:w-56`}><option value="">All Tests</option>{d.tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
                                    <select value={resUserId} onChange={e => setResUserId(e.target.value)} className={`${inp} md:w-56`}><option value="">All Users</option>{d.users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select>
                                    <button onClick={() => d.loadResults(resTestId, resUserId)} className={`${btn} bg-amber-600 text-black`}>APPLY</button>
                                </div>
                                <div className={`${glassCard} rounded-xl overflow-hidden overflow-x-auto`}>
                                    <table className="w-full text-left text-sm min-w-[700px]">
                                        <thead className="bg-white/5 text-gray-400 text-xs uppercase"><tr><th className="p-3">Student</th><th className="p-3">Test</th><th className="p-3 text-center">Score</th><th className="p-3 text-center">Acc%</th><th className="p-3 text-center">XP</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Detail</th></tr></thead>
                                        <tbody className="divide-y divide-white/5">
                                            {d.results.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500 text-xs">No results.</td></tr>}
                                            {d.results.map((r: any) => (
                                                <tr key={r.id} className="hover:bg-white/5">
                                                    <td className="p-3 font-medium text-white">{d.users.find(u => u.id === r.user_id)?.full_name || r.user_id}</td>
                                                    <td className="p-3 text-xs text-gray-400">{d.tests.find(t => t.id === r.test_id)?.title || r.test_id}</td>
                                                    <td className="p-3 text-center font-bold text-emerald-400">{r.score}</td>
                                                    <td className="p-3 text-center font-mono">{r.accuracy}%</td>
                                                    <td className="p-3 text-center text-amber-400">+{r.xp_earned}</td>
                                                    <td className="p-3 text-center"><span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${r.status === 'COMPLETED' ? 'border-emerald-500/30 text-emerald-400' : 'border-blue-500/30 text-blue-400'}`}>{r.status}</span></td>
                                                    <td className="p-3 text-center"><button onClick={async () => { const det = await d.viewAttemptDetail(r); setAttemptDetail(det); }} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">VIEW</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ════ USERS ════ */}
                        {tab === 'users' && (
                            <div className="space-y-4">
                                <div className="relative"><Search size={14} className="absolute left-3 top-3 text-gray-500" /><input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email..." className={`${inp} pl-9`} /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className={`${glassCard} p-4 flex items-center justify-between`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">{u.full_name ? u.full_name.substring(0, 2).toUpperCase() : 'UN'}</div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-white text-xs truncate">{u.full_name || 'No Name'}</div>
                                                    <div className="text-[10px] text-gray-500 truncate">{u.email}</div>
                                                    <div className="flex gap-1 mt-0.5">
                                                        <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 rounded">{u.exam_track}</span>
                                                        {u.role === 'admin' && <span className="text-[8px] bg-red-500/10 text-red-500 px-1 rounded">ADMIN</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <button onClick={async () => { const p = await d.getUserProfile(u); setProfileModal(p); }} className="text-[10px] text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded hover:bg-blue-500/10">PROFILE</button>
                                                {u.id !== d.user?.uid && <button onClick={() => { if (confirm('Delete?')) d.deleteUser(u.id); }} className="text-[10px] text-red-400 border border-red-500/30 px-2 py-0.5 rounded hover:bg-red-500/10">DELETE</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ════ GAMIFICATION ════ */}
                        {tab === 'gamification' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Levels */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider border-b border-white/10 pb-2">Levels</h3>
                                    <div className={`${glassCard} p-4 space-y-3`}>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input value={levelForm.level_no} onChange={e => setLevelForm({ ...levelForm, level_no: e.target.value })} type="number" placeholder="Lvl No" className={inp} />
                                            <input value={levelForm.required_xp} onChange={e => setLevelForm({ ...levelForm, required_xp: e.target.value })} type="number" placeholder="Req XP" className={inp} />
                                            <input value={levelForm.title} onChange={e => setLevelForm({ ...levelForm, title: e.target.value })} placeholder="Title (e.g. Novice)" className={`${inp} col-span-2`} />
                                            <select value={levelForm.track_id} onChange={e => setLevelForm({ ...levelForm, track_id: e.target.value })} className={`${inp} col-span-2`}><option value="OLEVEL">OLEVEL</option><option value="CCC">CCC</option></select>
                                        </div>
                                        <div className="flex gap-2">
                                            {editLevelId && <button onClick={() => { setEditLevelId(null); setLevelForm({ track_id: 'OLEVEL', level_no: '', required_xp: '', title: '' }); }} className={`${btn} w-1/3 bg-gray-700 text-white`}>CANCEL</button>}
                                            <button onClick={async () => { await d.saveLevel(levelForm, editLevelId || undefined); setEditLevelId(null); setLevelForm({ track_id: 'OLEVEL', level_no: '', required_xp: '', title: '' }); }} className={`${btn} flex-1 bg-amber-600 text-black`}>{editLevelId ? 'UPDATE' : 'ADD LEVEL'}</button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                        {d.levels.map((l: any) => (
                                            <div key={l.id} className={`${glassCard} p-3 flex justify-between items-center text-xs group hover:border-amber-500/30 transition`}>
                                                <div><span className="font-bold text-white">Lv {l.level_no}: {l.title}</span><div className="text-[10px] text-gray-500">{l.track_id} • {l.required_xp} XP</div></div>
                                                <div className="flex gap-1 opacity-60 group-hover:opacity-100">
                                                    <button onClick={() => { setEditLevelId(l.id); setLevelForm(l); }} className="text-blue-400 hover:text-white p-1"><Pencil size={12} /></button>
                                                    <button onClick={() => { if (confirm('Delete?')) d.deleteLevel(l.id); }} className="text-red-400 hover:text-white p-1"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Badges */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider border-b border-white/10 pb-2">Badges</h3>
                                    <div className={`${glassCard} p-4 space-y-3`}>
                                        <input value={badgeForm.badge_name} onChange={e => setBadgeForm({ ...badgeForm, badge_name: e.target.value })} placeholder="Badge Name" className={inp} />
                                        <input value={badgeForm.badge_icon} onChange={e => setBadgeForm({ ...badgeForm, badge_icon: e.target.value })} placeholder="Icon (e.g. ph-medal)" className={inp} />
                                        <textarea value={badgeForm.description} onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })} placeholder="Description" className={`${inp} h-14 resize-none`} />
                                        <input value={badgeForm.xp_reward} onChange={e => setBadgeForm({ ...badgeForm, xp_reward: e.target.value })} type="number" placeholder="XP Reward" className={inp} />
                                        <div className="flex gap-2">
                                            {editBadgeId && <button onClick={() => { setEditBadgeId(null); setBadgeForm({ badge_name: '', badge_icon: '', xp_reward: '', description: '' }); }} className={`${btn} w-1/3 bg-gray-700 text-white`}>CANCEL</button>}
                                            <button onClick={async () => { await d.saveBadge(badgeForm, editBadgeId || undefined); setEditBadgeId(null); setBadgeForm({ badge_name: '', badge_icon: '', xp_reward: '', description: '' }); }} className={`${btn} flex-1 bg-emerald-600 text-white`}>{editBadgeId ? 'UPDATE' : 'ADD BADGE'}</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                                        {d.badges.map((b: any) => (
                                            <div key={b.id} onClick={() => { setEditBadgeId(b.id); setBadgeForm(b); }} className={`${glassCard} p-3 cursor-pointer group hover:border-emerald-500/30 transition relative`}>
                                                <div className="flex justify-between"><Medal size={16} className="text-emerald-400" /><span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">+{b.xp_reward} XP</span></div>
                                                <div className="font-bold text-xs text-white mt-1 truncate">{b.badge_name}</div>
                                                <div className="text-[10px] text-gray-400 truncate">{b.description || 'No description'}</div>
                                                <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) d.deleteBadge(b.id); }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 p-1 rounded transition"><Trash2 size={11} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ════ RESOURCES ════ */}
                        {tab === 'resources' && (
                            <div className="space-y-5">
                                {/* Notifications */}
                                <div className={`${glassCard} p-5`}>
                                    <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2"><Bell size={15} /> Broadcast Notification</h3>
                                    <div className="flex gap-3"><input value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Message..." className={`${inp} flex-1`} /><input value={notifLink} onChange={e => setNotifLink(e.target.value)} placeholder="Link (opt)" className={`${inp} w-1/3 hidden md:block`} /><button onClick={async () => { if (!notifMsg) return; await d.sendNotification(notifMsg, notifLink); setNotifMsg(''); setNotifLink(''); alert('Sent!'); }} className={`${btn} bg-sky-600 text-white`}><Send size={12} className="inline mr-1" />SEND</button></div>
                                    <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                                        {d.notifications.length === 0 && <div className="text-xs text-gray-500 italic">No notifications.</div>}
                                        {d.notifications.map(n => (
                                            <div key={n.id} className="flex justify-between items-center p-2 border-b border-white/5 hover:bg-white/5">
                                                <div className="text-xs text-white break-words pr-2">{n.message} {n.link && <span className="text-blue-400 text-[10px]">({n.link})</span>}</div>
                                                <button onClick={() => d.deleteNotification(n.id)} className="text-red-400 text-xs hover:text-white shrink-0">Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Apps */}
                                <div className={`${glassCard} p-5`}>
                                    <h3 className="text-sm font-bold text-white mb-3">Global Apps</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input value={appForm.name} onChange={e => setAppForm({ ...appForm, name: e.target.value })} placeholder="App Name" className={inp} />
                                        <input value={appForm.link} onChange={e => setAppForm({ ...appForm, link: e.target.value })} placeholder="URL" className={`${inp} md:col-span-2`} />
                                        <input value={appForm.icon} onChange={e => setAppForm({ ...appForm, icon: e.target.value })} placeholder="Icon (ph-globe)" className={inp} />
                                    </div>
                                    <button onClick={async () => { await d.deployApp(appForm.name, appForm.link, appForm.icon); setAppForm({ name: '', link: '', icon: '' }); }} className={`${btn} mt-3 bg-amber-600 text-black`}>DEPLOY</button>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {d.apps.map(a => (
                                            <div key={a.id} className="bg-white/5 border border-white/10 rounded px-3 py-2 flex items-center gap-2">
                                                <Globe size={13} className="text-amber-500" /><span className="text-xs text-white">{a.name}</span>
                                                <button onClick={() => d.deleteApp(a.id)} className="text-red-400 ml-1 hover:text-white"><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Videos */}
                                <div className={`${glassCard} p-5`}>
                                    <h3 className="text-sm font-bold text-white mb-3">YouTube Videos</h3>
                                    <div className="flex gap-3">
                                        <input value={videoForm.id} onChange={e => setVideoForm({ ...videoForm, id: e.target.value })} placeholder="Video ID" className={`${inp} w-32`} />
                                        <input value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="Title" className={`${inp} flex-1`} />
                                        <button onClick={async () => { await d.publishVideo(videoForm.id, videoForm.title); setVideoForm({ id: '', title: '' }); }} className={`${btn} bg-red-600 text-white`}><Youtube size={12} className="inline mr-1" />PUBLISH</button>
                                    </div>
                                    <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
                                        {d.videos.map(v => (
                                            <div key={v.id} className="flex items-center gap-3 bg-white/5 p-2 rounded hover:bg-white/10">
                                                <img src={`https://img.youtube.com/vi/${v.youtube_id}/default.jpg`} className="w-12 h-9 object-cover rounded" alt="" />
                                                <div className="flex-1 min-w-0 text-xs text-white truncate">{v.title}</div>
                                                <button onClick={() => d.deleteVideo(v.id)} className="text-red-500 p-1"><Trash2 size={13} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ════ QUESTION MODAL ════ */}
            {showQModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className={`${glassCard} w-full max-w-lg p-5 border border-amber-500/20 max-h-[90vh] overflow-y-auto`}>
                        <h3 className="text-sm font-bold text-white mb-4">{qForm.id ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}</h3>
                        <div className="space-y-3">
                            <textarea value={qForm.text} onChange={e => setQForm({ ...qForm, text: e.target.value })} className={`${inp} h-20`} placeholder="Question text..." />
                            <div className="grid grid-cols-3 gap-2">
                                <select value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value })} className={inp}><option value="MCQ">MCQ</option><option value="TF">True/False</option><option value="SHORT">Short</option></select>
                                <input value={qForm.marks} onChange={e => setQForm({ ...qForm, marks: Number(e.target.value) })} type="number" className={inp} placeholder="Marks" />
                                <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })} className={inp}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select>
                            </div>
                            {qForm.type !== 'SHORT' && (
                                <div className="bg-black/20 p-3 rounded space-y-2">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Options</div>
                                    {qForm.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="radio" name="correctOpt" checked={opt.is_correct} onChange={() => setQForm({ ...qForm, options: qForm.options.map((o, i) => ({ ...o, is_correct: i === idx })) })} className="accent-emerald-500" />
                                            <input value={opt.text} onChange={e => setQForm({ ...qForm, options: qForm.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) })} className={`${inp} flex-1`} placeholder="Option text" />
                                            <button onClick={() => setQForm({ ...qForm, options: qForm.options.filter((_, i) => i !== idx) })} className="text-red-400"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setQForm({ ...qForm, options: [...qForm.options, { text: '', is_correct: false }] })} className="text-xs text-blue-400 font-bold">+ Add Option</button>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setShowQModal(false)} className={`${btn} text-gray-400`}>CANCEL</button>
                                <button onClick={async () => { await d.saveQuestion(selTestId, qForm); setShowQModal(false); }} className={`${btn} bg-emerald-600 text-white`}>SAVE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════ ATTEMPT DETAIL MODAL ════ */}
            {attemptDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className={`${glassCard} w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto relative`}>
                        <button onClick={() => setAttemptDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                        <h3 className="text-lg font-bold text-white mb-1">Attempt Analysis</h3>
                        <div className="text-xs text-gray-400 mb-4">User: {attemptDetail.userName} | Test: {attemptDetail.testTitle}</div>
                        <div className="space-y-3">
                            {attemptDetail.questions.map((q: any, i: number) => (
                                <div key={i} className="bg-white/5 p-4 rounded border border-white/5">
                                    <div className="text-sm font-bold text-white mb-2">{i + 1}. {q.text}</div>
                                    <div className="space-y-1 ml-4">
                                        {q.options.map((opt: any) => (
                                            <div key={opt.id} className={`text-xs p-1 rounded ${opt.is_correct ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : q.userSelected === opt.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400'}`}>
                                                {q.userSelected === opt.id ? '● ' : '○ '}{opt.option_text}
                                                {opt.is_correct && <span className="ml-2 font-bold text-[9px] uppercase">Correct</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {attemptDetail.questions.length === 0 && <div className="text-center text-gray-500 text-xs">No response data.</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* ════ PROFILE MODAL ════ */}
            {profileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className={`${glassCard} w-full max-w-md p-6 relative`}>
                        <button onClick={() => setProfileModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">{profileModal.full_name?.substring(0, 1)}</div>
                            <h3 className="text-xl font-bold text-white">{profileModal.full_name}</h3>
                            <div className="text-xs text-gray-400 font-mono">{profileModal.email}</div>
                            <div className="mt-2 text-amber-500 font-bold">{profileModal.total_xp || 0} XP</div>
                        </div>
                        <div><div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Badges</div>
                            <div className="flex flex-wrap gap-2">
                                {profileModal.badgeNames?.map((b: string, i: number) => <div key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400">{b}</div>)}
                                {(!profileModal.badgeNames || profileModal.badgeNames.length === 0) && <div className="text-xs text-gray-600">No badges earned yet.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
