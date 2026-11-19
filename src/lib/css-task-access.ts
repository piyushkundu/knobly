import 'server-only';
import { getAdminDb } from '@/lib/firebase-admin';
import { getStyleCourse } from '@/lib/style-courses';

export const CSS_TASK_IDS = getStyleCourse('css').tasks.map(task => task.id);
const allowed = new Set(CSS_TASK_IDS);
export function validCssTaskIds(value: unknown): string[] {
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && allowed.has(id)))] : [];
}

export async function getUnlockedCssTasks(): Promise<string[]> {
    const snapshot = await getAdminDb().collection('app_settings').doc('css_tasks').get();
    return snapshot.exists ? validCssTaskIds(snapshot.data()?.unlockedTasks) : [];
}

export async function updateCssTaskAccess(taskId: string, action: 'lock' | 'unlock'): Promise<string[]> {
    const db = getAdminDb();
    const reference = db.collection('app_settings').doc('css_tasks');
    return db.runTransaction(async transaction => {
        const snapshot = await transaction.get(reference);
        const current = validCssTaskIds(snapshot.data()?.unlockedTasks);
        const unlockedTasks = taskId === 'all'
            ? action === 'unlock' ? [...CSS_TASK_IDS] : []
            : action === 'lock' ? current.filter(id => id !== taskId) : validCssTaskIds([...current, taskId]);
        transaction.set(reference, { unlockedTasks, updatedAt: new Date().toISOString() }, { merge: true });
        return unlockedTasks;
    });
}
