import { NextResponse } from 'next/server';
import { explainWebCode } from '@/lib/python-ai-service';

export async function POST(req: Request) {
  try {
    const { code, language, question } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const result = await explainWebCode(code, language || 'en', question);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Explain Web Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to explain code' },
      { status: 500 }
    );
  }
}
