'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_MESSAGES = [
    { text: 'INITIALIZING SYSTEM', icon: '⚙️' },
    { text: 'Loading kernel modules', icon: '🔧' },
    { text: 'Establishing secure connection', icon: '🔐' },
    { text: 'Mounting file systems', icon: '📁' },
    { text: 'Starting Knobly services', icon: '🚀' },
    { text: 'System ready', icon: '✅' },
];

export default function BootScreen({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);
    const [showLogo, setShowLogo] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const particlesRef = useRef<{ x: number; y: number; size: number; speed: number; opacity: number }[]>([]);

    // Generate particles
    useEffect(() => {
        particlesRef.current = Array.from({ length: 30 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
        }));
    }, []);

    useEffect(() => {
        // Stagger animations
        setTimeout(() => setShowLogo(true), 200);
        setTimeout(() => setShowContent(true), 600);

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            setStep(currentStep);
            setProgress(Math.min(currentStep * 20, 100));
            if (currentStep >= 5) {
                clearInterval(interval);
                setTimeout(onComplete, 600);
            }
        }, 450);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0e27 30%, #0f172a 60%, #020617 100%)' }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20" style={{
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(99, 102, 241, 0.15) 40%, transparent 70%)',
            }} />

            {/* Floating particles */}
            {particlesRef.current.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-cyan-400"
                    style={{ left: `${p.x}%`, width: p.size, height: p.size, opacity: p.opacity }}
                    animate={{ y: [p.y * 5, p.y * 5 - 200], opacity: [p.opacity, 0] }}
                    transition={{ duration: p.speed * 4, repeat: Infinity, ease: 'linear' }}
                />
            ))}

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Logo */}
                <AnimatePresence>
                    {showLogo && (
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, y: 30, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Glow behind logo */}
                            <div className="absolute inset-0 blur-3xl" style={{
                                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)',
                                transform: 'scale(2.5)',
                            }} />
                            <motion.div
                                className="relative text-7xl sm:text-8xl font-black tracking-tighter"
                                style={{
                                    background: 'linear-gradient(135deg, #22d3ee, #818cf8, #c084fc, #22d3ee)',
                                    backgroundSize: '300% 300%',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    filter: 'drop-shadow(0 0 30px rgba(56, 189, 248, 0.5))',
                                }}
                                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            >
                                K.
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Brand name */}
                <AnimatePresence>
                    {showContent && (
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-gray-400">
                                Knobly OS
                            </span>
                            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.5em] text-gray-600">
                                Ultimate Edition
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress bar */}
                <AnimatePresence>
                    {showContent && (
                        <motion.div
                            className="w-56 sm:w-64 flex flex-col items-center gap-3 mt-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            {/* Bar track */}
                            <div className="w-full h-1 bg-gray-800/80 rounded-full overflow-hidden backdrop-blur-sm relative">
                                <motion.div
                                    className="h-full rounded-full relative"
                                    style={{
                                        background: 'linear-gradient(90deg, #22d3ee, #818cf8, #c084fc)',
                                        boxShadow: '0 0 15px rgba(56, 189, 248, 0.5), 0 0 30px rgba(129, 140, 248, 0.3)',
                                    }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>

                            {/* Status text */}
                            <div className="flex items-center gap-2 h-5">
                                <motion.span
                                    key={step}
                                    className="text-[10px] sm:text-xs font-mono text-gray-500"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {step < BOOT_MESSAGES.length ? (
                                        <span className="flex items-center gap-1.5">
                                            <span>{BOOT_MESSAGES[step].icon}</span>
                                            <span>{BOOT_MESSAGES[step].text}</span>
                                            {step < 5 && (
                                                <motion.span
                                                    animate={{ opacity: [1, 0, 1] }}
                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                >...</motion.span>
                                            )}
                                        </span>
                                    ) : BOOT_MESSAGES[5].text}
                                </motion.span>
                            </div>

                            {/* Percentage */}
                            <span className="text-[9px] font-mono text-gray-600 tabular-nums">{progress}%</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom branding */}
            <motion.div
                className="absolute bottom-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
            >
                <p className="text-[8px] sm:text-[9px] text-gray-700 tracking-widest uppercase">
                    Powered by Knobly Learn
                </p>
            </motion.div>
        </motion.div>
    );
}
