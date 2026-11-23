import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { htmlExam } from '../content/exams/html-olevel-test-1.mjs';

const source = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
function load(file, deps) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source(file), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText, {exports, require(name) {assert.ok(name in deps, name); return deps[name];}});
    return exports;
}
const dictionary = JSON.parse(source('src/data/html-test-option-hindi.json'));
const language = load('src/lib/html-test-option-language.ts', {'@/data/html-test-option-hindi.json': {default: dictionary}});
const OptionText = load('src/components/exam/OptionText.tsx', {'react/jsx-runtime': runtime, '@/lib/html-test-option-language': language}).default;
const render = (text, id = language.HTML_PRACTICE_TEST_ID) => renderToStaticMarkup(React.createElement(OptionText, {testId: id, text}));

test('all descriptive options in all 80 questions have Hindi, including distractors and compound tag descriptions', () => {
    const options = new Set(htmlExam.questions.flatMap(question => question.options));
    for (const text of options) {
        const prose = text.includes(' ') && !text.startsWith('<') && !text.startsWith('//') && !text.startsWith('class=');
        const compound = /\b(with|containing|only|and)\b/.test(text);
        if (prose || compound) assert.match(language.htmlOptionHindi(language.HTML_PRACTICE_TEST_ID, text) || '', /[\u0900-\u097f]/, text);
    }
    assert.equal(Object.keys(dictionary).length, 96);
    for (const [english, hindi] of Object.entries(dictionary)) {
        assert.ok(options.has(english), 'No unused/mismatched translation: ' + english);
        assert.match(hindi, /[\u0900-\u097f]/);
    }
});

test('GET answer choices render English followed by Hindi in separate accessible lines', () => {
    for (const text of ['Only in a hidden local file', 'In the URL fragment after #', 'Inside the page title', 'In the URL query string']) {
        const html = render(text);
        assert.match(html, /lang="en"/); assert.match(html, /lang="hi"/);
        assert.ok(html.indexOf(text) < html.indexOf(dictionary[text]));
    }
    assert.match(render('In the URL query string'), /URL की query string में/);
    assert.match(render('In the URL fragment after #'), /# के बाद वाले fragment में/);
});

test('code, attribute syntax and other exams stay literal; descriptions are escaped safely', () => {
    assert.equal(render('min="1"'), 'min=&quot;1&quot;');
    assert.equal(render('<input type="text">'), '&lt;input type=&quot;text&quot;&gt;');
    assert.equal(render('In the URL query string', 'another-test'), 'In the URL query string');
    assert.equal(language.htmlOptionHindi(language.HTML_PRACTICE_TEST_ID, 'constructor'), undefined);
    const html = render('Inside <head>');
    assert.match(html, /Inside &lt;head&gt;/); assert.match(html, /&lt;head&gt; के अंदर/);
    assert.ok(!html.includes('<head>'));
});

test('exam and review use the same translations while selections still refer to original option IDs', () => {
    const exam = source('src/app/test/[id]/page.tsx'), review = source('src/app/review/[id]/page.tsx');
    assert.match(exam, /<OptionText testId=\{testId\} text=\{opt.option_text\}/);
    assert.match(review, /<OptionText testId=\{attempt\?\.test_id\} text=\{cleanText\}/);
    assert.match(exam, /handleOptionClick\(currentQ.id, opt.id\)/);
    assert.match(review, /resp\?\.option_id === opt.id/);
    assert.equal(htmlExam.questions.length, 80); assert.equal(htmlExam.xp_reward, 160);
});
