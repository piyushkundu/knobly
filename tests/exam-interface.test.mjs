import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
function load(file,deps={}){const exports={};vm.runInNewContext(ts.transpileModule(source(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{exports,require:name=>name in deps?deps[name]:require(name)});return exports;}
const presentation=load('src/lib/exam-presentation.ts');
const questions=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}],answers={a:{option_id:'one',short_answer:null},b:{option_id:null,short_answer:'   '},c:{option_id:null,short_answer:'written'}};

test('summary and filtered palette agree for written, selected, cleared and review answers; review may overlap answered',()=>{
    const review=new Set(['a','b','foreign']);
    assert.deepEqual({...presentation.examSummary(questions,answers,review)},{total:4,answered:2,unanswered:2,review:2});
    assert.equal(presentation.filteredQuestions(questions,answers,review,'review').map(x=>x.question.id).join(','),'a,b');
    assert.equal(presentation.filteredQuestions(questions,answers,review,'unanswered').map(x=>x.index).join(','),'1,3');
    assert.equal(presentation.filteredQuestions(questions,answers,review,'all').length,4);
    assert.equal(presentation.hasExamAnswer({option_id:null,short_answer:'\n\t'}),false);
});
test('bilingual prose separates both language orders without splitting code, CSS or HTML pipes',()=>{
    for(const input of ['प्रश्न क्या है? | What is the question?','What is the question? | प्रश्न क्या है?','प्रश्न क्या है?\nWhat is the question?']) {
        assert.deepEqual({...presentation.bilingualParts(input)},{hi:'प्रश्न क्या है?',en:'What is the question?'});
    }
    for(const input of ['a | b','<input value="a | b">','border-style: solid | dashed','प्रश्न\nWhat prints?\nprint(1 | 2)'])assert.equal(presentation.bilingualParts(input),null);
});
test('language-only views retain untranslated technical content and render HTML as text',()=>{
    const text=load('src/components/exam/ExamText.tsx',{'@/lib/exam-presentation':presentation,'./ExamWorkspace.module.css':new Proxy({},{get:(_,key)=>key})}).default;
    const {renderToStaticMarkup}=require('react-dom/server');
    const render=(value,language)=>renderToStaticMarkup(require('react').createElement(text,{text:value,language}));
    assert.ok(render('हिंदी | English','hi').includes('हिंदी'));assert.ok(!render('हिंदी | English','hi').includes('English'));
    assert.ok(!render('हिंदी | English','en').includes('हिंदी'));assert.ok(render('हिंदी | English','en').includes('English'));
    assert.ok(render('<h1>','hi').includes('&lt;h1&gt;'));assert.ok(!render('<h1>','hi').includes('<h1>'));
    assert.ok(render('print(1 | 2)','en').includes('print(1 | 2)'));
});
test('shortcuts ignore typing, dialogs, repeated events and browser modifiers; timer alerts change at 10 and 5 minutes',()=>{
    assert.equal(presentation.examShortcut({key:'4'},false,false).index,3);
    assert.equal(presentation.examShortcut({key:'ArrowRight'},false,false).action,'next');
    assert.equal(presentation.examShortcut({key:'R'},false,false).action,'review');
    for(const event of [{key:'n',ctrlKey:true},{key:'1',altKey:true},{key:'r',metaKey:true},{key:'n',repeat:true},{key:'N',shiftKey:true}])assert.equal(presentation.examShortcut(event,false,false),null);
    assert.equal(presentation.examShortcut({key:'1'},true,false),null);assert.equal(presentation.examShortcut({key:'n'},false,true),null);
    assert.equal(presentation.timerLevel(601),'normal');assert.equal(presentation.timerLevel(600),'soon');assert.equal(presentation.timerLevel(301),'soon');assert.equal(presentation.timerLevel(300),'urgent');
});

test('preview uses the shared workspace, is development-only and has no exam service or database writes',()=>{
    const route=source('src/app/test-preview/page.tsx'),preview=source('src/components/exam/ExamLocalPreview.tsx');
    assert.match(route,/process\.env\.NODE_ENV !== 'development'.*notFound/);
    assert.match(preview,/<ExamWorkspace/);assert.doesNotMatch(preview,/firebase|exam-client|fetch\(/);
});
