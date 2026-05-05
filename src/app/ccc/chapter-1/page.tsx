'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen, ChevronRight, Hash, Sparkles, Monitor, Menu, X, CheckCircle, Cpu, HardDrive } from 'lucide-react';

const chapterImages = [
    { id: 1, src: '/ccc/chapter-1/IMG-20260502-WA0002.jpg' },
    { id: 2, src: '/ccc/chapter-1/IMG-20260502-WA0006.jpg' },
    { id: 3, src: '/ccc/chapter-1/file_00000000046c720899e904e12a50d5a3.png' },
    { id: 4, src: '/ccc/chapter-1/file_00000000060871fa890f8d94e2cb0bfc.png' },
    { id: 5, src: '/ccc/chapter-1/file_000000000b3871faac4db3d4bbe63f3d.png' },
    { id: 6, src: '/ccc/chapter-1/file_0000000012cc72079e98c25deb153a1f.png' },
    { id: 7, src: '/ccc/chapter-1/file_00000000172871fa91fbb458816830fa.png' },
    { id: 8, src: '/ccc/chapter-1/file_0000000017d871fabd74943ce75f2867.png' },
    { id: 9, src: '/ccc/chapter-1/file_00000000280c7207af1707b7b47eaaf8.png' },
    { id: 10, src: '/ccc/chapter-1/file_000000002e8c72078d71733cc426a80a.png' },
    { id: 11, src: '/ccc/chapter-1/file_000000003780720797e7c184af728e5d.png' },
    { id: 12, src: '/ccc/chapter-1/file_00000000381871faa407ea0e81372429.png' },
    { id: 13, src: '/ccc/chapter-1/file_000000003c887207960f74cdcfcbbf84.png' },
    { id: 14, src: '/ccc/chapter-1/file_0000000040dc7207ba38bad765d8241d.png' },
    { id: 15, src: '/ccc/chapter-1/file_00000000570871faa35307cf389fdee3.png' },
    { id: 16, src: '/ccc/chapter-1/file_0000000068b47207b792d94a741716a0.png' },
    { id: 17, src: '/ccc/chapter-1/file_00000000714c71faab24f5bd7a41a12c.png' },
    { id: 18, src: '/ccc/chapter-1/file_0000000079e471fabbc29b0d9ac25612.png' },
    { id: 19, src: '/ccc/chapter-1/file_000000007b2471fa9cb32e3a1121628f.png' },
    { id: 20, src: '/ccc/chapter-1/file_000000007db07207afd5e00499ca90d9.png' },
    { id: 21, src: '/ccc/chapter-1/file_00000000822471fa9fc62f610bd4c9a3.png' },
    { id: 22, src: '/ccc/chapter-1/file_0000000082447207adf6b4d3e270d63e.png' },
    { id: 23, src: '/ccc/chapter-1/file_00000000871c71fa827727891870d475.png' },
    { id: 24, src: '/ccc/chapter-1/file_000000008ee871fa9d26044fba3eb91f.png' },
    { id: 25, src: '/ccc/chapter-1/file_00000000908c7207aefc7346f44573e9.png' },
    { id: 26, src: '/ccc/chapter-1/file_00000000a6287207b4edc49944ac7d0e.png' },
    { id: 27, src: '/ccc/chapter-1/file_00000000a80071fa957db6ed9995e3bb.png' },
    { id: 28, src: '/ccc/chapter-1/file_00000000af3071fabbb9467ac0fa4814.png' },
    { id: 29, src: '/ccc/chapter-1/file_00000000bc74720780c03d549fde0e0d.png' },
    { id: 30, src: '/ccc/chapter-1/file_00000000c20c71fa9ec4ddff6601ffe7.png' },
    { id: 31, src: '/ccc/chapter-1/file_00000000d7dc71fab9b623eb48d2ab75.png' },
    { id: 32, src: '/ccc/chapter-1/file_00000000f00872078b2902d42ce20cda.png' }
];

export default function CccChapter1() {
    const [tocOpen, setTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('intro');

    const tocItems = [
        { id: 'intro', label: 'Introduction', icon: <BookOpen size={14} />, color: '#06b6d4' },
        { id: 'characteristics', label: 'Characteristics', icon: <Sparkles size={14} />, color: '#8b5cf6' },
        { id: 'types', label: 'Types of Computer', icon: <Monitor size={14} />, color: '#10b981' },
        { id: 'cpu', label: 'CPU & Components', icon: <Cpu size={14} />, color: '#f97316' },
        { id: 'devices', label: 'Input/Output Devices', icon: <HardDrive size={14} />, color: '#ef4444' }
    ];

    return (
        <div className="min-h-screen bg-white relative">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-white to-blue-50/30" />
            </div>

            <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/ccc" className="flex items-center justify-center w-9 h-9 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-sm font-extrabold text-gray-800">Introduction to Computer</h1>
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={8} className="text-cyan-500" />
                                <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-cyan-500">CCC Chapter 1</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setTocOpen(!tocOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 border border-gray-200">
                        {tocOpen ? <X size={18} className="text-cyan-500" /> : <Menu size={18} className="text-cyan-500" />}
                    </button>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #f97316, #06b6d4)' }} />
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                <aside className={`\${tocOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[52px] left-0 z-40 lg:z-10 w-64 lg:w-56 xl:w-64 h-[calc(100vh-52px)] overflow-y-auto transition-transform duration-300 lg:flex-shrink-0 bg-white/95 backdrop-blur-xl`} style={{ borderRight: '1px solid #e2e8f0' }}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                                <Hash size={12} className="text-white" />
                            </div>
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
                    <section className="relative rounded-3xl overflow-hidden mb-8" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 30%, #0ea5e9 60%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(6,182,212,0.25)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} />
                        </div>
                        <div className="relative z-10 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                                <Sparkles size={10} /> Complete Course
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white" style={{ lineHeight: '1.2' }}>Introduction to Computer</h2>
                            <p className="text-sm md:text-base max-w-2xl mb-5 text-white/85">Learn the fundamentals of computers, their characteristics, types, components like CPU, and various Input/Output devices with easy-to-understand visual slides.</p>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <BookOpen size={14} /><span>32 Slides</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <CheckCircle size={14} /><span>Beginner Friendly</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="space-y-12">
                        <section id="intro" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Introduction & Syllabus</h2>
                                    <p className="text-xs text-gray-500">What is a computer and course overview</p>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {chapterImages.slice(0, 2).map((img, i) => (
                                    <div key={img.id} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-50">
                                            <Image src={img.src} alt={`Slide ${img.id}`} fill className="object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                                <p className="text-sm text-cyan-800 leading-relaxed">
                                    <strong>Computer Definition:</strong> Ek computer ek electronic machine hai, jo user dwara diye gaye instructions (input) ko process karke meaningful result (output) produce karti hai. Word <strong>"Computer"</strong> latin bhasha ke word <strong>"Comput"</strong> se bana hai, jiska matlab hai <strong>"To Calculate"</strong> (ganana karna).
                                </p>
                            </div>
                        </section>

                        <section id="characteristics" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Characteristics of Computer</h2>
                                    <p className="text-xs text-gray-500">Speed, Accuracy, Storage, Versatility, and more</p>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {chapterImages.slice(2, 14).map((img, i) => (
                                    <div key={img.id} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-50">
                                            <Image src={img.src} alt={`Slide ${img.id}`} fill className="object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                                <p className="text-sm text-purple-800 leading-relaxed">
                                    <strong>Key Characteristics:</strong> Computer apne fast operations, large storage capacity, 100% accuracy, aur versatility ke liye jaana jata hai. Iske alawa, ye thakta nahi hai (diligence), fully automated kaam kar sakta hai, aur bina feeling/mind ke solely instructions par nirbhar hota hai.
                                </p>
                            </div>
                        </section>

                        <section id="types" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Monitor size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Types of Computer</h2>
                                    <p className="text-xs text-gray-500">Based on working principle and size</p>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {chapterImages.slice(14, 25).map((img, i) => (
                                    <div key={img.id} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-50">
                                            <Image src={img.src} alt={`Slide ${img.id}`} fill className="object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                <p className="text-sm text-emerald-800 leading-relaxed">
                                    <strong>Types of Computer:</strong> 
                                    <br/>1. <strong>Working Basis:</strong> Analog (Temperature, Speed mapna), Digital (0 & 1 par kaam), aur Hybrid (Analog + Digital).
                                    <br/>2. <strong>Size Basis:</strong> Micro Computer (Desktop, Laptop, Mobile), Mini Computer (Servers), Mainframe Computer (Bade business me), aur Super Computer (Weather forecasting, Scientific research).
                                </p>
                            </div>
                        </section>

                        <section id="cpu" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                    <Cpu size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">CPU & Its Components</h2>
                                    <p className="text-xs text-gray-500">Central Processing Unit and working parts</p>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {chapterImages.slice(25, 29).map((img, i) => (
                                    <div key={img.id} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-50">
                                            <Image src={img.src} alt={`Slide ${img.id}`} fill className="object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                <p className="text-sm text-orange-800 leading-relaxed">
                                    <strong>CPU (Central Processing Unit):</strong> CPU computer ka 'brain' hota hai jo sari processing karta hai. Iske 3 main components hote hain:
                                    <br/>- <strong>ALU (Arithmetic Logic Unit):</strong> Math operations (add, subtract) aur logical decisions (AND, OR, <, >) ke liye.
                                    <br/>- <strong>CU (Control Unit):</strong> Computer ke saare operations ko control karna.
                                    <br/>- <strong>MU (Memory Unit):</strong> Processing ke dauran data ko temporarily store karna.
                                </p>
                            </div>
                        </section>

                        <section id="devices" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                    <HardDrive size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Input & Output Devices</h2>
                                    <p className="text-xs text-gray-500">Keyboard, Mouse, Monitor, Printers</p>
                                </div>
                            </div>
                            <div className="grid gap-6">
                                {chapterImages.slice(29, 32).map((img, i) => (
                                    <div key={img.id} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2">
                                        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-50">
                                            <Image src={img.src} alt={`Slide ${img.id}`} fill className="object-contain" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
                                <p className="text-sm text-red-800 leading-relaxed">
                                    <strong>Hardware Components:</strong> Data enter karne ke liye <strong>Input Devices</strong> (Keyboard, Mouse, Scanner) ka use hota hai. Processed information ko show/print karne ke liye <strong>Output Devices</strong> (Monitor, Printer, Speaker) ka use hota hai.
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
