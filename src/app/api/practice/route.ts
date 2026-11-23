import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { learningOverview, questionPool, setLearningPreference, startPractice, syncExamLearning, updatePractice } from '@/lib/learning-practice-server';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
async function identity(req: NextRequest) {
    const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return null;
    try { return await getAdminAuth().verifyIdToken(token); } catch { return null; }
}
export async function GET(req: NextRequest) {
    const user = await identity(req); if (!user) return reply({ error: 'Please sign in again.' }, 401);
    try { return reply(await learningOverview(user.uid)); }
    catch (error) { console.error('[practice overview]', error); return reply({ error: 'Learning progress could not be loaded. Please try again.' }, 503); }
}
export async function POST(req: NextRequest) {
    const user = await identity(req); if (!user) return reply({ error: 'Please sign in again.' }, 401);
    try {
        const raw = await req.text(); if (raw.length > 30_000) return reply({ error: 'Request too large' }, 413);
        const body = JSON.parse(raw);
        if (body.action === 'start' && ['daily', 'wrong', 'bookmarks'].includes(body.kind)) return reply(await startPractice(user.uid, body.kind));
        if (body.action === 'sync') {
            const { pool } = await questionPool();
            return reply(await syncExamLearning(user.uid, pool));
        }
        if (['draft', 'submit'].includes(body.action)) return reply(await updatePractice(user.uid, body.id, body.answers, body.index, body.action === 'submit', user.name || 'Student'));
        if (['bookmark', 'goal'].includes(body.action)) { await setLearningPreference(user.uid, body); return reply({ success: true }); }
        return reply({ error: 'Unknown practice action' }, 400);
    } catch (error) {
        console.error('[practice action]', error);
        return reply({ error: error instanceof Error ? error.message : 'Practice could not be saved. Please try again.' }, 400);
    }
}
