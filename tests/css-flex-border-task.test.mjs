import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import postcss from 'postcss';
const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
function load(file,deps={}){const exports={};vm.runInNewContext(ts.transpileModule(source(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:name=>{assert.ok(name in deps,name);return deps[name];}});return exports;}
const generated=JSON.parse(source('src/data/style-courses.generated.json'));
const authored=load('src/data/css-flex-border-task.ts'),task=authored.flexBorderTask;
const displayAuthored=load('src/data/css-display-border-task.ts'),displayTask=displayAuthored.displayBorderTask;
const courses=load('src/lib/style-courses.ts',{'@/data/style-courses.generated.json':{default:generated},'@/data/css-flex-border-task':authored,'@/data/css-display-border-task':displayAuthored});
const demos=load('src/lib/style-course-demo.ts');
const basic={react:React,'react/jsx-runtime':jsx,'next/link':{default:({children,...props})=>React.createElement('a',props,children)},'lucide-react':new Proxy({},{get:()=>()=>null})};

test('authored flex/border task preserves the imported course and exposes only public metadata in the lesson',()=>{
    const course=courses.getStyleCourse('css');
    assert.equal(course.tasks.length,generated.css.tasks.length+2);
    assert.deepEqual([...course.tasks.filter(t=>t.id!==task.id&&t.id!==displayTask.id).map(t=>t.id)],generated.css.tasks.map(t=>t.id));
    assert.equal(course.tasks.findIndex(t=>t.id===displayTask.id),2);
    assert.equal(course.tasks.findIndex(t=>t.id===task.id),3);
    assert.equal(task.lesson,'display-flex');assert.equal(task.inlineAfter,'display-flex');
    const summary=courses.courseSummary('css').tasks.find(t=>t.id===task.id);
    assert.ok(summary);assert.equal(summary.solution,undefined);assert.equal(summary.starter,undefined);
    assert.equal(courses.getStyleCourse('w3css'),generated.w3css);
});
test('task callout occurs once after Display: Flex and before Box Model in the continuous reader',()=>{
    const callout=load('src/components/style-course/LessonTaskCard.tsx',basic);
    const Reader=load('src/components/style-course/CourseReader.tsx',{...basic,'@/lib/style-course-reading':load('src/lib/style-course-reading.ts'),'./LessonTaskCard':callout,'./CourseProgress':{useCourseProgress:()=>({completed:[]})},'./LessonReader':{default:({lesson})=>React.createElement('h2',{},lesson.title)}}).default;
    const course=courses.getStyleCourse('css');
    const html=renderToStaticMarkup(React.createElement(Reader,{course:courses.courseSummary('css'),initialId:'display-flex',chapters:course.lessons.map(lesson=>({lesson,demo:demos.lessonDraft('css',lesson)}))}));
    const flex=html.indexOf('id="chapter-display-flex"'),exercise=html.indexOf('id="lesson-task-flex-border-cards"'),next=html.indexOf('id="chapter-css-box-model-comprehensive-guide"');
    assert.ok(flex<exercise&&exercise<next);
    assert.equal((html.match(/id="lesson-task-flex-border-cards"/g)||[]).length,1);
    const display=html.indexOf('id="chapter-display-property"'),displayExercise=html.indexOf('id="lesson-task-display-border-lab"');
    assert.ok(display<displayExercise&&displayExercise<flex,'display exercise comes after Display Property and before Flex');
    assert.equal((html.match(/id="lesson-task-display-border-lab"/g)||[]).length,1);
    assert.match(html,/href="\/web-design\/css\/tasks\/display-border-lab\/compiler"/);
    assert.match(html,/href="\/web-design\/css\/tasks\/flex-border-cards\/compiler"/);
    assert.ok(!html.includes('CSS Study Corner'),'The inline summary does not expose the locked target or solution');
});

test('display task compares the same spans without Flexbox and keeps its public reference equal to the compiler solution',()=>{
    assert.equal(displayTask.lesson,'display-property');assert.equal(displayTask.inlineAfter,'display-property');
    const summary=courses.courseSummary('css').tasks.find(t=>t.id===displayTask.id);
    assert.equal(summary.solution,undefined);assert.equal(summary.starter,undefined);
    assert.equal(source('public'+displayTask.target).trimEnd(),demos.previewDocument(displayTask.solution,'css'));
    const rules=new Map();postcss.parse(displayTask.solution.css).walkRules(rule=>rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]))));
    for(const [group,display,border] of [['block','block','2px solid #5486d9'],['inline','inline','2px dashed #d98a3d'],['inline-block','inline-block','4px double #419777']]) {
        const style=rules.get(`.${group}-panel .sample`);assert.equal(style.display,display);assert.equal(style.border,border);assert.ok(style.width&&style.height);
    }
    assert.doesNotMatch(displayTask.solution.css,/display:\s*(flex|grid)/);
    assert.equal((displayTask.starter.html.match(/<span class="sample">/g)||[]).length,9);
    assert.doesNotMatch(displayTask.starter.css,/display:\s*(block|inline)/);
    assert.doesNotMatch(source('public'+displayTask.target),/<script|https?:\/\//);
});
test('reference and compiler solution stay identical, with three genuine border styles and a wrapping flex layout',()=>{
    const reference=source('public'+task.target).trimEnd();
    assert.equal(reference,demos.previewDocument(task.solution,'css'));
    const css=postcss.parse(task.solution.css),rules=new Map();css.walkRules(rule=>rules.set(rule.selector,Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]))));
    assert.equal(rules.get('.study-cards').display,'flex');assert.equal(rules.get('.study-cards')['flex-wrap'],'wrap');assert.equal(rules.get('.study-cards').gap,'16px');
    assert.equal(rules.get('.html-card').border,'3px solid #e78a41');assert.equal(rules.get('.css-card').border,'3px dashed #5486d9');assert.equal(rules.get('.js-card').border,'5px double #9a76c7');
    assert.equal(rules.get('.subject-card a')['margin-top'],'auto');
    assert.equal((task.starter.html.match(/class="subject-card /g)||[]).length,3);
    assert.ok(!task.starter.css.includes('display: flex'));assert.ok(!/<script|https?:\/\//.test(reference));
});
