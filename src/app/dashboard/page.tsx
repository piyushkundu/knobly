'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from './useDashboard';
import {
    ArrowLeft, Home, Trophy, Clock, Target, Play, Lock, Unlock,
    BarChart3, Medal, Users, ChevronRight, Flame, Award, Eye,
    Radio, Zap, MapPin, CheckCircle, Compass, RefreshCw, X, ArrowRight,
    Sparkles, LayoutDashboard, StickyNote, Code2, Brain, Keyboard, Loader2,
    Monitor, Globe, Cpu, BookOpen, Crown, TrendingUp
} from 'lucide-react';

const subjects = [
    { id: 'all', label: 'All', icon: <BookOpen size={13} />, color: '#6366f1' },
    { id: 'it-tools', label: 'IT Tools', icon: <Monitor size={13} />, color: '#8b5cf6' },
    { id: 'web-design', label: 'Web Design', icon: <Globe size={13} />, color: '#06b6d4' },
    { id: 'python', label: 'Python', icon: <Code2 size={13} />, color: '#f59e0b' },
    { id: 'iot', label: 'IoT', icon: <Cpu size={13} />, color: '#ec4899' },
];

export default function DashboardPage() {
    const d = useDashboard();
    const [activeSubject, setActiveSubject] = useState('all');
    const xp = d.userState?.total_xp || d.userState?.total_points || 0;
    const trackLabel = 'O-Level';

    const filterBySubject = (tests: any[]) => {
        if (activeSubject === 'all') return tests;
        return tests.filter((t: any) => {
            const cat = (t.category || '').toLowerCase().replace(/[\s_]+/g, '-');
            const titleMatch = (t.title || '').toLowerCase().replace(/[\s_]+/g, '-');
            return cat === activeSubject || cat.includes(activeSubject) || titleMatch.includes(activeSubject);
        });
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #e8edf5 50%, #f8fafc 100%)' }}>

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid #e2e8f0' }}>
                <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>K</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-bold" style={{ color: '#0f172a' }}>Dashboard</h1>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', border: '1px solid #c7d2fe', color: '#6366f1', letterSpacing: '0.1em' }}>
                                    O-Level
                                </span>
                            </div>
                            <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>Tests · Points · Leaderboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-gray-100" style={{ color: '#64748b' }}>
                            <ArrowLeft size={12} /> Home
                        </Link>
                        {d.user ? (
                            <div className="flex items-center gap-2.5">
                                <div className="hidden sm:block text-right">
                                    <div className="text-[11px] font-semibold" style={{ color: '#0f172a' }}>{d.profile?.full_name || d.user.displayName || 'Student'}</div>
                                    <div className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>Lv {d.userState?.current_level || 1} · {xp} pts</div>
                                </div>
                                <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold uppercase shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                                    {d.avatarInitials}
                                </div>
                            </div>
                        ) : (
                            <div className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Login to see dashboard</div>
                        )}
                    </div>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #10b981, #f59e0b)' }} />
            </header>

            {/* ── MAIN ── */}
            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 py-5 space-y-5">

                    {/* ═══ PROGRESS + STATS ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">
                        {/* Progress card */}
                        <div className="rounded-2xl p-5 sm:p-6 flex gap-5 shadow-sm" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                            {/* Level circle */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', border: '3px solid #c7d2fe', boxShadow: '0 4px 20px rgba(99,102,241,0.15)' }}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[9px] uppercase font-bold" style={{ color: '#8b5cf6', letterSpacing: '0.15em' }}>Level</span>
                                            <span className="text-3xl font-extrabold" style={{ color: '#4f46e5' }}>{d.userState?.current_level || 1}</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                        <span className="text-[9px] font-bold px-3 py-0.5 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>{trackLabel}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>{trackLabel} Test Journey</h2>
                                <p className="text-[11px] mt-0.5 font-medium" style={{ color: '#94a3b8' }}>Complete tests, earn Points, climb the leaderboard.</p>
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] mb-1.5">
                                        <span className="font-medium" style={{ color: '#64748b' }}>Points progress</span>
                                        <span className="font-bold" style={{ color: '#6366f1' }}>{xp} pts</span>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.xpProgressPercent}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-1.5" style={{ color: '#94a3b8' }}>
                                        <span>Next: ~{d.nextLevelXp} pts</span>
                                        <span style={{ color: d.xpToNextLevel > 0 ? '#94a3b8' : '#10b981', fontWeight: 600 }}>{d.xpToNextLevel > 0 ? `${d.xpToNextLevel} remaining` : '🎉 Ready to level up!'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:w-44">
                            {[
                                { label: 'Tests Done', value: d.stats.testsCompleted, icon: <CheckCircle size={16} />, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                                { label: 'Avg Score', value: `${d.stats.avgScore.toFixed(0)}%`, icon: <TrendingUp size={16} />, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
                                { label: 'Accuracy', value: `${d.stats.avgAccuracy.toFixed(0)}%`, icon: <Target size={16} />, color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8' },
                            ].map((s, i) => (
                                <div key={i} className="rounded-2xl px-3.5 py-3.5 flex items-center gap-3 transition-all hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm" style={{ background: '#ffffff', border: `1px solid ${s.border}` }}>
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: s.bg, color: s.color }}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div className="text-lg font-extrabold" style={{ color: '#0f172a' }}>{s.value}</div>
                                        <div className="text-[9px] font-medium" style={{ color: '#94a3b8' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══ TESTS + RIGHT ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">

                        {/* LEFT: Tests */}
                        <div className="rounded-2xl p-5 flex flex-col shadow-sm" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>
                                    <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: '#eef2ff', color: '#6366f1' }}><Play size={13} /></div>
                                    Tests
                                </h2>
                            </div>
                            {/* Subject tabs */}
                            <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                {subjects.map(sub => {
                                    const isActive = activeSubject === sub.id;
                                    return (
                                        <button key={sub.id} onClick={() => setActiveSubject(sub.id)}
                                            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all"
                                            style={{
                                                background: isActive ? sub.color : '#f8fafc',
                                                border: isActive ? `1px solid ${sub.color}` : '1px solid #e2e8f0',
                                                color: isActive ? '#ffffff' : '#64748b',
                                                boxShadow: isActive ? `0 2px 8px ${sub.color}30` : 'none',
                                            }}>
                                            {sub.icon} {sub.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col gap-2">
                                {d.isLoadingMain ? (
                                    <div className="flex-1 flex items-center justify-center text-[11px] font-medium" style={{ color: '#94a3b8' }}><Loader2 size={14} className="animate-spin mr-2" />Loading…</div>
                                ) : !d.user ? (
                                    <div className="flex-1 flex items-center justify-center text-[11px] text-center font-medium" style={{ color: '#94a3b8' }}>Login to see your tests.</div>
                                ) : d.availableTests.length === 0 && d.lockedTests.length === 0 && d.simpleTests.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-[11px] text-center font-medium" style={{ color: '#94a3b8' }}>No tests configured yet.</div>
                                ) : (
                                    <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-80">
                                        {filterBySubject(d.availableTests).length > 0 && (
                                            <div className="space-y-2">
                                                <span className="text-[9px] uppercase font-bold" style={{ color: '#10b981', letterSpacing: '0.12em' }}>✅ Unlocked{activeSubject !== 'all' ? ` · ${subjects.find(s => s.id === activeSubject)?.label}` : ''}</span>
                                                {filterBySubject(d.availableTests).map(test => (
                                                    <TestCard key={test.id} test={test} onStart={() => window.location.href = `/test/${test.id}`} />
                                                ))}
                                            </div>
                                        )}
                                        {filterBySubject(d.lockedTests).length > 0 && (
                                            <div className="pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <span className="text-[9px] uppercase font-bold" style={{ color: '#94a3b8', letterSpacing: '0.12em' }}>🔒 Locked</span>
                                                {filterBySubject(d.lockedTests).map(test => (
                                                    <div key={test.id} className="rounded-xl px-3.5 py-2.5 flex items-center gap-3 mt-2" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                                        <Lock size={13} style={{ color: '#cbd5e1' }} />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-[11px] font-semibold truncate" style={{ color: '#64748b' }}>{test.title}</h4>
                                                            <p className="text-[9px] font-medium" style={{ color: '#94a3b8' }}>Unlock at Level {test.level_no || 1} · ~{test.required_xp || 0} pts</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {d.availableTests.length === 0 && d.lockedTests.length === 0 && d.simpleTests.length > 0 && (
                                            <div className="space-y-2">
                                                <span className="text-[9px] uppercase font-bold" style={{ color: '#6366f1', letterSpacing: '0.12em' }}>📋 Available{activeSubject !== 'all' ? ` · ${subjects.find(s => s.id === activeSubject)?.label}` : ''}</span>
                                                {filterBySubject(d.simpleTests.filter(t => t.is_active)).map((test: any) => (
                                                    <div key={test.id} className="rounded-xl overflow-hidden transition-all hover:shadow-md" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                                                        <div className="p-3.5 flex items-start gap-3">
                                                            <div className="mt-0.5 h-9 w-9 flex items-center justify-center rounded-xl text-[10px] font-bold flex-shrink-0" style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>T</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-[12px] font-bold truncate" style={{ color: '#0f172a' }}>{test.title}</h4>
                                                                    {test.category && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-semibold uppercase" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>{test.category}</span>}
                                                                </div>
                                                                <div className="mt-1.5 flex items-center gap-2.5 text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                                                                    <span className="inline-flex items-center gap-1"><Clock size={10} />{test.duration_minutes}m</span>
                                                                    <span className="inline-flex items-center gap-1"><Target size={10} />{test.questions?.length || 0}Q</span>
                                                                    <span className="inline-flex items-center gap-1" style={{ color: '#10b981' }}><Zap size={10} />{test.total_points}pts</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-3.5 pb-3 flex justify-end">
                                                            <Link href={`/test/${test.id}`} className="px-4 py-1.5 rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 transition-all hover:shadow-lg hover:scale-[1.02] text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                                <Play size={11} />Start Test
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                                {filterBySubject(d.simpleTests.filter(t => t.is_active)).length === 0 && (
                                                    <div className="text-center py-4 text-[10px] font-medium" style={{ color: '#94a3b8' }}>No tests for this subject.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Live + Leaderboard */}
                        <div className="flex flex-col gap-5">
                            {/* Live tests */}
                            <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#ffffff', border: '1px solid #a7f3d0' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>
                                        <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#10b981', opacity: 0.4 }} /><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#10b981' }} /></span>
                                        Live & Upcoming
                                    </h3>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0' }}>Real-time</span>
                                </div>
                                {d.liveTests.length === 0 ? (
                                    <p className="text-[10px] font-medium text-center py-2" style={{ color: '#94a3b8' }}>No live tests right now.</p>
                                ) : (
                                    <div className="space-y-2 max-h-44 overflow-y-auto">
                                        {d.liveTests.map(test => (
                                            <div key={test.id} className="rounded-xl px-3.5 py-2.5 flex items-center justify-between" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                                <div>
                                                    <h4 className="text-[11px] font-bold" style={{ color: '#0f172a' }}>{test.title}</h4>
                                                    <div className="text-[9px] mt-0.5 font-medium" style={{ color: '#94a3b8' }}>{d.formatDateTime(test.live_start)} – {d.formatDateTime(test.live_end)}</div>
                                                </div>
                                                <Link href={`/test/${test.id}`} className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 text-white hover:shadow-lg" style={{ background: '#10b981' }}>
                                                    <Play size={10} />Join
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Leaderboard */}
                            <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#ffffff', border: '1px solid #fde68a' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>
                                        <Trophy size={15} style={{ color: '#f59e0b' }} /> Leaderboard
                                    </h3>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fffbeb', color: '#f59e0b', border: '1px solid #fde68a' }}>O-Level</span>
                                </div>
                                {d.leaderboard.length === 0 ? (
                                    <p className="text-[10px] font-medium text-center py-3" style={{ color: '#94a3b8' }}>No rankings yet.</p>
                                ) : (
                                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                        {d.leaderboard.map((row, idx) => (
                                            <div key={row.id} className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:shadow-sm" style={{
                                                background: idx === 0 ? '#fffbeb' : idx < 3 ? '#fefce8' : '#ffffff',
                                                border: idx === 0 ? '1px solid #fde68a' : '1px solid #f1f5f9',
                                            }}>
                                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm" style={{
                                                    background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' : idx === 2 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f1f5f9',
                                                    color: idx < 3 ? '#ffffff' : '#64748b',
                                                }}>
                                                    {idx < 3 ? <Crown size={12} /> : idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] font-bold truncate block" style={{ color: '#0f172a' }}>{row.full_name || 'Player'}</span>
                                                    <span className="text-[9px] font-medium" style={{ color: '#94a3b8' }}>Lv{row.current_level} · {row.total_xp} pts</span>
                                                </div>
                                                <span className="text-[10px] font-bold" style={{ color: idx === 0 ? '#f59e0b' : '#cbd5e1' }}>#{row.track_rank}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══ HISTORY ═══ */}
                    <div className="rounded-2xl p-5 mb-4 shadow-sm" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: '#0f172a' }}>
                                <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: '#ecfeff', color: '#06b6d4' }}><Clock size={13} /></div>
                                Recent Attempts
                            </h3>
                            <button onClick={() => d.reloadAll()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all hover:shadow-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                <RefreshCw size={11} />Refresh
                            </button>
                        </div>
                        {d.attemptHistory.length === 0 && d.mySimpleResults.length === 0 ? (
                            <p className="text-[10px] font-medium text-center py-4" style={{ color: '#94a3b8' }}>No attempts yet. Complete a test to see results here.</p>
                        ) : (
                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                {(d.attemptHistory.length > 0 ? d.attemptHistory : d.mySimpleResults.map((r: any) => ({
                                    id: r.id, test_title: d.simpleTests.find((t: any) => t.id === r.test_id)?.title || 'Test',
                                    total_marks: r.total_points || 0, score: r.score || 0, accuracy: r.total_points ? Math.round((r.score / r.total_points) * 100) : 0,
                                    status: 'SUBMITTED', durationLabel: '-', submitted_at: r.completed_at,
                                }))).map((row: any) => (
                                    <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all hover:shadow-sm" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[12px] font-bold truncate" style={{ color: '#0f172a' }}>{row.test_title}</h4>
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{
                                                    background: row.status === 'SUBMITTED' ? '#ecfdf5' : '#fffbeb',
                                                    color: row.status === 'SUBMITTED' ? '#10b981' : '#f59e0b',
                                                    border: row.status === 'SUBMITTED' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                                                }}>{row.status === 'AUTO_SUBMITTED' ? 'AUTO' : '✅ DONE'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] mt-1 font-medium" style={{ color: '#94a3b8' }}>
                                                <span className="font-semibold" style={{ color: '#6366f1' }}>{row.score}/{row.total_marks}</span>
                                                <span>{(row.accuracy || 0).toFixed ? (row.accuracy || 0).toFixed(0) : row.accuracy}%</span>
                                                <span>{d.formatDateTime(row.submitted_at || row.started_at)}</span>
                                            </div>
                                        </div>
                                        <Link href={`/review/${row.id}`} className="px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all hover:shadow-sm" style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#6366f1' }}>
                                            <Eye size={11} />Review
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                    <span>Powered by Firebase</span>
                    <Link href="/" className="flex items-center gap-1.5 transition-all hover:text-indigo-500" style={{ color: '#64748b' }}>
                        <ArrowLeft size={10} /> Back to Knobly
                    </Link>
                </div>
            </footer>

        </div>
    );
}

/* ── Test Card ── */
function TestCard({ test, onStart }: { test: any; onStart: () => void }) {
    return (
        <div className="rounded-xl overflow-hidden transition-all hover:shadow-md" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="p-3.5 flex items-start gap-3">
                <div className="mt-0.5 h-9 w-9 flex items-center justify-center rounded-xl text-[10px] font-bold flex-shrink-0" style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>
                    Lv{test.level_no || 1}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[12px] font-bold truncate" style={{ color: '#0f172a' }}>{test.title}</h4>
                        {test.mode === 'PRACTICE'
                            ? <span className="px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>Practice</span>
                            : <span className="px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}><span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />Live</span>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2.5 text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                        <span className="inline-flex items-center gap-1"><Clock size={10} />{test.duration_minutes}m</span>
                        <span className="inline-flex items-center gap-1"><Target size={10} />{test.total_marks}mk</span>
                        <span className="inline-flex items-center gap-1" style={{ color: '#10b981' }}><Zap size={10} />{test.xp_reward}pts</span>
                    </div>
                </div>
            </div>
            <div className="px-3.5 pb-3 flex items-center justify-between" style={{ borderTop: '1px solid #f1f5f9' }}>
                <span className="text-[9px] truncate font-medium" style={{ color: '#94a3b8' }}>{test.level_title || 'Level test'}</span>
                <button onClick={onStart} className="px-4 py-1.5 rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 transition-all hover:shadow-lg hover:scale-[1.02] text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Play size={11} />Start
                </button>
            </div>
        </div>
    );
}
