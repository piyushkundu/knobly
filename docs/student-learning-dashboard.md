# Student learning dashboard

Daily 10 uses the existing active `exam_tests`, questions and options. It does
not generate new questions or change their IDs. All active test modes are in the
pool, as requested. Only choice questions with exactly one valid answer can be
automatically graded.

Up to four slots prioritise the student's most frequently incorrect answers.
Remaining slots cover different tests and less-seen questions. When there are
ten or fewer eligible active tests, space is reserved for each one. With more
than ten tests, daily selection rotates through the full pool. Selection is
deterministic per student and India date; the saved day's set does not change
when refreshed. If fewer than ten valid questions exist, every available one is
used without duplication.

Completed exam responses are analysed incrementally, only for the authenticated
student and current active question/option IDs. Large histories are fully
processed before the daily set is saved. Historical deleted option IDs are not
misclassified as mistakes.

## Data isolation

- Existing exam collections, profiles, authentication, exam XP and ranks are
  unchanged by daily practice, analysis, bookmarks or goals.
- New private records: `practice_users/{uid}` and its `sessions` subcollection.
- Separate daily league: `practice_weeks/{India Monday}/entries/{uid}`. It counts
  correct answers from one completed Daily 10 per India completion day, once.
- Every API request verifies the Firebase ID token; ownership comes from that
  token, never from a submitted user ID. Answer keys stay server-side until the
  session is completed. Drafts and submissions validate all IDs.
- Firestore rules inspected in Firebase Console before launch: explicit legacy
  collection matches, no broad wildcard. New practice collections are denied
  to direct clients by default. No rule publication or schema migration needed.
- Queries use single-field indexes. The shared active question catalogue is
  cached per India day and active-test signature instead of loading it on
  every dashboard refresh.

## Student flows

The dashboard adds search, subject/status/duration filters, real score trends,
last/best test scores, mistake revision, bookmarks, weak topics, weekly goals,
streaks, a separate weekly league and recent answer reviews. Daily practice
saves drafts and resumes without awarding exam-rank points.

An unfinished standard PRACTICE exam can be resumed only by its owner while its
original deadline remains open. It keeps the same attempt and stored answers;
it does not reset the clock or resume a LIVE exam.

Verification covers selection and history analysis, private answers, invalid
IDs, owner isolation, concurrent submission, idempotent weekly scoring, legacy
record preservation, bookmarks/goals, practice resume and India date rollover.
