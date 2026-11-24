import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import * as crypto from 'node:crypto';
import ts from 'typescript';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import postcss from 'postcss';

const root=new URL('../',import.meta.url);
const source=file=>readFileSync(new URL(file,root),'utf8');
const generated=JSON.parse(source('src/data/style-courses.generated.json'));
function load(file,deps={},globals={}) {
    const exports={};
    const js=ts.transpileModule(source(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
    vm.runInNewContext(js,{exports,require(name){assert.ok(name in deps,name);return deps[name];},...globals});
    return exports;
}
const authored=load('src/data/css-flex-border-task.ts');
const displayAuthored=load('src/data/css-display-border-task.ts');
const courses=load('src/lib/style-courses.ts',{'@/data/style-courses.generated.json':{default:generated},'@/data/css-flex-border-task':authored,'@/data/css-display-border-task':displayAuthored});
const password=load('src/lib/task-admin-password.ts',{'server-only':{},'node:crypto':crypto});
const instructorPassword=source('src/lib/task-admin-password.ts').match(/const taskPassword = '([^']+)'/)[1];
const response={NextResponse:{json(data,init={}){return {data,status:init.status||200,headers:init.headers||{}};}}};
function server() {
    const state={ids:undefined,reads:0,writes:0,failRead:false,failWrite:false};
    const snapshot=()=>({exists:state.ids!==undefined,data:()=>state.ids===undefined?undefined:{unlockedTasks:state.ids}});
    const reference={async get(){state.reads++;if(state.failRead)throw Error('offline');return snapshot();}};
    const db={collection(name){assert.equal(name,'app_settings');return{doc(id){assert.equal(id,'css_tasks');return reference;}};},async runTransaction(fn){return fn({get:async ref=>{assert.equal(ref,reference);return reference.get();},set(ref,value,options){assert.equal(ref,reference);assert.equal(options.merge,true);if(state.failWrite)throw Error('offline');state.writes++;state.ids=value.unlockedTasks;}});}};
    const access=load('src/lib/css-task-access.ts',{'server-only':{},'@/lib/firebase-admin':{getAdminDb:()=>db},'@/lib/style-courses':courses});
    const api=load('src/app/api/css-tasks/route.ts',{'next/server':response,'@/lib/css-task-access':access,'@/lib/task-admin-password':password});
    const post=(body)=>api.POST({json:async()=>body});
    return {state,access,api,post};
}

test('CSS curriculum places priorities directly after selectors and preserves all source lessons and IDs',()=>{
    const before=generated.css.lessons.map(lesson=>lesson.id);
    const after=courses.getStyleCourse('css').lessons.map(lesson=>lesson.id);
    assert.equal(after.indexOf('priorities-of-css'),after.indexOf('css-selectors')+1);
    assert.deepEqual([...after].sort(),[...before].sort());
    assert.deepEqual(generated.css.lessons.map(lesson=>lesson.id),before,'source import stays untouched');
    assert.deepEqual(courses.courseSummary('css').lessons.map(lesson=>lesson.id),after);
    assert.equal(courses.getStyleCourse('w3css'),generated.w3css);
});

test('HTML and CSS instructor actions share one server-only password verifier',()=>{
    assert.equal(password.isTaskAdminPassword(instructorPassword),true);
    assert.equal(password.isTaskAdminPassword(' '+instructorPassword+' '),true);
    for(const value of ['',null,{},'incorrect',instructorPassword+'0'])assert.equal(password.isTaskAdminPassword(value),false);
    assert.match(source('src/app/api/html-tasks/route.ts'),/isTaskAdminPassword\(password\)/);
    assert.match(source('src/app/api/css-tasks/route.ts'),/isTaskAdminPassword\(password\)/);
    assert.match(source('src/lib/task-admin-password.ts'),/import 'server-only'/);
    assert.ok(!source('src/components/style-course/CssTaskManager.tsx').includes(instructorPassword));
});

test('CSS task state starts locked; instructor actions persist only CSS settings and reject invalid requests',async()=>{
    const {state,api,post}=server();
    const initial=await api.GET();
    assert.equal(initial.status,200);assert.equal(initial.data.unlockedTasks.length,0);assert.equal(state.writes,0);
    assert.match(initial.headers['Cache-Control'],/no-store/);
    for(const body of [{password:'wrong',taskId:'all',action:'unlock'},{password:instructorPassword,taskId:'not-a-task',action:'unlock'},{password:instructorPassword,taskId:'all',action:'delete'},null]) {
        const result=await post(body);assert.ok([400,401].includes(result.status));
    }
    assert.equal(state.writes,0);assert.equal(state.reads,1,'bad requests never read task state');
    assert.equal((await api.POST({json:async()=>{throw Error('bad JSON');}})).status,400);
    const first=generated.css.tasks[0].id,second=generated.css.tasks[1].id;
    assert.equal((await post({password:instructorPassword,taskId:first,action:'unlock'})).status,200);
    assert.deepEqual([...state.ids],[first]);
    await post({password:instructorPassword,taskId:second,action:'unlock'});
    assert.deepEqual([...state.ids],[first,second]);
    await post({password:instructorPassword,taskId:first,action:'lock'});
    assert.deepEqual([...state.ids],[second]);
    await post({password:instructorPassword,taskId:'all',action:'unlock'});
    assert.equal(state.ids.length,courses.getStyleCourse('css').tasks.length);
    await post({password:instructorPassword,taskId:'all',action:'lock'});
    assert.equal(state.ids.length,0);
    assert.equal((await api.GET()).data.unlockedTasks.length,0,'a saved empty list stays locked');
});

test('storage errors fail closed and never report an unsuccessful lock change as saved',async()=>{
    const {state,api,post}=server();
    state.ids=[generated.css.tasks[0].id];state.failRead=true;
    const read=await api.GET();assert.equal(read.status,503);assert.equal(read.data.unlockedTasks.length,0);
    assert.equal((await post({password:instructorPassword,taskId:'all',action:'unlock'})).status,503);
    state.failRead=false;state.failWrite=true;
    assert.equal((await post({password:instructorPassword,taskId:'all',action:'lock'})).status,503);
    assert.equal(state.ids.length,1);assert.equal(state.writes,0);
});

const icons=new Proxy({}, {get:()=>()=>null});
const link={default:({children,...props})=>React.createElement('a',props,children)};
function resolve(node) {
    if(Array.isArray(node))return node.map(resolve);
    if(!React.isValidElement(node))return node;
    if(typeof node.type==='function')return resolve(node.type(node.props));
    return React.cloneElement(node,{},...React.Children.toArray(node.props.children).map(resolve));
}
test('direct CSS task and compiler routes hide locked content; unlocked tasks, lessons and W3.CSS keep working',async()=>{
    let unlocked=[],reads=0,offline=false;
    const pages=load('src/components/style-course/StylePages.tsx',{
        'react/jsx-runtime':runtime,'next/link':link,'next/navigation':{notFound(){throw Error('NOT_FOUND');}},'lucide-react':icons,
        '@/lib/style-courses':courses,'@/lib/style-course-demo':{lessonDraft:()=>({html:'lesson-example',css:''})},
        '@/lib/css-task-access':{async getUnlockedCssTasks(){reads++;if(offline)throw Error('offline');return unlocked;}},
        './CourseShell':{default:({children})=>React.createElement('div',{},children)},'./CourseHub':{default:()=>null},'./CourseReader':{default:()=>null},'./LockedNotes':{default:()=>null},'./CourseQuiz':{default:()=>null},
        './CssTaskManager':{default:({lockedTask})=>React.createElement('p',{},'LOCKED '+lockedTask?.id)},
        './StylePlayground':{default:()=>React.createElement('p',{},'COMPILER')},
        './StyleTaskView':load('src/components/style-course/StyleTaskView.tsx',{'react/jsx-runtime':runtime,react:{...React,useState:initial=>[initial,()=>{}]},'next/link':link,'lucide-react':icons,'@/components/html/TaskFullscreenPreview':{default:()=>null}}),
    });
    const task=generated.css.tasks[0], newTask=authored.flexBorderTask;
    const render=async element=>renderToStaticMarkup(resolve(await element));
    for(const example of [task,newTask,displayAuthored.displayBorderTask])for(const method of ['StyleTaskPage','StyleCompilerPage']) {
        const locked=await render(pages[method]({id:'css',taskId:example.id}));
        assert.match(locked,/LOCKED/);assert.ok(!locked.includes('<iframe'));assert.ok(!locked.includes('COMPILER'));assert.ok(!locked.includes(example.solution.html));
    }
    unlocked=[task.id];
    assert.match(await render(pages.StyleTaskPage({id:'css',taskId:task.id})),/<iframe/);
    assert.match(await render(pages.StyleCompilerPage({id:'css',taskId:task.id})),/COMPILER/);
    for(const example of [newTask,displayAuthored.displayBorderTask]) {
        unlocked=[example.id];
        assert.ok((await render(pages.StyleTaskPage({id:'css',taskId:example.id}))).includes(example.target));
        assert.match(await render(pages.StyleCompilerPage({id:'css',taskId:example.id})),/COMPILER/);
    }
    offline=true;
    assert.match(await render(pages.StyleCompilerPage({id:'css',taskId:task.id})),/LOCKED/);
    const previousReads=reads;
    assert.match(await render(pages.StyleCompilerPage({id:'css',lessonId:'css-selectors'})),/COMPILER/);
    assert.match(await render(pages.StyleTaskPage({id:'w3css',taskId:generated.w3css.tasks[0].id})),/<iframe/);
    assert.equal(reads,previousReads);
    await assert.rejects(()=>pages.StyleTaskPage({id:'css',taskId:'missing'}),/NOT_FOUND/);
    assert.match(source('src/app/web-design/css/tasks/[id]/page.tsx'),/force-dynamic/);
    assert.match(source('src/app/web-design/css/tasks/[id]/compiler/page.tsx'),/force-dynamic/);
});

function walk(node,predicate) {
    if(Array.isArray(node))return node.flatMap(child=>walk(child,predicate));
    if(!React.isValidElement(node))return[];
    return[...(predicate(node)?[node]:[]),...walk(node.props.children,predicate)];
}
const text=node=>Array.isArray(node)?node.map(text).join(''):React.isValidElement(node)?text(node.props.children):typeof node==='string'||typeof node==='number'?String(node):'';
test('task cards require a server-confirmed unlock and instructor can unlock one or lock all without storing the password',async()=>{
    const backend=server(),states=[],refs=[],effects=[],listeners=new Map();
    let cursor=0,refCursor=0,refreshes=0;
    const react={...React,useState(initial){const i=cursor++;if(!(i in states))states[i]=initial;return[states[i],value=>states[i]=typeof value==='function'?value(states[i]):value];},useRef(initial){const i=refCursor++;return refs[i]??(refs[i]={current:initial});},useCallback:fn=>fn,useEffect:fn=>effects.push(fn)};
    const Manager=load('src/components/style-course/CssTaskManager.tsx',{
        react,'react/jsx-runtime':runtime,'next/link':link,'next/navigation':{useRouter:()=>({refresh(){refreshes++;}})},'lucide-react':icons,
    },{window:{addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);}},fetch:async(url,options={})=>{assert.equal(url,'/api/css-tasks');const response=options.method==='POST'?await backend.post(JSON.parse(options.body)):await backend.api.GET();return{ok:response.status===200,json:async()=>response.data};},localStorage:{setItem(){throw Error('Password must not be stored');}}}).default;
    const props={tasks:courses.courseSummary('css').tasks};
    const render=()=>{cursor=0;refCursor=0;return resolve(Manager(props));};
    let tree=render();
    effects.splice(0).forEach(fn=>fn());await new Promise(setImmediate);tree=render();
    const taskLinks=value=>walk(value,node=>node.type==='a'&&node.props.href?.includes('/tasks/'));
    assert.equal(taskLinks(tree).length,0);
    const click=label=>walk(tree,node=>node.type==='button'&&text(node)===label)[0].props.onClick();
    click('Instructor controls');tree=render();
    const setPassword=value=>{walk(tree,node=>node.type==='input'&&node.props.type==='password')[0].props.onChange({target:{value}});tree=render();};
    setPassword('wrong');await walk(tree,node=>node.type==='form')[0].props.onSubmit({preventDefault(){}});tree=render();
    assert.match(text(tree),/Incorrect instructor password/);assert.equal(taskLinks(tree).length,0);
    const selectors=walk(tree,node=>node.type==='select');
    selectors[0].props.onChange({target:{value:props.tasks[0].id}});tree=render();setPassword(instructorPassword);
    await walk(tree,node=>node.type==='form')[0].props.onSubmit({preventDefault(){}});tree=render();
    assert.equal(taskLinks(tree).length,2);assert.equal(refreshes,1);
    assert.equal(walk(tree,node=>node.type==='input'&&node.props.type==='password')[0].props.value,'');
    backend.state.failRead=true;listeners.get('focus')();await new Promise(setImmediate);tree=render();
    assert.equal(taskLinks(tree).length,0,'a failed refresh rejects previously unlocked client state');
    backend.state.failRead=false;listeners.get('focus')();await new Promise(setImmediate);tree=render();
    assert.equal(taskLinks(tree).length,2);
    click('Instructor controls');tree=render();
    walk(tree,node=>node.type==='select')[1].props.onChange({target:{value:'lock'}});tree=render();setPassword(instructorPassword);
    await walk(tree,node=>node.type==='form')[0].props.onSubmit({preventDefault(){}});tree=render();
    assert.equal(taskLinks(tree).length,0);assert.equal(backend.state.ids.length,0);
    assert.doesNotThrow(()=>postcss.parse(source('src/components/style-course/css-task-access.css')));
});
