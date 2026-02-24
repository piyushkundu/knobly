'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Shield, AlertTriangle, Phone, Lock, Landmark, Skull, Siren, ChevronRight, Sparkles, LayoutDashboard, StickyNote, Code2, Brain, Keyboard, ShieldCheck, ShieldAlert, BookOpen } from 'lucide-react';

const quickLinks = [
    { label: 'Home', href: '/', icon: <Home size={13} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={13} /> },
    { label: 'Notes', href: '/notes', icon: <StickyNote size={13} /> },
    { label: 'Python', href: '/python', icon: <Code2 size={13} /> },
    { label: 'MCQ', href: '/mcq', icon: <Brain size={13} /> },
    { label: 'Shortcuts', href: '/shortcuts', icon: <Keyboard size={13} /> },
];

const sections = [
    { title: 'Cyber Security क्या है?', icon: <Shield size={18} />, color: '#3b82f6', id: 'what' },
    { title: 'मुख्य Threats', icon: <AlertTriangle size={18} />, color: '#ef4444', id: 'threats' },
    { title: 'Phone Call Frauds', icon: <Phone size={18} />, color: '#f97316', id: 'phone' },
    { title: 'कैसे बचें?', icon: <Lock size={18} />, color: '#10b981', id: 'safety' },
    { title: 'RBI पहल', icon: <Landmark size={18} />, color: '#818cf8', id: 'rbi' },
    { title: 'RBI नियम', icon: <ShieldCheck size={18} />, color: '#f59e0b', id: 'rules' },
    { title: 'Real Cases', icon: <Skull size={18} />, color: '#f43f5e', id: 'cases' },
    { title: 'Helplines', icon: <Siren size={18} />, color: '#06b6d4', id: 'help' },
];

export default function CybersecurityPage() {
    return (
        <div className="wallpaper-default min-h-screen overflow-y-auto">
            {/* ── Premium Top Bar ── */}
            <header className="sticky top-0 z-20" style={{ background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
                <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-105" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <ArrowLeft size={16} style={{ color: '#94a3b8' }} />
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-sm font-bold truncate" style={{ color: '#f1f5f9' }}>Cyber Security</h1>
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={8} style={{ color: '#10b981' }} />
                                <span className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: '#10b981' }}>Stay Safe Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {quickLinks.map((link) => (
                            <Link key={link.href} href={link.href}
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all hover:scale-105"
                                style={{ color: '#94a3b8', background: 'transparent' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        ))}
                        <Link href="/" className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Home size={16} style={{ color: '#94a3b8' }} />
                        </Link>
                    </div>
                </div>
                <div className="h-[1px]" style={{ background: 'linear-gradient(90deg, transparent 0%, #10b981 20%, #06b6d4 50%, #3b82f6 80%, transparent 100%)' }} />
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden rounded-3xl" style={{ background: 'linear-gradient(135deg, #0f1b2d 0%, #0c2d48 25%, #145369 50%, #0e7490 75%, #06b6d4 100%)' }}>
                    <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }} />

                    <div className="relative z-10 p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert size={16} style={{ color: '#6ee7b7' }} />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: '#6ee7b7' }}>Awareness Program</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: '#ffffff' }}>
                            Cyber Security Awareness
                        </h2>
                        <p className="text-base md:text-lg leading-relaxed max-w-xl mb-6" style={{ color: '#e2e8f0' }}>
                            Internet और digital platforms पर खुद को सुरक्षित रखने के लिए जरूरी जानकारी — threats, safety tips, और RBI guidelines सब एक जगह।
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: <BookOpen size={14} />, label: '8 Topics', color: '#93c5fd' },
                                { icon: <Shield size={14} />, label: 'RBI Guidelines', color: '#86efac' },
                                { icon: <Skull size={14} />, label: '12 Real Cases', color: '#fca5a5' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ color: stat.color }}>{stat.icon}</span>
                                    <span className="text-xs font-medium" style={{ color: stat.color }}>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Quick Jump Nav ── */}
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {sections.map((s) => (
                            <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                                {s.icon}
                                <span>{s.title}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Section 1: What is Cybersecurity ── */}
                <section id="what" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
                            <Shield size={18} style={{ color: '#60a5fa' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#60a5fa' }}>Cyber Security क्या है?</h2>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
                        Cyber security का मतलब है कि internet और digital platforms पर आपकी personal जानकारी और data को सुरक्षित रखना। जब हम online होते हैं, तो हमें कई तरह के खतरों का सामना करना पड़ता है जैसे phishing, hacking, और data चोरी।
                    </p>
                </section>

                {/* ── Section 2: Main Threats ── */}
                <section id="threats" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
                            <AlertTriangle size={18} style={{ color: '#f87171' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#f87171' }}>Cyber Crimes के मुख्य threats</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#cbd5e1' }}>भारत में कई प्रकार के cyber crimes होते हैं, जिनसे लोग अनजान होते हैं:</p>
                    <div className="grid gap-3">
                        {[
                            { t: 'Phishing', d: 'Fake emails या messages भेजकर users से उनकी bank details या passwords चोरी की जाती है।' },
                            { t: 'Virus', d: 'ये खतरनाक software होते हैं, जो personal data चुराते या system को damage करते हैं।' },
                            { t: 'Ransomware', d: 'यह software आपके computer को lock कर देता है और फिर पैसे मांगे जाते हैं।' },
                            { t: 'Identity Theft', d: 'जब आपकी personal जानकारी गलत कामों में use की जाती है।' },
                            { t: 'Credit Card Fraud', d: 'Credit card की details चोरी कर ली जाती हैं और उसका misuse किया जाता है।' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>{i + 1}</span>
                                <div>
                                    <span className="text-sm font-bold" style={{ color: '#fca5a5' }}>{item.t}: </span>
                                    <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.d}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Section 3: Phone Frauds ── */}
                <section id="phone" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}>
                            <Phone size={18} style={{ color: '#fdba74' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#fdba74' }}>Phone Call Frauds से कैसे बचें?</h2>
                    </div>
                    <div className="grid gap-3">
                        {[
                            { t: 'Fake Calls from Banks', d: 'कभी भी किसी unknown caller को अपने bank details, OTP, या passwords न दें।' },
                            { t: 'KYC Fraud', d: 'Fraudsters KYC update के बहाने personal जानकारी चुराने की कोशिश करते हैं।' },
                            { t: 'Insurance Fraud', d: 'Insurance के नाम पर fraud calls आते हैं। केवल official customer care से ही बात करें।' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}>
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5" style={{ background: 'rgba(249,115,22,0.2)', color: '#fdba74' }}>{i + 1}</span>
                                <div>
                                    <span className="text-sm font-bold" style={{ color: '#fdba74' }}>{item.t}: </span>
                                    <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.d}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', borderLeft: '3px solid #3b82f6' }}>
                        <span className="text-sm font-bold" style={{ color: '#93c5fd' }}>💡 Pro Tip: </span>
                        <span className="text-sm" style={{ color: '#cbd5e1' }}>Truecaller जैसे apps suspicious calls की पहचान करने में मदद कर सकते हैं।</span>
                    </div>
                </section>

                {/* ── Section 4: How to Stay Safe ── */}
                <section id="safety" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <Lock size={18} style={{ color: '#6ee7b7' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#6ee7b7' }}>कैसे बचें इन cyber threats से?</h2>
                    </div>
                    <div className="grid gap-3">
                        {[
                            { t: 'Unknown links पर क्लिक न करें', d: 'अनजान email या message में दिए गए links पर क्लिक करने से बचें। ये phishing के लिए हो सकते हैं।' },
                            { t: 'Strong password का इस्तेमाल करें', d: 'Capital letters, numbers, और symbols का इस्तेमाल करें।' },
                            { t: 'Software updates रखें', d: 'हमेशा अपने computer और mobile के software को updated रखें।' },
                            { t: '2FA Enable करें', d: 'Two-Factor Authentication से आपके accounts और भी secure हो जाते हैं।' },
                            { t: 'Public Wi-Fi से बचें', d: 'Public Wi-Fi networks पर sensitive information access न करें।' },
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.06)', borderLeft: '3px solid #10b981' }}>
                                <span className="text-sm font-bold" style={{ color: '#6ee7b7' }}>{i + 1}. {item.t}: </span>
                                <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.d}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Section 5: RBI Initiative ── */}
                <section id="rbi" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(129,140,248,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)' }}>
                            <Landmark size={18} style={{ color: '#a5b4fc' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#a5b4fc' }}>RBI की नई पहल: Digital Banking और Cyber Frauds से बचाव</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#cbd5e1' }}>भारतीय रिज़र्व बैंक (RBI) ने लोगों को digital banking और online लेनदेन से जुड़े cyber frauds के बारे में जागरूक करने के लिए अभियान शुरू किया है:</p>
                    <div className="grid gap-3">
                        {[
                            'सुरक्षित और विश्वसनीय स्रोतों का उपयोग करें — हमेशा आधिकारिक websites या apps से ही financial transactions करें।',
                            'OTP और पासवर्ड साझा न करें — कभी भी अपना OTP, PIN, या पासवर्ड किसी के साथ साझा न करें।',
                            'संदिग्ध कॉल्स से सावधान — अज्ञात व्यक्ति bank अधिकारी बनकर कॉल करे तो तुरंत कॉल समाप्त करें।',
                            'Phishing से बचें — अनजान links पर क्लिक करने से बचें।',
                            'Regular Account Monitoring — अपने bank account की नियमित जांच करते रहें।',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.12)' }}>
                                <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5" style={{ background: 'rgba(129,140,248,0.2)', color: '#c7d2fe' }}>{i + 1}</span>
                                <span className="text-sm" style={{ color: '#cbd5e1' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Section 6: RBI Rules ── */}
                <section id="rules" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <ShieldCheck size={18} style={{ color: '#fcd34d' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#fcd34d' }}>RBI के नियम — साइबर धोखाधड़ी से बचाव</h2>
                    </div>
                    <p className="text-sm mb-4" style={{ color: '#cbd5e1' }}>RBI ने cyber fraud से जुड़े मामलों में ग्राहकों को सुरक्षित रखने के लिए कई rules बनाए हैं:</p>
                    <div className="grid gap-3">
                        {[
                            { t: 'जल्दी जानकारी देने पर सुरक्षा', d: '3 दिनों के अंदर बताने पर और आपकी कोई गलती नहीं है तो पूरे पैसे वापस।' },
                            { t: 'देरी होने पर जिम्मेदारी', d: '4 से 7 दिनों के अंदर बताने पर नुकसान सीमित होगा।' },
                            { t: 'लापरवाही पर नुकसान', d: 'देर या लापरवाही होने पर पूरा नुकसान आपको उठाना पड़ सकता है।' },
                            { t: 'बैंक की जिम्मेदारी', d: 'Bank की गलती होने पर bank को आपका पैसा वापस करना होगा।' },
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.06)', borderLeft: '3px solid #f59e0b' }}>
                                <span className="text-sm font-bold" style={{ color: '#fcd34d' }}>{item.t}: </span>
                                <span className="text-sm" style={{ color: '#cbd5e1' }}>{item.d}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Section 7: Real Cases ── */}
                <section id="cases" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,63,94,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.25)' }}>
                            <Skull size={18} style={{ color: '#fda4af' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#fda4af' }}>वास्तविक Cyber Crime Cases</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[
                            { y: '2018', t: 'Aadhaar Data Leak', d: 'करोड़ों भारतीयों का आधार डेटा ₹500 में बेचा गया।' },
                            { y: '2021', t: 'WhatsApp Cloning', d: 'SIM clone करके WhatsApp hack और पैसे की मांग।' },
                            { y: '2019', t: 'ATM Card Cloning', d: 'Skimming device से card details चोरी, ₹1L+ निकले।' },
                            { y: '2020', t: 'OLX Fraud', d: 'Army personnel बनकर QR code से पैसे निकाले।' },
                            { y: '2022', t: 'SIM Swap Fraud', d: 'SIM swap करके bank account से ₹50,000 निकाले।' },
                            { y: '2017', t: 'WannaCry Ransomware', d: '2L+ computers lock, Bitcoin में ransom मांगा।' },
                            { y: '2014', t: 'Sony Pictures Hack', d: 'Confidential emails और unreleased movies leak।' },
                            { y: '2017', t: 'Equifax Breach', d: '147M users का personal data expose।' },
                            { y: '2018', t: 'Cambridge Analytica', d: 'Facebook users का data बिना consent collect।' },
                            { y: '2013', t: 'Target Data Breach', d: '40M credit/debit card records चोरी।' },
                            { y: '2014', t: 'Yahoo Breach', d: '3B+ user accounts compromise।' },
                            { y: '2019', t: 'Capital One Breach', d: '100M customers का data hack।' },
                        ].map((c, i) => (
                            <div key={i} className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: 'rgba(244,63,94,0.2)', color: '#fda4af' }}>{c.y}</span>
                                <div>
                                    <span className="text-sm font-bold" style={{ color: '#fda4af' }}>{c.t}</span>
                                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{c.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Section 8: Emergency ── */}
                <section id="help" className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)' }}>
                            <Siren size={18} style={{ color: '#67e8f9' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#67e8f9' }}>Emergency Contacts &amp; Helplines</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #164e63, #0e7490)', border: '1px solid rgba(6,182,212,0.3)' }}>
                            <p className="text-2xl font-extrabold mb-1" style={{ color: '#ffffff' }}>155260</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#67e8f9' }}>Cyber Crime Helpline</p>
                        </div>
                        <div className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #164e63, #0e7490)', border: '1px solid rgba(6,182,212,0.3)' }}>
                            <p className="text-2xl font-extrabold mb-1" style={{ color: '#ffffff' }}>1930</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#67e8f9' }}>Alt Helpline Number</p>
                        </div>
                        <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="rounded-xl p-4 text-center transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #164e63, #0e7490)', border: '1px solid rgba(6,182,212,0.3)' }}>
                            <p className="text-sm font-extrabold mb-1" style={{ color: '#ffffff' }}>cybercrime.gov.in</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#67e8f9' }}>National Portal</p>
                        </a>
                    </div>
                </section>

                {/* ── Section: After Cybercrime ── */}
                <section className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
                            <ShieldAlert size={18} style={{ color: '#c4b5fd' }} />
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#c4b5fd' }}>Cyber Crime के बाद क्या करें? — RBI दिशानिर्देश</h2>
                    </div>
                    <div className="grid gap-3">
                        {[
                            'फौरन अपने बैंक को सूचित करें — फोन, email, या शाखा में जाकर।',
                            'Cyber Crime Helpline 155260 पर कॉल करें — 24/7 उपलब्ध।',
                            'cybercrime.gov.in पर ऑनलाइन शिकायत दर्ज करें।',
                            'बैंक से account/card temporarily freeze करवाएं।',
                            'समय पर बताने पर 10 दिनों में refund मिल सकता है।',
                            'बैंक जांच करेगा — सही पाए जाने पर पैसे वापस।',
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.06)', borderLeft: '3px solid #a855f7' }}>
                                <span className="text-sm font-bold" style={{ color: '#c4b5fd' }}>{i + 1}. </span>
                                <span className="text-sm" style={{ color: '#cbd5e1' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Footer ── */}
                <div className="text-center py-6">
                    <p className="text-sm" style={{ color: '#94a3b8' }}>🛡️ सुरक्षित रहें, जागरूक रहें। Cyber crime से बचाव ही बचाव है!</p>
                    <p className="text-xs mt-2" style={{ color: '#475569' }}>© 2024 olevelcccexam | All rights reserved.</p>
                </div>
            </main>
        </div>
    );
}
