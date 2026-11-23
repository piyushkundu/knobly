import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { htmlExam } from '../content/exams/html-olevel-test-1.mjs';
const source = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
function load(file, deps = {}, extra = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(source(file), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX}}).outputText,
        {exports, Date, Set, Map, JSON, require(name) {assert.ok(name in deps, name); return deps[name];}, console: {error() {}}, ...extra});
    return exports;
}
const pure = load('src/lib/learning-practice.ts');
const resume = load('src/lib/practice-resume.ts');
const question = (id, testId = 't1') => ({id, testId, testTitle: 'Test ' + testId, category: 'General', topic: 'Topic',
    text: 'Question ' + id, options: [{id: id + 'a', text: 'A'}, {id: id + 'b', text: 'B'}], correctOptionId: id + 'a'});
test('Daily 10 covers all eligible active tests, prioritises frequent mistakes, never duplicates and stays deterministic', () => {
    const pool = Array.from({length: 60}, (_, i) => question('q' + i, 't' + (i % 6)));
    const progress = {q0: {seen: 10, wrong: 8, correct: 2, lastSeen: '2026-11-20'}, q6: {seen: 5, wrong: 3, correct: 2, lastSeen: '2026-11-20'}};
    const result = pure.chooseDailyQuestions(pool, progress, 'uid:2026-11-23');
    assert.equal(result.length, 10); assert.equal(new Set(result.map(q => q.id)).size, 10);
    assert.equal(new Set(result.map(q => q.testId)).size, 6);
    assert.ok(result.some(q => q.id === 'q0' && q.reason.startsWith('Revision')));
    assert.ok(result.some(q => q.id === 'q6' && q.reason.startsWith('Revision')));
    assert.deepEqual(result, pure.chooseDailyQuestions(pool, progress, 'uid:2026-11-23'));
    assert.notDeepEqual(result.map(q => q.id), pure.chooseDailyQuestions(pool, progress, 'uid:2026-11-24').map(q => q.id));
    assert.equal(pool[0].reason, undefined);
    assert.equal(pure.chooseDailyQuestions(pool.slice(0,3), {}, 'seed').length, 3);
    const tenTests = Array.from({length: 50}, (_, i) => question('ten' + i, 't' + (i % 10)));
    const sameSubjectErrors = Object.fromEntries([0,10,20,30].map((n,i) => ['ten'+n,{seen:10,wrong:9-i,correct:1+i,lastSeen:'2026-11-20'}]));
    const mixed = pure.chooseDailyQuestions(tenTests, sameSubjectErrors, 'uid:2026-11-23');
    assert.equal(new Set(mixed.map(q => q.testId)).size,10,'Revision must leave room for every active test');
    assert.ok(mixed.some(q => q.id==='ten0'),'Most frequently missed question stays included');
});
test('India dates, Monday weeks and streaks handle midnight and missed days', () => {
    assert.equal(pure.indiaDay(Date.parse('2026-11-23T18:29:59Z')), '2026-11-23');
    assert.equal(pure.indiaDay(Date.parse('2026-11-23T18:30:00Z')), '2026-11-24');
    assert.equal(pure.weekOf('2026-11-29'), '2026-11-23');
    assert.equal(pure.currentStreak(['2026-11-22','2026-11-21'], '2026-11-23'), 2);
    assert.equal(pure.currentStreak(['2026-11-20'], '2026-11-23'), 0);
});
test('answers are server-validated and keys/explanations are revealed only after completion', () => {
    const session = {id:'s', questions:[{...question('q'),explanation:'Secret rationale'}], answers:{}, status:'in_progress'};
    assert.ok(!JSON.stringify(pure.publicSession(session)).includes('correctOptionId'));
    assert.ok(!JSON.stringify(pure.publicSession(session)).includes('Secret rationale'));
    for(const bad of [null, [], {q:'foreign'}, {foreign:'qa'}])assert.throws(()=>pure.validateAnswers(session,bad));
    assert.equal(pure.gradeSession(session,{q:'qa'}),1);
    assert.equal(pure.gradeSession(session,{q:'qb'}),0);
    assert.equal(pure.publicSession({...session,status:'completed'}).questions[0].correctOptionId,'qa');
});
test('resume accepts only the owner’s unfinished, unexpired practice, without resetting its clock', () => {
    const now = Date.parse('2026-11-23T10:15:00Z'), exam={id:'t',mode:'PRACTICE',duration_minutes:30};
    const attempt={user_id:'u',test_id:'t',status:'IN_PROGRESS',started_at:'2026-11-23T10:00:00Z',question_order:['b','a']};
    assert.equal(resume.practiceResume(attempt,'u',exam,now).seconds,900);
    assert.deepEqual([...resume.practiceResume(attempt,'u',exam,now).order],['b','a']);
    assert.equal(resume.practiceResume(attempt,'another',exam,now),null);
    assert.equal(resume.practiceResume(attempt,'u',{...exam,mode:'LIVE'},now),null);
    assert.equal(resume.practiceResume({...attempt,status:'SUBMITTED'},'u',exam,now),null);
    assert.equal(resume.practiceResume(attempt,'u',exam,now+900000),null);
});

function database() {
    const records = new Map(), writes = [], reads = [];
    const snap = path => ({id:path.split('/').at(-1),exists:records.has(path),data:()=>structuredClone(records.get(path)),ref:reference(path)});
    function reference(path) {return {path,id:path.split('/').at(-1),collection:name=>collection(path+'/'+name),get:async()=>{reads.push(path);return snap(path);},set:async(data,options)=>write(path,data,options)};}
    function write(path,data,options) {
        assert.match(path,/^practice_(users|weeks)\//,'Never write legacy exams, users, points or answers');
        writes.push(path);
        const previous=records.get(path)||{}, value=options?.merge?{...previous,...structuredClone(data)}:structuredClone(data);
        for(const [key,item] of Object.entries(value))if(item?.transform==='union')value[key]=[...new Set([...(previous[key]||[]),...item.values])];else if(item?.transform==='remove')value[key]=(previous[key]||[]).filter(v=>!item.values.includes(v));
        records.set(path,value);
    }
    function collection(path, filters=[], ordering=null, max=Infinity) {return {
        doc:id=>reference(path+'/'+id),
        where:(field,op,value)=>collection(path,[...filters,[field,op,value]],ordering,max),
        orderBy:(field,direction)=>collection(path,filters,[field,direction],max),
        limit:value=>collection(path,filters,ordering,value),
        get:async()=>{
            reads.push(path);
            let docs=[...records.keys()].filter(key=>key.startsWith(path+'/')&&key.slice(path.length+1).indexOf('/')===-1).map(snap);
            docs=docs.filter(doc=>filters.every(([field,op,value])=>op==='in'?value.includes(doc.data()[field]):doc.data()[field]===value));
            if(ordering)docs.sort((a,b)=>{const av=a.data()[ordering[0]],bv=b.data()[ordering[0]];return (av>bv?1:av<bv?-1:0)*(ordering[1]==='desc'?-1:1);});
            return {docs:docs.slice(0,max)};
        },
    };}
    let queue=Promise.resolve();
    const db={collection,runTransaction(fn){const work=queue.then(async()=>{
        const changes=[];const value=await fn({get:async ref=>ref.get(),set:(ref,data,options)=>changes.push(()=>write(ref.path,data,options)),update:(ref,data)=>changes.push(()=>write(ref.path,data,{merge:true})),create:(ref,data)=>changes.push(()=>{assert.ok(!records.has(ref.path));write(ref.path,data);})});changes.forEach(commit=>commit());return value;
    });queue=work.catch(()=>{});return work;}};
    return {db,records,writes,reads};
}
function backend() {
    const state=database(), cache=new Map();let serial=0, authCalls=0;
    const service=load('src/lib/learning-practice-server.ts',{
        'server-only':{},'next/cache':{unstable_cache:(fn,keys)=>async(...args)=>{const key=JSON.stringify([keys,args]);if(!cache.has(key))cache.set(key,fn(...args));return cache.get(key);}},
        'node:crypto':{randomUUID:()=>String(++serial)},'firebase-admin/firestore':{FieldValue:{arrayUnion:(...values)=>({transform:'union',values}),arrayRemove:(...values)=>({transform:'remove',values})}},
        '@/lib/firebase-admin':{getAdminDb:()=>state.db},'../../content/exams/html-olevel-test-1.mjs':{htmlExam},'./learning-practice':pure,
    });
    const api=load('src/app/api/practice/route.ts',{'next/server':{NextResponse:{json:(data,options)=>({data,status:options.status,headers:options.headers})}},
        '@/lib/firebase-admin':{getAdminAuth:()=>({verifyIdToken:async token=>{authCalls++;if(token!=='valid')throw Error('invalid');return{uid:'u1',name:'Student One'};}})},'@/lib/learning-practice-server':service});
    for(let t=0;t<6;t++){
        state.records.set('exam_tests/t'+t,{title:'Test '+t,is_active:true,category:t===0?'Web Design':'IT TOOLS',mode:t===5?'LIVE':'PRACTICE'});
        for(let i=0;i<10;i++){
            const id='q'+t+'_'+i;state.records.set('exam_questions/'+id,{test_id:'t'+t,question_text:'Question '+id,question_type:'MCQ'});
            state.records.set('exam_options/'+id+'a',{question_id:id,option_text:'Correct',is_correct:true});
            state.records.set('exam_options/'+id+'b',{question_id:id,option_text:'Wrong',is_correct:false});
        }
    }
    state.records.set('exam_tests/hidden',{title:'Hidden test',is_active:false});
    state.records.set('exam_questions/hidden',{test_id:'hidden',question_text:'Hidden',question_type:'MCQ'});
    const request=body=>({headers:{get:name=>name==='authorization'?'Bearer valid':null},text:async()=>JSON.stringify(body)});
    return {...state,service,api,request,get authCalls(){return authCalls;}};
}
test('API denies unsigned requests before reading any database data',async()=>{
    const b=backend(), req={headers:{get:()=>null},text:async()=>JSON.stringify({action:'start',kind:'daily',uid:'u2'})};
    assert.equal((await b.api.GET(req)).status,401);assert.equal((await b.api.POST(req)).status,401);
    assert.equal(b.reads.length,0);assert.equal(b.writes.length,0);
});
test('Daily 10 uses all active test modes, freezes its snapshot, incrementally learns personal mistakes and caches the shared pool',async()=>{
    const b=backend();
    b.records.set('exam_attempts/own',{user_id:'u1',test_id:'t0',status:'SUBMITTED',submitted_at:'2026-11-20T10:00:00Z'});
    b.records.set('exam_responses/own',{attempt_id:'own',question_id:'q0_0',option_id:'q0_0b'});
    b.records.set('exam_attempts/other',{user_id:'u2',test_id:'t1',status:'SUBMITTED'});
    b.records.set('exam_responses/other',{attempt_id:'other',question_id:'q1_0',option_id:'q1_0b'});
    const before=structuredClone([...b.records.entries()]);
    const result=await b.api.POST(b.request({action:'start',kind:'daily',uid:'u2'}));
    assert.equal(result.status,200);const session=result.data;
    assert.equal(session.questions.length,10);assert.equal(new Set(session.questions.map(q=>q.testId)).size,6);
    assert.ok(!session.questions.some(q=>q.testId==='hidden'));
    assert.ok(session.questions.some(q=>q.id==='q0_0'&&q.reason.startsWith('Revision')));
    assert.ok(session.questions.every(q=>q.correctOptionId===undefined));
    assert.equal(b.records.get('practice_users/u1').questionProgress.q0_0.wrong,1);
    assert.equal(b.records.get('practice_users/u1').questionProgress.q1_0,undefined);
    const optionReads=b.reads.filter(path=>path==='exam_options').length;
    const again=await b.service.startPractice('u1','daily');
    assert.deepEqual(JSON.parse(JSON.stringify(again)),JSON.parse(JSON.stringify(session)));
    await b.service.questionPool();assert.equal(b.reads.filter(path=>path==='exam_options').length,optionReads);
    await b.service.syncExamLearning('u1',(await b.service.questionPool()).pool);
    assert.equal(b.records.get('practice_users/u1').questionProgress.q0_0.wrong,1,'never count an analysed attempt twice');
    assert.deepEqual([...b.records.entries()].filter(([path])=>!path.startsWith('practice_')),before);
});
test('saving and concurrent submission preserve answers, grade on server, count the league once and isolate each user',async()=>{
    const b=backend(),session=await b.service.startPractice('u1','daily'), stored=b.records.get('practice_users/u1/sessions/'+session.id);
    const answers=Object.fromEntries(stored.questions.map(q=>[q.id,q.correctOptionId]));
    await b.service.updatePractice('u1',session.id,answers,4,false,'Student');
    assert.equal((await b.service.startPractice('u1','daily')).index,4);
    await assert.rejects(()=>b.service.updatePractice('u2',session.id,answers,4,true,'Other'),/not found/);
    await assert.rejects(()=>b.service.updatePractice('u1',session.id,{foreign:'answer'},0,true,'Student'),/Invalid/);
    const results=await Promise.all([b.service.updatePractice('u1',session.id,answers,4,true,'Student'),b.service.updatePractice('u1',session.id,answers,4,true,'Student')]);
    assert.equal(results[0].score,10);assert.equal(results[1].score,10);
    const week=b.records.get('practice_weeks/'+pure.weekOf(pure.indiaDay())+'/entries/u1');
    assert.equal(week.score,10);assert.equal(week.days.length,1);
    assert.equal(b.records.get('practice_users/u1').questionProgress[stored.questions[0].id].seen,1);
    const after=await b.service.updatePractice('u1',session.id,{},0,false,'Student');
    assert.equal(after.score,10,'late drafts cannot overwrite a completed result');
    assert.ok(b.writes.every(path=>path.startsWith('practice_users/')||path.startsWith('practice_weeks/')));
});
test('bookmarks and goals are user scoped, validated and do not rewrite original question IDs',async()=>{
    const b=backend();
    await b.service.setLearningPreference('u1',{action:'bookmark',questionId:'q0_0',saved:true});
    await b.service.setLearningPreference('u1',{action:'goal',weeklyGoal:5});
    const result=await b.service.startPractice('u1','bookmarks');assert.equal(result.questions[0].id,'q0_0');
    assert.equal(b.records.get('practice_users/u1').weeklyGoal,5);
    assert.equal(b.records.get('practice_users/u2'),undefined);
    await assert.rejects(()=>b.service.setLearningPreference('u1',{action:'goal',weeklyGoal:999}),/Choose/);
    await b.service.setLearningPreference('u1',{action:'bookmark',questionId:'q0_0',saved:false});
    assert.equal(b.records.get('practice_users/u1').bookmarks.length,0);
    assert.ok(b.records.has('exam_options/q0_0a'));
});
test('large answer histories are fully analysed before the daily selection is frozen',async()=>{
    const b=backend();
    for(let i=0;i<35;i++){
        b.records.set('exam_attempts/a'+i,{user_id:'u1',test_id:'t0',status:'SUBMITTED',submitted_at:'2026-11-20T10:00:00Z'});
        b.records.set('exam_responses/a'+i,{attempt_id:'a'+i,question_id:'q0_0',option_id:'q0_0b'});
    }
    const first=await b.service.startPractice('u1','daily');
    assert.equal(first.preparing,true);assert.equal(first.remaining,5);
    assert.equal(b.records.has('practice_users/u1/sessions/'+pure.indiaDay()),false);
    const result=await b.service.startPractice('u1','daily');
    assert.equal(result.questions.length,10);assert.equal(b.records.get('practice_users/u1').questionProgress.q0_0.wrong,35);
    assert.ok(result.questions.some(q=>q.id==='q0_0'&&q.reason.startsWith('Revision')));
});
