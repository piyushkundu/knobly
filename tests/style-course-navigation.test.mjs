import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';

const root = new URL('../', import.meta.url);
const data = JSON.parse(readFileSync(new URL('src/data/style-courses.generated.json', root), 'utf8'));
const icons = new Proxy({}, { get: () => () => null });
const link = { default: ({ children, ...props }) => React.createElement('a', props, children) };
function load(file, deps = {}) {
    const exports = {};
    const source = ts.transpileModule(readFileSync(new URL(file, root), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(source, { exports, require(name) { assert.ok(name in deps, name); return deps[name]; } });
    return exports;
}
const { lessonDraft, previewDocument } = load('src/lib/style-course-demo.ts');
function harness(file, deps = {}, deep = false) {
    const states = [];
    let cursor = 0;
    const react = { ...React, useState(initial) {
        const index = cursor++;
        if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
        return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    } };
    const { default: Component } = load(file, { react, 'react/jsx-runtime': runtime, 'next/link': link, 'lucide-react': icons, ...deps });
    return props => { cursor = 0; const element=Component(props); return deep ? resolve(element) : element; };
}
function resolve(node) {
    if (Array.isArray(node)) return node.map(resolve);
    if (!React.isValidElement(node)) return node;
    if (typeof node.type === 'function') return resolve(node.type(node.props));
    return React.cloneElement(node, {}, resolve(node.props.children));
}
function walk(node, predicate) {
    if (Array.isArray(node)) return node.flatMap(child => walk(child, predicate));
    if (!React.isValidElement(node)) return [];
    return [...(predicate(node) ? [node] : []), ...walk(node.props.children, predicate)];
}
const hasClass = name => node => node.props.className?.split(' ').includes(name);
const text = node => Array.isArray(node) ? node.map(text).join('') : React.isValidElement(node) ? text(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : '';
const button = (tree, label) => walk(tree, node => node.type === 'button' && text(node).includes(label))[0];
const input = (tree, label) => walk(tree, node => node.type === 'input' && node.props['aria-label'] === label)[0];

test('both course libraries combine search and category, reset empty results, and resume saved progress', () => {
    for (const [id, course] of Object.entries(data)) {
        const completed = [course.lessons[0].id, course.lessons[1].id, 'old-unknown-chapter'];
        const render = harness('src/components/style-course/CourseHub.tsx', {
            './CourseProgress': { useCourseProgress: () => ({ completed }) },
            './CourseArtwork': { default: () => null },
        });
        const props = { course: { ...course, id, quizCount: course.quiz.length, exampleCount: 1 } };
        let tree = render(props);
        assert.equal(walk(tree, hasClass('sc-chapter')).length, course.lessons.length);
        assert.equal(walk(tree, hasClass('sc-hero-start'))[0].props.href, `/web-design/${id}/learn/${course.lessons[2].id}`);
        assert.equal(walk(tree, node => node.type === 'progress')[0].props.value, 2);
        const category = course.lessons.find(lesson => lesson.group === 'More practice').group;
        button(tree, category).props.onClick();
        tree = render(props);
        assert.equal(walk(tree, hasClass('sc-chapter')).length, course.lessons.filter(lesson => lesson.group === category).length);
        input(tree, 'Search course chapters').props.onChange({ target: { value: 'does not exist' } });
        tree = render(props);
        assert.equal(walk(tree, hasClass('sc-chapter')).length, 0);
        assert.ok(button(tree, 'Show all chapters'));
        button(tree, 'Show all chapters').props.onClick();
        tree = render(props);
        assert.equal(walk(tree, hasClass('sc-chapter')).length, course.lessons.length);
        input(tree, 'Search course chapters').props.onChange({ target: { value: 'BORDER' } });
        tree = render(props);
        const expected = course.lessons.filter(lesson => `${lesson.title} ${lesson.group}`.toLowerCase().includes('border'));
        assert.equal(walk(tree, hasClass('sc-chapter')).length, expected.length);
        button(tree, category).props.onClick();
        assert.equal(walk(render(props), hasClass('sc-chapter')).length, expected.filter(lesson => lesson.group === category).length);
    }
});

test('lesson file tabs retain the supplied example and show its result in an isolated iframe', () => {
    const course = data.css;
    const lesson = course.lessons.find(item => lessonDraft('css', item).css);
    const demo = lessonDraft('css', lesson);
    const render = harness('src/components/style-course/LessonReader.tsx', {
        'next/image': { default: () => null },
        './CourseProgress': { default: () => null, useCourseProgress: () => ({ completed: [lesson.id] }) },
        '@/lib/style-course-demo': { previewDocument },
        './VisualLessonLab': { default: () => null },
        './FoundationLesson': { default: () => null },
        './LockedNotes': { default: () => null },
    });
    const props = { course: { ...course, id: 'css' }, lesson, demo };
    let tree = render(props);
    const displayedCode = value => walk(value, node => node.props.label === 'index.html' || node.props.label === 'style.css')[0];
    assert.equal(displayedCode(tree).props.code, demo.html);
    assert.equal(walk(tree, node => node.type === 'iframe').length, 0);
    button(tree, 'style.css').props.onClick();
    tree = render(props);
    assert.equal(displayedCode(tree).props.code, demo.css);
    button(tree, 'Show result').props.onClick();
    tree = render(props);
    const frame = walk(tree, node => node.type === 'iframe')[0];
    assert.equal(frame.props.srcDoc, previewDocument(demo, 'css'));
    assert.equal(frame.props.sandbox, 'allow-scripts');
    button(tree, 'Hide result').props.onClick();
    tree = render(props);
    assert.equal(walk(tree, node => node.type === 'iframe').length, 0);
    assert.equal(displayedCode(tree).props.code, demo.css);
    button(tree, 'Browse').props.onClick();
    tree = render(props);
    assert.equal(button(tree, 'Browse').props['aria-expanded'], true);
    const chapterLink = walk(tree, node => node.props['aria-current'] === 'page')[0];
    chapterLink.props.onClick();
    assert.equal(button(render(props), 'Browse').props['aria-expanded'], false);
});

test('compact course navigation opens, closes after choosing a destination, and retains an accessible compiler link', () => {
    for (const course of ['css', 'w3css']) {
        const render = harness('src/components/style-course/CourseShell.tsx', {
            './CourseArtwork': { CourseBackdrop: () => null, CourseMark: () => null },
        });
        const props = { course, children: null };
        let tree = render(props);
        let toggle = walk(tree, hasClass('sc-menu-toggle'))[0];
        assert.equal(toggle.props['aria-expanded'], false);
        toggle.props.onClick();
        tree = render(props);
        assert.equal(walk(tree, hasClass('sc-menu-toggle'))[0].props['aria-expanded'], true);
        const navigation = walk(tree, node => node.props['aria-label'] === 'Course navigation')[0];
        assert.equal(navigation.props.id, toggle.props['aria-controls']);
        const notes = walk(navigation, node => node.props.href === `/web-design/${course}/notes`)[0];
        notes.props.onClick();
        tree = render(props);
        assert.equal(walk(tree, hasClass('sc-menu-toggle'))[0].props['aria-expanded'], false);
        const compiler = walk(tree, hasClass('sc-compiler-link'))[0];
        assert.equal(compiler.props.href, `/web-design/${course}/compiler`);
        assert.match(compiler.props['aria-label'], /web compiler/);
    }
});

test('border controls change the drawing and the copyable CSS together, including no-border styles', () => {
    const render=harness('src/components/style-course/VisualLessonLab.tsx',{},true);
    const props={course:'css',lesson:'border-properties'};
    let tree=render(props);
    assert.equal(walk(tree,hasClass('vl-border-gallery'))[0].props.children.length,10);
    const select=walk(tree,node=>node.type==='select')[0];
    select.props.onChange({target:{value:'double'}});
    input(tree,'Border width').props.onChange({target:{value:'12'}});
    input(tree,'Corner radius').props.onChange({target:{value:'30'}});
    tree=render(props);
    const drawing=walk(tree,hasClass('vl-border-stage'))[0].props.children;
    assert.equal(drawing.props.style.borderStyle,'double');
    assert.equal(drawing.props.style.borderWidth,12);
    assert.equal(drawing.props.style.borderRadius,30);
    assert.match(text(walk(tree,hasClass('vl-code'))[0]),/border: 12px double/);
    button(walk(tree,hasClass('vl-border-gallery'))[0],'hidden').props.onClick();
    tree=render(props);
    assert.equal(walk(tree,hasClass('vl-border-stage'))[0].props.children.props.style.borderStyle,'hidden');
    assert.match(text(walk(tree,hasClass('vl-code'))[0]),/12px hidden/);
});

test('box width includes both padding and border sides while keeping margin outside', () => {
    const render=harness('src/components/style-course/VisualLessonLab.tsx',{},true);
    const props={course:'css',lesson:'css-box-model-comprehensive-guide'};
    let tree=render(props);
    input(tree,'Padding (inside)').props.onChange({target:{value:'30'}});
    input(tree,'Border thickness').props.onChange({target:{value:'10'}});
    input(tree,'Margin (outside)').props.onChange({target:{value:'40'}});
    tree=render(props);
    assert.match(text(walk(tree,hasClass('vl-maths'))[0]),/240px/);
    assert.match(text(walk(tree,hasClass('vl-maths'))[0]),/80px of horizontal space outside/);
    assert.equal(walk(tree,hasClass('vl-padding-layer'))[0].props.style.padding,30);
    assert.equal(walk(tree,hasClass('vl-margin-layer'))[0].props.style.padding,40);
    assert.match(text(walk(tree,hasClass('vl-code'))[0]),/padding: 30px/);
});

test('flex direction changes the displayed main axis and selector examples distinguish children from descendants', () => {
    const flex=harness('src/components/style-course/VisualLessonLab.tsx',{},true);
    const props={course:'css',lesson:'display-flex'};
    let tree=flex(props);
    walk(tree,node=>node.type==='select')[0].props.onChange({target:{value:'column'}});
    tree=flex(props);
    assert.match(text(walk(tree,hasClass('vl-axis'))[0]),/Main axis: vertical/);
    assert.equal(walk(tree,hasClass('vl-flex-stage'))[0].props.style.flexDirection,'column');
    assert.match(text(walk(tree,hasClass('vl-code'))[0]),/flex-direction: column/);
    const selectors=harness('src/components/style-course/VisualLessonLab.tsx',{},true);
    const selectorProps={course:'css',lesson:'css-selectors'};
    tree=selectors(selectorProps);
    assert.equal(walk(tree,hasClass('is-match')).length,2);
    button(tree,'.card > p').props.onClick();
    tree=selectors(selectorProps);
    assert.equal(walk(tree,hasClass('is-match')).length,1);
    assert.match(text(walk(tree,hasClass('is-match'))[0]),/Direct child/);
    button(tree,'section + p').props.onClick();
    assert.match(text(walk(selectors(selectorProps),hasClass('is-match'))[0]),/Following sibling/);
});

test('restored panel controls open inline-hidden content and reject elements outside their lesson', () => {
    const render=harness('src/components/style-course/LessonReader.tsx',{
        'next/image':{default:()=>null}, './CourseProgress':{default:()=>null,useCourseProgress:()=>({completed:[]})},
        '@/lib/style-course-demo':{previewDocument}, './VisualLessonLab':{default:()=>null},
        './FoundationLesson':{default:()=>null}, './LockedNotes':{default:()=>null},
    });
    const course={...data.w3css,id:'w3css'};
    const lesson=course.lessons.find(item=>item.id==='collapsible-panel');
    const tree=render({course,lesson,demo:lessonDraft('w3css',lesson)});
    const source=walk(tree,hasClass('sc-rich-source'))[0];
    let active=true;
    const panel={hidden:false,style:{display:'none'},classList:{contains:()=>false,remove(){}}};
    const toggle={dataset:{lessonToggle:'demo-panel'},setAttribute(name,value){this[name]=value;}};
    const target={closest(selector){return selector==='[data-lesson-toggle]'?toggle:null;}};
    const currentTarget={contains:()=>active,querySelector(selector){assert.equal(selector,'[id="demo-panel"]');return panel;}};
    source.props.onClick({target,currentTarget});
    assert.equal(panel.style.display,'');
    assert.equal(panel.hidden,false);
    assert.equal(toggle['aria-expanded'],'true');
    source.props.onClick({target,currentTarget});
    assert.equal(panel.hidden,true);
    active=false;
    source.props.onClick({target,currentTarget});
    assert.equal(panel.hidden,true);
});
