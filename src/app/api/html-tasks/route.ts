import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

const ADMIN_PASSWORD = '85338533';
const ALL_TASK_IDS = ['1', '2', '3', '4', '5', '5.1', '5.2', '5.3', '5.4', '6', '7', '8', '9', '10', '11'];

// Persistent in-memory cache across requests within the same lambda/process
let memoryUnlockedTasks: string[] = [];
let hasInitializedMemory = false;

// Filesystem locations (local repo & serverless /tmp)
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'html-tasks-state.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'html-tasks-state.json');

function tryReadFile(filePath: string): string[] | null {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.unlockedTasks)) {
                return parsed.unlockedTasks;
            }
        }
    } catch (e) {
        // Ignore read errors
    }
    return null;
}

function tryWriteFile(filePath: string, state: { unlockedTasks: string[] }): boolean {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
        return true;
    } catch (e) {
        // File system might be read-only on Vercel/serverless
        return false;
    }
}

function getUnlockedTasks(req?: NextRequest): string[] {
    // 1. Check in-memory if already loaded
    if (hasInitializedMemory && memoryUnlockedTasks.length > 0) {
        return memoryUnlockedTasks;
    }

    // 2. Try reading from cookie if request is available
    if (req) {
        const cookie = req.cookies.get('knobly_unlocked_tasks');
        if (cookie?.value) {
            try {
                const parsed = JSON.parse(decodeURIComponent(cookie.value));
                if (Array.isArray(parsed) && parsed.length > 0) {
                    memoryUnlockedTasks = parsed;
                    hasInitializedMemory = true;
                    return memoryUnlockedTasks;
                }
            } catch (e) {}
        }
    }

    // 3. Try reading from local data file (dev) or /tmp (Vercel)
    const local = tryReadFile(LOCAL_DATA_FILE);
    if (local !== null) {
        memoryUnlockedTasks = local;
        hasInitializedMemory = true;
        return memoryUnlockedTasks;
    }

    const tmp = tryReadFile(TMP_DATA_FILE);
    if (tmp !== null) {
        memoryUnlockedTasks = tmp;
        hasInitializedMemory = true;
        return memoryUnlockedTasks;
    }

    hasInitializedMemory = true;
    return memoryUnlockedTasks;
}

function persistUnlockedTasks(tasks: string[]) {
    memoryUnlockedTasks = tasks;
    hasInitializedMemory = true;

    const payload = { unlockedTasks: tasks };
    // Try local file first (local development)
    const localSaved = tryWriteFile(LOCAL_DATA_FILE, payload);
    // Also try /tmp (works in serverless environments like Vercel)
    if (!localSaved) {
        tryWriteFile(TMP_DATA_FILE, payload);
    }
}

// GET: Return list of unlocked tasks
export async function GET(req: NextRequest) {
    try {
        const unlocked = getUnlockedTasks(req);
        const res = NextResponse.json({ 
            success: true, 
            unlockedTasks: unlocked 
        });

        // Sync cookie
        if (unlocked.length > 0) {
            res.cookies.set('knobly_unlocked_tasks', encodeURIComponent(JSON.stringify(unlocked)), {
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
                sameSite: 'lax',
            });
        }
        return res;
    } catch (err) {
        console.error('[HTML Tasks API] GET error:', err);
        return NextResponse.json({ success: true, unlockedTasks: memoryUnlockedTasks });
    }
}

// POST: Unlock or lock task(s) - verified with server-side password only
export async function POST(req: NextRequest) {
    try {
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 });
        }

        const { password, taskId, action } = body;

        // Verify password strictly on server side
        if (String(password).trim() !== ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Galat Password! (Incorrect admin password)' }, { status: 401 });
        }

        let currentUnlocked = [...getUnlockedTasks(req)];

        if (taskId === 'all') {
            if (action === 'lock') {
                currentUnlocked = [];
            } else {
                currentUnlocked = [...ALL_TASK_IDS];
            }
        } else if (taskId !== undefined && taskId !== null) {
            const idStr = String(taskId).trim();
            if (action === 'lock') {
                currentUnlocked = currentUnlocked.filter(id => id !== idStr);
            } else {
                if (!currentUnlocked.includes(idStr)) {
                    currentUnlocked.push(idStr);
                }
            }
        } else {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        // Save in-memory, /tmp, and local file (safe, never throws 500)
        persistUnlockedTasks(currentUnlocked);

        const res = NextResponse.json({
            success: true,
            unlockedTasks: currentUnlocked,
            message: action === 'lock' 
                ? (taskId === 'all' ? 'All tasks locked successfully' : `Task ${taskId} locked`)
                : (taskId === 'all' ? 'All tasks unlocked successfully' : `Task ${taskId} unlocked`)
        });

        // Set persistent cookie on the client response
        res.cookies.set('knobly_unlocked_tasks', encodeURIComponent(JSON.stringify(currentUnlocked)), {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        });

        return res;
    } catch (err) {
        console.error('[HTML Tasks API] POST error:', err);
        // Fallback: even if unexpected error happens, if password was checked, return current state
        return NextResponse.json({ 
            success: true, 
            unlockedTasks: memoryUnlockedTasks,
            message: 'Updated' 
        });
    }
}
