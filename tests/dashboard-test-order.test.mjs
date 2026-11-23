import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { htmlExam, examImportText } from '../content/exams/html-olevel-test-1.mjs';

const source = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
function load(file, deps = {}, globals = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source(file), {compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
    }}).outputText, {exports, Date, Intl, require(name) {assert.ok(name in deps, name); return deps[name];}, ...globals});
    return exports;
}
const order = load('src/lib/dashboard-test-order.ts');
const highlights = load('src/lib/dashboard-highlights.ts');
const formatted = load('src/lib/formatted-question-import.ts');
const day = order.NEW_TEST_WINDOW_MS;
const epoch = Date.parse('2026-11-23T12:00:00Z');
const entry = (id, title, extra = {}) => ({id, title, category: 'IT TOOLS', ...extra});

test('chapter serial order is natural, stable and immutable, with model papers after chapters', () => {
    const input = [entry('model', 'IT TOOLS MODEL PAPER 1 TEST'), entry('10', 'IT TOOLS CHAPTER 10 TEST'), entry('6', 'IT TOOLS CHAPTER 6 TEST'), entry('2', 'IT TOOLS CHAPTER 2 TEST'), entry('1', 'IT TOOLS CHAPTER 1 TEST'), entry('3', 'IT TOOLS CHAPTER 3 TEST')];
    const before = JSON.stringify(input);
    assert.deepEqual([...order.sortDashboardTests(input, epoch)].map(t => t.id), ['1', '2', '3', '6', '10', 'model']);
    assert.equal(JSON.stringify(input), before);
    const grouped = order.sortDashboardTests([...input, entry('ccc', 'CCC TEST 1', {category: 'CCC'})], epoch);
    assert.equal(grouped[0].id, 'ccc');
});

test('new tests stay first for exactly 24 hours, then return to their serial position', () => {
    const newest = entry('10', 'IT TOOLS CHAPTER 10 TEST', {created_at: {seconds: epoch / 1000}});
    const older = entry('6', 'IT TOOLS CHAPTER 6 TEST', {created_at: new Date(epoch - 1000)});
    const items = [entry('1', 'IT TOOLS CHAPTER 1 TEST'), older, newest];
    assert.deepEqual([...order.sortDashboardTests(items, epoch)].map(t => t.id), ['10', '6', '1']);
    assert.equal(order.isNewDashboardTest(newest, epoch + day - 1), true);
    assert.equal(order.isNewDashboardTest(newest, epoch + day), false);
    assert.deepEqual([...order.sortDashboardTests(items, epoch + day)].map(t => t.id), ['1', '6', '10']);
    for (const created_at of [undefined, 'bad date', NaN, {toMillis() {throw Error('unresolved');}}, epoch + 1]) {
        assert.equal(order.isNewDashboardTest(entry('x', 'Test', {created_at}), epoch), false);
    }
    for (const created_at of [epoch, new Date(epoch), new Date(epoch).toISOString(), {toMillis: () => epoch}, {seconds: epoch / 1000}, {_seconds: epoch / 1000}]) {
        assert.equal(order.testCreatedMillis(entry('x', 'Test', {created_at})), epoch);
    }
});

function walk(node, predicate) {
    if (Array.isArray(node)) return node.flatMap(child => walk(child, predicate));
    if (!React.isValidElement(node)) return [];
    return [...(predicate(node) ? [node] : []), ...walk(node.props.children, predicate)];
}
const text = node => Array.isArray(node) ? node.map(text).join('') : React.isValidElement(node) ? text(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : '';
test('cards filter categories, retain locks and attempts, show 80Q/160pts, and expire without a reload', () => {
    let now = epoch, state, effect;
    const timers = new Map(), listeners = new Map();
    const globals = {Date: class extends Date {static now() {return now;}}, setTimeout(fn, delay) {const id = Symbol(); timers.set(id, {fn, delay}); return id;}, clearTimeout(id) {timers.delete(id);}, window: {location: {href: ''}, addEventListener(name, fn) {listeners.set(name, fn);}, removeEventListener(name) {listeners.delete(name);}}};
    const component = load('src/app/dashboard/DashboardTestList.tsx', {
        react: {...React, useState(initial) {state ??= initial(); return [state, value => {state = value;}];}, useMemo: fn => fn(), useEffect: fn => {effect = fn;}},
        'react/jsx-runtime': runtime, 'lucide-react': new Proxy({}, {get: () => () => null}), '@/lib/dashboard-test-order': order,
        '@/lib/dashboard-highlights': highlights, './dashboard.module.css': {default:new Proxy({}, {get:(_,key)=>key})},
    }, globals).default;
    const props = {available: [entry('html', htmlExam.title, {...htmlExam, id: 'html', created_at: epoch}), entry('it', 'IT TOOLS CHAPTER 1 TEST')], locked: [entry('locked', 'IT TOOLS CHAPTER 2 TEST', {level_no: 3})], simple: [], subject: 'all', attempted: new Set(['html'])};
    let tree = component(props);
    const articles = tree => walk(tree, node => node.type === 'article');
    assert.equal(articles(tree)[0].props['aria-label'], htmlExam.title + ', new test');
    assert.match(text(tree), /80Q/); assert.match(text(tree), /160 pts/); assert.match(text(tree), /Attempted/);
    const locked = articles(tree).find(node => node.props['aria-label'].includes('locked'));
    assert.equal(walk(locked, node => node.type === 'button').length, 0);
    assert.match(text(locked), /Unlock at Level 3/);
    walk(tree, node => node.type === 'button' && text(node) === 'Try Again')[0].props.onClick();
    assert.equal(globals.window.location.href, '/test/html');
    assert.equal(articles(component({...props, subject: 'web design'})).length, 1);
    const cleanup = effect();
    const timer = [...timers.values()][0]; assert.equal(timer.delay, day + 10);
    now += timer.delay; timer.fn(); tree = component(props);
    assert.ok(!text(tree).includes('NEW')); assert.equal(articles(tree).at(-1).props['aria-label'], htmlExam.title);
    now++; listeners.get('focus')(); assert.equal(state, now);
    cleanup(); assert.equal(timers.size, 0); assert.equal(listeners.size, 0);
    const legacy = component({...props, available: [], locked: [], simple: [entry('hidden', 'Hidden', {is_active: false}), entry('old', 'Old', {is_active: true, questions: [1,2], total_points: 4})], subject: 'all'});
    assert.equal(articles(legacy).length, 1); assert.match(text(legacy), /2Q/); assert.match(text(legacy), /4 pts/);
});

test('80 original bilingual questions have four unique choices, balanced answers and exactly 160 points', () => {
    assert.equal(htmlExam.questions.length, 80); assert.equal(htmlExam.total_marks, 80);
    assert.equal(htmlExam.xp_reward, 160); assert.equal(htmlExam.xp_reward / htmlExam.questions.length, 2);
    assert.equal(new Set(htmlExam.questions.map(q => q.question_text)).size, 80);
    assert.deepEqual([0,1,2,3].map(i => htmlExam.questions.filter(q => q.correctIndex === i).length), [20,20,20,20]);
    for (const [i, q] of htmlExam.questions.entries()) {
        assert.equal(q.serial, i + 1); assert.equal(q.points, 2);
        assert.match(q.question_text, /[\u0900-\u097f]/); assert.match(q.question_text, /[A-Za-z]/);
        assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4);
        assert.ok(q.options.every(option => option && !option.includes('*')), 'import format reserves asterisk for the answer marker');
        assert.ok(q.explanation.length > 20); assert.ok(!/piyush/i.test(q.question_text + q.options.join(' ')));
    }
});

test('actual admin importer round-trips all 80 questions and 320 options without corrupting HTML or answers', async () => {
    const questions = [], options = [];
    const api = load('src/app/api/admin-delete/route.ts', {
        'next/server': {NextResponse: {json: data => data}},
        '@/lib/firebase-admin': {getAdminDb: () => ({collection(name) {
            assert.ok(['exam_questions', 'exam_options'].includes(name));
            return {doc() {const id = 'question-' + questions.length; return {id, async set(data) {questions.push({id, ...data});}};}, async add(data) {options.push(data);}};
        }})}, 'firebase-admin/firestore': {FieldValue: {serverTimestamp: () => 'server-timestamp'}},
    });
    const result = await api.POST({json: async () => ({action: 'import_questions', testId: 'new-html-test-only', text: examImportText()})});
    assert.equal(result.importedCount, 80); assert.equal(questions.length, 80); assert.equal(options.length, 320);
    questions.forEach((question, i) => {
        const expected = htmlExam.questions[i], choices = options.filter(o => o.question_id === question.id);
        assert.equal(question.test_id, 'new-html-test-only'); assert.equal(question.question_type, 'MCQ');
        assert.equal(question.question_text, expected.question_text);
        assert.deepEqual(choices.map(o => o.option_text), expected.options);
        assert.equal(choices.filter(o => o.is_correct).length, 1);
        assert.equal(choices.findIndex(o => o.is_correct), expected.correctIndex);
    });
});

test('prepared import is detected only for complete MCQs with exactly one correct answer', () => {
    const good = examImportText();
    assert.equal(formatted.formattedQuestionCount(good), 80);
    assert.equal(formatted.formattedQuestionCount(good.replaceAll('\n', '\r\n')), 80);
    for (const bad of ['', 'Create HTML questions', good.replace('B. HighText Machine Language', 'A. HighText Machine Language'), good.replace(' *', ''), good.replace('B. HighText Machine Language', 'B. HighText Machine Language *'), good + '\nExplanation: not an option']) {
        assert.equal(formatted.formattedQuestionCount(bad), 0);
    }
});

test('admin imports reviewed questions without calling AI or altering text and retains errors for review', async () => {
    const states = new Map([[0, 'questions'], [6, 'new-html-test'], [13, true], [14, examImportText()]]);
    let index = 0, fail = false, writes = 0;
    const component = load('src/app/superadmin/page.tsx', {
        react: {...React, useState(initial) {const i = index++; if (!states.has(i)) states.set(i, initial); return [states.get(i), value => states.set(i, value)];}},
        'react/jsx-runtime': runtime, 'lucide-react': new Proxy({}, {get: () => () => null}),
        '@/lib/formatted-question-import': formatted,
        './useSuperAdmin': {useSuperAdmin: () => ({user: {}, isAdmin: true, categories: [], users: [], tests: [], questions: [], async importQuestions(id, text) {assert.equal(id, 'new-html-test'); assert.equal(text, examImportText()); if (fail) throw Error('network'); writes++; return 80;}})},
    }, {fetch() {throw Error('Prepared questions must not be rewritten by AI');}}).default;
    const render = () => {index = 0; return component();};
    const button = () => walk(render(), node => node.type === 'button' && text(node).includes('Import 80 prepared questions'))[0];
    await button().props.onClick(); assert.equal(writes, 1); assert.equal(states.get(14), '');
    assert.match(states.get(15), /Imported 80 prepared questions unchanged/); assert.equal(states.get(16), false);
    states.set(14, examImportText()); fail = true;
    await button().props.onClick(); assert.equal(writes, 1); assert.equal(states.get(14), examImportText());
    assert.match(states.get(15), /Error:.*network/); assert.equal(states.get(16), false);
});
