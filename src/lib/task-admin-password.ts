import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

// Shared with the existing HTML instructor controls; never import into client UI.
const taskPassword = '85338533';
const expected = createHash('sha256').update(taskPassword).digest();

export function isTaskAdminPassword(value: unknown): boolean {
    if (typeof value !== 'string' || value.length > 128) return false;
    return timingSafeEqual(expected, createHash('sha256').update(value.trim()).digest());
}
