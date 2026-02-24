'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, FileCode, ChevronLeft, ChevronRight } from 'lucide-react';

const TASKS: Record<string, { title: string; file: string }> = {
    '1': { title: 'My Profile Page', file: 'task1.html' },
    '2': { title: 'Basic HTML Tags', file: 'task2.html' },
    '3': { title: 'India - A Diverse Nation', file: 'task3.html' },
    '4': { title: 'Indian History Timeline', file: 'task4(1).html' },
    '5': { title: 'Operating Systems (Lists)', file: 'task5.html' },
    '5.1': { title: 'Operating Systems (Table)', file: 'task5.1.html' },
    '5.2': { title: 'Internet Usage Statistics', file: 'task5.2.html' },
    '5.3': { title: 'History of the Internet', file: 'task5.3.html' },
    '5.4': { title: 'Wonders of Space', file: 'task5.4.html' },
    '6': { title: 'Weekly Study Schedule', file: 'task6.html' },
    '7': { title: 'Simple Webpage (No CSS)', file: 'task7.html' },
    '8': { title: 'Registration Form', file: 'task8.html' },
    '9': { title: 'Solar System Basics', file: 'task9.html' },
    '10': { title: 'Full Website Layout', file: 'task10.html' },
    '11': { title: 'Premium Demo Website', file: 'task11.html' },
};

const TASK_ORDER = ['1', '2', '3', '4', '5', '5.1', '5.2', '5.3', '5.4', '6', '7', '8', '9', '10', '11'];

export default function TaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const task = TASKS[id];
    const currentIndex = TASK_ORDER.indexOf(id);
    const prevId = currentIndex > 0 ? TASK_ORDER[currentIndex - 1] : null;
    const nextId = currentIndex < TASK_ORDER.length - 1 ? TASK_ORDER[currentIndex + 1] : null;

    if (!task) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ color: '#1f2937' }}>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
                    <Link href="/html/tasks" className="text-blue-600 hover:underline">← Back to Tasks</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ color: '#1f2937' }}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Link href="/html/tasks" className="text-gray-500 hover:text-gray-900 shrink-0"><ArrowLeft size={20} /></Link>
                        <FileCode size={16} className="text-blue-600 shrink-0" />
                        <h1 className="text-xs sm:text-sm font-bold text-gray-900 truncate">Task {id}: {task.title}</h1>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {prevId && (
                            <Link href={`/html/tasks/${prevId}`} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors" title={`Task ${prevId}`}>
                                <ChevronLeft size={16} />
                            </Link>
                        )}
                        {nextId && (
                            <Link href={`/html/tasks/${nextId}`} className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg transition-colors" title={`Task ${nextId}`}>
                                <ChevronRight size={16} />
                            </Link>
                        )}
                        <Link href="/" className="text-gray-500 hover:text-gray-900 ml-1"><Home size={18} /></Link>
                    </div>
                </div>
            </header>

            {/* Iframe content */}
            <div className="flex-1 bg-white">
                <iframe
                    src={`/html-tasks/${task.file}`}
                    className="w-full h-[calc(100vh-49px)] border-0"
                    title={task.title}
                />
            </div>
        </div>
    );
}
