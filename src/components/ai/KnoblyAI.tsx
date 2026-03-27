'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, ChevronDown, ArrowUpRight, ArrowUp } from 'lucide-react';

const AIIcon = ({ size = 24, className = "", color = "currentColor" }) => {
    // Ensuring that if it's meant to be white, it strictly renders as white.
    const appliedColor = (className.includes("text-white") || color === "white" || color === "#ffffff") ? "#ffffff" : color;
    
    return (
        <Sparkles size={size} color={appliedColor} fill={appliedColor === "#ffffff" ? "rgba(255,255,255,0.2)" : "none"} strokeWidth={2.2} className={className} />
    );
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
    role: 'user' | 'assistant';
    content: string;
    navOptions?: { path: string; label: string }[];
}

interface NavAction {
    action: 'navigate';
    path: string;
}

function parseNavAction(text: string): NavAction | null {
    try {
        const match = text.match(/\{[\s\S]*?"action"\s*:\s*"navigate"[\s\S]*?\}/);
        if (match) return JSON.parse(match[0]);
    } catch { }
    return null;
}

function parseNavOptions(text: string): { clean: string; options: { path: string; label: string }[] } {
    const optionsMatch = text.match(/\[NAV_OPTIONS\]([\s\S]*?)\[\/NAV_OPTIONS\]/);
    if (!optionsMatch) return { clean: text, options: [] };

    const options = optionsMatch[1]
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.includes('|'))
        .map(line => {
            const [path, label] = line.split('|').map(s => s.trim());
            return { path, label };
        });

    const clean = text.replace(/\[NAV_OPTIONS\][\s\S]*?\[\/NAV_OPTIONS\]/, '').trim();
    return { clean, options };
}


export default function KnoblyAI() {
    const router = useRouter();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const isTestPage = pathname?.startsWith('/test/');
    const isPythonLabPage = pathname === '/python-lab';

    // Hide AI completely on test pages and python lab page
    if (isTestPage || isPythonLabPage) return null;

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Detect theme
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 250);
        }
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Listen for external toggle event
    useEffect(() => {
        const handler = () => setOpen(prev => !prev);
        window.addEventListener('toggle-knobly-ai', handler);
        return () => window.removeEventListener('toggle-knobly-ai', handler);
    }, []);

    const navigateTo = useCallback((path: string) => {
        setOpen(false);
        router.push(path);
    }, [router]);

    const send = useCallback(async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;
        setInput('');

        const userMsg: Message = { role: 'user', content: msg };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const history = [...messages, userMsg].slice(-10);
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await res.json();
            let reply: string = data.reply ?? 'Kuch galat hua. Dobara try karo.';

            // Check for navigate action
            const navAction = parseNavAction(reply);
            if (navAction) {
                const cleanReply = reply.replace(/\{[\s\S]*?"action"\s*:\s*"navigate"[\s\S]*?\}/, '').trim();
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: cleanReply || `✅ **${navAction.path}** page par le ja raha hoon...`
                }]);
                setTimeout(() => navigateTo(navAction.path), 800);
            } else {
                // Check for NAV_OPTIONS
                const { clean, options } = parseNavOptions(reply);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: clean,
                    navOptions: options.length > 0 ? options : undefined,
                }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Internet check karo aur dobara try karo.' }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, navigateTo]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const suggestedPrompts = [
        "I want to learn Python programming",
        "I need handwritten notes for O-Level",
        "I want to practice MCQ questions"
    ];

    const tags = ["Python", "HTML", "Notes", "MCQ"];

    return (
        <>
            {/* ═══════════════════ FLOATING TRIGGER BUTTON ═══════════════════ */}
            <div className={`fixed bottom-24 md:bottom-6 right-6 z-[9999] select-none ${isHomePage ? 'xl:hidden' : ''} transition-all duration-300 ${open ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
                    style={{
                        background: '#6d28d9',
                        color: '#ffffff', // Ensures the actual text inherits absolute white
                    }}
                >
                    <AIIcon size={22} color="#ffffff" />
                    <span className="font-semibold text-[15px] tracking-wide" style={{ color: '#ffffff' }}>Ask Knobly</span>
                </button>
            </div>

            {/* ═══════════════════ CHAT PANEL ═══════════════════ */}
            <div
                className={`fixed z-[9998] transition-all duration-300 ease-out flex flex-col bottom-24 md:bottom-6 right-6 ${open
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                    }`}
                style={{
                    width: 'min(420px, calc(100vw - 32px))',
                    height: 'min(700px, calc(100vh - 48px))',
                    transformOrigin: 'bottom right',
                    background: isDark ? '#111827' : '#ffffff',
                    borderRadius: '24px',
                    boxShadow: isDark 
                        ? '0 0 0 1px rgba(255,255,255,0.1), 0 24px 48px -12px rgba(0,0,0,0.5)'
                        : '0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px -12px rgba(0,0,0,0.15)',
                }}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 shrink-0 transition-colors rounded-t-[24px]"
                    style={{ background: '#111827', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center gap-2">
                        <AIIcon size={22} className="text-white" />
                        <span className="font-bold text-[16px] tracking-wide text-white">KnoblyAI</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1.5 rounded-full transition-colors"
                        style={{ color: '#9ca3af' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <ChevronDown size={22} />
                    </button>
                </div>

                {/* ── Chat Messages Area ── */}
                <div className="flex-1 overflow-y-auto w-full relative" style={{ scrollbarWidth: 'none' }}>
                    {messages.length === 0 ? (
                        /* Empty State / Welcome Screen */
                        <div className="flex flex-col h-full fade-in pb-4">
                            <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4">
                                <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg ring-4 ring-purple-50 dark:ring-purple-900/20">
                                    <AIIcon size={30} className="text-white" />
                                </div>
                                <h2 className="text-[24px] font-bold mb-1 tracking-tight" style={{ color: isDark ? '#f9fafb' : '#111827' }}>Hello 👋</h2>
                                <p className="text-[15px]" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>How can I help you today?</p>
                            </div>

                            <div className="flex-1 px-5 flex flex-col mt-2 space-y-3">
                                {suggestedPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => send(prompt)}
                                        className="flex items-center gap-3 w-full text-left py-3.5 border-b transition-colors group"
                                        style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                                    >
                                        <ArrowUpRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: isDark ? '#d1d5db' : '#374151' }} />
                                        <span className="text-[14px] leading-snug group-hover:underline decoration-1 underline-offset-2"
                                            style={{ color: isDark ? '#e5e7eb' : '#1f2937' }}>
                                            {prompt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Messages List */
                        <div className="px-5 py-6 space-y-6">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-full`}>
                                    <div
                                        className="text-[15px] leading-relaxed break-words shadow-sm"
                                        style={m.role === 'user'
                                            ? {
                                                background: isDark ? '#374151' : '#f3f4f6',
                                                color: isDark ? '#f9fafb' : '#111827',
                                                padding: '12px 18px',
                                                borderRadius: '20px',
                                                borderBottomRightRadius: '4px',
                                                maxWidth: '90%'
                                            }
                                            : {
                                                background: 'transparent',
                                                color: isDark ? '#e5e7eb' : '#374151',
                                                maxWidth: '100%'
                                            }
                                        }
                                    >
                                        {m.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                    <AIIcon size={14} className="text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <span className="font-semibold text-[13px] text-purple-600 dark:text-purple-400">KnoblyAI</span>
                                            </div>
                                        )}
                                        <div 
                                            dangerouslySetInnerHTML={{
                                                __html: m.content
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\n/g, '<br/>')
                                            }}
                                            className="space-y-2"
                                        />
                                    </div>

                                    {/* Navigation Option Cards */}
                                    {m.navOptions && m.navOptions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {m.navOptions.map((opt, j) => (
                                                <button
                                                    key={j}
                                                    onClick={() => navigateTo(opt.path)}
                                                    className="text-[13px] px-4 py-2 rounded-full font-medium transition-all border shadow-sm"
                                                    style={{
                                                        background: isDark ? 'rgba(31, 41, 55, 0.4)' : '#ffffff',
                                                        borderColor: isDark ? '#4b5563' : '#e5e7eb',
                                                        color: isDark ? '#d1d5db' : '#4b5563',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = '#8b5cf6';
                                                        e.currentTarget.style.color = '#8b5cf6';
                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(139,92,246,0.1)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = isDark ? '#4b5563' : '#e5e7eb';
                                                        e.currentTarget.style.color = isDark ? '#d1d5db' : '#4b5563';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading Indicator */}
                            {loading && (
                                <div className="flex flex-col items-start max-w-full">
                                    <div className="flex items-center gap-2 mb-2 opacity-90">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <AIIcon size={14} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="font-semibold text-[13px] text-purple-600 dark:text-purple-400">KnoblyAI</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 py-3 px-2">
                                        <span className="animate-bounce w-1.5 h-1.5 rounded-full bg-purple-500" style={{ animationDelay: '0ms' }} />
                                        <span className="animate-bounce w-1.5 h-1.5 rounded-full bg-purple-500" style={{ animationDelay: '150ms' }} />
                                        <span className="animate-bounce w-1.5 h-1.5 rounded-full bg-purple-500" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* ── Input Area ── */}
                <div className="shrink-0 pt-2 pb-5 px-5 relative z-10 w-full"
                    style={{ background: isDark ? '#111827' : '#ffffff' }}>
                    
                    {/* Tags */}
                    {messages.length === 0 && (
                        <div className="flex items-center justify-start gap-2 mb-3 overflow-x-auto no-scrollbar pb-1 w-full" style={{ scrollBehavior: 'smooth' }}>
                            {tags.map((tag, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInput(tag)}
                                    className="shrink-0 text-[12px] px-3.5 py-1.5 rounded-full border transition-all shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap"
                                    style={{ color: isDark ? '#e5e7eb' : '#4b5563' }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Box - Made super premium and padded correctly */}
                    <div 
                        className="relative flex items-center rounded-3xl transition-all w-full box-border overflow-hidden"
                        style={{
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            boxShadow: `0 2px 10px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)'}`,
                            background: isDark ? '#1f2937' : '#ffffff'
                        }}
                        onFocusCapture={(e) => {
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`;
                        }}
                        onBlurCapture={(e) => {
                            e.currentTarget.style.borderColor = isDark ? '#374151' : '#e5e7eb';
                            e.currentTarget.style.boxShadow = `0 2px 10px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)'}`;
                        }}
                    >
                        <textarea
                            ref={inputRef as any}
                            value={input}
                            onChange={e => {
                                setInput(e.target.value);
                                e.target.style.height = '52px';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder="Ask Knobly anything..."
                            className="bg-transparent outline-none w-full box-border resize-none leading-[52px] pl-5 pr-14 font-normal"
                            style={{
                                color: isDark ? '#f9fafb' : '#111827',
                                height: 52,
                                minHeight: 52,
                                maxHeight: 120,
                                paddingTop: input.includes('\n') || input.length > 35 ? '14px' : '0',
                                lineHeight: input.includes('\n') || input.length > 35 ? '1.5' : '52px',
                            }}
                        />

                        {/* Send Button */}
                        <button
                            onClick={() => send()}
                            disabled={!input.trim() || loading}
                            className="absolute right-2.5 bottom-2.5 shrink-0 w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all shadow-sm"
                            style={{
                                background: input.trim() && !loading ? (isDark ? '#f3f4f6' : '#111827') : (isDark ? '#374151' : '#f3f4f6'),
                                color: input.trim() && !loading ? (isDark ? '#111827' : '#ffffff') : (isDark ? '#9ca3af' : '#9ca3af'),
                                cursor: input.trim() && !loading ? 'pointer' : 'default',
                                transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.95)',
                            }}
                        >
                            <ArrowUp size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="text-center mt-3.5 text-[11px]" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>
                        KnoblyAI can make mistakes. Double-check replies.
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
}
