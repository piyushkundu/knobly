import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';

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
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  try {
    // Try to get existing Firestore instance first (important for HMR/dev)
    db = getFirestore(app);
  } catch {
    try {
      db = initializeFirestore(app, { experimentalForceLongPolling: true, ignoreUndefinedProperties: true });
    } catch {
      db = getFirestore(app);
    }
  }
}

export { app, auth, db };
