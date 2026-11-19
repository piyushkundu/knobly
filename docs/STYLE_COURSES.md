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
