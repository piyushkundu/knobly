'use client';

import Link from 'next/link';

const CHAPTERS = [
    { num: 1, title: 'Introduction to Computer', desc: 'Identify computers, IT gadgets and explain their evolution and applications. Get familiar with various input, output and hardware components of a computer along with storage devices.', color: 'from-blue-500 to-purple-500', glow: 'hover:shadow-blue-500/20', link: 'https://drive.google.com/file/d/1kKUUXdWvX_Rw7Hiz62bp_KHr4rsjhBDF/view?usp=sharing' },
    { num: 2, title: 'Introduction to Operating System', desc: 'Well acquainted with Operating System and its applications for both desktop and mobile devices. Able to identify various desktop screen components and modify various properties, date, time etc.', color: 'from-purple-500 to-pink-500', glow: 'hover:shadow-purple-500/20', link: 'https://drive.google.com/file/d/1kLph3f4LtGF_wyQdWvm8_w20HoxMelyN/view?usp=sharing' },
    { num: 3, title: 'Word Processing', desc: 'Word processing enables the creation, editing, and formatting of text documents, with features like headers, tables, and spell check. It also supports saving/printing documents and mail merge for bulk mailing.', color: 'from-green-500 to-lime-500', glow: 'hover:shadow-green-500/20', link: 'https://drive.google.com/file/d/1kRwwscaEg-TzhiTUeYyniu--KPS1AgMB/view?usp=sharing' },
    { num: 4, title: 'Spreadsheet', desc: 'Spreadsheets allow users to organize, analyze, and visualize data through cells, with features like sorting, filtering, and applying formulas. Users can insert/delete rows, and columns, and create charts to represent data visually.', color: 'from-orange-500 to-red-500', glow: 'hover:shadow-orange-500/20', link: 'https://drive.google.com/file/d/1kSCre3uZwpLCRzsmP1Y6EZY2CwsBiQoL/view?usp=sharing' },
    { num: 5, title: 'LibreOffice Impress', desc: 'LibreOffice Impress is a presentation software used to create slideshows, including text, images, animations, and other multimedia. It helps in designing effective presentations to communicate ideas clearly.', color: 'from-red-500 to-yellow-500', glow: 'hover:shadow-red-500/20', link: 'https://drive.google.com/file/d/1vCBnaTdzhJrZLZ25Oo_9XhhiktbpIc9z/view?usp=sharing' },
    { num: 6, title: 'Introduction to Internet and WWW', desc: 'Gather knowledge of various types of networks and topologies. Get an overview of the Internet, its applications and various browsers available to access the Internet.', color: 'from-cyan-500 to-teal-500', glow: 'hover:shadow-cyan-500/20', link: 'https://drive.google.com/file/d/1mM7_p9LtwwFSY2kiFqxRJEWVPzLJi1ys/view?usp=sharing' },
    { num: 7, title: 'E-mail, Social Networking and e-Governance Services', desc: 'Learn about various e-mail services and protocols, explore social networking platforms and their impact, and understand e-Governance services offered by the government for better digital communication.', color: 'from-rose-500 to-fuchsia-500', glow: 'hover:shadow-rose-500/20', link: 'https://drive.google.com/file/d/1pIr3Unp0672QEE2J-zs_c7QwENRUIAKP/view?usp=drive_link' },
    { num: 8, title: 'Digital Financial Services', desc: 'Understand digital payment systems, mobile banking, and e-wallets, along with the role of digital financial services in modern society.', color: 'from-indigo-500 to-violet-500', glow: 'hover:shadow-indigo-500/20', link: 'https://drive.google.com/file/d/1sDaeMQoStXVmQ5rkM8Zk23eiIBnRq62q/view?usp=sharing' },
    { num: 9, title: 'Future Skills and Cyber Security', desc: 'Learn about emerging digital skills and cyber security practices, and understand how to protect information in a rapidly evolving technological landscape.', color: 'from-amber-500 to-yellow-500', glow: 'hover:shadow-amber-500/20', link: 'https://drive.google.com/file/d/1sDaeMQoStXVmQ5rkM8Zk23eiIBnRq62q/view?usp=sharing' },
];

export default function NotesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#0f172a] overflow-y-auto">
            <header className="sticky top-0 z-50 bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Books and Notes
                        </h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Information Technology Tools and Network Basics</p>
                    </div>
                    <Link href="/" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all">
                        ← Home
                    </Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CHAPTERS.map((ch) => (
                        <div key={ch.num} className={`glass-panel rounded-2xl overflow-hidden border border-white/5 ${ch.glow} hover:scale-[1.02] transition-all duration-300`}>
                            <div className="p-6">
                                <div className="bg-gray-800/50 rounded-xl p-5 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                        <i className="ph-bold ph-book-open text-2xl text-cyan-400" />
                                        <h2 className={`text-lg font-bold bg-gradient-to-r ${ch.color} bg-clip-text text-transparent`}>Chapter {ch.num}</h2>
                                    </div>
                                    <h3 className="text-base font-semibold text-white mb-2">{ch.title}</h3>
                                    <p className="text-xs text-gray-400 mb-4 flex-1 leading-relaxed">{ch.desc}</p>
                                    <a href={ch.link} target="_blank" rel="noopener noreferrer"
                                        className={`w-full text-center px-4 py-2.5 bg-gradient-to-r ${ch.color} text-white font-bold text-sm rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all`}>
                                        Download Notes
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
