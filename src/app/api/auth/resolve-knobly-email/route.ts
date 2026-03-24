import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Resolves a regular email (e.g. Gmail) to the user's @knobly.id email
 * if they have a linked Knobly User ID. Used by the login flow when
 * signInWithEmailAndPassword fails for a non-knobly email.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ knoblyEmail: null });
    }

    const trimmed = email.trim().toLowerCase();

    // Look up the user's profile by email
    const snap = await adminDb.collection('profiles')
      .where('email', '==', trimmed)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ knoblyEmail: null });
    }

    const knoblyUserId = snap.docs[0].data()?.knobly_user_id;
    if (!knoblyUserId) {
      return NextResponse.json({ knoblyEmail: null });
    }

    return NextResponse.json({ knoblyEmail: `${knoblyUserId}@knobly.id` });
  } catch (err) {
    console.error('[Knobly] resolve-knobly-email error:', err);
    return NextResponse.json({ knoblyEmail: null });
  }
}
