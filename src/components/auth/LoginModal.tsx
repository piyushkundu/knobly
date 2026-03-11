'use client';

import { useState } from 'react';
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
    const { login, signup, loginWithGoogle, resetPassword } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        username: '',
        selectedAvatar: '',
    });

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (isSignUp) {
                await signup(form.email, form.password, form.fullName, form.username, form.selectedAvatar);
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
                    } else {
                        await login(form.email, form.password);
                    }
                    onClose();
                    return;
                } catch (_) {
                    setError('Connection error. Please try again.');
                }
            } else if (message.includes('auth/email-already-in-use')) {
                setError('Ye email already registered hai. Login karo.');
            } else if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
                setError('Email ya password galat hai. Check karo.');
            } else if (message.includes('auth/weak-password')) {
                setError('Password kam se kam 6 characters ka hona chahiye.');
            } else if (message.includes('auth/invalid-email')) {
                setError('Email format sahi nahi hai.');
            } else if (message.includes('auth/too-many-requests')) {
                setError('Bahut zyada attempts ho gaye. Thodi der baad try karo.');
            } else {
                setError(message);
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
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!form.email) {
            setError('Enter your email first');
            return;
        }
        try {
            await resetPassword(form.email);
            setError('Password reset email sent!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
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
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="rounded-lg p-3 text-sm focus:border-cyan-400 focus:outline-none bg-black/40 text-white border border-white/10"
                                        placeholder="user@knobly.os"
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
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'PROCESSING...' : isSignUp ? 'REGISTER' : 'AUTHENTICATE'}
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
                                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                    className="text-cyan-400 font-bold hover:underline ml-1 cursor-pointer"
                                >
                                    {isSignUp ? 'Login' : 'Sign Up'}
                                </button>
                            </div>

                            {!isSignUp && (
                                <div className="text-center mt-1 text-xs">
                                    <button
                                        onClick={handlePasswordReset}
                                        className="text-gray-500 hover:text-white cursor-pointer underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
