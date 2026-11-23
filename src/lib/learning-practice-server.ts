import 'server-only';
import { unstable_cache } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { htmlExam } from '../../content/exams/html-olevel-test-1.mjs';
import { chooseDailyQuestions, currentStreak, gradeSession, indiaDay, publicSession, validateAnswers, weakTopics, weekOf,
    type LearningProfile, type PracticeQuestion, type PracticeSession, type QuestionProgressMap } from './learning-practice';

const userRef = (uid: string) => getAdminDb().collection('practice_users').doc(uid);
const sessionsRef = (uid: string) => userRef(uid).collection('sessions');
const chunks = <T,>(items: T[], size = 30) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));
const truth = (value: unknown) => value === true || value === 1 || (typeof value === 'string' && ['true', '1'].includes(value.toLowerCase()));
const htmlDetails = new Map(htmlExam.questions.map(q => [q.question_text, q]));

// Only public test metadata is shared. Authentication always runs before this code.
const activeTests = unstable_cache(async () => {
    const snapshot = await getAdminDb().collection('exam_tests').where('is_active', '==', true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; title: string; category?: string }));
}, ['practice-active-tests-v1'], { revalidate: 60 });

// One shared catalogue per India calendar day / active-test signature. Refreshing
// a student's dashboard does not reload every question and option from Firestore.
const cachedPool = unstable_cache(async (tests: { id: string; title: string; category?: string }[], day: string) => {
    void day;
    const db = getAdminDb(), testMap = new Map(tests.map(test => [test.id, test]));
    const questions = (await Promise.all(chunks(tests.map(t => t.id)).map(ids =>
        db.collection('exam_questions').where('test_id', 'in', ids).get()))).flatMap(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const options = (await Promise.all(chunks(questions.map(q => q.id)).map(ids =>
        db.collection('exam_options').where('question_id', 'in', ids).get()))).flatMap(snap => snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    const grouped = new Map<string, typeof options>();
    for (const option of options) {
        const qid = (option as { question_id?: string }).question_id;
        if (qid) grouped.set(qid, [...(grouped.get(qid) || []), option]);
    }
    const pool: PracticeQuestion[] = [];
    for (const raw of questions) {
        const q = raw as typeof raw & { test_id: string; question_text: string; question_type: string; chapter?: string; explanation?: string };
        const test = testMap.get(q.test_id), choices = grouped.get(q.id) || [];
        const correct = choices.filter(option => truth((option as { is_correct?: unknown }).is_correct));
        if (!test || typeof q.question_text !== 'string' || !q.question_text.trim() ||
            !['MCQ', 'TF'].includes(String(q.question_type).toUpperCase()) || choices.length < 2 || correct.length !== 1 ||
            choices.some(option => { const text = (option as { option_text?: unknown }).option_text; return typeof text !== 'string' || !text.trim(); })) continue;
        const detail = htmlDetails.get(q.question_text);
        pool.push({ id: q.id, text: q.question_text, testId: test.id, testTitle: test.title,
            category: test.category || 'General', topic: q.chapter || detail?.chapter || test.title,
            explanation: q.explanation || detail?.explanation || '',
            options: choices.map(option => ({ id: option.id, text: String((option as { option_text?: unknown }).option_text || '') })),
            correctOptionId: correct[0].id });
    }
    return pool;
}, ['practice-question-pool-v1'], { revalidate: 86_400 });

export async function questionPool() {
    const tests = (await activeTests()).sort((a, b) => a.id.localeCompare(b.id));
    return { tests, pool: await cachedPool(tests, indiaDay()) };
}
export async function learningOverview(uid: string) {
    const db = getAdminDb(), day = indiaDay(), week = weekOf(day);
    const [profileSnap, dailySnap, recentSnap, weeklySnap, ownWeek] = await Promise.all([
        userRef(uid).get(), sessionsRef(uid).doc(day).get(),
        sessionsRef(uid).orderBy('createdAt', 'desc').limit(14).get(),
        db.collection('practice_weeks').doc(week).collection('entries').orderBy('score', 'desc').limit(20).get(),
        db.collection('practice_weeks').doc(week).collection('entries').doc(uid).get(),
    ]);
    const profile = (profileSnap.data() || {}) as LearningProfile;
    const pool = Object.keys(profile.questionProgress || {}).length ? (await questionPool()).pool : [];
    const summary = (doc: { id: string; data: () => Record<string, unknown> | undefined }) => {
        const value = doc.data() as unknown as PracticeSession;
        return { id: doc.id, kind: value.kind, day: value.day, status: value.status, score: value.score,
            total: value.questions.length, answered: Object.keys(value.answers || {}).length, createdAt: value.createdAt };
    };
    return { day, week, weeklyGoal: profile.weeklyGoal || 3, bookmarks: profile.bookmarks || [],
        streak: currentStreak(profile.completedDays || [], day), completedDays: profile.completedDays || [],
        wrongCount: pool.filter(q => (profile.questionProgress?.[q.id]?.wrong || 0) > 0).length,
        analysedAttempts: (profile.analysedAttempts || []).length, analysedAt: profile.analysedAt || null,
        topics: weakTopics(pool, profile.questionProgress || {}),
        daily: dailySnap.exists ? summary(dailySnap) : null,
        recent: recentSnap.docs.map(summary),
        weekly: weeklySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ownWeekly: ownWeek.data() || { score: 0, days: [] } };
}

// Analyse completed exam answers incrementally. Only this signed-in user's
// historical responses are read; exam collections are never modified here.
export async function syncExamLearning(uid: string, pool: PracticeQuestion[]) {
    const db = getAdminDb(), ref = userRef(uid), profileSnap = await ref.get();
    const profile = (profileSnap.data() || {}) as LearningProfile;
    const attemptsSnap = await db.collection('exam_attempts').where('user_id', '==', uid).get();
    const done = new Set(profile.analysedAttempts || []);
    const activeIds = new Set(pool.map(question => question.testId));
    const eligible = attemptsSnap.docs.filter(doc => activeIds.has(doc.data().test_id) && ['SUBMITTED', 'AUTO_SUBMITTED'].includes(doc.data().status));
    const pending = eligible.filter(doc => !done.has(doc.id)).sort((a, b) => String(b.data().submitted_at || '').localeCompare(String(a.data().submitted_at || '')));
    // Bound each initial-analysis step; the UI continues remaining steps.
    const batch = pending.slice(0, 30);
    if (!batch.length) return { remaining: 0, analysed: done.size };
    const records = await db.collection('exam_responses').where('attempt_id', 'in', batch.map(doc => doc.id)).get();
    const questions = new Map(pool.map(q => [q.id, q]));
    const responses = new Map<string, { questionId: string; correct: boolean }[]>();
    for (const doc of records.docs) {
        const data = doc.data(), question = questions.get(data.question_id);
        if (!question || !data.option_id || !question.options.some(option => option.id === data.option_id)) continue;
        const current = responses.get(data.attempt_id) || [];
        if (!current.some(row => row.questionId === question.id)) current.push({ questionId: question.id, correct: data.option_id === question.correctOptionId });
        responses.set(data.attempt_id, current);
    }
    await db.runTransaction(async transaction => {
        const latest = (await transaction.get(ref)).data() as LearningProfile | undefined;
        const processed = new Set(latest?.analysedAttempts || []), progress: QuestionProgressMap = { ...latest?.questionProgress };
        for (const attempt of batch) {
            if (processed.has(attempt.id)) continue;
            const stamp = String(attempt.data().submitted_at || new Date().toISOString());
            for (const response of responses.get(attempt.id) || []) {
                const old = progress[response.questionId] || { seen: 0, wrong: 0, correct: 0, lastSeen: '' };
                progress[response.questionId] = { seen: old.seen + 1, wrong: old.wrong + Number(!response.correct),
                    correct: old.correct + Number(response.correct), lastSeen: old.lastSeen > stamp ? old.lastSeen : stamp,
                    ...(!response.correct ? { lastWrong: old.lastWrong && old.lastWrong > stamp ? old.lastWrong : stamp } : old.lastWrong ? { lastWrong: old.lastWrong } : {}) };
            }
            processed.add(attempt.id);
        }
        transaction.set(ref, { questionProgress: progress, analysedAttempts: [...processed], analysedAt: new Date().toISOString(),
            topics: weakTopics(pool, progress) }, { merge: true });
    });
    return { remaining: Math.max(0, pending.length - batch.length), analysed: done.size + batch.length };
}
export async function startPractice(uid: string, kind: PracticeSession['kind']) {
    const ref = sessionsRef(uid).doc(kind === 'daily' ? indiaDay() : kind + '_' + randomUUID());
    const existing = await ref.get();
    if (existing.exists) return publicSession({ id: ref.id, ...existing.data() } as PracticeSession);
    const { pool } = await questionPool();
    const analysis = await syncExamLearning(uid, pool);
    if (analysis.remaining > 0) return { preparing: true as const, ...analysis };
    const profile = ((await userRef(uid).get()).data() || {}) as LearningProfile;
    const progress = profile.questionProgress || {};
    const candidates = kind === 'wrong' ? pool.filter(q => progress[q.id]?.wrong > 0)
        : kind === 'bookmarks' ? pool.filter(q => profile.bookmarks?.includes(q.id)) : pool;
    const questions = chooseDailyQuestions(candidates, progress, uid + ':' + indiaDay(), kind === 'daily' ? 10 : 20);
    if (!questions.length) throw Error(kind === 'daily' ? 'No active questions with a valid answer are available yet.' : 'No eligible saved questions yet. Complete a test or bookmark a question first.');
    const session: PracticeSession = { id: ref.id, kind, day: indiaDay(), createdAt: new Date().toISOString(), questions, answers: {}, index: 0, status: 'in_progress' };
    const saved = await getAdminDb().runTransaction(async transaction => {
        const latest = await transaction.get(ref);
        if (latest.exists) return { id: ref.id, ...latest.data() } as PracticeSession;
        transaction.create(ref, session);
        return session;
    });
    return publicSession(saved);
}
export async function updatePractice(uid: string, id: string, value: unknown, index: number, submit: boolean, displayName: string) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw Error('Invalid practice session');
    const db = getAdminDb(), ref = sessionsRef(uid).doc(id), profileRef = userRef(uid);
    const weekRef = db.collection('practice_weeks').doc(weekOf(indiaDay())).collection('entries').doc(uid);
    const result = await db.runTransaction(async transaction => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw Error('Practice session not found');
        const session = { ...snapshot.data(), id } as PracticeSession;
        if (session.status === 'completed') return session;
        const answers = validateAnswers(session, value);
        if (submit && !Object.keys(answers).length) throw Error('Answer at least one question before finishing practice.');
        if (!Number.isInteger(index) || index < 0 || index >= session.questions.length) throw Error('Invalid question position');
        if (!submit) {
            transaction.update(ref, { answers, index });
            return { ...session, answers, index };
        }
        const [profileSnap, weeklySnap] = await Promise.all([transaction.get(profileRef), transaction.get(weekRef)]);
        const profile = (profileSnap.data() || {}) as LearningProfile;
        const progress: QuestionProgressMap = { ...profile.questionProgress }, now = new Date().toISOString(), today = indiaDay();
        for (const question of session.questions) {
            if (!answers[question.id]) continue;
            const correct = answers[question.id] === question.correctOptionId;
            const old = progress[question.id] || { seen: 0, wrong: 0, correct: 0, lastSeen: '' };
            progress[question.id] = { ...old, seen: old.seen + 1, wrong: old.wrong + Number(!correct), correct: old.correct + Number(correct), lastSeen: now,
                ...(!correct ? { lastWrong: now } : {}) };
        }
        const score = gradeSession(session, answers);
        const completed = { ...session, answers, index, score, status: 'completed' as const, completedAt: now };
        transaction.update(ref, { answers, index, score, status: 'completed', completedAt: now });
        const days = session.kind === 'daily' ? [...new Set([...(profile.completedDays || []), today])].sort().slice(-366) : profile.completedDays || [];
        transaction.set(profileRef, { questionProgress: progress, completedDays: days }, { merge: true });
        // Daily-only league: no writes to exam_user_state, profiles, or old scores.
        if (session.kind === 'daily') {
            const weekly = weeklySnap.data() || {}, counted = new Set<string>(weekly.days || []);
            if (!counted.has(today)) {
                counted.add(today);
                transaction.set(weekRef, { userId: uid, name: displayName.slice(0, 80) || 'Student',
                    score: (weekly.score || 0) + score, days: [...counted], updatedAt: now }, { merge: true });
            }
        }
        return completed;
    });
    return publicSession(result);
}
export async function setLearningPreference(uid: string, body: { action: string; questionId?: string; weeklyGoal?: number; saved?: boolean }) {
    const ref = userRef(uid), db = getAdminDb();
    if (body.action === 'goal') {
        if (![3, 5, 7].includes(body.weeklyGoal || 0)) throw Error('Choose 3, 5 or 7 practice days');
        await ref.set({ weeklyGoal: body.weeklyGoal }, { merge: true }); return;
    }
    if (!body.questionId || !/^[a-zA-Z0-9_-]{1,150}$/.test(body.questionId) || typeof body.saved !== 'boolean') throw Error('Invalid bookmark');
    const question = await db.collection('exam_questions').doc(body.questionId).get();
    if (!question.exists) throw Error('Question not found');
    const test = await db.collection('exam_tests').doc(question.data()!.test_id).get();
    if (test.data()?.is_active !== true) throw Error('This test is no longer active');
    // Field transforms preserve simultaneous bookmarks and learning statistics.
    await ref.set({ bookmarks: body.saved ? FieldValue.arrayUnion(body.questionId) : FieldValue.arrayRemove(body.questionId) }, { merge: true });
}
