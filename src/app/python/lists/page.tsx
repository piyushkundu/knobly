'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, BookOpen, Copy, Check, LayoutDashboard, StickyNote, Code2, Brain, Keyboard as KBIcon, Sparkles, Zap, Hash, Menu, X, ChevronRight, List, ListOrdered, Scissors, Eye, Repeat, PlusCircle, MinusCircle, ArrowUpDown } from 'lucide-react';
import ListsMCQ from '@/components/content/ListsMCQ';

function CB({ code, lang = 'python' }: { code: string; lang?: string }) {
    const [c, setC] = useState(false);
    const copy = () => { navigator.clipboard.writeText(code); setC(true); setTimeout(() => setC(false), 2000); };
    return (
        <div className="relative rounded-2xl overflow-hidden my-3" style={{ background: '#1e293b', boxShadow: '0 4px 16px rgba(15,23,42,0.12)', border: '1px solid #334155' }}>
            <div className="flex items-center justify-between px-4 py-1.5" style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                <div className="flex items-center gap-2"><div className="flex gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" /><span className="w-2.5 h-2.5 rounded-full bg-green-400/60" /></div><span className="text-[9px] uppercase tracking-[0.18em] font-bold text-slate-500">{lang}</span></div>
                <button onClick={copy} className="text-xs flex items-center gap-1 transition-colors" style={{ color: c ? '#34d399' : '#64748b' }}>{c ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}</button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-slate-200"><code>{code}</code></pre>
        </div>
    );
}

function Sec({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
    return (
        <section id={id} className="rounded-2xl p-5 md:p-7 mb-5 scroll-mt-20 transition-all duration-300 hover:shadow-lg" style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)' }}>
            <div className="flex items-center gap-2.5 mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>{icon}<h2 className="text-base md:text-lg font-extrabold" style={{ color: '#1e293b' }}>{title}</h2></div>
            <div className="text-sm leading-relaxed space-y-3" style={{ color: '#475569' }}>{children}</div>
        </section>
    );
}

function IB({ type = 'tip', children }: { type?: 'tip' | 'note' | 'warning'; children: ReactNode }) {
    const s = { tip: { bg: '#ecfdf5', bc: '#86efac', tc: '#166534', e: '💡' }, note: { bg: '#eff6ff', bc: '#93c5fd', tc: '#1e40af', e: '📝' }, warning: { bg: '#fefce8', bc: '#fde047', tc: '#854d0e', e: '⚠️' } }; const st = s[type];
    return <div className="rounded-xl p-3.5 text-xs font-medium my-3" style={{ background: st.bg, border: `1px solid ${st.bc}`, color: st.tc }}>{st.e} {children}</div>;
}

function Def({ children }: { children: ReactNode }) {
    return <div className="rounded-xl p-4 my-3 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe', color: '#3730a3' }}>{children}</div>;
}

function MethodCard({ name, desc, children, color }: { name: string; desc: string; children: ReactNode; color: string }) {
    return (
        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: `1px solid ${color}30`, background: `${color}05` }}>
            <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${color}20` }}>
                <code className="text-sm font-extrabold font-mono" style={{ color }}>{name}</code>
                <span className="text-xs" style={{ color: '#94a3b8' }}>— {desc}</span>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

const tocItems = [
    { icon: <BookOpen size={13} />, label: 'Introduction', id: 'intro', color: '#6366f1' },
    { icon: <List size={13} />, label: 'Types', id: 'types', color: '#8b5cf6' },
    { icon: <PlusCircle size={13} />, label: 'Creating', id: 'creating', color: '#3b82f6' },
    { icon: <Eye size={13} />, label: 'Accessing', id: 'accessing', color: '#06b6d4' },
    { icon: <Scissors size={13} />, label: 'Slicing', id: 'slicing', color: '#0d9488' },
    { icon: <Repeat size={13} />, label: 'Traversing', id: 'traversing', color: '#10b981' },
    { icon: <Zap size={13} />, label: 'Operations', id: 'operations', color: '#f97316' },
    { icon: <Code2 size={13} />, label: 'Methods', id: 'methods', color: '#e11d48' },
    { icon: <Brain size={13} />, label: 'MCQ Quiz', id: 'mcq', color: '#6366f1' },
    { icon: <ListOrdered size={13} />, label: 'Practice', id: 'practice', color: '#8b5cf6' },
];

const navLinks = [
    { label: 'Home', href: '/', icon: <Home size={14} /> },
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={14} /> },
    { label: 'Notes', href: '/notes', icon: <StickyNote size={14} /> },
    { label: 'Python', href: '/python', icon: <Code2 size={14} /> },
    { label: 'MCQ', href: '/mcq', icon: <Brain size={14} /> },
    { label: 'Shortcuts', href: '/shortcuts', icon: <KBIcon size={14} /> },
];

export default function ListsPage() {
    const [tocOpen, setTocOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('intro');

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 100%)' }}>
            {/* ═══ NAVBAR ═══ */}
            <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/python" className="flex items-center justify-center w-9 h-9 rounded-xl hover:scale-105 transition-all" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}><ArrowLeft size={16} className="text-white" /></Link>
                        <div><h1 className="text-sm font-extrabold" style={{ color: '#1e293b' }}>Python Lists</h1><div className="flex items-center gap-1.5"><Sparkles size={8} style={{ color: '#6366f1' }} /><span className="text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: '#6366f1' }}>Chapter 3 • Python</span></div></div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {navLinks.map(l => (<Link key={l.href} href={l.href} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:scale-105" style={{ color: '#64748b' }} onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#6366f1'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>{l.icon}<span>{l.label}</span></Link>))}
                        <button onClick={() => setTocOpen(!tocOpen)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>{tocOpen ? <X size={18} style={{ color: '#6366f1' }} /> : <Menu size={18} style={{ color: '#6366f1' }} />}</button>
                    </div>
                </div>
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #f97316, #6366f1)' }} />
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                {/* ── SIDEBAR ── */}
                <aside className={`${tocOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[52px] left-0 z-40 lg:z-10 w-64 lg:w-56 xl:w-64 h-[calc(100vh-52px)] overflow-y-auto transition-transform duration-300 lg:flex-shrink-0`} style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid #e2e8f0' }}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}><Hash size={12} className="text-white" /></div><span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: '#1e293b' }}>Contents</span></div>
                        <nav className="space-y-0.5">
                            {tocItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => { setActiveSection(item.id); setTocOpen(false); }} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all" style={{ background: activeSection === item.id ? `${item.color}12` : 'transparent', border: activeSection === item.id ? `1px solid ${item.color}30` : '1px solid transparent', color: activeSection === item.id ? item.color : '#64748b' }} onMouseEnter={e => { if (activeSection !== item.id) { e.currentTarget.style.background = '#f8fafc'; } }} onMouseLeave={e => { if (activeSection !== item.id) { e.currentTarget.style.background = 'transparent'; } }}>
                                    <span style={{ color: item.color }}>{item.icon}</span>{item.label}{activeSection === item.id && <ChevronRight size={10} className="ml-auto" />}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>
                {tocOpen && <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setTocOpen(false)} />}

                {/* ── MAIN ── */}
                <main className="flex-1 min-w-0 px-4 py-6 lg:pl-6">
                    {/* HERO */}
                    <section className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 30%, #8b5cf6 60%, #a855f7 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.25)' }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)' }} /><div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)' }} /></div>
                        <div className="relative z-10 p-6 md:p-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}><Sparkles size={10} /> Chapter 3 • Python</div>
                            <h2 className="text-2xl md:text-4xl font-black mb-3 text-white">Python Lists</h2>
                            <p className="text-sm md:text-base max-w-2xl mb-5" style={{ color: 'rgba(255,255,255,0.85)' }}>Python ki sabse useful data structure — List! Multiple items ek jagah store karo, access karo, modify karo!</p>
                            <div className="flex flex-wrap gap-2">
                                {[{ icon: <BookOpen size={14} />, label: '8 Topics' }, { icon: <Code2 size={14} />, label: '11 Methods' }, { icon: <Brain size={14} />, label: '10 MCQs' }, { icon: <Zap size={14} />, label: '30+ Examples' }].map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>{s.icon}<span>{s.label}</span></div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ═══ CONTENT ═══ */}
                    <Sec id="intro" title="What are Python Lists?" icon={<BookOpen size={16} className="text-indigo-500" />}>
                        <Def>📋 <strong>List</strong> ek ordered, mutable collection hai jisme aap multiple items ek variable mein store kar sakte ho. Ye Python ki sabse versatile data structure hai!</Def>
                        <p><strong>Simple samjho:</strong> List ek dabba hai jisme aap bahut saari cheezein rakh sakte ho — numbers, names, ya kuch bhi! Aur aap kabhi bhi koi item add, remove ya change kar sakte ho.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-3">
                            {[{ t: '📦 Ordered', d: 'Items jis order mein daale, usi order mein rahte hain', bg: '#eef2ff', bc: '#c7d2fe', tc: '#4338ca' }, { t: '✏️ Mutable', d: 'Items add, remove, change — sab kuch kar sakte ho', bg: '#ecfdf5', bc: '#a7f3d0', tc: '#166534' }, { t: '🔢 Indexed', d: 'Har item ka ek number (index) hota hai — 0 se shuru', bg: '#f5f3ff', bc: '#ddd6fe', tc: '#5b21b6' }, { t: '🎨 Mixed Types', d: 'Ek list mein numbers, strings, booleans — sab rakh sakte ho', bg: '#fff7ed', bc: '#fed7aa', tc: '#9a3412' }, { t: '📏 Dynamic Size', d: 'List chhoti-badi ho sakti hai — fixed size nahi hai', bg: '#f0fdfa', bc: '#99f6e4', tc: '#115e59' }].map((item, i) => (
                                <div key={i} className="p-3.5 rounded-2xl" style={{ background: item.bg, border: `1px solid ${item.bc}` }}><h4 className="font-bold text-sm mb-1" style={{ color: item.tc }}>{item.t}</h4><p className="text-xs" style={{ color: '#64748b' }}>{item.d}</p></div>
                            ))}
                        </div>
                        <CB code={`# List banane ka tarika — square brackets [] use karo\nfruits = ["apple", "banana", "cherry", "orange"]\nprint(fruits)  # ['apple', 'banana', 'cherry', 'orange']\n\n# List mein kitne items hain?\nprint(len(fruits))  # 4`} />
                    </Sec>

                    <Sec id="types" title="Types of Python Lists" icon={<List size={16} className="text-violet-500" />}>
                        <Def>🗂️ Python mein alag-alag type ki lists bana sakte ho — empty, numbers, strings, mixed, ya nested (list ke andar list)!</Def>
                        <CB code={`# 1. Empty List — khaali list\nempty = []\nprint(empty)           # []\n\n# 2. Integer List — sirf numbers\nnumbers = [1, 2, 3, 4, 5]\nprint(numbers)         # [1, 2, 3, 4, 5]\n\n# 3. Float List — decimal numbers\nprices = [10.5, 20.3, 30.7]\nprint(prices)          # [10.5, 20.3, 30.7]\n\n# 4. String List — text items\nnames = ["Rahul", "Priya", "Amit"]\nprint(names)           # ['Rahul', 'Priya', 'Amit']\n\n# 5. Mixed List — sab kuch mix!\nmixed = [1, "Hello", 3.14, True, None]\nprint(mixed)           # [1, 'Hello', 3.14, True, None]\n\n# 6. Nested List — list ke andar list!\nmatrix = [[1,2,3], [4,5,6], [7,8,9]]\nprint(matrix[0])       # [1, 2, 3] (pehli row)\nprint(matrix[1][2])    # 6 (doosri row, teesra item)`} />
                    </Sec>

                    <Sec id="creating" title="List Kaise Banaye?" icon={<PlusCircle size={16} className="text-blue-500" />}>
                        <Def>🛠️ Python mein list banane ke <strong>3 tarike</strong> hain — direct values se, list() function se, ya list comprehension se.</Def>

                        <h3 className="text-base font-bold mt-4 mb-2" style={{ color: '#1e293b' }}>1. Direct Values De Kar</h3>
                        <CB code={`# Sabse simple tarika — [] mein values likho\nfruits = ["apple", "banana", "cherry"]\nnumbers = [10, 20, 30, 40, 50]`} />

                        <h3 className="text-base font-bold mt-5 mb-2" style={{ color: '#1e293b' }}>2. list() Function Se</h3>
                        <CB code={`# String se list banao — har character alag item ban jaayega\nletters = list("Python")\nprint(letters)  # ['P', 'y', 't', 'h', 'o', 'n']\n\n# range() se numbers ki list banao\nnums = list(range(1, 6))\nprint(nums)     # [1, 2, 3, 4, 5]\n\n# Tuple se list banao\nmy_tuple = (10, 20, 30)\nmy_list = list(my_tuple)\nprint(my_list)  # [10, 20, 30]`} />

                        <h3 className="text-base font-bold mt-5 mb-2" style={{ color: '#1e293b' }}>3. List Comprehension — Ek Line Mein! ⭐</h3>
                        <CB code={`# Squares nikalo 1 se 5 tak — ek hi line mein!\nsquares = [x**2 for x in range(1, 6)]\nprint(squares)  # [1, 4, 9, 16, 25]\n\n# Sirf even numbers filter karo\nevens = [x for x in range(1, 11) if x % 2 == 0]\nprint(evens)    # [2, 4, 6, 8, 10]\n\n# Names ko uppercase mein convert karo\nnames = ["rahul", "priya", "amit"]\nupper = [n.upper() for n in names]\nprint(upper)    # ['RAHUL', 'PRIYA', 'AMIT']`} />
                        <IB type="tip">List comprehension bahut powerful hai — for loop + if condition ek hi line mein! Interviews mein bhi poochha jaata hai.</IB>
                    </Sec>

                    <Sec id="accessing" title="List Items Access Kaise Kare?" icon={<Eye size={16} className="text-cyan-500" />}>
                        <Def>👆 List ke items ko <strong>index</strong> se access karte hain. Python mein index <strong>0 se shuru</strong> hota hai. Negative index se end se access kar sakte ho!</Def>
                        <CB code={`fruits = ["apple", "banana", "cherry", "orange", "mango"]\n#  Index:    0        1         2        3        4\n# Neg idx:  -5       -4        -3       -2       -1\n\n# Positive index — shuru se count karo\nprint(fruits[0])    # apple  (pehla item)\nprint(fruits[2])    # cherry (teesra item)\n\n# Negative index — end se count karo\nprint(fruits[-1])   # mango  (last item)\nprint(fruits[-2])   # orange (second last)\n\n# ❌ Index out of range — ye error dega!\n# print(fruits[10])  # IndexError!`} />
                        <IB type="note">Yaad rakho: Index hamesha <strong>0 se shuru</strong> hota hai! Pehla item = index 0, doosra = index 1, aur aige aise hi.</IB>
                    </Sec>

                    <Sec id="slicing" title="List Slicing" icon={<Scissors size={16} className="text-teal-500" />}>
                        <Def>✂️ <strong>Slicing</strong> se list ka ek hissa (portion) nikal sakte ho. Format: <code>list[start:stop:step]</code> — start se shuru, stop se pehle ruk jaao!</Def>
                        <CB code={`nums = [10, 20, 30, 40, 50, 60, 70, 80, 90]\n\n# Basic slicing — [start:stop] (stop excluded!)\nprint(nums[2:5])     # [30, 40, 50] (index 2, 3, 4)\n\n# Start se leke — [:stop]\nprint(nums[:4])      # [10, 20, 30, 40] (shuru se 3 tak)\n\n# Kisi index se end tak — [start:]\nprint(nums[5:])      # [60, 70, 80, 90] (5 se end tak)\n\n# Step ke saath — [start:stop:step]\nprint(nums[0:8:2])   # [10, 30, 50, 70] (har doosra item)\n\n# Reverse karo! — [::-1]\nprint(nums[::-1])    # [90, 80, 70, 60, 50, 40, 30, 20, 10]\n\n# Last 3 items\nprint(nums[-3:])     # [70, 80, 90]`} />
                    </Sec>

                    <Sec id="traversing" title="List Traverse Kaise Kare?" icon={<Repeat size={16} className="text-emerald-500" />}>
                        <Def>🔄 <strong>Traversing</strong> matlab list ke har ek item ko ek-ek karke access karna. 4 tarike hain:</Def>

                        <h3 className="text-base font-bold mt-4 mb-2" style={{ color: '#1e293b' }}>1. Simple for Loop</h3>
                        <CB code={`fruits = ["🍎 Apple", "🍌 Banana", "🍒 Cherry"]\n\nfor fruit in fruits:\n    print(fruit)\n# 🍎 Apple\n# 🍌 Banana\n# 🍒 Cherry`} />

                        <h3 className="text-base font-bold mt-5 mb-2" style={{ color: '#1e293b' }}>2. Index ke Saath (range + len)</h3>
                        <CB code={`fruits = ["Apple", "Banana", "Cherry"]\n\nfor i in range(len(fruits)):\n    print(f"Index {i}: {fruits[i]}")\n# Index 0: Apple\n# Index 1: Banana\n# Index 2: Cherry`} />

                        <h3 className="text-base font-bold mt-5 mb-2" style={{ color: '#1e293b' }}>3. enumerate() — Best Tarika! ⭐</h3>
                        <CB code={`fruits = ["Apple", "Banana", "Cherry"]\n\nfor index, fruit in enumerate(fruits):\n    print(f"{index}. {fruit}")\n# 0. Apple\n# 1. Banana\n# 2. Cherry`} />
                        <IB type="tip"><code>enumerate()</code> sabse clean tarika hai jab aapko index aur value dono chahiye!</IB>

                        <h3 className="text-base font-bold mt-5 mb-2" style={{ color: '#1e293b' }}>4. while Loop</h3>
                        <CB code={`fruits = ["Apple", "Banana", "Cherry"]\ni = 0\nwhile i < len(fruits):\n    print(fruits[i])\n    i += 1`} />
                    </Sec>

                    <Sec id="operations" title="List Operations" icon={<Zap size={16} className="text-orange-500" />}>
                        <Def>⚙️ Lists par <strong>+</strong> (jodo), <strong>*</strong> (repeat karo), aur <strong>in</strong> (check karo) operations kar sakte ho!</Def>
                        <CB code={`# ➕ Concatenation — Do lists jodo\nlist1 = [1, 2, 3]\nlist2 = [4, 5, 6]\ncombined = list1 + list2\nprint(combined)  # [1, 2, 3, 4, 5, 6]\n\n# ✖️ Repetition — List repeat karo\nrepeat = [0] * 5\nprint(repeat)    # [0, 0, 0, 0, 0]\n\nhello = ["Hi"] * 3\nprint(hello)     # ['Hi', 'Hi', 'Hi']\n\n# 🔍 Membership — Check karo item hai ya nahi\nfruits = ["apple", "banana", "cherry"]\nprint("banana" in fruits)      # True ✅\nprint("grape" in fruits)       # False ❌\nprint("grape" not in fruits)   # True ✅\n\n# 📏 Length\nprint(len(fruits))  # 3\n\n# 🔢 Min, Max, Sum\nnums = [10, 5, 20, 15, 3]\nprint(min(nums))    # 3\nprint(max(nums))    # 20\nprint(sum(nums))    # 53`} />
                    </Sec>

                    <Sec id="methods" title="List Methods — Complete Guide" icon={<Code2 size={16} className="text-rose-500" />}>
                        <Def>🧰 Python Lists ke paas bahut saare built-in methods hain. Ye methods se aap items add, remove, sort, reverse — sab kuch kar sakte ho!</Def>

                        <MethodCard name="append(item)" desc="End mein ek item add karo" color="#6366f1">
                            <CB code={`fruits = ["apple", "banana"]\nfruits.append("cherry")       # End mein add\nprint(fruits)  # ['apple', 'banana', 'cherry']`} />
                        </MethodCard>

                        <MethodCard name="extend(list)" desc="Doosri list ke saare items add karo" color="#8b5cf6">
                            <CB code={`fruits = ["apple", "banana"]\nmore = ["cherry", "orange"]\nfruits.extend(more)           # Saare items add\nprint(fruits)  # ['apple', 'banana', 'cherry', 'orange']`} />
                        </MethodCard>

                        <MethodCard name="insert(index, item)" desc="Kisi specific position par item daalo" color="#3b82f6">
                            <CB code={`fruits = ["apple", "cherry"]\nfruits.insert(1, "banana")    # Index 1 par daalo\nprint(fruits)  # ['apple', 'banana', 'cherry']`} />
                        </MethodCard>

                        <MethodCard name="remove(value)" desc="Pehli matching value hatao" color="#ef4444">
                            <CB code={`fruits = ["apple", "banana", "cherry", "banana"]\nfruits.remove("banana")       # Pehla "banana" hatega\nprint(fruits)  # ['apple', 'cherry', 'banana']`} />
                        </MethodCard>

                        <MethodCard name="pop(index)" desc="Index se item nikalo aur wapas karo" color="#f59e0b">
                            <CB code={`fruits = ["apple", "banana", "cherry"]\nremoved = fruits.pop(1)       # Index 1 ka item nikalo\nprint(removed)  # banana\nprint(fruits)   # ['apple', 'cherry']\n\nlast = fruits.pop()           # Bina index = last item\nprint(last)     # cherry`} />
                        </MethodCard>

                        <MethodCard name="clear()" desc="Saare items hatao — list khaali karo" color="#64748b">
                            <CB code={`fruits = ["apple", "banana", "cherry"]\nfruits.clear()\nprint(fruits)  # []  (khaali!)`} />
                        </MethodCard>

                        <MethodCard name="sort()" desc="Items ko order mein lagao" color="#10b981">
                            <CB code={`nums = [5, 2, 8, 1, 9, 3]\nnums.sort()                   # Chhote se bade\nprint(nums)    # [1, 2, 3, 5, 8, 9]\n\nnums.sort(reverse=True)       # Bade se chhote\nprint(nums)    # [9, 8, 5, 3, 2, 1]`} />
                        </MethodCard>

                        <MethodCard name="reverse()" desc="Items ko ulta karo" color="#8b5cf6">
                            <CB code={`fruits = ["apple", "banana", "cherry"]\nfruits.reverse()\nprint(fruits)  # ['cherry', 'banana', 'apple']`} />
                        </MethodCard>

                        <MethodCard name="copy()" desc="List ki copy banao" color="#06b6d4">
                            <CB code={`original = [1, 2, 3]\ncopy_list = original.copy()\ncopy_list.append(4)           # Copy mein add karo\nprint(original)   # [1, 2, 3]  (original safe!)\nprint(copy_list)  # [1, 2, 3, 4]`} />
                        </MethodCard>

                        <MethodCard name="index(value)" desc="Item ka index number batao" color="#f97316">
                            <CB code={`fruits = ["apple", "banana", "cherry"]\npos = fruits.index("banana")\nprint(pos)  # 1`} />
                        </MethodCard>

                        <MethodCard name="count(value)" desc="Item kitni baar hai — count karo" color="#e11d48">
                            <CB code={`nums = [1, 2, 3, 2, 4, 2, 5]\nprint(nums.count(2))  # 3 (teen baar hai!)`} />
                        </MethodCard>
                    </Sec>

                    {/* ═══ MCQ ═══ */}
                    <Sec id="mcq" title="MCQ Quiz — Test Your Knowledge!" icon={<Brain size={16} className="text-indigo-500" />}>
                        <p className="mb-4"><strong>10 important MCQs</strong> — Python Lists ke concepts test karo! 📋</p>
                        <ListsMCQ />
                    </Sec>

                    {/* ═══ PRACTICE ═══ */}
                    <Sec id="practice" title="Practice Questions — Khud Karo!" icon={<ListOrdered size={16} className="text-violet-500" />}>
                        <p className="mb-3">In questions ka output pehle socho, phir code chalake check karo! 💪</p>
                        <div className="space-y-3">
                            {[{ q: 'List Slicing', h: '[start:stop] mein stop excluded hota hai!', code: 'nums = [10, 20, 30, 40, 50]\nprint(nums[1:4])    # ?\nprint(nums[:3])     # ?\nprint(nums[-2:])    # ?\nprint(nums[::-1])   # ?', bg: '#eef2ff', bc: '#c7d2fe', tc: '#4338ca' }, { q: 'List Methods', h: 'append end mein add karta hai, insert position par.', code: 'fruits = ["apple"]\nfruits.append("banana")\nfruits.insert(0, "mango")\nfruits.extend(["kiwi", "grape"])\nprint(fruits)  # ?\nprint(len(fruits))  # ?', bg: '#ecfdf5', bc: '#a7f3d0', tc: '#166534' }, { q: 'pop() vs remove()', h: 'pop index se kaam karta hai, remove value se.', code: 'nums = [10, 20, 30, 20, 40]\nnums.remove(20)    # Pehla 20 hatao\nresult = nums.pop(0)  # Index 0 nikalo\nprint(nums)    # ?\nprint(result)  # ?', bg: '#f5f3ff', bc: '#ddd6fe', tc: '#5b21b6' }, { q: 'List Comprehension', h: '[expression for item in iterable if condition]', code: 'nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nevens = [x for x in nums if x % 2 == 0]\nsquares = [x**2 for x in range(1, 6)]\nprint(evens)    # ?\nprint(squares)  # ?', bg: '#fdf2f8', bc: '#fbcfe8', tc: '#9d174d' }].map((item, i) => (
                                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: item.bg, border: `1px solid ${item.bc}` }}>
                                    <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${item.bc}` }}><span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ background: item.tc }}>{i + 1}</span><h4 className="font-bold text-sm" style={{ color: item.tc }}>{item.q}</h4></div>
                                    <div className="p-4"><p className="text-sm mb-2" style={{ color: '#475569' }}>Output kya hoga? 🤔</p><CB code={item.code} /><p className="text-xs" style={{ color: '#94a3b8' }}>💡 <strong>Hint:</strong> {item.h}</p></div>
                                </div>
                            ))}
                        </div>
                    </Sec>
                </main>
            </div>
        </div>
    );
}
