import { NextResponse } from 'next/server';
import { getStyleCourse } from '@/lib/style-courses';
import { getUnlockedCssTasks } from '@/lib/css-task-access';
import { evaluateStyleTask } from '@/lib/style-task-evaluation';

export async function POST(request: Request) {
    let input;
    try {
        const text=await request.text();
        if(text.length>220_000)return NextResponse.json({error:'Your project is too large. Keep HTML and CSS under 200,000 characters together.'},{status:413});
        input=JSON.parse(text);
    } catch { return NextResponse.json({error:'Send a valid HTML and CSS project.'},{status:400}); }
    if(!input||!['css','w3css'].includes(input.course)||typeof input.taskId!=='string'||typeof input.html!=='string'||typeof input.css!=='string')return NextResponse.json({error:'Course, task ID, HTML and CSS are required.'},{status:400});
    if(input.html.length+input.css.length>200_000)return NextResponse.json({error:'Keep HTML and CSS under 200,000 characters together.'},{status:413});
    if(!input.html.trim())return NextResponse.json({error:'Pehle apna HTML code likhein, phir Submit karein.'},{status:400});
    const course=getStyleCourse(input.course),task=course.tasks.find(item=>item.id===input.taskId);
    if(!task)return NextResponse.json({error:'Task not found.'},{status:404});
    if(input.course==='css') {
        try { if(!(await getUnlockedCssTasks()).includes(task.id))return NextResponse.json({error:'This task is locked by your instructor.'},{status:403}); }
        catch { return NextResponse.json({error:'Task status could not be checked. Please try again.'},{status:503}); }
    }
    try {
        return NextResponse.json({success:true,taskId:task.id,evaluation:evaluateStyleTask(task,{html:input.html,css:input.css})},{headers:{'Cache-Control':'no-store'}});
    } catch { return NextResponse.json({error:'Your code could not be reviewed. Keep your draft and try again.'},{status:500}); }
}
