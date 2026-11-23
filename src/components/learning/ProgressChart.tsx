'use client';
import { useId, useState } from 'react';
import { scoreTrend, type ScoreEntry } from '@/lib/progress-chart';
import styles from './progress-chart.module.css';

export default function ProgressChart({ entries }: { entries: ScoreEntry[] }) {
    const id = useId().replace(/:/g, ''), [selected, setSelected] = useState<number | null>(null);
    const { points, line, area, bottom, best, average } = scoreTrend(entries);
    if (!points.length) return <p className={styles.empty}>Complete a test to see your progress here.</p>;
    const activeIndex = selected !== null && points[selected] ? selected : points.length - 1, active = points[activeIndex];
    return <div className={styles.chart}>
        <div className={styles.summary}><div><span>Latest score</span><strong>{Math.round(points.at(-1)!.value)}<small>%</small></strong></div><div><span>Best in this chart</span><strong>{Math.round(best)}<small>%</small></strong></div><div><span>Recent average</span><strong>{Math.round(average)}<small>%</small></strong></div></div>
        <div className={styles.plot}><svg viewBox="0 0 680 224" role="group" aria-label="Score percentage across recent completed tests">
            <defs><linearGradient id={id + '-fill'} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9871df" stopOpacity=".25"/><stop offset="100%" stopColor="#9871df" stopOpacity=".015"/></linearGradient><linearGradient id={id + '-line'} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#aa83df"/><stop offset="100%" stopColor="#7043bf"/></linearGradient></defs>
            {[0, 25, 50, 75, 100].map(value => <g key={value} className={styles.grid}><line x1="42" x2="658" y1={24 + (100 - value) * 1.6} y2={24 + (100 - value) * 1.6}/><text x="29" y={28 + (100 - value) * 1.6} textAnchor="end">{value}</text></g>)}
            {area && <path d={area} fill={'url(#' + id + '-fill)'} className={styles.area}/>}
            <line x1={active.x} x2={active.x} y1="24" y2={bottom} className={styles.guide}/>
            <path d={line} fill="none" stroke={'url(#' + id + '-line)'} strokeWidth="3.5" strokeLinecap="round" pathLength="1" className={styles.trendLine}/>
            {points.map((point, i) => <g key={i}>
                <text x={point.x} y="207" textAnchor="middle" className={styles.attemptLabel}>{String(i + 1).padStart(2, '0')}</text>
                {i === activeIndex && <circle cx={point.x} cy={point.y} r="12" className={styles.halo}/>}
                <circle cx={point.x} cy={point.y} r={i === activeIndex ? 6 : 4.5} className={styles.point} data-selected={i === activeIndex || undefined} aria-hidden="true"/>
                <circle cx={point.x} cy={point.y} r="26" className={styles.hitPoint}
                    tabIndex={0} role="button" aria-pressed={i === activeIndex} aria-label={'Attempt ' + (i + 1) + ': ' + point.label + ', ' + Math.round(point.value) + '%'}
                    onPointerEnter={() => setSelected(i)} onFocus={() => setSelected(i)} onClick={() => setSelected(i)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(i); } }}>
                    <title>{point.label + ': ' + Math.round(point.value) + '%'}</title>
                </circle>
            </g>)}
        </svg><div className={styles.axisCaption}><span>Earlier attempts</span><span>Latest attempt</span></div></div>
        <div className={styles.readout} aria-live="polite"><span className={styles.readoutDot}/><div><small>{activeIndex === points.length - 1 ? 'LATEST ATTEMPT' : 'ATTEMPT ' + (activeIndex + 1)}</small><strong>{active.label}</strong></div><b>{Math.round(active.value)}<small>%</small></b></div>
    </div>;
}
