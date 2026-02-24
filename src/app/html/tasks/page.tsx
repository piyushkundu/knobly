'use client';

import Link from 'next/link';
import { ArrowLeft, Home, FileCode, ExternalLink } from 'lucide-react';

const TASKS = [
    { id: '1', title: 'My Profile Page', desc: 'Create a personal profile using basic HTML tags: p, pre, br, hr', topics: 'p, pre, br, hr, bgcolor', color: 'bg-blue-500' },
    { id: '2', title: 'Basic HTML Tags', desc: 'Demonstrate bold, italic, underline, pre, br, center and heading tags', topics: 'b, i, u, pre, br, center, h1, h2, hr', color: 'bg-green-500' },
    { id: '3', title: 'India - A Diverse Nation', desc: 'Article about India using headings, images, font colors, and hr', topics: 'h1-h5, img, font, br, hr, align', color: 'bg-orange-500' },
    { id: '4', title: 'Indian History Timeline', desc: 'History page using semantic elements: header, nav, section, footer', topics: 'header, nav, section, footer, address, ul', color: 'bg-red-500' },
    { id: '5', title: 'Operating Systems (Lists)', desc: 'OS information page with unordered and ordered lists', topics: 'ul, ol, li, h1-h3, p, hr', color: 'bg-purple-500' },
    { id: '5.1', title: 'Operating Systems (Table)', desc: 'OS comparison using tables with borders and cellpadding', topics: 'table, tr, th, td, border, cellpadding', color: 'bg-purple-400' },
    { id: '5.2', title: 'Internet Usage Statistics', desc: 'Global internet stats with colspan and rowspan tables', topics: 'table, colspan, rowspan, th, td, caption', color: 'bg-indigo-500' },
    { id: '5.3', title: 'History of the Internet', desc: 'Internet timeline with description lists and tables', topics: 'dl, dt, dd, table, iframe, ol', color: 'bg-indigo-400' },
    { id: '5.4', title: 'Wonders of Space', desc: 'Space exploration page with images, tables, and multimedia', topics: 'img, table, audio, video, iframe', color: 'bg-cyan-500' },
    { id: '6', title: 'Weekly Study Schedule', desc: 'Complex table with colspan, rowspan, and colored cells', topics: 'table, colspan, rowspan, bgcolor, th, td', color: 'bg-teal-500' },
    { id: '7', title: 'Simple Webpage (No CSS)', desc: 'Complete webpage using only semantic HTML tags, no CSS', topics: 'header, nav, main, article, section, footer', color: 'bg-amber-500' },
    { id: '8', title: 'Registration Form', desc: 'Complete registration form with all input types', topics: 'form, input, select, textarea, radio, checkbox', color: 'bg-rose-500' },
    { id: '9', title: 'Solar System Basics', desc: 'Solar system page with tables, lists, and audio', topics: 'table, ol, ul, audio, img, details', color: 'bg-sky-500' },
    { id: '10', title: 'Full Website Layout', desc: 'Multi-section website with marquee, nav, tables, forms, media', topics: 'marquee, nav, table, form, video, iframe', color: 'bg-emerald-500' },
    { id: '11', title: 'Premium Demo Website', desc: 'Professional-looking demo site with header, sections, and footer', topics: 'header, section, article, aside, footer, figure', color: 'bg-violet-500' },
];

export default function TasksPage() {
    return (
        <div className="min-h-screen bg-gray-50" style={{ color: '#1f2937' }}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/html/elements" className="text-gray-500 hover:text-gray-900"><ArrowLeft size={20} /></Link>
                        <div className="flex items-center gap-2">
                            <FileCode size={18} className="text-blue-600" />
                            <h1 className="text-sm font-bold text-gray-900">HTML Practice Tasks</h1>
                        </div>
                    </div>
                    <Link href="/" className="text-gray-500 hover:text-gray-900"><Home size={18} /></Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-3 sm:px-5 md:px-8 py-6">
                {/* Banner */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 sm:p-6 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">HTML Practice Tasks</h1>
                    <p className="text-amber-100 text-xs sm:text-sm">Complete these hands-on tasks to master HTML. Each task has a built-in compiler to test your code.</p>
                </div>

                {/* Tasks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TASKS.map((task) => (
                        <Link key={task.id} href={`/html/tasks/${task.id}`}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-8 h-8 rounded-lg ${task.color} text-white font-bold text-xs flex items-center justify-center`}>
                                    {task.id}
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">{task.desc}</p>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-gray-400 font-mono">{task.topics}</p>
                                <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
