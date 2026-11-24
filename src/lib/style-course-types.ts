export type StyleCourseId = 'css' | 'w3css';
export interface CourseNode { text?: string; code?: string; tag?: string; attrs?: Record<string, string>; children?: CourseNode[] }
export interface StyleDraft { html: string; css: string }
export interface StyleLesson {
    id: string; title: string; group: string; summary: string; remember: string; practice: string;
    source: string; nodes: CourseNode[]; examples: string[]; visual?: string; demo?: StyleDraft; notesPages?: number[];
}
export interface StyleTask {
    id: string; title: string; subtitle: string; source: string; steps: string[]; skills: string[];
    lesson: string; target: string; starter: StyleDraft; solution: StyleDraft; note: string;
    inlineAfter?: string;
    inlineDescription?: string;
}
export interface StyleQuestion { question: string; options: string[]; correctAnswer: number; explanation: string; source: string; sourceQuestion: string }
export interface StyleCourse { id: StyleCourseId; name: string; description: string; notesUrl: string; lessons: StyleLesson[]; tasks: StyleTask[]; quiz: StyleQuestion[] }
export interface CourseSummary { id: StyleCourseId; name: string; description: string; notesUrl: string; lessons: Pick<StyleLesson, 'id' | 'title' | 'group'>[]; tasks: Pick<StyleTask,'id'|'title'|'subtitle'|'skills'|'inlineAfter'|'inlineDescription'>[]; quizCount: number; exampleCount: number }
