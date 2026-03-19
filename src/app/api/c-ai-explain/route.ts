import { NextResponse } from 'next/server';
import { explainCError } from '@/lib/c-ai-service';

export async function POST(req: Request) {
  try {
    const { code, error, language } = await req.json();

    if (!code || !error) {
      return NextResponse.json(
        { error: 'Code and error are required' },
        { status: 400 }
      );
    }

    const explanation = await explainCError(code, error, language || 'en');
    return NextResponse.json(explanation);
  } catch (error) {
    console.error('C AI Explain error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
