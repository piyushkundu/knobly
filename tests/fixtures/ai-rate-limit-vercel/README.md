# Isolated Vercel Redis verification fixture

This is a temporary, deployment-protected **Preview** application. It contains
only dummy endpoints and copies of the real limiter/helper. It does not import
Firebase, application authentication, user records or AI-provider services.
It is not the Knobly website and must not be promoted to Production.

When packaging it for Vercel, copy `src/lib/ai-rate-limit.ts` from the repository
to the same path in this fixture and copy `src/proxy.ts` to `proxy.ts` at its root.
The app directory is at the fixture root, so the proxy must also be at the root.
Deploy the explicit files to the existing `knobly` project with the target omitted
(Preview). Do not upload `.env` files, the rest of the app, or production data.

`GET /api/verify` is a test runner, not a production API. It is guarded by
`VERCEL_ENV === 'preview'` and Vercel Deployment Protection. Each run deliberately
creates a fresh random Redis counter namespace with TTLs; it does not change any
application records. It checks signed cookies, client quotas across independent
limiter instances, concurrent atomic global quotas, Retry-After, a synthetic
store failure, and auth-path bypass. Output contains only statuses and booleans.
The dummy AI POST endpoint returns 400 without making provider calls.

## Verified on 2026-11-07

- Dedicated database: `knobly-ai-limits-preview`, Upstash Free, primary `iad1`.
- Eviction, auto-upgrade and Prod Pack: disabled.
- Connected project: `knobly`, **Preview only**.
- Generated Redis variables: Sensitive; custom prefix `UPSTASH_REDIS`.
- Signing secret: Sensitive, Preview only. No credentials are recorded here.
- Preview counter namespace: `knobly:ai:preview:v1`.
- Deployment: `dpl_2EWWZzSTsEWNW2HzGe3kuWwrNETp` (target Preview).
- Verification: all seven checks passed. Client statuses `200, 200, 429`;
  eight concurrent requests with a global cap of two produced two successes and
  six 429s. Synthetic store failure produced 503.

This verifies the real Redis script and hosting configuration. It does not
activate the limiter on the production website or replace whole-application
release testing. The normal unit suite also tests the proxy matcher; the local
Next smoke test verifies HTTP routing and fail-closed production behavior.
