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
    assert.equal(items.length, 26);
    assert.equal(new Set(items.map(item => item.id)).size, 26);
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
