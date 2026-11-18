export type TaskEditorMode = 'exam' | 'practice';

// A single launch window for everybody; revisiting does not restart the badge.
export const PRACTICE_LAUNCHED_AT = Date.parse('2026-11-18T11:17:35Z');
export const PRACTICE_NEW_UNTIL = PRACTICE_LAUNCHED_AT + 3 * 24 * 60 * 60 * 1000;
export function isPracticeNew(now: number) {
    return now >= PRACTICE_LAUNCHED_AT && now < PRACTICE_NEW_UNTIL;
}

export const DOWNLOAD_LAUNCHED_AT = Date.parse('2026-11-18T12:36:17Z');
export const DOWNLOAD_NEW_UNTIL = DOWNLOAD_LAUNCHED_AT + 3 * 24 * 60 * 60 * 1000;
export const PREVIEW_TOOLS_LAUNCHED_AT = Date.parse('2026-11-18T15:46:52Z');
export const PREVIEW_TOOLS_NEW_UNTIL = PREVIEW_TOOLS_LAUNCHED_AT + 3 * 24 * 60 * 60 * 1000;
export function isDownloadNew(now: number) {
    return now >= DOWNLOAD_LAUNCHED_AT && now < DOWNLOAD_NEW_UNTIL;
}

export const PRACTICE_HELP_COMMENT = `<!-- Practice mode: VS Code-style editing shortcuts are available here.
     Open Tools > Shortcuts for supported keys. Run preview: Ctrl+Alt+Enter / F5. -->`;

export function withPracticeHelp(code: string) {
    return code.includes('<!-- Practice mode:') ? code : `${PRACTICE_HELP_COMMENT}\n${code}`;
}

export const PRACTICE_HELP_IDLE_MS = 60 * 60 * 1000;
export const PRACTICE_HELP_SESSION_KEY = 'knobly_task_practice_help_session_v1';
interface HelpSession { lastActive: number; offered: boolean }

// Browser-local guidance state only. It never reads or writes account data.
export function createPracticeHelpSession(storage: Pick<Storage, 'getItem' | 'setItem'> | null) {
    let cached: HelpSession | null = null;
    let lastWritten = 0;
    const read = () => {
        try {
            const parsed = JSON.parse(storage?.getItem(PRACTICE_HELP_SESSION_KEY) || 'null');
            if (parsed && Number.isFinite(parsed.lastActive) && typeof parsed.offered === 'boolean'
                && (!cached || parsed.lastActive >= cached.lastActive)) cached = parsed;
        } catch { /* Continue in memory if browser storage is unavailable. */ }
        return cached;
    };
    const write = (session: HelpSession, now: number, force = false) => {
        cached = session;
        if (!force && now - lastWritten < 1000) return;
        try { storage?.setItem(PRACTICE_HELP_SESSION_KEY, JSON.stringify(session)); } catch {}
        lastWritten = now;
    };
    return {
        activity(now: number) {
            const previous = read();
            const idle = !!previous && now - previous.lastActive >= PRACTICE_HELP_IDLE_MS;
            write({ lastActive: now, offered: idle ? false : previous?.offered ?? false }, now, idle);
            return idle;
        },
        offer(now: number) {
            const previous = read();
            if (previous?.offered && now - previous.lastActive < PRACTICE_HELP_IDLE_MS) return false;
            write({ lastActive: now, offered: true }, now, true);
            return true;
        },
    };
}

export function taskDownloadFilename(taskId: string) {
    return `task-${taskId.replace(/[^a-zA-Z0-9_.-]/g, '_')}.html`;
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
