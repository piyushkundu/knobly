'use client';
import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, BookOpen, Code2, Sparkles, ChevronRight } from 'lucide-react';

/* ── Premium Helper Components ── */

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="relative bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 sm:p-5 md:p-7 mb-5 transition-shadow duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 rounded-full bg-gradient-to-b from-orange-500 to-red-600" />
                {title}
            </h2>
            <div className="text-[13px] sm:text-sm text-gray-600 leading-relaxed space-y-4">{children}</div>
        </section>
    );
}

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="rounded-xl overflow-hidden my-4 shadow-sm border border-gray-800/20" style={{ background: '#1e1e2e' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ background: '#181825' }}>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono ml-1">index.html</span>
                </div>
                <button onClick={handleCopy} className="text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all" style={{ background: copied ? '#166534' : '#313244', color: copied ? '#86efac' : '#a6adc8' }}>
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
            <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-[13px] leading-relaxed font-mono" style={{ color: '#cdd6f4' }}><code>{code}</code></pre>
        </div>
    );
}

function InfoBox({ type = 'note', children }: { type?: 'note' | 'tip' | 'warning'; children: ReactNode }) {
    const styles = {
        note: 'bg-blue-50 border-blue-200 text-blue-800',
        tip: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
    };
    const icons = { note: '💡', tip: '✅', warning: '⚠️' };
    return (
        <div className={`border rounded-xl p-3 sm:p-4 text-xs sm:text-[13px] ${styles[type]} my-4 leading-relaxed flex gap-2`}>
            <span className="shrink-0">{icons[type]}</span>
            <div>{children}</div>
        </div>
    );
}

function InfoCard({ title, children, color = 'blue' }: { title: string; children: ReactNode; color?: string }) {
    const colors: Record<string, string> = {
        blue: 'border-blue-100 bg-blue-50/50',
        orange: 'border-orange-100 bg-orange-50/50',
        green: 'border-emerald-100 bg-emerald-50/50',
        purple: 'border-purple-100 bg-purple-50/50',
    };
    const titleColors: Record<string, string> = {
        blue: 'text-blue-700',
        orange: 'text-orange-700',
        green: 'text-emerald-700',
        purple: 'text-purple-700',
    };
    return (
        <div className={`rounded-xl border p-4 my-4 ${colors[color] || colors.blue}`}>
            <h4 className={`text-sm font-bold mb-3 ${titleColors[color] || titleColors.blue}`}>{title}</h4>
            <div className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">{children}</div>
        </div>
    );
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
    return (
        <div className="flex gap-3 items-start">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm shadow-blue-500/25">{num}</span>
            <div>
                <strong className="text-gray-900 text-sm">{title}</strong>
                <p className="text-gray-500 mt-0.5 text-xs">{desc}</p>
            </div>
        </div>
    );
}

function Timeline({ items }: { items: { year: string; title: string; desc: string }[] }) {
    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start group">
                    <div className="flex flex-col items-center">
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold shrink-0 shadow-sm">{item.year}</span>
                        {i < items.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-1">
                        <strong className="text-gray-900 text-xs">{item.title}</strong>
                        <span className="text-gray-500 text-xs ml-1">— {item.desc}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Main Page ── */

export default function HtmlIntro() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/10" style={{ color: '#1e293b' }}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/html" className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm shadow-orange-500/25">
                                <BookOpen size={13} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xs sm:text-sm font-bold text-gray-900">Introduction to HTML</h1>
                                <span className="text-[9px] text-gray-400 uppercase tracking-wider">HTML Course</span>
                            </div>
                        </div>
                    </div>
                    <Link href="/" className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <Home size={16} />
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 sm:px-5 md:px-8 py-6">
                {/* Hero Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-5 sm:p-7 mb-6 shadow-lg shadow-orange-500/20">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    <div className="absolute top-3 right-6 text-white/8 text-5xl sm:text-7xl font-black select-none">&lt;/&gt;</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-yellow-200" />
                            <span className="text-[10px] font-bold text-orange-100 uppercase tracking-[0.2em]">Start Here</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1.5">Introduction to HTML</h1>
                        <p className="text-orange-100 text-xs sm:text-sm mb-4">Learn the foundation of every website — from basic structure to your first web page.</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold">11 Topics</span>
                            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold">Code Examples</span>
                            <span className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold">Beginner Friendly</span>
                        </div>
                    </div>
                </div>

                {/* Section 1: What is HTML */}
                <Section title="What is HTML?">
                    <p><strong>HTML (HyperText Markup Language)</strong> is the standard markup language used to create and design web pages. It describes the structure of a web page using a series of elements, which tell the browser how to display the content.</p>
                    <p>HTML was created by <strong>Tim Berners-Lee</strong> in <strong>1991</strong>. The latest version is <strong>HTML5</strong>, which introduced many new features like semantic elements, audio/video support, canvas, and more.</p>
                    <InfoBox type="note">HTML is NOT a programming language — it is a <strong>markup language</strong>. It does not have logic, loops, or variables. It only defines the structure and content of a web page.</InfoBox>
                    <p>Every website you visit on the internet uses HTML as its foundation. Even complex web applications built with JavaScript frameworks still use HTML at their core.</p>
                    <InfoCard title="Key Facts about HTML" color="orange">
                        <ul className="list-disc list-inside space-y-1.5">
                            <li>HTML stands for <strong>HyperText Markup Language</strong></li>
                            <li>HTML describes the <strong>structure</strong> of a Web page</li>
                            <li>HTML consists of a series of <strong>elements</strong></li>
                            <li>HTML elements tell the browser <strong>how to display</strong> the content</li>
                            <li>HTML elements label pieces of content such as &quot;this is a heading&quot;, &quot;this is a paragraph&quot;, &quot;this is a link&quot;, etc.</li>
                            <li>HTML file extension is <code className="px-1.5 py-0.5 rounded bg-gray-100 text-red-600 text-xs border border-gray-200">.html</code> or <code className="px-1.5 py-0.5 rounded bg-gray-100 text-red-600 text-xs border border-gray-200">.htm</code></li>
                            <li>HTML can be created and edited using any text editor like Notepad, VS Code, Sublime Text, etc.</li>
                        </ul>
                    </InfoCard>
                </Section>

                {/* Section 2: History of HTML */}
                <Section title="History of HTML">
                    <p>HTML has evolved significantly since its creation. Here is a brief timeline:</p>
                    <InfoCard title="HTML Version Timeline" color="blue">
                        <Timeline items={[
                            { year: '1991', title: 'HTML 1.0', desc: 'Tim Berners-Lee invented HTML. The first version had only 18 tags.' },
                            { year: '1995', title: 'HTML 2.0', desc: 'Published as a standard by IETF. Added form elements and tables.' },
                            { year: '1997', title: 'HTML 3.2', desc: 'W3C Recommendation. Added support for scripts, tables, applets.' },
                            { year: '1999', title: 'HTML 4.01', desc: 'Major version with CSS support, scripting improvements, and accessibility features.' },
                            { year: '2000', title: 'XHTML 1.0', desc: 'HTML reformulated as XML. Stricter syntax rules.' },
                            { year: '2014', title: 'HTML5', desc: 'Current standard. Added semantic elements, multimedia, Canvas, SVG, Web Storage, and much more.' },
                        ]} />
                    </InfoCard>
                </Section>

                {/* Section 3: HTML Editors */}
                <Section title="HTML Editors">
                    <p>HTML files can be created using any text editor. However, specialized code editors provide features like syntax highlighting, auto-completion, and error detection.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                        {[
                            { name: 'Notepad', desc: 'Simple text editor. Good for beginners to understand raw HTML without any assistance.', badge: 'Windows', color: 'bg-blue-50 border-blue-100' },
                            { name: 'VS Code', desc: 'Most popular free code editor by Microsoft. IntelliSense, extensions, integrated terminal, and Git support.', badge: 'Recommended', color: 'bg-emerald-50 border-emerald-100' },
                            { name: 'Sublime Text', desc: 'Lightweight and fast editor with powerful shortcuts and a distraction-free writing mode.', badge: 'Cross-platform', color: 'bg-purple-50 border-purple-100' },
                            { name: 'Notepad++', desc: 'Free source code editor for Windows. Supports syntax highlighting for many languages.', badge: 'Free', color: 'bg-amber-50 border-amber-100' },
                        ].map((editor) => (
                            <div key={editor.name} className={`rounded-xl border p-4 ${editor.color}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <strong className="text-gray-900 text-sm">{editor.name}</strong>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-white px-2 py-0.5 rounded-full">{editor.badge}</span>
                                </div>
                                <p className="text-xs text-gray-500">{editor.desc}</p>
                            </div>
                        ))}
                    </div>
                    <InfoBox type="tip">For beginners, we recommend using <strong>VS Code</strong> (Visual Studio Code) — it is free, lightweight, and has excellent HTML support built-in.</InfoBox>
                </Section>

                {/* Section 4: Basic Structure */}
                <Section title="Basic Structure of an HTML Page">
                    <p>Every HTML page follows a standard structure. Here is the basic skeleton of an HTML document:</p>
                    <CodeBlock code={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Web Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is my first web page.</p>
</body>
</html>`} />
                    <InfoCard title="Explanation of Each Part" color="blue">
                        <div className="space-y-2.5">
                            {[
                                ['<!DOCTYPE html>', 'Declares that this document is an HTML5 document. Must be the very first line.'],
                                ['<html>', 'The root element. All other elements are contained inside this.'],
                                ['<head>', 'Contains meta-information about the page (title, charset, stylesheets). NOT displayed.'],
                                ['<meta charset="UTF-8">', 'Character encoding (UTF-8 supports most characters and symbols).'],
                                ['<meta name="viewport">', 'Makes the web page responsive on mobile devices.'],
                                ['<title>', 'Sets the title shown in the browser tab.'],
                                ['<body>', 'Contains all the visible content (text, images, links, tables, etc.).'],
                                ['<h1>', 'Defines the main heading of the page.'],
                                ['<p>', 'Defines a paragraph of text.'],
                            ].map(([tag, desc], i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <code className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200 shrink-0">{tag}</code>
                                    <span className="text-xs text-gray-600">{desc}</span>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                </Section>

                {/* Section 5: HTML Tags */}
                <Section title="HTML Tags">
                    <p>HTML uses <strong>tags</strong> to define elements. Tags are written inside angle brackets <code className="px-1 py-0.5 rounded bg-gray-100 text-red-600 text-xs border border-gray-200">&lt; &gt;</code>. Most tags come in pairs — an <strong>opening tag</strong> and a <strong>closing tag</strong>.</p>
                    <CodeBlock code={`<!-- Opening and closing tags -->
<p>This is a paragraph.</p>

<!-- Self-closing tags (no closing tag needed) -->
<br>
<hr>
<img src="image.jpg" alt="description">`} />
                    <InfoCard title="Tag Syntax" color="orange">
                        <div className="space-y-2">
                            <div><strong>Opening Tag:</strong> <code className="px-1 py-0.5 rounded bg-gray-100 text-xs border border-gray-200">&lt;tagname&gt;</code> — Starts an element</div>
                            <div><strong>Content:</strong> The text or other elements between the tags</div>
                            <div><strong>Closing Tag:</strong> <code className="px-1 py-0.5 rounded bg-gray-100 text-xs border border-gray-200">&lt;/tagname&gt;</code> — Ends an element (note the forward slash /)</div>
                            <div><strong>Self-closing:</strong> <code className="px-1 py-0.5 rounded bg-gray-100 text-xs border border-gray-200">&lt;tagname /&gt;</code> — Elements without content (br, img, hr, input)</div>
                        </div>
                    </InfoCard>
                    <InfoBox type="warning">HTML tags are <strong>NOT case-sensitive</strong>: &lt;P&gt; and &lt;p&gt; are the same. However, it is best practice to always use <strong>lowercase</strong> tags.</InfoBox>
                </Section>

                {/* Section 6: HTML Attributes */}
                <Section title="HTML Attributes">
                    <p>Attributes provide additional information about HTML elements. They are always specified in the <strong>opening tag</strong> and usually come in <strong>name/value</strong> pairs like: <code className="px-1 py-0.5 rounded bg-gray-100 text-red-600 text-xs border border-gray-200">name=&quot;value&quot;</code></p>
                    <CodeBlock code={`<!-- href attribute for links -->
<a href="https://www.google.com">Visit Google</a>

<!-- src and alt attributes for images -->
<img src="photo.jpg" alt="A beautiful sunset" width="300" height="200">

<!-- id and class attributes -->
<div id="main-content" class="container">
    <p class="text-bold">This paragraph has a class.</p>
</div>

<!-- style attribute for inline CSS -->
<p style="color: red; font-size: 20px;">This text is red and large.</p>

<!-- title attribute (shows tooltip on hover) -->
<p title="This is a tooltip">Hover over me!</p>`} />
                    <div className="overflow-x-auto my-4 rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-xs sm:text-sm">
                            <thead><tr className="bg-gradient-to-r from-blue-50 to-indigo-50"><th className="text-left py-2.5 px-3 text-blue-700 font-bold text-xs border-b border-blue-100">Attribute</th><th className="text-left py-2.5 px-3 text-blue-700 font-bold text-xs border-b border-blue-100">Description</th><th className="text-left py-2.5 px-3 text-blue-700 font-bold text-xs border-b border-blue-100">Used With</th></tr></thead>
                            <tbody>
                                {[
                                    ['href', 'Specifies the URL of a link', '<a>'],
                                    ['src', 'Specifies the path to an image', '<img>, <script>'],
                                    ['alt', "Alternative text if image can't load", '<img>'],
                                    ['width / height', 'Sets the width and height', '<img>, <table>'],
                                    ['id', 'Unique identifier for an element', 'All elements'],
                                    ['class', 'CSS class name(s) for styling', 'All elements'],
                                    ['style', 'Inline CSS styles', 'All elements'],
                                    ['title', 'Extra info (shown as tooltip)', 'All elements'],
                                    ['target', 'Where to open link (_blank = new tab)', '<a>'],
                                    ['type', 'Type of input element', '<input>'],
                                    ['placeholder', 'Hint text inside input fields', '<input>, <textarea>'],
                                    ['disabled', 'Disables the element', '<input>, <button>'],
                                ].map(([attr, desc, used], i) => (
                                    <tr key={i} className={`${i % 2 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors`}>
                                        <td className="py-2.5 px-3 border-b border-gray-50"><code className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">{attr}</code></td>
                                        <td className="py-2.5 px-3 border-b border-gray-50 text-gray-600">{desc}</td>
                                        <td className="py-2.5 px-3 border-b border-gray-50 text-gray-500 font-mono text-[11px]">{used}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* Section 7: Common Tags Reference */}
                <Section title="Common HTML Tags Quick Reference">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {[
                            ['<h1> - <h6>', 'Headings (h1 = largest)'],
                            ['<p>', 'Paragraph text'],
                            ['<a>', 'Hyperlink'],
                            ['<img>', 'Embeds an image'],
                            ['<br>', 'Line break'],
                            ['<hr>', 'Horizontal rule'],
                            ['<b> / <strong>', 'Bold text'],
                            ['<i> / <em>', 'Italic text'],
                            ['<u>', 'Underlined text'],
                            ['<ul> / <ol>', 'Unordered / Ordered lists'],
                            ['<li>', 'List item'],
                            ['<div>', 'Block container'],
                            ['<span>', 'Inline container'],
                            ['<table>', 'Data table'],
                            ['<form>', 'User input form'],
                            ['<input>', 'Input field'],
                            ['<button>', 'Clickable button'],
                            ['<textarea>', 'Multi-line text input'],
                        ].map(([tag, desc], i) => (
                            <div key={i} className="bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 rounded-xl p-3 transition-colors group">
                                <code className="text-[11px] font-semibold text-orange-600">{tag}</code>
                                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 group-hover:text-gray-600">{desc}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Section 8: HTML Comments */}
                <Section title="HTML Comments">
                    <p>Comments in HTML are used to add notes in your code that are <strong>not displayed</strong> in the browser. They help other developers (and your future self) understand the code.</p>
                    <CodeBlock code={`<!-- This is a single-line comment -->

<!--
    This is a
    multi-line comment.
    It can span multiple lines.
-->

<p>This paragraph is visible.</p>
<!-- <p>This paragraph is hidden (commented out).</p> -->`} />
                    <InfoBox type="tip">Comments are useful for temporarily hiding code during debugging. You can &quot;comment out&quot; code instead of deleting it.</InfoBox>
                </Section>

                {/* Section 9: Creating Your First Web Page */}
                <Section title="Creating Your First Web Page">
                    <p>Follow these steps to create and view your first HTML web page:</p>
                    <InfoCard title="Step-by-Step Guide" color="green">
                        <div className="space-y-4">
                            <Step num={1} title="Open a Text Editor" desc="Open Notepad (Windows), TextEdit (Mac), or VS Code." />
                            <Step num={2} title="Write HTML Code" desc="Type the basic HTML structure with a heading and paragraph." />
                            <Step num={3} title="Save the File" desc='Save with a .html extension (e.g., index.html). Select "All Files" in the save dialog.' />
                            <Step num={4} title="Open in Browser" desc='Double-click the saved file, or right-click → "Open with" → choose your web browser.' />
                        </div>
                    </InfoCard>
                    <CodeBlock code={`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Page</title>
</head>
<body>
    <h1>Welcome to My Website!</h1>
    <p>I just created my first web page using HTML.</p>
    <p>HTML is easy and fun to learn.</p>
    <hr>
    <h2>About Me</h2>
    <p>My name is Student and I am learning web development.</p>
    <h2>My Hobbies</h2>
    <ul>
        <li>Coding</li>
        <li>Reading</li>
        <li>Gaming</li>
    </ul>
    <p><a href="https://www.google.com" target="_blank">Visit Google</a></p>
</body>
</html>`} />
                    <InfoBox type="tip">You can also use the <strong>Live Compiler</strong> in Knobly to write and preview HTML code instantly without saving any files!</InfoBox>
                </Section>

                {/* Section 10: HTML5 New Features */}
                <Section title="HTML5 New Features">
                    <p>HTML5 introduced many new elements and features that make web development easier and more powerful:</p>
                    <InfoCard title="New Semantic Elements" color="blue">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                ['<header>', 'Page or section header'],
                                ['<nav>', 'Navigation links'],
                                ['<main>', 'Main content area'],
                                ['<section>', 'Thematic section'],
                                ['<article>', 'Independent content'],
                                ['<aside>', 'Sidebar content'],
                                ['<footer>', 'Page or section footer'],
                                ['<figure>', 'Image with caption'],
                            ].map(([tag, desc], i) => (
                                <div key={i}><code className="text-orange-600 text-[11px] font-semibold">{tag}</code> <span className="text-gray-500 text-xs">— {desc}</span></div>
                            ))}
                        </div>
                    </InfoCard>
                    <InfoCard title="New Multimedia Elements" color="purple">
                        <div className="space-y-1.5">
                            <div><code className="text-orange-600 text-[11px] font-semibold">&lt;audio&gt;</code> <span className="text-gray-500 text-xs">— Embed audio files directly (no plugins)</span></div>
                            <div><code className="text-orange-600 text-[11px] font-semibold">&lt;video&gt;</code> <span className="text-gray-500 text-xs">— Embed video files directly</span></div>
                            <div><code className="text-orange-600 text-[11px] font-semibold">&lt;canvas&gt;</code> <span className="text-gray-500 text-xs">— Draw graphics using JavaScript</span></div>
                            <div><code className="text-orange-600 text-[11px] font-semibold">&lt;svg&gt;</code> <span className="text-gray-500 text-xs">— Scalable Vector Graphics</span></div>
                        </div>
                    </InfoCard>
                    <InfoCard title="New Form Input Types" color="green">
                        <div className="grid grid-cols-2 gap-1.5">
                            {[['email', 'Email validation'], ['url', 'URL validation'], ['number', 'Numeric input'], ['range', 'Slider control'], ['date', 'Date picker'], ['time', 'Time picker'], ['color', 'Color picker'], ['search', 'Search field']].map(([type, desc], i) => (
                                <div key={i} className="text-xs"><code className="text-gray-700 font-semibold">{type}</code> <span className="text-gray-400">— {desc}</span></div>
                            ))}
                        </div>
                    </InfoCard>
                </Section>

                {/* Section 11: HTML vs CSS vs JavaScript */}
                <Section title="HTML vs CSS vs JavaScript">
                    <p>Web pages are built using three core technologies that work together:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                        {[
                            { emoji: '🏗️', name: 'HTML', sub: 'Structure & Content', desc: 'Defines what is on the page — headings, paragraphs, images, links, tables, forms', color: 'bg-orange-50 border-orange-200', titleColor: 'text-orange-600' },
                            { emoji: '🎨', name: 'CSS', sub: 'Styling & Layout', desc: 'Defines how it looks — colors, fonts, spacing, animations, responsive design', color: 'bg-blue-50 border-blue-200', titleColor: 'text-blue-600' },
                            { emoji: '⚡', name: 'JavaScript', sub: 'Behavior & Interactivity', desc: 'Defines what happens — click events, form validation, dynamic content, API calls', color: 'bg-yellow-50 border-yellow-200', titleColor: 'text-yellow-600' },
                        ].map((tech) => (
                            <div key={tech.name} className={`rounded-2xl border p-5 text-center ${tech.color} hover:shadow-md transition-shadow`}>
                                <div className="text-3xl mb-2">{tech.emoji}</div>
                                <h4 className={`text-sm font-extrabold ${tech.titleColor} mb-0.5`}>{tech.name}</h4>
                                <p className="text-[11px] text-gray-500 font-medium">{tech.sub}</p>
                                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                    <InfoBox type="note">Think of it like building a house: <strong>HTML</strong> is the bricks and structure, <strong>CSS</strong> is the paint and decoration, and <strong>JavaScript</strong> is the electricity and plumbing that makes things work.</InfoBox>
                </Section>

                {/* Next Steps */}
                <Link href="/html/elements" className="group flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 shadow-lg shadow-blue-500/20 hover:shadow-xl transition-shadow mb-4">
                    <div>
                        <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Next Chapter</span>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white">Elements, Tags & Attributes →</h3>
                        <p className="text-blue-200 text-xs mt-1">18 sections covering every HTML element with examples</p>
                    </div>
                    <ChevronRight size={24} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
            </main>
        </div>
    );
}
