import { NextResponse } from 'next/server';
import { generateCode } from '@/lib/python-ai-service';

export async function POST(req: Request) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const code = await generateCode(prompt, language || 'en');
    return NextResponse.json({ code });
  } catch (error) {
    console.error('AI Generate Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate code' },
      { status: 500 }
    );
  }
}
