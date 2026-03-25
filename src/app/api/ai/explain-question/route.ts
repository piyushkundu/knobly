import { NextRequest, NextResponse } from 'next/server';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(req: NextRequest) {
    try {
        const { question_text, options, correct_option, user_answer, language } = await req.json();

        if (!question_text) {
            return NextResponse.json({ error: 'Missing question text' }, { status: 400 });
        }

        const prompt = `You are a friendly, deeply encouraging AI tutor on Knobly Web.
A student needs the absolute simplest explanation for the following question:

Question: ${question_text}
Options: ${options?.length ? options.join(', ') : 'None'}
Correct Answer: ${correct_option || 'Not clearly defined'}
Student's Answer: ${user_answer || 'Skipped / Not answered'}

Explain the correct answer in the simplest way possible, as if teaching a complete beginner. 
Use extremely easy words and simple relatable analogies if needed.
If their answer was wrong, simply and gently explain why it's incorrect.
Keep it short, engaging, and format it neatly with emojis or bullet points.

CRITICAL REQUIREMENT: You MUST respond entirely in ${language || 'Hindi (in devanagari)'}. Make sure it is deeply easy to understand for a school student.`;

        // 1. Try Sarvam AI
        try {
            console.log('[AI Explain] Trying Sarvam AI...');
            const sarvamRes = await fetch('https://api.sarvam.ai/v1/chat/completions', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     'api-subscription-key': SARVAM_API_KEY,
                     'Authorization': `Bearer ${SARVAM_API_KEY}`
                 },
                 body: JSON.stringify({
                     model: 'sarvam-30b-16k', // Typical Sarvam API model string. Will fallback if failing.
                     messages: [{ role: 'system', content: 'You are a helpful tutor.' }, { role: 'user', content: prompt }],
                     max_tokens: 500,
                     temperature: 0.3
                 }),
                 signal: AbortSignal.timeout(6000) // Fallback sooner if it hangs
            });

            if (sarvamRes.ok) {
                 const data = await sarvamRes.json();
                 const text = data.choices?.[0]?.message?.content;
                 if (text) {
                     console.log('[AI Explain] Sarvam AI succeeded.');
                     return NextResponse.json({ explanation: text, provider: 'sarvam' });
                 }
            } else {
                 console.warn('[AI Explain] Sarvam AI failed. Status:', sarvamRes.status, await sarvamRes.text().catch(()=>''));
            }
        } catch (sarvamErr) {
            console.warn('[AI Explain] Sarvam AI fetch error:', sarvamErr);
        }

        // 2. Fallback to Groq AI
        console.log('[AI Explain] Falling back to Groq AI...');
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 500,
            }),
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            console.error('[AI Explain] Groq AI fallback also failed:', errText);
            return NextResponse.json({ error: 'Both AI providers failed' }, { status: 500 });
        }

        const data = await groqRes.json();
        const text = data.choices?.[0]?.message?.content;
        return NextResponse.json({ explanation: text || 'Sorry, I could not generate an explanation at this time.', provider: 'groq' });

    } catch (err) {
        console.error('[AI Explain API] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
