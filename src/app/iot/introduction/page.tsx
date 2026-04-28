'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wifi, Cpu, Radio, Shield, Zap, BookOpen, Menu, X, ChevronRight, Hash, Sparkles, Globe, Eye, Activity, Layers } from 'lucide-react';

function Sec({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section id={id} className="rounded-2xl p-5 md:p-7 mb-5 scroll-mt-20 transition-all duration-300 hover:shadow-lg bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2.5 mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>{icon}<h2 className="text-base md:text-lg font-extrabold text-gray-800">{title}</h2></div>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">{children}</div>
        </section>
    );
}

function Def({ children }: { children: ReactNode }) {
    return <div className="rounded-xl p-4 my-3 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '1px solid #67e8f9', color: '#155e75' }}>{children}</div>;
}

function IB({ type = 'tip', children }: { type?: 'tip' | 'note' | 'warning'; children: ReactNode }) {
    const s: Record<string, { bg: string; bc: string; tc: string; emoji: string }> = { tip: { bg: '#ecfeff', bc: '#67e8f9', tc: '#0e7490', emoji: '💡' }, note: { bg: '#eff6ff', bc: '#93c5fd', tc: '#1e40af', emoji: '📝' }, warning: { bg: '#fefce8', bc: '#fde047', tc: '#854d0e', emoji: '⚠️' } };
    const st = s[type];
    return <div className="rounded-xl p-3.5 text-xs font-medium my-3" style={{ background: st.bg, border: `1px solid ${st.bc}`, color: st.tc }}>{st.emoji} {children}</div>;
}

function TH({ children }: { children: ReactNode }) {
    return <tr style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }} className="text-white">{children}</tr>;
}

const tocItems = [
    { icon: <Wifi size={13} />, label: 'IoT Introduction', id: 'intro', color: '#06b6d4' },
    { icon: <Globe size={13} />, label: 'History', id: 'history', color: '#8b5cf6' },
    { icon: <Layers size={13} />, label: 'Characteristics', id: 'chars', color: '#f97316' },
    { icon: <Radio size={13} />, label: 'Connectivity', id: 'connectivity', color: '#10b981' },
    { icon: <Cpu size={13} />, label: 'Intelligence', id: 'intelligence', color: '#ec4899' },
    { icon: <Eye size={13} />, label: 'Sensing', id: 'sensing', color: '#ef4444' },
    { icon: <Activity size={13} />, label: 'Dynamic Nature', id: 'dynamic', color: '#eab308' },
    { icon: <Zap size={13} />, label: 'Scale', id: 'scale', color: '#06b6d4' },
    { icon: <Shield size={13} />, label: 'Security', id: 'security', color: '#ef4444' },
    { icon: <Radio size={13} />, label: 'Communication', id: 'communication', color: '#8b5cf6' },
    { icon: <Wifi size={13} />, label: 'How IoT Works', id: 'how-iot-works', color: '#10b981' },
    { icon: <Cpu size={13} />, label: 'Four Concepts', id: 'four-concepts', color: '#f97316' },
    { icon: <Globe size={13} />, label: 'IoT Applications', id: 'iot-applications', color: '#06b6d4' },
    { icon: <Layers size={13} />, label: 'Building Blocks', id: 'building-blocks', color: '#8b5cf6' },
];

export default function IoTIntroduction() {
    const [tocOpen, setTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('intro');

    return (
        <div className="min-h-screen bg-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30" />
            </div>

            <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/iot" className="flex items-center justify-center w-9 h-9 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}><ArrowLeft size={16} /></Link>
                        <div>
                            <h1 className="text-sm font-extrabold text-gray-800">Introduction to IoT</h1>
                            <div className="flex items-center gap-1.5"><Sparkles size={8} className="text-cyan-500" /><span className="text-[9px] uppercase tracking-[0.18em] font-bold text-cyan-500">Chapter 1</span></div>
                        </div>
                    </div>
                    <button onClick={() => setTocOpen(!tocOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 border border-gray-200">
                        {tocOpen ? <X size={18} className="text-cyan-500" /> : <Menu size={18} className="text-cyan-500" />}
                    </button>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f97316, #06b6d4)' }} />
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                <aside className={`${tocOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[52px] left-0 z-40 lg:z-10 w-64 lg:w-56 xl:w-64 h-[calc(100vh-52px)] overflow-y-auto transition-transform duration-300 lg:flex-shrink-0 bg-white/95 backdrop-blur-xl`} style={{ borderRight: '1px solid #e2e8f0' }}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}><Hash size={12} className="text-white" /></div>
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
                    <section className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 30%, #0ea5e9 60%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(6,182,212,0.25)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
                        </div>
                        <div className="relative z-10 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                                <Sparkles size={10} /> Chapter 1 — O-Level M4-R5
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white" style={{ lineHeight: '1.2' }}>Introduction to IoT</h2>
                            <p className="text-sm md:text-base max-w-2xl mb-5 text-white/85">Applications, Devices, Protocols aur Communication Model — IoT ki duniya mein aapka swagat hai!</p>
                            <div className="flex flex-wrap gap-2">
                                {[{ icon: <BookOpen size={14} />, label: '7 Topics' }, { icon: <Wifi size={14} />, label: 'IoT Basics' }, { icon: <Zap size={14} />, label: 'Beginner Friendly' }].map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>{s.icon}<span>{s.label}</span></div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ═══ SECTION: Introduction ═══ */}
                    <Sec id="intro" title="🔹 Introduction — IoT" icon={<Wifi size={16} className="text-cyan-500" />}>
                        <Def>🌐 <strong>IoT (Internet of Things)</strong> ek aisa platform hai jahan regular hone wale devices internet ke through aapas mein communicate karte hain — bina kisi manual intervention ke!</Def>
                        <p>IoT ek <strong>network ke through data ko share aur exchange</strong> karta hai. Isme electronic components, internet connectivity, software aur hardware sab include hote hain.</p>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #f0fdfa, #ecfeff)', border: '1px solid #99f6e4' }}>
                            <h4 className="font-bold text-teal-700 mb-2">📌 IoT ka Matlab</h4>
                            <p className="text-teal-800"><strong>&quot;Internet of Things&quot;</strong> — yahan <strong>&quot;Things&quot;</strong> ka matlab kisi bhi object se hai jise internet ke through access kiya ja sakta hai.</p>
                        </div>
                        <IB type="note">IoT shabd ka prayog <strong>Kevin Ashton</strong> ne <strong>1999</strong> mein sabse pehle kiya tha.</IB>
                        <p>IoT ki help se bahut saari smart cheezein possible hui hain:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                            {[{ emoji: '🧊', t: 'Smart Refrigerator', d: 'Khud batata hai kya khatam ho raha hai' }, { emoji: '📱', t: 'Smart Phone', d: 'Internet se connected personal device' }, { emoji: '🏙️', t: 'Smart City', d: 'Traffic, waste, energy sab automated' }].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl text-center hover:scale-[1.02] transition-transform" style={{ background: '#f0fdfa', border: '1px solid #99f6e4' }}>
                                    <div className="text-3xl mb-2">{item.emoji}</div>
                                    <h5 className="font-bold text-sm text-teal-700">{item.t}</h5>
                                    <p className="text-xs text-gray-500 mt-1">{item.d}</p>
                                </div>
                            ))}
                        </div>
                        <IB type="tip">IoT ki madad se kisi bhi device ko <strong>smart device</strong> mein convert kiya ja sakta hai — bas internet connectivity chahiye!</IB>
                    </Sec>

                    {/* ═══ SECTION: History ═══ */}
                    <Sec id="history" title="🔹 History of IoT" icon={<Globe size={16} className="text-purple-500" />}>
                        <Def>📜 IoT ka idea bahut pehle se tha — 1970 se lekar 2008 tak dheere-dheere develop hua.</Def>
                        <div className="relative my-4 ml-4">
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-400 to-orange-400 rounded-full" />
                            {[
                                { year: '1970', text: 'Connected device ka original idea aaya', color: '#06b6d4' },
                                { year: '1980', text: 'Internet ka use systems mein hone laga', color: '#8b5cf6' },
                                { year: '1990', text: 'John Romkey ne internet device ko test kiya', color: '#10b981' },
                                { year: '1995', text: 'M2M (Machine to Machine) model use hua', color: '#f97316' },
                                { year: '1999', text: 'Kevin Ashton ne "IoT" shabd ka use kiya', color: '#ef4444' },
                                { year: '2005', text: 'International communication par IoT report publish hui', color: '#ec4899' },
                                { year: '2008', text: 'IoT ka full-scale development start hua', color: '#eab308' },
                            ].map((item, i) => (
                                <div key={i} className="relative flex items-start gap-4 pb-5 pl-6">
                                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-md" style={{ background: item.color }} />
                                    <div className="flex-1 p-3 rounded-xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
                                        <span className="text-xs font-black px-2 py-0.5 rounded-full text-white mr-2" style={{ background: item.color }}>{item.year}</span>
                                        <span className="text-sm text-gray-700">{item.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Characteristics Intro ═══ */}
                    <Sec id="chars" title="🔹 Characteristics of IoT" icon={<Layers size={16} className="text-orange-500" />}>
                        <Def>⚡ IoT ek <strong>intelligent device system</strong> hai jisme devices ke beech wireless network ke through data send aur receive kiya jaata hai.</Def>
                        <p>IoT ki 4 important characteristics hain:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                            {[{ emoji: '🔗', t: 'Connectivity', c: '#06b6d4' }, { emoji: '🧠', t: 'Intelligence', c: '#8b5cf6' }, { emoji: '📡', t: 'Sensing', c: '#ef4444' }, { emoji: '🔄', t: 'Dynamic Nature', c: '#eab308' }].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer" style={{ background: `${item.c}08`, border: `1px solid ${item.c}25` }}>
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-xs" style={{ color: item.c }}>{item.t}</h5>
                                </div>
                            ))}
                        </div>
                        <IB type="note">Neeche har ek characteristic ko detail mein samjhaya gaya hai 👇</IB>
                    </Sec>

                    {/* ═══ SECTION: Connectivity ═══ */}
                    <Sec id="connectivity" title="(1) Connectivity" icon={<Radio size={16} className="text-emerald-500" />}>
                        <Def>🔗 IoT ka sabse important feature <strong>connectivity</strong> hai — devices ek dusre se connected rehte hain aur data share karte hain.</Def>
                        <p>IoT devices aur unke components jaise <strong>sensors, data devices, computer engine</strong> etc. ek dusre se connected rehte hain.</p>
                        <h4 className="font-bold mt-4 mb-2 text-gray-800">IoT devices kaise connect hote hain?</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                            {[{ emoji: '📻', t: 'Radio Wave', d: 'Long range wireless' }, { emoji: '🔵', t: 'Bluetooth', d: 'Short range device pairing' }, { emoji: '📶', t: 'WiFi', d: 'Internet connectivity' }, { emoji: '💡', t: 'LiFi', d: 'Light-based communication' }].map((item, i) => (
                                <div key={i} className="p-3 rounded-xl text-center" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-xs text-emerald-700">{item.t}</h5>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{item.d}</p>
                                </div>
                            ))}
                        </div>
                        <IB type="tip">Connectivity ke bina IoT exist nahi kar sakta — ye IoT ki <strong>backbone</strong> hai!</IB>
                    </Sec>

                    {/* ═══ SECTION: Intelligence ═══ */}
                    <Sec id="intelligence" title="(2) Intelligence" icon={<Cpu size={16} className="text-pink-500" />}>
                        <Def>🧠 IoT mein bahut saare <strong>algorithms</strong> use hote hain jinke dwara devices intelligent ban jaate hain.</Def>
                        <p>IoT mein <strong>Big Data Analytics</strong> kiya jaata hai aur <strong>Machine Learning</strong> ka use hota hai jisse user better decision le sakta hai.</p>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', border: '1px solid #f9a8d4' }}>
                            <h4 className="font-bold text-pink-700 mb-2">🎯 Intelligence kaise kaam karta hai?</h4>
                            <ul className="space-y-2 text-sm text-pink-800">
                                <li>• <strong>Data Collection</strong> — Sensors se data collect hota hai</li>
                                <li>• <strong>Data Analysis</strong> — Algorithms data ko analyze karte hain</li>
                                <li>• <strong>Smart Decisions</strong> — System automatically best decision leta hai</li>
                                <li>• <strong>Business Discussion</strong> — Situation ke according data ka use karke business decisions bhi liye ja sakte hain</li>
                            </ul>
                        </div>
                        <IB type="note">Iske base par ye kaha ja sakta hai ki IoT ek <strong>smart intelligent system</strong> hai!</IB>
                    </Sec>

                    {/* ═══ SECTION: Sensing ═══ */}
                    <Sec id="sensing" title="(3) Sensing" icon={<Eye size={16} className="text-red-500" />}>
                        <Def>📡 IoT mein <strong>sensors</strong> ka use hota hai — sensors ke bina IoT system kaam nahi kar sakta!</Def>
                        <p>Sensors environment ki conditions ko <strong>detect aur measure</strong> karte hain. Inke through hum apni surroundings ko easily samajh sakte hain aur unka analysis kar sakte hain.</p>
                        <h4 className="font-bold mt-4 mb-2 text-gray-800">👉 Sensors ke Examples:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-3">
                            {[{ emoji: '⚡', t: 'Electronic', d: 'Electronic signals detect karta hai' }, { emoji: '🧪', t: 'Chemical', d: 'Chemical composition measure karta hai' }, { emoji: '🔄', t: 'Gyroscope', d: 'Rotation aur orientation track karta hai' }, { emoji: '🌡️', t: 'Pressure', d: 'Air/liquid pressure measure karta hai' }, { emoji: '💡', t: 'Light Sensor', d: 'Light intensity detect karta hai' }, { emoji: '📍', t: 'GPS', d: 'Global Positioning System — location track karta hai' }].map((item, i) => (
                                <div key={i} className="p-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                    <div className="text-xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-xs text-red-700">{item.t}</h5>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{item.d}</p>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fca5a5' }}>
                            <h4 className="font-bold text-red-700 mb-2">⚙️ Sensors kaise kaam karte hain?</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-semibold">Analog Signals</span>
                                <span className="text-red-400">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 font-semibold">Read &amp; Convert</span>
                                <span className="text-orange-400">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold">Digital Data</span>
                                <span className="text-green-400">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-semibold">Problem Solving</span>
                            </div>
                        </div>
                        <IB type="tip">Sensors <strong>analog signals</strong> ko read karte hain aur unhe <strong>data mein convert</strong> karte hain — ye data phir problem solve karne ke liye collect kiya jaata hai.</IB>
                    </Sec>

                    {/* ═══ SECTION: Dynamic Nature ═══ */}
                    <Sec id="dynamic" title="(4) Dynamic Nature" icon={<Activity size={16} className="text-yellow-500" />}>
                        <Def>🔄 IoT ki ek important visheshta iska <strong>dynamic nature</strong> hai — data real-time mein collect aur convert hota hai.</Def>
                        <p>IoT mein data ko <strong>real-time</strong> mein collect aur convert kiya jaata hai jisse business discussion aur analysis kiya ja sake. IoT ke components ka nature bhi dynamic hona chahiye.</p>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fde047' }}>
                            <h4 className="font-bold text-yellow-700 mb-3">👉 Example — Temperature Sensor</h4>
                            <p className="text-sm text-yellow-800 mb-3">Agar IoT sensor temperature detect karta hai, to har location aur weather condition ke hisab se temperature change hota rahega:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                                    <span className="text-2xl">🌴</span>
                                    <div><h5 className="font-bold text-sm text-orange-700">Mumbai</h5><p className="text-xs text-orange-600">Temperature: 32°C — Humid &amp; Hot</p></div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                                    <span className="text-2xl">🏔️</span>
                                    <div><h5 className="font-bold text-sm text-blue-700">Delhi</h5><p className="text-xs text-blue-600">Temperature: 18°C — Cool &amp; Dry</p></div>
                                </div>
                            </div>
                        </div>
                        <IB type="warning">IoT system ko <strong>continuously change hone wale data</strong> ko handle karna padta hai — isliye IoT components ka nature dynamic hona bahut zaroori hai!</IB>
                    </Sec>


                    {/* ═══ SECTION: Scale ═══ */}
                    <Sec id="scale" title="(5) Scale" icon={<Zap size={16} className="text-cyan-500" />}>
                        <Def>📏 IoT system ko zarurat ke according <strong>scale (badha ya chhota)</strong> kiya ja sakta hai — yani IoT ka size small bhi ho sakta hai aur large bhi.</Def>
                        <p>IoT ka ek important feature ye hai ki iska scale <strong>flexible</strong> hota hai — chhote se lekar bahut bade systems tak kaam kar sakta hai.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                            <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '1px solid #67e8f9' }}>
                                <div className="text-3xl mb-2">🏠</div>
                                <h5 className="font-bold text-sm text-cyan-700 mb-1">Small Scale IoT</h5>
                                <p className="text-xs text-cyan-800">Kisi ek room ya home ke liye — jaise Smart Home system jisme sirf ghar ke devices connected hain</p>
                            </div>
                            <div className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #93c5fd' }}>
                                <div className="text-3xl mb-2">🏭</div>
                                <h5 className="font-bold text-sm text-blue-700 mb-1">Large Scale IoT</h5>
                                <p className="text-xs text-blue-800">Poori factory ya company level par — jaise Industrial IoT jisme hazaron machines connected hain</p>
                            </div>
                        </div>
                        <IB type="tip">IoT ka scale <strong>flexible</strong> hota hai — chhote ghar se lekar badi factory tak, sab ke liye IoT system design kiya ja sakta hai!</IB>
                    </Sec>

                    {/* ═══ SECTION: Security ═══ */}
                    <Sec id="security" title="🔴 (6) Security" icon={<Shield size={16} className="text-red-500" />}>
                        <Def>🔒 IoT me <strong>security bahut important</strong> hoti hai — IoT devices me bahut saari sensitive information hoti hai jise safe rakhna zaruri hai.</Def>
                        <p>Agar IoT system mein proper security na ho, to data aur information ko khatara ho sakta hai.</p>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fca5a5' }}>
                            <h4 className="font-bold text-red-700 mb-3">⚠️ Agar security na ho to kya ho sakta hai?</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50 border border-red-200">
                                    <span className="text-xl">💀</span>
                                    <div>
                                        <h5 className="font-bold text-sm text-red-700">Data Hack</h5>
                                        <p className="text-xs text-red-600">Koi bhi aapka data chura sakta hai</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-orange-50 border border-orange-200">
                                    <span className="text-xl">🔧</span>
                                    <div>
                                        <h5 className="font-bold text-sm text-orange-700">Data Manipulate</h5>
                                        <p className="text-xs text-orange-600">Data ko galat tarike se change kiya ja sakta hai</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold mt-4 mb-2 text-gray-800">🛡️ IoT Security ke liye kya karna chahiye?</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                            {[{ emoji: '🔥', t: 'Firewall Install karna', d: 'Unauthorized access se bachata hai', color: '#ef4444' }, { emoji: '🌐', t: 'VPN ka use karna', d: 'Data encrypted tunnel se bhejta hai', color: '#8b5cf6' }].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}25` }}>
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-sm" style={{ color: item.color }}>{item.t}</h5>
                                    <p className="text-xs text-gray-500 mt-1">{item.d}</p>
                                </div>
                            ))}
                        </div>
                        <IB type="warning">IoT system ko <strong>secure design karna bahut zaruri</strong> hai — tabhi sensitive data safe rahega!</IB>
                    </Sec>

                    {/* ═══ SECTION: Communication ═══ */}
                    <Sec id="communication" title="🔴 Communication" icon={<Radio size={16} className="text-purple-500" />}>
                        <Def>📡 IoT me <strong>devices ek dusre se communicate</strong> karte hain — communication tab possible hota hai jab devices properly connected hon.</Def>
                        <p>IoT system mein communication ke liye alag-alag wireless aur wired technologies ka use hota hai.</p>
                        <h4 className="font-bold mt-4 mb-2 text-gray-800">📶 Communication ke liye technologies:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                            {[
                                { emoji: '📶', t: 'WiFi', d: 'High-speed internet connectivity — ghar aur office mein use hoti hai', color: '#06b6d4' },
                                { emoji: '🗼', t: 'LPWA', d: 'Low Power Wide Area — long range, low power devices ke liye', color: '#8b5cf6' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl" style={{ background: `${item.color}08`, border: `1px solid ${item.color}25` }}>
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-sm" style={{ color: item.color }}>{item.t}</h5>
                                    <p className="text-xs text-gray-500 mt-1">{item.d}</p>
                                </div>
                            ))}
                        </div>
                        <IB type="note">Communication technologies <strong>devices ko connect karti hain</strong> — inke bina IoT mein data exchange possible nahi hoga!</IB>
                    </Sec>

                    {/* ═══ SECTION: How IoT Works ═══ */}
                    <Sec id="how-iot-works" title="🔴 How IoT Works" icon={<Wifi size={16} className="text-emerald-500" />}>
                        <Def>⚙️ IoT process ek <strong>simple working flow</strong> par kaam karta hai — devices collect, process aur share karte hain data ko.</Def>
                        <p>IoT system mein alag-alag smart devices use hote hain jo ek platform ke through aapas mein communicate karte hain.</p>
                        <h4 className="font-bold mt-4 mb-2 text-gray-800">📱 IoT mein use hone wale devices:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                            {[{ emoji: '📱', t: 'Smart Phone' }, { emoji: '⌚', t: 'Smart Watch' }, { emoji: '📺', t: 'Smart TV' }, { emoji: '🫧', t: 'Washing Machine' }].map((item, i) => (
                                <div key={i} className="p-3 rounded-xl text-center" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-xs text-emerald-700">{item.t}</h5>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac' }}>
                            <h4 className="font-bold text-green-700 mb-3">🎯 IoT system ka main kaam:</h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold text-sm">📥 Data Collect karna</span>
                                <span className="text-green-400 font-bold">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 font-semibold text-sm">⚙️ Data Process karna</span>
                                <span className="text-teal-400 font-bold">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm">👤 User tak pahunchana</span>
                            </div>
                        </div>
                        <IB type="tip">Ye devices <strong>IoT platform ke through</strong> aapas mein communicate karte hain aur user tak useful information pahunchate hain!</IB>
                    </Sec>

                    {/* ═══ SECTION: Four Fundamental Concepts ═══ */}
                    <Sec id="four-concepts" title="🔴 Four Fundamental Concepts of IoT System" icon={<Layers size={16} className="text-orange-500" />}>
                        <Def>🔹 IoT system ko samajhne ke liye <strong>4 main components</strong> hote hain — ye sab milkar IoT ko complete banate hain.</Def>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            {[{ n: '1', t: 'Sensors / Devices', e: '📡', c: '#06b6d4' }, { n: '2', t: 'Connectivity', e: '🔗', c: '#8b5cf6' }, { n: '3', t: 'Data Processing', e: '⚙️', c: '#10b981' }, { n: '4', t: 'User Interface', e: '📱', c: '#f97316' }].map((item, i) => (
                                <div key={i} className="p-3 rounded-2xl text-center" style={{ background: `${item.c}10`, border: `1px solid ${item.c}30` }}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black mx-auto mb-2" style={{ background: item.c }}>{item.n}</div>
                                    <div className="text-xl mb-1">{item.e}</div>
                                    <h5 className="font-bold text-[11px]" style={{ color: item.c }}>{item.t}</h5>
                                </div>
                            ))}
                        </div>

                        {/* Concept 1 */}
                        <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '1px solid #67e8f9' }}>
                            <h4 className="font-bold text-cyan-700 mb-2 flex items-center gap-2">📡 <span>(1) Sensors or Devices</span></h4>
                            <p className="text-sm text-cyan-800 mb-3">Sensors ya devices environment se <strong>live data collect</strong> karte hain.</p>
                            <div className="space-y-1.5 text-xs text-cyan-700 mb-3">
                                <p>👉 Data <strong>simple</strong> bhi ho sakta hai — jaise temperature</p>
                                <p>👉 Data <strong>complex</strong> bhi ho sakta hai — jaise video feed</p>
                                <p>👉 Devices alag-alag type ke sensors use karte hain</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-cyan-200">
                                <p className="text-xs font-bold text-cyan-700 mb-1">📌 Example — Mobile Phone:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['📍 GPS', '📷 Camera', '🔢 Sensors'].map((s, i) => (
                                        <span key={i} className="px-2 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-semibold border border-cyan-200">{s}</span>
                                    ))}
                                </div>
                                <p className="text-[11px] text-cyan-600 mt-1">Ye sab sensing ka kaam karte hain!</p>
                            </div>
                        </div>

                        {/* Concept 2 */}
                        <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #c4b5fd' }}>
                            <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">🔗 <span>(2) Connectivity</span></h4>
                            <p className="text-sm text-purple-800 mb-3">Collected data ko <strong>cloud ya system tak bhejne</strong> ke liye connectivity use hoti hai.</p>
                            <div className="space-y-1.5 text-xs text-purple-700 mb-3">
                                <p>👉 Data communication ke liye networks use hote hain</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['🔵 Bluetooth', '📶 WiFi', '🌐 WAN'].map((s, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">{s}</span>
                                ))}
                            </div>
                            <p className="text-[11px] text-purple-600 mt-2">👉 Sensors se data collect karke network ke through cloud mein bheja jata hai</p>
                        </div>

                        {/* Concept 3 */}
                        <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac' }}>
                            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">⚙️ <span>(3) Data Processing</span></h4>
                            <p className="text-sm text-green-800 mb-3">Jo data collect hota hai usko <strong>process</strong> kiya jata hai.</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-semibold text-xs">☁️ Cloud mein store</span>
                                <span className="text-green-400">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-teal-100 text-teal-700 font-semibold text-xs">💻 Software se process</span>
                                <span className="text-teal-400">→</span>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-semibold text-xs">✅ Useful Information</span>
                            </div>
                            <p className="text-[11px] text-green-600 mt-2">👉 Processing ke baad meaningful aur useful information milti hai</p>
                        </div>

                        {/* Concept 4 */}
                        <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fdba74' }}>
                            <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">📱 <span>(4) User Interface</span></h4>
                            <p className="text-sm text-orange-800 mb-3">User interface wo <strong>medium</strong> hai jiske through user information dekhta hai.</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {['📱 Phone', '📧 Email', '💬 Text Message', '🔔 Notification'].map((s, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">{s}</span>
                                ))}
                            </div>
                            <div className="p-3 rounded-xl bg-white border border-orange-200">
                                <p className="text-xs font-bold text-orange-700 mb-2">📌 Example — Temperature Control:</p>
                                <div className="space-y-1.5 text-xs text-orange-600">
                                    <p>🌡️ Room ka temperature bahut zyada ho jata hai</p>
                                    <p>🔔 IoT system user ko <strong>notification</strong> bhejta hai</p>
                                    <p>📱 User <strong>mobile se temperature adjust</strong> kar sakta hai</p>
                                </div>
                            </div>
                        </div>

                        <IB type="tip">Ye 4 concepts milkar ek <strong>complete IoT system</strong> banate hain — Sensor → Connect → Process → User!</IB>
                    </Sec>

                    {/* ═══ IoT Applications ═══ */}
                    <Sec id="iot-applications" title="🔹 IoT Applications" icon={<Globe size={16} className="text-cyan-500" />}>
                        <Def>🌍 IoT ka use <strong>different fields</strong> mein bahut zyada hota hai — devices smart ho jaate hain aur automatic kaam karte hain.</Def>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                            {[{ e: '⌚', t: 'Wearable', c: '#06b6d4' }, { e: '🏥', t: 'Health', c: '#ef4444' }, { e: '🚦', t: 'Traffic', c: '#f97316' }, { e: '🌾', t: 'Agriculture', c: '#10b981' }, { e: '🏠', t: 'Smart Home', c: '#8b5cf6' }, { e: '🏙️', t: 'Smart City', c: '#eab308' }, { e: '🏭', t: 'Industrial', c: '#ec4899' }, { e: '📹', t: 'Surveillance', c: '#64748b' }].map((a, i) => (
                                <div key={i} className="p-3 rounded-xl text-center hover:scale-105 transition-transform" style={{ background: `${a.c}10`, border: `1px solid ${a.c}30` }}>
                                    <div className="text-2xl mb-1">{a.e}</div>
                                    <h5 className="font-bold text-[11px]" style={{ color: a.c }}>{a.t}</h5>
                                </div>
                            ))}
                        </div>

                        {/* Wearable */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '1px solid #67e8f9' }}>
                            <h4 className="font-bold text-cyan-700 mb-2">⌚ (1) Wearable</h4>
                            <p className="text-xs text-cyan-800 mb-2">Wearable devices wo hote hain jo hum <strong>body par pehnte hain</strong>.</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['⌚ Smart Watch', '❤️ Heart Rate Monitor', '🩸 Glucose Monitor', '📍 GPS Tracker'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-white text-cyan-700 text-xs font-semibold border border-cyan-200">{s}</span>
                                ))}
                            </div>
                            <div className="text-xs text-cyan-700 space-y-0.5">
                                <p>👉 Sensors body ka data collect karte hain aur health/activity monitor karte hain</p>
                                <p>👉 Ye devices <strong>kam energy consume</strong> karte hain aur <strong>continuous data collect</strong> karte hain</p>
                            </div>
                        </div>

                        {/* Health */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fca5a5' }}>
                            <h4 className="font-bold text-red-700 mb-2">🏥 (2) Health</h4>
                            <p className="text-xs text-red-800 mb-2">IoT ka use <strong>health sector</strong> mein bahut important hai.</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-white border border-red-200"><p className="text-[11px] text-red-700 font-semibold">🛏️ Smart beds</p><p className="text-[10px] text-gray-500">Patients ki condition monitor karte hain</p></div>
                                <div className="p-2 rounded-lg bg-white border border-red-200"><p className="text-[11px] text-red-700 font-semibold">📊 Real-time Data</p><p className="text-[10px] text-gray-500">Temperature, BP, Pulse rate</p></div>
                            </div>
                            <p className="text-xs text-red-700">👉 Doctor patient ko <strong>easily monitor</strong> kar sakta hai — real-time data milta hai</p>
                        </div>

                        {/* Traffic */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fdba74' }}>
                            <h4 className="font-bold text-orange-700 mb-2">🚦 (3) Traffic Monitoring</h4>
                            <p className="text-xs text-orange-800 mb-2">IoT ka use <strong>traffic control</strong> mein bhi hota hai.</p>
                            <div className="text-xs text-orange-700 space-y-1">
                                <p>👉 Vehicles ki <strong>speed detect</strong> karta hai</p>
                                <p>👉 Traffic condition <strong>analyse</strong> karta hai</p>
                                <p>👉 Traffic rules follow karwana easy hota hai — Traffic jam control hota hai</p>
                                <p>👉 Computer system <strong>automatically data analyse</strong> karta hai</p>
                            </div>
                        </div>

                        {/* Agriculture */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac' }}>
                            <h4 className="font-bold text-green-700 mb-2">🌾 (4) Agriculture</h4>
                            <p className="text-xs text-green-800 mb-2">IoT ka use <strong>farming</strong> mein bhi hota hai.</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['💧 Humidity', '🌿 Nutrients', '⚗️ Acidity'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">{s}</span>
                                ))}
                            </div>
                            <p className="text-xs text-green-700">👉 <strong>Better crop production</strong> aur <strong>smart irrigation</strong> possible hoti hai</p>
                        </div>

                        {/* Smart Home */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #c4b5fd' }}>
                            <h4 className="font-bold text-purple-700 mb-2">🏠 (5) Smart Home</h4>
                            <p className="text-xs text-purple-800 mb-2">IoT ka <strong>sabse common use</strong> smart home mein hota hai.</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['❄️ AC', '📺 Smart TV', '🧊 Refrigerator', '💡 LED Bulb', '🌀 Fan', '🚪 Smart Door', '🫧 Washing Machine'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">{s}</span>
                                ))}
                            </div>
                            <p className="text-xs text-purple-700">👉 User <strong>mobile se control</strong> kar sakta hai — jaise mobile se light ON/OFF karna</p>
                        </div>

                        {/* Smart City */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1px solid #fde047' }}>
                            <h4 className="font-bold text-yellow-700 mb-2">🏙️ (6) Smart City</h4>
                            <p className="text-xs text-yellow-800 mb-2">IoT ka use <strong>smart city</strong> banane mein hota hai.</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['🚦 Traffic Control', '🗑️ Waste Management', '💧 Water Distribution', '⚡ Electricity', '🌫️ Pollution Checking'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-semibold border border-yellow-300">{s}</span>
                                ))}
                            </div>
                            <p className="text-xs text-yellow-700">👉 City <strong>efficient aur automated</strong> ho jaati hai</p>
                        </div>

                        {/* Industrial */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', border: '1px solid #f9a8d4' }}>
                            <h4 className="font-bold text-pink-700 mb-2">🏭 (7) Industrial Automation</h4>
                            <p className="text-xs text-pink-800 mb-2">IoT <strong>industries mein production improve</strong> karta hai.</p>
                            <div className="text-xs text-pink-700 space-y-1">
                                <p>👉 Machines <strong>automatically kaam</strong> karti hain</p>
                                <p>👉 <strong>Human effort kam</strong> hota hai — Production fast hota hai</p>
                                <p>👉 Automation <strong>bina human interaction</strong> ke possible hai</p>
                            </div>
                        </div>

                        {/* Surveillance */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <h4 className="font-bold text-slate-700 mb-2">📹 (8) Surveillance</h4>
                            <p className="text-xs text-slate-700 mb-2">IoT ka use <strong>security aur monitoring</strong> mein hota hai.</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['🏠 Home', '🏢 Office', '✈️ Airport', '🚉 Railway Station'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">{s}</span>
                                ))}
                            </div>
                            <p className="text-xs text-slate-600">👉 CCTV cameras mein sensors lage hote hain — system activity detect karta hai aur <strong>owner ko alert/message</strong> bhejta hai</p>
                        </div>

                        <IB type="note">CCTV = <strong>Closed Circuit Television</strong> — ek surveillance system jisme cameras security, monitoring aur recording ke liye use hote hain.</IB>
                    </Sec>

                    {/* ═══ Building Blocks of IoT ═══ */}
                    <Sec id="building-blocks" title="🔴 Building Blocks of IoT" icon={<Layers size={16} className="text-purple-500" />}>
                        <Def>🧱 IoT system ko banane ke liye <strong>4 main building blocks</strong> hote hain — har block ka apna important role hota hai.</Def>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                            {[{ n: '1', e: '📡', t: 'Sensors', c: '#06b6d4' }, { n: '2', e: '⚙️', t: 'Processor', c: '#8b5cf6' }, { n: '3', e: '🌐', t: 'Gateway', c: '#10b981' }, { n: '4', e: '📱', t: 'Application', c: '#f97316' }].map((b, i) => (
                                <div key={i} className="p-3 rounded-2xl text-center" style={{ background: `${b.c}10`, border: `1px solid ${b.c}30` }}>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black mx-auto mb-1" style={{ background: b.c }}>{b.n}</div>
                                    <div className="text-xl mb-1">{b.e}</div>
                                    <h5 className="font-bold text-[11px]" style={{ color: b.c }}>{b.t}</h5>
                                </div>
                            ))}
                        </div>

                        {/* Block 1 - Sensors */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)', border: '1px solid #67e8f9' }}>
                            <h4 className="font-bold text-cyan-700 mb-2">📡 (1) Sensors</h4>
                            <p className="text-xs text-cyan-800 mb-2">Sensors IoT device ka <strong>front-end</strong> hote hain — ye environment se data receive karte hain.</p>
                            <div className="flex flex-wrap gap-2">
                                {['📐 Accelerometer', '🌡️ Temperature', '📍 Proximity', '💨 Gas Sensor', '🏃 Motion', '💧 Water Sensor'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-white text-cyan-700 text-xs font-semibold border border-cyan-200">{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Block 2 - Processor */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #c4b5fd' }}>
                            <h4 className="font-bold text-purple-700 mb-2">⚙️ (2) Processor</h4>
                            <p className="text-xs text-purple-800 mb-2">Processor ek <strong>electrical system</strong> hota hai — sensors se aane wale raw data ko process karta hai.</p>
                            <div className="text-xs text-purple-700 space-y-1 mb-2">
                                <p>• Data ko <strong>information mein convert</strong> karna</p>
                                <p>• Data ko <strong>control</strong> karna</p>
                                <p>• <strong>Encryption / Decryption</strong> karna</p>
                            </div>
                            <div className="flex gap-2">
                                {['🔬 Microcontroller', '💻 Embedded Hardware'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Block 3 - Gateway */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac' }}>
                            <h4 className="font-bold text-green-700 mb-2">🌐 (3) Gateway</h4>
                            <p className="text-xs text-green-800 mb-2">Gateway <strong>data transfer ka main medium</strong> hota hai — data ko network mein bhejta hai aur communication establish karta hai.</p>
                            <div className="flex gap-2">
                                {['🔗 LAN', '🌍 WAN', '📶 PAN'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">{s}</span>
                                ))}
                            </div>
                        </div>

                        {/* Block 4 - Application */}
                        <div className="rounded-2xl p-4 mb-3" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', border: '1px solid #fdba74' }}>
                            <h4 className="font-bold text-orange-700 mb-2">📱 (4) Application</h4>
                            <p className="text-xs text-orange-800 mb-2">Application <strong>user side</strong> hoti hai — data collect karti hai aur user ko information provide karti hai.</p>
                            <div className="flex flex-wrap gap-2">
                                {['📱 Mobile Apps', '🔒 Security Apps', '🏭 Industrial Apps'].map((s, i) => (
                                    <span key={i} className="px-2 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200">{s}</span>
                                ))}
                            </div>
                        </div>

                        <IB type="tip">IoT Building Blocks ka flow: <strong>Sensors → Processor → Gateway → Application</strong> — data collect se lekar user tak pahunchne ka complete path!</IB>
                    </Sec>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 mb-4">
                        <Link href="/iot" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-cyan-50 hover:text-cyan-700 transition-all">
                            <ArrowLeft size={16} /> Back to IoT
                        </Link>
                        <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
                            Chapter 2 <Shield size={16} /> 🔒
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
