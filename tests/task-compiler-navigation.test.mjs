import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';

// Stateful render harness: retain hook cells across route/props changes. Effects,
// network and browser integrations are excluded; this is not a visual DOM test.
function compiler() {
    const cells = [], kinds = [];
    const storage = new Map([['knobly_task_code_1', '{"code":"<p>Saved</p>","lastActive":1}']]);
    const beforeStorage = [...storage];
    let cursor = 0, expectedCount;
    function cell(kind, initialize) {
        const index = cursor++;
        if (index in kinds) assert.equal(kinds[index], kind, 'Hook type changed');
        else { kinds[index] = kind; cells[index] = initialize?.(); }
        return index;
    }
    const react = {
        use: value => value,
        useState(initial) {
            const index = cell('state', () => typeof initial === 'function' ? initial() : initial);
            return [cells[index], next => { cells[index] = typeof next === 'function' ? next(cells[index]) : next; }];
        },
        useRef: initial => cells[cell('ref', () => ({current: initial}))],
        useEffect() { cell('effect'); },
        useMemo(calculate) { cell('memo'); return calculate(); },
        useCallback(callback) { cell('callback'); return callback; },
    };
    const Editor = () => null;
    const PracticeTools = () => null;
    const practiceHelpers = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/lib/task-practice.ts', import.meta.url), 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
    }).outputText, {exports: practiceHelpers, Date, URL});
    const deps = {
        react,
        'react/jsx-runtime': jsxRuntime,
        '@monaco-editor/react': {default: Editor},
        '@/components/html/TaskPracticeTools': {default: PracticeTools},
        '@/components/html/TaskCompilerNewBadge': {default: () => null},
        '@/lib/task-practice': practiceHelpers,
        'next/navigation': {useRouter: () => ({push() {}, back() {}})},
        'next/link': {default: () => null},
        'lucide-react': new Proxy({}, {get: () => () => null}),
        '@/lib/preview-sandbox': {PREVIEW_SANDBOX: 'allow-scripts allow-forms allow-popups'},
    };
    const exports = {};
    const compiled = ts.transpileModule(readFileSync(new URL('../src/app/html/tasks/[id]/compiler/page.tsx', import.meta.url), 'utf8'), {
        compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX},
    }).outputText;
    vm.runInNewContext(compiled, {
        exports,
        require(name) { assert.ok(Object.hasOwn(deps, name), name); return deps[name]; },
        localStorage: {
            getItem: key => storage.get(key) ?? null,
            setItem() { throw new Error('Unexpected render-time storage write'); },
            removeItem() { throw new Error('Unexpected render-time storage deletion'); },
        },
        window: {},
        Date: class extends Date {
            static now() { throw new Error('Unexpected render-time clock read'); }
        },
        console,
    });
    return {
        Editor,
        PracticeTools,
        render(id) {
            cursor = 0;
            const tree = exports.default({params: {id}});
            if (expectedCount === undefined) expectedCount = cursor;
            else assert.equal(cursor, expectedCount, 'Route change altered the number of hooks');
            assert.deepEqual([...storage], beforeStorage);
            return tree;
        },
    };
}

function nodes(tree, predicate) {
    if (!tree || typeof tree !== 'object') return [];
    return [
        ...(predicate(tree) ? [tree] : []),
        ...[tree.props?.children].flat(Infinity).flatMap(child => nodes(child, predicate)),
    ];
}
function text(node) {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node !== 'object') return String(node);
    return [node.props?.children].flat(Infinity).map(text).join('');
}

test('retained compiler renders valid → missing → valid routes with stable hooks and editor state', () => {
    const app = compiler();
    const first = app.render('1');
    const editor = nodes(first, node => node.type === app.Editor)[0];
    assert.ok(editor);
    editor.props.onChange('<p>Unsaved student work</p>');
    assert.equal(nodes(app.render('1'), node => node.type === app.Editor)[0].props.value, '<p>Unsaved student work</p>');
    const missing = app.render('missing-task');
    assert.match(text(missing), /Task Not Found/);
    assert.equal(nodes(missing, node => node.type === app.Editor).length, 0);
    assert.equal(nodes(app.render('1'), node => node.type === app.Editor)[0].props.value, '<p>Unsaved student work</p>');
});

test('missing → valid → another valid task keeps hook order and updates topic badges', () => {
    const app = compiler();
    assert.match(text(app.render('missing-task')), /Task Not Found/);
    const first = app.render('1');
    const badges = tree => nodes(tree, node => node.type === 'code').map(text);
    assert.deepEqual(badges(first), ['<p>', '<pre>', '<br>', '<hr>', 'bgcolor=""']);
    const second = app.render('2');
    assert.deepEqual(badges(second), ['<b>', '<i>', '<u>', '<pre>', '<br>', '<center>', '<h1>', '<h2>', '<hr>']);
    assert.match(text(second), /Basic HTML Tags/);
});

test('Exam remains default; switching Practice on and off retains the same unsaved draft and editor', () => {
    const app = compiler();
    let tree = app.render('11');
    const tools = () => nodes(tree, node => node.type === app.PracticeTools)[0];
    const editor = () => nodes(tree, node => node.type === app.Editor)[0];
    assert.equal(tools().props.mode, 'exam');
    assert.equal(editor().props.options.formatOnPaste, false);
    editor().props.onChange('<h1>Keep this draft</h1>');
    tools().props.onModeChange('practice');
    tree = app.render('11');
    assert.equal(tools().props.mode, 'practice');
    assert.equal(editor().props.options.formatOnPaste, true);
    assert.ok(editor().props.value.endsWith('<h1>Keep this draft</h1>'));
    assert.match(editor().props.value, /<!-- Practice mode:/);
    tools().props.onModeChange('practice');
    tree = app.render('11');
    assert.equal((editor().props.value.match(/<!-- Practice mode:/g) || []).length, 1);
    tools().props.onModeChange('exam');
    tree = app.render('11');
    assert.ok(editor().props.value.endsWith('<h1>Keep this draft</h1>'));
    assert.equal(editor().props.options.tabCompletion, 'off');
});

test('Practice insertion updates the controlled draft before Monaco change listeners attach', () => {
    const app = compiler();
    let tree = app.render('11');
    let value = '<p>Existing draft</p>';
    const mountedEditor = {
        getModel: () => ({getValue: () => value}),
        pushUndoStop() {},
        executeEdits(source, edits) { value = edits[0].text + value; },
    };
    nodes(tree, node => node.type === app.Editor)[0].props.onMount(mountedEditor, {});
    tree = app.render('11');
    nodes(tree, node => node.type === app.PracticeTools)[0].props.onModeChange('practice');
    tree = app.render('11');
    const controlledValue = nodes(tree, node => node.type === app.Editor)[0].props.value;
    assert.equal(controlledValue, value);
    assert.ok(controlledValue.startsWith('<!-- Practice mode:'));
    assert.ok(controlledValue.endsWith('<p>Existing draft</p>'));
});
