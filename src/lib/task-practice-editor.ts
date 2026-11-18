import { extract, parseMarkup, stringifyMarkup, resolveConfig, type MarkupNode } from 'emmet';
import type * as Monaco from 'monaco-editor';
import { installPracticeShortcuts } from './task-practice-shortcuts';

const VOID_TAGS = new Set('area base br col embed hr img input link meta param source track wbr frame'.split(' '));
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);
const HTML_TAGS = ('a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr ' +
    // The course also teaches these legacy HTML elements.
    'acronym applet basefont big center dir font frame frameset marquee noframes param strike tt').split(' ');
const HTML_TAG_SET = new Set(HTML_TAGS);
const HTML_ATTRIBUTES = ('accept accept-charset accesskey action align allow allowfullscreen alt as async autocapitalize autocomplete autofocus autoplay background bgcolor border cellpadding cellspacing charset checked cite class color cols colspan content contenteditable controls coords crossorigin data datetime decoding default defer dir disabled download draggable enctype enterkeyhint face fetchpriority for form formaction formenctype formmethod formnovalidate formtarget frameborder headers height hidden high href hreflang http-equiv id inert inputmode integrity is ismap kind label lang list loading loop low max maxlength media method min minlength multiple muted name noresize noshade novalidate open optimum pattern placeholder playsinline popover poster preload readonly referrerpolicy rel required reversed role rows rowspan sandbox scope scrolling selected shape size sizes slot span spellcheck src srcdoc srclang srcset start step style tabindex target title translate type usemap value width wrap xmlns ' +
    'onabort onafterprint onbeforeprint onbeforeunload onblur oncanplay oncanplaythrough onchange onclick oncontextmenu oncopy oncuechange oncut ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended onerror onfocus onhashchange oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart onmousedown onmouseenter onmouseleave onmousemove onmouseout onmouseover onmouseup onmousewheel onoffline ononline onpagehide onpageshow onpaste onpause onplay onplaying onpopstate onprogress onratechange onreset onresize onscroll onsearch onseeked onseeking onselect onstalled onstorage onsubmit onsuspend ontimeupdate ontoggle onunload onvolumechange onwaiting onwheel').split(' ');
const HTML_ATTRIBUTE_SET = new Set(HTML_ATTRIBUTES);

function validHtmlTree(nodes: MarkupNode[]): boolean {
    return nodes.every(node => (!node.name || HTML_TAG_SET.has(node.name.toLowerCase()))
        && (node.attributes || []).every(attr => !!attr.name && (HTML_ATTRIBUTE_SET.has(attr.name.toLowerCase()) || /^(?:data|aria)-[a-z][\w.-]*$/i.test(attr.name)))
        && validHtmlTree(node.children));
}

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
        const config = resolveConfig({
            syntax: 'html', maxRepeat: 100,
            options: {
                'output.indent': '    ',
                'output.field': (index, placeholder) => `\${${index + 1}:${placeholder.replace(/[\\$}]/g, '\\$&')}}`,
            },
        });
        const tree = parseMarkup(abbreviation.abbreviation === 'html' ? 'html:5' : abbreviation.abbreviation, config);
        if (!tree.children.some(node => node.name) || !validHtmlTree(tree.children)) return null;
        const snippet = stringifyMarkup(tree, config);
        if (!snippet || snippet.length > 20000) return null;
        return { ...abbreviation, snippet };
    } catch { return null; }
}

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
    if (!active) {
        const partial = /(?:^|\s)([a-z][a-z0-9]*)$/i.exec(line.slice(0, position.column - 1));
        if (partial && htmlContext(beforeLine + line.slice(0, position.column - 1 - partial[1].length)).text) {
            for (const name of HTML_TAGS.filter(tag => tag.startsWith(partial[1].toLowerCase()))) {
                const expanded = emmetAt(name, name.length + 1);
                if (!expanded) continue;
                suggestions.push({ label: `${name} — HTML tag`, kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: expanded.snippet, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: new monaco.Range(position.lineNumber, position.column - partial[1].length, position.lineNumber, position.column), filterText: name, sortText: '1' + name });
            }
        }
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

export function installPracticeEditor(editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco, actions: { showShortcuts?: () => void; save?: () => void } = {}) {
    const disposables: Monaco.IDisposable[] = [];
    disposables.push(...installPracticeShortcuts(editor, monaco, actions));
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
