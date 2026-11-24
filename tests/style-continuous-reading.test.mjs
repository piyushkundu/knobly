import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import postcss from 'postcss';

const root=new URL('../',import.meta.url);
const data=JSON.parse(readFileSync(new URL('src/data/style-courses.generated.json',root),'utf8'));
const icons=new Proxy({}, {get:()=>()=>null});
const link={default:({children,...props})=>React.createElement('a',props,children)};
function load(file,deps={},globals={}) {
    const exports={};
    const source=ts.transpileModule(readFileSync(new URL(file,root),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2023,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext(source,{exports,require(name){assert.ok(name in deps,name);return deps[name];},...globals});
    return exports;
}
const reading=load('src/lib/style-course-reading.ts');
const examples=load('src/lib/css-foundation-examples.ts');
const demo=load('src/lib/style-course-demo.ts');
const basic={react:React,'react/jsx-runtime':runtime,'next/link':link,'lucide-react':icons};
const progress={default:()=>React.createElement('button',{},'Mark lesson complete'),useCourseProgress:()=>({completed:[]})};
const inlineTasks=load('src/components/style-course/LessonTaskCard.tsx',basic);
const Locked=load('src/components/style-course/LockedNotes.tsx',basic).default;
const Foundation=load('src/components/style-course/FoundationLesson.tsx',{...basic,'@/lib/css-foundation-examples':examples}).default;
const Reader=load('src/components/style-course/LessonReader.tsx',{
    ...basic,'next/image':{default:({unoptimized,...props})=>React.createElement('img',props)},
    './CourseProgress':progress,'@/lib/style-course-demo':demo,'./VisualLessonLab':{default:()=>null},
    './FoundationLesson':{default:Foundation},'./LockedNotes':{default:Locked},
}).default;

function walk(node,predicate) {
    if(Array.isArray(node))return node.flatMap(child=>walk(child,predicate));
    if(!React.isValidElement(node))return [];
    return [...(predicate(node)?[node]:[]),...walk(node.props.children,predicate)];
}
const text=node=>Array.isArray(node)?node.map(text).join(''):React.isValidElement(node)?text(node.props.children):typeof node==='string'||typeof node==='number'?String(node):'';
const hasClass=name=>node=>node.props.className?.split(' ').includes(name);
function interactive(file,deps={}) {
    const states=[];let cursor=0;
    const react={...React,useState(initial){const index=cursor++;if(!(index in states))states[index]=typeof initial==='function'?initial():initial;return [states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value;}];}};
    const Component=load(file,{...basic,react,...deps}).default;
    const resolve=node=>Array.isArray(node)?node.map(resolve):!React.isValidElement(node)?node:typeof node.type==='function'?resolve(node.type(node.props)):React.cloneElement(node,{},resolve(node.props.children));
    return props=>{cursor=0;return resolve(Component(props));};
}
const button=(tree,label)=>walk(tree,node=>node.type==='button'&&text(node)===label)[0];

test('all CSS and W3.CSS chapters share one document with unique anchors and no next-page gate',()=>{
    for(const [id,source] of Object.entries(data)) {
        const course={...source,id};
        const Component=load('src/components/style-course/CourseReader.tsx',{
            ...basic,'@/lib/style-course-reading':reading,'./CourseProgress':progress,'./LessonReader':{default:Reader},'./LessonTaskCard':inlineTasks,
        }).default;
        const html=renderToStaticMarkup(React.createElement(Component,{course,initialId:course.lessons[0].id,chapters:course.lessons.map(lesson=>({lesson,demo:demo.lessonDraft(id,lesson)}))}));
        assert.equal((html.match(/<article\b/g)||[]).length,course.lessons.length);
        assert.equal((html.match(/<main\b/g)||[]).length,1);
        assert.equal((html.match(/aria-label="Chapter navigation"/g)||[]).length,1);
        assert.equal((html.match(/KEEP SCROLLING/g)||[]).length,course.lessons.length-1);
        assert.ok(!html.includes('Next chapter'));
        const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
        assert.equal(ids.length,new Set(ids).size,id+' duplicate IDs');
        for(const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]),'Missing anchor '+match[1]);
        for(const lesson of course.lessons)assert.ok(ids.includes('chapter-'+lesson.id));
        assert.ok(!html.includes('drive.google.com'));
        assert.match(html,/Notes · Coming Soon/);
    }
});

test('reading position stays in a long chapter, crosses boundaries in both directions, and rejects unrelated routes',()=>{
    assert.equal(reading.activeReadingChapter([]),undefined);
    const positions=[{id:'one',top:-1800,bottom:139},{id:'two',top:139,bottom:3000},{id:'three',top:3000,bottom:6000}];
    assert.equal(reading.activeReadingChapter(positions),'two');
    positions[1].top=141;
    assert.equal(reading.activeReadingChapter(positions),'one');
    positions[0].top=300;
    assert.equal(reading.activeReadingChapter(positions),'one');
    const ids=['one','two'];
    assert.equal(reading.courseChapterFromPath('/web-design/css/learn/two','css',ids),'two');
    for(const path of ['/web-design/w3css/learn/two','/web-design/css/compiler','/web-design/css/learn/nope','/web-design/css/learn/two/extra'])assert.equal(reading.courseChapterFromPath(path,'css',ids),undefined);
});

test('scroll events update the active chapter and URL without reload or completion, preserve deep links and clean up',()=>{
    const states=[],refs=[],effects=[],listeners=new Map(),frames=new Map(),changes=[];
    let cursor=0,refCursor=0,frameId=0,disconnects=0;
    const react={...React,useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return[states[i],value=>states[i]=typeof value==='function'?value(states[i]):value];},useRef(initial){const i=refCursor++;return refs[i]??(refs[i]={current:initial});},useEffect(fn){effects.push(fn);}};
    const location={pathname:'/web-design/css/learn/two',search:'?reader=1',hash:'#two-reference'};
    const window={location,history:{state:{existing:true},replaceState(state,_,url){changes.push({state,url});location.pathname=url.split('?')[0];location.hash='';}},addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name,fn){assert.equal(listeners.get(name),fn);listeners.delete(name);},matchMedia:()=>({matches:true})};
    const target={scrollIntoView:options=>assert.equal(options.behavior,'instant')};
    const Component=load('src/components/style-course/CourseReader.tsx',{
        ...basic,react,'@/lib/style-course-reading':reading,'./CourseProgress':progress,'./LessonReader':{default:()=>null},'./LessonTaskCard':inlineTasks,
    },{window,document:{getElementById:id=>id==='two-reference'?target:null},requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),ResizeObserver:class{observe(){} disconnect(){disconnects++;}}}).default;
    const chapters=['one','two','three'].map((id,index)=>({lesson:{id,title:id,group:'Basics'},demo:{html:'',css:''}}));
    const props={course:{id:'css',name:'CSS',lessons:chapters.map(item=>item.lesson),tasks:[]},chapters,initialId:'two'};
    const render=()=>{cursor=0;refCursor=0;return Component(props);};
    let tree=render();
    const sectionObjects=chapters.map(({lesson},i)=>({top:(i-1)*3000,scrolls:[],getBoundingClientRect(){return{top:this.top,bottom:this.top+3000};},scrollIntoView(options){this.scrolls.push(options);},contains:node=>lesson.id==='two'&&node===target,parentElement:{}}));
    walk(tree,node=>node.type==='article').forEach((node,i)=>node.props.ref(sectionObjects[i]));
    const cleanups=effects.splice(0).map(fn=>fn());
    const flush=()=>{for(const[id,fn]of [...frames]){frames.delete(id);fn();}};
    flush();
    assert.equal(changes.length,0);
    assert.equal(states[0],'two');
    sectionObjects[2].top=140;
    listeners.get('scroll')();listeners.get('scroll')();
    assert.equal(frames.size,1,'scroll work is batched');
    flush();
    assert.equal(states[0],'three');
    assert.equal(changes[0].url,'/web-design/css/learn/three?reader=1');
    assert.equal(changes[0].state.existing,true);
    tree=render();
    assert.equal(walk(tree,node=>node.props['aria-current']==='page')[0].props.href,'/web-design/css/learn/three');
    const first=walk(tree,node=>node.type==='a'&&node.props.href==='/web-design/css/learn/one')[0];
    let prevented=0;
    first.props.onClick({button:0,ctrlKey:true,preventDefault(){prevented++;}});
    assert.equal(prevented,0);
    first.props.onClick({button:0,preventDefault(){prevented++;}});
    assert.equal(prevented,1);
    assert.equal(sectionObjects[0].scrolls[0].behavior,'instant');
    sectionObjects[2].top=200;
    listeners.get('scroll')();flush();
    assert.equal(states[0],'two');
    location.pathname='/web-design/css/learn/one';listeners.get('popstate')();
    assert.equal(states[0],'one');
    assert.equal(sectionObjects[0].scrolls.length,2);
    listeners.get('resize')();
    for(const cleanup of cleanups)cleanup?.();
    assert.equal(listeners.size,0);assert.equal(frames.size,0);assert.equal(disconnects,1);
});

test('foundation interactions explain CSS styling, timeline milestones, insertion methods and selector relationships',()=>{
    const create=()=>interactive('src/components/style-course/FoundationLesson.tsx',{'@/lib/css-foundation-examples':examples});
    let render=create(),props={lesson:'what-is-css'},tree=render(props);
    assert.equal(walk(tree,hasClass('is-styled')).length,0);
    button(tree,'CSS OFF').props.onClick();tree=render(props);
    assert.equal(walk(tree,hasClass('is-styled')).length,1);
    render=create();props={lesson:'evolution-of-css'};tree=render(props);
    walk(tree,hasClass('fy-history-timeline'))[0].props.children[4].props.onClick();tree=render(props);
    assert.match(text(walk(tree,hasClass('fy-history-detail'))),/7 June 2011/);
    assert.match(text(tree),/modules/);
    render=create();props={lesson:'three-ways-to-insert-css'};tree=render(props);
    button(tree,'03External').props.onClick();tree=render(props);
    assert.match(text(tree),/rel="stylesheet" href="styles.css"/);
    assert.match(text(tree),/CSS file mein <style> tag nahi/);
    render=create();props={lesson:'css-selectors'};tree=render(props);
    const choose=selector=>{
        walk(tree,hasClass('fy-selector-list'))[0].props.children.find(node=>text(node.props.children[0])===selector).props.onClick();tree=render(props);
        return walk(tree,hasClass('is-match')).length;
    };
    assert.equal(choose('.card p'),2);assert.equal(choose('.card > p'),1);
    assert.equal(choose('.card + p'),1);assert.equal(choose('.card ~ p'),2);
    assert.equal(choose('[type]'),2);assert.equal(choose('[type="email"]'),1);
    assert.equal(choose('li:nth-child(even)'),1);assert.equal(choose('.note.highlight'),1);
    assert.equal(choose('a:hover'),0);
    const exampleLink=value=>walk(value,node=>node.type==='a'&&text(node)==='Hover / focus this link')[0];
    exampleLink(tree).props.onFocus();tree=render(props);
    assert.equal(walk(tree,hasClass('is-match')).length,0,'focus does not imply hover');
    exampleLink(tree).props.onMouseEnter();tree=render(props);
    assert.equal(walk(tree,hasClass('is-match')).length,1);
    exampleLink(tree).props.onMouseLeave();tree=render(props);
    assert.equal(walk(tree,hasClass('is-match')).length,0);
    assert.equal(choose('a:focus'),0);
    exampleLink(tree).props.onFocus();tree=render(props);
    assert.equal(walk(tree,hasClass('is-match')).length,1);
    exampleLink(tree).props.onBlur();tree=render(props);
    assert.equal(walk(tree,hasClass('is-match')).length,0);
});

test('cascade compares importance, specificity and source order without mutating the teaching rules',()=>{
    const rules=[{id:'id',enabled:true,specificity:[0,1,0,0],order:1},{id:'class',enabled:true,specificity:[0,0,1,0],order:2},{id:'inline',enabled:true,specificity:[1,0,0,0],order:3}];
    assert.equal(examples.winningTeachingRule(rules).id,'inline');
    assert.equal(examples.winningTeachingRule(rules.map(rule=>({...rule,important:rule.id==='class'}))).id,'class');
    assert.equal(examples.winningTeachingRule([...rules,{...rules[0],id:'later',order:4}].filter(rule=>rule.id!=='inline')).id,'later');
    assert.equal(examples.winningTeachingRule(rules.map(rule=>({...rule,enabled:false}))),undefined);
    assert.equal(rules[0].id,'id');
});

test('handwritten notes are visibly locked with no PDF action and foundation styles parse',()=>{
    const html=renderToStaticMarkup(React.createElement(Locked,{full:true}));
    assert.match(html,/<h1>Handwritten Notes<\/h1>/);assert.match(html,/Coming Soon/);assert.match(html,/<button[^>]+disabled/);assert.ok(!html.includes('href='));
    assert.doesNotThrow(()=>postcss.parse(readFileSync(new URL('src/components/style-course/style-foundations.css',root),'utf8')));
});
