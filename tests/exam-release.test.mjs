import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,setTimeout,clearTimeout,Map,Promise,Error});return exports;}
const {createExamAnswerSync}=load('src/lib/exam-answer-sync.ts');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('earlier slow selections cannot overwrite a newer selection or clear; flush waits for every queued response',async()=>{
    const writes=[],releases=[];const sync=createExamAnswerSync(async(id,answer)=>{writes.push({id,...answer});await new Promise(resolve=>releases.push(resolve));},()=>{});
    sync.queue('question',{option_id:'a',short_answer:null});
    sync.queue('question',{option_id:'b',short_answer:null});
    sync.queue('question',{option_id:null,short_answer:null});
    let complete=false;const flush=sync.flush().then(()=>complete=true);
    assert.equal(writes.length,1);assert.equal(complete,false);
    releases.shift()();await tick();assert.equal(writes.length,2);assert.equal(writes[1].option_id,null);
    releases.shift()();await flush;assert.equal(complete,true);sync.dispose();
});
test('written answers coalesce and are flushed before submission, while failed responses remain retryable',async()=>{
    const writes=[],states=[];let fail=true;
    const sync=createExamAnswerSync(async(id,answer)=>{if(fail){fail=false;throw Error('Offline');}writes.push({id,...answer});},(state,error)=>states.push({state,error}));
    sync.queue('short',{option_id:null,short_answer:'first'},500);
    sync.queue('short',{option_id:null,short_answer:'उत्तर / latest'},500);
    await assert.rejects(sync.flush(),/Offline/);assert.equal(states.at(-1).state,'error');
    await sync.flush();assert.equal(writes.length,1);assert.equal(writes[0].short_answer,'उत्तर / latest');assert.equal(states.at(-1).state,'saved');sync.dispose();
});
test('disposing an exam cancels queued saves and ignores a late acknowledgement',async()=>{
    let release,states=0;const sync=createExamAnswerSync(async()=>new Promise(resolve=>release=resolve),()=>states++);
    sync.queue('question',{option_id:'a',short_answer:null});sync.dispose();const before=states;release();await tick();assert.equal(states,before);
});

function operation(name,globals){const text=read('src/app/test/[id]/page.tsx'),tree=ts.createSourceFile('exam.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let found;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(tree)===name)found=node.initializer;ts.forEachChild(node,visit);}visit(tree);assert.ok(found,name);const exports={};vm.runInNewContext(ts.transpileModule('export const run='+found.getText(tree),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Error,...globals});return exports.run;}
function submission({flush=async()=>{},write=async()=>{},retake=false}={}) {
    const result={value:null,error:'',finished:false},writes=[],refs={finishedRef:{current:false},submittingRef:{current:false}};
    let reads=0;
    const run=operation('finalizeSubmit',{...refs,examFinished:false,attempt:{id:'attempt'},testData:{id:'test',xp_reward:100},user:{uid:'student'},
        responsesRef:{current:{q1:{option_id:'right',short_answer:null}}},questions:[{id:'q1',exam_options:[{id:'right',is_correct:true}]},{id:'q2',exam_options:[]}],
        getAnswerWriter:()=>({flush}),setSubmitting:()=>{},setSubmitError:value=>result.error=value,
        setExamFinished:value=>result.finished=value,setResultData:value=>result.value=value,isOptionCorrect:value=>value===true,
        db:{},doc:(_db,collection,id)=>({collection,id}),updateDoc:async(ref,data)=>{await write();writes.push({ref,data});},
        collection:(_db,name)=>name,where:(...args)=>args,query:(...args)=>args,
        getDocs:async()=>++reads===1?{docs:retake?[{id:'earlier'}]:[{id:'attempt'}]}:{empty:false,docs:[{ref:{collection:'exam_user_state',id:'state'},data:()=>({total_points:650,total_xp:650})}]},
        isFullscreenAny:()=>false,exitFullscreenAny:async()=>{},
    });return {run,result,writes,refs};
}
test('submission waits for the latest saves, retains existing first-attempt points and ignores repeat submits',async()=>{
    let release;const s=submission({flush:async()=>new Promise(resolve=>release=resolve)});
    const pending=s.run();await s.run();assert.equal(s.writes.length,0);assert.equal(s.result.finished,false);
    release();await pending;assert.equal(s.result.value.score,1);assert.equal(s.result.value.pointsEarned,50);assert.equal(s.result.finished,true);
    assert.equal(s.writes[0].ref.collection,'exam_attempts');assert.equal(s.writes[1].data.total_points,700);assert.equal(s.writes[1].data.total_xp,700);
    await s.run();assert.equal(s.writes.length,2);
});
test('save or submission failures keep the exam open; retakes retain existing scoring without another points award',async()=>{
    const failed=submission({flush:async()=>{throw Error('Not saved');}});await failed.run();assert.equal(failed.result.finished,false);assert.equal(failed.result.error,'Not saved');assert.equal(failed.writes.length,0);
    const failedWrite=submission({write:async()=>{throw Error('Try again');}});await failedWrite.run();assert.equal(failedWrite.result.finished,false);assert.equal(failedWrite.result.value,null);
    const retake=submission({retake:true});await retake.run();assert.equal(retake.result.value.score,1);assert.equal(retake.writes.length,1);
});
test('the release retains the production resume, translations and remote bookmark paths; UI labels stay English',()=>{
    const page=read('src/app/test/[id]/page.tsx'),workspace=read('src/components/exam/ExamWorkspace.tsx');
    assert.match(page,/practiceResume\(savedAttempt\.data\(\)/);assert.match(page,/deadlineRef\.current = resumeAttempt\.deadline/);
    assert.match(page,/question_order: questions\.map/);assert.match(page,/htmlOptionHindi\(testId,option\.option_text\)/);
    assert.match(page,/<QuestionBookmark questionId=\{questions\[currentIndex\]\.id\} compact/);
    assert.doesNotMatch(workspace,/[\u0900-\u097f]/u);assert.match(workspace,/<ExamText text=\{option\.option_text\}/);
});
