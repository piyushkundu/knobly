'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TEXT = "KNOBLY";

export default function BootScreen({ onComplete }: { onComplete: () => void }) {

    const letters = TEXT.split("");

    const [visibleLetters, setVisibleLetters] = useState(0);
    const [progress, setProgress] = useState(0);
    const [exit, setExit] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [textDone, setTextDone] = useState(false);
    const [startLoader, setStartLoader] = useState(false);

    /* =========================
       WEBSITE THEME DETECTION
    ========================= */

    useEffect(() => {

        const checkTheme = () => {
            const isDarkMode = document.documentElement.classList.contains("dark");
            setIsDark(isDarkMode);
        };

        checkTheme();

        // observe changes (important 🔥)
        const observer = new MutationObserver(checkTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();

    }, []);

    /* =========================
       TEXT ANIMATION
    ========================= */

    useEffect(() => {
        const timers: any[] = [];

        timers.push(
            setTimeout(() => {
                letters.forEach((_, i) => {
                    timers.push(
                        setTimeout(() => {
                            setVisibleLetters(i + 1);

                            if (i === letters.length - 1) {
                                setTextDone(true);
                                setStartLoader(true);
                            }

                        }, i * 170)
                    );
                });
            }, 300)
        );

        return () => timers.forEach(clearTimeout);
    }, []);

    /* =========================
       FAST LOADER
    ========================= */

    useEffect(() => {
        if (!startLoader) return;

        let value = 0;

        const interval = setInterval(() => {

            if (value < 60) value += 6;
            else if (value < 90) value += 3;
            else value += 1.5;

            if (value > 100) value = 100;

            setProgress(Math.floor(value));

            if (value >= 100) {
                clearInterval(interval);

                setTimeout(() => {
                    setExit(true);
                    setTimeout(onComplete, 700);
                }, 300);
            }

        }, 25);

        return () => clearInterval(interval);
    }, [startLoader, onComplete]);

    /* =========================
       COLORS (SYNCED)
    ========================= */

    const bgStyle = {
        backgroundColor: isDark ? "#000000" : "#ffffff",
    };

    const textColor = isDark ? "#ffffff" : "#000000";
    const barBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    const barFill = isDark ? "#ffffff" : "#000000";

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={bgStyle}
            animate={
                exit
                    ? { opacity: 0, scale: 1.02, filter: "blur(8px)" }
                    : { opacity: 1 }
            }
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >

            {/* TEXT */}
            <motion.div
                className="flex mb-16"
                animate={
                    textDone
                        ? { letterSpacing: "0.4em" }
                        : { letterSpacing: "0.25em" }
                }
                transition={{ duration: 0.8 }}
            >

                {letters.map((letter, i) => {
                    const visible = i < visibleLetters;

                    return (
                        <motion.span
                            key={i}
                            style={{
                                color: textColor,
                                fontSize: "clamp(3rem, 10vw, 6rem)",
                            }}
                            className="font-medium"
                            initial={{
                                opacity: 0,
                                y: 50,
                                scale: 0.9,
                            }}
                            animate={
                                visible
                                    ? {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                    }
                                    : {}
                            }
                            transition={{
                                duration: 0.7,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            {letter}
                        </motion.span>
                    );
                })}

            </motion.div>

            {/* LOADER */}
            {startLoader && (
                <>
                    <div
                        className="relative w-60 h-[1.5px] overflow-hidden"
                        style={{ backgroundColor: barBg }}
                    >
                        <motion.div
                            className="h-full"
                            style={{ backgroundColor: barFill }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    <motion.div
                        className="mt-6 text-[10px] font-mono tracking-[0.3em]"
                        style={{ color: textColor + "66" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {progress}%
                    </motion.div>
                </>
            )}

        </motion.div>
    );
}