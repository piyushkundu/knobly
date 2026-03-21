import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetMail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    await sendPasswordResetMail(email);

    return NextResponse.json({ message: 'Password reset email sent successfully.' });
  } catch (err: unknown) {
    console.error('[Knobly] Password reset email error:', err);
    const message = err instanceof Error ? err.message : 'Failed to send reset email.';

    if (message.includes('auth/user-not-found')) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
    }
    if (message.includes('auth/too-many-requests')) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    if (message.includes('auth/invalid-email')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 });
  }
}
