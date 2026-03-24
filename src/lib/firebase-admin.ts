import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

function getCredential() {
  // Method 1: Load from service-account.json file (local dev)
  const jsonPath = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(jsonPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return cert(serviceAccount);
  }

  // Method 2: Load from FIREBASE_SERVICE_ACCOUNT_JSON env var (Vercel - base64 encoded)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);
      return cert(serviceAccount);
    } catch {
      // fall through to method 3
    }
  }

  // Method 3: Fallback to individual env vars
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Firebase Admin: No credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_PRIVATE_KEY.');
  }
  return cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  });
}

export function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }
  return initializeApp({ credential: getCredential() });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
