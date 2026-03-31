import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const SYSTEM_PROMPT = `You are an expert AI question generation and formatting assistant for the Knobly Web learning platform.
Your ONLY job is to output perfectly formatted multiple-choice questions (MCQs).

CRITICAL RULES FOR FORMATTING & TRANSLATION:
1. Every question text MUST be bilingual in the format: English text | Hindi text
2. If the user provides a code snippet or programming code, DO NOT TRANSLATE THE CODE. Keep the code exactly as is, on separate lines BELOW the bilingual question text.
3. Hindi translation must be in pure Devanagari script.
4. You MUST strictly follow this exact plain text structure:

Question English text | Question Hindi text
code_line_1_if_exists
code_line_2_if_exists
A. Option 1 English | Option 1 Hindi
B. Option 2 English | Option 2 Hindi
C. Option 3 English | Option 3 Hindi
D. Option 4 English | Option 4 Hindi

(Empty line MUST separate different questions)

5. VERY IMPORTANT - OPTION TRANSLATION RULE:
   - If the option text is a NUMBER, CODE OUTPUT, or SYMBOL (like: 129, [1, 2, 3], True, None, Error, 8|8 ← NO!, 0.5, etc.), write it ONLY ONCE. Do NOT repeat it as "value | value".
   - Only translate option text that is actual ENGLISH WORDS that have a Hindi equivalent.
   - Examples of options that should NOT be duplicated:
       WRONG: A. 129* | 129*   ← DO NOT DO THIS
       WRONG: B. [1, 2, 1, 2] | [1, 2, 1, 2]   ← DO NOT DO THIS
       WRONG: C. 8 | 8   ← DO NOT DO THIS
       CORRECT: A. 129*   ← Just write once
       CORRECT: B. [1, 2, 1, 2]   ← Just write once
       CORRECT: C. 8   ← Just write once
   - Examples of options that SHOULD be translated:
       CORRECT: A. Storage Device | स्टोरेज डिवाइस
       CORRECT: B. Error | त्रुटि
       CORRECT: C. None of the above | उपरोक्त में से कोई नहीं

6. Mark the correct answer with an asterisk (*) at the very end. Example: OptionText*
7. NEVER use markdown like \`\`\` or bold text (**). Output ONLY the raw text. No introductions or explanations.

Example WITHOUT code snippet:
What is a CPU? | CPU क्या है?
A. Storage Device | स्टोरेज डिवाइस
B. Processing Unit* | प्रोसेसिंग यूनिट*
C. Display Device | डिस्प्ले डिवाइस
D. Power Supply | पावर सप्लाई

Example WITH code snippet (note: number/code outputs in options are NOT repeated):
What will be the output of this Python code? | इस पाइथन कोड का आउटपुट क्या होगा?
x = [1, 2]
print(x * 2)
A. Error | त्रुटि
B. [1, 2, 1, 2]*
C. [2, 4]
D. None | कोई नहीं
`;


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { input, mode = 'format', num_questions = 5 } = body;

        let userPrompt = '';
        if (mode === 'generate') {
            userPrompt = `Please automatically generate ${num_questions} multiple-choice questions about the topic: "${input}". 
Ensure they are formatted EXACTLY as instructed, separated by a blank line, with the correct option marked by an asterisk (*).`;
        } else {
            userPrompt = `Please carefully reformat and TRANSLATE the following unformatted/messy text into the strict bilingual English | Hindi A-D format required.
If any code snippets exist, PRESERVE them exactly underneath the question text.
Here is the text to process:\n\n${input}`;
        }



        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 3000,
                temperature: 0.3, // Lower temperature for strict formatting
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Groq AI Format error:', err);
            return NextResponse.json({ error: 'AI service error' }, { status: 500 });
        }

        const data = await response.json();
        let formattedText = data.choices?.[0]?.message?.content ?? '';

        // Remove markdown code fences the AI sometimes adds
        formattedText = formattedText.replace(/^```[a-z]*\n?/gim, '').replace(/```$/gm, '').trim();

        // ── POST-PROCESSING: Remove "X | X" duplicates in option lines ────────
        // If both sides of " | " are identical (numbers, code outputs, symbols),
        // keep only the left side. e.g: "129* | 129*" → "129*", "8 | 8" → "8"
        formattedText = formattedText.split('\n').map((line: string) => {
            const optMatch = line.match(/^([A-Ea-e][.)]\ +)(.+)$/);
            if (!optMatch) return line;
            const prefix = optMatch[1];
            const body = optMatch[2];
            if (!body.includes(' | ')) return line;
            const pipeIdx = body.indexOf(' | ');
            const left = body.slice(0, pipeIdx).trim();
            const right = body.slice(pipeIdx + 3).trim();
            // Normalize: strip trailing * for comparison
            const leftNorm = left.replace(/\*+$/, '').trim();
            const rightNorm = right.replace(/\*+$/, '').trim();
            if (leftNorm === rightNorm) return prefix + left; // duplicate → keep left only
            return line;
        }).join('\n');

        return NextResponse.json({ result: formattedText });
    } catch (err) {
        console.error('AI Format API Server error:', err);
        return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
    }
}
