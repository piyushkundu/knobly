import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file) {
    const url = new URL(file, import.meta.url);
    const exports = {};
    const code = ts.transpileModule(readFileSync(url, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, { exports, require: name => name.startsWith('.') ? load(new URL(name + '.ts', url)) : require(name), URL, Date });
    return exports;
}
const { closingTagFor, emmetAt, practiceSuggestions, installPracticeEditor } = load('../src/lib/task-practice-editor.ts');
const { isPracticeNew, PRACTICE_LAUNCHED_AT, PRACTICE_NEW_UNTIL, PRACTICE_MEDIA, mediaExample } = load('../src/lib/task-practice.ts');
const { PRACTICE_SHORTCUTS, shortcutBinding, installPracticeShortcuts } = load('../src/lib/task-practice-shortcuts.ts');
const keyEnum = /enum KeyCode\s*\{([\s\S]*?)\n\s*\}/.exec(readFileSync(new URL('../node_modules/monaco-editor/monaco.d.ts', import.meta.url), 'utf8'))[1];
const KeyCode = Object.fromEntries([...keyEnum.matchAll(/(\w+)\s*=\s*(\d+)/g)].map(match => [match[1], Number(match[2])]));
const KeyMod = { CtrlCmd: 2048, Alt: 512, Shift: 1024, chord: (first, second) => first | (second << 16) };

test('real Emmet expands HTML boilerplate, classes, nesting, repetition, and snippet placeholders', () => {
    for (const abbreviation of ['!', 'html', 'html:5']) {
        const result = emmetAt(abbreviation, abbreviation.length + 1);
        assert.match(result.snippet, /<!DOCTYPE html>/);
        assert.match(result.snippet, /<body>/);
        assert.match(result.snippet, /\$\{\d+:/);
    }
    const abbreviation = '    ul.menu>li.item$*3';
    const result = emmetAt(abbreviation, abbreviation.length + 1);
    assert.equal(result.start, 4);
    assert.equal((result.snippet.match(/<li /g) || []).length, 3);
    assert.match(result.snippet, /class="menu"/);
    assert.match(result.snippet, /item3/);
    assert.match(emmetAt('div.card', 9).snippet, /class="card"/);
    assert.equal(emmetAt('   ', 4), null);
    assert.equal(emmetAt('ul>li*99999999', 15), null);
});

test('Emmet avoids attributes, comments, script/style and textarea text', () => {
    for (const prefix of ['<div title="', '<!-- ', '<script>const x = ', '<style>body { ', '<textarea>']) {
        assert.equal(emmetAt('div', 4, prefix), null, prefix);
    }
    assert.ok(emmetAt('div', 4, '<!-- done -->\n<body>'));
});

test('auto-close handles quoted >, nested and custom tags, never void tags, comments or duplicates', () => {
    for (const [before, after, expected] of [
        ['<div>', '', '</div>'], ['<main><section class="card">', '', '</section>'],
        ['<my-card data-label="a > b">', '', '</my-card>'],
        ['<script>', '', '</script>'], ['<style>', '', '</style>'],
        ['<div>', '\n</div>', null], ['</div>', '', null], ['<custom-element />', '', null],
        ['<!-- <div>', '', null], ['<script>const s = "<div>";', '', null],
        ['<textarea><div>', '', null], ['<div title=">', '', null],
        ['<!DOCTYPE html>', '', null],
    ]) assert.equal(closingTagFor(before, after), expected, before);
    for (const tag of ['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'frame', 'track']) {
        assert.equal(closingTagFor(`<${tag}>`, ''), null);
    }
});

test('NEW window expires exactly 72 hours after launch for everyone', () => {
    assert.equal(isPracticeNew(PRACTICE_LAUNCHED_AT - 1), false);
    assert.equal(isPracticeNew(PRACTICE_LAUNCHED_AT), true);
    assert.equal(isPracticeNew(PRACTICE_NEW_UNTIL - 1), true);
    assert.equal(isPracticeNew(PRACTICE_NEW_UNTIL), false);
    assert.equal(PRACTICE_NEW_UNTIL - PRACTICE_LAUNCHED_AT, 72 * 60 * 60 * 1000);
});

test('sample assets exist locally and copied snippets use absolute URLs inside srcDoc', () => {
    for (const media of PRACTICE_MEDIA) {
        assert.ok(existsSync(new URL(`../public${media.path}`, import.meta.url)));
        const snippet = mediaExample(media, 'https://www.knoblyweb.in');
        assert.ok(snippet.includes(`https://www.knoblyweb.in${media.path}`));
        assert.match(snippet, media.kind === 'image' ? /alt=/ : /video controls/);
        assert.doesNotMatch(snippet, /autoplay/);
    }
});

test('practice listeners and Tab action are disposed when returning to Exam; no document replacement', () => {
    const listeners = new Map(), disposed = [];
    let context = false, value = '!', cursor = { lineNumber: 1, column: 2 }, action, inserted, closing, provider, actionsAdded = 0;
    const range = class { constructor(...args) { this.args = args; } };
    const subscribe = name => callback => {
        listeners.set(name, callback);
        return { dispose() { disposed.push(name); listeners.delete(name); } };
    };
    const model = { getValueInRange: () => '', getLineContent: () => value, getOffsetAt: () => value.length, getValue: () => value };
    const editor = {
        createContextKey: () => ({ set(v) { context = v; }, reset() { context = false; } }),
        getModel: () => model, getPosition: () => cursor, getSelections: () => [{ isEmpty: () => true }],
        onDidChangeCursorPosition: subscribe('cursor'), onDidChangeModelContent: subscribe('content'),
        onDidType: subscribe('type'), onDidDispose: subscribe('dispose'),
        addAction(a) { actionsAdded++; action = a; return { dispose() { disposed.push('action'); } }; },
        trigger() {}, setSelection() {}, getContribution: () => ({ insert(s) { inserted = s; } }),
        executeEdits(source, edits) { closing = edits[0].text; }, setPosition() {},
    };
    const monaco = { Range: range, KeyCode, KeyMod, languages: {
        CompletionItemKind: { Snippet: 27, Property: 9, Field: 4 }, CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
        registerCompletionItemProvider(language, p) { assert.equal(language, 'html'); provider = p; return { dispose() { disposed.push('provider'); } }; },
    } };
    const dispose = installPracticeEditor(editor, monaco);
    assert.equal(context, true);
    assert.equal(provider.provideCompletionItems({}, cursor).suggestions.length, 0, 'Other editors must not receive practice suggestions');
    assert.match(provider.provideCompletionItems(model, cursor).suggestions[0].insertText, /<!DOCTYPE html>/);
    action.run();
    assert.match(inserted, /<!DOCTYPE html>/);
    value = '<div>'; cursor = { lineNumber: 1, column: 6 };
    listeners.get('type')('>');
    assert.equal(closing, '</div>');
    dispose();
    assert.equal(context, false);
    assert.equal(listeners.size, 0);
    assert.equal(disposed.length, actionsAdded + 5);
    dispose(); // cleanup is idempotent after editor disposal
    assert.equal(disposed.length, actionsAdded + 5);
});

test('practice supplies genuine Emmet, HTML tag and attribute suggestions without the HTML worker', () => {
    const monaco = { Range: class { constructor(...args) { this.args = args; } }, languages: {
        CompletionItemKind: { Snippet: 27, Property: 9, Field: 4 }, CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
    } };
    const suggestions = (line, beforeLine = '') => practiceSuggestions({ getLineContent: () => line, getValueInRange: () => beforeLine }, { lineNumber: 1, column: line.length + 1 }, monaco);
    for (const text of ['!', 'html']) assert.match(suggestions(text)[0].insertText, /<!DOCTYPE html>/);
    assert.match(suggestions('ul>li*3')[0].insertText, /<li>/);
    assert.ok(suggestions('<sec').some(item => item.label === 'section — HTML tag' && item.insertText.includes('</section>')));
    assert.ok(suggestions('<img s').some(item => item.label === 'src — HTML attribute' && item.insertText === 'src="${1}"'));
    assert.ok(suggestions('<video con').some(item => item.insertText === 'controls'));
    assert.equal(suggestions('div', '<!-- ').length, 0);
    assert.equal(suggestions('div', '<script>const x = ').length, 0);
    assert.equal(suggestions('<img alt="s').length, 0);
    for (const text of ['tig', 'xyz', 'hello', 'asdfgh', 'ul>tig', 'div[unknownattribute]', 'div>hello']) {
        assert.equal(emmetAt(text, text.length + 1), null, text);
        assert.equal(suggestions(text).length, 0, text);
    }
    assert.ok(suggestions('hea').every(item => item.label.includes('head')));
    assert.ok(suggestions('hea').length > 0);
    assert.ok(emmetAt('div[data-item="one"]', 21));
    assert.ok(emmetAt('input:email', 12));
    assert.ok(emmetAt('table>tr>td[colspan=2]', 23));
});

test('Windows editor bindings use real Monaco key codes and route to the documented editing commands', () => {
    const registered = new Map(), executed = [];
    let showed = false, saved = false, wordWrap = 'on';
    const monaco = { KeyCode, KeyMod };
    const editor = { addAction(action) { registered.set(action.id, action); return { dispose() { registered.delete(action.id); } }; }, trigger(source, command) { executed.push(command); }, getRawOptions: () => ({ wordWrap }), updateOptions: options => { wordWrap = options.wordWrap; } };
    const bindings = installPracticeShortcuts(editor, monaco, { showShortcuts: () => { showed = true; }, save: () => { saved = true; } });
    for (const item of PRACTICE_SHORTCUTS) {
        for (const binding of item.bindings || []) {
            for (const stroke of binding.split(' ')) {
                const key = stroke.split('+').at(-1);
                assert.ok(Object.hasOwn(KeyCode, key), `Invalid Monaco key: ${key}`);
            }
            assert.ok(shortcutBinding(binding, monaco));
        }
    }
    for (const command of ['editor.action.insertLineAfter', 'editor.action.insertLineBefore', 'editor.action.copyLinesDownAction', 'editor.action.copyLinesUpAction', 'editor.action.commentLine', 'editor.action.formatDocument']) {
        registered.get(`knobly.binding.${command}`).run();
        assert.equal(executed.at(-1), command);
    }
    assert.equal(registered.get('knobly.binding.editor.action.copyLinesDownAction').keybindings[0], KeyMod.Alt | KeyMod.Shift | KeyCode.DownArrow);
    assert.equal(registered.get('knobly.binding.editor.action.insertLineAfter').keybindings[0], KeyMod.CtrlCmd | KeyCode.Enter);
    registered.get('knobly.binding.knobly.practice.shortcuts').run();
    registered.get('knobly.binding.knobly.practice.save').run();
    assert.equal(showed, true); assert.equal(saved, true);
    registered.get('knobly.binding.editor.action.toggleWordWrap').run();
    assert.equal(wordWrap, 'off');
    registered.get('knobly.binding.editor.action.toggleWordWrap').run();
    assert.equal(wordWrap, 'on');
    bindings.forEach(binding => binding.dispose());
    assert.equal(registered.size, 0);
});
