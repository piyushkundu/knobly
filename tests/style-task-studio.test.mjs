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
function load(file,deps={},globals={}){const exports={};vm.runInNewContext(ts.transpileModule(source(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:name=>{assert.ok(name in deps,name);return deps[name];},TextEncoder,Uint8Array,DataView,...globals});return exports;}
const basics={'react/jsx-runtime':jsx,'next/link':{default:({children,...props})=>React.createElement('a',props,children)},'lucide-react':new Proxy({},{get:()=>()=>null})};
const workspace=load('src/lib/style-workspace.ts');
const demo=load('src/lib/style-course-demo.ts');
const idle=load('src/lib/style-task-draft.ts');

test('target page opens directly onto the website, instructions are closed, and solutions are never rendered',()=>{
    const View=load('src/components/style-course/StyleTaskView.tsx',{...basics,react:React,'@/components/html/TaskFullscreenPreview':{default:()=>null}}).default;
    const task=load('src/data/css-display-border-task.ts').displayBorderTask;
    const html=renderToStaticMarkup(React.createElement(View,{course:'css',task}));
    assert.match(html,/<iframe[^>]+src="\/style-course\/display-border-lab.html"/);
    assert.match(html,/aria-expanded="false"/);assert.doesNotMatch(html,/<ol|Your checklist|Practice focus/);
    assert.match(html,/\/tasks\/display-border-lab\/compiler/);
    assert.ok(!html.includes(task.solution.css));
    postcss.parse(source('src/components/style-course/style-playground.css'));
});

test('download is a valid two-file ZIP with a linked external stylesheet, exact Unicode content and standard CRC',()=>{
    const draft={html:'<!doctype html><html><head><title>मेरी वेबसाइट</title><link rel="stylesheet" href="./style.css"></head><body><h1>नमस्ते</h1></body></html>',css:'123456789'};
    const zip=workspace.workspaceZip(draft,'css'),view=new DataView(zip.buffer),decoder=new TextDecoder(),files=new Map();
    let at=0;
    while(view.getUint32(at,true)===0x04034b50){
        assert.equal(view.getUint16(at+6,true),0x0800);assert.equal(view.getUint16(at+8,true),0);
        const size=view.getUint32(at+18,true),nameLength=view.getUint16(at+26,true),extra=view.getUint16(at+28,true);
        const name=decoder.decode(zip.slice(at+30,at+30+nameLength)),start=at+30+nameLength+extra;
        files.set(name,decoder.decode(zip.slice(start,start+size)));
        if(name==='style.css')assert.equal(view.getUint32(at+14,true),0xcbf43926);
        at=start+size;
    }
    assert.deepEqual([...files.keys()],['index.html','style.css']);assert.equal(files.get('style.css'),draft.css);
    assert.equal((files.get('index.html').match(/href="style.css"/g)||[]).length,1);
    assert.match(files.get('index.html'),/<h1>नमस्ते<\/h1>/);assert.equal(view.getUint32(at,true),0x02014b50);
    const end=zip.length-22;assert.equal(view.getUint32(end,true),0x06054b50);assert.equal(view.getUint16(end+10,true),2);assert.equal(view.getUint32(end+16,true),at);
    assert.match(workspace.workspaceHtml('<h1>Fragment</h1>','css'),/<link rel="stylesheet" href="style.css">/);
    assert.match(workspace.workspaceHtml('<html><body>Hello</body></html>','w3css'),/w3schools.com\/w3css\/4\/w3.css/);
});

function studio(fetcher,options={}) {
    const cells=[];let cursor=0,session=false;
    let now=options.now||1_000_000;
    const effects=[],intervals=[],timeouts=[],windowEvents=new Map(),documentEvents=new Map();
    const data=new Map([['unrelated-draft','keep me']]);if(options.saved)data.set('knobly_style_draft_v1:css:display-border-lab',JSON.stringify(options.saved));
    const react={...React,useState(init){if(!session)return[typeof init==='function'?init():init,()=>{}];const i=cursor++;if(!(i in cells))cells[i]=typeof init==='function'?init():init;return[cells[i],next=>{cells[i]=typeof next==='function'?next(cells[i]):next;}];},useRef(initial){const i=cursor++;return cells[i]??(cells[i]={current:initial});},useCallback:fn=>fn,useMemo:fn=>fn(),useEffect(){},useSyncExternalStore:()=>null};
    const Editor=()=>null,Tools=()=>null,Fullscreen=()=>null,Result=()=>null;
    react.useSyncExternalStore=()=>options.saved?JSON.stringify(options.saved):null;
    if(options.effects)react.useEffect=fn=>{effects.push(fn);};
    const eventTarget=events=>({addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:(name)=>events.delete(name)});
    const Playground=load('src/components/style-course/StylePlayground.tsx',{...basics,react,'next/dynamic':{default:()=>Editor},'@/components/html/TaskPracticeTools':{default:Tools},'@/components/html/TaskFullscreenPreview':{default:Fullscreen},'@/lib/style-course-demo':demo,'@/lib/style-workspace':workspace,'./StyleSubmissionResult':{default:Result},'@/lib/style-task-draft':idle},{localStorage:{getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)},Date:class extends Date{static now(){return now;}},window:eventTarget(windowEvents),document:{...eventTarget(documentEvents),visibilityState:'visible'},fetch:fetcher,AbortController,setTimeout:options.effects?(fn,ms)=>{timeouts.push({fn,ms});return timeouts.length;}:setTimeout,clearTimeout:options.effects?()=>{}:clearTimeout,setInterval:(fn)=>{intervals.push(fn);return intervals.length;},clearInterval:()=>{}}).default;
    const child=Playground({course:'css',title:'Test task',draftId:'display-border-lab',initial:{html:'',css:''},task:options.lesson?undefined:{id:'display-border-lab',title:'Test task',subtitle:'Build the website',target:'/style-course/display-border-lab.html',steps:[],skills:[]},backHref:'/tasks'});
    session=true;
    return{Editor,Tools,Fullscreen,Result,data,setNow(value){now=value;},flushEffects(){effects.splice(0).forEach(fn=>fn());},interval(){intervals.forEach(fn=>fn());},dispatch(name){(windowEvents.get(name)||documentEvents.get(name))?.();},render(){cursor=0;return child.type(child.props);}};
}
function nodes(tree,predicate){if(!tree||typeof tree!=='object')return[];return[...(predicate(tree)?[tree]:[]),...[tree.props?.children].flat(Infinity).flatMap(child=>nodes(child,predicate))];}
const button=(tree,label)=>nodes(tree,n=>n.type==='button'&&n.props['aria-label']===label)[0];

test('HTML and CSS edits remain separate across modes, run combines both, target comparison and fullscreen follow the selected output',()=>{
    const app=studio();let tree=app.render();
    const editor=()=>nodes(tree,n=>n.type===app.Editor)[0];
    const tools=()=>nodes(tree,n=>n.type===app.Tools)[0];
    assert.equal(tools().props.mode,'exam');assert.equal(editor().props.value,'');
    editor().props.onChange('<h1 class="title">My website</h1>');tree=app.render();
    nodes(tools().props.leading,n=>n.type==='button'&&n.props.children?.[1]==='style.css')[0].props.onClick();tree=app.render();
    assert.equal(editor().props.language,'css');assert.equal(editor().props.value,'');assert.equal(tools().props.language,'css');
    editor().props.onChange('.title { color: purple; }');tree=app.render();
    tools().props.onModeChange('practice');tree=app.render();assert.equal(editor().props.value,'.title { color: purple; }');assert.equal(tools().props.mode,'practice');
    nodes(tree,n=>n.type==='button'&&n.props.className==='sc-studio-run')[0].props.onClick();tree=app.render();
    let frame=nodes(tree,n=>n.type==='iframe'&&n.props.title==='Live CSS preview')[0];
    assert.match(frame.props.srcDoc,/My website/);assert.match(frame.props.srcDoc,/color: purple/);assert.equal(frame.props.sandbox,'allow-scripts allow-forms');
    nodes(tree,n=>n.type==='button'&&n.props['data-view']==='compare')[0].props.onClick();tree=app.render();
    assert.equal(nodes(tree,n=>n.type==='iframe').length,2);
    button(tree,'Open compare fullscreen').props.onClick();tree=app.render();assert.equal(nodes(tree,n=>n.type===app.Fullscreen)[0].props.mode,'compare');
    nodes(tools().props.leading,n=>n.type==='button'&&n.props.children?.[1]==='index.html')[0].props.onClick();tree=app.render();assert.match(editor().props.value,/My website/);
    button(tree,'Editor only').props.onClick();tree=app.render();assert.equal(nodes(tree,n=>n.props?.['aria-label']==='Output workspace')[0].props.hidden,true);
});

test('one-hour task expiry clears HTML, CSS, preview, saved work and only this project’s undo history; Run and Save do not renew the deadline',()=>{
    const app=studio();let tree=app.render();
    const editor=()=>nodes(tree,n=>n.type===app.Editor)[0];
    const tools=()=>nodes(tree,n=>n.type===app.Tools)[0];
    editor().props.onChange('<h1>Old student</h1>');tree=app.render();
    nodes(tools().props.leading,n=>n.type==='button'&&n.props.children?.[1]==='style.css')[0].props.onClick();tree=app.render();editor().props.onChange('h1{color:red}');tree=app.render();
    const resets=[];
    let modelLanguage='css';const model=path=>({uri:{path},getLanguageId:()=> modelLanguage,setValue:value=>resets.push({path,value})});
    const ownHtml=model('/style-course/css/display-border-lab/index.html'),ownCss=model('/style-course/css/display-border-lab/style.css'),foreign=model('/style-course/css/another-task/index.html');
    editor().props.onMount({getModel:()=>ownCss},{editor:{getModels:()=>[ownHtml,ownCss,foreign]}});tree=app.render();
    app.setNow(1_000_000+idle.STYLE_TASK_IDLE_MS-1);tools().props.onSave();tree=app.render();assert.match(editor().props.value,/color:red/);
    assert.equal(JSON.parse(app.data.get('knobly_style_draft_v1:css:display-border-lab')).lastActive,1_000_000);
    app.setNow(1_000_000+idle.STYLE_TASK_IDLE_MS);nodes(tree,n=>n.type==='button'&&n.props.className==='sc-studio-run')[0].props.onClick();tree=app.render();
    assert.equal(editor().props.value,'');assert.equal(app.data.has('knobly_style_draft_v1:css:display-border-lab'),false);assert.equal(resets.length,2);assert.ok(resets.every(item=>item.value===''));assert.equal(app.data.get('unrelated-draft'),'keep me');
    tools().props.onSave();assert.equal(app.data.has('knobly_style_draft_v1:css:display-border-lab'),false,'a late save cannot bring expired code back');
    nodes(tools().props.leading,n=>n.type==='button'&&n.props.children?.[1]==='index.html')[0].props.onClick();tree=app.render();assert.equal(editor().props.value,'');
    modelLanguage='html';
    editor().props.onChange('h1{color:blue}');tree=app.render();assert.equal(editor().props.value,'h1{color:blue}');
});

test('idle interval and returning to a backgrounded tab clear both files without a click, and pagehide never saves expired code again',()=>{
    for(const trigger of ['interval','focus','visibilitychange']) {
        const app=studio(undefined,{effects:true,saved:{html:'<h1>Old</h1>',css:'h1{color:red}',lastActive:1_000_000}});app.render();app.flushEffects();
        app.setNow(1_000_000+idle.STYLE_TASK_IDLE_MS);
        if(trigger==='interval')app.interval();else app.dispatch(trigger);
        const tree=app.render();assert.equal(nodes(tree,n=>n.type===app.Editor)[0].props.value,'',trigger);
        app.dispatch('pagehide');assert.equal(app.data.has('knobly_style_draft_v1:css:display-border-lab'),false,trigger);
        const tools=nodes(tree,n=>n.type===app.Tools)[0];nodes(tools.props.leading,n=>n.type==='button'&&n.props.children?.[1]==='style.css')[0].props.onClick();assert.equal(nodes(app.render(),n=>n.type===app.Editor)[0].props.value,'',trigger);
    }
});

test('expired reloads start empty, old untimestamped drafts get a first hour, active edits extend it, and lesson drafts never expire',()=>{
    const saved={html:'<h1>Saved</h1>',css:'h1{color:red}',lastActive:1_000_000};
    const expired=studio(undefined,{saved,now:1_000_000+idle.STYLE_TASK_IDLE_MS});assert.equal(nodes(expired.render(),n=>n.type===expired.Editor)[0].props.value,'');
    const legacy=studio(undefined,{saved:{html:saved.html,css:saved.css},now:9_000_000});assert.match(nodes(legacy.render(),n=>n.type===legacy.Editor)[0].props.value,/Saved/);
    const app=studio(undefined,{saved});let tree=app.render();app.setNow(1_000_000+idle.STYLE_TASK_IDLE_MS-1);nodes(tree,n=>n.type===app.Editor)[0].props.onChange('<h1>Still working</h1>');tree=app.render();app.setNow(1_000_000+idle.STYLE_TASK_IDLE_MS);nodes(tree,n=>n.type==='button'&&n.props.className==='sc-studio-run')[0].props.onClick();tree=app.render();assert.match(nodes(tree,n=>n.type===app.Editor)[0].props.value,/Still working/);
    const lesson=studio(undefined,{saved,lesson:true,now:99_000_000});assert.match(nodes(lesson.render(),n=>n.type===lesson.Editor)[0].props.value,/Saved/);
    const data=new Map([['key',JSON.stringify({...saved,lastActive:5_000_000})]]);const storage={getItem:key=>data.get(key),removeItem:key=>data.delete(key)};assert.equal(idle.removeStyleDraft(storage,'key',1_000_000),false);assert.equal(data.has('key'),true,'an expired tab must not delete another tab’s newer work');
});

test('Submit sends both current files, prevents repeat clicks, shows the real response and keeps edits on errors',async()=>{
    const calls=[];let resolveReview;
    const evaluation={score:65,grade:'C',breakdown:[],strengths:[],improvements:['Keep practising.']};
    const app=studio((url,options)=>{calls.push({url,...JSON.parse(options.body)});return new Promise(resolve=>{resolveReview=resolve;});});
    let tree=app.render();
    const submit=()=>nodes(tree,n=>n.type==='button'&&n.props.className==='sc-studio-submit')[0];
    const editor=()=>nodes(tree,n=>n.type===app.Editor)[0];
    submit().props.onClick();tree=app.render();assert.equal(calls.length,0);assert.ok(nodes(tree,n=>n.props?.role==='alert').length);
    editor().props.onChange('<h1>My submitted project</h1>');tree=app.render();
    const tools=nodes(tree,n=>n.type===app.Tools)[0];nodes(tools.props.leading,n=>n.type==='button'&&n.props.children?.[1]==='style.css')[0].props.onClick();tree=app.render();editor().props.onChange('h1 { color: blue }');tree=app.render();
    submit().props.onClick();submit().props.onClick();tree=app.render();assert.equal(submit().props.disabled,true);assert.equal(calls.length,1);
    assert.equal(calls[0].url,'/api/evaluate-style-task');assert.equal(calls[0].html,'<h1>My submitted project</h1>');assert.equal(calls[0].css,'h1 { color: blue }');
    editor().props.onChange('h1 { color: green }');tree=app.render();
    resolveReview({ok:true,json:async()=>({evaluation})});await new Promise(setImmediate);tree=app.render();
    const result=nodes(tree,n=>n.type===app.Result)[0];assert.equal(result.props.result.score,65);assert.equal(result.props.changed,true);assert.equal(submit().props.disabled,false);assert.equal(editor().props.value,'h1 { color: green }');
    result.props.onClose();tree=app.render();submit().props.onClick();resolveReview({ok:false,json:async()=>({error:'Try again later'})});await new Promise(setImmediate);tree=app.render();assert.equal(editor().props.value,'h1 { color: green }');assert.ok(nodes(tree,n=>n.props?.role==='alert').length);assert.equal(submit().props.disabled,false);
});
