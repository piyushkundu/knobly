// Prepare an isolated full-site artifact without changing production sources.
import { cp, mkdir, mkdtemp, readFile, writeFile, symlink, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const destination = await mkdtemp(path.join(os.tmpdir(), 'knobly-site-preview-'));
const files = ['src', 'public', 'data/html-tasks-state.json', 'package.json', 'package-lock.json',
  'tsconfig.json', 'postcss.config.mjs', 'eslint.config.mjs', 'vercel.json'];
for (const file of files) {
  await mkdir(path.dirname(path.join(destination, file)), { recursive: true });
  await cp(path.join(workspace, file), path.join(destination, file), { recursive: true });
}
await mkdir(path.join(destination, '.vercel'), { recursive: true });
await cp(path.join(workspace, '.vercel/project.json'), path.join(destination, '.vercel/project.json'));

const disabled = Object.fromEntries([
  'FIREBASE_SERVICE_ACCOUNT_JSON', 'FIREBASE_ADMIN_PROJECT_ID', 'FIREBASE_ADMIN_CLIENT_EMAIL', 'FIREBASE_ADMIN_PRIVATE_KEY',
  'GROQ_API_KEY', 'GROQ_API_KEY_ALT', 'SARVAM_API_KEY', 'SARVAM_API_KEY_ALT', 'GNEWS_API_KEY',
  'ZOHO_SMTP_EMAIL', 'ZOHO_SMTP_PASSWORD',
].map(key => [key, '']));
await writeFile(path.join(destination, 'next.config.ts'), `import type { NextConfig } from 'next';
const config: NextConfig = {
  env: ${JSON.stringify(disabled, null, 2)},
  async headers() { return [{source: '/:path*', headers: [
    {key:'X-Knobly-Preview-Mode',value:'isolated'},
    {key:'X-Robots-Tag',value:'noindex, nofollow'},
  ]}]; },
};
export default config;
`);

// Named emulator-only app: no real Firebase config or credentials are used.
await writeFile(path.join(destination, 'src/lib/firebase.ts'), `import { initializeApp, getApps } from 'firebase/app';
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
`);
await writeFile(path.join(destination, 'src/lib/firebase-admin.ts'), `import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
function unavailable(): never { throw new Error('Firebase Admin is disabled in this isolated Preview.'); }
export function getAdminApp(): App { return unavailable(); }
export function getAdminAuth(): Auth { return unavailable(); }
export function getAdminDb(): Firestore { return unavailable(); }
`);
await writeFile(path.join(destination, 'src/lib/email-service.ts'), `function unavailable(): never { throw new Error('Email is disabled in this isolated Preview.'); }
export async function sendVerificationEmail(..._args: unknown[]): Promise<void> { unavailable(); }
export async function sendPasswordResetMail(..._args: unknown[]): Promise<void> { unavailable(); }
export async function sendPasswordResetMailForKnoblyId(..._args: unknown[]): Promise<void> { unavailable(); }
`);
await writeFile(path.join(destination, 'src/app/api/tech-news/route.ts'), `export function GET() {
  return Response.json({error:'News refresh is disabled in this isolated Preview.'}, {status:503,headers:{'Cache-Control':'no-store'}});
}
`);

const layoutFile = path.join(destination, 'src/app/layout.tsx');
let layout = await readFile(layoutFile, 'utf8');
if (!layout.includes('<ThemeProvider>')) throw new Error('Expected layout insertion point');
layout = layout.replace(/import \{ GoogleAnalytics \} from '@next\/third-parties\/google';\r?\n/, '')
  .replace(/<GoogleAnalytics gaId="[^"]+" \/>/, '')
  .replace('<ThemeProvider>', `<div role="status" style={{background:'#fef3c7',color:'#78350f',padding:'10px',textAlign:'center',fontSize:'14px'}}>Isolated Preview: live login, saved data, email and AI providers are disabled.</div>\n        <ThemeProvider>`)
  .replace(/[ \t]+$/gm, '');
await writeFile(layoutFile, layout);

await writeFile(path.join(destination, '.vercelignore'), [
  'node_modules', '.next', '.env*', 'service-account.json', '*.pem', '*.key',
  'PREVIEW-ARTIFACT.json', 'build.log', 'build-summary.json',
].join('\n'));
await symlink(path.join(workspace, 'node_modules'), path.join(destination, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: workspace, encoding: 'utf8' }).trim();
const manifest = {
  artifact: destination, purpose: 'Isolated full-site Preview validation; DO NOT promote to Production',
  sourceHead: sha, sourceWorkingTree: 'uncommitted security fixes included',
  projectId: 'prj_ID9qeleUjbIeikUuhlqY6zPlbDIW', teamId: 'team_Pz9addfq7FuvISJ6h4HZ2f9h',
  sourceCopies: files, overrides: ['next.config.ts', 'src/lib/firebase.ts', 'src/lib/firebase-admin.ts',
    'src/lib/email-service.ts', 'src/app/api/tech-news/route.ts', 'src/app/layout.tsx'],
};
await writeFile(path.join(destination, 'PREVIEW-ARTIFACT.json'), JSON.stringify(manifest, null, 2));
// Refuse to proceed if credentials or generated output accidentally entered the artifact.
for (const forbidden of ['.env', '.env.local', 'service-account.json', '.git']) {
  let present = false;
  try { await stat(path.join(destination, forbidden)); present = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (present) throw new Error(`Unexpected forbidden artifact path: ${forbidden}`);
}
console.log(JSON.stringify(manifest));
