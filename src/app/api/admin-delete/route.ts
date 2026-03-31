import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const { action, testId, questionId, text } = await req.json();
        const db = getAdminDb();

        // ── DELETE ALL QUESTIONS ────────────────────────────────────────────────
        if (action === 'delete_all_questions' && testId) {
            const qSnap = await db.collection('exam_questions').where('test_id', '==', testId).get();
            let deletedQ = 0, deletedO = 0;
            for (const qDoc of qSnap.docs) {
                const optSnap = await db.collection('exam_options').where('question_id', '==', qDoc.id).get();
                for (const oDoc of optSnap.docs) {
                    await db.collection('exam_options').doc(oDoc.id).delete();
                    deletedO++;
                }
                await db.collection('exam_questions').doc(qDoc.id).delete();
                deletedQ++;
            }
            return NextResponse.json({ success: true, deletedQ, deletedO });
        }

        // ── DELETE SINGLE QUESTION ──────────────────────────────────────────────
        if (action === 'delete_question' && questionId) {
            const optSnap = await db.collection('exam_options').where('question_id', '==', questionId).get();
            for (const oDoc of optSnap.docs) {
                await db.collection('exam_options').doc(oDoc.id).delete();
            }
            await db.collection('exam_questions').doc(questionId).delete();
            return NextResponse.json({ success: true });
        }

        // ── IMPORT QUESTIONS ────────────────────────────────────────────────────
        if (action === 'import_questions' && testId && text) {
            const isOptionLine = (l: string) => /^[A-Ea-e][.)]\s+/.test(l.trim());

            const blocks = (text as string).split(/\n\s*\n/).map((b: string) => b.trim()).filter(Boolean);
            let importedCount = 0;

            for (const block of blocks) {
                const lines = block.split(/\n/).map((l: string) => l.trimEnd()).filter(Boolean);
                const firstOptionIndex = lines.findIndex((l: string) => isOptionLine(l));

                let questionText = '';
                let optionLines: string[] = [];

                if (firstOptionIndex === -1) {
                    // Whole block is question text (SHORT answer type)
                    questionText = lines.join('\n');
                } else {
                    questionText = lines.slice(0, firstOptionIndex).join('\n');
                    optionLines = lines.slice(firstOptionIndex);
                }

                // Strip leading question numbers like "1. " or "Q1. "
                questionText = questionText.replace(/^(Q?\d+[.)]\s*)/i, '').trim();

                if (!questionText) continue; // skip empty blocks

                const options: { text: string; is_correct: boolean }[] = [];

                for (const l of optionLines) {
                    const trimmed = l.trim();
                    if (!isOptionLine(trimmed)) continue;
                    let c = trimmed.replace(/^[A-Ea-e][.)]\s*/, '');
                    let ic = false;

                    // Check * at end of whole option
                    if (c.trim().endsWith('*')) {
                        ic = true;
                        c = c.trim().slice(0, -1).trim();
                    }
                    // Check * after English part, before " | Hindi" part
                    if (!ic && c.includes(' | ')) {
                        const pipeIdx = c.indexOf(' | ');
                        const leftPart = c.slice(0, pipeIdx);
                        if (leftPart.trim().endsWith('*')) {
                            ic = true;
                            c = leftPart.trim().slice(0, -1).trim() + ' | ' + c.slice(pipeIdx + 3);
                        }
                    }
                    options.push({ text: c, is_correct: ic });
                }

                if (!options.find(o => o.is_correct) && options.length) options[0].is_correct = true;

                // Write to Firestore using Admin SDK (bypasses security rules)
                const qRef = db.collection('exam_questions').doc();
                await qRef.set({
                    test_id: testId,
                    question_text: questionText,
                    question_type: options.length ? 'MCQ' : 'SHORT',
                    marks: 1,
                    difficulty: 'EASY',
                    created_at: FieldValue.serverTimestamp(),
                });

                for (const opt of options) {
                    await db.collection('exam_options').add({
                        question_id: qRef.id,
                        option_text: opt.text,
                        is_correct: opt.is_correct,
                    });
                }
                importedCount++;
            }

            return NextResponse.json({ success: true, importedCount });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (err) {
        console.error('[admin-delete] ERROR:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
