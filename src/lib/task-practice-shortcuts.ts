import type * as Monaco from 'monaco-editor';

// Windows editor bindings checked against Microsoft's shortcut reference:
// https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf
// Workbench/terminal/debugger commands need the corresponding desktop features.
type Shortcut = { keys: string; label: string; group: string; command?: string; bindings?: string[] };
export const PRACTICE_SHORTCUTS: Shortcut[] = [
    { keys: '! / html / html:5 → Tab', label: 'Create HTML structure', group: 'HTML' },
    { keys: 'ul>li*3 / div.card → Tab', label: 'Expand valid HTML Emmet patterns', group: 'HTML' },
    { keys: 'Tab / Shift+Tab', label: 'Next / previous snippet field; indent / outdent', group: 'Editing' },
    { keys: 'Ctrl+Enter', label: 'Insert line below', group: 'Editing', command: 'editor.action.insertLineAfter', bindings: ['Ctrl+Enter'] },
    { keys: 'Ctrl+Shift+Enter', label: 'Insert line above', group: 'Editing', command: 'editor.action.insertLineBefore', bindings: ['Ctrl+Shift+Enter'] },
    { keys: 'Alt+↓', label: 'Move line down', group: 'Editing', command: 'editor.action.moveLinesDownAction', bindings: ['Alt+DownArrow'] },
    { keys: 'Alt+↑', label: 'Move line up', group: 'Editing', command: 'editor.action.moveLinesUpAction', bindings: ['Alt+UpArrow'] },
    { keys: 'Alt+Shift+↓', label: 'Duplicate line down', group: 'Editing', command: 'editor.action.copyLinesDownAction', bindings: ['Alt+Shift+DownArrow'] },
    { keys: 'Alt+Shift+↑', label: 'Duplicate line up', group: 'Editing', command: 'editor.action.copyLinesUpAction', bindings: ['Alt+Shift+UpArrow'] },
    { keys: 'Ctrl+Shift+K', label: 'Delete line', group: 'Editing', command: 'editor.action.deleteLines', bindings: ['Ctrl+Shift+KeyK'] },
    { keys: 'Ctrl+Z', label: 'Undo', group: 'Editing', command: 'undo', bindings: ['Ctrl+KeyZ'] },
    { keys: 'Ctrl+Y / Ctrl+Shift+Z', label: 'Redo', group: 'Editing', command: 'redo', bindings: ['Ctrl+KeyY', 'Ctrl+Shift+KeyZ'] },
    { keys: 'Ctrl+C / Ctrl+X / Ctrl+V', label: 'Copy / cut / paste (also whole line without selection)', group: 'Editing' },
    { keys: 'Ctrl+] / Ctrl+[', label: 'Indent / outdent', group: 'Editing' },
    { keys: 'Ctrl+/', label: 'Toggle line comment', group: 'Editing', command: 'editor.action.commentLine', bindings: ['Ctrl+Slash'] },
    { keys: 'Alt+Shift+A', label: 'Toggle block comment', group: 'Editing', command: 'editor.action.blockComment', bindings: ['Alt+Shift+KeyA'] },
    { keys: 'Ctrl+K Ctrl+C', label: 'Add line comment', group: 'Editing', command: 'editor.action.addCommentLine', bindings: ['Ctrl+KeyK Ctrl+KeyC'] },
    { keys: 'Ctrl+K Ctrl+U', label: 'Remove line comment', group: 'Editing', command: 'editor.action.removeCommentLine', bindings: ['Ctrl+KeyK Ctrl+KeyU'] },
    { keys: 'Alt+Shift+F', label: 'Format HTML document', group: 'Editing', command: 'editor.action.formatDocument', bindings: ['Alt+Shift+KeyF'] },
    { keys: 'Ctrl+K Ctrl+F', label: 'Format selection', group: 'Editing', command: 'editor.action.formatSelection', bindings: ['Ctrl+KeyK Ctrl+KeyF'] },
    { keys: 'Ctrl+K Ctrl+X', label: 'Remove trailing spaces', group: 'Editing', command: 'editor.action.trimTrailingWhitespace', bindings: ['Ctrl+KeyK Ctrl+KeyX'] },
    { keys: 'Alt+Z', label: 'Toggle word wrap', group: 'View', command: 'editor.action.toggleWordWrap', bindings: ['Alt+KeyZ'] },
    { keys: 'Ctrl+F', label: 'Find', group: 'Search', command: 'actions.find', bindings: ['Ctrl+KeyF'] },
    { keys: 'Ctrl+H', label: 'Replace', group: 'Search', command: 'editor.action.startFindReplaceAction', bindings: ['Ctrl+KeyH'] },
    { keys: 'F3 / Shift+F3', label: 'Next / previous search match', group: 'Search' },
    { keys: 'Alt+Enter (in Find)', label: 'Select all search matches', group: 'Search' },
    { keys: 'Alt+C / Alt+R / Alt+W (in Find)', label: 'Match case / regular expression / whole word', group: 'Search' },
    { keys: 'Ctrl+D', label: 'Add next matching selection', group: 'Selection', command: 'editor.action.addSelectionToNextFindMatch', bindings: ['Ctrl+KeyD'] },
    { keys: 'Ctrl+K Ctrl+D', label: 'Skip to next matching selection', group: 'Selection', command: 'editor.action.moveSelectionToNextFindMatch', bindings: ['Ctrl+KeyK Ctrl+KeyD'] },
    { keys: 'Ctrl+Shift+L / Ctrl+F2', label: 'Select every occurrence', group: 'Selection', command: 'editor.action.selectHighlights', bindings: ['Ctrl+Shift+KeyL', 'Ctrl+F2'] },
    { keys: 'Ctrl+L', label: 'Select current line', group: 'Selection', command: 'expandLineSelection', bindings: ['Ctrl+KeyL'] },
    { keys: 'Ctrl+A', label: 'Select all code', group: 'Selection' },
    { keys: 'Alt+Click', label: 'Add a cursor', group: 'Selection' },
    { keys: 'Ctrl+Alt+↓', label: 'Add cursor below', group: 'Selection', command: 'editor.action.insertCursorBelow', bindings: ['Ctrl+Alt+DownArrow'] },
    { keys: 'Ctrl+Alt+↑', label: 'Add cursor above', group: 'Selection', command: 'editor.action.insertCursorAbove', bindings: ['Ctrl+Alt+UpArrow'] },
    { keys: 'Ctrl+U', label: 'Undo cursor movement', group: 'Selection', command: 'cursorUndo', bindings: ['Ctrl+KeyU'] },
    { keys: 'Alt+Shift+I', label: 'Add cursor at each selected line end', group: 'Selection', command: 'editor.action.insertCursorAtEndOfEachLineSelected', bindings: ['Alt+Shift+KeyI'] },
    { keys: 'Alt+Shift+→', label: 'Expand selection', group: 'Selection', command: 'editor.action.smartSelect.expand', bindings: ['Alt+Shift+RightArrow'] },
    { keys: 'Alt+Shift+←', label: 'Shrink selection', group: 'Selection', command: 'editor.action.smartSelect.shrink', bindings: ['Alt+Shift+LeftArrow'] },
    { keys: 'Alt+Shift+drag / Ctrl+Alt+Shift+arrows', label: 'Column / box selection', group: 'Selection' },
    { keys: 'Home / End', label: 'Start / end of line', group: 'Navigation' },
    { keys: 'Ctrl+Home / Ctrl+End', label: 'Start / end of document', group: 'Navigation' },
    { keys: 'Ctrl+← / Ctrl+→', label: 'Move one word', group: 'Navigation' },
    { keys: 'Shift+arrows / Ctrl+Shift+arrows', label: 'Select characters / words', group: 'Selection' },
    { keys: 'Ctrl+↑ / Ctrl+↓', label: 'Scroll one line', group: 'Navigation' },
    { keys: 'Alt+PageUp / Alt+PageDown', label: 'Scroll one page', group: 'Navigation' },
    { keys: 'Ctrl+G', label: 'Go to line / column', group: 'Navigation', command: 'editor.action.gotoLine', bindings: ['Ctrl+KeyG'] },
    { keys: 'Ctrl+Shift+\\', label: 'Jump to matching bracket', group: 'Navigation', command: 'editor.action.jumpToBracket', bindings: ['Ctrl+Shift+Backslash'] },
    { keys: 'Ctrl+Shift+[', label: 'Fold current region', group: 'Folding', command: 'editor.fold', bindings: ['Ctrl+Shift+BracketLeft'] },
    { keys: 'Ctrl+Shift+]', label: 'Unfold current region', group: 'Folding', command: 'editor.unfold', bindings: ['Ctrl+Shift+BracketRight'] },
    { keys: 'Ctrl+K Ctrl+[', label: 'Fold nested regions', group: 'Folding', command: 'editor.foldRecursively', bindings: ['Ctrl+KeyK Ctrl+BracketLeft'] },
    { keys: 'Ctrl+K Ctrl+]', label: 'Unfold nested regions', group: 'Folding', command: 'editor.unfoldRecursively', bindings: ['Ctrl+KeyK Ctrl+BracketRight'] },
    { keys: 'Ctrl+K Ctrl+0', label: 'Fold all regions', group: 'Folding', command: 'editor.foldAll', bindings: ['Ctrl+KeyK Ctrl+Digit0'] },
    { keys: 'Ctrl+K Ctrl+J', label: 'Unfold all regions', group: 'Folding', command: 'editor.unfoldAll', bindings: ['Ctrl+KeyK Ctrl+KeyJ'] },
    { keys: 'Ctrl+Space', label: 'Show HTML suggestions', group: 'HTML', command: 'editor.action.triggerSuggest', bindings: ['Ctrl+Space'] },
    { keys: 'Ctrl+K Ctrl+I', label: 'Show hover help', group: 'HTML', command: 'editor.action.showHover', bindings: ['Ctrl+KeyK Ctrl+KeyI'] },
    { keys: 'F1 / Ctrl+Shift+P', label: 'Open editor command palette', group: 'View', command: 'editor.action.quickCommand', bindings: ['F1', 'Ctrl+Shift+KeyP'] },
    { keys: 'Ctrl+M', label: 'Toggle Tab key moving focus', group: 'View', command: 'editor.action.toggleTabFocusMode', bindings: ['Ctrl+KeyM'] },
    { keys: 'Ctrl+K Ctrl+S', label: 'Show these keyboard shortcuts', group: 'View', command: 'knobly.practice.shortcuts', bindings: ['Ctrl+KeyK Ctrl+KeyS'] },
    { keys: 'Ctrl+S', label: 'Save current task draft', group: 'Task', command: 'knobly.practice.save', bindings: ['Ctrl+KeyS'] },
    { keys: 'Ctrl+Alt+Enter / F5', label: 'Run task preview', group: 'Task' },
    { keys: 'Ctrl++ / Ctrl+- / Ctrl+0', label: 'Increase / decrease / reset code font size', group: 'View' },
    { keys: 'Escape', label: 'Close suggestions, find, snippet fields or command palette', group: 'View' },
];

export function shortcutBinding(binding: string, monaco: typeof Monaco): number {
    const strokes = binding.split(' ').map(stroke => stroke.split('+').reduce((value, key) => {
        if (key === 'Ctrl') return value | monaco.KeyMod.CtrlCmd;
        if (key === 'Alt') return value | monaco.KeyMod.Alt;
        if (key === 'Shift') return value | monaco.KeyMod.Shift;
        return value | monaco.KeyCode[key as keyof typeof Monaco.KeyCode];
    }, 0));
    return strokes.length === 2 ? monaco.KeyMod.chord(strokes[0], strokes[1]) : strokes[0];
}

export function installPracticeShortcuts(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco, actions: { showShortcuts?: () => void; save?: () => void }) {
    return PRACTICE_SHORTCUTS.filter(shortcut => shortcut.command && shortcut.bindings).map(shortcut => editor.addAction({
        id: `knobly.binding.${shortcut.command}`, label: shortcut.label,
        keybindings: shortcut.bindings!.map(binding => shortcutBinding(binding, monaco)),
        precondition: 'editorTextFocus',
        run: () => {
            if (shortcut.command === 'knobly.practice.shortcuts') { actions.showShortcuts?.(); return; }
            if (shortcut.command === 'knobly.practice.save') { actions.save?.(); return; }
            if (shortcut.command === 'editor.action.toggleWordWrap') {
                editor.updateOptions({ wordWrap: editor.getRawOptions().wordWrap === 'off' ? 'on' : 'off' });
                return;
            }
            // Monaco actions and cursor commands both run through this public entry point.
            editor.trigger('practice.shortcut', shortcut.command!, {});
        },
    }));
}
