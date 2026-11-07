# Test-only Preview branch

Do not merge or promote this branch to Production. Firebase Auth/Firestore are directed only to a non-resolving emulator hostname. Firebase Admin and email are disabled. News refresh and paid AI provider credentials are disabled. Analytics is removed and every page displays an isolation notice.

The original security fixes remain uncommitted in the main workspace. This branch exists solely for full-site Preview validation and uses dedicated Preview Redis counters. Existing user records are not accessed.
