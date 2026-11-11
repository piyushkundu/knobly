# Text visibility release

This branch starts from `main` (`d5e8211`) and contains the presentation changes
from the local contrast fixes. It improves light and dark foreground/background
pairs, muted labels, placeholders, buttons, settings, task badges, lessons,
dashboard text, saved-code dialogs, and compiler controls.

Legacy light-mode utility overrides are scoped to adaptive panels. Intentional
colored surfaces use `theme-fixed`; neutral modals use `theme-panel`. Form
defaults use the base CSS layer so explicit component colors remain paired.

TypingKeyboard receives an optional theme prop for its legend. Existing callers
remain compatible. Authentication, API handlers, Firebase rules, database
records, task availability, saved-data formats and backup scripts are unchanged.

Validation: 9 contrast regression checks, TypeScript (`--noEmit --incremental
false`), and diff whitespace checks passed. A presentation-stripped syntax-tree
comparison checked the changed TSX files; the optional keyboard theme prop and
embedded CSS/color strings were reviewed separately. This branch has not been
deployed or visually rechecked in this worktree.
