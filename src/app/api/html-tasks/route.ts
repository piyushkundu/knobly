import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_PASSWORD = '85338533';
const DATA_FILE = path.join(process.cwd(), 'data', 'html-tasks-state.json');

const ALL_TASK_IDS = ['1', '2', '3', '4', '5', '5.1', '5.2', '5.3', '5.4', '6', '7', '8', '9', '10', '11'];

// Ensure the data directory and file exist
function ensureDataFile() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        // Initially all tasks are locked (empty unlockedTasks array)
        fs.writeFileSync(DATA_FILE, JSON.stringify({ unlockedTasks: [] }, null, 2), 'utf-8');
    }
}

function readState(): { unlockedTasks: string[] } {
    ensureDataFile();
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { unlockedTasks: Array.isArray(parsed.unlockedTasks) ? parsed.unlockedTasks : [] };
    } catch {
        return { unlockedTasks: [] };
    }
}

function writeState(state: { unlockedTasks: string[] }) {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// GET: Return list of unlocked tasks
export async function GET() {
    try {
        const state = readState();
        return NextResponse.json({ 
            success: true, 
            unlockedTasks: state.unlockedTasks 
        });
    } catch (err) {
        console.error('[HTML Tasks API] GET error:', err);
        return NextResponse.json({ success: true, unlockedTasks: [] });
    }
}

// POST: Unlock or lock task(s) - verified with server-side password only
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { password, taskId, action } = body;

        // Verify password strictly on server side
        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Galat Password! (Incorrect admin password)' }, { status: 401 });
        }

        const state = readState();

        if (taskId === 'all') {
            if (action === 'lock') {
                state.unlockedTasks = [];
            } else {
                state.unlockedTasks = [...ALL_TASK_IDS];
            }
        } else if (taskId) {
            const idStr = String(taskId);
            if (action === 'lock') {
                state.unlockedTasks = state.unlockedTasks.filter(id => id !== idStr);
            } else {
                if (!state.unlockedTasks.includes(idStr)) {
                    state.unlockedTasks.push(idStr);
                }
            }
        } else {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        writeState(state);

        return NextResponse.json({
            success: true,
            unlockedTasks: state.unlockedTasks,
            message: action === 'lock' 
                ? (taskId === 'all' ? 'All tasks locked successfully' : `Task ${taskId} locked`)
                : (taskId === 'all' ? 'All tasks unlocked successfully' : `Task ${taskId} unlocked`)
        });
    } catch (err) {
        console.error('[HTML Tasks API] POST error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
