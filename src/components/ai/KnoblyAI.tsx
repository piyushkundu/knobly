'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [isDark, setIsDark] = useState(true);
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

    // Detect theme
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Listen for external toggle event (from home sidebar CTA)
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

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ═══════════════════ FLOATING TRIGGER (hidden on desktop home, visible on mobile home) ═══════════════════ */}
            <div
                className={`fixed bottom-20 sm:bottom-5 right-5 z-[9999] select-none ${isHomePage ? 'xl:hidden' : ''}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Gradient ring with pulse glow */}
                <div
                    className="relative p-[2px] rounded-full transition-all duration-500"
                    style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #38bdf8, #a855f7)',
                        boxShadow: hovered
                            ? '0 0 25px rgba(139,92,246,0.6), 0 0 50px rgba(56,189,248,0.25)'
                            : '0 0 14px rgba(139,92,246,0.35)',
                        animation: 'breathe 2.5s ease-in-out infinite',
                    }}
                >
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="relative flex items-center justify-center transition-all duration-500 overflow-hidden"
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: 'linear-gradient(145deg, #0c1631 0%, #1a1145 50%, #0f172a 100%)',
                            transform: `scale(${hovered ? 1.08 : 1})`,
                        }}
                        title="KnoblyAI Assistant"
                    >
                        {open ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#closeGrad2)" strokeWidth="2.5" strokeLinecap="round">
                                <defs><linearGradient id="closeGrad2" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#c084fc" /><stop offset="1" stopColor="#38bdf8" /></linearGradient></defs>
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        ) : (
                            <span style={{
                                fontSize: 16,
                                fontWeight: 900,
                                letterSpacing: '0.04em',
                                background: 'linear-gradient(135deg, #c4b5fd 0%, #38bdf8 50%, #a78bfa 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>AI</span>
                        )}
                    </button>
                </div>
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
                        background: isDark
                            ? 'linear-gradient(180deg, #080d1f 0%, #0c1229 50%, #0a0f1e 100%)'
                            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                        border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.15)',
                        boxShadow: isDark
                            ? '0 0 80px rgba(139,92,246,0.1), 0 0 40px rgba(56,189,248,0.08), 0 24px 48px rgba(0,0,0,0.7)'
                            : '0 8px 40px rgba(0,0,0,0.12), 0 0 20px rgba(139,92,246,0.08)',
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
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full" style={{ background: '#22c55e', border: isDark ? '2px solid #0a0f1e' : '2px solid #fff' }} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#fff' : '#1e293b' }}>KnoblyAI</span>
                                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', fontWeight: 600, letterSpacing: 0.5 }}>PRO</span>
                            </div>
                            <div style={{ fontSize: 10, color: isDark ? '#64748b' : '#94a3b8', marginTop: 1 }}>⚡ Instant responses · Navigate anywhere</div>
                        </div>

                        <button
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center transition-all flex-shrink-0"
                            style={{ width: 28, height: 28, borderRadius: '50%', background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#a78bfa', border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.15)' }}
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
                                            : { background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(241,245,249,0.9)', border: isDark ? '1px solid rgba(139,92,246,0.12)' : '1px solid rgba(139,92,246,0.1)', color: isDark ? '#e2e8f0' : '#334155' }
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: m.content
                                                .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${isDark ? '#c4b5fd' : '#7c3aed'};font-weight:700">$1</strong>`)
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
                                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-md" style={{ background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(241,245,249,0.9)', border: isDark ? '1px solid rgba(139,92,246,0.12)' : '1px solid rgba(139,92,246,0.1)' }}>
                                    <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', animationDelay: '0ms' }} />
                                    <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animationDelay: '150ms' }} />
                                    <span className="animate-bounce" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ec4899', animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>


                    {/* ── Premium Ask Bar ── */}
                    <div className="px-4 pb-4 pt-2">
                        {/* Outer animated gradient border */}
                        <div className="relative rounded-[20px] p-[1.5px] overflow-hidden" style={{ background: 'linear-gradient(90deg, #8b5cf6, #38bdf8, #ec4899, #8b5cf6)', backgroundSize: '200% 100%', animation: 'gradientSlide 4s linear infinite' }}>
                            {/* Inner container */}
                            <div className="rounded-[19px] flex items-center gap-2 pl-4 pr-2 py-2" style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                                    : '#ffffff',
                            }}>
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Message KnoblyAI..."
                                    className="flex-1 bg-transparent outline-none min-w-0"
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: isDark ? '#e2e8f0' : '#1e293b',
                                        caretColor: '#a855f7',
                                    }}
                                />

                                {/* Send Button */}
                                <button
                                    onClick={() => send()}
                                    disabled={!input.trim() || loading}
                                    className="flex items-center justify-center transition-all duration-300 flex-shrink-0"
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 14,
                                        background: input.trim() && !loading
                                            ? 'linear-gradient(135deg, #8b5cf6, #6366f1, #38bdf8)'
                                            : isDark ? 'rgba(51,65,85,0.6)' : 'rgba(226,232,240,0.8)',
                                        color: input.trim() && !loading ? '#fff' : isDark ? '#64748b' : '#94a3b8',
                                        cursor: input.trim() && !loading ? 'pointer' : 'default',
                                        boxShadow: input.trim() && !loading
                                            ? '0 0 20px rgba(139,92,246,0.4), 0 4px 12px rgba(99,102,241,0.3)'
                                            : 'none',
                                        transform: input.trim() && !loading ? 'scale(1)' : 'scale(0.88)',
                                    }}
                                    onMouseEnter={e => { if (input.trim() && !loading) { (e.currentTarget).style.transform = 'scale(1.1) translateY(-1px)'; (e.currentTarget).style.boxShadow = '0 0 28px rgba(139,92,246,0.5), 0 6px 20px rgba(99,102,241,0.4)'; } }}
                                    onMouseLeave={e => { if (input.trim() && !loading) { (e.currentTarget).style.transform = 'scale(1)'; (e.currentTarget).style.boxShadow = '0 0 20px rgba(139,92,246,0.4), 0 4px 12px rgba(99,102,241,0.3)'; } }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ transform: input.trim() && !loading ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 9, fontWeight: 500, color: isDark ? '#475569' : '#94a3b8', letterSpacing: '0.06em' }}>
                            POWERED BY KNOBLYAI
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
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.15); opacity: 0.7; }
                }
                @keyframes gradientSlide {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
            `}</style>
        </>
    );
}
