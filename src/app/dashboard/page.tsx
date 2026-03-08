'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from './useDashboard';
import {
    ArrowLeft, Home, Trophy, Clock, Target, Play, Lock, Unlock,
    BarChart3, Medal, Users, ChevronRight, Flame, Award, Eye,
    Radio, Zap, MapPin, CheckCircle, Compass, RefreshCw, X, ArrowRight,
    Sparkles, LayoutDashboard, StickyNote, Code2, Brain, Keyboard, Loader2,
    Monitor, Globe, Cpu, BookOpen, Crown, TrendingUp, Star, GraduationCap
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
    const level = d.userState?.current_level || 1;

    const filterBySubject = (tests: any[]) => {
        if (activeSubject === 'all') return tests;
        return tests.filter((t: any) => {
            const cat = (t.category || '').toLowerCase().replace(/[\s_]+/g, '-');
            const titleMatch = (t.title || '').toLowerCase().replace(/[\s_]+/g, '-');
            const catExact = (t.category || '').toLowerCase();
            return cat === activeSubject || catExact === activeSubject || cat.includes(activeSubject) || titleMatch.includes(activeSubject);
        });
    };

    return (
        <div className="min-h-screen" style={{ background: '#f0f2f5' }}>

            {/* ═══ PREMIUM HERO HEADER ═══ */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6366f1 75%, #818cf8 100%)' }}>
                {/* Top Nav */}
                <div className="max-w-6xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <ArrowLeft size={14} style={{ color: 'rgba(255,255,255,0.8)' }} />
                        </Link>
                        <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Home</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {d.user ? (
                            <div className="flex items-center gap-2.5">
                                <div className="hidden sm:block text-right">
                                    <div className="text-[11px] font-semibold" style={{ color: '#ffffff' }}>{d.profile?.full_name || d.user.displayName || 'Student'}</div>
                                    <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Level {level} · {xp} pts</div>
                                </div>
                                <div className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold uppercase" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.3)' }}>
                                    {d.avatarInitials}
                                </div>
                            </div>
                        ) : (
                            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Login to see dashboard</span>
                        )}
                    </div>
                </div>

                {/* Hero Content */}
                <div className="max-w-6xl mx-auto px-4 pb-16 pt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Level Badge */}
                        <div className="relative flex-shrink-0">
                            <div className="h-28 w-28 rounded-2xl flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                                <GraduationCap size={20} style={{ color: '#fbbf24', marginBottom: 4 }} />
                                <span className="text-4xl font-black" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>{level}</span>
                                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>LEVEL</span>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[9px] font-bold" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#1e1b4b', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(251,191,36,0.4)' }}>
                                O-Level
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={14} style={{ color: '#fbbf24' }} />
                                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#fbbf24' }}>Dashboard</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: '#ffffff', textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
                                O-Level Test Journey
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 400 }}>
                                Complete tests, earn points, climb the leaderboard — track your entire progress here!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ FLOATING STATS CARDS ═══ */}
            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Points', value: xp, icon: <Zap size={18} />, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', shadow: 'rgba(99,102,241,0.3)' },
                        { label: 'Tests Done', value: d.stats.testsCompleted, icon: <CheckCircle size={18} />, gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16,185,129,0.3)' },
                        { label: 'Avg Score', value: `${d.stats.avgScore.toFixed(0)}%`, icon: <TrendingUp size={18} />, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: 'rgba(245,158,11,0.3)' },
                        { label: 'Accuracy', value: `${d.stats.avgAccuracy.toFixed(0)}%`, icon: <Target size={18} />, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', shadow: 'rgba(236,72,153,0.3)' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.03] hover:-translate-y-1" style={{ background: '#ffffff', boxShadow: `0 8px 30px ${s.shadow}, 0 2px 8px rgba(0,0,0,0.06)`, border: '1px solid rgba(255,255,255,0.8)' }}>
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: s.gradient, boxShadow: `0 4px 12px ${s.shadow}` }}>
                                {s.icon}
                            </div>
                            <div>
                                <div className="text-xl font-black" style={{ color: '#0f172a' }}>{s.value}</div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ PROGRESS BAR ═══ */}
            <div className="max-w-6xl mx-auto px-4 mb-6">
                <div className="rounded-2xl p-5" style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e8ecf1' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold" style={{ color: '#0f172a' }}>⚡ Points Progress</span>
                        <span className="text-xs font-black" style={{ color: '#6366f1' }}>{xp} / {d.nextLevelXp} pts</span>
                    </div>
                    <div className="h-4 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }} suppressHydrationWarning>
                        <div suppressHydrationWarning className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${Math.max(d.xpProgressPercent, 2)}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)' }} />
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1.5 font-medium" style={{ color: '#94a3b8' }}>
                        <span>Level {level}</span>
                        <span style={{ color: d.xpToNextLevel > 0 ? '#94a3b8' : '#10b981' }}>{d.xpToNextLevel > 0 ? `${d.xpToNextLevel} points to Level ${level + 1}` : '🎉 Ready to level up!'}</span>
                    </div>
                </div>
            </div>

            {/* ═══ MAIN CONTENT ═══ */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">

                    {/* LEFT: Tests */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e8ecf1' }}>
                        {/* Tests header */}
                        <div className="p-5 pb-3">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}><Play size={14} /></div>
                                <h2 className="text-base font-black" style={{ color: '#0f172a' }}>Available Tests</h2>
                            </div>
                            {/* Subject tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {subjects.map(sub => {
                                    const isActive = activeSubject === sub.id;
                                    return (
                                        <button key={sub.id} onClick={() => setActiveSubject(sub.id)}
                                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all"
                                            style={{
                                                background: isActive ? sub.color : '#f8fafc',
                                                border: isActive ? `1px solid ${sub.color}` : '1px solid #e2e8f0',
                                                color: isActive ? '#ffffff' : '#475569',
                                                boxShadow: isActive ? `0 4px 14px ${sub.color}35` : 'none',
                                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            }}>
                                            {sub.icon} {sub.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)' }} />
                        {/* Tests list */}
                        <div className="p-5 pt-3">
                            <div className="min-h-[120px] max-h-[420px] overflow-y-auto space-y-3 pr-1">
                                {d.isLoadingMain ? (
                                    <div className="flex items-center justify-center py-12 text-[12px] font-semibold" style={{ color: '#94a3b8' }}><Loader2 size={16} className="animate-spin mr-2" />Loading tests…</div>
                                ) : !d.user ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f1f5f9' }}><Lock size={20} style={{ color: '#94a3b8' }} /></div>
                                        <p className="text-sm font-semibold" style={{ color: '#64748b' }}>Login to see your tests</p>
                                    </div>
                                ) : d.availableTests.length === 0 && d.lockedTests.length === 0 && d.simpleTests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f1f5f9' }}><BookOpen size={20} style={{ color: '#94a3b8' }} /></div>
                                        <p className="text-sm font-semibold" style={{ color: '#64748b' }}>No tests configured yet</p>
                                    </div>
                                ) : (
                                    <>
                                        {filterBySubject(d.availableTests).map(test => (
                                            <TestCard key={test.id} test={test} onStart={() => window.location.href = `/test/${test.id}`} />
                                        ))}
                                        {filterBySubject(d.lockedTests).map(test => (
                                            <div key={test.id} className="rounded-xl px-4 py-3 flex items-center gap-3 opacity-60" style={{ background: '#f8fafc', border: '1px dashed #d1d5db' }}>
                                                <Lock size={14} style={{ color: '#94a3b8' }} />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-[12px] font-semibold truncate" style={{ color: '#64748b' }}>{test.title}</h4>
                                                    <p className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>🔒 Unlock at Level {test.level_no || 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {d.availableTests.length === 0 && d.lockedTests.length === 0 && d.simpleTests.length > 0 && (
                                            <>
                                                {filterBySubject(d.simpleTests.filter(t => t.is_active)).map((test: any) => (
                                                    <div key={test.id} className="rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: '#ffffff', border: '1px solid #e8ecf1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                        <div className="p-4 flex items-start gap-3">
                                                            <div className="h-10 w-10 flex items-center justify-center rounded-xl text-[11px] font-black flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>T</div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-[13px] font-bold truncate" style={{ color: '#0f172a' }}>{test.title}</h4>
                                                                    {test.category && <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase" style={{ background: '#eef2ff', color: '#6366f1' }}>{test.category}</span>}
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold" style={{ color: '#94a3b8' }}>
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9' }}><Clock size={10} />{test.duration_minutes}m</span>
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9' }}><Target size={10} />{test.questions?.length || 0}Q</span>
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#ecfdf5', color: '#10b981' }}><Zap size={10} />{test.total_points}pts</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="px-4 pb-3 flex justify-end">
                                                            <Link href={`/test/${test.id}`} className="px-5 py-2 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all hover:shadow-xl hover:scale-[1.03] text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                                                                <Play size={12} />Start Test
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                                {filterBySubject(d.simpleTests.filter(t => t.is_active)).length === 0 && (
                                                    <div className="text-center py-8 text-[11px] font-medium" style={{ color: '#94a3b8' }}>No tests for this subject.</div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT Column */}
                    <div className="flex flex-col gap-5">

                        {/* Live & Upcoming */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e8ecf1' }}>
                            <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderBottom: '1px solid #d1fae5' }}>
                                <h3 className="text-sm font-black flex items-center gap-2" style={{ color: '#065f46' }}>
                                    <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#10b981', opacity: 0.5 }} /><span className="h-2.5 w-2.5 rounded-full" style={{ background: '#10b981' }} /></span>
                                    Live & Upcoming
                                </h3>
                                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: '#10b981' }}>LIVE</span>
                            </div>
                            <div className="p-4">
                                {d.liveTests.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>No live tests right now</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-44 overflow-y-auto">
                                        {d.liveTests.map(test => (
                                            <div key={test.id} className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                                <div>
                                                    <h4 className="text-[12px] font-bold" style={{ color: '#0f172a' }}>{test.title}</h4>
                                                    <div className="text-[9px] mt-0.5 font-medium" style={{ color: '#94a3b8' }}>{d.formatDateTime(test.live_start)} – {d.formatDateTime(test.live_end)}</div>
                                                </div>
                                                <Link href={`/test/${test.id}`} className="px-4 py-1.5 rounded-xl text-[10px] font-bold text-white transition-all hover:shadow-lg" style={{ background: '#10b981' }}>
                                                    <Play size={10} className="inline mr-1" />Join
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e8ecf1' }}>
                            <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderBottom: '1px solid #fde68a' }}>
                                <h3 className="text-sm font-black flex items-center gap-2" style={{ color: '#92400e' }}>
                                    <Trophy size={16} style={{ color: '#f59e0b' }} /> Leaderboard
                                </h3>
                                <span className="text-[9px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>🏆 TOP</span>
                            </div>
                            <div className="p-4">
                                {d.leaderboard.length === 0 ? (
                                    <div className="text-center py-4">
                                        <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>No rankings yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-56 overflow-y-auto">
                                        {d.leaderboard.map((row, idx) => (
                                            <div key={row.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:shadow-sm" style={{
                                                background: idx === 0 ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : '#fafafa',
                                                border: idx === 0 ? '1px solid #fde68a' : '1px solid #f1f5f9',
                                            }}>
                                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{
                                                    background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)' : idx === 2 ? 'linear-gradient(135deg, #f59e0b, #b45309)' : '#f1f5f9',
                                                    color: idx < 3 ? '#fff' : '#64748b',
                                                    boxShadow: idx < 3 ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                                }}>
                                                    {idx < 3 ? <Crown size={13} /> : idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[12px] font-bold truncate block" style={{ color: '#0f172a' }}>{row.full_name || 'Player'}</span>
                                                    <span className="text-[9px] font-medium" style={{ color: '#94a3b8' }}>Level {row.current_level} · {row.total_xp} pts</span>
                                                </div>
                                                <span className="text-[10px] font-black" style={{ color: idx === 0 ? '#f59e0b' : '#cbd5e1' }}>#{row.track_rank}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ HISTORY ═══ */}
                <div className="mt-5 rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e8ecf1' }}>
                    <div className="p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #f0f9ff, #ecfeff)', borderBottom: '1px solid #cffafe' }}>
                        <h3 className="text-sm font-black flex items-center gap-2" style={{ color: '#164e63' }}>
                            <Clock size={15} style={{ color: '#06b6d4' }} /> Recent Attempts
                        </h3>
                        <button onClick={() => d.reloadAll()} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                            <RefreshCw size={11} />Refresh
                        </button>
                    </div>
                    <div className="p-4">
                        {d.attemptHistory.length === 0 && d.mySimpleResults.length === 0 ? (
                            <div className="text-center py-6">
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: '#f1f5f9' }}><BookOpen size={18} style={{ color: '#94a3b8' }} /></div>
                                <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>No attempts yet. Complete a test to see results!</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-60 overflow-y-auto">
                                {(d.attemptHistory.length > 0 ? d.attemptHistory : d.mySimpleResults.map((r: any) => ({
                                    id: r.id, test_title: d.simpleTests.find((t: any) => t.id === r.test_id)?.title || 'Test',
                                    total_marks: r.total_points || 0, score: r.score || 0, accuracy: r.total_points ? Math.round((r.score / r.total_points) * 100) : 0,
                                    status: 'SUBMITTED', durationLabel: '-', submitted_at: r.completed_at,
                                }))).map((row: any) => (
                                    <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: '#fafafa', border: '1px solid #f1f5f9' }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[12px] font-bold truncate" style={{ color: '#0f172a' }}>{row.test_title}</h4>
                                                <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{
                                                    background: row.status === 'SUBMITTED' ? '#ecfdf5' : '#fffbeb',
                                                    color: row.status === 'SUBMITTED' ? '#10b981' : '#f59e0b',
                                                }}>{row.status === 'AUTO_SUBMITTED' ? 'AUTO' : '✅ Done'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] mt-1 font-semibold" style={{ color: '#94a3b8' }}>
                                                <span className="font-bold" style={{ color: '#6366f1' }}>{row.score}/{row.total_marks}</span>
                                                <span>{(row.accuracy || 0).toFixed ? (row.accuracy || 0).toFixed(0) : row.accuracy}%</span>
                                                <span>{d.formatDateTime(row.submitted_at || row.started_at)}</span>
                                            </div>
                                        </div>
                                        <Link href={`/review/${row.id}`} className="px-3.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all hover:shadow-md text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                            <Eye size={11} />Review
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer style={{ background: '#ffffff', borderTop: '1px solid #e8ecf1' }}>
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-[10px] font-semibold" style={{ color: '#94a3b8' }}>
                    <span>© Knobly Web · Powered by Firebase</span>
                    <Link href="/" className="flex items-center gap-1 transition-all hover:text-indigo-500" style={{ color: '#64748b' }}>
                        <ArrowLeft size={10} /> Back to Home
                    </Link>
                </div>
            </footer>
        </div>
    );
}

/* ── Test Card ── */
function TestCard({ test, onStart }: { test: any; onStart: () => void }) {
    return (
        <div className="rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: '#ffffff', border: '1px solid #e8ecf1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="p-4 flex items-start gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl text-[10px] font-black flex-shrink-0 text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                    Lv{test.level_no || 1}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[13px] font-bold truncate" style={{ color: '#0f172a' }}>{test.title}</h4>
                        {test.mode === 'PRACTICE'
                            ? <span className="px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>Practice</span>
                            : <span className="px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 text-white" style={{ background: '#ef4444' }}><span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#fff' }} />LIVE</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold" style={{ color: '#94a3b8' }}>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9' }}><Clock size={10} />{test.duration_minutes}m</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9' }}><Target size={10} />{test.total_marks}mk</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#ecfdf5', color: '#10b981' }}><Zap size={10} />{test.xp_reward}pts</span>
                    </div>
                </div>
            </div>
            <div className="px-4 pb-3 flex items-center justify-between" style={{ borderTop: '1px solid #f5f5f5' }}>
                <span className="text-[9px] truncate font-medium" style={{ color: '#94a3b8' }}>{test.level_title || 'Level test'}</span>
                <button onClick={onStart} className="px-5 py-2 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all hover:shadow-xl hover:scale-[1.03] text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
                    <Play size={12} />Start
                </button>
            </div>
        </div>
    );
}
