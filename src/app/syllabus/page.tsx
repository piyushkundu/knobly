'use client';

import Link from 'next/link';

const SYLLABUS = [
    {
        title: '1. Information Technology Tools and Network Basics',
        color: 'from-blue-500 to-cyan-500',
        units: [
            { unit: 1, topic: 'Introduction to Computer, Hardware and Software Basics', hours: 12 },
            { unit: 2, topic: 'Input/Output Devices, Computer Memory & Storage', hours: 12 },
            { unit: 3, topic: 'Application Software, Systems Software, Utility Software', hours: 12 },
            { unit: 4, topic: 'Basics of Networking, Internet and Email Usage', hours: 12 },
            { unit: 5, topic: 'Digital Financial Tools, e-Governance', hours: 12 },
        ],
    },
    {
        title: '2. Web Designing and Publishing',
        color: 'from-pink-500 to-purple-500',
        units: [
            { unit: 1, topic: 'Basics of Web Development, HTML, CSS', hours: 12 },
            { unit: 2, topic: 'Responsive Design, JavaScript Basics', hours: 12 },
            { unit: 3, topic: 'Publishing Websites, Web Hosting', hours: 12 },
        ],
    },
    {
        title: '3. Programming and Problem Solving Through Python',
        color: 'from-yellow-500 to-orange-500',
        units: [
            { unit: 1, topic: 'Introduction to Programming, Python Basics', hours: 12 },
            { unit: 2, topic: 'Data Types, Control Structures, Functions', hours: 12 },
            { unit: 3, topic: 'File Handling, Libraries (e.g., NumPy)', hours: 12 },
        ],
    },
    {
        title: '4. Internet of Things and Its Applications',
        color: 'from-emerald-500 to-teal-500',
        units: [
            { unit: 1, topic: 'Introduction to IoT, Applications and Protocols', hours: 12 },
            { unit: 2, topic: 'Building IoT Applications with Arduino', hours: 12 },
            { unit: 3, topic: 'Security in IoT, Future of IoT Ecosystem', hours: 12 },
        ],
    },
];

export default function SyllabusPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#0f172a] overflow-y-auto">
            <header className="sticky top-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                            NIELIT O Level Syllabus
                        </h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">2023 Curriculum</p>
                    </div>
                    <Link href="/" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all">
                        ← Home
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {SYLLABUS.map((subject, si) => (
                    <section key={si} className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                        <div className={`bg-gradient-to-r ${subject.color} px-5 py-3`}>
                            <h2 className="text-sm md:text-base font-bold text-white">{subject.title}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-gray-500 font-bold w-16">Unit</th>
                                        <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-gray-500 font-bold">Topics Covered</th>
                                        <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider text-gray-500 font-bold w-24">Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subject.units.map((u) => (
                                        <tr key={u.unit} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3 text-cyan-400 font-bold">{u.unit}</td>
                                            <td className="px-4 py-3 text-gray-300">{u.topic}</td>
                                            <td className="px-4 py-3 text-center text-gray-400">{u.hours}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}
