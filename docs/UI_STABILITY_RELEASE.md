# UI stability follow-up

The contrast branch now also includes these focused fixes:

- Keep HTML task compiler Hooks consistent when navigating between valid and
  missing tasks, retaining the in-memory editor buffer.
- Keep KnoblyAI Hooks consistent across routes and release listeners, observers,
  focus timeouts and nested animation timeouts when hidden or unmounted.
- Use deterministic decorative numbers on the NumPy page for matching initial
  server and browser output.
- Start the home uptime clock at mount and release the weather refresh interval,
  ignoring geolocation callbacks and weather responses after cleanup.
- Refresh and expire app New badges with a client clock, rejecting future dates
  and releasing clock timers on unmount.

Changes are limited to five UI source files. Authentication providers, login
handlers, APIs, Firebase rules, account records, grading, saved-data formats and
backup scripts are unchanged. No data migration is included.

Validation: 23 focused checks pass across task compiler navigation, AI route
visibility and timer cleanup, render stability, badges and contrast. TypeScript
(`--noEmit --incremental false`) and diff whitespace checks pass. The navigation
and lifecycle checks use isolated harnesses with mocked browser APIs, without
connecting to Firebase. Real browser verification and deployment remain pending.
