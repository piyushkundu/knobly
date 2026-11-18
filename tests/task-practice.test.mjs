import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(file) {
    const exports = {};
    const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, { exports, require, URL, Date });
    return exports;
}
const { closingTagFor, emmetAt, installPracticeEditor } = load('../src/lib/task-practice-editor.ts');
const { isPracticeNew, PRACTICE_LAUNCHED_AT, PRACTICE_NEW_UNTIL, PRACTICE_MEDIA, mediaExample } = load('../src/lib/task-practice.ts');

test('real Emmet expands HTML boilerplate, classes, nesting, repetition, and snippet placeholders', () => {
    for (const abbreviation of ['!', 'html:5']) {
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
    let context = false, value = '!', cursor = { lineNumber: 1, column: 2 }, action, inserted, closing;
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
        addAction(a) { action = a; return { dispose() { disposed.push('action'); } }; },
        trigger() {}, setSelection() {}, getContribution: () => ({ insert(s) { inserted = s; } }),
        executeEdits(source, edits) { closing = edits[0].text; }, setPosition() {},
    };
    const dispose = installPracticeEditor(editor, { Range: range, KeyCode: { Tab: 2 } });
    assert.equal(context, true);
    action.run();
    assert.match(inserted, /<!DOCTYPE html>/);
    value = '<div>'; cursor = { lineNumber: 1, column: 6 };
    listeners.get('type')('>');
    assert.equal(closing, '</div>');
    dispose();
    assert.equal(context, false);
    assert.equal(listeners.size, 0);
    assert.equal(disposed.length, 5);
    dispose(); // cleanup is idempotent after editor disposal
    assert.equal(disposed.length, 5);
});
