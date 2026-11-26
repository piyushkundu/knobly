import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const source=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
function load(file,deps={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(source(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,require:name=>name in deps?deps[name]:require(name),...globals});return exports;}
const suggestions=load('src/lib/css-practice-suggestions.ts');
const evaluator=load('src/lib/style-task-evaluation.ts');
const task=load('src/data/css-display-border-task.ts').displayBorderTask;
const flex=load('src/data/css-flex-border-task.ts').flexBorderTask;

test('real CSS language service suggests properties and values in CSS files and HTML style blocks with correct edit offsets',()=>{
    for(const language of ['css','html'])for(const [input,label] of [['h1 { co| }','color'],['.card { display: in| }','inline-block'],['p { border-style: da| }','dashed'],['p { font-size: | }','large']]) {
        const wrapped=language==='html'?'<html>\n<head>\n<style media="screen and (width > 1px)">\n'+input+'\n</style></head></html>':input;
        const at=wrapped.indexOf('|'),text=wrapped.replace('|','');
        const items=suggestions.cssCompletionItems(text,at,language);
        const item=items.find(item=>item.label===label);assert.ok(item,language+' '+label);
        const edit=item.textEdit;if(edit){const range='range' in edit?edit.range:edit.replace;assert.ok(range.start.line>= (language==='html'?3:0));}
    }
    for(const input of ['<p>co|</p>','<!-- <style>h1{ co| } </style> -->','<script>const x="<style>h1{ co| }</style>";</script>']) {
        assert.equal(suggestions.cssCompletionItems(input.replace('|',''),input.indexOf('|'),'html').length,0);
    }
});

test('CSS providers are restricted to the current editor model and dispose completely when Practice is disabled',()=>{
    const providers=[],listeners=[];let disposed=0,triggers=0;
    const value='<style>h1 { co }</style>',column=value.indexOf('co')+3;
    const model={getValue:()=>value,getLanguageId:()=> 'html',getOffsetAt:()=>column-1,getWordUntilPosition:()=>({startColumn:column-2,endColumn:column,word:'co'})};
    const editor={getModel:()=>model,getPosition:()=>({lineNumber:1,column}),onDidType(fn){listeners.push(fn);return{dispose(){disposed++;}};},trigger(){triggers++;}};
    class Range{constructor(startLineNumber,startColumn,endLineNumber,endColumn){Object.assign(this,{startLineNumber,startColumn,endLineNumber,endColumn});}}
    const defaults=()=>({modeConfiguration:{completionItems:true,hovers:true},setModeConfiguration(value){this.modeConfiguration=value;}});
    const html=defaults(),css=defaults();
    const monaco={Range,languages:{html:{htmlDefaults:html},css:{cssDefaults:css},CompletionItemKind:{Property:9,Color:15,Value:11},CompletionItemInsertTextRule:{InsertAsSnippet:4},registerCompletionItemProvider(language,provider){providers.push({language,...provider});return{dispose(){disposed++;}};}}};
    const stop=suggestions.installCssSuggestions(editor,monaco);
    assert.equal(html.modeConfiguration.completionItems,false);assert.equal(css.modeConfiguration.completionItems,false);
    assert.deepEqual(providers.map(p=>p.language),['css','html']);
    const result=providers[1].provideCompletionItems(model,{lineNumber:1,column});assert.ok(result.suggestions.some(item=>item.label==='color'));
    assert.equal(providers[1].provideCompletionItems({},{}).suggestions.length,0);
    listeners[0]('o');assert.equal(triggers,1);stop();assert.equal(disposed,3);assert.equal(html.modeConfiguration.completionItems,true);assert.equal(css.modeConfiguration.completionItems,true);stop();assert.equal(disposed,3);
});

test('reference projects score consistently, separate and embedded CSS are both reviewed, and comments or unused selectors earn no CSS credit',()=>{
    for(const example of [task,flex]) {
        const result=evaluator.evaluateStyleTask(example,example.solution);assert.equal(result.score,100,example.id);assert.equal(result.missingSkills.length,0);
        assert.deepEqual(evaluator.evaluateStyleTask(example,example.solution),result);
        const embedded={html:example.solution.html.replace('</head>','<style>'+example.solution.css+'</style></head>'),css:''};
        assert.equal(evaluator.evaluateStyleTask(example,embedded).score,100);
    }
    const partial=evaluator.evaluateStyleTask(task,{html:'<h1>Learning Hub</h1>',css:'.does-not-exist { display: inline-block; border: 3px solid blue; width: 220px; height: 260px } /* display: block; */'});
    assert.equal(partial.matchedSkills.length,0);assert.ok(partial.score<40);
    const invalid=evaluator.evaluateStyleTask(task,{html:task.solution.html,css:'.course-card { color: red;'});assert.ok(invalid.syntaxErrors.length);assert.ok(invalid.score<100);
    const fake=evaluator.evaluateStyleTask(task,{html:'<!-- <!doctype html><html><head><title>Fake</title></head><body></body></html> -->',css:'/* display: block; border: solid; */'});assert.equal(fake.score,0);
});

test('submission API validates input, enforces current instructor lock, reads no student account data and never accepts a client score',async()=>{
    let unlocked=true,offline=false,reads=0;
    const api=load('src/app/api/evaluate-style-task/route.ts',{'next/server':{NextResponse:{json(data,init={}){return{data,status:init.status||200,headers:init.headers};}}},'@/lib/style-courses':{getStyleCourse:()=>({tasks:[task]})},'@/lib/css-task-access':{getUnlockedCssTasks:async()=>{reads++;if(offline)throw Error('offline');return unlocked?[task.id]:[];}},'@/lib/style-task-evaluation':evaluator});
    const submit=(body)=>api.POST({text:async()=>JSON.stringify(body)});
    const body={course:'css',taskId:task.id,...task.solution,score:1};
    const good=await submit(body);assert.equal(good.status,200);assert.equal(good.data.evaluation.score,100);assert.equal(good.headers['Cache-Control'],'no-store');
    unlocked=false;assert.equal((await submit(body)).status,403);offline=true;assert.equal((await submit(body)).status,503);offline=false;
    assert.equal((await submit({...body,taskId:'unknown'})).status,404);
    assert.equal((await submit({...body,html:''})).status,400);assert.equal((await submit({...body,css:{}})).status,400);
    assert.equal((await submit({...body,css:'x'.repeat(220_001)})).status,413);
    assert.equal((await api.POST({text:async()=>'{invalid'})).status,400);
    const before=reads;assert.equal((await submit({...body,course:'w3css'})).status,200);assert.equal(reads,before);
});
