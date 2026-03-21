import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let adminApp: App;
let adminAuth: Auth;

function getCredential() {
  // Method 1: Load from service-account.json file (most reliable)
  const jsonPath = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(jsonPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return cert(serviceAccount);
  }

  // Method 2: Fallback to environment variables
  return cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });
}

if (!getApps().length) {
  adminApp = initializeApp({
    credential: getCredential(),
  });
} else {
  adminApp = getApps()[0];
}

adminAuth = getAuth(adminApp);

export { adminAuth };
