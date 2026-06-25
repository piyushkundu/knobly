'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, X, ChevronRight, Hash, Sparkles, Shield, Lock, AlertTriangle, Bug, Eye, Mail, Globe, Server, Wifi, Users, Key, FileWarning, ShieldCheck, ShieldAlert, Skull, Fingerprint, Network, Zap, CheckCircle2, Activity, Layers, Search, MonitorSmartphone, CloudOff, UserX, Smartphone, Database, Radio } from 'lucide-react';

function Sec({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section id={id} className="rounded-2xl p-5 md:p-7 mb-5 scroll-mt-20 transition-all duration-300 hover:shadow-lg bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2.5 mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>{icon}<h2 className="text-base md:text-lg font-extrabold text-gray-800">{title}</h2></div>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">{children}</div>
        </section>
    );
}

function Def({ children }: { children: ReactNode }) {
    return <div className="rounded-xl p-4 my-3 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)', border: '1px solid #fca5a5', color: '#991b1b' }}>{children}</div>;
}

function IB({ type = 'tip', children }: { type?: 'tip' | 'note' | 'warning'; children: ReactNode }) {
    const s: Record<string, { bg: string; bc: string; tc: string; emoji: string }> = { tip: { bg: '#fef2f2', bc: '#fca5a5', tc: '#991b1b', emoji: '💡' }, note: { bg: '#eff6ff', bc: '#93c5fd', tc: '#1e40af', emoji: '📝' }, warning: { bg: '#fefce8', bc: '#fde047', tc: '#854d0e', emoji: '⚠️' } };
    const st = s[type];
    return <div className="rounded-xl p-3.5 text-xs font-medium my-3" style={{ background: st.bg, border: `1px solid ${st.bc}`, color: st.tc }}>{st.emoji} {children}</div>;
}

const tocItems = [
    { icon: <Shield size={13} />, label: 'Need of Security', id: 'need-security', color: '#ef4444' },
    { icon: <ShieldCheck size={13} />, label: 'Network Security', id: 'network-security', color: '#3b82f6' },
    { icon: <Skull size={13} />, label: 'Cyber Attacks', id: 'cyber-attacks', color: '#8b5cf6' },
    { icon: <Users size={13} />, label: 'Types of Hackers', id: 'hacker-types', color: '#f59e0b' },
    { icon: <Bug size={13} />, label: 'Malware Attack', id: 'malware-attack', color: '#10b981' },
    { icon: <Mail size={13} />, label: 'Phishing Attack', id: 'phishing-attack', color: '#ec4899' },
    { icon: <Server size={13} />, label: 'DDoS Attack', id: 'ddos-attack', color: '#f43f5e' },
];

export default function IoTSecurity() {
    const [tocOpen, setTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('need-security');

    return (
        <div className="min-h-screen bg-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white to-rose-50/30" />
            </div>

            <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/iot" className="flex items-center justify-center w-9 h-9 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><ArrowLeft size={16} /></Link>
                        <div>
                            <h1 className="text-sm font-extrabold text-gray-800">Security & Future of IoT</h1>
                            <div className="flex items-center gap-1.5"><Sparkles size={8} className="text-red-500" /><span className="text-[9px] uppercase tracking-[0.18em] font-bold text-red-500">Chapter 5</span></div>
                        </div>
                    </div>
                    <button onClick={() => setTocOpen(!tocOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 border border-gray-200">
                        {tocOpen ? <X size={18} className="text-red-500" /> : <Menu size={18} className="text-red-500" />}
                    </button>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #ef4444, #f87171, #dc2626, #ef4444)' }} />
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                <aside className={`${tocOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[52px] left-0 z-40 lg:z-10 w-64 lg:w-56 xl:w-64 h-[calc(100vh-52px)] overflow-y-auto transition-transform duration-300 lg:flex-shrink-0 bg-white/95 backdrop-blur-xl`} style={{ borderRight: '1px solid #e2e8f0' }}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><Hash size={12} className="text-white" /></div>
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
                    <section className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 30%, #ef4444 60%, #fca5a5 100%)', boxShadow: '0 8px 32px rgba(239,68,68,0.25)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
                            {/* Animated shield pattern */}
                            <svg className="absolute right-4 bottom-4 w-32 h-32 opacity-10" viewBox="0 0 100 100">
                                <path d="M50 5 L90 25 L90 55 Q90 80 50 95 Q10 80 10 55 L10 25 Z" fill="white" stroke="white" strokeWidth="2">
                                    <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
                                </path>
                            </svg>
                        </div>
                        <div className="relative z-10 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#450a0a' }}>
                                <Sparkles size={10} /> Chapter 5 — O-Level M4-R5
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white" style={{ lineHeight: '1.2' }}>Security & Future of IoT</h2>
                            <p className="text-sm md:text-base max-w-2xl mb-5 text-white/90 font-medium">IoT Security ke importance ko samjhiye — Cyber Attacks, Hackers, Malware, Phishing aur DDoS Attacks ke baare mein jaaniye.</p>
                        </div>
                    </section>

                    {/* ═══ SECTION: Need of Security in IoT ═══ */}
                    <Sec id="need-security" title="🔴 Need of Security in IoT" icon={<Shield size={16} className="text-red-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <Def>🛡️ आज के समय में लगभग सभी प्रकार के व्यवसाय <strong>Cyber Based</strong> हो चुके हैं। जब Internet, LAN तथा विभिन्न Network Methods का उपयोग किया जाता है, तब Cyber खतरों से बचने तथा महत्वपूर्ण Data को सुरक्षित रखने के लिए <strong>Network Security</strong> की आवश्यकता होती है।</Def>
                                <p>Network Security ka mukhya uddeshya kisi bhi Network ko <strong>Unauthorized Attack</strong> se bachana hota hai। Iske madhyam se Hacking, Data Loss, Data Modification, Identity Theft, DDoS Attack aadi Cyber Crime ko roka ja sakta hai tatha Users ko surakshit Platform uplabdh karaya jaata hai।</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/iot_network_security.png" alt="IoT Network Security" className="w-full h-auto rounded-2xl shadow-md border border-red-100" />
                            </div>
                        </div>

                        {/* Security Components */}
                        <div className="mt-5">
                            <p className="text-xs font-bold text-red-800 mb-3 uppercase tracking-wide">🔒 High Security ke अंतर्गत शामिल Software:</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {[
                                    { title: 'Antivirus', icon: <ShieldCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                    { title: 'Firewall', icon: <Shield size={20} />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                                    { title: 'Network Monitor', icon: <Activity size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                    { title: 'Applications', icon: <MonitorSmartphone size={20} />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                                    { title: 'Access Control', icon: <Key size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                ].map((f, i) => (
                                    <div key={i} className={`p-3 rounded-xl ${f.bg} ${f.border} border text-center flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow`}>
                                        <div className={f.color}>{f.icon}</div>
                                        <span className="text-[11px] font-bold text-gray-800">{f.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Why Security Matters Flow */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-5">
                            <p className="text-sm text-red-900 font-semibold mb-3">🔐 IoT Security kyun zaroori hai:</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <span className="px-4 py-2 bg-white rounded-lg border border-red-200 text-red-700 shadow-sm font-bold text-xs flex items-center gap-1"><Wifi size={14} /> 1. IoT Devices Connected</span>
                                <ChevronRight className="text-red-400 rotate-90 sm:rotate-0" />
                                <span className="px-4 py-2 bg-red-600 rounded-lg text-white shadow-md font-bold text-xs flex items-center gap-1"><AlertTriangle size={14} /> 2. Cyber Threats</span>
                                <ChevronRight className="text-red-400 rotate-90 sm:rotate-0" />
                                <span className="px-4 py-2 bg-white rounded-lg border border-red-200 text-red-700 shadow-sm font-bold text-xs flex items-center gap-1"><ShieldCheck size={14} /> 3. Security Required</span>
                            </div>
                        </div>

                        <IB type="warning">IoT devices me limited computing power hoti hai isliye traditional security methods directly apply nahi ho sakte। Special lightweight security protocols ki zaroorat hoti hai।</IB>
                    </Sec>

                    {/* ═══ SECTION: Network Security ═══ */}
                    <Sec id="network-security" title="🔴 Network Security" icon={<ShieldCheck size={16} className="text-blue-500" />}>
                        <p className="mb-4">Network Security ka mukhya uddeshya kisi bhi Network ko <strong>Unauthorized Attack</strong> se bachana hota hai। Iske madhyam se vibhinn prakar ke Cyber Crimes ko roka ja sakta hai।</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'Hacking', desc: 'Unauthorized access se system ko hack karna', icon: <Skull size={18} />, color: 'red' },
                                { title: 'Data Loss', desc: 'Important data ka chori hona ya delete hona', icon: <Database size={18} />, color: 'orange' },
                                { title: 'Data Modification', desc: 'Data me unauthorized changes karna', icon: <FileWarning size={18} />, color: 'amber' },
                                { title: 'Identity Theft', desc: 'Kisi ki personal identity chura lena', icon: <UserX size={18} />, color: 'purple' },
                                { title: 'DDoS Attack', desc: 'Server par excessive traffic bhejkar crash karna', icon: <CloudOff size={18} />, color: 'rose' },
                                { title: 'Unauthorized Access', desc: 'Bina permission ke system me ghusna', icon: <Lock size={18} />, color: 'indigo' },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-xl bg-${item.color}-50 border border-${item.color}-100 flex items-start gap-3 hover:shadow-md transition-shadow`} style={{ background: `var(--${item.color}-50, #fef2f2)` }}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ background: i === 0 ? '#fef2f2' : i === 1 ? '#fff7ed' : i === 2 ? '#fffbeb' : i === 3 ? '#faf5ff' : i === 4 ? '#fff1f2' : '#eef2ff', color: i === 0 ? '#dc2626' : i === 1 ? '#ea580c' : i === 2 ? '#d97706' : i === 3 ? '#9333ea' : i === 4 ? '#e11d48' : '#4f46e5' }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h4>
                                        <p className="text-xs text-gray-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <IB type="note">Network Security ke through <strong>Users ko surakshit Platform</strong> uplabdh karaya jaata hai jisme unka data safe rehta hai aur koi unauthorized person access nahi kar sakta।</IB>
                    </Sec>

                    {/* ═══ SECTION: Cyber Attacks ═══ */}
                    <Sec id="cyber-attacks" title="🔴 Cyber Attacks" icon={<Skull size={16} className="text-purple-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <Def>⚡ <strong>Cyber Attack</strong> karne wala vyakti ek <strong>Computer Hacking Expert</strong> hota hai, jo Unauthorized roop se kisi Network mein pravesh karke doosre Computer, Website ya Data ko <strong>Hack</strong> kar sakta hai।</Def>
                                <p>Cyber Attacks ka main motive hota hai:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        { label: 'Data Chori karna', icon: '🔓' },
                                        { label: 'System ko Damage karna', icon: '💥' },
                                        { label: 'Ransom Demand karna', icon: '💰' },
                                        { label: 'Service Band karna', icon: '🚫' },
                                    ].map((m, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 border border-purple-100 text-sm text-purple-800 font-medium">
                                            <span>{m.icon}</span>{m.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/cyber_attacks_types.png" alt="Cyber Attacks Types" className="w-full h-auto rounded-2xl shadow-md border border-purple-100" />
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Types of Hackers ═══ */}
                    <Sec id="hacker-types" title="🔴 Types of Hackers" icon={<Users size={16} className="text-amber-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1">
                                <p className="mb-3">Hackers mukhya roop se <strong>teen prakar</strong> ke hote hain jo alag-alag uddeshya se kaam karte hain:</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/hacker_types.png" alt="Types of Hackers" className="w-full h-auto rounded-2xl shadow-md border border-amber-100" />
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* White Hat Hacker */}
                            <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><ShieldCheck size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">🟢 1. White Hat Hacker</h4>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Ethical Hacker</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">White Hat Hackers ko <strong>Ethical Hackers</strong> bhi kaha jaata hai। Ye legally aur authorized tarike se kisi company ya organization ke system ki security test karte hain।</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                        <p className="text-xs font-bold text-emerald-800 mb-1">✅ Kaam</p>
                                        <ul className="text-xs text-emerald-700 space-y-1 ml-4 list-disc marker:text-emerald-400">
                                            <li>Security vulnerabilities dhundhna</li>
                                            <li>Penetration testing karna</li>
                                            <li>System ko surakshit banana</li>
                                        </ul>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                        <p className="text-xs font-bold text-green-800 mb-1">🏢 Example</p>
                                        <ul className="text-xs text-green-700 space-y-1 ml-4 list-disc marker:text-green-400">
                                            <li>Bug Bounty programs</li>
                                            <li>Security audit firms</li>
                                            <li>Government cyber security teams</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Black Hat Hacker */}
                            <div className="p-5 rounded-2xl bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gray-900 text-red-400 rounded-xl"><Skull size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">⚫ 2. Black Hat Hacker</h4>
                                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Criminal Hacker</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Black Hat Hackers galat uddeshya se kisi ke system me <strong>bina permission ke ghuste hain</strong>। Ye data chori, system damage, aur ransomware attacks karte hain।</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                                        <p className="text-xs font-bold text-red-800 mb-1">❌ Kaam</p>
                                        <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc marker:text-red-400">
                                            <li>Data theft aur selling</li>
                                            <li>Ransomware attacks</li>
                                            <li>System ko hack karna</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <p className="text-xs font-bold text-gray-800 mb-1">⚠️ Impact</p>
                                        <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc marker:text-gray-400">
                                            <li>Financial loss</li>
                                            <li>Privacy breach</li>
                                            <li>Legal punishment</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Grey Hat Hacker */}
                            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-gray-200 text-gray-600 rounded-xl"><Search size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">🔘 3. Grey Hat Hacker</h4>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Mixed Intent</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Grey Hat Hackers White aur Black Hat ke beech me aate hain। Ye <strong>bina permission ke system me ghuste hain</strong> lekin nuksaan pahunchana inki niyat nahi hoti। Ye vulnerabilities dhundh kar company ko inform karte hain।</p>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-800 mb-1">🔄 Behavior</p>
                                    <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc marker:text-gray-400">
                                        <li>Bina permission ke test karte hain</li>
                                        <li>Bug report karte hain company ko</li>
                                        <li>Kabhi kabhi reward maangte hain</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-xs border-collapse rounded-xl overflow-hidden shadow-sm">
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
                                        <th className="p-3 text-left text-white font-bold">Feature</th>
                                        <th className="p-3 text-center text-emerald-300 font-bold">🟢 White Hat</th>
                                        <th className="p-3 text-center text-red-300 font-bold">⚫ Black Hat</th>
                                        <th className="p-3 text-center text-gray-300 font-bold">🔘 Grey Hat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { feature: 'Intent', white: 'Ethical / Legal', black: 'Malicious / Illegal', grey: 'Mixed' },
                                        { feature: 'Permission', white: '✅ Authorized', black: '❌ Unauthorized', grey: '⚠️ Sometimes' },
                                        { feature: 'Purpose', white: 'Security Testing', black: 'Data Theft / Damage', grey: 'Bug Finding' },
                                        { feature: 'Legal Status', white: 'Legal', black: 'Illegal', grey: 'Questionable' },
                                    ].map((row, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="p-3 font-bold text-gray-800 border-b border-gray-100">{row.feature}</td>
                                            <td className="p-3 text-center text-emerald-700 border-b border-gray-100">{row.white}</td>
                                            <td className="p-3 text-center text-red-700 border-b border-gray-100">{row.black}</td>
                                            <td className="p-3 text-center text-gray-600 border-b border-gray-100">{row.grey}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Malware Attack ═══ */}
                    <Sec id="malware-attack" title="🔴 1. Malware Attack" icon={<Bug size={16} className="text-emerald-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <Def>🦠 <strong>Malware Attack</strong> ek <strong>Malicious Software Attack</strong> hota hai। Isme Hackers vibhinn tarikon se E-mail, Message ya Internet Popup ke madhyam se User ko kisi Software ko Install karne ke liye prerit karte hain।</Def>
                                <p>Jab User galti se us Software ko <strong>Install kar leta hai</strong>, tab uske System ka Control <strong>Hackers ke paas pahunch</strong> sakta hai।</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/malware_attack.png" alt="Malware Attack" className="w-full h-auto rounded-2xl shadow-md border border-emerald-100" />
                            </div>
                        </div>

                        {/* How Malware Spreads */}
                        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
                            <h4 className="text-xs font-bold text-red-800 mb-3 uppercase tracking-wide">📨 Malware kaise failta hai:</h4>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <span className="px-4 py-2 bg-white rounded-lg border border-red-200 text-red-700 shadow-sm font-bold text-xs flex items-center gap-1"><Mail size={14} /> E-mail / Message</span>
                                <ChevronRight className="text-red-400 rotate-90 sm:rotate-0" />
                                <span className="px-4 py-2 bg-red-600 rounded-lg text-white shadow-md font-bold text-xs flex items-center gap-1"><AlertTriangle size={14} /> Fake Software Install</span>
                                <ChevronRight className="text-red-400 rotate-90 sm:rotate-0" />
                                <span className="px-4 py-2 bg-white rounded-lg border border-red-200 text-red-700 shadow-sm font-bold text-xs flex items-center gap-1"><Skull size={14} /> System Hacked!</span>
                            </div>
                        </div>

                        {/* Types of Malware */}
                        <div className="mt-5">
                            <h4 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">🔍 Types of Malware:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { name: 'Virus', desc: 'File attach hokar failta hai', icon: '🦠', bg: '#fef2f2', border: '#fecaca' },
                                    { name: 'Worm', desc: 'Khud copy hokar network me failta hai', icon: '🐛', bg: '#fefce8', border: '#fef08a' },
                                    { name: 'Trojan', desc: 'Legitimate software jaisa dikhta hai', icon: '🐴', bg: '#f0fdf4', border: '#bbf7d0' },
                                    { name: 'Ransomware', desc: 'Data lock karke ransom maangta hai', icon: '🔒', bg: '#faf5ff', border: '#e9d5ff' },
                                    { name: 'Spyware', desc: 'User ki activity monitor karta hai', icon: '👁️', bg: '#eff6ff', border: '#bfdbfe' },
                                    { name: 'Adware', desc: 'Unwanted ads dikhata hai', icon: '📢', bg: '#fff7ed', border: '#fed7aa' },
                                ].map((m, i) => (
                                    <div key={i} className="p-3 rounded-xl text-center hover:shadow-md transition-shadow" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                                        <div className="text-2xl mb-1">{m.icon}</div>
                                        <p className="text-xs font-bold text-gray-800">{m.name}</p>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{m.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <IB type="tip">Malware se bachne ke liye hamesha <strong>trusted sources</strong> se hi software download karein aur <strong>Antivirus</strong> software updated rakhein।</IB>
                    </Sec>

                    {/* ═══ SECTION: Phishing Attack ═══ */}
                    <Sec id="phishing-attack" title="🔴 2. Phishing Attack" icon={<Mail size={16} className="text-pink-500" />}>
                        <div className="flex flex-col md:flex-row-reverse gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <Def>🎣 <strong>Phishing Attack</strong> Cyber Crime ki duniya mein Hackers dwara upyog kiya jaane wala sabse <strong>saamanya tareeka</strong> hai। Isme Hackers Malicious E-mail bhejte hain aur User ko kisi Link par Click karne ke liye prerit karte hain।</Def>
                                <p>Link par Click karne ke baad User ki <strong>Personal Information</strong> ya <strong>Sensitive Details</strong> chori ho sakti hain — jaise Bank Details, Password, Credit Card Information aadi।</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/phishing_attack.png" alt="Phishing Attack" className="w-full h-auto rounded-2xl shadow-md border border-pink-100" />
                            </div>
                        </div>

                        {/* Phishing Process Flow */}
                        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                            <h4 className="text-xs font-bold text-pink-800 mb-3 uppercase tracking-wide">🎯 Phishing Attack Process:</h4>
                            <div className="flex flex-col items-center gap-0 text-center text-xs font-semibold">
                                {([
                                    { label: 'Hacker creates Fake Email / Website', style: { background: '#fecdd3', border: '1.5px solid #fb7185', color: '#9f1239', borderRadius: '12px' } as React.CSSProperties },
                                    null,
                                    { label: 'Email bheja jaata hai User ko', style: { background: '#fce7f3', border: '1.5px solid #f9a8d4', color: '#9d174d', borderRadius: '8px' } as React.CSSProperties },
                                    null,
                                    { label: 'User Link par Click karta hai', style: { background: '#fff1f2', border: '1.5px solid #fda4af', color: '#be123c', borderRadius: '8px' } as React.CSSProperties },
                                    null,
                                    { label: 'Personal Data Chori ho jaata hai! 🚨', style: { background: '#ef4444', border: 'none', color: 'white', borderRadius: '12px' } as React.CSSProperties },
                                ] as Array<{ label: string; style: React.CSSProperties } | null>).map((item, i) =>
                                    item === null
                                        ? <div key={i} className="w-0.5 h-5 bg-pink-300" />
                                        : <div key={i} className="px-5 py-2.5 text-[11px] shadow-sm w-full max-w-xs" style={item.style}>{item.label}</div>
                                )}
                            </div>
                        </div>

                        {/* What Gets Stolen */}
                        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Passwords', icon: <Key size={18} />, color: '#ef4444' },
                                { label: 'Bank Details', icon: <Database size={18} />, color: '#f97316' },
                                { label: 'Credit Card', icon: <Smartphone size={18} />, color: '#8b5cf6' },
                                { label: 'Personal Info', icon: <Fingerprint size={18} />, color: '#ec4899' },
                            ].map((item, i) => (
                                <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                                    <div className="flex justify-center mb-2" style={{ color: item.color }}>{item.icon}</div>
                                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Chori ho sakta hai</p>
                                </div>
                            ))}
                        </div>

                        <IB type="warning">Kabhi bhi <strong>unknown emails ke links</strong> par click na karein। Hamesha URL check karein aur <strong>official website</strong> par hi apni details dalein।</IB>
                    </Sec>

                    {/* ═══ SECTION: DDoS Attack ═══ */}
                    <Sec id="ddos-attack" title="🔴 3. DDoS Attack (Distributed Denial of Service)" icon={<Server size={16} className="text-rose-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <Def>🌊 <strong>DDoS Attack</strong> ek Cyber Attack hai jiska uddeshya kisi Online Server, Application ya Website ko <strong>band karna</strong> ya uski Service ko <strong>baadhit karna</strong> hota hai।</Def>
                                <p>Isme Attackers Target Website ya Service par <strong>bahut adhik Network Traffic</strong> bhejte hain, jisse Website <strong>Slow</strong> ho jaati hai ya <strong>Crash</strong> ho jaati hai।</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/ddos_attack.png" alt="DDoS Attack" className="w-full h-auto rounded-2xl shadow-md border border-rose-100" />
                            </div>
                        </div>

                        {/* Botnet Explanation */}
                        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-red-950 border border-red-800 text-white">
                            <h4 className="text-xs font-bold text-red-300 mb-3 uppercase tracking-wide flex items-center gap-2"><Network size={14} /> 🤖 Botnet kya hota hai?</h4>
                            <p className="text-sm text-gray-300 mb-4">Is Attack mein <strong className="text-red-400">Botnet</strong> ka upyog kiya jaata hai। Botnet <strong className="text-amber-400">Malware se sankramit Computers</strong> ka ek Network hota hai jise Attacking Party dwara Control kiya jaata hai।</p>

                            {/* Animated DDoS Diagram */}
                            <div className="flex justify-center">
                                <svg viewBox="0 0 400 200" className="w-full max-w-lg">
                                    <rect width="400" height="200" rx="12" fill="#0f172a" />
                                    
                                    {/* Attacker */}
                                    <rect x="10" y="70" width="70" height="60" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
                                    <text x="45" y="95" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontWeight="bold">Attacker</text>
                                    <text x="45" y="110" textAnchor="middle" fill="#818cf8" fontSize="7">🎭 Control</text>

                                    {/* Botnet Computers */}
                                    {[0, 1, 2, 3].map(i => (
                                        <g key={i}>
                                            <rect x={120} y={20 + i * 45} width="55" height="30" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
                                            <text x={147} y={37 + i * 45} textAnchor="middle" fill="#94a3b8" fontSize="6">Bot #{i+1}</text>
                                            <text x={147} y={46 + i * 45} textAnchor="middle" fill="#ef4444" fontSize="6">🖥️ Infected</text>
                                            {/* Arrow from attacker to bot */}
                                            <line x1="80" y1="100" x2="120" y2={35 + i * 45} stroke="#6366f1" strokeWidth="0.5" strokeDasharray="3,2" opacity="0.5" />
                                            {/* Arrow from bot to target */}
                                            <line x1="175" y1={35 + i * 45} x2="260" y2="100" stroke="#ef4444" strokeWidth="1" opacity="0.6">
                                                <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
                                            </line>
                                            {/* Data packets */}
                                            <circle r="2" fill="#ef4444">
                                                <animateMotion path={`M 175 ${35 + i * 45} L 260 100`} dur={`${0.8 + i * 0.2}s`} repeatCount="indefinite" />
                                            </circle>
                                        </g>
                                    ))}

                                    {/* Target Server */}
                                    <rect x="260" y="65" width="80" height="70" rx="8" fill="#450a0a" stroke="#dc2626" strokeWidth="1.5">
                                        <animate attributeName="stroke" values="#dc2626;#fca5a5;#dc2626" dur="1s" repeatCount="indefinite" />
                                    </rect>
                                    <text x="300" y="90" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">Target</text>
                                    <text x="300" y="102" textAnchor="middle" fill="#f87171" fontSize="7">🔥 Server</text>
                                    <text x="300" y="115" textAnchor="middle" fill="#ef4444" fontSize="6" fontWeight="bold">OVERLOADED!</text>
                                    <text x="300" y="128" textAnchor="middle" fill="#fca5a5" fontSize="6">❌ CRASH</text>

                                    {/* Labels */}
                                    <text x="200" y="195" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">DDoS Attack — Multiple Bots → Single Target</text>
                                </svg>
                            </div>
                        </div>

                        {/* DDoS Effects */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                                <div className="text-2xl mb-2">🐌</div>
                                <p className="text-xs font-bold text-red-800">Website Slow</p>
                                <p className="text-[10px] text-red-600 mt-1">Excessive traffic se response time badh jaata hai</p>
                            </div>
                            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                                <div className="text-2xl mb-2">💥</div>
                                <p className="text-xs font-bold text-orange-800">Server Crash</p>
                                <p className="text-[10px] text-orange-600 mt-1">Target system overload hokar crash ho jaata hai</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                                <div className="text-2xl mb-2">🚫</div>
                                <p className="text-xs font-bold text-amber-800">Service Down</p>
                                <p className="text-[10px] text-amber-600 mt-1">Real users website access nahi kar paate</p>
                            </div>
                        </div>

                        {/* DDoS Attack Process */}
                        <div className="mt-5 p-5 rounded-2xl bg-gray-50 border border-gray-200">
                            <h4 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                                <ChevronRight size={14} className="text-red-500" /> DDoS Attack Flow
                            </h4>
                            <div className="flex flex-col items-center gap-0 text-center text-xs font-semibold">
                                {([
                                    { label: 'Attacker Botnet Create karta hai', style: { background: '#1e1b4b', color: '#a5b4fc', borderRadius: '12px' } as React.CSSProperties },
                                    null,
                                    { label: 'Multiple Computers ko Malware se Infect karta hai', style: { background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#991b1b', borderRadius: '8px' } as React.CSSProperties },
                                    null,
                                    { label: 'Sabhi Bots ek saath Target Server par Traffic bhejte hain', style: { background: '#fef3c7', border: '1.5px solid #fcd34d', color: '#92400e', borderRadius: '8px' } as React.CSSProperties },
                                    null,
                                    { label: 'Target Server Overload → CRASH! ❌', style: { background: '#dc2626', color: 'white', borderRadius: '12px' } as React.CSSProperties },
                                ] as Array<{ label: string; style: React.CSSProperties } | null>).map((item, i) =>
                                    item === null
                                        ? <div key={i} className="w-0.5 h-5 bg-gray-300" />
                                        : <div key={i} className="px-5 py-2.5 text-[11px] shadow-sm w-full max-w-sm" style={item.style}>{item.label}</div>
                                )}
                            </div>
                        </div>

                        <IB type="note">DDoS Attacks se bachne ke liye companies <strong>CDN (Content Delivery Network)</strong>, <strong>Rate Limiting</strong>, aur <strong>Web Application Firewalls (WAF)</strong> ka use karti hain।</IB>
                    </Sec>

                    {/* Chapter Summary */}
                    <section className="rounded-2xl p-5 md:p-7 mb-5 scroll-mt-20 bg-gradient-to-br from-red-50 to-rose-50" style={{ border: '1px solid #fecaca', boxShadow: '0 4px 16px rgba(239,68,68,0.08)' }}>
                        <div className="flex items-center gap-2.5 mb-4 pb-3" style={{ borderBottom: '1px solid #fecaca' }}>
                            <CheckCircle2 size={16} className="text-red-500" />
                            <h2 className="text-base md:text-lg font-extrabold text-gray-800">📋 Chapter Summary</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Is chapter mein humne <strong>IoT Security</strong> ki zaroorat, <strong>Cyber Attacks</strong> ke vibhinn prakar, <strong>Hackers</strong> ki categories, aur specific attacks jaise <strong>Malware</strong>, <strong>Phishing</strong> aur <strong>DDoS</strong> ke baare mein seekha।
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Network Security', color: '#3b82f6' },
                                    { label: 'Cyber Attacks', color: '#8b5cf6' },
                                    { label: 'Hacker Types', color: '#f59e0b' },
                                    { label: 'Malware Attack', color: '#10b981' },
                                    { label: 'Phishing Attack', color: '#ec4899' },
                                    { label: 'DDoS Attack', color: '#ef4444' },
                                    { label: 'Botnet', color: '#6366f1' },
                                    { label: 'IoT Security', color: '#14b8a6' },
                                ].map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white border rounded-full text-[10px] font-bold shadow-sm text-center" style={{ borderColor: `${tag.color}40`, color: tag.color }}>{tag.label}</span>
                                ))}
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}
