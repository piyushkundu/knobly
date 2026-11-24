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

function studio() {
    const cells=[];let cursor=0,session=false;
    const react={...React,useState(init){if(!session)return[typeof init==='function'?init():init,()=>{}];const i=cursor++;if(!(i in cells))cells[i]=typeof init==='function'?init():init;return[cells[i],next=>{cells[i]=typeof next==='function'?next(cells[i]):next;}];},useRef(initial){const i=cursor++;return cells[i]??(cells[i]={current:initial});},useCallback:fn=>fn,useMemo:fn=>fn(),useEffect(){},useSyncExternalStore:()=>null};
    const Editor=()=>null,Tools=()=>null,Fullscreen=()=>null;
    const Playground=load('src/components/style-course/StylePlayground.tsx',{...basics,react,'next/dynamic':{default:()=>Editor},'@/components/html/TaskPracticeTools':{default:Tools},'@/components/html/TaskFullscreenPreview':{default:Fullscreen},'@/lib/style-course-demo':demo,'@/lib/style-workspace':workspace},{localStorage:{getItem:()=>null}}).default;
    const child=Playground({course:'css',title:'Test task',draftId:'display-border-lab',initial:{html:'',css:''},task:{id:'display-border-lab',title:'Test task',subtitle:'Build the website',target:'/style-course/display-border-lab.html',steps:[],skills:[]},backHref:'/tasks'});
    session=true;
    return{Editor,Tools,Fullscreen,render(){cursor=0;return child.type(child.props);}};
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
