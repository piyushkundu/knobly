import type { StyleDraft } from './style-course-types';

export const STYLE_TASK_IDLE_MS = 60 * 60 * 1000;
export const STYLE_TASK_IDLE_CHECK_MS = 30_000;

export function styleTaskDraftExpired(lastActive: number, now: number) {
    return Number.isFinite(lastActive) && now - lastActive >= STYLE_TASK_IDLE_MS;
}

export function openStyleDraft(draft: StyleDraft, lastActive: number | undefined, now: number, task: boolean) {
    // Untimestamped drafts predate expiry. Give them a full first hour rather than
    // deleting a student's existing work during this feature rollout.
    const activity = typeof lastActive==='number' && Number.isFinite(lastActive) && lastActive>0 ? Math.min(lastActive,now) : now;
    const expired = task && styleTaskDraftExpired(activity,now);
    return {draft:expired?{html:'',css:''}:{html:draft.html,css:draft.css},lastActive:activity,expired};
}

export function removeStyleDraft(storage: Pick<Storage,'getItem'|'removeItem'>, key: string, lastActive = Infinity) {
    try {
        const saved=JSON.parse(storage.getItem(key)||'null');
        // A second tab may have more recent work in this same project.
        if(typeof saved?.lastActive==='number'&&saved.lastActive>lastActive)return false;
        storage.removeItem(key);
        return true;
    } catch { return false; }
}
