// Isolated Next.js smoke test: no app data, Firebase or real AI/store credentials.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const tempRoot = path.resolve(os.tmpdir());
const fixture = await mkdtemp(path.join(tempRoot, 'knobly-ai-limit-next-'));
const next = path.join(workspace, 'node_modules/next/dist/bin/next');
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
for (const key of Object.keys(env)) {
  if (/^(VERCEL|UPSTASH_|AI_RATE_LIMIT_|AI_LIMIT_|FIREBASE_|NEXT_PUBLIC_FIREBASE|GROQ_|SARVAM_)/.test(key) || key === 'NODE_ENV') delete env[key];
}
let child;
let output = '';
function launch(args, extras = {}) {
  output = '';
  child = spawn(process.execPath, [next, ...args], {
    cwd: fixture, env: { ...env, ...extras }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', bytes => { output = (output + bytes).slice(-12000); });
  child.stderr.on('data', bytes => { output = (output + bytes).slice(-12000); });
  return child;
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const current = child;
  const ended = once(current, 'exit');
  current.kill();
  const timer = setTimeout(() => current.kill('SIGKILL'), 5000);
  try { await ended; } finally { clearTimeout(timer); }
  child = undefined;
}
async function port() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const selected = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return selected;
}
async function ready(base) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Next exited: ${output}`);
    try {
      const response = await fetch(base + '/api/auth/login', { signal: AbortSignal.timeout(3000) });
      if (response.ok) return;
    } catch { /* wait for local fixture compilation */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Next fixture readiness timeout: ${output}`);
}

try {
  await symlink(path.join(workspace, 'node_modules'), path.join(fixture, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ private: true, dependencies: { next: '16.1.6', react: '19.2.3', 'react-dom': '19.2.3' } }));
  await writeFile(path.join(fixture, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2017', lib: ['dom', 'esnext'], module: 'esnext', moduleResolution: 'bundler', esModuleInterop: true, strict: true, skipLibCheck: true, jsx: 'react-jsx', paths: { '@/*': ['./src/*'] } }, include: ['src/**/*.ts', 'src/**/*.tsx'] }));
  for (const source of ['src/proxy.ts', 'src/lib/ai-rate-limit.ts']) {
    await mkdir(path.dirname(path.join(fixture, source)), { recursive: true });
    await writeFile(path.join(fixture, source), await readFile(path.join(workspace, source)));
  }
  await mkdir(path.join(fixture, 'src/app'), { recursive: true });
  await writeFile(path.join(fixture, 'src/app/layout.tsx'), 'export default function Layout({children}: {children: React.ReactNode}) { return <html><body>{children}</body></html>; }');
  await writeFile(path.join(fixture, 'src/app/page.tsx'), 'export default function Page() { return <p>Isolated quota test</p>; }');
  const paths = ['/api/ai-generate', '/api/ai-explain', '/api/ai-explain-web', '/api/c-ai-generate', '/api/c-ai-explain', '/api/ai/chat', '/api/ai/generate-topic', '/api/ai/explain-question', '/api/evaluate-task'];
  for (const route of [...paths, '/api/auth/login', '/api/profiles', '/api/results', '/api/html-tasks']) {
    const directory = path.join(fixture, 'src/app', route);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'route.ts'), "export function GET() { return Response.json({fixture: true}); } export function POST() { return Response.json({fixture: true}, {headers: {'x-fixture-handler': 'called'}}); }");
  }

  console.log('Building isolated Next.js fixture (no production services)...');
  const build = launch(['build', '--webpack'], { NODE_ENV: 'production' });
  const buildTimer = setTimeout(() => build.kill('SIGKILL'), 120000);
  let code;
  try { [code] = await once(build, 'exit'); } finally { clearTimeout(buildTimer); }
  assert.equal(code, 0, output);

  let base = `http://127.0.0.1:${await port()}`;
  launch(['start', '--hostname', '127.0.0.1', '--port', new URL(base).port], { NODE_ENV: 'production' });
  await ready(base);
  for (const route of paths) {
    const response = await fetch(base + route, { method: 'POST' });
    assert.equal(response.status, 503, route);
    assert.equal(response.headers.get('retry-after'), '30');
    assert.equal(response.headers.get('x-fixture-handler'), null);
    assert.ok((await fetch(base + route)).ok, 'GET must bypass quota');
  }
  for (const route of ['/api/auth/login', '/api/profiles', '/api/results', '/api/html-tasks']) {
    assert.ok((await fetch(base + route, { method: 'POST' })).ok, route);
  }
  console.log('Production: nine AI routes fail closed; auth/profile/results/task routes pass.');
  await stop();

  base = `http://127.0.0.1:${await port()}`;
  launch(['dev', '--webpack', '--hostname', '127.0.0.1', '--port', new URL(base).port], { NODE_ENV: 'development', AI_LIMIT_CLIENT_MINUTE: '2' });
  await ready(base);
  const first = await fetch(base + '/api/ai/chat', { method: 'POST' });
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('x-ai-ratelimit-store'), 'development-memory');
  const cookie = first.headers.get('set-cookie').split(';')[0];
  assert.ok((await fetch(base + '/api/c-ai-generate', { method: 'POST', headers: { cookie } })).ok);
  const denied = await fetch(base + '/api/evaluate-task', { method: 'POST', headers: { cookie } });
  assert.equal(denied.status, 429);
  assert.ok(Number(denied.headers.get('retry-after')) > 0);
  assert.equal(denied.headers.get('x-fixture-handler'), null);
  assert.ok((await fetch(base + '/api/ai/chat', { method: 'POST' })).ok, 'new guest on same network');
  console.log('Development: signed cookie, shared endpoint quota, 429 and independent guests verified.');
} catch (error) {
  console.error(output);
  throw error;
} finally {
  await stop();
  // Verify the absolute target is the fixture we created inside the OS temp root.
  const relative = path.relative(tempRoot, path.resolve(fixture));
  if (!relative.startsWith('..') && !path.isAbsolute(relative) && /^knobly-ai-limit-next-[^\\/]+$/.test(relative)) {
    await rm(fixture, { recursive: true, force: true });
  }
}
