export function practiceResume(attempt: { user_id?: string; test_id?: string; status?: string; started_at?: string; question_order?: string[] }, userId: string, test: { id: string; mode?: string; duration_minutes: number }, now = Date.now()) {
    if (test.mode !== 'PRACTICE' || attempt.user_id !== userId || attempt.test_id !== test.id || attempt.status !== 'IN_PROGRESS') return null;
    const deadline = Date.parse(attempt.started_at || '') + test.duration_minutes * 60_000;
    if (!Number.isFinite(deadline) || deadline <= now) return null;
    return { deadline, seconds: Math.ceil((deadline - now) / 1000), order: Array.isArray(attempt.question_order) ? attempt.question_order : [] };
}
