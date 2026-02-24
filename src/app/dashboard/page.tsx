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
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0c1222' }}>

            {/* ── COLORFUL BACKGROUND LIGHTS ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Top-left: Purple/violet blob */}
                <div className="absolute" style={{ top: '-5%', left: '-5%', width: '45%', height: '45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                {/* Top-right: Cyan/teal blob */}
                <div className="absolute" style={{ top: '5%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                {/* Middle-left: Pink blob */}
                <div className="absolute" style={{ top: '35%', left: '-8%', width: '35%', height: '35%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                {/* Middle-right: Blue blob */}
                <div className="absolute" style={{ top: '40%', right: '5%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                {/* Bottom: Orange/amber blob */}
                <div className="absolute" style={{ bottom: '-5%', left: '30%', width: '40%', height: '35%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                {/* Bottom-left: Green blob */}
                <div className="absolute" style={{ bottom: '10%', left: '-5%', width: '30%', height: '30%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
            </div>

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-20" style={{ background: 'rgba(12,18,34,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>K</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Dashboard</h1>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', letterSpacing: '0.1em' }}>
                                    O-Level
                                </span>
                            </div>
                            <p className="text-[10px]" style={{ color: '#64748b' }}>Tests · Points · Leaderboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg transition hover:bg-white/5" style={{ color: '#94a3b8' }}>
                            <ArrowLeft size={12} /> Home
                        </Link>
                        {d.user ? (
                            <div className="flex items-center gap-2.5">
                                <div className="hidden sm:block text-right">
                                    <div className="text-[11px] font-medium" style={{ color: '#e2e8f0' }}>{d.profile?.full_name || d.user.displayName || 'Student'}</div>
                                    <div className="text-[10px]" style={{ color: '#64748b' }}>Lv {d.userState?.current_level || 1} · {xp} pts</div>
                                </div>
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold uppercase" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                                    {d.avatarInitials}
                                </div>
                            </div>
                        ) : (
                            <div className="text-[11px]" style={{ color: '#94a3b8' }}>Login from Knobly to see dashboard</div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-1 relative z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">

                    {/* ═══ TOP: Progress + Stats ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                        {/* Progress card */}
                        <div className="rounded-2xl p-4 sm:p-5 flex gap-4" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}>
                            {/* Level circle */}
                            <div className="flex flex-col items-center">
                                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.08)', border: '2px solid rgba(139,92,246,0.35)' }}>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] uppercase font-medium" style={{ color: '#a78bfa', letterSpacing: '0.15em' }}>Level</span>
                                        <span className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>{d.userState?.current_level || 1}</span>
                                    </div>
                                </div>
                                <span className="mt-2 text-[9px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd' }}>{trackLabel}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{trackLabel} Test Journey</h2>
                                <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>Complete tests, earn Points, climb the leaderboard.</p>
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span style={{ color: '#94a3b8' }}>Points progress</span>
                                        <span className="font-medium" style={{ color: '#c4b5fd' }}>{xp} pts</span>
                                    </div>
                                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.xpProgressPercent}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-1" style={{ color: '#64748b' }}>
                                        <span>Next: ~{d.nextLevelXp} pts</span>
                                        <span style={{ color: d.xpToNextLevel > 0 ? '#64748b' : '#34d399' }}>{d.xpToNextLevel > 0 ? `${d.xpToNextLevel} remaining` : 'Ready to level up!'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 lg:w-40">
                            {[
                                { label: 'Tests Done', value: d.stats.testsCompleted, icon: <CheckCircle size={15} />, color: '#34d399', glow: 'rgba(52,211,153,0.1)' },
                                { label: 'Avg Score', value: `${d.stats.avgScore.toFixed(0)}%`, icon: <TrendingUp size={15} />, color: '#6366f1', glow: 'rgba(99,102,241,0.1)' },
                                { label: 'Accuracy', value: `${d.stats.avgAccuracy.toFixed(0)}%`, icon: <Target size={15} />, color: '#ec4899', glow: 'rgba(236,72,153,0.1)' },
                            ].map((s, i) => (
                                <div key={i} className="rounded-2xl px-3 py-3 flex items-center gap-2.5 transition hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: `0 0 25px ${s.glow}` }}>
                                    <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15`, color: s.color }}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div className="text-base font-bold" style={{ color: '#f1f5f9' }}>{s.value}</div>
                                        <div className="text-[9px]" style={{ color: '#94a3b8' }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>



                    {/* ═══ MIDDLE: Tests + Right column ═══ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">

                        {/* LEFT: Tests */}
                        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 30px rgba(6,182,212,0.06)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#e2e8f0' }}>
                                    <Play size={15} style={{ color: '#6366f1' }} /> Tests
                                </h2>
                            </div>
                            {/* Subject tabs */}
                            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {subjects.map(sub => {
                                    const isActive = activeSubject === sub.id;
                                    return (
                                        <button key={sub.id} onClick={() => setActiveSubject(sub.id)}
                                            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition"
                                            style={{
                                                background: isActive ? `${sub.color}18` : 'transparent',
                                                border: isActive ? `1px solid ${sub.color}50` : '1px solid transparent',
                                                color: isActive ? sub.color : '#64748b',
                                            }}>
                                            {sub.icon} {sub.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex-1 min-h-0 flex flex-col gap-2">
                                {d.isLoadingMain ? (
                                    <div className="flex-1 flex items-center justify-center text-[11px]" style={{ color: '#64748b' }}><Loader2 size={14} className="animate-spin mr-2" />Loading…</div>
                                ) : !d.user ? (
                                    <div className="flex-1 flex items-center justify-center text-[11px] text-center" style={{ color: '#64748b' }}>Login to see your tests.</div>
                                ) : d.availableTests.length === 0 && d.lockedTests.length === 0 && d.simpleTests.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-[11px] text-center" style={{ color: '#64748b' }}>No tests configured yet.</div>
                                ) : (
                                    <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 max-h-80">
                                        {filterBySubject(d.availableTests).length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] uppercase font-medium" style={{ color: '#64748b', letterSpacing: '0.1em' }}>Unlocked{activeSubject !== 'all' ? ` · ${subjects.find(s => s.id === activeSubject)?.label}` : ''}</span>
                                                {filterBySubject(d.availableTests).map(test => (
                                                    <TestCard key={test.id} test={test} onStart={() => window.location.href = `/test/${test.id}`} />
                                                ))}
                                            </div>
                                        )}
                                        {filterBySubject(d.lockedTests).length > 0 && (
                                            <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span className="text-[9px] uppercase font-medium" style={{ color: '#475569', letterSpacing: '0.1em' }}>Locked</span>
                                                {filterBySubject(d.lockedTests).map(test => (
                                                    <div key={test.id} className="rounded-lg px-3 py-2 flex items-center gap-3 mt-1.5" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                        <Lock size={12} style={{ color: '#475569' }} />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-[11px] font-medium truncate" style={{ color: '#94a3b8' }}>{test.title}</h4>
                                                            <p className="text-[9px]" style={{ color: '#475569' }}>Unlock at Level {test.level_no || 1} · ~{test.required_xp || 0} pts</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {d.availableTests.length === 0 && d.lockedTests.length === 0 && d.simpleTests.length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] uppercase font-medium" style={{ color: '#64748b', letterSpacing: '0.1em' }}>Available{activeSubject !== 'all' ? ` · ${subjects.find(s => s.id === activeSubject)?.label}` : ''}</span>
                                                {filterBySubject(d.simpleTests.filter(t => t.is_active)).map((test: any) => (
                                                    <div key={test.id} className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                        <div className="p-3 flex items-start gap-3">
                                                            <div className="mt-0.5 h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-semibold flex-shrink-0" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>T</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-[11px] font-medium truncate" style={{ color: '#e2e8f0' }}>{test.title}</h4>
                                                                    {test.category && <span className="px-1.5 py-0.5 rounded text-[8px] uppercase" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{test.category}</span>}
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-2 text-[10px]" style={{ color: '#64748b' }}>
                                                                    <span className="inline-flex items-center gap-1"><Clock size={10} />{test.duration_minutes}m</span>
                                                                    <span className="inline-flex items-center gap-1"><Target size={10} />{test.questions?.length || 0}Q</span>
                                                                    <span className="inline-flex items-center gap-1" style={{ color: '#34d399' }}><Zap size={10} />{test.total_points}pts</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-3 pb-2.5 flex justify-end">
                                                            <Link href={`/test/${test.id}`} className="px-3 py-1 rounded-lg text-[10px] font-medium inline-flex items-center gap-1 transition" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                                                                <Play size={11} />Start
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                                {filterBySubject(d.simpleTests.filter(t => t.is_active)).length === 0 && (
                                                    <div className="text-center py-3 text-[10px]" style={{ color: '#475569' }}>No tests for this subject.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Live + Leaderboard */}
                        <div className="flex flex-col gap-4">
                            {/* Live tests */}
                            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(52,211,153,0.15)', boxShadow: '0 0 30px rgba(52,211,153,0.06)' }}>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h3 className="text-xs font-semibold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                                        <span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#34d399', opacity: 0.5 }} /><span className="h-2 w-2 rounded-full" style={{ background: '#34d399' }} /></span>
                                        Live & Upcoming
                                    </h3>
                                    <span className="text-[9px] font-medium" style={{ color: '#34d399' }}>Real-time</span>
                                </div>
                                {d.liveTests.length === 0 ? (
                                    <p className="text-[10px]" style={{ color: '#64748b' }}>No live tests right now.</p>
                                ) : (
                                    <div className="space-y-2 max-h-44 overflow-y-auto">
                                        {d.liveTests.map(test => (
                                            <div key={test.id} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(52,211,153,0.12)' }}>
                                                <div>
                                                    <h4 className="text-[11px] font-medium" style={{ color: '#e2e8f0' }}>{test.title}</h4>
                                                    <div className="text-[9px] mt-0.5" style={{ color: '#64748b' }}>{d.formatDateTime(test.live_start)} – {d.formatDateTime(test.live_end)}</div>
                                                </div>
                                                <Link href={`/test/${test.id}`} className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center gap-1" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                                                    <Play size={10} />Join
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Leaderboard */}
                            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(251,191,36,0.12)', boxShadow: '0 0 30px rgba(251,191,36,0.05)' }}>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#e2e8f0' }}>
                                        <Trophy size={14} style={{ color: '#fbbf24' }} /> Leaderboard
                                    </h3>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fcd34d' }}>O-Level</span>
                                </div>
                                {d.leaderboard.length === 0 ? (
                                    <p className="text-[10px] text-center py-3" style={{ color: '#64748b' }}>No rankings yet.</p>
                                ) : (
                                    <div className="space-y-1 max-h-52 overflow-y-auto">
                                        {d.leaderboard.map((row, idx) => (
                                            <div key={row.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5" style={{
                                                background: idx === 0 ? 'rgba(251,191,36,0.06)' : 'transparent',
                                                border: idx === 0 ? '1px solid rgba(251,191,36,0.15)' : '1px solid transparent',
                                            }}>
                                                <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{
                                                    background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)' : idx === 2 ? 'linear-gradient(135deg, #f59e0b, #b45309)' : 'rgba(255,255,255,0.06)',
                                                    color: idx < 3 ? '#0f172a' : '#94a3b8',
                                                }}>
                                                    {idx < 3 ? <Crown size={12} /> : idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] font-medium truncate block" style={{ color: '#e2e8f0' }}>{row.full_name || 'Player'}</span>
                                                    <span className="text-[9px]" style={{ color: '#64748b' }}>Lv{row.current_level} · {row.total_xp} pts</span>
                                                </div>
                                                <span className="text-[9px] font-medium" style={{ color: idx === 0 ? '#fbbf24' : '#475569' }}>#{row.track_rank}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══ HISTORY ═══ */}
                    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 0 30px rgba(236,72,153,0.05)' }}>
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#e2e8f0' }}>
                                <Clock size={14} style={{ color: '#06b6d4' }} /> Recent Attempts
                            </h3>
                            <button onClick={() => d.reloadAll()} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}>
                                <RefreshCw size={11} />Refresh
                            </button>
                        </div>
                        {d.attemptHistory.length === 0 && d.mySimpleResults.length === 0 ? (
                            <p className="text-[10px] text-center py-3" style={{ color: '#64748b' }}>No attempts yet. Complete a test to see results here.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-52 overflow-y-auto">
                                {(d.attemptHistory.length > 0 ? d.attemptHistory : d.mySimpleResults.map((r: any) => ({
                                    id: r.id, test_title: d.simpleTests.find((t: any) => t.id === r.test_id)?.title || 'Test',
                                    total_marks: r.total_points || 0, score: r.score || 0, accuracy: r.total_points ? Math.round((r.score / r.total_points) * 100) : 0,
                                    status: 'SUBMITTED', durationLabel: '-', submitted_at: r.completed_at,
                                }))).map((row: any) => (
                                    <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-[11px] font-medium truncate" style={{ color: '#e2e8f0' }}>{row.test_title}</h4>
                                                <span className="text-[8px] px-1 py-0.5 rounded font-medium" style={{
                                                    background: row.status === 'SUBMITTED' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                                                    color: row.status === 'SUBMITTED' ? '#34d399' : '#fbbf24',
                                                }}>{row.status === 'AUTO_SUBMITTED' ? 'AUTO' : 'DONE'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] mt-0.5" style={{ color: '#64748b' }}>
                                                <span>{row.score}/{row.total_marks}</span>
                                                <span>{(row.accuracy || 0).toFixed ? (row.accuracy || 0).toFixed(0) : row.accuracy}%</span>
                                                <span>{d.formatDateTime(row.submitted_at || row.started_at)}</span>
                                            </div>
                                        </div>
                                        <Link href={`/review/${row.id}`} className="px-2 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}>
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
            <footer className="relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(12,18,34,0.8)', backdropFilter: 'blur(12px)' }}>
                <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-[10px]" style={{ color: '#475569' }}>
                    <span>Powered by Firebase</span>
                    <Link href="/" className="flex items-center gap-1 transition" style={{ color: '#64748b' }}>
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
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="p-3 flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 flex items-center justify-center rounded-lg text-[10px] font-semibold flex-shrink-0" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                    Lv{test.level_no || 1}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[11px] font-medium truncate" style={{ color: '#e2e8f0' }}>{test.title}</h4>
                        {test.mode === 'PRACTICE'
                            ? <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>Practice</span>
                            : <span className="px-1.5 py-0.5 rounded text-[8px] font-medium flex items-center gap-1" style={{ background: 'rgba(244,63,94,0.1)', color: '#f87171' }}><span className="h-1 w-1 rounded-full animate-pulse" style={{ background: '#f43f5e' }} />Live</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px]" style={{ color: '#64748b' }}>
                        <span className="inline-flex items-center gap-1"><Clock size={10} />{test.duration_minutes}m</span>
                        <span className="inline-flex items-center gap-1"><Target size={10} />{test.total_marks}mk</span>
                        <span className="inline-flex items-center gap-1" style={{ color: '#34d399' }}><Zap size={10} />{test.xp_reward}pts</span>
                    </div>
                </div>
            </div>
            <div className="px-3 pb-2.5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-[9px] truncate" style={{ color: '#475569' }}>{test.level_title || 'Level test'}</span>
                <button onClick={onStart} className="px-3 py-1 rounded-lg text-[10px] font-medium inline-flex items-center gap-1 transition" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                    <Play size={11} />Start
                </button>
            </div>
        </div>
    );
}
