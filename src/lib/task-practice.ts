export type TaskEditorMode = 'exam' | 'practice';

// A single launch window for everybody; revisiting does not restart the badge.
export const PRACTICE_LAUNCHED_AT = Date.parse('2026-11-18T11:17:35Z');
export const PRACTICE_NEW_UNTIL = PRACTICE_LAUNCHED_AT + 3 * 24 * 60 * 60 * 1000;
export function isPracticeNew(now: number) {
    return now >= PRACTICE_LAUNCHED_AT && now < PRACTICE_NEW_UNTIL;
}

export const PRACTICE_MEDIA = [
    { id: 'landscape', kind: 'image', title: 'Mountain landscape', path: '/practice-media/landscape.svg', alt: 'Mountains beside a lake at sunrise' },
    { id: 'study', kind: 'image', title: 'Study workspace', path: '/practice-media/study.svg', alt: 'A laptop, books and a plant on a desk' },
    { id: 'motion', kind: 'video', title: 'Moving shapes · 6 seconds', path: '/practice-media/shapes.mp4', alt: 'Colourful shapes moving across a blue background' },
] as const;

export function mediaExample(asset: typeof PRACTICE_MEDIA[number], origin: string) {
    const url = new URL(asset.path, origin).href;
    return asset.kind === 'image'
        ? `<img src="${url}" alt="${asset.alt}" width="480">`
        : `<video controls width="480">\n    <source src="${url}" type="video/mp4">\n    Your browser does not support video.\n</video>`;
}
