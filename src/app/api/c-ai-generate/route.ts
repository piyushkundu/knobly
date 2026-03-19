import { NextResponse } from 'next/server';
import { generateCCode } from '@/lib/c-ai-service';

export async function POST(req: Request) {
  try {
    const { prompt, language } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const code = await generateCCode(prompt, language || 'en');
    return NextResponse.json({ code });
  } catch (error) {
    console.error('C AI Generate Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate code' },
      { status: 500 }
    );
  }
}
