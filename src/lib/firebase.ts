import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isServer = typeof window === 'undefined';

// Don't initialize full Firebase during static prerendering if keys are missing
// This prevents Next.js builds from failing on Vercel before env vars are added
let app;
let auth: ReturnType<typeof getAuth>;
let db: Firestore;

if (!firebaseConfig.apiKey && isServer) {
  console.warn('Firebase API Key is missing. Skipping full initialization during build.');
  // Mock objects for build time
  app = {} as any;
  auth = {} as any;
  db = {} as any;
} else {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Use memoryLocalCache instead of default IndexedDB persistence to prevent
    // "INTERNAL ASSERTION FAILED: Unexpected state" errors during SPA navigation.
    // Firebase SDK v12.x has a bug where the IndexedDB persistence layer's internal
    // state machine corrupts when onSnapshot listeners are torn down and re-created
    // during Next.js client-side navigation (mount → unmount → remount).
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    });
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export { app, auth, db };
