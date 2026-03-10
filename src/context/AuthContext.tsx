'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, username: string, avatar: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    let adminFlag = false;
                    // Check 'users' collection (isAdmin field)
                    try {
                        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                        if (userDoc.exists() && userDoc.data()?.isAdmin === true) adminFlag = true;
                    } catch (_) { }
                    // Also check 'profiles' collection (role field)
                    if (!adminFlag) {
                        try {
                            const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
                            if (profileDoc.exists() && profileDoc.data()?.role === 'admin') adminFlag = true;
                        } catch (_) { }
                    }
                    setIsAdmin(adminFlag);
                } catch (err) {
                    console.warn('[Knobly] Could not fetch user doc:', err);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string, fullName: string, username: string, avatar: string) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, {
            displayName: fullName,
            photoURL: avatar || undefined,
        });
        // Save to users collection
        await setDoc(doc(db, 'users', cred.user.uid), {
            email,
            displayName: fullName,
            username,
            photoURL: avatar,
            isAdmin: false,
            created_at: serverTimestamp(),
        });
        // Also save to profiles collection (used by dashboard & superadmin)
        await setDoc(doc(db, 'profiles', cred.user.uid), {
            email,
            full_name: fullName,
            username,
            avatar_url: avatar || '',
            role: 'user',
            exam_track: 'OLEVEL',
            created_at: serverTimestamp(),
        });
        // Initialize exam_user_state for XP tracking
        try {
            await setDoc(doc(db, 'exam_user_state', cred.user.uid), {
                user_id: cred.user.uid,
                track_id: 'OLEVEL',
                total_xp: 0,
                total_points: 0,
                current_level: 1,
                created_at: serverTimestamp(),
            });
        } catch (_) { }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const uid = result.user.uid;

        // Check if user already exists in users collection
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', uid), {
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                isAdmin: false,
                created_at: serverTimestamp(),
            });
        }
        // Check if profile exists, create if not
        const profileDoc = await getDoc(doc(db, 'profiles', uid));
        if (!profileDoc.exists()) {
            await setDoc(doc(db, 'profiles', uid), {
                email: result.user.email,
                full_name: result.user.displayName || '',
                username: result.user.email?.split('@')[0] || '',
                avatar_url: result.user.photoURL || '',
                role: 'user',
                exam_track: 'OLEVEL',
                created_at: serverTimestamp(),
            });
            // Initialize exam_user_state
            try {
                await setDoc(doc(db, 'exam_user_state', uid), {
                    user_id: uid,
                    track_id: 'OLEVEL',
                    total_xp: 0,
                    total_points: 0,
                    current_level: 1,
                    created_at: serverTimestamp(),
                });
            } catch (_) { }
        }
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout, loginWithGoogle, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
