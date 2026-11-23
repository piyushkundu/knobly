import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';

function load(file,deps={}) {
    const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,
        {exports,Math,Number,require:name=>{assert.ok(name in deps,name);return deps[name];}});return exports;
}
const pure=load('src/lib/progress-chart.ts');
const deps={react:React,'react/jsx-runtime':jsx,'@/lib/progress-chart':pure,'./progress-chart.module.css':{default:new Proxy({},{get:(_,key)=>key})}};
const entries=[{label:'First test',value:0},{label:'Second test',value:54},{label:'Latest test',value:8}];
const nodes=tree=>Array.isArray(tree)?tree.flatMap(nodes):tree&&typeof tree==='object'?[tree,...nodes(tree.props?.children)]:[];
const text=tree=>Array.isArray(tree)?tree.map(text).join(''):tree&&typeof tree==='object'?text(tree.props?.children):tree??'';
test('chart plots real zero and full scores, rejects invalid values and does not invent an earlier attempt for one score',()=>{
    const input=[...entries,{label:'Invalid',value:NaN},{label:'Out of range',value:105}];
    const series=pure.scoreTrend(input);
    assert.equal(series.points.length,3);assert.equal(series.best,54);assert.equal(Math.round(series.average),21);
    assert.equal(series.points[0].y,series.bottom);assert.equal(pure.scoreTrend([{label:'Perfect',value:100}]).points[0].y,24);
    assert.ok(series.points.every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)));
    assert.equal(pure.scoreTrend([{label:'Only attempt',value:20}]).points.length,1);
    assert.equal(pure.scoreTrend([{label:'Only attempt',value:20}]).area,'');
    assert.equal(pure.scoreTrend([]).points.length,0);assert.equal(entries[0].value,0);
});
test('touch, focus and keyboard selection reveal the actual test and score',()=>{
    let state=null;
    const Chart=load('src/components/learning/ProgressChart.tsx',{...deps,react:{useId:()=> 'chart',useState:()=>[state,value=>{state=value;}]}}).default;
    let tree=Chart({entries});const readout=()=>nodes(tree).find(node=>node.props?.className==='readout');
    assert.ok(text(readout()).includes('Latest test'));assert.ok(text(readout()).includes('8'));
    let buttons=nodes(tree).filter(node=>node.props?.role==='button');assert.equal(buttons.length,3);
    buttons[1].props.onFocus();tree=Chart({entries});assert.ok(text(readout()).includes('Second test'));assert.ok(text(readout()).includes('54'));
    buttons=nodes(tree).filter(node=>node.props?.role==='button');let prevented=false;
    buttons[0].props.onKeyDown({key:' ',preventDefault(){prevented=true;}});tree=Chart({entries});
    assert.equal(prevented,true);assert.ok(text(readout()).includes('First test'));assert.equal(nodes(tree).find(node=>node.props?.role==='button').props['aria-pressed'],true);
    nodes(tree).filter(node=>node.props?.role==='button')[2].props.onClick();tree=Chart({entries});assert.ok(text(readout()).includes('Latest test'));
    assert.ok(text(Chart({entries:[]})).includes('Complete a test'));
});
test('multiple server-rendered charts have distinct gradient IDs and escaped labels',()=>{
    const Chart=load('src/components/learning/ProgressChart.tsx',deps).default;
    const html=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(Chart,{entries}),React.createElement(Chart,{entries:[{label:'<script>test</script>',value:50}]})));
    const ids=[...html.matchAll(/id="([^"]+)-fill"/g)].map(match=>match[1]);assert.equal(new Set(ids).size,2);
    assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
});
