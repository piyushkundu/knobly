import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, getFirestore, memoryLocalCache, connectFirestoreEmulator } from 'firebase/firestore';
const existing = getApps().find(app => app.name === 'knobly-isolated-preview');
const app = existing ?? initializeApp({
  apiKey: 'preview-isolation-not-live-firebase', authDomain: 'firebase-preview.invalid',
  projectId: 'demo-knobly-isolated-preview', appId: '1:000000000000:web:0000000000000000000000',
}, 'knobly-isolated-preview');
const auth = getAuth(app);
const db = existing ? getFirestore(app) : initializeFirestore(app, {
  ignoreUndefinedProperties: true, localCache: memoryLocalCache(), experimentalForceLongPolling: true,
});
if (!existing) {
  connectAuthEmulator(auth, 'http://firebase-preview.invalid:9099', {disableWarnings: true});
  connectFirestoreEmulator(db, 'firebase-preview.invalid', 8080);
}
export { app, auth, db };
