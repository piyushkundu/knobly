import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';

function load(file,deps={},globals={}) {
    const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,
        {exports,Date,Math,Number,...globals,require:name=>{assert.ok(name in deps,name);return deps[name];}});return exports;
}
const pure=load('src/lib/dashboard-highlights.ts');
const deps={react:React,'react/jsx-runtime':jsx,'lucide-react':new Proxy({},{get:()=>()=>null}),'@/lib/dashboard-highlights':pure,'./dashboard.module.css':{default:new Proxy({},{get:(_,name)=>name})}};
test('India greetings cross morning, afternoon and evening boundaries without reading the clock during initial render',()=>{
    assert.equal(pure.dashboardGreeting(Date.parse('2026-11-23T00:30:00Z')).label,'Good morning');
    assert.equal(pure.dashboardGreeting(Date.parse('2026-11-23T06:30:00Z')).label,'Good afternoon');
    assert.equal(pure.dashboardGreeting(Date.parse('2026-11-23T12:30:00Z')).period,'night');
    assert.equal(pure.dashboardGreeting(Date.parse('2026-11-23T14:00:00Z')).label,'Good evening');
    const {DashboardGreeting}=load('src/app/dashboard/DashboardHighlights.tsx',deps,{Date:{now(){throw Error('Clock read during initial render');}}});
    assert.match(renderToStaticMarkup(React.createElement(DashboardGreeting,{name:'Student'})),/Welcome back.*Student/);
});
test('daily rings show real answered counts, including skipped questions and smaller pools; loading stays indeterminate',()=>{
    assert.equal(pure.dailyAnswerProgress({answered:4,total:10,status:'in_progress'}).percent,40);
    assert.equal(pure.dailyAnswerProgress({answered:2,total:5,status:'in_progress'}).percent,40);
    assert.equal(pure.dailyAnswerProgress({answered:8,total:10,status:'completed'}).percent,80);
    assert.equal(pure.dailyAnswerProgress({answered:12,total:10,status:'in_progress'}).answered,10);
    assert.equal(pure.dailyAnswerProgress({answered:NaN,total:0,status:'in_progress'}).answered,0);
    const {DailyProgress}=load('src/app/dashboard/DashboardHighlights.tsx',deps);
    const complete=renderToStaticMarkup(React.createElement(DailyProgress,{daily:{id:'day',answered:8,total:10,status:'completed'},userId:'u',day:'2026-11-23'}));
    assert.match(complete,/aria-valuenow="8"/);assert.match(complete,/Today’s practice complete/);
    const pending=renderToStaticMarkup(React.createElement(DailyProgress,{daily:undefined,userId:'u'}));
    assert.match(pending,/aria-busy="true"/);assert.ok(!pending.includes('aria-valuenow'));
});
test('score changes compare only the latest completed test with its own earlier comparable attempt',()=>{
    const row=(id,test_id,score,date,total_marks=50)=>({id,test_id,score,total_marks,test_title:test_id,status:'SUBMITTED',submitted_at:date});
    const history=[row('old','html',10,'2026-11-20'),row('latest','html',14,'2026-11-23'),row('unrelated','python',45,'2026-11-22')], before=JSON.stringify(history);
    assert.equal(pure.latestScoreComparison(history).change,8);assert.equal(JSON.stringify(history),before);
    assert.equal(pure.latestScoreComparison([history[1],history[2]]),null,'No comparison across subjects');
    assert.equal(pure.latestScoreComparison([history[1],{...history[0],total_marks:100}]),null,'Changed denominator is not comparable');
    assert.equal(pure.latestScoreComparison([{...history[1],status:'IN_PROGRESS'},history[0]]),null);
    assert.equal(pure.latestScoreComparison([history[0],{...history[1],score:5}]).change,-10);
    assert.equal(pure.testSubjectAppearance('Web Design').kind,'web');assert.equal(pure.testSubjectAppearance('Python').kind,'python');
    assert.notEqual(pure.testSubjectAppearance('CCC').accent,pure.testSubjectAppearance('IT TOOLS').accent);
});
test('completion celebration happens once per user and day, and respects reduced motion',()=>{
    const storage=new Map(),timers=new Map();let serial=0;
    const drain=delay=>{for(const [id,timer] of [...timers])if(timer.delay===delay){timers.delete(id);timer.fn();}};
    function mount(reduced=false){let state=null,effect;const {DailyProgress}=load('src/app/dashboard/DashboardHighlights.tsx',{
        ...deps,react:{useState:()=>[state,v=>{state=v;}],useEffect:fn=>{effect=fn;}},
    },{localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},window:{matchMedia:()=>({matches:reduced})},setTimeout:(fn,delay)=>{timers.set(++serial,{fn,delay});return serial;},clearTimeout:id=>timers.delete(id)});
        const props={daily:{id:'2026-11-23',answered:10,total:10,status:'completed'},userId:'u1',day:'2026-11-23'};
        return {render:extra=>DailyProgress({...props,...extra}),effect:()=>effect()};}
    const first=mount();first.render();first.effect();drain(0);assert.equal(first.render().props['data-celebrate'],true);
    drain(1800);assert.equal(first.render().props['data-celebrate'],undefined);
    const again=mount();again.render();again.effect();drain(0);assert.equal(again.render().props['data-celebrate'],undefined);
    const another=mount();another.render({userId:'u2'});another.effect();drain(0);assert.equal(another.render({userId:'u2'}).props['data-celebrate'],true);
    const quiet=mount(true);quiet.render({userId:'u3'});quiet.effect();drain(0);assert.equal(quiet.render({userId:'u3'}).props['data-celebrate'],undefined);
    const strict=mount();strict.render({userId:'u4'});strict.effect()();strict.render({userId:'u4'});strict.effect();drain(0);
    assert.equal(strict.render({userId:'u4'}).props['data-celebrate'],true,'Effect replay does not swallow the celebration');
});
