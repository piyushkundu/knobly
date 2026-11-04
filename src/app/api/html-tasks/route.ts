import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getAdminDb } from '@/lib/firebase-admin';

// Force dynamic — serverless function must always execute live and not be statically cached
export const dynamic = 'force-dynamic';

const ADMIN_PASSWORD = '85338533';
const ALL_TASK_IDS = ['1', '2', '3', '4', '5', '5.0', '5.1', '5.2', '5.3', '5.4', '6', '7', '8', '9', '10', '11', 'test-1'];

// Persistent in-memory cache across requests within the same warm lambda
let memoryUnlockedTasks: string[] | null = null;

// Filesystem locations (local repo & serverless /tmp)
const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'html-tasks-state.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'html-tasks-state.json');

function tryReadFile(filePath: string): string[] | null {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.unlockedTasks)) {
                return parsed.unlockedTasks.map(String);
            }
        }
    } catch {
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
    } catch {
        return false;
    }
}

/**
 * Read unlocked tasks from Firestore (Cloud Database - Permanent across Vercel deployments & restarts)
 */
async function fetchUnlockedTasksFromFirestore(): Promise<string[] | null> {
    try {
        const db = getAdminDb();
        const docRef = db.collection('app_settings').doc('html_tasks');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            if (Array.isArray(data?.unlockedTasks)) {
                return data.unlockedTasks.map(String);
            }
        }
    } catch (err) {
        console.warn('[HTML Tasks API] Firestore read fallback:', err);
    }
    return null;
}

/**
 * Persist unlocked tasks to Firestore (Permanent Cloud DB)
 */
async function saveUnlockedTasksToFirestore(tasks: string[]): Promise<boolean> {
    try {
        const db = getAdminDb();
        const docRef = db.collection('app_settings').doc('html_tasks');
        await docRef.set({
            unlockedTasks: tasks,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (err) {
        console.error('[HTML Tasks API] Firestore write error:', err);
        return false;
    }
}

/**
 * Retrieve unlocked tasks using a multi-layer strategy:
 * 1. Firestore (Cloud Database - Single Source of Truth, permanent)
 * 2. In-memory cache
 * 3. Client cookie (if request provided)
 * 4. Local file / /tmp
 */
async function getUnlockedTasks(req?: NextRequest): Promise<string[]> {
    // 1. Try reading from Firestore first (guarantees cross-instance consistency on Vercel)
    const firestoreTasks = await fetchUnlockedTasksFromFirestore();
    if (firestoreTasks !== null) {
        memoryUnlockedTasks = firestoreTasks;
        // Also sync local file & /tmp as backup
        tryWriteFile(LOCAL_DATA_FILE, { unlockedTasks: firestoreTasks });
        tryWriteFile(TMP_DATA_FILE, { unlockedTasks: firestoreTasks });
        return firestoreTasks;
    }

    // 2. In-memory warm cache
    if (memoryUnlockedTasks !== null && memoryUnlockedTasks.length > 0) {
        return memoryUnlockedTasks;
    }

    // 3. Try reading from cookie if present in request
    if (req) {
        const cookie = req.cookies.get('knobly_unlocked_tasks');
        if (cookie?.value) {
            try {
                const parsed = JSON.parse(decodeURIComponent(cookie.value));
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const cookieTasks = parsed.map(String);
                    memoryUnlockedTasks = cookieTasks;
                    return cookieTasks;
                }
            } catch {}
        }
    }

    // 4. Try reading from local data file (dev) or /tmp (Vercel)
    const local = tryReadFile(LOCAL_DATA_FILE);
    if (local !== null) {
        memoryUnlockedTasks = local;
        return local;
    }

    const tmp = tryReadFile(TMP_DATA_FILE);
    if (tmp !== null) {
        memoryUnlockedTasks = tmp;
        return tmp;
    }

    // Default: Tasks 1 and 2 unlocked initially if no configuration exists yet
    const defaults = ['1', '2'];
    memoryUnlockedTasks = defaults;
    return defaults;
}

/**
 * Persist unlocked tasks across all storage layers (Firestore, Memory, File, /tmp)
 */
async function persistUnlockedTasks(tasks: string[]) {
    memoryUnlockedTasks = tasks;

    // 1. Save to Cloud Firestore (Primary permanent storage)
    await saveUnlockedTasksToFirestore(tasks);

    // 2. Save to local data file (Local dev)
    const payload = { unlockedTasks: tasks };
    const localSaved = tryWriteFile(LOCAL_DATA_FILE, payload);

    // 3. Save to /tmp (Serverless instance)
    if (!localSaved) {
        tryWriteFile(TMP_DATA_FILE, payload);
    }
}

// GET: Return list of unlocked tasks
export async function GET(req: NextRequest) {
    try {
        const unlocked = await getUnlockedTasks(req);
        const res = NextResponse.json({ 
            success: true, 
            unlockedTasks: unlocked 
        });

        // Set cache control so browser and CDN never cache stale lock status
        res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        // Sync 1-year persistent cookie
        res.cookies.set('knobly_unlocked_tasks', encodeURIComponent(JSON.stringify(unlocked)), {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        });

        return res;
    } catch (err) {
        console.error('[HTML Tasks API] GET error:', err);
        const fallback = memoryUnlockedTasks || ['1', '2'];
        return NextResponse.json({ success: true, unlockedTasks: fallback });
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

        let currentUnlocked = [...(await getUnlockedTasks(req))];

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

        // Save permanently to Firestore + in-memory + filesystem
        await persistUnlockedTasks(currentUnlocked);

        const res = NextResponse.json({
            success: true,
            unlockedTasks: currentUnlocked,
            message: action === 'lock' 
                ? (taskId === 'all' ? 'All tasks locked successfully' : `Task ${taskId} locked`)
                : (taskId === 'all' ? 'All tasks unlocked successfully' : `Task ${taskId} unlocked permanently`)
        });

        res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        // Set persistent cookie on client
        res.cookies.set('knobly_unlocked_tasks', encodeURIComponent(JSON.stringify(currentUnlocked)), {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax',
        });

        return res;
    } catch (err) {
        console.error('[HTML Tasks API] POST error:', err);
        return NextResponse.json({ 
            success: true, 
            unlockedTasks: memoryUnlockedTasks || [],
            message: 'Updated' 
        });
    }
}
