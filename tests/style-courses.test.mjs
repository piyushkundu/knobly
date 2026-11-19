import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

const root = new URL('../',import.meta.url);
const data = JSON.parse(readFileSync(new URL('src/data/style-courses.generated.json',root),'utf8'));
const manifest = JSON.parse(readFileSync(new URL('docs/STYLE_COURSE_IMPORT.json',root),'utf8'));
function load(file,deps={},globals={}) {
    const exports={};
    vm.runInNewContext(ts.transpileModule(readFileSync(new URL(file,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require(name){assert.ok(name in deps,name);return deps[name];},URL,console,...globals});
    return exports;
}
const {lessonDraft,previewDocument}=load('src/lib/style-course-demo.ts');
const publicFile=path=>new URL('public'+path,root);

test('all imported source archives retain their original bytes and all task references resolve',()=>{
    assert.equal(manifest.inspected.length,16);
    assert.equal(manifest.files.length,12);
    for(const file of manifest.files){const bytes=readFileSync(publicFile(file.archive));assert.equal(bytes.length,file.bytes,file.file);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.file);}
    for(const [id,course] of Object.entries(data)){
        assert.equal(new Set(course.lessons.map(l=>l.id)).size,course.lessons.length);
        assert.equal(new Set(course.tasks.map(t=>t.id)).size,course.tasks.length);
        for(const task of course.tasks){
            assert.ok(course.lessons.some(l=>l.id===task.lesson),task.id+' related lesson');
            assert.ok(existsSync(publicFile(task.target)),task.id+' target');
            assert.ok(manifest.files.some(f=>f.file===task.source));
            assert.match(task.solution.html,/<body/i);
            assert.ok(task.steps.length>=3);
        }
        for(const lesson of course.lessons){
            if(lesson.visual)assert.ok(existsSync(publicFile(lesson.visual)),lesson.id);
            const draft=lessonDraft(id,lesson);
            assert.ok(draft.html.length>20,lesson.id+' runnable example');
            assert.ok(!/img_avatar|via\.placeholder|api\/placeholder/.test(draft.html+draft.css));
            const preview=previewDocument(draft,id);
            assert.match(preview,/<meta name="viewport"/);
            if(id==='w3css')assert.match(preview,/style-course\/w3\.css/);
        }
    }
    assert.equal(data.css.tasks.length+data.w3css.tasks.length,5);
});

test('all 41 lessons render tables, nested examples and void elements without rendering errors',()=>{
    const {default:Reader}=load('src/components/style-course/LessonReader.tsx',{
        react:React,'react/jsx-runtime':runtime,
        'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
        'next/image':{default:({unoptimized,...props})=>React.createElement('img',props)},
        'lucide-react':new Proxy({},{get:()=>()=>null}),
        './CourseProgress':{default:()=>null,useCourseProgress:()=>({completed:[]})},
        '@/lib/style-course-demo':{previewDocument},
        './VisualLessonLab':{default:()=>null},
        './FoundationLesson':{default:()=>null},
        './LockedNotes':{default:()=>null},
    });
    let count=0;
    for(const [id,course] of Object.entries(data))for(const lesson of course.lessons){
        const html=renderToStaticMarkup(React.createElement(Reader,{course:{...course,lessons:course.lessons.map(({id,title,group})=>({id,title,group}))},lesson,demo:lessonDraft(id,lesson)}));
        assert.ok(html.includes('Detailed explanation'),lesson.id);
        assert.ok(html.includes('Try this lesson'),lesson.id);
        assert.ok(!/<table[^>]*>\s*<tr/.test(html),'Rows must be inside a table section: '+lesson.id);
        count++;
    }
    assert.equal(count,41);
});

test('compiler waits for draft restoration before mounting an editor and only reads its own draft key',()=>{
    let phase='server',cursor=0;
    const cells=[];
    const saved={html:'<h1>My existing work</h1>',css:'h1 {color:purple}'};
    const react={...React,useState(init){const i=cursor++;if(!(i in cells))cells[i]=typeof init==='function'?init():init;return[cells[i],()=>{}];},useSyncExternalStore(subscribe,snapshot,server){return phase==='server'?server():snapshot();}};
    const {default:Playground}=load('src/components/style-course/StylePlayground.tsx',{
        react,'react/jsx-runtime':runtime,'next/dynamic':{default:()=>()=>null},'next/link':{default:()=>null},'lucide-react':new Proxy({},{get:()=>()=>null}),'@/lib/style-course-demo':{previewDocument},'@/lib/task-practice-shortcuts':{PRACTICE_SHORTCUTS:[]},
    },{localStorage:{getItem(key){assert.equal(key,'knobly_style_draft_v1:css:border-properties');return JSON.stringify(saved);},setItem(){throw Error('A render must not save or overwrite a draft');}}});
    const props={course:'css',title:'Borders',draftId:'border-properties',initial:{html:'<p>Lesson template</p>',css:''},backHref:'/web-design/css'};
    const pending=Playground(props);
    assert.equal(pending.type,'div');
    phase='client';cursor=0;
    const restored=Playground(props);
    assert.equal(restored.props.initial.html,saved.html);
    assert.equal(restored.props.initial.css,saved.css);
    assert.equal(restored.props.storageKey,'knobly_style_draft_v1:css:border-properties');
});

test('HTML/CSS preview composition handles external files and prevents CSS from breaking out of its style element',()=>{
    const html='<!doctype html><html><head><title>Keep me</title><link rel="stylesheet" href="style.css"></head><body><h1>Keep my work</h1></body></html>';
    const result=previewDocument({html,css:'h1 { color:blue; }'},'css');
    assert.match(result,/<title>Keep me<\/title>/);
    assert.match(result,/<h1>Keep my work<\/h1>/);
    assert.ok(result.indexOf('color:blue')<result.indexOf('</head>'));
    assert.ok(!result.includes('href="style.css"'));
    const hostile=previewDocument({html:'<p>Safe host page</p>',css:'</style><script>parent.alert(1)</script>'},'css');
    assert.ok(!hostile.includes('</style><script>'));
    assert.match(hostile,/<p>Safe host page<\/p>/);
});

test('revision questions are unique, have valid answers, and retain source questions after clarification',()=>{
    for(const course of Object.values(data)){
        assert.equal(new Set(course.quiz.map(q=>q.question)).size,course.quiz.length);
        for(const q of course.quiz){assert.equal(q.options.length,4);assert.ok(Number.isInteger(q.correctAnswer)&&q.correctAnswer>=0&&q.correctAnswer<q.options.length);assert.ok(q.explanation.length>30);assert.ok(q.sourceQuestion);}
    }
    const q=data.css.quiz.find(q=>q.sourceQuestion.includes('website responsive'));
    assert.match(q.question,/ready-made framework/);
});
