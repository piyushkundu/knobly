'use client';
import { useState } from 'react';
import { useSuperAdmin } from './useSuperAdmin';
import {
    LayoutDashboard, FlaskConical, HelpCircle, BarChart3, Users, Medal, Bell,
    Plus, Trash2, Pencil, Play, Lock, X, Eye, RefreshCw, Upload, Send,
    Globe, Youtube, ChevronRight, LogOut, Shield, Loader2, Search, Save, Crown, Menu
} from 'lucide-react';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} />, color: '#6366f1' },
    { id: 'tests', label: 'Test Engine', icon: <FlaskConical size={15} />, color: '#8b5cf6' },
    { id: 'questions', label: 'Questions', icon: <HelpCircle size={15} />, color: '#06b6d4' },
    { id: 'results', label: 'Results', icon: <BarChart3 size={15} />, color: '#10b981' },
    { id: 'users', label: 'Users', icon: <Users size={15} />, color: '#f59e0b' },
    { id: 'gamification', label: 'Levels & Badges', icon: <Medal size={15} />, color: '#ec4899' },
    { id: 'resources', label: 'Resources', icon: <Bell size={15} />, color: '#ef4444' },
];

const inp = "w-full p-2.5 rounded-xl text-sm bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition shadow-sm";
const card = "bg-white rounded-2xl border border-gray-100 shadow-sm";
const btn = "px-4 py-2 rounded-xl text-xs font-bold transition-all";

export default function SuperAdminPage() {
    const d = useSuperAdmin();
    const [tab, setTab] = useState('dashboard');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [sideOpen, setSideOpen] = useState(false);

    const emptyTest = { id: null as any, title: '', track_id: 'OLEVEL', mode: 'PRACTICE', duration_minutes: 30, total_marks: 20, xp_reward: 50, live_start: '', live_end: '', is_active: true, category: '' };
    const [testForm, setTestForm] = useState(emptyTest);
    const [saving, setSaving] = useState(false);
    const [selTestId, setSelTestId] = useState('');
    const [showQModal, setShowQModal] = useState(false);
    const [qForm, setQForm] = useState({ id: null as any, text: '', type: 'MCQ', marks: 1, difficulty: 'EASY', options: [{ text: '', is_correct: false }, { text: '', is_correct: false }] });
    const [importMode, setImportMode] = useState(false);
    const [importText, setImportText] = useState('');
    const [importLog, setImportLog] = useState('');
    const [resTestId, setResTestId] = useState('');
    const [resUserId, setResUserId] = useState('');
    const [attemptDetail, setAttemptDetail] = useState<any>(null);
    const [userSearch, setUserSearch] = useState('');
    const [profileModal, setProfileModal] = useState<any>(null);
    const [levelForm, setLevelForm] = useState({ track_id: 'OLEVEL', level_no: '', required_xp: '', title: '' });
    const [editLevelId, setEditLevelId] = useState<string | null>(null);
    const [badgeForm, setBadgeForm] = useState({ badge_name: '', badge_icon: '', xp_reward: '', description: '' });
    const [editBadgeId, setEditBadgeId] = useState<string | null>(null);
    const [notifMsg, setNotifMsg] = useState('');
    const [notifLink, setNotifLink] = useState('');
    const [appForm, setAppForm] = useState({ name: '', link: '', icon: '' });
    const [videoForm, setVideoForm] = useState({ id: '', title: '' });

    // ── LOGIN SCREEN ──
    if (!d.user || !d.isAdmin) return (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)' }}>
            <div className={`${card} w-full max-w-sm p-8 relative overflow-hidden shadow-2xl`}>
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <Shield size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-wide">SUPER ADMIN</h1>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Knobly Web Control Panel</p>
                </div>
                <form onSubmit={e => { e.preventDefault(); d.login(loginEmail, loginPass); }} className="flex flex-col gap-3">
                    <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" required className={inp} placeholder="Admin Email" />
                    <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type="password" required className={inp} placeholder="Password" />
                    {d.authError && <div className="text-red-600 text-xs text-center bg-red-50 p-2 rounded-xl border border-red-200">{d.authError}</div>}
                    <button type="submit" disabled={d.loading} className="text-white font-bold py-3 rounded-xl text-sm mt-2 transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {d.loading ? 'Authenticating...' : 'Access Panel'}
                    </button>
                </form>
            </div>
        </div>
    );

    const filteredUsers = userSearch ? d.users.filter(u => (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase())) : d.users;

    // ── MAIN LAYOUT ──
    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#f4f6fa' }}>
            <div className="flex flex-1 overflow-hidden relative">
                {sideOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm" onClick={() => setSideOpen(false)} />}

                {/* ── SIDEBAR ── */}
                <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform md:static md:translate-x-0 shadow-lg md:shadow-none ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>K</div>
                            <div><div className="text-sm font-black text-gray-900">Super Admin</div><div className="text-[9px] text-gray-400 font-semibold">Knobly Web v7.0</div></div>
                        </div>
                        <button onClick={() => setSideOpen(false)} className="md:hidden text-gray-400 hover:text-gray-900"><X size={18} /></button>
                    </div>
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => { setTab(t.id); setSideOpen(false); if (t.id === 'results') d.loadResults(); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                style={tab === t.id ? { background: t.color } : {}}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                {d.user?.email?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden flex-1"><div className="text-[10px] font-bold text-gray-900 truncate">{d.user?.email}</div><div className="text-[9px] text-indigo-500 font-bold">Super Admin</div></div>
                        </div>
                        <button onClick={d.logout} className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-[10px] font-bold rounded-lg border border-red-200 flex items-center justify-center gap-1 transition">
                            <LogOut size={11} /> Logout
                        </button>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="h-14 shrink-0 border-b border-gray-100 flex items-center justify-between px-4 bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSideOpen(true)} className="md:hidden text-gray-500"><Menu size={20} /></button>
                            <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white" style={{ background: TABS.find(t => t.id === tab)?.color }}>{TABS.find(t => t.id === tab)?.icon}</div>
                            <h2 className="text-sm font-black text-gray-900">{TABS.find(t => t.id === tab)?.label}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {d.syncing && <span className="text-[10px] text-indigo-500 flex items-center gap-1"><Loader2 size={11} className="animate-spin" />Syncing...</span>}
                            <button onClick={d.refreshAll} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition"><RefreshCw size={14} /></button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-5">

                        {/* ═══ DASHBOARD ═══ */}
                        {tab === 'dashboard' && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Users', value: d.stats.users, color: '#6366f1', bg: '#eef2ff', icon: <Users size={18} /> },
                                    { label: 'Total Tests', value: d.stats.tests, color: '#10b981', bg: '#ecfdf5', icon: <FlaskConical size={18} /> },
                                    { label: 'Questions', value: d.stats.questions, color: '#8b5cf6', bg: '#f5f3ff', icon: <HelpCircle size={18} /> },
                                    { label: 'Total Apps', value: d.stats.apps, color: '#f59e0b', bg: '#fffbeb', icon: <Globe size={18} /> },
                                ].map((s, i) => (
                                    <div key={i} className={`${card} p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5`}>
                                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                                        <div><div className="text-2xl font-black text-gray-900">{s.value}</div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</div></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ TESTS ═══ */}
                        {tab === 'tests' && (
                            <div className="flex flex-col lg:flex-row gap-5 h-full">
                                <div className="w-full lg:w-1/3 flex flex-col gap-2">
                                    <button onClick={() => setTestForm(emptyTest)} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-indigo-500 hover:border-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition bg-white">
                                        <Plus size={14} /> Create New Test
                                    </button>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[65vh]">
                                        {d.tests.map(t => (
                                            <div key={t.id} onClick={() => setTestForm({ ...t })} className={`${card} p-3.5 cursor-pointer transition-all group relative hover:shadow-md ${testForm.id === t.id ? 'ring-2 ring-indigo-500 border-indigo-200' : ''}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900 text-xs truncate w-3/4">{t.title}</h4>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${t.mode === 'LIVE' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>{t.mode}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium">{t.track_id} • {t.total_marks}mk • {t.duration_minutes}m</div>
                                                <button onClick={e => { e.stopPropagation(); if (confirm('Delete test?')) d.deleteTest(t.id); }} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`w-full lg:w-2/3 ${card} p-5 overflow-y-auto`}>
                                    <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2"><Pencil size={14} className="text-indigo-500" /> {testForm.id ? 'Edit Test' : 'New Test'}</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Title</label><input value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })} className={inp} /></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Track</label><select value={testForm.track_id} onChange={e => setTestForm({ ...testForm, track_id: e.target.value })} className={inp}><option value="OLEVEL">OLEVEL</option><option value="CCC">CCC</option></select></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Mode</label><select value={testForm.mode} onChange={e => setTestForm({ ...testForm, mode: e.target.value })} className={inp}><option value="PRACTICE">PRACTICE</option><option value="LIVE">LIVE</option></select></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Category</label><input value={testForm.category || ''} onChange={e => setTestForm({ ...testForm, category: e.target.value })} className={inp} placeholder="e.g. Python" /></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Minutes</label><input value={testForm.duration_minutes} onChange={e => setTestForm({ ...testForm, duration_minutes: Number(e.target.value) })} type="number" className={inp} /></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Marks</label><input value={testForm.total_marks} onChange={e => setTestForm({ ...testForm, total_marks: Number(e.target.value) })} type="number" className={inp} /></div>
                                            <div><label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">XP Reward</label><input value={testForm.xp_reward} onChange={e => setTestForm({ ...testForm, xp_reward: Number(e.target.value) })} type="number" className={inp} /></div>
                                        </div>
                                        {testForm.mode === 'LIVE' && (
                                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div><label className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Live Start</label><input value={testForm.live_start || ''} onChange={e => setTestForm({ ...testForm, live_start: e.target.value })} type="datetime-local" className={inp} /></div>
                                                <div><label className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Live End</label><input value={testForm.live_end || ''} onChange={e => setTestForm({ ...testForm, live_end: e.target.value })} type="datetime-local" className={inp} /></div>
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-3 pt-2">
                                            {testForm.id && <button onClick={() => setTestForm(emptyTest)} className={`${btn} text-gray-400 hover:text-gray-900`}>Cancel</button>}
                                            <button onClick={async () => { setSaving(true); await d.saveTest(testForm); setTestForm(emptyTest); setSaving(false); }} disabled={saving} className={`${btn} text-white flex items-center gap-2 shadow-lg`} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                {saving && <Loader2 size={12} className="animate-spin" />} {testForm.id ? 'Update' : 'Create'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ QUESTIONS ═══ */}
                        {tab === 'questions' && (
                            <div className="space-y-4">
                                <div className={`${card} p-4 flex flex-col md:flex-row md:items-center gap-3`}>
                                    <select value={selTestId} onChange={e => { setSelTestId(e.target.value); if (e.target.value) d.loadQuestions(e.target.value); }} className={`${inp} md:w-96`}>
                                        <option value="">-- Select a Test --</option>
                                        {d.tests.map(t => <option key={t.id} value={t.id}>{t.title} ({t.track_id})</option>)}
                                    </select>
                                    {selTestId && <>
                                        <button onClick={() => { setQForm({ id: null, text: '', type: 'MCQ', marks: 1, difficulty: 'EASY', options: [{ text: '', is_correct: false }, { text: '', is_correct: false }] }); setShowQModal(true); }} className={`${btn} bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100`}><Plus size={12} className="inline mr-1" />Add</button>
                                        <button onClick={() => setImportMode(!importMode)} className={`${btn} bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100`}><Upload size={12} className="inline mr-1" />{importMode ? 'Close' : 'Import'}</button>
                                    </>}
                                </div>
                                {importMode && selTestId && (
                                    <div className={`${card} p-4 border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4`}>
                                        <div><h3 className="text-xs font-bold text-blue-600 uppercase mb-2">1. Paste Questions</h3><textarea value={importText} onChange={e => setImportText(e.target.value)} className={`${inp} h-48 font-mono text-xs`} placeholder="Paste formatted text..." /></div>
                                        <div>
                                            <h3 className="text-xs font-bold text-emerald-600 uppercase mb-2">2. Format (A-D)</h3>
                                            <div className="bg-gray-50 p-3 rounded-xl text-[10px] font-mono text-gray-600 border border-gray-200">
                                                <div className="text-indigo-600">What is CPU?<br />A. Monitor<br />B. Processor*<br />C. Mouse<br />D. Keys<br />Marks: 1</div>
                                                <div className="text-gray-400 mt-2 text-[9px]">* = Correct • Empty line between Qs</div>
                                            </div>
                                            <button onClick={async () => { setImportLog('Importing...'); const c = await d.importQuestions(selTestId, importText); setImportLog(`✅ Imported ${c} questions!`); setImportText(''); }} className="w-full mt-3 py-2.5 text-white font-bold rounded-xl text-xs shadow-md" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>Process & Import</button>
                                            {importLog && <div className="mt-2 text-[10px] font-mono text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200">{importLog}</div>}
                                        </div>
                                    </div>
                                )}
                                {selTestId && (
                                    <div className={`${card} rounded-2xl overflow-hidden overflow-x-auto`}>
                                        <table className="w-full text-left text-sm min-w-[600px]">
                                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase border-b border-gray-100"><tr><th className="p-3 w-10 text-center">#</th><th className="p-3">Question Text</th><th className="p-3 w-24">Type</th><th className="p-3 w-20 text-center">Marks</th><th className="p-3 w-28 text-center">Actions</th></tr></thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {d.questions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400 text-xs">No questions. Add or import.</td></tr>}
                                                {d.questions.map((q: any, i) => (
                                                    <tr key={q.id} className="hover:bg-gray-50/50 transition">
                                                        <td className="p-3 text-center text-gray-400 font-bold">{i + 1}</td>
                                                        <td className="p-3 text-gray-700 truncate max-w-lg">{q.question_text}</td>
                                                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">{q.question_type}</span></td>
                                                        <td className="p-3 text-center font-bold text-gray-900">{q.marks}</td>
                                                        <td className="p-3 text-center flex justify-center gap-2">
                                                            <button onClick={async () => { const opts = await d.getOptionsForQuestion(q.id); setQForm({ id: q.id, text: q.question_text, type: q.question_type, marks: q.marks, difficulty: q.difficulty, options: opts.map((o: any) => ({ text: o.option_text, is_correct: o.is_correct })) }); setShowQModal(true); }} className="text-blue-500 hover:text-blue-700 p-1 rounded-lg hover:bg-blue-50"><Pencil size={13} /></button>
                                                            <button onClick={() => { if (confirm('Delete?')) d.deleteQuestion(q.id, selTestId); }} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"><Trash2 size={13} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══ RESULTS ═══ */}
                        {tab === 'results' && (
                            <div className="space-y-4">
                                <div className={`${card} p-4 flex flex-col md:flex-row gap-3 md:items-center`}>
                                    <span className="text-xs font-bold text-indigo-500 uppercase">Filters:</span>
                                    <select value={resTestId} onChange={e => setResTestId(e.target.value)} className={`${inp} md:w-56`}><option value="">All Tests</option>{d.tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
                                    <select value={resUserId} onChange={e => setResUserId(e.target.value)} className={`${inp} md:w-56`}><option value="">All Users</option>{d.users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select>
                                    <button onClick={() => d.loadResults(resTestId, resUserId)} className={`${btn} text-white shadow-md`} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Apply</button>
                                </div>
                                <div className={`${card} rounded-2xl overflow-hidden overflow-x-auto`}>
                                    <table className="w-full text-left text-sm min-w-[700px]">
                                        <thead className="bg-gray-50 text-gray-400 text-xs uppercase border-b border-gray-100"><tr><th className="p-3">Student</th><th className="p-3">Test</th><th className="p-3 text-center">Score</th><th className="p-3 text-center">Acc%</th><th className="p-3 text-center">XP</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Detail</th></tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {d.results.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-xs">No results.</td></tr>}
                                            {d.results.map((r: any) => (
                                                <tr key={r.id} className="hover:bg-gray-50/50">
                                                    <td className="p-3 font-bold text-gray-900">{d.users.find(u => u.id === r.user_id)?.full_name || r.user_id}</td>
                                                    <td className="p-3 text-xs text-gray-500">{d.tests.find(t => t.id === r.test_id)?.title || r.test_id}</td>
                                                    <td className="p-3 text-center font-bold text-emerald-600">{r.score}</td>
                                                    <td className="p-3 text-center font-bold">{r.accuracy}%</td>
                                                    <td className="p-3 text-center text-amber-500 font-bold">+{r.xp_earned}</td>
                                                    <td className="p-3 text-center"><span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${r.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{r.status}</span></td>
                                                    <td className="p-3 text-center"><button onClick={async () => { const det = await d.viewAttemptDetail(r); setAttemptDetail(det); }} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-bold transition">View</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ═══ USERS ═══ */}
                        {tab === 'users' && (
                            <div className="space-y-4">
                                <div className="relative"><Search size={14} className="absolute left-3 top-3.5 text-gray-400" /><input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email..." className={`${inp} pl-9`} /></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className={`${card} p-4 flex items-center justify-between hover:shadow-md transition`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>{u.full_name ? u.full_name.substring(0, 2).toUpperCase() : 'UN'}</div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 text-xs truncate">{u.full_name || 'No Name'}</div>
                                                    <div className="text-[10px] text-gray-400 truncate">{u.email}</div>
                                                    <div className="flex gap-1 mt-0.5">
                                                        <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">{u.exam_track}</span>
                                                        {u.role === 'admin' && <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <button onClick={async () => { const p = await d.getUserProfile(u); setProfileModal(p); }} className="text-[10px] text-blue-500 border border-blue-200 px-2 py-0.5 rounded-lg hover:bg-blue-50 font-bold transition">Profile</button>
                                                {u.id !== d.user?.uid && <button onClick={() => { if (confirm('Delete?')) d.deleteUser(u.id); }} className="text-[10px] text-red-400 border border-red-200 px-2 py-0.5 rounded-lg hover:bg-red-50 font-bold transition">Delete</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ GAMIFICATION ═══ */}
                        {tab === 'gamification' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-wider border-b border-gray-200 pb-2">Levels</h3>
                                    <div className={`${card} p-4 space-y-3`}>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input value={levelForm.level_no} onChange={e => setLevelForm({ ...levelForm, level_no: e.target.value })} type="number" placeholder="Lvl No" className={inp} />
                                            <input value={levelForm.required_xp} onChange={e => setLevelForm({ ...levelForm, required_xp: e.target.value })} type="number" placeholder="Req XP" className={inp} />
                                            <input value={levelForm.title} onChange={e => setLevelForm({ ...levelForm, title: e.target.value })} placeholder="Title (e.g. Novice)" className={`${inp} col-span-2`} />
                                            <select value={levelForm.track_id} onChange={e => setLevelForm({ ...levelForm, track_id: e.target.value })} className={`${inp} col-span-2`}><option value="OLEVEL">OLEVEL</option><option value="CCC">CCC</option></select>
                                        </div>
                                        <div className="flex gap-2">
                                            {editLevelId && <button onClick={() => { setEditLevelId(null); setLevelForm({ track_id: 'OLEVEL', level_no: '', required_xp: '', title: '' }); }} className={`${btn} w-1/3 bg-gray-100 text-gray-600`}>Cancel</button>}
                                            <button onClick={async () => { await d.saveLevel(levelForm, editLevelId || undefined); setEditLevelId(null); setLevelForm({ track_id: 'OLEVEL', level_no: '', required_xp: '', title: '' }); }} className={`${btn} flex-1 text-white`} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>{editLevelId ? 'Update' : 'Add Level'}</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {d.levels.map((l: any) => (
                                            <div key={l.id} className={`${card} p-3 flex justify-between items-center text-xs group hover:shadow-md transition`}>
                                                <div><span className="font-bold text-gray-900">Lv {l.level_no}: {l.title}</span><div className="text-[10px] text-gray-400">{l.track_id} • {l.required_xp} XP</div></div>
                                                <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition">
                                                    <button onClick={() => { setEditLevelId(l.id); setLevelForm(l); }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg"><Pencil size={12} /></button>
                                                    <button onClick={() => { if (confirm('Delete?')) d.deleteLevel(l.id); }} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-sm font-black text-emerald-600 uppercase tracking-wider border-b border-gray-200 pb-2">Badges</h3>
                                    <div className={`${card} p-4 space-y-3`}>
                                        <input value={badgeForm.badge_name} onChange={e => setBadgeForm({ ...badgeForm, badge_name: e.target.value })} placeholder="Badge Name" className={inp} />
                                        <input value={badgeForm.badge_icon} onChange={e => setBadgeForm({ ...badgeForm, badge_icon: e.target.value })} placeholder="Icon (e.g. ph-medal)" className={inp} />
                                        <textarea value={badgeForm.description} onChange={e => setBadgeForm({ ...badgeForm, description: e.target.value })} placeholder="Description" className={`${inp} h-14 resize-none`} />
                                        <input value={badgeForm.xp_reward} onChange={e => setBadgeForm({ ...badgeForm, xp_reward: e.target.value })} type="number" placeholder="XP Reward" className={inp} />
                                        <div className="flex gap-2">
                                            {editBadgeId && <button onClick={() => { setEditBadgeId(null); setBadgeForm({ badge_name: '', badge_icon: '', xp_reward: '', description: '' }); }} className={`${btn} w-1/3 bg-gray-100 text-gray-600`}>Cancel</button>}
                                            <button onClick={async () => { await d.saveBadge(badgeForm, editBadgeId || undefined); setEditBadgeId(null); setBadgeForm({ badge_name: '', badge_icon: '', xp_reward: '', description: '' }); }} className={`${btn} flex-1 text-white`} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>{editBadgeId ? 'Update' : 'Add Badge'}</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                                        {d.badges.map((b: any) => (
                                            <div key={b.id} onClick={() => { setEditBadgeId(b.id); setBadgeForm(b); }} className={`${card} p-3 cursor-pointer group hover:shadow-md transition relative`}>
                                                <div className="flex justify-between"><Medal size={16} className="text-emerald-500" /><span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">+{b.xp_reward} XP</span></div>
                                                <div className="font-bold text-xs text-gray-900 mt-1 truncate">{b.badge_name}</div>
                                                <div className="text-[10px] text-gray-400 truncate">{b.description || 'No description'}</div>
                                                <button onClick={e => { e.stopPropagation(); if (confirm('Delete?')) d.deleteBadge(b.id); }} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 p-1 rounded-lg transition"><Trash2 size={11} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ RESOURCES ═══ */}
                        {tab === 'resources' && (
                            <div className="space-y-5">
                                <div className={`${card} p-5`}>
                                    <h3 className="text-sm font-black text-blue-600 mb-3 flex items-center gap-2"><Bell size={15} /> Broadcast Notification</h3>
                                    <div className="flex gap-3"><input value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Message..." className={`${inp} flex-1`} /><input value={notifLink} onChange={e => setNotifLink(e.target.value)} placeholder="Link (opt)" className={`${inp} w-1/3 hidden md:block`} /><button onClick={async () => { if (!notifMsg) return; await d.sendNotification(notifMsg, notifLink); setNotifMsg(''); setNotifLink(''); alert('Sent!'); }} className={`${btn} text-white shadow-md`} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Send size={12} className="inline mr-1" />Send</button></div>
                                    <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                                        {d.notifications.length === 0 && <div className="text-xs text-gray-400 italic">No notifications.</div>}
                                        {d.notifications.map(n => (
                                            <div key={n.id} className="flex justify-between items-center p-2.5 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition">
                                                <div className="text-xs text-gray-700 break-words pr-2">{n.message} {n.link && <span className="text-blue-500 text-[10px]">({n.link})</span>}</div>
                                                <button onClick={() => d.deleteNotification(n.id)} className="text-red-400 text-xs hover:text-red-600 shrink-0 font-bold">Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`${card} p-5`}>
                                    <h3 className="text-sm font-black text-gray-900 mb-3">Global Apps</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input value={appForm.name} onChange={e => setAppForm({ ...appForm, name: e.target.value })} placeholder="App Name" className={inp} />
                                        <input value={appForm.link} onChange={e => setAppForm({ ...appForm, link: e.target.value })} placeholder="URL" className={`${inp} md:col-span-2`} />
                                        <input value={appForm.icon} onChange={e => setAppForm({ ...appForm, icon: e.target.value })} placeholder="Icon" className={inp} />
                                    </div>
                                    <button onClick={async () => { await d.deployApp(appForm.name, appForm.link, appForm.icon); setAppForm({ name: '', link: '', icon: '' }); }} className={`${btn} mt-3 text-white`} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>Deploy</button>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {d.apps.map(a => (<div key={a.id} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2"><Globe size={13} className="text-amber-500" /><span className="text-xs text-gray-900 font-medium">{a.name}</span><button onClick={() => d.deleteApp(a.id)} className="text-red-400 ml-1 hover:text-red-600"><X size={12} /></button></div>))}
                                    </div>
                                </div>
                                <div className={`${card} p-5`}>
                                    <h3 className="text-sm font-black text-gray-900 mb-3">YouTube Videos</h3>
                                    <div className="flex gap-3">
                                        <input value={videoForm.id} onChange={e => setVideoForm({ ...videoForm, id: e.target.value })} placeholder="Video ID" className={`${inp} w-32`} />
                                        <input value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="Title" className={`${inp} flex-1`} />
                                        <button onClick={async () => { await d.publishVideo(videoForm.id, videoForm.title); setVideoForm({ id: '', title: '' }); }} className={`${btn} text-white`} style={{ background: '#ef4444' }}><Youtube size={12} className="inline mr-1" />Publish</button>
                                    </div>
                                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                        {d.videos.map(v => (<div key={v.id} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl hover:bg-gray-100 transition"><img src={`https://img.youtube.com/vi/${v.youtube_id}/default.jpg`} className="w-12 h-9 object-cover rounded-lg" alt="" /><div className="flex-1 min-w-0 text-xs text-gray-900 font-medium truncate">{v.title}</div><button onClick={() => d.deleteVideo(v.id)} className="text-red-400 p-1 hover:text-red-600"><Trash2 size={13} /></button></div>))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ═══ QUESTION MODAL ═══ */}
            {showQModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className={`${card} w-full max-w-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto`}>
                        <h3 className="text-sm font-black text-gray-900 mb-4">{qForm.id ? 'Edit Question' : 'Add New Question'}</h3>
                        <div className="space-y-3">
                            <textarea value={qForm.text} onChange={e => setQForm({ ...qForm, text: e.target.value })} className={`${inp} h-20`} placeholder="Question text..." />
                            <div className="grid grid-cols-3 gap-2">
                                <select value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value })} className={inp}><option value="MCQ">MCQ</option><option value="TF">True/False</option><option value="SHORT">Short</option></select>
                                <input value={qForm.marks} onChange={e => setQForm({ ...qForm, marks: Number(e.target.value) })} type="number" className={inp} placeholder="Marks" />
                                <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })} className={inp}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select>
                            </div>
                            {qForm.type !== 'SHORT' && (
                                <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-200">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold">Options (select correct)</div>
                                    {qForm.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input type="radio" name="correctOpt" checked={opt.is_correct} onChange={() => setQForm({ ...qForm, options: qForm.options.map((o, i) => ({ ...o, is_correct: i === idx })) })} className="accent-emerald-500" />
                                            <input value={opt.text} onChange={e => setQForm({ ...qForm, options: qForm.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o) })} className={`${inp} flex-1`} placeholder="Option text" />
                                            <button onClick={() => setQForm({ ...qForm, options: qForm.options.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setQForm({ ...qForm, options: [...qForm.options, { text: '', is_correct: false }] })} className="text-xs text-blue-500 font-bold">+ Add Option</button>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 mt-4">
                                <button onClick={() => setShowQModal(false)} className={`${btn} text-gray-400`}>Cancel</button>
                                <button onClick={async () => { await d.saveQuestion(selTestId, qForm); setShowQModal(false); }} className={`${btn} text-white`} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ ATTEMPT MODAL ═══ */}
            {attemptDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className={`${card} w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative`}>
                        <button onClick={() => setAttemptDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20} /></button>
                        <h3 className="text-lg font-black text-gray-900 mb-1">Attempt Analysis</h3>
                        <div className="text-xs text-gray-400 mb-4 font-medium">User: {attemptDetail.userName} | Test: {attemptDetail.testTitle}</div>
                        <div className="space-y-3">
                            {attemptDetail.questions.map((q: any, i: number) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="text-sm font-bold text-gray-900 mb-2">{i + 1}. {q.text}</div>
                                    <div className="space-y-1 ml-4">
                                        {q.options.map((opt: any) => (
                                            <div key={opt.id} className={`text-xs p-1.5 rounded-lg ${opt.is_correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : q.userSelected === opt.id ? 'bg-red-50 text-red-600 border border-red-200' : 'text-gray-500'}`}>
                                                {q.userSelected === opt.id ? '● ' : '○ '}{opt.option_text}
                                                {opt.is_correct && <span className="ml-2 font-bold text-[9px] uppercase">✓ Correct</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {attemptDetail.questions.length === 0 && <div className="text-center text-gray-400 text-xs py-4">No response data.</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PROFILE MODAL ═══ */}
            {profileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <div className={`${card} w-full max-w-md p-6 shadow-2xl relative`}>
                        <button onClick={() => setProfileModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20} /></button>
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>{profileModal.full_name?.substring(0, 1)}</div>
                            <h3 className="text-xl font-black text-gray-900">{profileModal.full_name}</h3>
                            <div className="text-xs text-gray-400 font-mono">{profileModal.email}</div>
                            <div className="mt-2 text-indigo-600 font-black text-lg">{profileModal.total_xp || 0} XP</div>
                        </div>
                        <div><div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Badges</div>
                            <div className="flex flex-wrap gap-2">
                                {profileModal.badgeNames?.map((b: string, i: number) => <div key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] text-emerald-600 font-bold">{b}</div>)}
                                {(!profileModal.badgeNames || profileModal.badgeNames.length === 0) && <div className="text-xs text-gray-400">No badges earned yet.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
