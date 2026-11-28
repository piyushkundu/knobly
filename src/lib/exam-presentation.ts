import type { ExamAnswers, ExamQuestion } from '@/types/exam';

export type ExamLanguage = 'both' | 'hi' | 'en';
export type PaletteFilter = 'all' | 'unanswered' | 'review';
export type ExamSaveStatus = 'saved' | 'saving' | 'error' | 'offline';

export function hasExamAnswer(answer: ExamAnswers[string] | undefined) {
    return !!(answer?.option_id || answer?.short_answer?.trim());
}

export function examSummary(questions: Pick<ExamQuestion, 'id'>[], answers: ExamAnswers, review: ReadonlySet<string>) {
    const answered = questions.filter(q => hasExamAnswer(answers[q.id])).length;
    return { total: questions.length, answered, unanswered: questions.length - answered, review: questions.filter(q => review.has(q.id)).length };
}

// Split only bilingual prose. Pipes in code (a | b, CSS values, HTML) stay intact.
export function bilingualParts(text: string): { hi: string; en: string } | null {
    if (!/[\u0900-\u097f]/u.test(text)) return null;
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 2 && lines.every(line => line.trim())) {
        const hi = lines.find(line => /[\u0900-\u097f]/u.test(line));
        const en = lines.find(line => !/[\u0900-\u097f]/u.test(line));
        if (hi && en) return { hi: hi.trim(), en: en.trim() };
    }
    if (lines.length !== 1) return null;
    const pieces = text.split(/\s*\|\s*/);
    if (pieces.length !== 2 || !pieces.every(piece => piece.trim())) return null;
    const [a, b] = pieces.map(piece => piece.trim());
    const aHindi = /[\u0900-\u097f]/u.test(a), bHindi = /[\u0900-\u097f]/u.test(b);
    return aHindi !== bHindi ? { hi: aHindi ? a : b, en: aHindi ? b : a } : null;
}

export function filteredQuestions(questions: ExamQuestion[], answers: ExamAnswers, review: ReadonlySet<string>, filter: PaletteFilter) {
    return questions.map((question, index) => ({ question, index })).filter(({ question }) => filter === 'review' ? review.has(question.id) : filter === 'unanswered' ? !hasExamAnswer(answers[question.id]) : true);
}

export function examShortcut(event: {key:string;altKey?:boolean;ctrlKey?:boolean;metaKey?:boolean;shiftKey?:boolean;repeat?:boolean}, editing: boolean, dialog: boolean) {
    if (editing || dialog || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
    if (/^[1-4]$/.test(event.key)) return { action: 'option' as const, index: Number(event.key) - 1 };
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'n') return { action: 'next' as const };
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'p') return { action: 'previous' as const };
    if (event.key.toLowerCase() === 'r') return { action: 'review' as const };
    return null;
}

export function timerLevel(seconds: number) {
    return seconds <= 300 ? 'urgent' : seconds <= 600 ? 'soon' : 'normal';
}

export function readExamMetadata(key: string): {review:string[];bookmarks:string[]} {
    try {
        const data = JSON.parse(localStorage.getItem(key) || 'null');
        const ids = (value: unknown) => Array.isArray(value) ? value.filter((id):id is string => typeof id === 'string').slice(0, 500) : [];
        return { review: ids(data?.review), bookmarks: ids(data?.bookmarks) };
    } catch { return { review: [], bookmarks: [] }; }
}
