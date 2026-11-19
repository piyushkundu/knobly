# CSS and W3.CSS learning studios

The existing dashboard links continue to use `/web-design/css` and
`/web-design/w3css`. Each now has chapters, notes, quiz, tasks, and a compiler.
There are no Firebase, authentication, API, billing, or existing draft-key changes.

## Import inventory

`STYLE_COURSE_IMPORT.json` records the source file hashes and resulting counts.
All 16 files in the supplied WebDesigning directory were inspected. Twelve
CSS-related teaching, task, note-link and quiz files are archived byte-for-byte
under `public/style-course/originals` as plain text. JavaScript/Angular courses
and navigation-only pages are outside this CSS import. The duplicate wp1/wp2
quiz is imported once. Their original mixed-subject questions remain archived.

The lesson content retains all core source sections, tables, code samples and
duplicate example variations. Navigation and decorative page chrome are replaced.
Missing sample images use the existing local practice assets. Modern clarifications
cover CSS modules, cascade/specificity and W3.CSS panel/button behaviour.

## Visual teaching and coverage

Source classes and inline visual declarations are retained in the native lesson
renderer. Border swatches, display examples, font samples, background pictures,
box-model layers, tables and W3.CSS components appear directly beside their code.
Original scripts are still discarded; known panel/list controls use a bounded
React event handler. Source CSS and the pinned W3.CSS rules are scoped to the
matching lesson container, including responsive selectors and animation names.

Interactive labs cover border style/width/colour/radius, box-model measurements,
Flexbox axes, selector matching, CSS syntax/methods and W3.CSS class changes.
They use temporary component state and never touch saved compiler drafts.

All 45 handwritten CSS PDF pages and 10 W3.CSS PDF pages were visually reviewed.
`scripts/style_note_additions.py` adds the omitted explanations, longhands,
float/clear, font variant, background attachment/repeat and worked layouts.
Invalid notebook declarations are corrected and original archives stay intact.
The notebook's final HTML validation pages link to the existing HTML curriculum.
The page-number mappings stay in the content audit. Handwritten notes are
temporarily locked in the course UI: the notes route shows Coming Soon, the
home module is disabled, and the client course summary supplies no PDF URL.
Original source archives and their historical links are retained unchanged.

## Continuous reading and foundations

Each learning route renders the full course as one continuous document. Scrolling
updates the highlighted sidebar chapter and current URL using native history;
it does not reload the document or mark lessons complete. Direct chapter links,
section anchors, reduced-motion jumps and browser history remain supported.
Chapter content is memoized so changing the active chapter does not rerender all
lesson examples. Example/reference/practice IDs are namespaced per chapter.

The first seven CSS chapters add illustrated explanations and interactive labs:
HTML/CSS roles with a style toggle, six history milestones, shared rules and
responsive wrapping, three insertion methods, a controlled cascade lab, editable
syntax, and 15 selector examples with matched-element highlighting. Hover and
focus are separate states; pseudo-elements have a first-letter demonstration.
Each foundation chapter also has a short knowledge check. Animations respect
reduced-motion preferences. These labs use temporary state only.

`docs/STYLE_LESSON_COVERAGE.json` records the audit: all 41 lesson IDs,
797 original text leaves and 78 original code examples retained, with four
documented factual clarifications. It also maps all 55 PDF pages and checks
70 CSS property names from the handwritten material. Existing tasks, quiz and
student storage keys are unchanged.

W3.CSS 4.15 is hosted locally to match the source course's version 4 examples.
The custom-CSS AI Exploration target is kept unchanged as a reference; the worked
solution demonstrates recreating it using framework classes and a small custom
stylesheet. Source scripts are never executed during import.

## Content structure

- `scripts/import-style-courses.py`: deterministic source import, requires Python
  and beautifulsoup4 only for regeneration.
- `src/data/style-courses.generated.json`: generated course content and task data.
- `src/lib/style-course-demo.ts`: runnable lesson examples and preview composition.
- `src/components/style-course`: shared UI, isolated editor and revision quiz.
- `public/style-course/reference`: sandboxed visual lesson references.

Regenerate with `python scripts/import-style-courses.py --source <WebDesigning>`.
Then run `node scripts/scope-style-lessons.mjs` and
`python scripts/audit-style-lessons.py` (requires the recorded baseline commit).
Do not add unrelated files to the public archive.

## Student state

Course completion uses `knobly_style_progress_v1:<course>`.
Compiler drafts use `knobly_style_draft_v1:<course>:<task-or-lesson>` and contain
only HTML/CSS. HTML compiler drafts, login sessions and account data are not read
or written. Quiz answers exist only in component state. Draft restore is validated
and cannot inject content into the parent page.

Student previews and task/lesson reference frames run with an opaque origin.
Scripts are permitted for demonstration, while same-origin, top-navigation and
popup permissions are withheld. Download creates an HTML file only on user action.

## Technical references

- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity
- https://www.w3schools.com/w3css/w3css_panels.asp
- https://www.w3schools.com/w3css/w3css_downloads.asp
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position
- https://www.w3.org/TR/CSS21/box.html#border-width-properties
- https://www.w3schools.com/W3CSS/w3css_borders.asp
