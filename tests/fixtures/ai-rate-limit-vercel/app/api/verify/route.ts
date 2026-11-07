import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { AI_CLIENT_COOKIE, createAIRateLimiter } from '@/lib/ai-rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Temporary, deployment-protected Preview fixture. No Firebase or AI SDK is
// imported. Each run writes only fresh, expiring Redis verification counters.
export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') return NextResponse.json({ error: 'Preview only' }, { status: 503 });
  const prefix = `${process.env.AI_RATE_LIMIT_PREFIX ?? 'knobly:ai:preview:v1'}:verify:${randomBytes(8).toString('hex')}`;
  const env = {
    ...process.env,
    AI_RATE_LIMIT_PREFIX: prefix,
    AI_LIMIT_CLIENT_MINUTE: '2', AI_LIMIT_CLIENT_HOUR: '100',
    AI_LIMIT_IP_MINUTE: '100', AI_LIMIT_IP_HOUR: '100',
    AI_LIMIT_GLOBAL_MINUTE: '100', AI_LIMIT_GLOBAL_DAY: '100',
  };
  const request = (cookie?: string, ip = '203.0.113.1') => new NextRequest('https://verification.invalid/api/ai/chat', {
    method: 'POST', headers: { 'x-vercel-forwarded-for': ip, ...(cookie ? { cookie: `${AI_CLIENT_COOKIE}=${cookie}` } : {}) },
  });
  const firstInstance = createAIRateLimiter({ env });
  const secondInstance = createAIRateLimiter({ env });
  const first = await firstInstance(request());
  const cookie = first.cookies.get(AI_CLIENT_COOKIE)?.value;
  const second = await secondInstance(request(cookie));
  const third = await firstInstance(request(cookie));

  const concurrentEnv = { ...env, AI_RATE_LIMIT_PREFIX: prefix + ':concurrent', AI_LIMIT_GLOBAL_MINUTE: '2' };
  const instances = [createAIRateLimiter({ env: concurrentEnv }), createAIRateLimiter({ env: concurrentEnv })];
  const concurrent = await Promise.all(Array.from({ length: 8 }, (_, i) => instances[i % 2](request(undefined, `203.0.113.${i + 2}`))));
  const outage = await createAIRateLimiter({ env, fetch: async () => { throw new Error('Synthetic store outage'); } })(request(cookie));
  const bypass = await firstInstance(new NextRequest('https://verification.invalid/api/auth/login', { method: 'POST' }));
  const checks = {
    redisAccepted: first.status === 200 && first.headers.get('x-middleware-next') === '1',
    signedCookieIssued: Boolean(cookie),
    sharedClientQuota: second.status === 200 && third.status === 429,
    retryAfter: Number(third.headers.get('retry-after')) > 0,
    atomicGlobalQuota: concurrent.filter(result => result.status === 200).length === 2 && concurrent.filter(result => result.status === 429).length === 6,
    storeOutageFailsClosed: outage.status === 503,
    authPathPasses: bypass.headers.get('x-middleware-next') === '1',
  };
  return NextResponse.json({ verificationOnly: true, passed: Object.values(checks).every(Boolean), checks,
    clientStatuses: [first.status, second.status, third.status], concurrentStatuses: concurrent.map(result => result.status),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
