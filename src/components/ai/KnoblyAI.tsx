'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

const QUICK_ACTIONS = [
    { emoji: '🏠', label: 'Home', path: '/' },
    { emoji: '📊', label: 'Dashboard', path: '/dashboard' },
    { emoji: '🐍', label: 'Python', path: '/python' },
    { emoji: '🌐', label: 'HTML', path: '/html' },
    { emoji: '📝', label: 'MCQ', path: '/mcq' },
    { emoji: '📒', label: 'Notes', path: '/notes' },
];

export default function KnoblyAI() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [particles] = useState(() =>
        Array.from({ length: 6 }, (_, i) => ({
            id: i,
            size: 2 + Math.random() * 3,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 3 + Math.random() * 4,
            delay: Math.random() * 2,
        }))
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 250);
            if (messages.length === 0) {
                setMessages([{
                    role: 'assistant',
                    content: '👋 **Namaste!** Main KnoblyAI hoon — aapka personal assistant.\n\nKya karna chahte ho? Neeche se choose karo ya kuch bhi poochho!',
                    navOptions: [
                        { path: '/dashboard', label: '📊 Dashboard' },
                        { path: '/python', label: '🐍 Python Course' },
                        { path: '/html', label: '🌐 HTML Course' },
                        { path: '/mcq', label: '📝 MCQ Practice' },
                        { path: '/notes', label: '📒 Study Notes' },
                        { path: '/', label: '🏠 Home Page' },
                    ]
                }]);
            }
        }
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const navigateTo = useCallback((path: string) => {
        setOpen(false);
        setTimeout(() => router.push(path), 200);
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

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ═══════════════════ FLOATING TRIGGER ═══════════════════ */}
            <div
                className="fixed bottom-5 right-5 z-[9999] select-none"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Outer glow rings */}
                <div
                    className="absolute rounded-full transition-all duration-700"
                    style={{
                        inset: open ? -6 : -4,
                        background: `conic-gradient(from ${Date.now() / 10 % 360}deg, #38bdf8, #8b5cf6, #ec4899, #f59e0b, #22c55e, #38bdf8)`,
                        filter: `blur(${open ? 12 : 8}px)`,
                        opacity: open ? 0.7 : hovered ? 0.6 : 0.35,
                        animation: 'spin 4s linear infinite',
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        inset: -2,
                        background: 'conic-gradient(from 180deg, #38bdf8, #8b5cf6, #ec4899, #38bdf8)',
                        filter: 'blur(4px)',
                        opacity: open ? 0.5 : 0.2,
                        animation: 'spin 6s linear infinite reverse',
                    }}
                />

                {/* Main button */}
                <button
                    onClick={() => setOpen(o => !o)}
                    className="relative flex items-center justify-center transition-all duration-500"
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: open
                            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        border: '2px solid rgba(139, 92, 246, 0.5)',
                        boxShadow: open
                            ? '0 0 30px rgba(139,92,246,0.4), inset 0 0 20px rgba(56,189,248,0.1)'
                            : '0 0 20px rgba(56,189,248,0.25), inset 0 0 15px rgba(139,92,246,0.05)',
                        transform: `scale(${open ? 0.92 : hovered ? 1.12 : 1}) rotate(${open ? 180 : 0}deg)`,
                    }}
                    title="KnoblyAI Assistant"
                >
                    {open ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    ) : (
                        <div className="relative" style={{ width: 32, height: 32 }}>
                            {/* AI Brain icon */}
                            <svg viewBox="0 0 40 40" width="32" height="32">
                                <defs>
                                    <linearGradient id="knoblyAIGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#38bdf8" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <circle cx="20" cy="20" r="10" fill="url(#knoblyAIGrad)" opacity="0.9" />
                                <circle cx="20" cy="20" r="4" fill="white" opacity="0.95" />
                                {/* Neural network lines */}
                                <line x1="20" y1="10" x2="20" y2="6" stroke="#8b5cf6" strokeWidth="1.2" opacity="0.6" />
                                <line x1="20" y1="30" x2="20" y2="34" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
                                <line x1="10" y1="20" x2="6" y2="20" stroke="#ec4899" strokeWidth="1.2" opacity="0.6" />
                                <line x1="30" y1="20" x2="34" y2="20" stroke="#22c55e" strokeWidth="1.2" opacity="0.6" />
                                {/* Corner nodes */}
                                <circle cx="20" cy="6" r="2" fill="#8b5cf6" opacity="0.8" />
                                <circle cx="20" cy="34" r="2" fill="#38bdf8" opacity="0.8" />
                                <circle cx="6" cy="20" r="2" fill="#ec4899" opacity="0.8" />
                                <circle cx="34" cy="20" r="2" fill="#22c55e" opacity="0.8" />
                            </svg>
                            {/* Pulse ring */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    animation: 'ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
                                }}
                            />
                        </div>
                    )}
                </button>
            </div>

            {/* ═══════════════════ CHAT PANEL ═══════════════════ */}
            <div
                className={`fixed z-[9998] transition-all duration-500 ease-out ${open
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                    }`}
                style={{
                    bottom: 80,
                    right: 20,
                    width: 'min(400px, calc(100vw - 32px))',
                    transformOrigin: 'bottom right',
                }}
            >
                <div
                    className="rounded-[28px] overflow-hidden flex flex-col"
                    style={{
                        maxHeight: 'min(560px, calc(100vh - 120px))',
                        background: 'linear-gradient(180deg, #080d1f 0%, #0c1229 50%, #0a0f1e 100%)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        boxShadow: '0 0 80px rgba(139,92,246,0.1), 0 0 40px rgba(56,189,248,0.08), 0 24px 48px rgba(0,0,0,0.7)',
                    }}
                >
                    {/* ── Header ── */}
                    <div className="relative px-4 py-3 flex items-center gap-3 overflow-hidden" style={{ borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                        {/* Animated gradient line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #8b5cf6, #38bdf8, #ec4899, transparent)', animation: 'shimmer 3s ease-in-out infinite', backgroundSize: '200% 100%' }} />
                        {/* Floating particles */}
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className="absolute rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    left: `${p.x}%`,
                                    top: `${p.y}%`,
                                    background: ['#8b5cf6', '#38bdf8', '#ec4899', '#22c55e', '#f59e0b', '#ef4444'][p.id],
                                    opacity: 0.3,
                                    animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
                                }}
                            />
                        ))}

                        {/* Avatar */}
                        <div className="relative h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)',
                                boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                            }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>K</span>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full" style={{ background: '#22c55e', border: '2px solid #0a0f1e' }} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>KnoblyAI</span>
                                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', fontWeight: 600, letterSpacing: 0.5 }}>PRO</span>
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>⚡ Instant responses · Navigate anywhere</div>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center transition-all flex-shrink-0"
                            style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* ── Messages ── */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0" style={{ scrollbarWidth: 'thin' }}>
                        {messages.map((m, i) => (
                            <div key={i}>
                                <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-1.5`}>
                                    {m.role === 'assistant' && (
                                        <div className="flex-shrink-0 mt-0.5" style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>K</span>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[82%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'rounded-2xl rounded-tr-md' : 'rounded-2xl rounded-tl-md'}`}
                                        style={m.role === 'user'
                                            ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#f0e6ff', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }
                                            : { background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(139,92,246,0.12)', color: '#e2e8f0' }
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: m.content
                                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c4b5fd;font-weight:700">$1</strong>')
                                                .replace(/\n/g, '<br/>')
                                        }}
                                    />
                                </div>

                                {/* ── Navigation Option Cards ── */}
                                {m.navOptions && m.navOptions.length > 0 && (
                                    <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                                        {m.navOptions.map((opt, j) => (
                                            <button
                                                key={j}
                                                onClick={() => navigateTo(opt.path)}
                                                className="transition-all duration-200"
                                                style={{
                                                    fontSize: 12,
                                                    padding: '6px 12px',
                                                    borderRadius: 12,
                                                    background: 'rgba(139,92,246,0.1)',
                                                    border: '1px solid rgba(139,92,246,0.25)',
                                                    color: '#c4b5fd',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}
                                                onMouseEnter={e => {
                                                    (e.target as HTMLElement).style.background = 'rgba(139,92,246,0.25)';
                                                    (e.target as HTMLElement).style.borderColor = 'rgba(139,92,246,0.5)';
                                                    (e.target as HTMLElement).style.color = '#e9d5ff';
                                                    (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                                    (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(139,92,246,0.2)';
                                                }}
                                                onMouseLeave={e => {
                                                    (e.target as HTMLElement).style.background = 'rgba(139,92,246,0.1)';
                                                    (e.target as HTMLElement).style.borderColor = 'rgba(139,92,246,0.25)';
                                                    (e.target as HTMLElement).style.color = '#c4b5fd';
                                                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                                                    (e.target as HTMLElement).style.boxShadow = 'none';
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start gap-1.5">
                                <div className="flex-shrink-0 mt-0.5" style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>K</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-md" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(139,92,246,0.12)' }}>
                                    <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animationDelay: '0ms' }} />
                                    <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animationDelay: '150ms' }} />
                                    <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Quick Actions Grid (only on first load) ── */}
                    {messages.length <= 1 && !loading && (
                        <div className="px-3 pb-2">
                            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>Quick Actions</div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {QUICK_ACTIONS.map(a => (
                                    <button
                                        key={a.path}
                                        onClick={() => navigateTo(a.path)}
                                        className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden relative group"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.4)',
                                            border: '1px solid rgba(139,92,246,0.15)',
                                            backdropFilter: 'blur(8px)',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.15)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.4)';
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)';
                                            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px -6px rgba(139,92,246,0.25), inset 0 1px 1px rgba(255,255,255,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(15, 23, 42, 0.4)';
                                            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.15)';
                                            (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{a.emoji}</span>
                                        <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.02em' }}>{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Input ── */}
                    <div className="px-3 pb-3 pt-1">
                        <div
                            className="flex items-center gap-2 rounded-full px-4 py-3 transition-all duration-300"
                            style={{
                                background: 'linear-gradient(145deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.6) 100%)',
                                border: '1px solid rgba(139,92,246,0.25)',
                                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 15px rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(12px)',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.border = '1px solid rgba(139,92,246,0.6)';
                                e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.2)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.border = '1px solid rgba(139,92,246,0.25)';
                                e.currentTarget.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 15px rgba(0,0,0,0.3)';
                            }}
                        >
                            <div className="flex-shrink-0 text-purple-400 mr-1">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Kuch bhi puchhiye ya search kariye..."
                                className="flex-1 bg-transparent outline-none min-w-0 font-medium placeholder:text-slate-500"
                                style={{ fontSize: 14, color: '#f8fafc', caretColor: '#a855f7' }}
                            />
                            <button
                                onClick={() => send()}
                                disabled={!input.trim() || loading}
                                className="flex items-center justify-center transition-all duration-200"
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: input.trim() && !loading
                                        ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                                        : 'rgba(30,41,59,0.8)',
                                    color: input.trim() && !loading ? '#fff' : '#64748b',
                                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                    boxShadow: input.trim() && !loading ? '0 4px 15px rgba(168,85,247,0.4), inset 0 2px 4px rgba(255,255,255,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                                    transform: input.trim() && !loading ? 'scale(1.05)' : 'scale(1)',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: input.trim() ? 'translate(1px, -1px)' : 'none', transition: 'transform 0.2s' }}>
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 6, fontSize: 9, color: '#374151' }}>
                            Powered by KnoblyAI · Ask anything
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════ KEYFRAMES ═══════════════════ */}
            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0) translateX(0); }
                    100% { transform: translateY(-8px) translateX(4px); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}
