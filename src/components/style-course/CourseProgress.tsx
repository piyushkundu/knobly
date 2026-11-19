'use client';
import { useCallback, useSyncExternalStore } from 'react';
import type { StyleCourseId } from '@/lib/style-course-types';

const eventName = 'knobly-style-progress-change';
function subscribe(notify: () => void) {
    window.addEventListener('storage', notify);
    window.addEventListener(eventName, notify);
    return () => { window.removeEventListener('storage', notify); window.removeEventListener(eventName, notify); };
}
const empty = () => '';
export function useCourseProgress(course: StyleCourseId) {
    const key = `knobly_style_progress_v1:${course}`;
    const snapshot = useCallback(() => { try { return localStorage.getItem(key) || ''; } catch { return ''; } }, [key]);
    const raw = useSyncExternalStore(subscribe, snapshot, empty);
    let completed: string[] = [];
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) completed = parsed.filter(value => typeof value === 'string'); } catch {}
    const toggle = (id: string) => {
        try {
            const current: unknown = JSON.parse(localStorage.getItem(key) || '[]');
            const previous = Array.isArray(current) ? current.filter(value => typeof value === 'string') : [];
            localStorage.setItem(key, JSON.stringify(previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]));
            window.dispatchEvent(new Event(eventName));
        } catch { /* The lesson remains readable if browser storage is disabled. */ }
    };
    return { completed, toggle };
}
export default function LessonCompletion({ course, lesson }: { course: StyleCourseId; lesson: string }) {
    const { completed, toggle } = useCourseProgress(course);
    return <button type="button" className="sc-primary" aria-pressed={completed.includes(lesson)} onClick={() => toggle(lesson)}>{completed.includes(lesson) ? '✓ Lesson completed' : 'Mark lesson complete'}</button>;
}
