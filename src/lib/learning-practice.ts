export interface PracticeOption { id: string; text: string }
export interface PracticeQuestion {
    id: string; text: string; testId: string; testTitle: string; category: string; topic: string;
    options: PracticeOption[]; correctOptionId: string; explanation?: string; reason?: string;
}
export interface QuestionProgress { seen: number; wrong: number; correct: number; lastSeen: string; lastWrong?: string }
export type QuestionProgressMap = Record<string, QuestionProgress>;
export interface PracticeSession {
    id: string; kind: 'daily' | 'wrong' | 'bookmarks'; day: string; createdAt: string;
    questions: PracticeQuestion[]; answers: Record<string, string>; index: number;
    status: 'in_progress' | 'completed'; score?: number; completedAt?: string;
}
export interface LearningProfile {
    weeklyGoal?: number; bookmarks?: string[]; questionProgress?: QuestionProgressMap;
    analysedAttempts?: string[]; completedDays?: string[]; analysedAt?: string;
}
export const indiaDay = (time: number = Date.now()) => new Date(time + 19_800_000).toISOString().slice(0, 10);
export function weekOf(day: string): string {
    const date = new Date(day + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
    return date.toISOString().slice(0, 10);
}
export function currentStreak(days: string[], today: string): number {
    const saved = new Set(days);
    let date = new Date(today + 'T00:00:00Z'), count = 0;
    if (!saved.has(today)) date = new Date(date.getTime() - 86_400_000);
    while (saved.has(date.toISOString().slice(0, 10))) { count++; date = new Date(date.getTime() - 86_400_000); }
    return count;
}
function hash(value: string): number {
    let result = 2166136261;
    for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
    return result >>> 0;
}
export function chooseDailyQuestions(pool: PracticeQuestion[], progress: QuestionProgressMap, seed: string, size = 10): PracticeQuestion[] {
    const unique = [...new Map(pool.map(q => [q.id, q])).values()];
    const testIds = [...new Set(unique.map(q => q.testId))];
    const chosen: PracticeQuestion[] = [], ids = new Set<string>();
    const seeded = (a: PracticeQuestion, b: PracticeQuestion) => hash(seed + a.id) - hash(seed + b.id) || a.id.localeCompare(b.id);
    const add = (question: PracticeQuestion, reason: string) => {
        if (chosen.length < size && !ids.has(question.id)) { chosen.push({ ...question, reason }); ids.add(question.id); }
    };
    // Frequent mistakes get a revision allocation without consuming every slot.
    const mistakes = unique.filter(q => progress[q.id]?.wrong > 0).sort((a, b) =>
        progress[b.id].wrong - progress[a.id].wrong ||
        progress[b.id].wrong / progress[b.id].seen - progress[a.id].wrong / progress[a.id].seen || seeded(a, b)
    );
    let revisions = 0;
    for (const question of mistakes) {
        if (revisions >= Math.min(4, size)) break;
        const represented = new Set([...chosen.map(q => q.testId), question.testId]);
        // Reserve enough slots for other tests, even when all frequent errors
        // come from the same subject and there are exactly ten active tests.
        if (testIds.length <= size && chosen.length + 1 + testIds.length - represented.size > size) continue;
        add(question, 'Revision: previously answered incorrectly'); revisions++;
    }
    // Represent every eligible active test when there are enough daily slots.
    const tests = testIds.sort((a, b) => hash(seed + a) - hash(seed + b));
    for (const testId of tests) {
        if (chosen.some(q => q.testId === testId)) continue;
        const candidates = unique.filter(q => q.testId === testId).sort((a, b) =>
            (progress[a.id]?.seen || 0) - (progress[b.id]?.seen || 0) || seeded(a, b));
        if (candidates[0]) add(candidates[0], 'Mixed practice: ' + candidates[0].testTitle);
    }
    unique.sort((a, b) => (progress[a.id]?.seen || 0) - (progress[b.id]?.seen || 0) || seeded(a, b))
        .forEach(q => add(q, progress[q.id]?.seen ? 'Spaced revision' : 'Fresh practice'));
    return chosen.sort(seeded);
}
export function publicSession(session: PracticeSession) {
    return { ...session, questions: session.questions.map(({ correctOptionId, explanation, ...question }) =>
        session.status === 'completed' ? { ...question, correctOptionId, explanation } : question) };
}
export function validateAnswers(session: PracticeSession, value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid answers');
    const result: Record<string, string> = {};
    for (const [id, answer] of Object.entries(value)) {
        const question = session.questions.find(q => q.id === id);
        if (!question || typeof answer !== 'string' || !question.options.some(option => option.id === answer)) throw Error('Invalid answer choice');
        result[id] = answer;
    }
    return result;
}
export function gradeSession(session: PracticeSession, answers: Record<string, string>) {
    return session.questions.filter(question => answers[question.id] === question.correctOptionId).length;
}
export function weakTopics(pool: PracticeQuestion[], progress: QuestionProgressMap) {
    const topics = new Map<string, { topic: string; testId: string; category: string; seen: number; wrong: number; correct: number }>();
    for (const question of pool) {
        const p = progress[question.id]; if (!p?.seen) continue;
        const key = question.testId + ':' + question.topic;
        const row = topics.get(key) || { topic: question.topic, testId: question.testId, category: question.category, seen: 0, wrong: 0, correct: 0 };
        row.seen += p.seen; row.wrong += p.wrong; row.correct += p.correct; topics.set(key, row);
    }
    return [...topics.values()].map(row => ({ ...row, accuracy: Math.round(row.correct / row.seen * 100) }))
        .sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong).slice(0, 8);
}
