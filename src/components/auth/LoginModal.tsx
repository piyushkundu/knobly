'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const avatarOptions = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Tech',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/micah/svg?seed=Molly',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Leo',
];

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { user, login, signup, loginWithGoogle, resetPassword, resendVerificationEmail, loginWithUserId } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loginMode, setLoginMode] = useState<'email' | 'userid'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showVerificationScreen, setShowVerificationScreen] = useState(false);

    // Auto-close when user logs in (detected by Firebase auth state)
    // Skip auto-close during signup flow (user is briefly created before signOut)
    useEffect(() => {
        if (user && isOpen && !isSignUp && !showVerificationScreen) {
            onClose();
        }
    }, [user, isOpen, isSignUp, showVerificationScreen, onClose]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setForm({ fullName: '', email: '', password: '', username: '', selectedAvatar: '' });
            setError('');
            setSuccessMessage('');
            setIsSignUp(false);
            setLoginMode('email');
            setLoading(false);
            setShowVerificationScreen(false);
        }
    }, [isOpen]);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        username: '',
        selectedAvatar: '',
    });

    // Sanitize Firebase errors so internal names never leak to users
    const sanitizeError = (msg: string): string => {
        if (msg.includes('auth/email-already-in-use')) return 'This email is already registered. Please login instead.';
        if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) return 'Incorrect email or password. Please try again.';
        if (msg.includes('auth/weak-password')) return 'Password must be at least 6 characters.';
        if (msg.includes('auth/invalid-email')) return 'Please enter a valid email address.';
        if (msg.includes('auth/too-many-requests')) return 'Too many attempts. Please try again later.';
        if (msg.includes('auth/missing-password')) return 'Please enter your password.';
        if (msg.includes('auth/missing-email')) return 'Please enter your email address.';
        if (msg.includes('auth/network-request-failed')) return 'Network error. Please check your connection.';
        if (msg.includes('auth/popup-closed-by-user')) return '';
        if (msg.includes('auth/cancelled-popup-request')) return '';
        if (msg.includes('auth/account-exists-with-different-credential')) return 'An account already exists with this email using a different sign-in method.';
        if (msg.includes('EMAIL_NOT_VERIFIED')) return 'Please verify your email first! A verification link was sent to your inbox.';
        if (msg.includes('EMAIL_ALREADY_VERIFIED')) return 'Your email is already verified! You can login now.';
        // Strip any Firebase prefix from unknown errors
        if (msg.includes('Firebase:') || msg.includes('auth/')) return 'Authentication failed. Please try again.';
        return msg;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            if (isSignUp) {
                await signup(form.email, form.password, form.fullName, form.username, form.selectedAvatar);
                // Show verification screen instead of closing modal
                setShowVerificationScreen(true);
                setLoading(false);
                return;
            } else {
                await login(form.email, form.password);
            }
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            // Filter out Firestore internal errors (SDK bugs, not user errors)
            if (message.includes('INTERNAL ASSERTION') || message.includes('Unexpected state')) {
                // Retry once silently - often works on second attempt
                try {
                    if (isSignUp) {
                        await signup(form.email, form.password, form.fullName, form.username, form.selectedAvatar);
                        setShowVerificationScreen(true);
                        setLoading(false);
                        return;
                    } else {
                        await login(form.email, form.password);
                    }
                    onClose();
                    return;
                } catch (_) {
                    setError('Connection error. Please try again.');
                }
            } else if (message.includes('EMAIL_NOT_VERIFIED')) {
                setError('Please verify your email first! A verification link was sent to your inbox. You can resend it below.');
            } else if (message.includes('auth/email-already-in-use')) {
                setError('This email is already registered. Please login instead.');
            } else if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
                setError('Incorrect email or password. Please try again.');
            } else if (message.includes('auth/weak-password')) {
                setError('Password must be at least 6 characters.');
            } else if (message.includes('auth/invalid-email')) {
                setError('Please enter a valid email address.');
            } else if (message.includes('auth/too-many-requests')) {
                setError('Too many attempts. Please try again later.');
            } else if (message.includes('auth/missing-password')) {
                setError('Please enter your password.');
            } else if (message.includes('auth/missing-email')) {
                setError('Please enter your email address.');
            } else {
                setError(sanitizeError(message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            if (message.includes('INTERNAL ASSERTION') || message.includes('Unexpected state')) {
                try {
                    await loginWithGoogle();
                    onClose();
                    return;
                } catch (_) {
                    setError('Connection error. Please try again.');
                }
            } else if (message.includes('popup-closed-by-user')) {
                setError('');
            } else {
                setError(sanitizeError(message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!form.email) {
            setError('Please enter your email first.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await resetPassword(form.email);
            setSuccessMessage('✅ Password reset link has been sent to your email! Please check your inbox.');
            setError('');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            if (message.includes('auth/user-not-found')) {
                setError('No account found with this email.');
            } else if (message.includes('auth/too-many-requests')) {
                setError('Too many requests. Please try again later.');
            } else if (message.includes('auth/invalid-email')) {
                setError('Please enter a valid email address.');
            } else {
                setError(sanitizeError(message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!form.email || !form.password) {
            setError('Please enter your email and password to resend the verification email.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await resendVerificationEmail(form.email, form.password);
            setSuccessMessage('✅ Verification email has been resent! Please check your inbox.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            if (message.includes('EMAIL_ALREADY_VERIFIED')) {
                setSuccessMessage('✅ Your email is already verified! You can login now.');
                setShowVerificationScreen(false);
                setIsSignUp(false);
            } else if (message.includes('auth/too-many-requests')) {
                setError('Too many requests. Please try again later.');
            } else {
                setError(sanitizeError(message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUserIdLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await loginWithUserId(form.username, form.password);
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
                setError('Incorrect User ID or password.');
            } else {
                setError(sanitizeError(message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="relative w-[90%] max-w-md max-h-[85vh] overflow-y-auto custom-scroll bg-[#0f172a] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] z-50"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                    >
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

                        <div className="flex justify-between items-center mb-6">
                            <h2
                                className="text-xl md:text-2xl font-bold text-white tracking-widest"
                                style={{ fontFamily: 'var(--font-gaming)' }}
                            >
                                {isSignUp ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN'}
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                                    {error}
                                </div>
                            )}
                            {successMessage && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg">
                                    {successMessage}
                                </div>
                            )}

                            {/* Email Verification Screen */}
                            {showVerificationScreen ? (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <span className="text-3xl">📧</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white text-center" style={{ fontFamily: 'var(--font-gaming)' }}>
                                        VERIFY YOUR EMAIL
                                    </h3>
                                    <p className="text-gray-400 text-xs text-center leading-relaxed">
                                        We have sent a verification link to <span className="text-cyan-400 font-bold">{form.email}</span>.
                                        <br />Open your email and click the link, then come back here to login.
                                    </p>
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={loading}
                                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? 'Sending...' : 'Resend verification email'}
                                    </button>
                                    <button
                                        onClick={() => { setShowVerificationScreen(false); setIsSignUp(false); setError(''); setSuccessMessage(''); }}
                                        className="mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-95"
                                    >
                                        GO TO LOGIN
                                    </button>
                                </div>
                            ) : (
                            <>

                            {isSignUp && (
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider mb-2 block">
                                            Choose Avatar
                                        </label>
                                        <div className="flex gap-2 justify-center flex-wrap">
                                            {avatarOptions.map((av) => (
                                                <img
                                                    key={av}
                                                    src={av}
                                                    alt="avatar"
                                                    onClick={() => setForm({ ...form, selectedAvatar: av })}
                                                    className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all hover:scale-110 bg-white/10 ${form.selectedAvatar === av
                                                        ? 'border-cyan-400 shadow-[0_0_10px_#22d3ee]'
                                                        : 'border-transparent opacity-60 hover:opacity-100'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            value={form.fullName}
                                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            className="rounded-lg p-2.5 text-sm focus:border-cyan-400 focus:outline-none bg-black/40 text-white border border-white/10"
                                            placeholder="John Doe"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Username</label>
                                        <input
                                            type="text"
                                            value={form.username}
                                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                                            className="rounded-lg p-2.5 text-sm focus:border-cyan-400 focus:outline-none bg-black/40 text-white border border-white/10"
                                            placeholder="@johndoe"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            )}

                            {isSignUp ? null : (
                                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10">
                                    <button onClick={() => { setLoginMode('email'); setError(''); }}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${loginMode === 'email' ? 'bg-cyan-500/20 text-cyan-400 shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                                        Email Login
                                    </button>
                                    <button onClick={() => { setLoginMode('userid'); setError(''); }}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${loginMode === 'userid' ? 'bg-cyan-500/20 text-cyan-400 shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                                        User ID Login
                                    </button>
                                </div>
                            )}

                            {!isSignUp && loginMode === 'userid' ? (
                                /* User ID Login Mode */
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">User ID</label>
                                        <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                                            <span className="text-gray-500 text-xs pl-2.5">@</span>
                                            <input
                                                type="text"
                                                value={form.username}
                                                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                className="flex-1 bg-transparent text-sm text-white p-2.5 focus:outline-none font-mono"
                                                placeholder="my_username"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Password</label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="rounded-lg p-3 text-sm focus:border-cyan-400 focus:outline-none bg-black/40 text-white border border-white/10"
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="rounded-lg p-3 text-sm focus:border-cyan-400 focus:outline-none bg-black/40 text-white border border-white/10"
                                        placeholder="user@knobly.os"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Password</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="rounded-lg p-3 text-sm focus:border-cyan-400 focus:outline-none bg-black/40 text-white border border-white/10"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                            )}

                            <button
                                onClick={!isSignUp && loginMode === 'userid' ? handleUserIdLogin : handleSubmit}
                                disabled={loading}
                                className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'PROCESSING...' : isSignUp ? 'REGISTER' : loginMode === 'userid' ? 'LOGIN WITH USER ID' : 'AUTHENTICATE'}
                            </button>

                            <div className="flex items-center gap-3 my-2">
                                <div className="h-[1px] bg-white/10 flex-1" />
                                <span className="text-[10px] text-gray-500 uppercase">OR</span>
                                <div className="h-[1px] bg-white/10 flex-1" />
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="ph-bold ph-google-logo text-lg" /> Continue with Google
                            </button>

                            <div className="text-center mt-2 text-xs text-gray-400">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                <button
                                    onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMessage(''); }}
                                    className="text-cyan-400 font-bold hover:underline ml-1 cursor-pointer"
                                >
                                    {isSignUp ? 'Login' : 'Sign Up'}
                                </button>
                            </div>

                            {!isSignUp && (
                                <>
                                <div className="text-center mt-1 text-xs">
                                    <button
                                        onClick={handlePasswordReset}
                                        className="text-gray-500 hover:text-white cursor-pointer underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                {/* Resend verification link for unverified users */}
                                {error && error.includes('verify') && (
                                    <div className="text-center mt-1 text-xs">
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={loading}
                                            className="text-cyan-400 hover:text-cyan-300 cursor-pointer underline disabled:opacity-50"
                                        >
                                            {loading ? 'Bhej rahe hain...' : '📧 Verification Email Dobara Bhejo'}
                                        </button>
                                    </div>
                                )}
                                </>
                            )}
                            </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
