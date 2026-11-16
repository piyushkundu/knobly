import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

function guide() {
    const source = readFileSync(new URL('../src/app/html/elements/page.tsx', import.meta.url), 'utf8');
    const exports = {};
    const Sidebar = () => null;
    const dependencies = {
        react: React, 'react/jsx-runtime': jsxRuntime,
        'next/link': { default: ({ href, children }) => React.createElement('a', { href }, children) },
        'lucide-react': new Proxy({}, { get: () => () => null }),
        '@/components/content/SidebarLayout': { default: Sidebar },
    };
    vm.runInNewContext(ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, {
        exports,
        require(name) { assert.ok(Object.hasOwn(dependencies, name), name); return dependencies[name]; },
        localStorage: new Proxy({}, { get() { assert.fail('Guide rendering must not access saved user data'); } }),
        sessionStorage: new Proxy({}, { get() { assert.fail('Guide rendering must not access saved user data'); } }),
        fetch() { assert.fail('Guide rendering must not make network requests'); },
    });
    return exports.default();
}

function nodes(tree, predicate) {
    if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
    if (!tree || typeof tree !== 'object') return [];
    return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}

test('new chapters follow tables; original anchors and practice tasks remain', () => {
    const tree = guide();
    const items = tree.props.items;
    assert.equal(items.length, 27);
    assert.equal(new Set(items.map(item => item.id)).size, 27);
    assert.deepEqual(Array.from(items.slice(16, 21), item => item.id), ['table-tag', 'frameset-tag', 'frame-tag', 'nested-frames', 'form-tag']);
    const sections = nodes(tree, node => node.type?.name === 'Section');
    assert.deepEqual(sections.map(node => node.props.id), Array.from(items, item => item.id));
    sections.forEach((section, i) => assert.ok(section.props.title.startsWith(`${i + 1}. `)));
    assert.ok(nodes(tree, node => node.type?.name === 'PracticeTaskCard' && node.props.taskId === '8').length);
    assert.ok(sections.find(node => node.props.id === 'entities'));
});

test('legacy frames explain multi-file layouts and are copy-only instead of misleading single-file Run links', () => {
    const sections = nodes(guide(), node => node.type?.name === 'Section' && ['frameset-tag', 'frame-tag', 'nested-frames'].includes(node.props.id));
    for (const section of sections) {
        const examples = nodes(section, node => node.type?.name === 'Code');
        assert.ok(examples.length);
        for (const example of examples) assert.equal(example.props.runnable, false);
    }
    const nested = nodes(sections[2], node => node.type?.name === 'Code')[0].props.code;
    assert.match(nested, /<frameset rows="\*,\*">[\s\S]*<frameset cols="\*,\*">/);
    assert.equal((nested.match(/<frame /g) || []).length, 3);
    assert.equal((nested.match(/<\/frameset>/g) || []).length, 2);
    assert.doesNotMatch(nested, /<body>/);
});

test('all requested input types have demos whose submit handlers cannot send data', () => {
    const form = nodes(guide(), node => node.props?.id === 'form-tag')[0];
    const examples = nodes(form, node => node.type?.name === 'Code');
    const snippets = examples.map(node => node.props.code).join('\n');
    for (const type of ['text', 'radio', 'checkbox', 'date', 'password', 'file', 'number', 'time', 'tel', 'email', 'submit', 'reset', 'color', 'range']) {
        assert.ok(snippets.includes(`type="${type}"`), `Missing ${type}`);
    }
    for (const tag of ['textarea', 'fieldset', 'legend', 'select', 'option', 'button']) assert.ok(snippets.includes(`<${tag}`));
    for (const example of examples.filter(node => node.props.runnable !== false)) {
        for (const match of example.props.code.matchAll(/<form\b([^>]*)>/g)) {
            const handler = match[1].match(/onsubmit="([^"]+)"/)?.[1];
            assert.ok(handler, 'Runnable form must prevent network submission');
            let prevented = false;
            const status = {};
            vm.runInNewContext(handler, { event: { preventDefault() { prevented = true; } }, document: { getElementById() { return status; } } });
            assert.equal(prevented, true);
        }
    }
});

test('attribute tables render three columns with explanatory values and frame/form details', () => {
    const tree = guide();
    const tables = nodes(tree, node => node.type?.name === 'AttributeValues');
    const html = tables.map(node => renderToStaticMarkup(node)).join('\n');
    for (const label of ['Values / Example', 'frameborder', 'noresize', 'scrolling', 'multipart/form-data', 'readonly / disabled', 'option: value']) assert.ok(html.includes(label), label);
    assert.ok(html.includes('name'));
    assert.ok(html.includes('action'));
    assert.ok(html.includes('method'));
});

test('media and validation precede iframe without changing existing section anchors', () => {
    const tree = guide();
    const items = Array.from(tree.props.items, item => item.id);
    const index = items.indexOf('audio-video');
    assert.deepEqual(items.slice(index), ['audio-video', 'form-validation', 'iframe-tag', 'entities']);
    const media = nodes(tree, node => node.props?.id === 'audio-video')[0];
    const examples = nodes(media, node => node.type?.name === 'Code');
    const snippets = examples.map(node => node.props.code).join('\n');
    assert.match(snippets, /type="audio\/mpeg"/);
    assert.match(snippets, /type="video\/mp4"/);
    assert.match(snippets, /<track kind="captions"/);
    assert.doesNotMatch(snippets, /<iframe/);
    assert.equal(examples.filter(node => node.props.runnable !== false).length, 1);
    assert.match(examples.find(node => node.props.runnable !== false).props.code, /preload="none"/);
});

test('every lesson pattern compiles with the HTML Unicode v flag and enforces its promised boundary', () => {
    const validation = nodes(guide(), node => node.props?.id === 'form-validation')[0];
    const snippets = nodes(validation, node => node.type?.name === 'Code').map(node => node.props.code).join('\n');
    const patterns = [...snippets.matchAll(/pattern="([^"]+)"/g)].map(match => match[1]);
    assert.equal(patterns.length, 8);
    const cases = [
        ['[A-Za-z]{1,5}', ['a', 'Hello'], ['', 'abcdef', 'A,B', 'abc1']],
        ['[A-Za-z0-9]+', ['a', 'HTML5'], ['', 'a,b', 'HTML 5']],
        ['[0-9]{1,10}', ['0', '0123456789'], ['', '12345678901', '1a']],
        ['[0-9]{10}', ['0123456789'], ['12345', '12345678901']],
        ['[A-Za-z]+', ['a', 'LearningHTML'], ['', 'HTML5', 'a,b']],
        ['[A-Za-z0-9_@\\-]+', ['student_1@web-site'], ['student!', 'a b', 'a,b']],
        ['[A-Za-z][A-Za-z0-9_\\-]{0,24}', ['A', 'Piyush_1', 'A'.repeat(25)], ['1Piyush', 'A'.repeat(26), 'a,b']],
        ['[0-9]{1,5}', ['0', '12345'], ['', '123456', '1.5']],
    ];
    for (const [pattern, valid, invalid] of cases) {
        assert.ok(patterns.includes(pattern), `Missing runnable pattern: ${pattern}`);
        const regex = new RegExp(`^(?:${pattern})$`, 'v');
        valid.forEach(value => assert.ok(regex.test(value), `${pattern} should accept ${value}`));
        invalid.forEach(value => assert.equal(regex.test(value), false, `${pattern} should reject ${value}`));
    }
});

test('validation demos prevent submission, keep native constraints enabled and cover the supplied input rules', () => {
    const validation = nodes(guide(), node => node.props?.id === 'form-validation')[0];
    const snippets = nodes(validation, node => node.type?.name === 'Code').map(node => node.props.code);
    for (const code of snippets) {
        const form = code.match(/<form\b([^>]*)>/);
        assert.ok(form);
        assert.doesNotMatch(form[1], /\bnovalidate\b/);
        assert.doesNotMatch(code, /\bformnovalidate\b/);
        const handler = form[1].match(/onsubmit="([^"]+)"/)?.[1];
        assert.ok(handler);
        let prevented = false;
        vm.runInNewContext(handler, {
            event: { preventDefault() { prevented = true; } },
            document: { getElementById() { return {}; } },
            elements: { level: { value: '7' } },
        });
        assert.equal(prevented, true);
    }
    const code = snippets.join('\n');
    assert.match(code, /type="email"[^>]*multiple required/);
    assert.match(code, /type="number"[^>]*min="1" max="10" step="0\.1" required/);
    assert.match(code, /type="range"[^>]*min="1" max="50" step="2"/);
    assert.match(code, /type="date"[^>]*min="2026-01-01" max="2026-12-31" required/);
    assert.match(code, /required autofocus/);
});
