import type { ExamAnswers } from '@/types/exam';

type Answer = ExamAnswers[string];
type SyncStatus = 'saving'|'saved'|'error';

// Keep the existing per-question response documents. Serialize writes so a slow
// earlier choice cannot overwrite a newer answer or a cleared answer.
export function createExamAnswerSync(write:(id:string,answer:Answer)=>Promise<void>,notify:(status:SyncStatus,error?:string)=>void) {
    const pending=new Map<string,{answer:Answer;version:number}>();
    let revision=0,closed=false,running:Promise<void>|null=null,timer:ReturnType<typeof setTimeout>|undefined;
    const drain=async()=>{
        while(!closed&&pending.size) {
            const [id,entry]=pending.entries().next().value!;
            try { await write(id,entry.answer); }
            catch(error) { if(!closed)notify('error',error instanceof Error?error.message:'Your answers could not be saved. Please retry.');throw error; }
            if(pending.get(id)?.version===entry.version)pending.delete(id);
        }
        if(!closed)notify('saved');
    };
    const start=()=>{
        if(!running)running=drain().finally(()=>{running=null;});
        return running;
    };
    return {
        queue(id:string,answer:Answer,delay=0) {
            if(closed)return;
            pending.set(id,{answer:{...answer},version:++revision});notify('saving');
            clearTimeout(timer);
            if(delay)timer=setTimeout(()=>{void start().catch(()=>{});},delay);
            else void start().catch(()=>{});
        },
        async flush() {
            if(closed)return;
            clearTimeout(timer);
            if(pending.size)notify('saving');
            do {await start();}while(!closed&&pending.size);
        },
        dispose() {closed=true;clearTimeout(timer);pending.clear();},
    };
}
