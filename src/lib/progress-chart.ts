export interface ScoreEntry { label: string; value: number }
export function scoreTrend(entries: ScoreEntry[]) {
    const data = entries.filter(entry => Number.isFinite(entry.value) && entry.value >= 0 && entry.value <= 100);
    const bottom = 184;
    const points = data.map((entry, i) => ({ ...entry, x: data.length === 1 ? 350 : 42 + i * 616 / (data.length - 1), y: 24 + (100 - entry.value) * 1.6 }));
    const line = points.map((point, i) => {
        if (!i) return `M ${point.x} ${point.y}`;
        const previous = points[i - 1], middle = (previous.x + point.x) / 2;
        return `C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
    }).join(' ');
    const area = points.length > 1 ? `${line} L ${points.at(-1)!.x} ${bottom} L ${points[0].x} ${bottom} Z` : '';
    return { points, line, area, bottom, best: points.length ? Math.max(...data.map(entry => entry.value)) : 0,
        average: data.length ? data.reduce((sum, entry) => sum + entry.value, 0) / data.length : 0 };
}
