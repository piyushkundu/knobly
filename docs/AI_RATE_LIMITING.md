# Public AI rate limits

The Next.js proxy checks all nine public AI POST endpoints before their route
handlers run. It does not import Firebase, read user records, change authentication,
or write profiles, progress, results or saved code. Counters live in a separate
Redis database. Requests are counted as attempts, including invalid requests and
provider failures; retries and provider fallbacks within one request count once.

## Before deploying

**Production AI requests return 503 until the store and secret are configured.**
The local memory fallback is development-only. A configured Redis outage also
returns 503; it never falls back to per-instance memory in a hosted environment.
Login and non-AI endpoints do not use this limiter. No deployment or production
configuration is performed by adding these files.

1. Provision a **dedicated** Upstash Redis database for rate counters. Review the
   provider's current pricing and set its budget/usage alerts. Use a database
   supporting atomic EVAL, GET, PTTL, SET PX and INCR. Do not point this at a store
   containing existing application data.
2. Set these server-only variables in Vercel's environment settings. Never use a
   `NEXT_PUBLIC_` prefix or commit real values:

   ```dotenv
   UPSTASH_REDIS_REST_URL=https://YOUR-DATABASE.upstash.io
   UPSTASH_REDIS_REST_TOKEN=YOUR_WRITE_TOKEN
   AI_RATE_LIMIT_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_BYTES
   AI_RATE_LIMIT_PREFIX=knobly:ai:production:v1
   ```

   Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
   Keep it stable across instances/deployments. A rotation invalidates guest quota
   cookies and resets their hashed counter identities; it does not affect login.

   For the Vercel Marketplace integration, choose custom prefix `UPSTASH_REDIS`
   and keep **Sensitive** enabled. The limiter also accepts the generated pair
   `UPSTASH_REDIS_KV_REST_API_URL` / `UPSTASH_REDIS_KV_REST_API_TOKEN`; no copying
   or revealing those values is required. The explicit REST URL/token pair above
   takes precedence if either is set, and a partial pair fails closed. Other
   generated Redis connection/read-only-token variables are not used by the limiter.
3. Use a separate database, secret and prefix for Preview and Production. Configure
   all variables **before** deploying. Restart local development after env changes.
4. Verify in Preview with small limits: repeated requests must produce 429 and a
   positive `Retry-After`; a different guest should still work until the network
   or global cap is hit. Test a store outage returns 503 before any AI-provider
   request. Restore intended limits before deploying to Production.

On Vercel the limiter trusts only the platform-owned `x-vercel-forwarded-for`
header, which must contain one valid IP address. For other production hosts, set
`AI_RATE_LIMIT_TRUSTED_IP_HEADER` to a header your reverse proxy **always
overwrites** with the real client IP, and block direct access around that proxy.
Missing/invalid trusted IP returns 503. Caller-provided `x-forwarded-for` is not
used by default. IPv6 addresses share counters by /64; IPv4-mapped IPv6 addresses
use the corresponding IPv4 counter.

## Default quotas (shared across all nine endpoints)

| Scope | Environment variable | Default |
| --- | --- | ---: |
| Browser / 60 seconds | `AI_LIMIT_CLIENT_MINUTE` | 12 |
| Browser / hour | `AI_LIMIT_CLIENT_HOUR` | 120 |
| Network / 60 seconds | `AI_LIMIT_IP_MINUTE` | 240 |
| Network / hour | `AI_LIMIT_IP_HOUR` | 2400 |
| Whole deployment / 60 seconds | `AI_LIMIT_GLOBAL_MINUTE` | 300 |
| Whole deployment / day | `AI_LIMIT_GLOBAL_DAY` | 3000 |

Values must be positive whole numbers up to 1,000,000. These are starting defaults,
not measured capacity or a monetary spending guarantee: requests can use different
numbers of tokens/provider calls. Tune them using real traffic and provider usage.
Higher network limits allow multiple students on the same Wi-Fi. Each fixed
window starts with its first accepted request, with expiry controlled by Redis.
One atomic Lua script checks every window, then increments all six counters only
if none is exhausted. Denied requests do not increment or extend the windows.

Anonymous guests remain supported. The browser gets a separate signed, HttpOnly,
SameSite=Lax cookie with a 24-hour lifetime (Secure on hosted environments). It
contains only a random quota ID, expiry and signature. It is not a login token.
Deleting cookies creates a new browser identity; network and global caps still
apply. This is abuse mitigation, not proof of a person's identity.

Redis receives only HMAC-hashed browser/network identifiers, aggregate counters
and TTLs. No raw IP, Firebase UID, email, prompt, code or AI answer is sent. Redis
keys share one cluster hash slot for atomicity. Credential/configuration errors,
malformed/oversized responses and a two-second store deadline return a generic
503 with `Retry-After: 30`. No raw store responses or credentials are logged.

Local development without Redis uses in-memory counters, emits a warning and
adds `X-AI-RateLimit-Store: development-memory`. These counters reset on process
restart and are not shared across processes. Configured Redis failures still
return 503 locally so an outage cannot silently disable protection.

## Checks and rollback

Run `npm run test:ai-rate-limit`, `npm run test:ai-rate-limit:next` and
`npx tsc --noEmit --incremental false`. The Next smoke test builds and runs a
temporary fixture containing the actual proxy/helper and dummy route handlers.
Tests use mocked stores and requests, with no production connections or paid AI
calls. Verify real Redis/hosting behavior in an isolated Preview before release.
The isolated Vercel fixture and recorded Preview verification are documented in
[`tests/fixtures/ai-rate-limit-vercel/README.md`](../tests/fixtures/ai-rate-limit-vercel/README.md).
That test deployment is a verification fixture and must not be promoted to the
production website.

To roll back this feature, revert the rate-limit commit (proxy, helper, tests,
documentation and script) and redeploy the previously verified version. Existing
application data needs no migration or restoration. Redis keys expire naturally
within a day; never flush a shared database. Rolling back also removes AI abuse
protection, so review provider usage while it is disabled.

References: [Next.js proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy),
[Vercel request headers](https://vercel.com/docs/headers/request-headers),
[Upstash REST commands](https://upstash.com/docs/redis/features/restapi),
[Redis EVAL](https://redis.io/docs/latest/commands/eval/).
