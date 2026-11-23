import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

const flush = () => new Promise(resolve => setImmediate(resolve));
function harness() {
    const cells=[], pending=[], timers=new Map();let cursor=0,serial=0;
    const slot=initial=>{const i=cursor++;if(!(i in cells))cells[i]=initial();return i;};
    const React={
        useState(initial){const i=slot(()=>typeof initial==='function'?initial():initial);return[cells[i],value=>{cells[i]=typeof value==='function'?value(cells[i]):value;}];},
        useRef(initial){return cells[slot(()=>({current:initial}))];},
        useEffect(fn,deps){const i=slot(()=>({})),old=cells[i];if(!old.deps||deps.some((v,n)=>v!==old.deps[n])){pending.push(()=>{old.cleanup?.();old.cleanup=fn();old.deps=deps;});}},
        useCallback(fn){slot(()=>null);return fn;},
    };
    return {React,timers, render(Component){cursor=0;const tree=Component();pending.splice(0).forEach(fn=>fn());return tree;},
        setTimeout(fn){const id=++serial;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);},
        tick(){const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());}};
}
function load(file,deps,globals={}) {
    const exports={};
    vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,
        {exports,console,Date,Map,Set,Promise,...globals,require:name=>{assert.ok(name in deps,name);return deps[name];}});
    return exports;
}
function nodes(tree){if(Array.isArray(tree))return tree.flatMap(nodes);if(!tree||typeof tree!=='object')return[];return[tree,...nodes(tree.props?.children)];}
const text=tree=>Array.isArray(tree)?tree.map(text).join(''):tree&&typeof tree==='object'?text(tree.props?.children):tree??'';
const icons=new Proxy({},{get:()=>()=>null});

test('practice autosaves the latest answers, resumes its saved index and does not report an older request as Saved',async()=>{
    const h=harness(),calls=[],pendingDrafts=[],user={uid:'student'};
    const session={id:'2026-11-23',kind:'daily',day:'2026-11-23',status:'in_progress',index:1,answers:{},questions:[0,1].map(i=>({id:'q'+i,testId:'t'+i,text:'Question '+i,category:'Web Design',topic:'Forms',options:[{id:'a'+i,text:'A'},{id:'b'+i,text:'B'}]}))};
    const Page=load('src/components/learning/PracticeClient.tsx',{
        react:h.React,'react/jsx-runtime':jsx,'next/navigation':{useRouter:()=>({push:url=>calls.push({url})}),useSearchParams:()=>new URLSearchParams()},
        'next/link':{default:'a'},'lucide-react':icons,'@/context/AuthContext':{useAuth:()=>({user,loading:false})},
        '@/components/auth/LoginModal':{default:()=>null},'@/components/exam/OptionText':{default:()=>null},'./QuestionBookmark':{default:()=>null},
        './learning.module.css':{default:new Proxy({},{get:(_,key)=>key})},'./useLearning':{practiceRequest:async(_,body)=>{calls.push(body);if(body.action==='start')return session;return new Promise(resolve=>pendingDrafts.push(resolve));}},
    },{URLSearchParams,setTimeout:h.setTimeout,clearTimeout:h.clearTimeout,window:{addEventListener(){},removeEventListener(){},confirm:()=>true}}).default;
    h.render(Page);await flush();let tree=h.render(Page);
    assert.ok(text(tree).includes('QUESTION 2 OF 2'),'Saved question position is restored');
    const choices=()=>nodes(tree).filter(n=>n.type==='button'&&n.props.className?.includes('option'));
    choices()[0].props.onClick();tree=h.render(Page);h.tick();await flush();
    assert.equal(calls.at(-1).answers.q1,'a1');
    choices()[1].props.onClick();tree=h.render(Page);
    pendingDrafts.shift()({});await flush();tree=h.render(Page);
    assert.ok(text(tree).includes('Saving…'),'Older save cannot hide the latest pending answer');
    h.tick();await flush();assert.equal(calls.at(-1).answers.q1,'b1');pendingDrafts.shift()({});await flush();tree=h.render(Page);
    assert.ok(nodes(tree).some(n=>n.props?.className==='chip'&&text(n)==='Saved'));
    nodes(tree).find(n=>n.type==='button'&&text(n)==='Clear this answer').props.onClick();tree=h.render(Page);h.tick();await flush();
    assert.equal(Object.keys(calls.at(-1).answers).length,0);pendingDrafts.shift()({});await flush();tree=h.render(Page);
    const leave=nodes(tree).find(n=>n.props?.href==='/dashboard'&&n.props.onClick);let prevented=false;
    const leaving=leave.props.onClick({preventDefault(){prevented=true;}});await flush();assert.equal(prevented,true);assert.ok(!calls.some(c=>c.url));
    pendingDrafts.shift()({});await leaving;assert.equal(calls.at(-1).url,'/dashboard');
});

test('dashboard search, completion and duration filters combine without changing exam statistics',()=>{
    const h=harness(),List=()=>null;
    const testRows=[{id:'a',title:'HTML chapter 1',category:'Web Design',mode:'PRACTICE',duration_minutes:80},{id:'b',title:'Python chapter 2',category:'Python',mode:'PRACTICE',duration_minutes:30}];
    const state={profile:{full_name:'Student'},availableTests:testRows,lockedTests:[],simpleTests:[],attemptHistory:[],allAttempts:[],attemptedTestIds:new Set(['b']),currentRank:{icon:'🥉',name:'Bronze'},nextRank:{name:'Silver'},totalPoints:42,rankProgressPercent:84,pointsToNextRank:8,stats:{testsCompleted:2,avgScore:60,avgAccuracy:60},categories:[],liveTests:[],leaderboard:[{id:'leader',user_id:'other',full_name:'Class Leader',total_xp:650}],getRankForPoints:()=>({name:'Diamond',icon:'💠'}),RANKS:[],isLoadingMain:false};
    const Page=load('src/app/dashboard/page.tsx',{
        react:h.React,'react/jsx-runtime':jsx,'next/link':{default:'a'},'lucide-react':icons,'@/context/AuthContext':{useAuth:()=>({user:{uid:'u'},loading:false,logout(){}})},
        '@/components/auth/LoginModal':{default:()=>null},'./useDashboard':{useDashboard:()=>state},'./DashboardTestList':{default:List},
        '@/components/learning/useLearning':{useLearning:()=>({data:null,error:'',refresh(){}}),practiceRequest(){}},'@/components/learning/ProgressChart':{default:()=>null},
        './dashboard.module.css':{default:new Proxy({},{get:(_,key)=>key})},
    }).default;
    let tree=h.render(Page);
    const list=()=>nodes(tree).find(n=>n.type===List).props;
    assert.equal(list().available.length,2);assert.ok(text(tree).includes('42'));
    const entry=nodes(tree).find(n=>n.props?.position===1);
    assert.equal(entry.props.score,650);assert.equal(entry.props.rank,'Diamond');
    const row=entry.type(entry.props);
    assert.ok(text(row).includes('Class Leader'));assert.ok(text(row).includes('650'));assert.equal(row.props['data-place'],1);
    nodes(tree).find(n=>n.props?.['aria-label']==='Maximum duration').props.onChange({target:{value:'30'}});tree=h.render(Page);assert.equal(list().available[0].id,'b');
    nodes(tree).find(n=>n.props?.['aria-label']==='Attempt status').props.onChange({target:{value:'unattempted'}});tree=h.render(Page);assert.equal(list().available.length,0);
    nodes(tree).find(n=>n.props?.['aria-label']==='Maximum duration').props.onChange({target:{value:'all'}});tree=h.render(Page);assert.equal(list().available[0].id,'a');
    nodes(tree).find(n=>n.props?.['aria-label']==='Search tests').props.onChange({target:{value:'does not exist'}});tree=h.render(Page);assert.equal(list().available.length,0);
    nodes(tree).find(n=>n.props?.['aria-label']==='Clear search').props.onClick();tree=h.render(Page);
    assert.equal(list().available[0].id,'a','Clearing search retains the selected completion filter');
    assert.equal(state.totalPoints,42);assert.equal(state.stats.testsCompleted,2);
});
