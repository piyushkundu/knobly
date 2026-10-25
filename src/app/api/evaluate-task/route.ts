import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_KEY_ALT = process.env.GROQ_API_KEY_ALT;

async function fetchWithFallback(url: string, options: RequestInit): Promise<Response> {
  const primaryKey = GROQ_API_KEY;
  const secondaryKey = GROQ_API_KEY_ALT;

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${primaryKey}`,
    }
  });

  if (!response.ok) {
    const fallbackKey = secondaryKey || primaryKey;
    let fallbackOptions = { ...options };
    if (fallbackOptions.body && typeof fallbackOptions.body === 'string') {
      try {
        const bodyObj = JSON.parse(fallbackOptions.body);
        if (bodyObj.model === 'openai/gpt-oss-120b') {
          bodyObj.model = 'openai/gpt-oss-20b';
          fallbackOptions.body = JSON.stringify(bodyObj);
        }
      } catch (e) {}
    }

    response = await fetch(url, {
      ...fallbackOptions,
      headers: {
        ...fallbackOptions.headers,
        'Authorization': `Bearer ${fallbackKey}`,
      }
    });
  }

  return response;
}

interface TaskInfo {
  id: string;
  title: string;
  desc: string;
  topics: string;
}

const TASKS_MAP: Record<string, TaskInfo> = {
  '1': { id: '1', title: 'My Profile Page', desc: 'Create a personal profile using basic HTML tags: p, pre, br, hr', topics: 'p, pre, br, hr, bgcolor' },
  '2': { id: '2', title: 'Basic HTML Tags', desc: 'Demonstrate bold, italic, underline, pre, br, center and heading tags', topics: 'b, i, u, pre, br, center, h1, h2, hr' },
  '3': { id: '3', title: 'India - A Diverse Nation', desc: 'Article about India using headings, images, font colors, and hr', topics: 'h1-h5, img, font, br, hr, align' },
  '4': { id: '4', title: 'Indian History Timeline', desc: 'History page using semantic elements: header, nav, section, footer', topics: 'header, nav, section, footer, address, ul' },
  '5': { id: '5', title: 'Operating Systems (Lists)', desc: 'OS information page with unordered and ordered lists', topics: 'ul, ol, li, h1-h3, p, hr' },
  '5.1': { id: '5.1', title: 'Operating Systems (Table)', desc: 'OS comparison using tables with borders and cellpadding', topics: 'table, tr, th, td, border, cellpadding' },
  '5.2': { id: '5.2', title: 'Internet Usage Statistics', desc: 'Global internet stats with colspan and rowspan tables', topics: 'table, colspan, rowspan, th, td, caption' },
  '5.3': { id: '5.3', title: 'History of the Internet', desc: 'Internet timeline with description lists and tables', topics: 'dl, dt, dd, table, iframe, ol' },
  '5.4': { id: '5.4', title: 'Wonders of Space', desc: 'Space exploration page with images, tables, and multimedia', topics: 'img, table, audio, video, iframe' },
  '6': { id: '6', title: 'Weekly Study Schedule', desc: 'Complex table with colspan, rowspan, and colored cells', topics: 'table, colspan, rowspan, bgcolor, th, td' },
  '7': { id: '7', title: 'Simple Webpage (No CSS)', desc: 'Complete webpage using only semantic HTML tags, no CSS', topics: 'header, nav, main, article, section, footer' },
  '8': { id: '8', title: 'Registration Form', desc: 'Complete registration form with all input types', topics: 'form, input, select, textarea, radio, checkbox' },
  '9': { id: '9', title: 'Solar System Basics', desc: 'Solar system page with tables, lists, and audio', topics: 'table, ol, ul, audio, img, details' },
  '10': { id: '10', title: 'Full Website Layout', desc: 'Multi-section website with marquee, nav, tables, forms, media', topics: 'marquee, nav, table, form, video, iframe' },
  '11': { id: '11', title: 'Premium Demo Website', desc: 'Professional-looking demo site with header, sections, and footer', topics: 'header, section, article, aside, footer, figure' },
};

export async function POST(req: Request) {
  try {
    const { taskId, studentCode } = await req.json();

    if (!taskId || !studentCode) {
      return NextResponse.json(
        { error: 'Task ID and student code are required' },
        { status: 400 }
      );
    }

    const task = TASKS_MAP[taskId];
    if (!task) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert HTML teacher and code evaluator for NIELIT O-Level students. 
You evaluate student's HTML code submissions for practice tasks. You MUST respond in JSON format only.

The student is working on: "${task.title}"
Task Description: "${task.desc}"
Required HTML tags/topics to use: "${task.topics}"

EVALUATION CRITERIA (score out of 100):
1. TAG USAGE (40 points): Check if the student has used the REQUIRED tags mentioned in topics. Each missing required tag reduces score.
2. STRUCTURE (20 points): Proper HTML structure - <!DOCTYPE html>, <html>, <head>, <title>, <body> tags present and correctly nested.
3. CONTENT RELEVANCE (20 points): Does the content match the task description? Is it meaningful and relevant?
4. CODE QUALITY (10 points): Clean indentation, proper nesting, no unclosed tags, use of attributes.
5. CREATIVITY (10 points): Extra effort, additional content, good presentation.

IMPORTANT RULES:
- Be encouraging but honest
- If code is empty or just basic boilerplate with no effort, give 0-10 marks
- If student used most required tags correctly, give 60+ marks
- If student did excellent work with all tags + creativity, give 85-100 marks
- Reply ONLY in Hinglish (mix of Hindi and English, but keep HTML terms in English)
- Your entire response must be valid JSON

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "grade": "<A+/A/B+/B/C/D/F>",
  "tagAnalysis": {
    "used": ["list of required tags student used"],
    "missing": ["list of required tags student did NOT use"],
    "extra": ["any extra tags student used beyond requirements"]
  },
  "feedback": "<2-3 line overall Hinglish feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "detailedBreakdown": {
    "tagUsage": <number 0-40>,
    "structure": <number 0-20>,
    "contentRelevance": <number 0-20>,
    "codeQuality": <number 0-10>,
    "creativity": <number 0-10>
  }
}`;

    const response = await fetchWithFallback('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Evaluate this student's HTML code for Task "${task.title}":\n\n${studentCode}` }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API Error:', errText);
      throw new Error('AI evaluation service unavailable');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const evaluation = JSON.parse(jsonStr);
    return NextResponse.json({ evaluation, taskId, taskTitle: task.title });

  } catch (error) {
    console.error('Task Evaluation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate task' },
      { status: 500 }
    );
  }
}
