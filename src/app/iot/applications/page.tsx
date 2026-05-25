'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, X, ChevronRight, Hash, Sparkles, Cpu, Activity, Zap, Eye, Sun, Settings, Cog, Microchip, Clock, Monitor, Box, Wrench, Shield, Smartphone, Globe, Battery, Layers, Smile, Tag, Home, CircuitBoard, BookOpen, ToggleLeft, MousePointerClick, FileCode2, Braces } from 'lucide-react';

function Sec({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section id={id} className="rounded-2xl p-5 md:p-7 mb-5 scroll-mt-20 transition-all duration-300 hover:shadow-lg bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2.5 mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>{icon}<h2 className="text-base md:text-lg font-extrabold text-gray-800">{title}</h2></div>
            <div className="text-sm leading-relaxed space-y-3 text-gray-600">{children}</div>
        </section>
    );
}

function Def({ children }: { children: ReactNode }) {
    return <div className="rounded-xl p-4 my-3 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '1px solid #99f6e4', color: '#0f766e' }}>{children}</div>;
}

function IB({ type = 'tip', children }: { type?: 'tip' | 'note' | 'warning'; children: ReactNode }) {
    const s: Record<string, { bg: string; bc: string; tc: string; emoji: string }> = { tip: { bg: '#ecfeff', bc: '#67e8f9', tc: '#0e7490', emoji: '💡' }, note: { bg: '#eff6ff', bc: '#93c5fd', tc: '#1e40af', emoji: '📝' }, warning: { bg: '#fefce8', bc: '#fde047', tc: '#854d0e', emoji: '⚠️' } };
    const st = s[type];
    return <div className="rounded-xl p-3.5 text-xs font-medium my-3" style={{ background: st.bg, border: `1px solid ${st.bc}`, color: st.tc }}>{st.emoji} {children}</div>;
}

const tocItems = [
    { icon: <Microchip size={13} />, label: 'Intro to Arduino', id: 'arduino-intro', color: '#0ea5e9' },
    { icon: <Monitor size={13} />, label: 'Arduino IDE', id: 'arduino-ide', color: '#8b5cf6' },
    { icon: <Sparkles size={13} />, label: 'Features', id: 'arduino-features', color: '#f59e0b' },
    { icon: <Cog size={13} />, label: 'Uses of Arduino', id: 'arduino-uses', color: '#10b981' },
    { icon: <Clock size={13} />, label: 'History', id: 'arduino-history', color: '#ec4899' },
    { icon: <Shield size={13} />, label: 'Why Use Arduino', id: 'why-arduino', color: '#3b82f6' },
    { icon: <CircuitBoard size={13} />, label: 'Types of Boards', id: 'arduino-types', color: '#f43f5e' },
    { icon: <Cpu size={13} />, label: 'Arduino Uno R3', id: 'arduino-uno-deepdive', color: '#14b8a6' },
    { icon: <Shield size={13} />, label: 'Arduino Shield', id: 'arduino-shield', color: '#ef4444' },
    { icon: <Monitor size={13} />, label: 'Arduino IDE Deep Dive', id: 'arduino-ide-deepdive', color: '#8b5cf6' },
    { icon: <BookOpen size={13} />, label: 'Arduino Library', id: 'arduino-library', color: '#d946ef' },
    { icon: <ToggleLeft size={13} />, label: 'Input & Output Pins', id: 'arduino-pins', color: '#0ea5e9' },
    { icon: <MousePointerClick size={13} />, label: 'Select the Board', id: 'arduino-select-board', color: '#f59e0b' },
    { icon: <FileCode2 size={13} />, label: 'Writing & Editing Codes', id: 'arduino-sketch-edit', color: '#10b981' },
    { icon: <Braces size={13} />, label: 'Sketch Structure', id: 'arduino-sketch-structure', color: '#8b5cf6' },
    { icon: <Cog size={13} />, label: 'What is Function', id: 'what-is-function', color: '#ef4444' },
    { icon: <Cpu size={13} />, label: 'Embedded C Language', id: 'embedded-c', color: '#0ea5e9' },
    { icon: <Tag size={13} />, label: 'Variables', id: 'variables', color: '#f59e0b' },
    { icon: <Shield size={13} />, label: 'Rules for Variables', id: 'variable-rules', color: '#ec4899' },
    { icon: <Layers size={13} />, label: 'Data Types', id: 'data-types', color: '#8b5cf6' },
    { icon: <Activity size={13} />, label: 'Operators in C', id: 'operators', color: '#f43f5e' },
];

export default function IoTApplications() {
    const [tocOpen, setTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('arduino-intro');

    return (
        <div className="min-h-screen bg-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30" />
            </div>

            <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/iot" className="flex items-center justify-center w-9 h-9 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><ArrowLeft size={16} /></Link>
                        <div>
                            <h1 className="text-sm font-extrabold text-gray-800">Building IoT Applications</h1>
                            <div className="flex items-center gap-1.5"><Sparkles size={8} className="text-emerald-500" /><span className="text-[9px] uppercase tracking-[0.18em] font-bold text-emerald-500">Chapter 4</span></div>
                        </div>
                    </div>
                    <button onClick={() => setTocOpen(!tocOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 border border-gray-200">
                        {tocOpen ? <X size={18} className="text-emerald-500" /> : <Menu size={18} className="text-emerald-500" />}
                    </button>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #10b981, #34d399, #059669, #10b981)' }} />
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                <aside className={`${tocOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[52px] left-0 z-40 lg:z-10 w-64 lg:w-56 xl:w-64 h-[calc(100vh-52px)] overflow-y-auto transition-transform duration-300 lg:flex-shrink-0 bg-white/95 backdrop-blur-xl`} style={{ borderRight: '1px solid #e2e8f0' }}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Hash size={12} className="text-white" /></div>
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
                    <section className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 30%, #34d399 60%, #a7f3d0 100%)', boxShadow: '0 8px 32px rgba(16,185,129,0.25)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
                        </div>
                        <div className="relative z-10 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#064e3b' }}>
                                <Sparkles size={10} /> Chapter 4 — O-Level M4-R5
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white" style={{ lineHeight: '1.2' }}>Building IoT Application</h2>
                            <p className="text-sm md:text-base max-w-2xl mb-5 text-white/90 font-medium">Arduino board ki basics seekhiye aur apne first smart device application banane ki shuruwat kijiye.</p>
                        </div>
                    </section>

                    {/* ═══ SECTION: Intro to Arduino ═══ */}
                    <Sec id="arduino-intro" title="🔹 Introduction to Arduino" icon={<Microchip size={16} className="text-sky-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <Def>🔵 <strong>Arduino</strong> ek open-source electronic platform hai jo hardware aur software dono provide karta hai.</Def>
                                <p>Is platform ka use electronic projects aur IoT applications banane ke liye kiya jata hai. Arduino beginners aur experts dono ke liye bahut useful hota hai kyunki iska programming environment simple aur easy hota hai.</p>
                                <p>Arduino ki madad se <strong>sensors aur modules</strong> ko connect karke unhe program kiya ja sakta hai aur real-world applications (jaise smart home, robotics) banaye ja sakte hain.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_board.png" alt="Arduino Board" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mt-5">
                            <p className="text-sm text-sky-900 font-semibold mb-2">Arduino kaise kaam karta hai:</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <span className="px-4 py-2 bg-white rounded-lg border border-sky-200 text-sky-700 shadow-sm font-bold text-xs flex items-center gap-1"><Eye size={14} /> 1. Read Sensors</span>
                                <ChevronRight className="text-sky-400 rotate-90 sm:rotate-0" />
                                <span className="px-4 py-2 bg-sky-600 rounded-lg text-white shadow-md font-bold text-xs flex items-center gap-1"><Cpu size={14} /> 2. Process Data</span>
                                <ChevronRight className="text-sky-400 rotate-90 sm:rotate-0" />
                                <span className="px-4 py-2 bg-white rounded-lg border border-sky-200 text-sky-700 shadow-sm font-bold text-xs flex items-center gap-1"><Cog size={14} /> 3. Control Actuators</span>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Arduino IDE ═══ */}
                    <Sec id="arduino-ide" title="🔹 Arduino IDE" icon={<Monitor size={16} className="text-purple-500" />}>
                        <div className="flex flex-col md:flex-row-reverse gap-5 items-center">
                            <div className="flex-1 space-y-3">
                                <p>Arduino ko program karne ke liye <strong>Arduino IDE (Integrated Development Environment)</strong> ka use kiya jata hai.</p>
                                <p>Ye ek software hota hai jisme:</p>
                                <ul className="space-y-2 mb-3">
                                    <li className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100"><span className="text-purple-500 font-bold">1.</span> Code likha jata hai</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100"><span className="text-purple-500 font-bold">2.</span> Code compile hota hai (Errors check hote hain)</li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100"><span className="text-purple-500 font-bold">3.</span> Code upload hota hai (Microcontroller me save hota hai)</li>
                                </ul>
                                <IB type="note">Arduino IDE <strong>C/C++ based language</strong> ko support karta hai. Iski language seekhna bahut aasan hota hai.</IB>
                            </div>
                            <div className="w-full md:w-72 flex-shrink-0">
                                <img src="/iot/arduino_ide.png" alt="Arduino IDE Software" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Features of Arduino ═══ */}
                    <Sec id="arduino-features" title="🔹 Features of Arduino" icon={<Sparkles size={16} className="text-amber-500" />}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {[
                                { title: 'Easy Programming', icon: <Monitor size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                { title: 'Open-Source', icon: <Globe size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                                { title: 'Beginner Friendly', icon: <Smile size={20} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                { title: 'Sensor Support', icon: <Activity size={20} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                                { title: 'Fast Prototyping', icon: <Zap size={20} />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                                { title: 'Low Cost', icon: <Tag size={20} />, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
                            ].map((f, i) => (
                                <div key={i} className={`p-4 rounded-xl ${f.bg} ${f.border} border text-center flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow`}>
                                    <div className={f.color}>{f.icon}</div>
                                    <span className="text-xs font-bold text-gray-800">{f.title}</span>
                                </div>
                            ))}
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Uses of Arduino ═══ */}
                    <Sec id="arduino-uses" title="🔹 Uses of Arduino" icon={<Cog size={16} className="text-emerald-500" />}>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1 space-y-4">
                                <p>Arduino ka use different IoT aur automation projects me hota hai:</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center"><Sun size={20} /></div>
                                        <span className="text-sm font-semibold text-gray-700">Automatic light system</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Cpu size={20} /></div>
                                        <span className="text-sm font-semibold text-gray-700">Smart robot</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><Shield size={20} /></div>
                                        <span className="text-sm font-semibold text-gray-700">Security system</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Activity size={20} /></div>
                                        <span className="text-sm font-semibold text-gray-700">Sensor based apps</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors sm:col-span-2">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Home size={20} /></div>
                                        <span className="text-sm font-semibold text-gray-700">Home automation system</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_uses.png" alt="Arduino IoT Uses" className="w-full h-auto rounded-2xl shadow-md border border-emerald-100/50" />
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: History of Arduino ═══ */}
                    <Sec id="arduino-history" title="🔹 History of Arduino" icon={<Clock size={16} className="text-rose-500" />}>
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-[-20px] top-[-20px] opacity-10"><Microchip size={100} /></div>
                            
                            <ul className="space-y-3 relative z-10">
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 mt-0.5 flex-shrink-0 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">1</div>
                                    <p className="text-sm text-gray-700">Arduino ko <strong>2005</strong> me <strong>Italy</strong> me develop kiya gaya tha.</p>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 mt-0.5 flex-shrink-0 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</div>
                                    <p className="text-sm text-gray-700">Isse <strong>Ivrea Interaction Design Institute</strong> ne students ke liye ek low-cost aur easy programming board ke roop me design kiya tha.</p>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 mt-0.5 flex-shrink-0 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</div>
                                    <p className="text-sm text-gray-700">Arduino ek microcontroller based board hai jo <strong>ATmega series</strong> ke microcontrollers par based hota hai.</p>
                                </li>
                            </ul>

                            <div className="mt-5 pt-4 border-t border-rose-200">
                                <p className="text-xs font-bold text-rose-800 mb-2 uppercase tracking-wide">👨‍💻 Arduino Development Team Members:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Massimo Banzi', 'David Cuartielles', 'David Mellis', 'Tom Igoe'].map((name, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-rose-200 rounded-full text-xs font-semibold text-gray-700 shadow-sm">{name}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Why Use Arduino ═══ */}
                    <Sec id="why-arduino" title="🔴 Why Use Arduino" icon={<Shield size={16} className="text-blue-500" />}>
                        <p className="mb-5 text-sm text-gray-700">Arduino duniya ka sabse popular embedded aur IoT development platform mana jata hai. Iska use beginners se lekar professional developers tak sab karte hain kyunki ye easy, low-cost aur flexible platform provide karta hai.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* 1. Open Source */}
                            <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-blue-900 text-base mb-2 flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Globe size={18} /></div>
                                    1. Open Source Platform
                                </h4>
                                <p className="text-xs text-gray-600 mb-3">Arduino ek open-source platform hai. Iska software aur hardware design publicly available hota hai.</p>
                                <ul className="text-[11px] text-gray-600 space-y-1 ml-6 list-disc marker:text-blue-400">
                                    <li>Arduino software free me use kar sakta hai</li>
                                    <li>Hardware design ko modify kar sakta hai</li>
                                    <li>Apna custom board bana sakta hai</li>
                                </ul>
                                <p className="text-[11px] font-semibold text-blue-700 mt-2 bg-blue-50 p-2 rounded-lg">Isi wajah se Arduino community bahut badi hai aur internet par iske thousands projects available hain.</p>
                            </div>

                            {/* 2. Cross Platform */}
                            <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-purple-900 text-base mb-2 flex items-center gap-2">
                                    <div className="p-1.5 bg-purple-50 text-purple-500 rounded-lg"><Layers size={18} /></div>
                                    2. Cross Platform Support
                                </h4>
                                <p className="text-xs text-gray-600 mb-3">Arduino IDE cross-platform software hai. Ye different operating systems par chal sakta hai, yani kisi bhi computer me Arduino programming ki ja sakti hai.</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">Windows</span>
                                    <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">Linux</span>
                                    <span className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">MacOS</span>
                                </div>
                            </div>

                            {/* 3. Inexpensive */}
                            <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-emerald-900 text-base mb-2 flex items-center gap-2">
                                    <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Tag size={18} /></div>
                                    3. Inexpensive (Low Cost)
                                </h4>
                                <p className="text-xs text-gray-600 mb-3">Arduino boards dusre microcontroller platforms ke comparison me kaafi saste hote hain.</p>
                                <p className="text-[11px] text-gray-600 bg-emerald-50 p-2 rounded-lg">Original Arduino board ki cost kam hoti hai aur clone boards aur bhi low price me available hote hain. Isliye students aur beginners ke liye ye best platform mana jata hai.</p>
                            </div>

                            {/* 4. Wide Variety */}
                            <div className="p-4 rounded-xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-amber-900 text-base mb-2 flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><Box size={18} /></div>
                                    4. Wide Variety of Boards
                                </h4>
                                <p className="text-xs text-gray-600 mb-3">Arduino ke different types ke boards available hote hain jinko project requirement ke according select kiya ja sakta hai.</p>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {['Size', 'Speed', 'Memory', 'Pins'].map((prop, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-200">{prop}</span>
                                    ))}
                                </div>
                                <p className="text-[11px] text-gray-600">Har board me ye properties alag hoti hain. Isliye small aur large dono types ke projects me Arduino use kiya ja sakta hai.</p>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Types of Arduino Boards ═══ */}
                    <Sec id="arduino-types" title="🔴 Different Types of Arduino Board" icon={<CircuitBoard size={16} className="text-rose-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <p>Arduino platform me different types ke boards available hote hain jo alag-alag projects aur applications ke liye use kiye jate hain. Har board ki apni specifications, memory, pins aur features hote hain.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_types.png" alt="Different Types of Arduino Boards" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* 1. Arduino Uno R3 */}
                            <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Cpu size={16} /></div>
                                            🔴 1. Arduino Uno R3
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">Arduino Uno sabse popular aur widely used Arduino board hai. Ye beginners aur IoT projects ke liye sabse jyada use kiya jata hai. Ye <strong>ATmega328P</strong> microcontroller par based hota hai.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-800 mb-1">⚡ Features</p>
                                                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc marker:text-blue-400">
                                                    <li>Easy programming & Beginner friendly</li>
                                                    <li>USB support</li>
                                                    <li>Analog aur digital pins</li>
                                                    <li>Sensor interfacing support</li>
                                                </ul>
                                            </div>
                                            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                                <p className="text-xs font-bold text-indigo-800 mb-1">🛠️ Uses</p>
                                                <ul className="text-xs text-indigo-700 space-y-1 ml-4 list-disc marker:text-indigo-400">
                                                    <li>IoT projects & Robotics</li>
                                                    <li>Automation systems</li>
                                                    <li>Learning purpose</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 xl:w-40 flex-shrink-0 flex items-center justify-center">
                                        <img src="/iot/arduino_uno.png" alt="Arduino Uno R3" className="w-full h-auto max-w-[150px] object-contain drop-shadow-md rounded-xl bg-gray-50/50 border border-gray-100 p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Arduino Nano */}
                            <div className="p-5 rounded-2xl bg-white border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-teal-100 text-teal-600 rounded-lg"><Microchip size={16} /></div>
                                            🔴 2. Arduino Nano
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">Arduino Nano ek small size Arduino board hota hai jo compact projects ke liye use hota hai. Ye bhi <strong>ATmega328P</strong> microcontroller par based hota hai. Iska size chhota hota hai lekin functionality Arduino Uno jaisi hoti hai.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                                                <p className="text-xs font-bold text-teal-800 mb-1">⚡ Features</p>
                                                <ul className="text-xs text-teal-700 space-y-1 ml-4 list-disc marker:text-teal-400">
                                                    <li>Small size</li>
                                                    <li>Breadboard friendly</li>
                                                    <li>Low power consumption</li>
                                                </ul>
                                            </div>
                                            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                                <p className="text-xs font-bold text-emerald-800 mb-1">🛠️ Uses</p>
                                                <ul className="text-xs text-emerald-700 space-y-1 ml-4 list-disc marker:text-emerald-400">
                                                    <li>Wearable devices</li>
                                                    <li>Compact embedded systems</li>
                                                    <li>Small IoT devices</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 xl:w-40 flex-shrink-0 flex items-center justify-center">
                                        <img src="/iot/arduino_nano.png" alt="Arduino Nano" className="w-full h-auto max-w-[150px] object-contain drop-shadow-md rounded-xl bg-gray-50/50 border border-gray-100 p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Arduino Micro */}
                            <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Cpu size={16} /></div>
                                            🔴 3. Arduino Micro
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">Arduino Micro <strong>ATmega32U4</strong> microcontroller par based hota hai. Ye USB communication ko directly support karta hai aur small-size projects ke liye suitable hota hai.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                                                <p className="text-xs font-bold text-purple-800 mb-1">⚡ Features</p>
                                                <ul className="text-xs text-purple-700 space-y-1 ml-4 list-disc marker:text-purple-400">
                                                    <li>Compact design</li>
                                                    <li>USB communication support</li>
                                                    <li>Low power consumption</li>
                                                </ul>
                                            </div>
                                            <div className="bg-fuchsia-50/50 p-3 rounded-xl border border-fuchsia-100">
                                                <p className="text-xs font-bold text-fuchsia-800 mb-1">🛠️ Uses</p>
                                                <ul className="text-xs text-fuchsia-700 space-y-1 ml-4 list-disc marker:text-fuchsia-400">
                                                    <li>Keyboard projects</li>
                                                    <li>Mouse controller</li>
                                                    <li>Portable electronics</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 xl:w-40 flex-shrink-0 flex items-center justify-center">
                                        <img src="/iot/arduino_micro.png" alt="Arduino Micro" className="w-full h-auto max-w-[150px] object-contain drop-shadow-md rounded-xl bg-gray-50/50 border border-gray-100 p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Arduino Leonardo */}
                            <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Microchip size={16} /></div>
                                            🔴 4. Arduino Leonardo
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">Arduino Leonardo bhi <strong>ATmega32U4</strong> microcontroller par based board hai. Ye USB communication ko directly handle kar sakta hai.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                                                <p className="text-xs font-bold text-rose-800 mb-1">⚡ Features</p>
                                                <ul className="text-xs text-rose-700 space-y-1 ml-4 list-disc marker:text-rose-400">
                                                    <li>USB support</li>
                                                    <li>Easy interfacing</li>
                                                    <li>Stable performance</li>
                                                </ul>
                                            </div>
                                            <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                                <p className="text-xs font-bold text-orange-800 mb-1">🛠️ Uses</p>
                                                <ul className="text-xs text-orange-700 space-y-1 ml-4 list-disc marker:text-orange-400">
                                                    <li>Human interface devices</li>
                                                    <li>Automation systems</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 xl:w-40 flex-shrink-0 flex items-center justify-center">
                                        <img src="/iot/arduino_leonardo.png" alt="Arduino Leonardo" className="w-full h-auto max-w-[150px] object-contain drop-shadow-md rounded-xl bg-gray-50/50 border border-gray-100 p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* 5. Arduino Mega 2560 */}
                            <div className="p-5 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Cpu size={16} /></div>
                                            🔴 5. Arduino Mega 2560 Rev 3
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">Arduino Mega advanced projects ke liye use hota hai. Ye <strong>ATmega2560</strong> microcontroller par based hota hai aur isme bahut jyada pins aur memory available hoti hai.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                                <p className="text-xs font-bold text-amber-800 mb-1">⚡ Features</p>
                                                <ul className="text-xs text-amber-700 space-y-1 ml-4 list-disc marker:text-amber-400">
                                                    <li>Large memory</li>
                                                    <li>More digital pins</li>
                                                    <li>Multiple serial ports</li>
                                                </ul>
                                            </div>
                                            <div className="bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                                                <p className="text-xs font-bold text-yellow-800 mb-1">🛠️ Uses</p>
                                                <ul className="text-xs text-yellow-700 space-y-1 ml-4 list-disc marker:text-yellow-400">
                                                    <li>Robotics</li>
                                                    <li>3D printers</li>
                                                    <li>Large IoT projects</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 xl:w-40 flex-shrink-0 flex items-center justify-center">
                                        <img src="/iot/arduino_mega.png" alt="Arduino Mega" className="w-full h-auto max-w-[150px] object-contain drop-shadow-md rounded-xl bg-gray-50/50 border border-gray-100 p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* 6. Arduino Due */}
                            <div className="p-5 rounded-2xl bg-white border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg"><Cpu size={16} /></div>
                                            🔴 6. Arduino Due
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-3">Arduino Due ek high-performance board hai jo <strong>ARM Cortex</strong> microcontroller par based hota hai. Ye 32-bit architecture support karta hai aur Arduino Uno se kaafi fast hota hai.</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                            <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                                                <p className="text-xs font-bold text-sky-800 mb-1">⚡ Features</p>
                                                <ul className="text-xs text-sky-700 space-y-1 ml-4 list-disc marker:text-sky-400">
                                                    <li>32-bit processing</li>
                                                    <li>High speed</li>
                                                    <li>Large memory support</li>
                                                </ul>
                                            </div>
                                            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-xs font-bold text-blue-800 mb-1">🛠️ Uses</p>
                                                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc marker:text-blue-400">
                                                    <li>Advanced automation</li>
                                                    <li>Industrial systems</li>
                                                    <li>Complex embedded projects</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-32 xl:w-40 flex-shrink-0 flex items-center justify-center">
                                        <img src="/iot/arduino_due.png" alt="Arduino Due" className="w-full h-auto max-w-[150px] object-contain drop-shadow-md rounded-xl bg-gray-50/50 border border-gray-100 p-2" />
                                    </div>
                                </div>
                            </div>

                            {/* 7-15 Other Boards */}
                            <h4 className="font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2">🔴 Other Important Arduino Boards</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* 7. LilyPad */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_lilypad.png" alt="LilyPad" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">7. LilyPad Arduino</h5>
                                        <p className="text-xs text-gray-600 mb-2">Specially wearable electronics ke liye design kiya gaya board hai.</p>
                                        <p className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded">Uses: Smart clothes, Wearables</p>
                                    </div>
                                </div>

                                {/* 8. Arduino Bluetooth */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_bluetooth.png" alt="Arduino Bluetooth" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">8. Arduino Bluetooth</h5>
                                        <p className="text-xs text-gray-600 mb-2">Wireless communication support karta hai. Bluetooth module inbuilt hota hai.</p>
                                        <p className="text-[10px] font-semibold text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded">Uses: Wireless control systems</p>
                                    </div>
                                </div>

                                {/* 9. Arduino Diecimila */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_diecimila.png" alt="Arduino Diecimila" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">9. Arduino Diecimila</h5>
                                        <p className="text-xs text-gray-600">Old-generation Arduino board hai jo basic embedded projects ke liye use hota tha.</p>
                                    </div>
                                </div>

                                {/* 10. RedBoard */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_redboard.png" alt="RedBoard" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">10. RedBoard</h5>
                                        <p className="text-xs text-gray-600">Arduino Uno jaisa hi board hota hai jo compatible design provide karta hai.</p>
                                    </div>
                                </div>

                                {/* 11. Arduino Robot */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_robot.png" alt="Arduino Robot" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">11. Arduino Robot</h5>
                                        <p className="text-xs text-gray-600 mb-2">Programmable robotic platform for robotics learning and projects.</p>
                                        <p className="text-[10px] font-semibold text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded">Uses: Robotics, Automation</p>
                                    </div>
                                </div>

                                {/* 12. Arduino Esplora */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_esplora.png" alt="Arduino Esplora" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">12. Arduino Esplora</h5>
                                        <p className="text-xs text-gray-600 mb-2">Special board jisme inbuilt sensors aur joystick available hote hain.</p>
                                        <p className="text-[10px] font-semibold text-pink-700 bg-pink-50 inline-block px-2 py-1 rounded">Uses: Gaming projects, Sensors</p>
                                    </div>
                                </div>

                                {/* 13. Arduino Ethernet */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_ethernet.png" alt="Arduino Ethernet" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">13. Arduino Ethernet</h5>
                                        <p className="text-xs text-gray-600 mb-2">Internet communication support karta hai directly network se connect ho sakta hai.</p>
                                        <p className="text-[10px] font-semibold text-sky-700 bg-sky-50 inline-block px-2 py-1 rounded">Uses: IoT networking, Web servers</p>
                                    </div>
                                </div>

                                {/* 14. Arduino Zero */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_board.png" alt="Arduino Zero (Placeholder)" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">14. Arduino Zero</h5>
                                        <p className="text-xs text-gray-600 mb-2">Modern 32-bit development board hai jo advanced embedded systems ke liye use hota hai.</p>
                                        <p className="text-[10px] font-semibold text-orange-700 bg-orange-50 inline-block px-2 py-1 rounded">Features: Fast processing, Low power</p>
                                    </div>
                                </div>

                                {/* 15. Arduino Pro */}
                                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all md:col-span-2 flex flex-col sm:flex-row items-center gap-4">
                                    <img src="/iot/arduino_board.png" alt="Arduino Pro (Placeholder)" className="w-24 h-24 object-contain rounded-xl drop-shadow-sm bg-white border border-gray-200 p-1" />
                                    <div className="flex-1 text-center sm:text-left">
                                        <h5 className="font-bold text-gray-800 text-sm mb-1">15. Arduino Pro</h5>
                                        <p className="text-xs text-gray-600 mb-2">Lightweight aur low-power applications ke liye design kiya gaya board hai.</p>
                                        <p className="text-[10px] font-semibold text-rose-700 bg-rose-50 inline-block px-2 py-1 rounded">Uses: Portable systems, Battery-operated devices</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Arduino Uno R3 Deep Dive ═══ */}
                    <Sec id="arduino-uno-deepdive" title="🔴 Arduino Uno R3 Deep Dive" icon={<Cpu size={16} className="text-teal-500" />}>
                        <div className="space-y-6">
                            {/* Intro text */}
                            <div className="bg-white p-5 rounded-2xl border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-sm text-gray-700 leading-relaxed mb-3"><strong>Arduino Uno R3</strong> duniya ka sabse popular aur sabse jyada use hone wala Arduino development board hai. Ye specially beginners, students aur IoT developers ke liye design kiya gaya hai taaki electronic projects aur embedded systems ko easily develop kiya ja sake.</p>
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">Ye <strong>ATmega328P microcontroller</strong> par based hota hai aur ye sensors, motors, LEDs aur different electronic modules ko control kar sakta hai. <br/> "R3" ka matlab hota hai "Revision 3", yani Arduino Uno ka upgraded version.</p>
                            </div>

                            {/* Detailed image section */}
                            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <img src="/iot/arduino_uno_detailed_pins.png" alt="Detailed Arduino Uno R3 Pins" className="w-full h-auto rounded-xl shadow-md border border-gray-200" />
                            </div>

                            {/* Main Components Grid */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Box size={16} /></div> 🔹 Main Components of Arduino Uno R3</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-indigo-100 bg-white shadow-sm hover:-translate-y-1 transition-transform">
                                        <h4 className="font-bold text-indigo-900 text-sm mb-2">1. ATmega328P Microcontroller</h4>
                                        <p className="text-xs text-gray-600">Ye Arduino Uno ka main brain hota hai. Iske andar CPU, RAM, ROM, Timers aur Input/Output ports available hote hain. Ye program instructions ko execute karta hai aur poore board ko control karta hai.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-indigo-100 bg-white shadow-sm hover:-translate-y-1 transition-transform">
                                        <h4 className="font-bold text-indigo-900 text-sm mb-2">2. USB Port</h4>
                                        <p className="text-xs text-gray-600">USB port ka use Computer se connection, Program upload aur Power supply ke liye hota hai. USB cable ke through Arduino ko directly laptop ya PC se connect kiya jata hai.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-indigo-100 bg-white shadow-sm hover:-translate-y-1 transition-transform">
                                        <h4 className="font-bold text-indigo-900 text-sm mb-2">3. DC Power Jack</h4>
                                        <p className="text-xs text-gray-600">Agar USB available na ho to external adapter ya battery se Arduino ko power di ja sakti hai. Usually 7V se 12V tak supply di jati hai.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-indigo-100 bg-white shadow-sm hover:-translate-y-1 transition-transform">
                                        <h4 className="font-bold text-indigo-900 text-sm mb-2">4. Reset Button</h4>
                                        <p className="text-xs text-gray-600">Reset button board par uploaded program ko dobara start karta hai. Is button ko press karte hi Arduino fir se beginning se code execute karta hai.</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-indigo-100 bg-white shadow-sm hover:-translate-y-1 transition-transform md:col-span-2">
                                        <h4 className="font-bold text-indigo-900 text-sm mb-2">5. Crystal Oscillator & Voltage Regulator</h4>
                                        <p className="text-xs text-gray-600 flex flex-col sm:flex-row gap-4">
                                            <span className="flex-1"><strong className="text-indigo-700">Crystal Oscillator:</strong> 16 MHz ka hota hai, ye clock signals generate karta hai jisse microcontroller ki processing speed control hoti hai.</span>
                                            <span className="flex-1"><strong className="text-indigo-700">Voltage Regulator:</strong> Incoming voltage ko stable banata hai taaki board safe rahe aur proper voltage receive kare.</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Specs Table */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Settings size={16} /></div> 🔴 Technical Specifications</h3>
                                <div className="overflow-x-auto rounded-xl border border-emerald-200 shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-emerald-800 uppercase bg-emerald-100/50 border-b border-emerald-200">
                                            <tr>
                                                <th className="px-6 py-3 font-bold">Feature</th>
                                                <th className="px-6 py-3 font-bold">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-emerald-50">
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Microcontroller</td><td className="px-6 py-3 text-gray-700">ATmega328P</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Operating Voltage</td><td className="px-6 py-3 text-gray-700">5V</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Input Voltage</td><td className="px-6 py-3 text-gray-700">7V – 12V</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Digital I/O Pins</td><td className="px-6 py-3 text-gray-700">14 (including 6 PWM pins)</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Analog Input Pins</td><td className="px-6 py-3 text-gray-700">6 (A0 - A5)</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Flash Memory</td><td className="px-6 py-3 text-gray-700">32 KB</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">SRAM & EEPROM</td><td className="px-6 py-3 text-gray-700">2 KB (SRAM) | 1 KB (EEPROM)</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">Clock Speed</td><td className="px-6 py-3 text-gray-700">16 MHz</td></tr>
                                            <tr className="hover:bg-emerald-50/50 transition-colors"><td className="px-6 py-3 font-semibold text-gray-800">USB Connection</td><td className="px-6 py-3 text-gray-700">USB Type-B</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pins of Arduino Uno R3 */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Zap size={16} /></div> 🔴 Pins of Arduino Uno R3</h3>
                                <div className="space-y-4">
                                    <div className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm">
                                        <h4 className="font-bold text-rose-800 text-base mb-2">1. Digital Pins (0–13)</h4>
                                        <p className="text-sm text-gray-700 mb-3">Total 14 digital pins (0-13) hoti hain jo <strong>Input ya Output mode</strong> dono me kaam kar sakti hain. Input mode me sensor data read karti hain aur Output mode me LED, motor aadi control karti hain.</p>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold">0 (RX): Receive Data</span>
                                            <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold">1 (TX): Transmit Data</span>
                                            <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold">13: Built-in LED</span>
                                            <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-semibold">10-13: SPI Communication</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm">
                                        <h4 className="font-bold text-orange-800 text-base mb-2">2. PWM Pins (3, 5, 6, 9, 10, 11)</h4>
                                        <p className="text-sm text-gray-700 mb-3">PWM (Pulse Width Modulation) pins analog-like output generate karti hain. Inka use LED brightness control, motor speed control, aur servo control me hota hai.</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                                        <h4 className="font-bold text-amber-800 text-base mb-2">3. Analog Pins (A0–A5)</h4>
                                        <p className="text-sm text-gray-700 mb-3">Total 6 analog input pins hoti hain jo analog signals ko read karti hain (jaise Temperature sensor, LDR, Gas sensor, Potentiometer). Arduino ka ADC (Analog to Digital Converter) is signal ko digital value (0–1023) me convert karta hai.</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-teal-100 shadow-sm">
                                        <h4 className="font-bold text-teal-800 text-base mb-3">4. Power Pins & Communication Protocols</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                                                <p className="text-sm font-extrabold text-teal-900 mb-2">⚡ Power Pins</p>
                                                <ul className="text-sm text-teal-800 space-y-1.5 list-disc ml-5 font-medium">
                                                    <li><strong>VIN:</strong> External voltage input</li>
                                                    <li><strong>5V / 3.3V:</strong> Output voltages for sensors</li>
                                                    <li><strong>GND:</strong> Ground (0V)</li>
                                                    <li><strong>RESET:</strong> Reset pin</li>
                                                </ul>
                                            </div>
                                            <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                                                <p className="text-sm font-extrabold text-cyan-900 mb-2">📡 Communication Protocols</p>
                                                <ul className="text-sm text-cyan-800 space-y-1.5 list-disc ml-5 font-medium">
                                                    <li><strong>UART:</strong> Serial Communication (RX, TX)</li>
                                                    <li><strong>SPI:</strong> Fast Communication (Pins 10,11,12,13)</li>
                                                    <li><strong>I2C:</strong> 2-wire Protocol (SDA: A4, SCL: A5)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Memory & Conclusion */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-5 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 shadow-sm">
                                    <h4 className="font-bold text-purple-900 text-base mb-4 flex items-center gap-2"><Microchip size={18} className="text-purple-600"/> Memory Storage</h4>
                                    <ul className="space-y-3">
                                        <li className="bg-white/80 p-3 rounded-lg border border-purple-100 shadow-sm text-sm">
                                            <strong className="text-purple-800 block mb-0.5">Flash Memory (32 KB)</strong>
                                            <span className="text-gray-600">Program code store karne ke liye use hoti hai.</span>
                                        </li>
                                        <li className="bg-white/80 p-3 rounded-lg border border-purple-100 shadow-sm text-sm">
                                            <strong className="text-purple-800 block mb-0.5">SRAM (2 KB)</strong>
                                            <span className="text-gray-600">Temporary data storage ke liye use hoti hai.</span>
                                        </li>
                                        <li className="bg-white/80 p-3 rounded-lg border border-purple-100 shadow-sm text-sm">
                                            <strong className="text-purple-800 block mb-0.5">EEPROM (1 KB)</strong>
                                            <span className="text-gray-600">Permanent data storage ke liye use hoti hai.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 md:col-span-2 shadow-sm flex flex-col justify-center">
                                    <h4 className="font-bold text-blue-900 text-lg mb-3 flex items-center gap-2"><Sparkles size={20} className="text-blue-600"/> Final Understanding</h4>
                                    <p className="text-sm text-gray-800 leading-relaxed mb-4 font-medium">
                                        Arduino Uno R3 ek complete development board hai jo sensors read karta hai, data process karta hai aur output devices ko control karta hai. Isme ATmega328P microcontroller, Digital pins, Analog pins, PWM support aur Communication protocols sab available hote hain.
                                    </p>
                                    <div>
                                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">🔥 Top Applications:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Home automation', 'Smart lighting system', 'Robotics', 'IoT projects', 'Security systems', 'Weather monitoring', 'Smart agriculture'].map((app, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-300 rounded-lg text-xs font-bold text-blue-700 shadow-sm transition-colors">{app}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Arduino Shield ═══ */}
                    <Sec id="arduino-shield" title="🔴 Arduino Shield" icon={<Shield size={16} className="text-red-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <Def>Arduino shield ek additional board hota hai jo Arduino board ke upar directly attach kiya jata hai taaki Arduino ki functionality ko increase kiya ja sake.</Def>
                                <IB type="tip"><strong>Simple words me:</strong> "Shield = Arduino ka extension board"</IB>
                                <p>Shield ki madad se Arduino me naye features aur capabilities add ki jati hain bina extra complex wiring ke. Ye directly Arduino Uno ya doosre compatible boards ke pins par connect hota hai.</p>
                                <p className="text-sm">Ye board <strong>Power pins</strong>, <strong>Communication pins</strong> aur <strong>Digital/Analog pins</strong> ka use karke additional functions perform karta hai.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_shield.png" alt="Arduino Shield" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                <h4 className="font-bold text-gray-800 text-sm mb-2">⚡ Features of Arduino Shield</h4>
                                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc marker:text-gray-400">
                                    <li>Easy installation</li>
                                    <li>Plug and play support</li>
                                    <li>Additional functionality</li>
                                    <li>Sensor aur module support</li>
                                    <li>Fast development</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                <h4 className="font-bold text-emerald-800 text-sm mb-2">✅ Advantages</h4>
                                <ul className="text-sm text-emerald-700 space-y-1 ml-4 list-disc marker:text-emerald-400">
                                    <li>Wiring complexity kam hoti hai</li>
                                    <li>Development fast hota hai</li>
                                    <li>Multiple features easily add kiye ja sakte hain</li>
                                    <li>Beginners ke liye easy hota hai</li>
                                </ul>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2"><Layers size={20} className="text-red-500" /> Types of Arduino Shields</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-blue-900 text-sm mb-1">1. Ethernet Shield</h5>
                                <p className="text-xs text-gray-600 mb-2">Internet aur network communication ke liye use hota hai.</p>
                                <p className="text-[11px] font-semibold text-blue-700"><span className="text-blue-500">Uses:</span> IoT networking, Web server projects</p>
                            </div>
                            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-orange-900 text-sm mb-1">2. Motor Shield</h5>
                                <p className="text-xs text-gray-600 mb-2">Motors ko control karne ke liye use hota hai.</p>
                                <p className="text-[11px] font-semibold text-orange-700"><span className="text-orange-500">Uses:</span> Robotics, Automation systems</p>
                            </div>
                            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-cyan-900 text-sm mb-1">3. WiFi Shield</h5>
                                <p className="text-xs text-gray-600 mb-2">Arduino ko wireless internet se connect karne ke liye use hota hai.</p>
                                <p className="text-[11px] font-semibold text-cyan-700"><span className="text-cyan-500">Uses:</span> Smart home systems, IoT communication</p>
                            </div>
                            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-indigo-900 text-sm mb-1">4. GSM Shield</h5>
                                <p className="text-xs text-gray-600 mb-2">Mobile network communication provide karta hai.</p>
                                <p className="text-[11px] font-semibold text-indigo-700"><span className="text-indigo-500">Uses:</span> SMS sending, Remote monitoring</p>
                            </div>
                            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <h5 className="font-bold text-purple-900 text-sm mb-1">5. Bluetooth Shield</h5>
                                <p className="text-xs text-gray-600 mb-2">Bluetooth communication ke liye use hota hai.</p>
                                <p className="text-[11px] font-semibold text-purple-700"><span className="text-purple-500">Uses:</span> Wireless control system, Mobile connectivity</p>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Arduino IDE Deep Dive ═══ */}
                    <Sec id="arduino-ide-deepdive" title="🔹 Introduction to Arduino IDE" icon={<Monitor size={16} className="text-purple-500" />}>
                        <p className="mb-4 text-sm text-gray-700">Arduino IDE (Integrated Development Environment) ek software platform hai jiska use Arduino board ko program karne ke liye kiya jata hai. Ye software user ko code likhne, compile karne aur Arduino board me upload karne ki facility provide karta hai. Arduino IDE ka interface simple aur user-friendly hota hai jiski wajah se beginners bhi easily programming kar sakte hain.</p>
                        
                        <h4 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2"><Menu size={20} className="text-purple-500" /> Main Components / Menus of Arduino IDE</h4>
                        
                        <div className="space-y-4">
                            {/* File Menu */}
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <h5 className="font-bold text-gray-900 mb-2">🔴 1. File Menu</h5>
                                <p className="text-sm text-gray-600 mb-3">File menu ka use files aur projects ko manage karne ke liye kiya jata hai. Is menu me new sketch create karna, old sketch open karna aur files save karna jaise options available hote hain.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">New (Ctrl + N)</p>
                                        <p className="text-xs text-gray-600">Naya sketch/program create karne ke liye use hota hai.</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">Open (Ctrl + O)</p>
                                        <p className="text-xs text-gray-600">Pehle se saved Arduino sketch ko open karne ke liye use hota hai.</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">Save (Ctrl + S)</p>
                                        <p className="text-xs text-gray-600">Current sketch ko save karne ke liye use hota hai.</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">Save As</p>
                                        <p className="text-xs text-gray-600">Existing file ko naye naam se save karne ke liye use hota hai.</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">Examples</p>
                                        <p className="text-xs text-gray-600">Arduino IDE me already available sample programs (Blink LED) ko open karne ke liye.</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">Preferences</p>
                                        <p className="text-xs text-gray-600">IDE settings change karne ke liye use hota hai (Theme, Font size).</p>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Menu */}
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <h5 className="font-bold text-gray-900 mb-2">🔴 2. Edit Menu</h5>
                                <p className="text-sm text-gray-600 mb-3">Edit menu ka use code editing ke liye hota hai. Is menu me text editing aur code formatting ke options available hote hain.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold">Undo (Ctrl + Z)</span>
                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold">Redo (Ctrl + Y)</span>
                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold">Cut (Ctrl + X)</span>
                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold">Copy (Ctrl + C)</span>
                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold">Paste (Ctrl + V)</span>
                                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold">Select All (Ctrl + A)</span>
                                </div>
                            </div>

                            {/* Sketch Menu */}
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <h5 className="font-bold text-gray-900 mb-2">🔴 3. Sketch Menu</h5>
                                <p className="text-sm text-gray-600 mb-3">Sketch menu program compiling aur library management ke liye use hota hai.</p>
                                <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc marker:text-purple-400">
                                    <li><strong>Verify / Compile (Ctrl + R):</strong> Program me errors check karta hai aur code ko compile karta hai.</li>
                                    <li><strong>Upload (Ctrl + U):</strong> Compiled code ko Arduino board me upload karta hai.</li>
                                    <li><strong>Include Library:</strong> External libraries ko add karne ke liye use hota hai. Libraries sensors aur modules ko easily use karne me help karti hain.</li>
                                </ul>
                            </div>

                            {/* Tools & Help Menu */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                    <h5 className="font-bold text-gray-900 mb-2">🔴 4. Tools Menu</h5>
                                    <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc marker:text-purple-400">
                                        <li><strong>Board:</strong> Arduino board select karne ke liye (e.g., Uno, Mega, Nano).</li>
                                        <li><strong>Port:</strong> COM port select karne ke liye jahan Arduino connected hota hai.</li>
                                        <li><strong>Programmer:</strong> Programming method select karne ke liye.</li>
                                        <li><strong>Serial Monitor (Ctrl + Shift + M):</strong> Arduino aur computer ke beech serial communication display karta hai.</li>
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                    <h5 className="font-bold text-gray-900 mb-2">🔴 5. Help Menu</h5>
                                    <ul className="text-sm text-gray-600 space-y-2 ml-4 list-disc marker:text-purple-400">
                                        <li>Documentation access</li>
                                        <li>Troubleshooting</li>
                                        <li>Reference material</li>
                                        <li>Software information</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <h5 className="font-bold text-gray-800 text-sm mb-1">Toolbar</h5>
                                <p className="text-xs text-gray-600">Quick-access buttons (Verify, Upload, New, Open, Save, Serial Monitor).</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <h5 className="font-bold text-gray-800 text-sm mb-1">Text Editor Area</h5>
                                <p className="text-xs text-gray-600">Main coding area jahan variables, functions, logic likhe jate hain.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <h5 className="font-bold text-gray-800 text-sm mb-1">Message & Console</h5>
                                <p className="text-xs text-gray-600">Errors, warnings, successful messages aur compilation process show karta hai.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <h5 className="font-bold text-gray-800 text-sm mb-1">Status Bar</h5>
                                <p className="text-xs text-gray-600">Selected board, COM port, aur IDE status show karta hai.</p>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Arduino Library ═══ */}
                    <Sec id="arduino-library" title="🔴 Arduino Library" icon={<BookOpen size={16} className="text-fuchsia-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <p>Arduino library ek pre-written code collection hoti hai jo programming ko easy banati hai. Library me already functions aur commands available hote hain jinki help se sensors, displays, motors aur modules ko easily control kiya ja sakta hai.</p>
                                <IB type="tip"><strong>Simple words me:</strong> "Library = ready-made code collection"</IB>
                                <p>Arduino libraries programmer ka time bachati hain aur complex coding ko simple bana deti hain.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_library.png" alt="Arduino Library" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                <h4 className="font-bold text-blue-900 text-sm mb-2">⚡ Working of Arduino Library</h4>
                                <p className="text-sm text-gray-700 mb-2">Jab kisi sensor ya module ko Arduino ke saath use karna hota hai to uske liye related library include ki jati hai. Library include karne ke baad:</p>
                                <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc marker:text-blue-400">
                                    <li>Ready-made functions available ho jate hain</li>
                                    <li>Hardware ko easily control kiya ja sakta hai</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                <h4 className="font-bold text-emerald-800 text-sm mb-2">✅ Advantages of Arduino Library</h4>
                                <ul className="text-sm text-emerald-700 space-y-1 ml-4 list-disc marker:text-emerald-400">
                                    <li>Coding easy ho jati hai</li>
                                    <li>Time saving hota hai</li>
                                    <li>Errors kam hote hain</li>
                                    <li>Complex devices ko easily use kiya ja sakta hai</li>
                                </ul>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3 text-lg">📌 Examples of Arduino Libraries</h4>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-fuchsia-50 text-fuchsia-900 border-b border-fuchsia-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Library</th>
                                        <th className="px-4 py-3 font-semibold">Use</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">Servo Library</td>
                                        <td className="px-4 py-3 text-gray-600">Servo motor control</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">LiquidCrystal</td>
                                        <td className="px-4 py-3 text-gray-600">LCD display control</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">WiFi Library</td>
                                        <td className="px-4 py-3 text-gray-600">WiFi communication</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">EEPROM Library</td>
                                        <td className="px-4 py-3 text-gray-600">EEPROM memory access</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-800 text-sm mb-2">🛠️ How to Include Library</h4>
                            <p className="text-sm text-gray-600 mb-2">Arduino IDE me library include karne ke liye:</p>
                            <code className="px-3 py-1.5 bg-white text-purple-700 rounded-lg text-sm font-semibold border border-gray-200 shadow-sm block w-max">Sketch → Include Library</code>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Input and Output Pin ═══ */}
                    <Sec id="arduino-pins" title="🔴 Making Input and Output Pin" icon={<ToggleLeft size={16} className="text-sky-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <p>Arduino me pins ko input ya output mode me configure kiya jata hai. Pin mode decide karta hai ki pin data receive karegi ya data send karegi.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_pins.png" alt="Arduino Pins" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-blue-200 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">Input</div>
                                <h4 className="font-bold text-blue-900 text-base mb-2">📥 Input Pin</h4>
                                <p className="text-sm text-gray-700 mb-3">Input pin external devices se data receive karti hai.</p>
                                <p className="text-xs font-semibold text-blue-800 mb-1">👉 Examples:</p>
                                <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc marker:text-blue-400 mb-3">
                                    <li>Sensor input</li>
                                    <li>Push button input</li>
                                </ul>
                                <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs font-bold text-blue-900 mb-1">⚡ Working:</p>
                                    <p className="text-xs text-gray-600">Input mode me Arduino voltage signal ko read karta hai aur HIGH ya LOW value detect karta hai.</p>
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">Output</div>
                                <h4 className="font-bold text-rose-900 text-base mb-2">📤 Output Pin</h4>
                                <p className="text-sm text-gray-700 mb-3">Output pin external devices ko signal bhejti hai.</p>
                                <p className="text-xs font-semibold text-rose-800 mb-1">👉 Examples:</p>
                                <ul className="text-sm text-rose-700 space-y-1 ml-4 list-disc marker:text-rose-400 mb-3">
                                    <li>LED control</li>
                                    <li>Motor control</li>
                                    <li>Buzzer control</li>
                                </ul>
                                <div className="bg-white/80 p-3 rounded-lg border border-rose-100">
                                    <p className="text-xs font-bold text-rose-900 mb-1">⚡ Working:</p>
                                    <p className="text-xs text-gray-600">Output mode me Arduino HIGH (5V) ya LOW (0V) signal provide karta hai.</p>
                                </div>
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3 text-lg">📌 pinMode() Function</h4>
                        <div className="space-y-4">
                            <p className="text-sm">Arduino me pins ko configure karne ke liye <code>pinMode()</code> function use hota hai.</p>
                            
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl shadow-inner font-mono text-sm overflow-x-auto">
                                <p className="text-gray-400 mb-1 text-xs">// Syntax</p>
                                <div><span className="text-orange-400">pinMode</span>(pin, mode);</div>
                                
                                <p className="text-gray-400 mt-4 mb-1 text-xs">// Examples</p>
                                <div><span className="text-orange-400">pinMode</span>(<span className="text-purple-400">13</span>, <span className="text-sky-400">OUTPUT</span>); <span className="text-gray-500">// Pin 13 ko output mode me set karta hai</span></div>
                                <div className="mt-2"><span className="text-orange-400">pinMode</span>(<span className="text-purple-400">2</span>, <span className="text-sky-400">INPUT</span>); <span className="text-gray-500">// Pin 2 ko input mode me set karta hai</span></div>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Select the Board ═══ */}
                    <Sec id="arduino-select-board" title="🔴 How to Select the Board" icon={<MousePointerClick size={16} className="text-amber-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <p>Arduino IDE me program upload karne se pehle correct Arduino board select karna bahut important hota hai. Agar wrong board select ho jaye to code upload nahi hoga ya errors aa sakte hain.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_select_board.png" alt="Select Arduino Board" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-800 text-sm mb-3">🛠️ Steps to Select Board</h4>
                                <ul className="text-sm text-gray-600 space-y-3">
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <span>Arduino IDE open kare</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <div>
                                            <span>Menu bar me:</span>
                                            <div className="mt-1"><code className="px-2 py-1 bg-gray-100 text-purple-700 rounded text-xs font-semibold border border-gray-200">Tools → Board</code> select kare</div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <div>
                                            <span>Required board choose kare</span>
                                            <p className="text-xs text-gray-500 mt-1">👉 Example: Arduino Uno, Arduino Mega, Arduino Nano</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                <h4 className="font-bold text-amber-900 text-sm mb-3">❓ Why Board Selection Important</h4>
                                <p className="text-sm text-gray-700 mb-2">Board selection se IDE ko pata chalta hai:</p>
                                <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc marker:text-amber-400">
                                    <li>Kaunsa microcontroller use ho raha hai</li>
                                    <li>Kitni memory available hai</li>
                                    <li>Kaunsi upload settings use hongi</li>
                                </ul>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Writing and Editing Codes ═══ */}
                    <Sec id="arduino-sketch-edit" title="🔴 Writing and Editing Codes in Sketch" icon={<FileCode2 size={16} className="text-emerald-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <Def>Arduino program ko “Sketch” kaha jata hai. Sketch ek source code file hoti hai jisme program instructions likhi jati hain.</Def>
                                <p>Arduino IDE me code text editor area me likha aur edit kiya jata hai.</p>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_sketch_edit.png" alt="Editing Arduino Sketch" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-emerald-300 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3"><FileCode2 size={16} /></div>
                                <h5 className="font-bold text-gray-800 text-sm mb-2">Writing Code</h5>
                                <p className="text-xs text-gray-600">User variables declare karta hai, functions likhta hai, aur logic create karta hai.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3"><Monitor size={16} /></div>
                                <h5 className="font-bold text-gray-800 text-sm mb-2">Editing Code</h5>
                                <p className="text-xs text-gray-600">Code ko modify karne ke liye Copy, Paste, Undo, aur Redo jaise editing options available hote hain.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-purple-300 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3"><Shield size={16} /></div>
                                <h5 className="font-bold text-gray-800 text-sm mb-2">Verify / Compile</h5>
                                <p className="text-xs text-gray-600">Code likhne ke baad <code>Verify</code> button press karke errors check kiye jate hain.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-orange-300 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3"><Zap size={16} /></div>
                                <h5 className="font-bold text-gray-800 text-sm mb-2">Uploading Code</h5>
                                <p className="text-xs text-gray-600">Compile successful hone ke baad <code>Upload</code> button se program Arduino board me upload kiya jata hai.</p>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: Sketch Structure ═══ */}
                    <Sec id="arduino-sketch-structure" title="🔴 Arduino Sketch Structure" icon={<Braces size={16} className="text-purple-500" />}>
                        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
                            <div className="flex-1 space-y-3">
                                <p>Arduino program mainly do important functions par based hota hai:</p>
                                <ol className="text-sm text-gray-800 font-semibold space-y-1 ml-5 list-decimal marker:text-purple-500">
                                    <li><code>setup()</code></li>
                                    <li><code>loop()</code></li>
                                </ol>
                                
                                <div className="bg-gray-900 text-gray-100 p-4 rounded-xl shadow-inner font-mono text-sm mt-3">
                                    <p className="text-gray-400 mb-1 text-xs">// Basic Structure of Arduino Sketch</p>
                                    <div><span className="text-orange-400">void</span> <span className="text-sky-400">setup</span>()</div>
                                    <div>{'{'}</div>
                                    <div className="ml-4 text-gray-500">// Initialization code</div>
                                    <div>{'}'}</div>
                                    <br/>
                                    <div><span className="text-orange-400">void</span> <span className="text-sky-400">loop</span>()</div>
                                    <div>{'{'}</div>
                                    <div className="ml-4 text-gray-500">// Main program code</div>
                                    <div>{'}'}</div>
                                </div>
                            </div>
                            <div className="w-full md:w-64 flex-shrink-0">
                                <img src="/iot/arduino_sketch_structure.png" alt="Arduino Sketch Structure" className="w-full h-auto rounded-2xl shadow-md border border-gray-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                                <h4 className="font-bold text-purple-900 text-base mb-2 font-mono">setup() Function</h4>
                                <p className="text-sm text-gray-700 mb-3">Ye function sirf ek baar execute hota hai jab Arduino start hota hai ya Reset hota hai.</p>
                                <p className="text-xs font-bold text-purple-800 mb-1">⚡ Uses:</p>
                                <ul className="text-sm text-purple-800 space-y-1 ml-4 list-disc marker:text-purple-400 mb-4">
                                    <li>Pin mode define karna</li>
                                    <li>Serial communication start karna</li>
                                    <li>Initial settings configure karna</li>
                                </ul>
                                <div className="bg-white/80 p-3 rounded-lg border border-purple-100 font-mono text-xs text-gray-800">
                                    <div className="text-gray-500 mb-1">// Example</div>
                                    <div><span className="text-purple-600">void</span> <span className="text-blue-600">setup</span>() {'{'}</div>
                                    <div className="ml-4"><span className="text-orange-600">pinMode</span>(<span className="text-blue-500">13</span>, OUTPUT);</div>
                                    <div>{'}'}</div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                                <h4 className="font-bold text-sky-900 text-base mb-2 font-mono">loop() Function</h4>
                                <p className="text-sm text-gray-700 mb-3">Ye function continuously repeat hota rehta hai jab tak Arduino ON rehta hai. Isme main logic aur repeated tasks likhe jate hain.</p>
                                <p className="text-xs font-bold text-sky-800 mb-1">⚡ Uses:</p>
                                <ul className="text-sm text-sky-800 space-y-1 ml-4 list-disc marker:text-sky-400 mb-4">
                                    <li>LED blinking</li>
                                    <li>Sensor reading</li>
                                    <li>Motor control</li>
                                </ul>
                                <div className="bg-white/80 p-3 rounded-lg border border-sky-100 font-mono text-xs text-gray-800">
                                    <div className="text-gray-500 mb-1">// Example</div>
                                    <div><span className="text-purple-600">void</span> <span className="text-blue-600">loop</span>() {'{'}</div>
                                    <div className="ml-4"><span className="text-orange-600">digitalWrite</span>(<span className="text-blue-500">13</span>, HIGH);</div>
                                    <div>{'}'}</div>
                                </div>
                            </div>
                        </div>
                    </Sec>

                    {/* ═══ SECTION: What is Function ═══ */}
                    <Sec id="what-is-function" title="🔴 What is Function" icon={<Cog size={16} className="text-red-500" />}>
                        <Def>🔧 <strong>Function</strong> ek block of code hota hai jo kisi specific task ko perform karne ke liye use kiya jata hai.</Def>
                        <p>Program me jab same task ko baar-baar perform karna ho to function ka use kiya jata hai. Isse code <strong>reusable</strong> aur <strong>easy</strong> ho jata hai.</p>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fca5a5' }}>
                            <p className="text-sm font-bold text-red-800">👉 &quot;Function = instructions ka group jo ek specific kaam karta hai&quot;</p>
                        </div>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">🔹 Features / Points of Function</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                            <div className="p-4 rounded-2xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                <h5 className="font-bold text-emerald-700 mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-black">1</span> Reusability</h5>
                                <p className="text-xs text-emerald-800">Ek function ko baar-baar call kiya ja sakta hai. Isse same code ko repeatedly likhne ki zarurat nahi padti.</p>
                            </div>
                            <div className="p-4 rounded-2xl" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                                <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-black">2</span> Modularity</h5>
                                <p className="text-xs text-blue-800">Function program ko small-small parts me divide karta hai. Isse program samajhna aur manage karna easy ho jata hai.</p>
                            </div>
                            <div className="p-4 rounded-2xl" style={{ background: '#fefce8', border: '1px solid #fde047' }}>
                                <h5 className="font-bold text-yellow-700 mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center font-black">3</span> Reduces Complexity</h5>
                                <p className="text-xs text-yellow-800">Large program ko simple aur organized banata hai. Program ki readability improve hoti hai.</p>
                            </div>
                            <div className="p-4 rounded-2xl" style={{ background: '#fdf2f8', border: '1px solid #f9a8d4' }}>
                                <h5 className="font-bold text-pink-700 mb-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-black">4</span> Easy Debugging</h5>
                                <p className="text-xs text-pink-800">Agar error aaye to specific function ko check karke error easily find kiya ja sakta hai.</p>
                            </div>
                        </div>
                        <IB type="tip">Functions ka use karke program ko <strong>clean, reusable aur easy to debug</strong> banaya ja sakta hai!</IB>
                    </Sec>

                    {/* ═══ SECTION: Embedded C Language ═══ */}
                    <Sec id="embedded-c" title="🔴 Embedded C Language" icon={<Cpu size={16} className="text-sky-500" />}>
                        <Def>💻 <strong>Embedded C</strong> ek programming language hai jo embedded systems aur microcontrollers ko program karne ke liye use hoti hai.</Def>
                        <p>Ye C language ka <strong>extended version</strong> hota hai jisme hardware control aur low-level programming features available hote hain.</p>

                        <h4 className="font-bold mt-4 mb-3 text-gray-800">👉 Embedded C ka use kahan hota hai?</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                            {[{ emoji: '🔵', t: 'Arduino' }, { emoji: '🖥️', t: 'Microcontroller' }, { emoji: '🤖', t: 'Robotics' }, { emoji: '🌐', t: 'IoT Systems' }].map((item, i) => (
                                <div key={i} className="p-3 rounded-xl text-center hover:scale-105 transition-transform" style={{ background: '#ecfeff', border: '1px solid #67e8f9' }}>
                                    <div className="text-2xl mb-1">{item.emoji}</div>
                                    <h5 className="font-bold text-xs text-sky-700">{item.t}</h5>
                                </div>
                            ))}
                        </div>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">🔹 Features of Embedded C</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                            {[
                                { emoji: '⚡', t: 'Fast Execution', d: 'Code bahut tezi se execute hota hai', c: '#ef4444' },
                                { emoji: '🔧', t: 'Hardware Control', d: 'Direct hardware ko control kar sakte hain', c: '#8b5cf6' },
                                { emoji: '💾', t: 'Low Memory Usage', d: 'Kam memory mein bhi chalta hai', c: '#10b981' },
                                { emoji: '⏱️', t: 'Real-time Support', d: 'Real-time programming possible hai', c: '#f97316' },
                                { emoji: '🔄', t: 'Portable Language', d: 'Different platforms par chal sakta hai', c: '#0ea5e9' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${item.c}08`, border: `1px solid ${item.c}25` }}>
                                    <span className="text-xl">{item.emoji}</span>
                                    <div>
                                        <h5 className="font-bold text-sm" style={{ color: item.c }}>{item.t}</h5>
                                        <p className="text-xs text-gray-500">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <IB type="note">Embedded C ka use karke hum <strong>microcontrollers aur IoT devices</strong> ko smart bana sakte hain!</IB>
                    </Sec>

                    {/* ═══ SECTION: Variables ═══ */}
                    <Sec id="variables" title="🔴 Variables" icon={<Tag size={16} className="text-amber-500" />}>
                        <Def>📦 <strong>Variable</strong> ek memory location hoti hai jiska use data store karne ke liye kiya jata hai.</Def>
                        <p>Program execution ke dauran variable ki value <strong>change ho sakti hai</strong>.</p>
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}>
                            <p className="text-sm font-bold text-amber-800">👉 &quot;Variable = data store karne ka naam&quot;</p>
                        </div>

                        <h4 className="font-bold mt-4 mb-3 text-gray-800">🔹 Example</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-xl shadow-inner font-mono text-sm">
                            <div><span className="text-orange-400">int</span> <span className="text-sky-400">a</span> = <span className="text-green-400">10</span>;</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="p-3 rounded-xl text-center" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                                <p className="text-xs text-blue-700"><code className="font-bold bg-blue-100 px-1.5 py-0.5 rounded">a</code> → Variable hai</p>
                            </div>
                            <div className="p-3 rounded-xl text-center" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                                <p className="text-xs text-green-700"><code className="font-bold bg-green-100 px-1.5 py-0.5 rounded">10</code> → Stored value hai</p>
                            </div>
                        </div>
                        <IB type="tip">Variable ko samjho jaise ek <strong>box</strong> hota hai jisme data rakhte hain — aur uska ek naam hota hai!</IB>
                    </Sec>

                    {/* ═══ SECTION: Rules for Variables ═══ */}
                    <Sec id="variable-rules" title="🔴 Rules for Variable Naming" icon={<Shield size={16} className="text-pink-500" />}>
                        <Def>📋 Variable declare karte waqt kuch important <strong>rules</strong> follow karne padte hain.</Def>

                        <div className="space-y-4 mt-4">
                            {/* Rule 1 */}
                            <div className="p-4 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                <h5 className="font-bold text-emerald-700 mb-2">🔸 1. Variable Name Alphabet ya Underscore se Start Hona Chahiye</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                                        <p className="text-[10px] font-bold text-emerald-600 mb-1">✅ Correct</p>
                                        <code className="text-xs text-gray-800 font-mono">temp, _value</code>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                                        <p className="text-[10px] font-bold text-red-600 mb-1">❌ Wrong</p>
                                        <code className="text-xs text-gray-800 font-mono">1temp</code>
                                    </div>
                                </div>
                            </div>

                            {/* Rule 2 */}
                            <div className="p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                                <h5 className="font-bold text-blue-700 mb-2">🔸 2. Space Allowed Nahi Hota</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2.5 rounded-lg border border-blue-200">
                                        <p className="text-[10px] font-bold text-emerald-600 mb-1">✅ Correct</p>
                                        <code className="text-xs text-gray-800 font-mono">totalMarks</code>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                                        <p className="text-[10px] font-bold text-red-600 mb-1">❌ Wrong</p>
                                        <code className="text-xs text-gray-800 font-mono">total marks</code>
                                    </div>
                                </div>
                            </div>

                            {/* Rule 3 */}
                            <div className="p-4 rounded-xl" style={{ background: '#fefce8', border: '1px solid #fde047' }}>
                                <h5 className="font-bold text-yellow-700 mb-2">🔸 3. Special Characters Allowed Nahi Hote</h5>
                                <p className="text-xs text-yellow-800">Special symbols jaise <code className="bg-yellow-100 px-1.5 py-0.5 rounded font-mono">@ # % &amp;</code> use nahi kar sakte.</p>
                            </div>

                            {/* Rule 4 */}
                            <div className="p-4 rounded-xl" style={{ background: '#fdf2f8', border: '1px solid #f9a8d4' }}>
                                <h5 className="font-bold text-pink-700 mb-2">🔸 4. Keywords Use Nahi Kar Sakte</h5>
                                <p className="text-xs text-pink-800 mb-2">C language ke reserved keywords variable names nahi ban sakte.</p>
                                <div className="flex flex-wrap gap-2">
                                    {['int', 'float', 'while', 'return', 'void'].map((k, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-white rounded-lg text-xs font-mono font-bold text-red-600 border border-red-200">{k}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Rule 5 */}
                            <div className="p-4 rounded-xl" style={{ background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
                                <h5 className="font-bold text-purple-700 mb-2">🔸 5. Variable Name Meaningful Hona Chahiye</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2.5 rounded-lg border border-purple-200">
                                        <p className="text-[10px] font-bold text-emerald-600 mb-1">✅ Correct</p>
                                        <code className="text-xs text-gray-800 font-mono">studentAge</code>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                                        <p className="text-[10px] font-bold text-red-600 mb-1">❌ Wrong</p>
                                        <code className="text-xs text-gray-800 font-mono">x</code>
                                    </div>
                                </div>
                            </div>

                            {/* Rule 6 */}
                            <div className="p-4 rounded-xl" style={{ background: '#ecfeff', border: '1px solid #67e8f9' }}>
                                <h5 className="font-bold text-cyan-700 mb-2">🔸 6. Variable Case Sensitive Hota Hai</h5>
                                <div className="flex items-center justify-center gap-4 my-2">
                                    <span className="px-4 py-2 bg-white rounded-lg text-sm font-mono font-bold text-cyan-700 border border-cyan-200">age</span>
                                    <span className="text-lg font-bold text-red-500">≠</span>
                                    <span className="px-4 py-2 bg-white rounded-lg text-sm font-mono font-bold text-cyan-700 border border-cyan-200">AGE</span>
                                </div>
                                <p className="text-xs text-cyan-800 text-center">Dono <strong>different variables</strong> hote hain.</p>
                            </div>

                            {/* Rule 7 */}
                            <div className="p-4 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fdba74' }}>
                                <h5 className="font-bold text-orange-700 mb-2">🔸 7. Numbers Use Kar Sakte Hain But Starting Me Nahi</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                                        <p className="text-[10px] font-bold text-emerald-600 mb-1">✅ Correct</p>
                                        <code className="text-xs text-gray-800 font-mono">mark1</code>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                                        <p className="text-[10px] font-bold text-red-600 mb-1">❌ Wrong</p>
                                        <code className="text-xs text-gray-800 font-mono">1mark</code>
                                    </div>
                                </div>
                            </div>

                            {/* Rule 8 */}
                            <div className="p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                                <h5 className="font-bold text-green-700 mb-2">🔸 8. Variable Length Limited Hoti Hai</h5>
                                <p className="text-xs text-green-800">Variable ka naam bahut jyada long nahi hona chahiye aur <strong>readable</strong> hona chahiye.</p>
                            </div>
                        </div>
                        <IB type="warning">In rules ko follow karna <strong>zaroori</strong> hai — warna program mein <strong>error</strong> aayega!</IB>
                    </Sec>

                    {/* ═══ SECTION: Data Types ═══ */}
                    <Sec id="data-types" title="🔴 Data Types" icon={<Layers size={16} className="text-purple-500" />}>
                        <Def>📊 <strong>Data type</strong> batata hai ki variable me kis type ka data store hoga.</Def>
                        <p>Different data types alag-alag <strong>memory size</strong> aur <strong>value range</strong> support karte hain.</p>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">🔹 Common Data Types in Embedded C</h4>
                        <div className="overflow-x-auto rounded-xl border border-purple-200 my-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} className="text-white">
                                        <th className="px-4 py-3 text-left text-xs font-bold">Data Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold">Use</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { type: 'int', use: 'Integer values' },
                                        { type: 'float', use: 'Decimal values' },
                                        { type: 'char', use: 'Single character' },
                                        { type: 'double', use: 'Large decimal values' },
                                        { type: 'void', use: 'No value' },
                                        { type: 'long', use: 'Large integer values' },
                                        { type: 'short', use: 'Small integer values' },
                                        { type: 'unsigned int', use: 'Positive integers only' },
                                    ].map((row, i) => (
                                        <tr key={i} className={`${i % 2 === 0 ? 'bg-purple-50/50' : 'bg-white'} border-b border-purple-100`}>
                                            <td className="px-4 py-2.5 font-mono font-bold text-purple-700 text-xs">{row.type}</td>
                                            <td className="px-4 py-2.5 text-gray-700 text-xs">{row.use}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">🔹 Data Types — Detail</h4>
                        <div className="space-y-4">
                            {/* int */}
                            <div className="p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #93c5fd' }}>
                                <h5 className="font-bold text-blue-700 mb-2">🔹 int — Integer</h5>
                                <p className="text-xs text-blue-800 mb-2">Integer numbers store karta hai.</p>
                                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs">
                                    <div><span className="text-orange-400">int</span> <span className="text-sky-400">age</span> = <span className="text-green-400">20</span>;</div>
                                </div>
                            </div>

                            {/* float */}
                            <div className="p-4 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                                <h5 className="font-bold text-emerald-700 mb-2">🔹 float — Decimal</h5>
                                <p className="text-xs text-emerald-800 mb-2">Decimal numbers store karta hai.</p>
                                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs">
                                    <div><span className="text-orange-400">float</span> <span className="text-sky-400">temp</span> = <span className="text-green-400">36.5</span>;</div>
                                </div>
                            </div>

                            {/* char */}
                            <div className="p-4 rounded-xl" style={{ background: '#fefce8', border: '1px solid #fde047' }}>
                                <h5 className="font-bold text-yellow-700 mb-2">🔹 char — Character</h5>
                                <p className="text-xs text-yellow-800 mb-2">Single character store karta hai.</p>
                                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs">
                                    <div><span className="text-orange-400">char</span> <span className="text-sky-400">grade</span> = <span className="text-green-400">&apos;A&apos;</span>;</div>
                                </div>
                            </div>

                            {/* double */}
                            <div className="p-4 rounded-xl" style={{ background: '#fdf2f8', border: '1px solid #f9a8d4' }}>
                                <h5 className="font-bold text-pink-700 mb-2">🔹 double — Large Decimal</h5>
                                <p className="text-xs text-pink-800">Large decimal precision values store karta hai. Float se zyada accurate hota hai.</p>
                            </div>

                            {/* void */}
                            <div className="p-4 rounded-xl" style={{ background: '#f5f3ff', border: '1px solid #c4b5fd' }}>
                                <h5 className="font-bold text-purple-700 mb-2">🔹 void — No Value</h5>
                                <p className="text-xs text-purple-800">Jab koi value return nahi hoti tab use hota hai. Jaise <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono">void setup()</code></p>
                            </div>
                        </div>
                        <IB type="tip">Sahi data type select karna <strong>memory optimize</strong> karta hai aur program ko <strong>efficient</strong> banata hai!</IB>
                    </Sec>

                    {/* ═══ SECTION: Operators in Embedded C ═══ */}
                    <Sec id="operators" title="🔴 Operators in Embedded C" icon={<Activity size={16} className="text-rose-500" />}>
                        <Def>➕ <strong>Operators</strong> special symbols hote hain jo variables aur values par operations perform karne ke liye use kiye jate hain.</Def>
                        
                        <div className="rounded-2xl p-4 my-4" style={{ background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '1px solid #fecdd3' }}>
                            <p className="text-sm font-bold text-rose-800">👉 &quot;Operators = calculations aur logical operations karne wale symbols&quot;</p>
                        </div>
                        
                        <p className="mb-4 text-sm text-gray-700">Embedded C language me operators ka use Calculation, Comparison, Decision making, aur Logical checking ke liye kiya jata hai.</p>

                        <h4 className="font-bold mt-5 mb-3 text-gray-800">🔹 Types of Operators</h4>
                        
                        {/* 1. Arithmetic Operators */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-sky-100 shadow-sm">
                            <h5 className="font-bold text-sky-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-sky-100 text-sky-600 rounded-lg"><Activity size={16} /></div>
                                1. Arithmetic Operators
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Arithmetic operators mathematical calculations (add, subtract, etc.) perform karne ke liye use hote hain.</p>
                            
                            <div className="overflow-x-auto rounded-xl border border-sky-200 mb-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }} className="text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold w-1/3">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold">Work</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { op: '+', work: 'Addition' },
                                            { op: '-', work: 'Subtraction' },
                                            { op: '*', work: 'Multiplication' },
                                            { op: '/', work: 'Division' },
                                            { op: '%', work: 'Modulus (Remainder)' },
                                        ].map((r, i) => (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-sky-50/50' : 'bg-white'} border-b border-sky-100`}>
                                                <td className="px-4 py-2.5 font-mono font-bold text-sky-700 text-sm">{r.op}</td>
                                                <td className="px-4 py-2.5 text-gray-700 text-xs">{r.work}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Calculating average sensor value</div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">sensor1</span> <span className="text-pink-400">=</span> <span className="text-green-400">400</span><span className="text-gray-300">;</span></div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">sensor2</span> <span className="text-pink-400">=</span> <span className="text-green-400">600</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2"><span className="text-orange-400">int</span> <span className="text-sky-300">average</span> <span className="text-pink-400">=</span> <span className="text-gray-300">(</span><span className="text-sky-300">sensor1</span> <span className="text-pink-400">+</span> <span className="text-sky-300">sensor2</span><span className="text-gray-300">)</span> <span className="text-pink-400">/</span> <span className="text-green-400">2</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2 text-gray-400">// Output average: 500</div>
                            </div>
                        </div>

                        {/* 2. Relational Operators */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-purple-100 shadow-sm">
                            <h5 className="font-bold text-purple-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Activity size={16} /></div>
                                2. Relational Operators
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Ye operators do values ko compare karte hain (jaise temperature limit check karna). Ye TRUE (1) ya FALSE (0) result dete hain.</p>
                            
                            <div className="overflow-x-auto rounded-xl border border-purple-200 mb-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} className="text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold w-1/3">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold">Meaning</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { op: '==', desc: 'Equal to' },
                                            { op: '!=', desc: 'Not equal to' },
                                            { op: '>', desc: 'Greater than' },
                                            { op: '<', desc: 'Less than' },
                                            { op: '>=', desc: 'Greater than equal to' },
                                            { op: '<=', desc: 'Less than equal to' },
                                        ].map((r, i) => (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-purple-50/50' : 'bg-white'} border-b border-purple-100`}>
                                                <td className="px-4 py-2.5 font-mono font-bold text-purple-700 text-sm">{r.op}</td>
                                                <td className="px-4 py-2.5 text-gray-700 text-xs">{r.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Checking fire alarm condition</div>
                                <div><span className="text-orange-400">float</span> <span className="text-sky-300">temperature</span> <span className="text-pink-400">=</span> <span className="text-green-400">45.5</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2"><span className="text-blue-400">if</span> <span className="text-gray-300">(</span><span className="text-sky-300">temperature</span> <span className="text-pink-400">&gt;=</span> <span className="text-green-400">40.0</span><span className="text-gray-300">) {'{'}</span></div>
                                <div className="ml-4 text-gray-400">// Condition TRUE hui, Fire Alarm bajao!</div>
                                <div><span className="text-gray-300">{'}'}</span></div>
                            </div>
                        </div>

                        {/* 3. Logical Operators */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-emerald-100 shadow-sm">
                            <h5 className="font-bold text-emerald-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Activity size={16} /></div>
                                3. Logical Operators
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Jab ek se zyada conditions ko combine karna ho (e.g. agar raat hai AUR motion detect hua hai, tabhi light on karo).</p>
                            
                            <div className="overflow-x-auto rounded-xl border border-emerald-200 mb-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} className="text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold w-1/3">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold">Meaning</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { op: '&&', desc: 'Logical AND (Dono true honge tabhi TRUE)' },
                                            { op: '||', desc: 'Logical OR (Koi ek bhi true to TRUE)' },
                                            { op: '!', desc: 'Logical NOT (Condition ka opposite karta hai)' },
                                        ].map((r, i) => (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-emerald-50/50' : 'bg-white'} border-b border-emerald-100`}>
                                                <td className="px-4 py-2.5 font-mono font-bold text-emerald-700 text-sm">{r.op}</td>
                                                <td className="px-4 py-2.5 text-gray-700 text-xs">{r.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Smart street light logic</div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">isNight</span> <span className="text-pink-400">=</span> <span className="text-green-400">1</span><span className="text-gray-300">;</span> <span className="text-gray-400">// 1 means True</span></div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">motionDetected</span> <span className="text-pink-400">=</span> <span className="text-green-400">1</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2"><span className="text-blue-400">if</span> <span className="text-gray-300">(</span><span className="text-sky-300">isNight</span> <span className="text-pink-400">==</span> <span className="text-green-400">1</span> <span className="text-pink-400">&amp;&amp;</span> <span className="text-sky-300">motionDetected</span> <span className="text-pink-400">==</span> <span className="text-green-400">1</span><span className="text-gray-300">) {'{'}</span></div>
                                <div className="ml-4 text-gray-400">// Raat bhi hai AUR motion bhi hua, light ON karo!</div>
                                <div><span className="text-gray-300">{'}'}</span></div>
                            </div>
                        </div>

                        {/* 4. Assignment Operators */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-amber-100 shadow-sm">
                            <h5 className="font-bold text-amber-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Activity size={16} /></div>
                                4. Assignment Operators
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Ye variables me direct value store karne ke liye use hote hain. Short calculations ke liye <code className="bg-amber-50 px-1 font-mono text-amber-600">+=</code> aur <code className="bg-amber-50 px-1 font-mono text-amber-600">-=</code> zyada use hote hain.</p>
                            
                            <div className="overflow-x-auto rounded-xl border border-amber-200 mb-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} className="text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold w-1/3">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold">Meaning</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { op: '=', desc: 'Assign value (e.g. x = 5)' },
                                            { op: '+=', desc: 'Add & assign (x += 5 means x = x + 5)' },
                                            { op: '-=', desc: 'Subtract & assign (x -= 5 means x = x - 5)' },
                                            { op: '*=', desc: 'Multiply & assign' },
                                            { op: '/=', desc: 'Divide & assign' },
                                        ].map((r, i) => (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-amber-50/50' : 'bg-white'} border-b border-amber-100`}>
                                                <td className="px-4 py-2.5 font-mono font-bold text-amber-700 text-sm">{r.op}</td>
                                                <td className="px-4 py-2.5 text-gray-700 text-xs">{r.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Counting total distance travelled by a robot</div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">totalDistance</span> <span className="text-pink-400">=</span> <span className="text-green-400">100</span><span className="text-gray-300">;</span> <span className="text-gray-400">// Pehle 100cm chala tha</span></div>
                                <div className="mt-2"><span className="text-sky-300">totalDistance</span> <span className="text-pink-400">+=</span> <span className="text-green-400">50</span><span className="text-gray-300">;</span></div>
                                <div className="text-gray-400">// Ab totalDistance 150cm ho jayega (100 + 50)</div>
                            </div>
                        </div>

                        {/* 5. Increment and Decrement Operators */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-rose-100 shadow-sm">
                            <h5 className="font-bold text-rose-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><Activity size={16} /></div>
                                5. Increment and Decrement
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Kisi sensor ke counter ko 1 step aage (Increase) ya 1 step piche (Decrease) karne ke liye inka use hota hai.</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-black text-rose-600 font-mono">++</div>
                                    <div className="font-bold text-rose-800 text-sm mt-1">Increment (+1)</div>
                                </div>
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-black text-rose-600 font-mono">--</div>
                                    <div className="font-bold text-rose-800 text-sm mt-1">Decrement (-1)</div>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Visitor counter in smart room</div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">visitors</span> <span className="text-pink-400">=</span> <span className="text-green-400">5</span><span className="text-gray-300">;</span> <span className="text-gray-400">// Room me 5 log the</span></div>
                                <div className="mt-2 text-gray-400">// Ek aur person room me aaya:</div>
                                <div><span className="text-sky-300">visitors</span><span className="text-pink-400">++</span><span className="text-gray-300">;</span> <span className="text-gray-400">// Result: Ab visitors 6 ho gaye</span></div>
                            </div>
                        </div>

                        {/* 6. Bitwise Operators */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-indigo-100 shadow-sm">
                            <h5 className="font-bold text-indigo-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><Activity size={16} /></div>
                                6. Bitwise Operators
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Ye Arduino ke pin level (0 aur 1) par kaam karne ke liye (hardware registers control karne ke liye) sabse important hote hain.</p>
                            
                            <div className="overflow-x-auto rounded-xl border border-indigo-200 mb-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }} className="text-white">
                                            <th className="px-4 py-3 text-left text-xs font-bold w-1/3">Operator</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold">Meaning</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { op: '&', desc: 'Bitwise AND' },
                                            { op: '|', desc: 'Bitwise OR' },
                                            { op: '^', desc: 'Bitwise XOR' },
                                            { op: '~', desc: 'Bitwise NOT' },
                                            { op: '<<', desc: 'Left Shift (Bits ko left khiskata hai)' },
                                            { op: '>>', desc: 'Right Shift (Bits ko right khiskata hai)' },
                                        ].map((r, i) => (
                                            <tr key={i} className={`${i % 2 === 0 ? 'bg-indigo-50/50' : 'bg-white'} border-b border-indigo-100`}>
                                                <td className="px-4 py-2.5 font-mono font-bold text-indigo-700 text-sm">{r.op}</td>
                                                <td className="px-4 py-2.5 text-gray-700 text-xs">{r.desc}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Setting a specific bit to 1 (Bitwise OR)</div>
                                <div><span className="text-orange-400">byte</span> <span className="text-sky-300">PORTB_Value</span> <span className="text-pink-400">=</span> <span className="text-green-400">0b00000000</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2 text-gray-400">// Turn ON 3rd bit (index 2):</div>
                                <div><span className="text-sky-300">PORTB_Value</span> <span className="text-pink-400">=</span> <span className="text-sky-300">PORTB_Value</span> <span className="text-pink-400">|</span> <span className="text-green-400">0b00000100</span><span className="text-gray-300">;</span></div>
                                <div className="text-gray-400">// Ab PORTB_Value ho gaya: 0b00000100</div>
                            </div>
                        </div>

                        {/* 7. Conditional Operator */}
                        <div className="p-5 rounded-2xl mb-4 bg-white border border-teal-100 shadow-sm">
                            <h5 className="font-bold text-teal-800 text-lg mb-2 flex items-center gap-2">
                                <div className="p-1.5 bg-teal-100 text-teal-600 rounded-lg"><Activity size={16} /></div>
                                7. Conditional (Ternary) Operator
                            </h5>
                            <p className="text-sm text-gray-600 mb-3">Ye if-else statement ka short form hota hai. Isse ek hi line me decision ho jata hai.</p>
                            
                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto mb-3">
                                <div className="text-gray-400 mb-1">// Syntax:</div>
                                <div><span className="text-gray-300">(</span><span className="text-sky-300">condition</span><span className="text-gray-300">)</span> <span className="text-pink-400">?</span> <span className="text-green-300">value_if_true</span> <span className="text-pink-400">:</span> <span className="text-rose-300">value_if_false</span><span className="text-gray-300">;</span></div>
                            </div>
                            
                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Check water level</div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">waterLevel</span> <span className="text-pink-400">=</span> <span className="text-green-400">80</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2"><span className="text-orange-400">int</span> <span className="text-sky-300">pumpStatus</span> <span className="text-pink-400">=</span> <span className="text-gray-300">(</span><span className="text-sky-300">waterLevel</span> <span className="text-pink-400">&lt;</span> <span className="text-green-400">20</span><span className="text-gray-300">)</span> <span className="text-pink-400">?</span> <span className="text-green-400">1</span> <span className="text-pink-400">:</span> <span className="text-green-400">0</span><span className="text-gray-300">;</span></div>
                                <div className="mt-1 text-gray-400">// Agar water level 20 se kam hai to pump ON (1) hoga, warna OFF (0) hoga.</div>
                                <div className="text-gray-400">// Yahan waterLevel 80 hai, isliye pumpStatus 0 ho jayega.</div>
                            </div>
                        </div>

                        {/* Operator Precedence */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                            <h5 className="font-bold text-gray-800 text-lg mb-2">🔴 Operator Precedence</h5>
                            <p className="text-sm text-gray-600 mb-3">Jab ek expression me bahut saare operators use hote hain to execution kis order me hoga, usko operator precedence kehte hain.</p>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3 text-sm text-gray-700 font-semibold shadow-sm text-center">
                                BODMAS rule jaisa: Multiply / Divide pehle, Addition / Subtraction baad me.
                            </div>

                            <div className="bg-gray-900 p-4 rounded-xl font-mono text-xs shadow-inner overflow-x-auto">
                                <div className="text-gray-400 mb-2">// Example: Sensor Calibration formula</div>
                                <div><span className="text-orange-400">int</span> <span className="text-sky-300">result</span> <span className="text-pink-400">=</span> <span className="text-green-400">10</span> <span className="text-pink-400">+</span> <span className="text-green-400">5</span> <span className="text-pink-400">*</span> <span className="text-green-400">2</span><span className="text-gray-300">;</span></div>
                                <div className="mt-2 text-gray-400">// Execute kaise hoga?</div>
                                <div className="text-gray-400">// Step 1: 5 * 2 = 10 (Multiplication ki priority zyada hoti hai)</div>
                                <div className="text-gray-400">// Step 2: 10 + 10 = 20</div>
                                <div className="mt-2"><span className="text-gray-400">// Result: </span><span className="text-green-400">20</span></div>
                            </div>
                        </div>
                    </Sec>
                </main>
            </div>
        </div>
    );
}
