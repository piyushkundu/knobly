'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import { Check, CheckCircle2, Moon, Sun } from 'lucide-react';
import { dailyAnswerProgress, dashboardGreeting } from '@/lib/dashboard-highlights';
import styles from './dashboard.module.css';

export function DashboardGreeting({ name }: { name: string }) {
    const [greeting, setGreeting] = useState<ReturnType<typeof dashboardGreeting> | null>(null);
    useEffect(() => {
        const update = () => setGreeting(dashboardGreeting(Date.now()));
        update(); const timer = setInterval(update, 60_000);
        return () => clearInterval(timer);
    }, []);
    return <div className={styles.welcomeCopy}><span className={styles.greetingLabel}>
        <span className={styles.greetingOrb} data-period={greeting?.period || 'day'} aria-hidden="true">{greeting?.period === 'night' ? <Moon size={14}/> : <Sun size={15}/>}</span>
        YOUR NEXT STEP STARTS HERE</span><h1>{greeting?.label || 'Welcome back'}, {name}<span>Let’s make today count.</span></h1>
        <p>Practise a little. Understand your mistakes. See yourself improve.</p></div>;
}

interface Rank { name: string; icon: string; color: string; minPoints: number }
export function RankJourney({ ranks, current, points, progress, next, remaining }: {
    ranks: Rank[]; current: Rank; points: number; progress: number; next: Rank | null; remaining: number;
}) {
    const currentIndex = ranks.findIndex(rank => rank.name === current.name);
    return <section className={styles.rankScene} aria-label="Your exam rank" data-tier={current.name.toLowerCase()} style={{ '--rank-metal': current.color } as CSSProperties}>
        <div className={styles.rankSummary}><div className={styles.medalArt} role="img" aria-label={current.name + ' medal'}><i className={styles.medalRibbon}/><span className={styles.medalCoin}>{current.icon}</span></div>
            <div className={styles.rankDetails}><small>YOUR EXAM RANK</small><div className={styles.rankHeading}><strong>{current.name}</strong><b>{points} pts</b></div>
                <div className={styles.rankTrack} role="progressbar" aria-label="Progress to next exam rank" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, progress))}><i style={{ width: Math.max(0, Math.min(100, progress)) + '%' }}/></div>
                <p>{next ? <><strong>{remaining}</strong> points to {next.name}</> : 'Highest rank reached'}</p></div></div>
        <ol className={styles.rankJourney} aria-label="Exam rank journey">{ranks.map((rank, i) => <li key={rank.name} data-state={i < currentIndex ? 'complete' : i === currentIndex ? 'current' : i === currentIndex + 1 ? 'next' : 'locked'} aria-current={i === currentIndex ? 'step' : undefined} title={rank.name + ' · ' + rank.minPoints + ' points' + (rank.name === 'Legend' ? ' · top-ranked student only' : '')}>
            <span aria-hidden="true">{i < currentIndex ? <Check size={13}/> : rank.icon}</span><small>{rank.name}</small></li>)}</ol>
    </section>;
}

type Daily = { id: string; status: string; total: number; answered: number; score?: number } | null | undefined;
export function DailyProgress({ daily, userId, day }: { daily: Daily; userId: string; day?: string }) {
    const { total, answered, percent, complete } = dailyAnswerProgress(daily);
    const dailyId = daily?.id;
    const [celebrationStamp, setCelebrationStamp] = useState<string | null>(null);
    const stamp = day + ':' + dailyId;
    const celebrating = complete && celebrationStamp === userId + ':' + stamp;
    useEffect(() => {
        if (!complete || !dailyId || !day) return;
        let stopTimer: ReturnType<typeof setTimeout> | undefined;
        const beginTimer = setTimeout(() => {
            const key = 'knobly:daily-celebration:' + userId;
            try {
                if (localStorage.getItem(key) === stamp) return;
                localStorage.setItem(key, stamp);
            } catch { return; }
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            setCelebrationStamp(userId + ':' + stamp);
            stopTimer = setTimeout(() => setCelebrationStamp(null), 1800);
        }, 0);
        return () => { clearTimeout(beginTimer); if (stopTimer !== undefined) clearTimeout(stopTimer); };
    }, [complete, dailyId, day, userId, stamp]);
    const ready = Boolean(day);
    return <div className={styles.dailyProgress} data-complete={complete || undefined} data-celebrate={celebrating || undefined}>
        <div className={styles.dailyPaper} aria-hidden="true"><span>YOUR DAILY</span><strong>{total}</strong><b>QUESTIONS</b><i/></div>
        <div className={styles.dailyAnswerMeter} role="progressbar" aria-label="Daily practice questions answered" aria-busy={!ready} aria-valuemin={0} aria-valuemax={total} aria-valuenow={ready ? answered : undefined} aria-valuetext={ready ? answered + ' of ' + total + ' answered' + (complete ? ', practice completed' : '') : 'Loading today’s progress'}>
            <div className={styles.dailyMeterLabel}><strong>{ready ? answered : '—'}<small>/{total}</small></strong><span>answered</span></div>
            <div className={styles.dailyMeterTrack}><i style={{ width: (ready ? percent : 0) + '%' }}/></div>
        </div>
        <span className={styles.dialCaption}>{complete && <CheckCircle2 size={12} aria-hidden="true"/>}{!ready ? 'Loading your progress' : complete ? 'Today’s practice complete ✓' : answered ? 'Keep your momentum' : 'Your next small win'}</span>
        {celebrating && <div className={styles.confetti} aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--piece': i } as CSSProperties}/>)}</div>}
    </div>;
}
