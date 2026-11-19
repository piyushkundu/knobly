import { NextRequest, NextResponse } from 'next/server';
import { CSS_TASK_IDS, getUnlockedCssTasks, updateCssTaskAccess } from '@/lib/css-task-access';
import { isTaskAdminPassword } from '@/lib/task-admin-password';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
    try {
        return NextResponse.json({ unlockedTasks: await getUnlockedCssTasks() }, { headers });
    } catch {
        return NextResponse.json({ unlockedTasks: [], error: 'Task status is unavailable. Please retry.' }, { status: 503, headers });
    }
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try { body = await request.json(); } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers });
    }
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers });
    const { password, taskId, action } = body as Record<string, unknown>;
    if (!isTaskAdminPassword(password)) return NextResponse.json({ error: 'Incorrect instructor password.' }, { status: 401, headers });
    if (typeof taskId !== 'string' || (taskId !== 'all' && !CSS_TASK_IDS.includes(taskId)) || (action !== 'lock' && action !== 'unlock')) {
        return NextResponse.json({ error: 'Choose a valid task and action.' }, { status: 400, headers });
    }
    try {
        return NextResponse.json({ unlockedTasks: await updateCssTaskAccess(taskId, action), message: action === 'lock' ? 'Tasks locked for students.' : 'Tasks unlocked for students.' }, { headers });
    } catch {
        return NextResponse.json({ error: 'The change could not be saved. Please retry.' }, { status: 503, headers });
    }
}
