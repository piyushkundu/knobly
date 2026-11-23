'use client';
import { useEffect, useMemo, useState } from 'react';
import { Clock, Lock, Play, Target, Zap } from 'lucide-react';
import { dashboardQuestionCount, isNewDashboardTest, NEW_TEST_WINDOW_MS, sortDashboardTests, testCreatedMillis, type DashboardTest } from '@/lib/dashboard-test-order';

interface TestEntry extends DashboardTest { locked?: boolean }
export default function DashboardTestList({ available, locked, simple, subject, attempted, history = [] }: { available: DashboardTest[]; locked: DashboardTest[]; simple: DashboardTest[]; subject: string; attempted: Set<string>; history?: { test_id?: string; status?: string; score?: number; submitted_at?: string }[] }) {
    const [now, setNow] = useState(() => Date.now());
    const entries = useMemo<TestEntry[]>(() => available.length || locked.length
        ? [...available.map(test => ({ ...test, locked: false })), ...locked.map(test => ({ ...test, locked: true }))]
        : simple.filter(test => test.is_active === true), [available, locked, simple]);
    useEffect(() => {
        const refresh = () => setNow(Date.now());
        const expiries = entries.map(test => testCreatedMillis(test)).filter((time): time is number => time !== null)
            .map(time => time + NEW_TEST_WINDOW_MS).filter(time => time > now);
        const next = expiries.length ? Math.min(...expiries) : null;
        const timer = next === null ? null : setTimeout(refresh, Math.min(2_147_483_647, Math.max(1, next - Date.now() + 10)));
        window.addEventListener('focus', refresh);
        return () => { if (timer !== null) clearTimeout(timer); window.removeEventListener('focus', refresh); };
    }, [entries, now]);
    const visible = sortDashboardTests(entries.filter(test => subject === 'all' || test.category?.toLowerCase() === subject.toLowerCase()), now);
    if (!visible.length) return <div className="text-center py-8 text-[11px] font-medium" style={{ color: '#475569' }}>No tests for this subject.</div>;
    return <>{visible.map((test, index) => {
        const fresh = isNewDashboardTest(test, now), done = attempted.has(test.id);
        const results = history.filter(row => row.test_id === test.id && ['SUBMITTED', 'AUTO_SUBMITTED'].includes(row.status || '')).sort((a, b) => String(b.submitted_at || '').localeCompare(String(a.submitted_at || '')));
        const total = dashboardQuestionCount(test) || 1;
        const accent = fresh ? '#ea580c' : done ? '#059669' : '#6366f1';
        return <article key={test.id} className="rounded-2xl overflow-hidden transition-all hover:shadow-lg" aria-label={`${test.title}${fresh ? ', new test' : ''}${test.locked ? ', locked' : ''}`} style={{ background: fresh ? 'linear-gradient(120deg, #fff7ed, #fffbeb)' : '#fff', border: `1px ${test.locked ? 'dashed' : 'solid'} ${fresh ? '#fb923c' : done ? '#bbf7d0' : '#e8ecf1'}`, boxShadow: fresh ? '0 4px 18px #fb923c20' : '0 2px 8px #0000000a' }}>
            <div className="p-4 flex items-start gap-3"><span className="h-10 w-10 flex items-center justify-center rounded-xl text-[11px] font-black flex-shrink-0" style={{ background: `linear-gradient(135deg, ${accent}, ${fresh ? '#f59e0b' : done ? '#10b981' : '#818cf8'})`, color: '#fff' }}>{String(index + 1).padStart(2, '0')}</span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-[13px] font-bold" style={{ color: '#0f172a' }}>{test.title}</h4><div className="flex gap-1.5 items-center">{fresh && <span title="Highlighted for 24 hours after creation" className="px-2 py-0.5 rounded-full text-[8px] font-black" style={{ background: '#ea580c', color: '#fff' }}>NEW · 24H</span>}{done && <span className="text-[9px] font-bold" style={{ color: '#059669' }}>Attempted ✓</span>}<span className="px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ background: test.locked ? '#f1f5f9' : '#eef2ff', color: '#475569' }}>{test.locked ? 'Locked' : test.mode === 'LIVE' ? 'LIVE' : 'Practice'}</span></div></div><div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold" style={{ color: '#475569' }}><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9' }}><Clock size={10}/>{test.duration_minutes}m</span><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9' }}><Target size={10}/>{dashboardQuestionCount(test)}Q</span><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: '#ecfdf5', color: '#059669' }}><Zap size={10}/>{test.xp_reward ?? test.total_points ?? test.total_marks ?? 0} pts</span></div></div></div>
            <div className="px-4 pb-3 pt-2 flex flex-wrap items-center justify-between gap-2" style={{ borderTop: '1px solid #e2e8f080' }}><span className="text-[9px] font-medium" style={{ color: '#475569' }}>{test.category || test.level_title || 'Level test'}</span>{test.locked ? <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: '#64748b' }}><Lock size={12}/>Unlock at Level {test.level_no || 1}</span> : <button onClick={() => { window.location.href = `/test/${test.id}`; }} className="px-5 py-2 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5" style={{ background: `linear-gradient(135deg, ${accent}, ${fresh ? '#f59e0b' : '#8b5cf6'})`, color: '#fff' }}><Play size={12}/>{done ? 'Try Again' : 'Start'}</button>}</div>
            {results.length > 0 && <div className="px-4 pb-3 text-[10px] font-semibold text-slate-500">Last score: {Math.round((results[0].score || 0) / total * 100)}% · Best: {Math.round(Math.max(...results.map(row => row.score || 0)) / total * 100)}% · {results.length} completed attempt{results.length === 1 ? '' : 's'}</div>}
        </article>;
    })}</>;
}
