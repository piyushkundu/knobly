'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { PracticeQuestion, PracticeSession } from '@/lib/learning-practice';
export type StudentSession = Omit<PracticeSession, 'questions'> & { questions: (Omit<PracticeQuestion, 'correctOptionId'> & { correctOptionId?: string })[] };
export interface LearningOverview {
    day: string; week: string; weeklyGoal: number; bookmarks: string[]; streak: number; completedDays: string[];
    wrongCount: number; analysedAttempts: number; analysedAt: string | null;
    topics: { topic: string; testId: string; category: string; seen: number; wrong: number; correct: number; accuracy: number }[];
    daily: { id: string; status: string; total: number; answered: number; score?: number } | null;
    recent: { id: string; kind: string; day: string; status: string; score?: number; total: number; answered: number; createdAt: string }[];
    weekly: { id: string; name: string; score: number; days: string[] }[];
    ownWeekly: { score: number; days: string[] };
}
export async function practiceRequest<T>(user: User, body?: Record<string, unknown>): Promise<T> {
    const token = await user.getIdToken();
    const response = await fetch('/api/practice', { method: body ? 'POST' : 'GET', cache: 'no-store',
        headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Please try again.');
    return data as T;
}
export function useLearning(user: User | null) {
    const [stored, setStored] = useState<{ uid: string; value: LearningOverview } | null>(null), [loading, setLoading] = useState(false), [error, setError] = useState('');
    const currentUser = useRef(user?.uid); currentUser.current = user?.uid;
    const setData = useCallback((value: LearningOverview) => { if (user && currentUser.current === user.uid) setStored({ uid: user.uid, value }); }, [user]);
    const refresh = useCallback(async () => {
        if (!user) return;
        setLoading(true); setError('');
        try { setData(await practiceRequest<LearningOverview>(user)); }
        catch (error) { setError(error instanceof Error ? error.message : 'Progress could not be loaded.'); }
        finally { setLoading(false); }
    }, [user, setData]);
    useEffect(() => {
        let cancelled = false;
        setError('');
        if (user) practiceRequest<LearningOverview>(user).then(value => { if (!cancelled) setData(value); })
            .catch(error => { if (!cancelled) setError(String(error.message)); });
        else setStored(null);
        return () => { cancelled = true; };
    }, [user, setData]);
    return { data: stored?.uid === user?.uid ? stored?.value || null : null, loading, error, refresh, setData };
}
