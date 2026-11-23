export default function ProgressChart({ entries }: { entries: { label: string; value: number }[] }) {
    if (!entries.length) return <p className="py-9 text-center text-sm text-slate-500">Complete a test to see your progress here.</p>;
    const width = 520, height = 150;
    const points = entries.map((entry, i) => ({ x: 20 + i * (width - 40) / Math.max(1, entries.length - 1), y: 12 + (100 - Math.max(0, Math.min(100, entry.value))) / 100 * (height - 30), ...entry }));
    const path = points.map(p => p.x + ',' + p.y).join(' ');
    return <div><svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label="Score percentage across recent completed tests" className="w-full overflow-visible">
        {[0, 50, 100].map(value => <g key={value}><line x1="20" x2="500" y1={12 + (100 - value) / 100 * 120} y2={12 + (100 - value) / 100 * 120} stroke="#edeaf5" strokeDasharray="4 5"/><text x="0" y={16 + (100 - value) / 100 * 120} fontSize="8" fill="#94a3b8">{value}</text></g>)}
        <polyline points={path} fill="none" stroke="#8658d7" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
        {points.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="4.5" fill="#fff" stroke="#8658d7" strokeWidth="2"><title>{point.label + ': ' + Math.round(point.value) + '%'}</title></circle>)}
    </svg><div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>Earlier tests</span><span>Latest test</span></div></div>;
}
