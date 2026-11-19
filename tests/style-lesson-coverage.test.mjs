import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import postcss from 'postcss';
import { scopeLessonCss } from '../scripts/scope-style-lessons.mjs';

const root=new URL('../',import.meta.url);
const courses=JSON.parse(readFileSync(new URL('src/data/style-courses.generated.json',root),'utf8'));
const coverage=JSON.parse(readFileSync(new URL('docs/STYLE_LESSON_COVERAGE.json',root),'utf8'));
const flatten=nodes=>nodes.flatMap(node=>[node,...flatten(node.children||[])]);

test('all original code examples, source lesson IDs and handwritten page coverage remain accounted for',()=>{
    assert.equal(coverage.lessons.length,41);
    assert.equal(coverage.missing.length,0);
    for(const original of coverage.lessons){
        const lesson=courses[original.course].lessons.find(item=>item.id===original.lesson);
        assert.ok(lesson,original.lesson);
        const hashes=lesson.examples.map(code=>createHash('sha256').update(code).digest('hex'));
        for(const hash of original.originalExampleHashes)assert.ok(hashes.includes(hash),original.lesson+' lost an original example');
    }
    const content=JSON.stringify(courses.css.lessons.map(lesson=>lesson.nodes));
    for(const property of coverage.handwrittenCssProperties)assert.ok(content.includes(property),property+' missing from teaching material');
    for(const notes of Object.values(coverage.notes)){
        const pages=new Set(notes.coverage.flatMap(item=>item.pages));
        assert.equal(pages.size,notes.pagesReviewed);
        for(let page=1;page<=notes.pagesReviewed;page++)assert.ok(pages.has(page),'PDF page '+page);
    }
});

test('source diagrams retain their real visual styles and native W3 examples have adjacent HTML',()=>{
    const border=courses.css.lessons.find(lesson=>lesson.id==='border-properties');
    const boxes=flatten(border.nodes).filter(node=>node.attrs?.class?.split(' ').includes('border-demo'));
    assert.equal(boxes.length,15);
    for(const style of ['dotted','dashed','solid','double'])assert.ok(boxes.some(node=>node.attrs.style.includes(style)),style);
    const methods=courses.css.lessons.find(lesson=>lesson.id==='three-ways-to-insert-css');
    assert.equal(flatten(methods.nodes).filter(node=>node.attrs?.class==='demo-item'&&node.attrs?.style?.includes('background')).length,3);
    const model=courses.css.lessons.find(lesson=>lesson.id==='css-box-model-comprehensive-guide');
    assert.ok(flatten(model.nodes).some(node=>node.attrs?.class==='box-model-diagram'));
    const colours=courses.w3css.lessons.find(lesson=>lesson.id==='w3-css-classes-colors-and-hover-effects');
    const pairs=flatten(colours.nodes).filter(node=>node.attrs?.class==='sc-paired-example');
    assert.ok(pairs.length>=3);
    for(const pair of pairs)assert.ok(pair.children.at(-1).code.includes('class='));
    for(const course of Object.values(courses))for(const lesson of course.lessons){
        const all=flatten(lesson.nodes);
        const ids=all.map(node=>node.attrs?.id).filter(Boolean);
        assert.equal(ids.length,new Set(ids).size,lesson.id+' duplicate IDs');
        for(const node of all){
            assert.notEqual(node.tag,'script');
            for(const attribute of Object.keys(node.attrs||{}))assert.ok(!attribute.startsWith('on'));
            const target=node.attrs?.['data-lesson-toggle'];
            if(target)assert.ok(ids.includes(target),'Missing toggle target '+target);
        }
    }
});

test('source styles and framework classes are scoped, including responsive selectors and animation names',()=>{
    const files=['style-source.generated.css','style-lesson-visuals.css'];
    for(const file of files)assert.doesNotThrow(()=>postcss.parse(readFileSync(new URL('src/components/style-course/'+file,root),'utf8')));
    const css=readFileSync(new URL('src/components/style-course/style-source.generated.css',root),'utf8');
    const parsed=postcss.parse(css);
    parsed.walkRules(rule=>{
        if(/keyframes$/i.test(rule.parent?.name||''))return;
        assert.ok(rule.selector.startsWith('.sc-site :where(.sc-rich-source.sc-source-'),rule.selector);
    });
    parsed.walkAtRules(rule=>assert.ok(!['import','font-face'].includes(rule.name)));
    const example=scopeLessonCss(':root{--accent:blue} body,p{color:blue} @media(max-width:600px){.card:hover{color:red}} @keyframes fade{to{opacity:1}} .card{animation:fade 1s}', 'test');
    assert.match(example,/sc-test-fade/);
    assert.ok(!/animation:fade/.test(example));
    assert.match(example,/:where\(\.sc-rich-source.sc-source-test\) .card:hover/);
});
