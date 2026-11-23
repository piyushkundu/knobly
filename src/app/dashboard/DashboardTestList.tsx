'use client';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowRight, BookOpen, Clock, Code2, Globe, Lock, Monitor, Play, Target, TrendingUp, Zap } from 'lucide-react';
import { dashboardQuestionCount, isNewDashboardTest, NEW_TEST_WINDOW_MS, sortDashboardTests, testCreatedMillis, type DashboardTest } from '@/lib/dashboard-test-order';
import { testSubjectAppearance } from '@/lib/dashboard-highlights';
import styles from './dashboard.module.css';

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
        const subjectStyle = testSubjectAppearance(test.category), accent = fresh ? '#b45309' : subjectStyle.accent;
        const SubjectIcon = subjectStyle.kind === 'web' ? Globe : subjectStyle.kind === 'python' ? Code2 : ['ccc', 'tools'].includes(subjectStyle.kind) ? Monitor : BookOpen;
        return <article key={test.id} className={styles.testCard} aria-label={`${test.title}${fresh ? ', new test' : ''}${test.locked ? ', locked' : ''}`} style={{ '--subject-accent': accent, '--subject-surface': fresh ? '#fff3e2' : subjectStyle.surface,
            background: fresh ? 'linear-gradient(120deg, #fff7ed, #fffbeb)' : '#fff', border: `1px ${test.locked ? 'dashed' : 'solid'} ${fresh ? '#fb923c' : done ? '#bbf7d0' : subjectStyle.border}`,
            animationDelay: Math.min(index, 9) * 45 + 'ms' } as CSSProperties}>
            <div className={styles.testCardMain}><span className={styles.subjectTile} aria-hidden="true"><SubjectIcon size={23}/><small>{String(index + 1).padStart(2, '0')}</small></span><div className={styles.testCardCopy}><div className={styles.testCardTitle}><h4>{test.title}</h4><div className={styles.testBadges}>
                {fresh && <span title="Highlighted for 24 hours after creation" className={styles.freshTest}>NEW · 24H</span>}{done && <span className={styles.attemptedTest}>Attempted ✓</span>}<span className={styles.testMode}>{test.locked ? 'Locked' : test.mode === 'LIVE' ? 'LIVE' : 'Practice'}</span></div></div>
                <div className={styles.testMeta}><span><Clock size={12}/>{test.duration_minutes}m</span><span><Target size={12}/>{dashboardQuestionCount(test)}Q</span><span><Zap size={12}/>{test.xp_reward ?? test.total_points ?? test.total_marks ?? 0} pts</span></div></div></div>
            <div className={styles.testCardFooter}><span className={styles.testSubject}><SubjectIcon size={13}/>{test.category || test.level_title || 'Level test'}</span>{test.locked ? <span className={styles.testLocked}><Lock size={12}/>Unlock at Level {test.level_no || 1}</span> : <button onClick={() => { window.location.href = `/test/${test.id}`; }} className={styles.testStart}><Play size={12}/>{done ? 'Try Again' : 'Start'}<ArrowRight size={13}/></button>}</div>
            {results.length > 0 && <div className={styles.testResults}><TrendingUp size={13}/>Last score: {Math.round((results[0].score || 0) / total * 100)}% · Best: {Math.round(Math.max(...results.map(row => row.score || 0)) / total * 100)}% · {results.length} completed attempt{results.length === 1 ? '' : 's'}</div>}
        </article>;
    })}</>;
}
