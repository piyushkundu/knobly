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
        const snippet = expand(abbreviation.abbreviation === 'html' ? 'html:5' : abbreviation.abbreviation, {
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

const HTML_TAGS = 'html head title body header nav main section article aside footer h1 h2 h3 p div span a img br hr ul ol li table caption tr th td form label input textarea button select option fieldset legend audio video source iframe details summary'.split(' ');
const HTML_ATTRIBUTES = 'id class style title src href alt width height type name value placeholder required disabled checked controls autoplay loop muted poster target rel rows cols action method'.split(' ');
const BOOLEAN_ATTRIBUTES = new Set('required disabled checked controls autoplay loop muted'.split(' '));

export function practiceSuggestions(model: Monaco.editor.ITextModel, position: Monaco.Position, monaco: typeof Monaco): Monaco.languages.CompletionItem[] {
    const line = model.getLineContent(position.lineNumber);
    const beforeLine = model.getValueInRange(new monaco.Range(1, 1, position.lineNumber, 1));
    const before = beforeLine + line.slice(0, position.column - 1);
    const active = emmetAt(line, position.column, beforeLine);
    const suggestions: Monaco.languages.CompletionItem[] = [];
    if (active) {
        suggestions.push({
            label: `${active.abbreviation} — ${['!', 'html', 'html:5'].includes(active.abbreviation) ? 'HTML5 structure' : 'Emmet expansion'}`,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: active.snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: new monaco.Range(position.lineNumber, active.start + 1, position.lineNumber, active.end + 1),
            filterText: active.abbreviation, sortText: '0', preselect: true,
            detail: 'Practice · Emmet · Press Tab or Enter to insert',
            documentation: { value: '```html\n' + active.snippet.replace(/\$\{\d+:([^}]*)\}/g, '$1') + '\n```' },
        });
    }
    const openTag = /<([a-z][\w:-]*)?$/i.exec(before);
    if (openTag && htmlContext(before.slice(0, openTag.index)).text) {
        const prefix = openTag[1] || '';
        for (const name of HTML_TAGS.filter(tag => tag.startsWith(prefix.toLowerCase()))) {
            suggestions.push({
                label: `${name} — HTML tag`, kind: monaco.languages.CompletionItemKind.Property,
                insertText: VOID_TAGS.has(name) ? `${name}>` : `${name}>\${1}</${name}>`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: new monaco.Range(position.lineNumber, position.column - prefix.length, position.lineNumber, position.column),
                filterText: name, sortText: '1' + name,
            });
        }
    }
    const attribute = /<[a-z][\w:-]*\s+([^<>]*)$/i.exec(before);
    if (attribute && htmlContext(before.slice(0, attribute.index)).text) {
        let quote = '';
        for (const char of attribute[1]) {
            if (quote) { if (char === quote) quote = ''; }
            else if (char === '"' || char === "'") quote = char;
        }
        const word = /(?:^|\s)([a-z-]*)$/i.exec(attribute[1]);
        if (!quote && word) {
            const prefix = word[1];
            for (const name of HTML_ATTRIBUTES.filter(attr => attr.startsWith(prefix.toLowerCase()))) {
                suggestions.push({
                    label: `${name} — HTML attribute`, kind: monaco.languages.CompletionItemKind.Field,
                    insertText: BOOLEAN_ATTRIBUTES.has(name) ? name : `${name}="\${1}"`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: new monaco.Range(position.lineNumber, position.column - prefix.length, position.lineNumber, position.column),
                    filterText: name, sortText: '1' + name,
                });
            }
        }
    }
    return suggestions;
}

export function installPracticeEditor(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    const disposables: Monaco.IDisposable[] = [];
    // The HTML worker does not provide Emmet completions for plain `!` / `html`.
    // Register a model-scoped provider, including basic HTML hints without a worker.
    disposables.push(monaco.languages.registerCompletionItemProvider('html', {
        triggerCharacters: ['!', '<', '.', '>', ':', '*', '#', ' '],
        provideCompletionItems(model, position) {
            if (model !== editor.getModel()) return { suggestions: [] };
            return { suggestions: practiceSuggestions(model, position, monaco) };
        },
    }));
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
        id: 'knobly.practice.structure', label: 'Insert HTML5 structure',
        run: () => {
            const snippet = emmetAt('!', 2)?.snippet;
            if (!snippet) return;
            editor.focus();
            const controller = editor.getContribution('snippetController2') as { insert(template: string): void } | null;
            controller?.insert(snippet);
        },
    }));
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
