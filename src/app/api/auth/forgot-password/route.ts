import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetMail, sendPasswordResetMailForKnoblyId } from '@/lib/email-service';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    // ── CASE 1: User entered their Knobly User ID (frontend converts to username@knobly.id) ──
    if (trimmedEmail.endsWith('@knobly.id')) {
      const knoblyUserId = trimmedEmail.replace('@knobly.id', '');
      
      // Look up the username mapping to find their UID
      const usernameDoc = await getAdminDb().collection('usernames').doc(knoblyUserId).get();
      if (!usernameDoc.exists) {
        return NextResponse.json({ error: 'No account found with this User ID.' }, { status: 404 });
      }
      
      const uid = usernameDoc.data()?.uid;
      if (!uid) {
        return NextResponse.json({ error: 'Account data is incomplete. Please contact support.' }, { status: 500 });
      }
      
      // Get the user's actual email from their profile
      const profileDoc = await getAdminDb().collection('profiles').doc(uid).get();
      const profileEmail = profileDoc.data()?.email;
      
      // Find a real email to send to (not @knobly.id)
      let actualEmail = profileEmail;
      if (!actualEmail || actualEmail.endsWith('@knobly.id')) {
        // Try getting email from Firebase Auth user record
        try {
          const userRecord = await getAdminAuth().getUser(uid);
          // Check Google provider first, then other providers
          const googleProvider = userRecord.providerData.find(p => p.providerId === 'google.com');
          if (googleProvider?.email) {
            actualEmail = googleProvider.email;
          } else if (userRecord.email && !userRecord.email.endsWith('@knobly.id')) {
            actualEmail = userRecord.email;
          }
        } catch (_) { }
      }
      
      if (!actualEmail || actualEmail.endsWith('@knobly.id')) {
        return NextResponse.json({ error: 'Could not find a valid email to send the reset link. Please contact support.' }, { status: 400 });
      }
      
      // Generate reset link for @knobly.id but send to actual email
      await sendPasswordResetMailForKnoblyId(trimmedEmail, actualEmail);
      return NextResponse.json({ message: 'Password reset email sent successfully.' });
    }

    // ── CASE 2: User entered a regular email (Gmail, etc.) ──
    // First check Firestore profiles to see if this email belongs to a user with a Knobly ID
    try {
      const profilesSnapshot = await getAdminDb().collection('profiles')
        .where('email', '==', trimmedEmail)
        .limit(1)
        .get();
      
      if (!profilesSnapshot.empty) {
        const profileData = profilesSnapshot.docs[0].data();
        const knoblyUserId = profileData?.knobly_user_id;
        
        if (knoblyUserId) {
          // This user has a Knobly ID — generate reset for @knobly.id but send to their email
          const knoblyEmail = `${knoblyUserId}@knobly.id`;
          await sendPasswordResetMailForKnoblyId(knoblyEmail, trimmedEmail);
          return NextResponse.json({ message: 'Password reset email sent successfully.' });
        }
      }
    } catch (firestoreErr) {
      console.warn('[Knobly] Firestore lookup warning:', firestoreErr);
    }

    // ── CASE 3: Check if this is a Google-only user (no Knobly ID, no password) ──
    try {
      const userRecord = await getAdminAuth().getUserByEmail(trimmedEmail);
      const hasGoogleProvider = userRecord.providerData.some(p => p.providerId === 'google.com');
      const hasPasswordProvider = userRecord.providerData.some(p => p.providerId === 'password');
      
      if (hasGoogleProvider && !hasPasswordProvider) {
        return NextResponse.json({ 
          error: 'This account uses Google sign-in only. Please login with Google. You can create a User ID & password from Settings after logging in.' 
        }, { status: 400 });
      }
    } catch (authErr: unknown) {
      const authMsg = authErr instanceof Error ? authErr.message : '';
      if (authMsg.includes('auth/user-not-found')) {
        return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
      }
    }

    // ── CASE 4: Normal email/password user (no Google, no Knobly ID) ──
    await sendPasswordResetMail(trimmedEmail);
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
