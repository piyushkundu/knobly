import expand, { extract } from 'emmet';
import type * as Monaco from 'monaco-editor';

const VOID_TAGS = new Set('area base br col embed hr img input link meta param source track wbr frame'.split(' '));
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);

// Track HTML context so shortcuts never expand inside an attribute, comment,
// script, stylesheet or raw-text element. No student code is executed here.
function htmlContext(source: string) {
    let offset = 0;
    let lastTag: { name: string; closing: boolean; selfClosing: boolean; end: number } | null = null;
    while (offset < source.length) {
        const start = source.indexOf('<', offset);
        if (start < 0) break;
        if (source.startsWith('<!--', start)) {
            const end = source.indexOf('-->', start + 4);
            if (end < 0) return { text: false, lastTag: null };
            offset = end + 3;
            lastTag = null;
            continue;
        }
        const token = /^<(\/?)([a-z][\w:-]*)\b/i.exec(source.slice(start));
        let quote = '', end = start + 1;
        for (; end < source.length; end++) {
            const char = source[end];
            if (quote) { if (char === quote) quote = ''; }
            else if (char === '"' || char === "'") quote = char;
            else if (char === '>') break;
        }
        if (end === source.length) return { text: false, lastTag: null };
        offset = end + 1;
        if (!token) { lastTag = null; continue; }
        lastTag = { name: token[2], closing: !!token[1], selfClosing: /\/\s*>$/.test(source.slice(start, offset)), end: offset };
        if (!lastTag.closing && RAW_TAGS.has(lastTag.name.toLowerCase())) {
            const closing = new RegExp(`</${lastTag.name}\\s*>`, 'ig');
            closing.lastIndex = offset;
            const match = closing.exec(source);
            if (!match) return { text: false, lastTag };
            offset = closing.lastIndex;
            lastTag = null;
        }
    }
    return { text: true, lastTag };
}

export function closingTagFor(before: string, after: string): string | null {
    const { lastTag } = htmlContext(before);
    if (!lastTag || lastTag.end !== before.length || lastTag.closing || lastTag.selfClosing || VOID_TAGS.has(lastTag.name.toLowerCase())) return null;
    if (new RegExp(`^\\s*</${lastTag.name}\\s*>`, 'i').test(after)) return null;
    return `</${lastTag.name}>`;
}

export function emmetAt(line: string, column: number, beforeLine = '') {
    const abbreviation = extract(line, column - 1);
    if (!abbreviation || abbreviation.abbreviation.length > 200) return null;
    if (!htmlContext(beforeLine + line.slice(0, abbreviation.start)).text) return null;
    // Bound multiplication before asking Emmet to generate a tree.
    const repeats = [...abbreviation.abbreviation.matchAll(/\*(\d+)/g)];
    if (repeats.reduce((count, match) => count * Number(match[1]), 1) > 100) return null;
    try {
        const snippet = expand(abbreviation.abbreviation, {
            syntax: 'html', maxRepeat: 100,
            options: {
                'output.indent': '    ',
                'output.field': (index, placeholder) => `\${${index + 1}:${placeholder.replace(/[\\$}]/g, '\\$&')}}`,
            },
        });
        if (!snippet || snippet.length > 20000) return null;
        return { ...abbreviation, snippet };
    } catch { return null; }
}

export function installPracticeEditor(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    const disposables: Monaco.IDisposable[] = [];
    const canExpand = editor.createContextKey<boolean>('knoblyPracticeCanExpand', false);
    const expansion = () => {
        const model = editor.getModel(), position = editor.getPosition(), selections = editor.getSelections();
        if (!model || !position || selections?.length !== 1 || !selections[0].isEmpty()) return null;
        const beforeLine = model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, 1));
        const result = emmetAt(model.getLineContent(position.lineNumber), position.column, beforeLine);
        return result ? { ...result, lineNumber: position.lineNumber } : null;
    };
    const update = () => canExpand.set(!!expansion());
    disposables.push(editor.onDidChangeCursorPosition(update), editor.onDidChangeModelContent(update));
    update();
    disposables.push(editor.addAction({
        id: 'knobly.practice.emmet', label: 'Emmet: Expand Abbreviation',
        keybindings: [monaco.KeyCode.Tab],
        precondition: 'editorTextFocus && !editorReadonly && !inSnippetMode && !editorTabMovesFocus && knoblyPracticeCanExpand',
        run: () => {
            const result = expansion();
            if (!result) return;
            editor.trigger('practice', 'hideSuggestWidget', {});
            editor.setSelection(new monaco.Range(result.lineNumber, result.start + 1, result.lineNumber, result.end + 1));
            // Monaco's snippet contribution retains Tab/Shift+Tab placeholder navigation.
            const controller = editor.getContribution('snippetController2') as { insert(template: string): void } | null;
            if (controller) controller.insert(result.snippet);
        },
    }));
    // Monaco exposes this event on the code editor (also used by its formatter),
    // although its standalone declaration currently omits it.
    const typingEditor = editor as Monaco.editor.IStandaloneCodeEditor & {
        onDidType(listener: (text: string) => void): Monaco.IDisposable;
    };
    disposables.push(typingEditor.onDidType(text => {
        if (text !== '>' || (editor.getSelections()?.length ?? 0) !== 1) return;
        const model = editor.getModel(), position = editor.getPosition();
        if (!model || !position) return;
        const offset = model.getOffsetAt(position), value = model.getValue();
        const closing = closingTagFor(value.slice(0, offset), value.slice(offset));
        if (!closing) return;
        editor.executeEdits('practice.close-tag', [{ range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column), text: closing }]);
        editor.setPosition(position);
    }));
    const dispose = () => {
        canExpand.reset();
        // Leave placeholder navigation behind when returning to the original editor.
        const controller = editor.getContribution('snippetController2') as { cancel?(): void } | null;
        controller?.cancel?.();
        disposables.splice(0).forEach(item => item.dispose());
    };
    disposables.push(editor.onDidDispose(dispose));
    return dispose;
}
