export const NEW_TEST_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface DashboardTest {
    id: string; title: string; category?: string; created_at?: unknown; createdAt?: unknown;
    serial_no?: number; sort_order?: number; level_no?: number; level_title?: string;
    mode?: string; duration_minutes?: number; total_marks?: number; total_points?: number;
    question_count?: number; questions?: unknown[]; xp_reward?: number; is_active?: boolean;
}

export function testCreatedMillis(test: DashboardTest): number | null {
    const value = test.created_at ?? test.createdAt;
    try {
        if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'string') { const time = Date.parse(value); return Number.isFinite(time) ? time : null; }
        if (value && typeof value === 'object') {
            const stamp = value as { toMillis?: () => number; seconds?: number; _seconds?: number; nanoseconds?: number };
            if (typeof stamp.toMillis === 'function') { const time = stamp.toMillis(); return Number.isFinite(time) ? time : null; }
            const seconds = stamp.seconds ?? stamp._seconds;
            if (typeof seconds === 'number' && Number.isFinite(seconds)) return seconds * 1000 + (stamp.nanoseconds || 0) / 1e6;
        }
    } catch { /* An unresolved or malformed timestamp is not a new test. */ }
    return null;
}

export function isNewDashboardTest(test: DashboardTest, now: number): boolean {
    const created = testCreatedMillis(test);
    return created !== null && now >= created && now - created < NEW_TEST_WINDOW_MS;
}

const natural = new Intl.Collator('en-IN', { numeric: true, sensitivity: 'base' });
export function sortDashboardTests<T extends DashboardTest>(tests: readonly T[], now: number): T[] {
    return [...tests].sort((a, b) => {
        const freshA = isNewDashboardTest(a, now), freshB = isNewDashboardTest(b, now);
        if (freshA !== freshB) return freshA ? -1 : 1;
        if (freshA && freshB) {
            const newest = (testCreatedMillis(b) || 0) - (testCreatedMillis(a) || 0);
            if (newest) return newest;
        }
        const category = natural.compare(a.category || '', b.category || '');
        if (category) return category;
        return natural.compare(a.title, b.title) || natural.compare(a.id, b.id);
    });
}

export function dashboardQuestionCount(test: DashboardTest): number {
    return test.question_count ?? test.questions?.length ?? test.total_marks ?? test.total_points ?? 0;
}
