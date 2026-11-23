export function dashboardGreeting(time: number) {
    const hour = new Date(time + 19_800_000).getUTCHours();
    return { label: hour >= 5 && hour < 12 ? 'Good morning' : hour < 17 && hour >= 12 ? 'Good afternoon' : 'Good evening',
        period: hour >= 6 && hour < 18 ? 'day' as const : 'night' as const };
}

export function dailyAnswerProgress(daily?: { total: number; answered: number; status: string } | null) {
    const total = daily && Number.isInteger(daily.total) && daily.total > 0 ? daily.total : 10;
    const answered = daily && Number.isFinite(daily.answered) ? Math.max(0, Math.min(total, Math.floor(daily.answered))) : 0;
    return { total, answered, percent: answered / total * 100, complete: daily?.status === 'completed' };
}

interface ScoreAttempt {
    id: string; test_id?: string; test_title: string; total_marks: number; score: number; status: string; submitted_at?: string;
}
export function latestScoreComparison(attempts: ScoreAttempt[]) {
    const valid = attempts.filter(row => ['SUBMITTED', 'AUTO_SUBMITTED'].includes(row.status) && row.test_id &&
        Number.isFinite(row.total_marks) && row.total_marks > 0 && Number.isFinite(row.score) && row.score >= 0 && row.score <= row.total_marks &&
        Number.isFinite(Date.parse(row.submitted_at || '')))
        .sort((a, b) => Date.parse(b.submitted_at!) - Date.parse(a.submitted_at!));
    const latest = valid[0]; if (!latest) return null;
    const previous = valid.find(row => row.id !== latest.id && row.test_id === latest.test_id && row.total_marks === latest.total_marks &&
        Date.parse(row.submitted_at!) < Date.parse(latest.submitted_at!));
    if (!previous) return null;
    return { title: latest.test_title, change: Math.round((latest.score - previous.score) / latest.total_marks * 1000) / 10,
        latestPercent: Math.round(latest.score / latest.total_marks * 100), previousPercent: Math.round(previous.score / previous.total_marks * 100) };
}

export function testSubjectAppearance(category?: string) {
    const value = (category || '').toLowerCase();
    if (/python/.test(value)) return { kind: 'python', accent: '#047857', surface: '#ecfdf5', border: '#bcebd6' };
    if (/web|html|css|javascript/.test(value)) return { kind: 'web', accent: '#6d28d9', surface: '#f5f0ff', border: '#e1d4fa' };
    if (/ccc/.test(value)) return { kind: 'ccc', accent: '#a45309', surface: '#fffbeb', border: '#f3dfb3' };
    if (/it.?tools|information/.test(value)) return { kind: 'tools', accent: '#0369a1', surface: '#eff8ff', border: '#c5e3f5' };
    return { kind: 'general', accent: '#6650a1', surface: '#f5f2fc', border: '#e4dcf2' };
}
