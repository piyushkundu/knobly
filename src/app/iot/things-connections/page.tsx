'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, X, ChevronRight, Hash, Sparkles, Settings, Activity, Gauge, Thermometer, Repeat, Target, Clock, Zap, Cpu } from 'lucide-react';

function Sec({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section id={id} className="rounded-2xl p-5 md:p-7 mb-5 scroll-mt-20 transition-all duration-300 hover:shadow-lg bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2.5 mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>{icon}<h2 className="text-base md:text-lg font-extrabold text-gray-800">{title}</h2></div>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">{children}</div>
        </section>
    );
}

function Def({ children }: { children: ReactNode }) {
    return <div className="rounded-xl p-4 my-3 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #c4b5fd', color: '#4c1d95' }}>{children}</div>;
}

function IB({ type = 'tip', children }: { type?: 'tip' | 'note' | 'warning'; children: ReactNode }) {
    const s: Record<string, { bg: string; bc: string; tc: string; emoji: string }> = { tip: { bg: '#ecfeff', bc: '#67e8f9', tc: '#0e7490', emoji: '💡' }, note: { bg: '#eff6ff', bc: '#93c5fd', tc: '#1e40af', emoji: '📝' }, warning: { bg: '#fefce8', bc: '#fde047', tc: '#854d0e', emoji: '⚠️' } };
    const st = s[type];
    return <div className="rounded-xl p-3.5 text-xs font-medium my-3" style={{ background: st.bg, border: `1px solid ${st.bc}`, color: st.tc }}>{st.emoji} {children}</div>;
}

const tocItems = [
    { icon: <Settings size={13} />, label: 'Control System', id: 'control-system', color: '#8b5cf6' },
    { icon: <Repeat size={13} />, label: 'Types of System', id: 'types-system', color: '#06b6d4' },
    { icon: <Target size={13} />, label: 'Open Loop', id: 'open-loop', color: '#f97316' },
    { icon: <Activity size={13} />, label: 'Closed Loop', id: 'closed-loop', color: '#10b981' },
    { icon: <Clock size={13} />, label: 'Real Time System', id: 'real-time', color: '#ef4444' },
];

export default function IoTThingsConnections() {
    const [tocOpen, setTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('control-system');

    return (
        <div className="min-h-screen bg-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30" />
            </div>

            <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/iot" className="flex items-center justify-center w-9 h-9 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}><ArrowLeft size={16} /></Link>
                        <div>
                            <h1 className="text-sm font-extrabold text-gray-800">Things and Connections</h1>
                            <div className="flex items-center gap-1.5"><Sparkles size={8} className="text-purple-500" /><span className="text-[9px] uppercase tracking-[0.18em] font-bold text-purple-500">Chapter 2</span></div>
                        </div>
                    </div>
                    <button onClick={() => setTocOpen(!tocOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 border border-gray-200">
                        {tocOpen ? <X size={18} className="text-purple-500" /> : <Menu size={18} className="text-purple-500" />}
                    </button>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #f97316, #8b5cf6)' }} />
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                <aside className={`${tocOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[52px] left-0 z-40 lg:z-10 w-64 lg:w-56 xl:w-64 h-[calc(100vh-52px)] overflow-y-auto transition-transform duration-300 lg:flex-shrink-0 bg-white/95 backdrop-blur-xl`} style={{ borderRight: '1px solid #e2e8f0' }}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}><Hash size={12} className="text-white" /></div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-800">Contents</span>
                        </div>
                        <nav className="space-y-0.5">
                            {tocItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => { setActiveSection(item.id); setTocOpen(false); }}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                                    style={{ background: activeSection === item.id ? `${item.color}15` : 'transparent', border: activeSection === item.id ? `1px solid ${item.color}30` : '1px solid transparent', color: activeSection === item.id ? item.color : '#64748b' }}>
                                    <span style={{ color: item.color }}>{item.icon}</span>{item.label}
                                    {activeSection === item.id && <ChevronRight size={10} className="ml-auto" />}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>
                {tocOpen && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setTocOpen(false)} />}

                <main className="flex-1 min-w-0 px-4 py-6 lg:pl-6">
                    {/* Hero */}
                    <section className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 30%, #a855f7 60%, #0ea5e9 100%)', boxShadow: '0 8px 32px rgba(139,92,246,0.25)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
                        </div>
                        <div className="relative z-10 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                                <Sparkles size={10} /> Chapter 2 — O-Level M4-R5
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white" style={{ lineHeight: '1.2' }}>Things and Connections</h2>
                            <p className="text-sm md:text-base max-w-2xl mb-5 text-white/85">Control Systems ka working, Open loop &amp; Closed loop aur Real Time Systems ke baare mein seekho.</p>
                        </div>
                    </section>

                    {/* ═══ SECTION: Control System ═══ */}
                    <Sec id="control-system" title="🔹 Working of Control System" icon={<Settings size={16} className="text-purple-500" />}>
                        <Def>⚙️ <strong>Control System</strong> ek aisa system hota hai jo mechanical ya electronic devices ko control loops ke madhyam se control karta hai.</Def>
                        <p>Is system ka main kaam kisi bhi machine ya device ke <strong>behavior aur working ko manage karna</strong> hota hai.</p>
                        <p>IoT me bhi computerized control systems ka bahut use hota hai. Aaj industries me control system ka use machines ke kaam ko control karne ke liye kiya jata hai. Different types ke control systems alag-alag purpose ke liye kaam karte hain.</p>
                        
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0' }}>
                            <h4 className="font-bold text-slate-800 mb-2">🎯 Control System ka Purpose</h4>
                            <p className="text-sm text-slate-700">Control system ka use <strong>output ko control karne</strong> ke liye kiya jata hai. Ye system following parameters ko control karta hai:</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {['🏎️ Velocity', '🚀 Acceleration', '🌡️ Temperature', '⏱️ Pressure', '⚡ Voltage', '🔌 Current'].map((p, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm">{p}</span>
                                ))}
                            </div>
                        </div>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">✨ Features of Control System</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                            {['Accuracy', 'Sensitivity', 'Energy Saving', 'Stability', 'Noise', 'Bandwidth', 'Speed'].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    <span className="text-xs font-bold text-purple-800">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Types of System ═══ */}
                    <Sec id="types-system" title="🔹 Types of Control System" icon={<Repeat size={16} className="text-cyan-500" />}>
                        <p>Control system mainly <strong>do prakar (two types)</strong> ke hote hain:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="p-5 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-md transition-all">
                                <h4 className="font-bold text-orange-700 text-lg mb-2">1. Open Loop System</h4>
                                <p className="text-sm text-orange-800">Jisme output ko check nahi kiya jata. Isme koi feedback signal nahi hota.</p>
                            </div>
                            <div className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-md transition-all">
                                <h4 className="font-bold text-emerald-700 text-lg mb-2">2. Closed Loop System</h4>
                                <p className="text-sm text-emerald-800">Jisme output ko continuously monitor kiya jata hai aur feedback signal use hota hai.</p>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Open Loop ═══ */}
                    <Sec id="open-loop" title="🔴 (1) Open Loop Control System" icon={<Target size={16} className="text-orange-500" />}>
                        <Def>🎯 <strong>Open Loop Control System</strong> ko <em>non-feedback control system</em> bhi kaha jata hai kyunki is system me koi feedback signal ya error signal nahi hota.</Def>
                        <p>Ye ek <strong>simple control system</strong> hota hai jisme output ko check nahi kiya jata. System sirf input ke according kaam karta rehta hai.</p>
                        
                        <div className="my-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-center">
                            <h4 className="font-bold text-gray-800 mb-6 w-full text-center">📊 Open Loop System Diagram</h4>
                            
                            {/* Diagram for Open Loop */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl relative">
                                {/* Input Arrow */}
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-600 text-sm">Input</span>
                                    <div className="w-12 h-1 bg-gray-400 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45 transform origin-center translate-x-[2px]"></div>
                                    </div>
                                </div>
                                
                                {/* Controller Block */}
                                <div className="px-6 py-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-md shadow-blue-200 flex flex-col items-center w-32">
                                    <Cpu size={24} className="mb-2 opacity-80" />
                                    <span className="text-sm">Controller</span>
                                </div>
                                
                                {/* Arrow */}
                                <div className="h-8 w-1 sm:h-1 sm:w-12 bg-gray-400 relative">
                                    <div className="absolute bottom-0 sm:right-0 sm:top-1/2 left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-[2px] sm:-translate-y-1/2 w-3 h-3 border-b-2 border-r-2 sm:border-b-0 sm:border-t-2 sm:border-r-2 border-gray-400 rotate-45 transform origin-center translate-y-[2px] sm:translate-y-0"></div>
                                </div>
                                
                                {/* Process Block */}
                                <div className="px-6 py-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold shadow-md shadow-orange-200 flex flex-col items-center w-32">
                                    <Settings size={24} className="mb-2 opacity-80 animate-[spin_4s_linear_infinite]" />
                                    <span className="text-sm">Process</span>
                                </div>
                                
                                {/* Output Arrow */}
                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    <div className="h-8 w-1 sm:h-1 sm:w-12 bg-gray-400 relative">
                                        <div className="absolute bottom-0 sm:right-0 sm:top-1/2 left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-[2px] sm:-translate-y-1/2 w-3 h-3 border-b-2 border-r-2 sm:border-b-0 sm:border-t-2 sm:border-r-2 border-gray-400 rotate-45 transform origin-center translate-y-[2px] sm:translate-y-0"></div>
                                    </div>
                                    <span className="font-bold text-gray-600 text-sm">Output</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fdba74' }}>
                            <h4 className="font-bold text-orange-700 mb-2">⚡ Working of Open Loop System</h4>
                            <p className="text-sm text-orange-800">Jab system start hota hai to controller process ko control karta hai aur output produce hota hai. Lekin <strong>output sahi hai ya galat, iska feedback system ko nahi milta.</strong></p>
                            <p className="text-sm text-orange-800 mt-2">Isliye agar error ho bhi jaye to system usse <strong>automatically correct nahi karta.</strong></p>
                        </div>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">💡 Examples of Open Loop</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                            <div className="p-4 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
                                <div className="text-3xl mb-2">🚿</div>
                                <h5 className="font-bold text-sm text-gray-800">Water Heater</h5>
                                <p className="text-xs text-gray-500 mt-1">Jab ON kiya jata hai to continuously pani garam karta hai jab tak OFF na kare.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
                                <div className="text-3xl mb-2">🌀</div>
                                <h5 className="font-bold text-sm text-gray-800">Ceiling Fan</h5>
                                <p className="text-xs text-gray-500 mt-1">Speed set karne ke baad environment ke hisaab se khud speed change nahi karta.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-gray-200 text-center shadow-sm">
                                <div className="text-3xl mb-2">💡</div>
                                <h5 className="font-bold text-sm text-gray-800">Light Bulb</h5>
                                <p className="text-xs text-gray-500 mt-1">Switch ON karne par jalta rehta hai, din ya raat se isko khud farq nahi padta.</p>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Closed Loop ═══ */}
                    <Sec id="closed-loop" title="🔴 (2) Closed Loop Control System" icon={<Activity size={16} className="text-emerald-500" />}>
                        <Def>🔄 <strong>Closed Loop Control System</strong> ko <em>feedback control system</em> bhi kaha jata hai kyunki isme feedback signal use hota hai.</Def>
                        <p>Ye system continuously output ko monitor karta hai aur agar error milta hai to usse <strong>automatically correct karta hai.</strong></p>

                        <div className="my-6 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-center overflow-x-auto">
                            <h4 className="font-bold text-gray-800 mb-8 w-full text-center">📊 Closed Loop System Diagram</h4>
                            
                            {/* Diagram for Closed Loop */}
                            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl min-w-[500px] py-8">
                                {/* Feedback Path - Drawn first so it's behind blocks if needed, but mostly above/below */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                    {/* Line down from Output */}
                                    <path d="M 80% 50% L 80% 90% L 35% 90% L 35% 50%" fill="none" stroke="#9ca3af" strokeWidth="4" />
                                    <polygon points="35%,50% 32%,55% 38%,55%" fill="#9ca3af" />
                                    <text x="57%" y="85%" textAnchor="middle" fill="#4b5563" fontSize="14" fontWeight="bold">Feedback</text>
                                </svg>

                                {/* Input */}
                                <div className="flex items-center gap-2 relative z-10">
                                    <span className="font-bold text-gray-600 text-sm">Input</span>
                                    <div className="w-12 h-1 bg-gray-400 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45 transform origin-center translate-x-[2px]"></div>
                                    </div>
                                </div>
                                
                                {/* Comparator (Circle) */}
                                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 bg-white flex items-center justify-center relative z-10 shadow-sm">
                                    <span className="text-emerald-600 font-bold text-xl">⨯</span>
                                </div>

                                {/* Arrow */}
                                <div className="w-10 h-1 bg-gray-400 relative z-10">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45 transform origin-center translate-x-[2px]"></div>
                                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-bold">Error</span>
                                </div>

                                {/* Controller Block */}
                                <div className="px-5 py-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-md shadow-blue-200 flex flex-col items-center w-28 relative z-10">
                                    <Cpu size={20} className="mb-2 opacity-80" />
                                    <span className="text-xs">Controller</span>
                                </div>
                                
                                {/* Arrow */}
                                <div className="w-10 h-1 bg-gray-400 relative z-10">
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45 transform origin-center translate-x-[2px]"></div>
                                </div>
                                
                                {/* Process Block */}
                                <div className="px-5 py-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold shadow-md shadow-emerald-200 flex flex-col items-center w-28 relative z-10">
                                    <Settings size={20} className="mb-2 opacity-80 animate-[spin_4s_linear_infinite]" />
                                    <span className="text-xs">Process</span>
                                </div>
                                
                                {/* Output */}
                                <div className="flex items-center gap-2 relative z-10 w-24">
                                    <div className="w-10 h-1 bg-gray-400 relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45 transform origin-center translate-x-[2px]"></div>
                                    </div>
                                    <span className="font-bold text-gray-600 text-sm">Output</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac' }}>
                            <h4 className="font-bold text-emerald-700 mb-2">⚡ Working of Closed Loop System</h4>
                            <p className="text-sm text-emerald-800">Is system me output ka kuch part <strong>feedback</strong> ke roop me wapas controller ko diya jata hai. Controller actual output aur desired output ko compare karta hai.</p>
                            <p className="text-sm text-emerald-800 mt-2">Agar dono me difference hota hai to controller error ko reduce karta hai aur output ko improve karta hai. Isliye closed loop system <strong>jyada accurate aur efficient</strong> hota hai.</p>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Real Time System ═══ */}
                    <Sec id="real-time" title="🔹 Real Time System" icon={<Clock size={16} className="text-red-500" />}>
                        <Def>⏱️ <strong>Real Time System</strong> ek aisa system hota hai jiska use un kaamon ke liye kiya jata hai jo <em>time se related hote hain</em> aur jinhe ek <em>fixed time period ke andar complete karna zaruri hota hai.</em></Def>
                        <p>Agar system given time ke andar result provide nahi karta to system <strong>fail</strong> maana jata hai.</p>
                        <p>Real time system me <strong>fast processing aur quick response</strong> bahut important hota hai.</p>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">🌟 Examples of Real Time System</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                            <div className="flex items-start gap-4 p-4 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/30">
                                <div className="text-3xl bg-white p-2 rounded-xl shadow-sm">✈️</div>
                                <div>
                                    <h4 className="font-bold text-red-700 mb-1">Air Traffic Control System</h4>
                                    <p className="text-xs text-red-800">Ek second ki delay se bhi bada accident ho sakta hai, isliye iska response turant aana zaruri hai.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/30">
                                <div className="text-3xl bg-white p-2 rounded-xl shadow-sm">🚘</div>
                                <div>
                                    <h4 className="font-bold text-blue-700 mb-1">Automation Driving System</h4>
                                    <p className="text-xs text-blue-800">Agar aage koi object aata hai to system ko microseconds me break apply karna hota hai.</p>
                                </div>
                            </div>
                        </div>
                        <IB type="tip">Ye systems real-time data ko process karte hain aur <strong>turant decision lete hain!</strong></IB>
                    </Sec>
                </main>
            </div>
        </div>
    );
}
