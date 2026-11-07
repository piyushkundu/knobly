import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
function unavailable(): never { throw new Error('Firebase Admin is disabled in this isolated Preview.'); }
export function getAdminApp(): App { return unavailable(); }
export function getAdminAuth(): Auth { return unavailable(); }
export function getAdminDb(): Firestore { return unavailable(); }
