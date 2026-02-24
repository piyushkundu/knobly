'use client';
import { useState } from 'react';
import SidebarLayout from '@/components/content/SidebarLayout';

const SIDEBAR_ITEMS = [
    { id: 'elements-tags', label: 'HTML Elements, Tags, and Attributes' },
    { id: 'empty-container', label: 'Empty Tags and Container Tags' },
    { id: 'body-tag', label: 'Body Tag and Attributes' },
    { id: 'p-tag', label: '<p> Tag and Its Attributes' },
    { id: 'pre-tag', label: '<pre> Tag' },
    { id: 'br-tag', label: '<br> Tag' },
    { id: 'formatting', label: 'HTML Formatting Elements' },
    { id: 'heading-tag', label: 'Heading Tags (h1-h6)' },
    { id: 'img-tag', label: '<img> Tag and Attributes' },
    { id: 'anchor-tag', label: '<a> Anchor Tag' },
    { id: 'list-tags', label: 'List Tags (ul, ol, dl)' },
    { id: 'table-tag', label: 'Table Tag and Attributes' },
    { id: 'form-tag', label: 'Form Tag and Elements' },
    { id: 'div-span', label: '<div> and <span> Tags' },
    { id: 'semantic', label: 'HTML5 Semantic Elements' },
    { id: 'audio-video', label: 'Audio and Video Tags' },
    { id: 'iframe-tag', label: '<iframe> Tag' },
    { id: 'entities', label: 'HTML Entities' },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="relative bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 sm:p-5 md:p-7 mb-5 scroll-mt-16 transition-shadow duration-300 overflow-hidden">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                <span className="inline-block w-1.5 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                {title}
            </h2>
            <div className="text-[13px] sm:text-sm text-gray-600 leading-relaxed space-y-4">{children}</div>
        </section>
    );
}

function Code({ code }: { code: string }) {
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

function Task({ num, children }: { num: number; children: React.ReactNode }) {
    return (
        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 sm:p-4 mt-5 shadow-sm overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />
            <div className="flex items-center gap-2 mb-2 pl-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center shadow-sm shadow-amber-400/30">{num}</span>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Practice Task</span>
            </div>
            <p className="text-xs sm:text-[13px] text-amber-900 pl-2 leading-relaxed">{children}</p>
        </div>
    );
}

function AttrTable({ rows }: { rows: [string, string][] }) {
    return (
        <div className="overflow-x-auto my-4 rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-xs sm:text-sm">
                <thead><tr className="bg-gradient-to-r from-blue-50 to-indigo-50"><th className="text-left py-2.5 px-3 text-blue-700 font-bold text-xs border-b border-blue-100">Attribute</th><th className="text-left py-2.5 px-3 text-blue-700 font-bold text-xs border-b border-blue-100">Description</th></tr></thead>
                <tbody>{rows.map(([a, d], i) => (<tr key={i} className={`${i % 2 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors`}><td className="py-2.5 px-3 border-b border-gray-50"><code className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100">{a}</code></td><td className="py-2.5 px-3 border-b border-gray-50 text-gray-600">{d}</td></tr>))}</tbody>
            </table>
        </div>
    );
}

export default function HtmlElements() {
    return (
        <SidebarLayout title="Elements, Tags, and Attributes" backHref="/html" sidebarTitle="HTML All Tags" items={SIDEBAR_ITEMS}>
            {/* Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 sm:p-7 mb-6 shadow-lg shadow-blue-500/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="absolute top-3 right-6 text-white/8 text-5xl sm:text-7xl font-black select-none">&lt;/&gt;</div>
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1.5">Elements, Tags, and Attributes</h1>
                    <p className="text-blue-200 text-xs sm:text-sm mb-4">Complete reference for HTML elements with examples and practice tasks</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold backdrop-blur-sm">18 Sections</span>
                        <span className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold backdrop-blur-sm">50+ Examples</span>
                        <span className="px-2.5 py-1 rounded-full bg-white/15 text-white text-[10px] font-semibold backdrop-blur-sm">18 Tasks</span>
                    </div>
                </div>
            </div>

            {/* 1 */}
            <Section id="elements-tags" title="1. HTML Elements, Tags, and Attributes">
                <p>An HTML element is a building block of a webpage that consists of a <strong>start tag</strong>, <strong>content</strong>, and an <strong>end tag</strong>. Elements form the structure of the content on the page.</p>
                <p>Tags are the keywords that define the start and end of an element. Attributes provide additional information about the elements and are included within the opening tag.</p>
                <Code code={`Example: <a href="https://olevelcccexam.link">
Visit our site</a>

Here, <a> is the tag, href is an attribute,
and "Visit our site" is the content.`} />
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-700 mb-2">Tag Syntax:</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-700">
                        <li><strong>Opening Tag:</strong> <code className="bg-gray-100 px-1 rounded">&lt;tagname&gt;</code> — marks the beginning of an element</li>
                        <li><strong>Content:</strong> The text or nested elements between tags</li>
                        <li><strong>Closing Tag:</strong> <code className="bg-gray-100 px-1 rounded">&lt;/tagname&gt;</code> — marks the end of an element</li>
                        <li><strong>Attribute:</strong> <code className="bg-gray-100 px-1 rounded">name=&quot;value&quot;</code> — provides extra info, always in the opening tag</li>
                    </ul>
                </div>
                <Code code={`<p align="center">This is a centered paragraph.</p>
<!-- <p> is the tag, align is the attribute, "center" is the value -->`} />
                <Task num={1}>Create a simple HTML page with a <code className="bg-amber-100 px-1 rounded">&lt;p&gt;</code> tag that has an <code className="bg-amber-100 px-1 rounded">align=&quot;center&quot;</code> attribute. Add a heading above it using the <code className="bg-amber-100 px-1 rounded">&lt;h1&gt;</code> tag.</Task>
            </Section>

            {/* 2 */}
            <Section id="empty-container" title="2. Empty Tags and Container Tags">
                <p>HTML tags are categorized into two types based on whether they hold content or not:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="text-sm font-bold text-green-700 mb-2">Container Tags (Paired)</h4>
                        <p className="text-xs text-gray-600 mb-2">Have opening + closing tag, contain content.</p>
                        <div className="space-y-1 text-xs text-gray-700">
                            <div><code className="bg-white px-1 rounded">&lt;p&gt;...&lt;/p&gt;</code></div>
                            <div><code className="bg-white px-1 rounded">&lt;h1&gt;...&lt;/h1&gt;</code></div>
                            <div><code className="bg-white px-1 rounded">&lt;b&gt;...&lt;/b&gt;</code></div>
                            <div><code className="bg-white px-1 rounded">&lt;a&gt;...&lt;/a&gt;</code></div>
                            <div><code className="bg-white px-1 rounded">&lt;div&gt;...&lt;/div&gt;</code></div>
                            <div><code className="bg-white px-1 rounded">&lt;table&gt;...&lt;/table&gt;</code></div>
                        </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <h4 className="text-sm font-bold text-orange-700 mb-2">Empty Tags (Self-closing)</h4>
                        <p className="text-xs text-gray-600 mb-2">No closing tag, no content inside.</p>
                        <div className="space-y-1 text-xs text-gray-700">
                            <div><code className="bg-white px-1 rounded">&lt;br&gt;</code> — Line break</div>
                            <div><code className="bg-white px-1 rounded">&lt;hr&gt;</code> — Horizontal rule</div>
                            <div><code className="bg-white px-1 rounded">&lt;img&gt;</code> — Image</div>
                            <div><code className="bg-white px-1 rounded">&lt;input&gt;</code> — Input field</div>
                            <div><code className="bg-white px-1 rounded">&lt;meta&gt;</code> — Metadata</div>
                            <div><code className="bg-white px-1 rounded">&lt;link&gt;</code> — External resource</div>
                        </div>
                    </div>
                </div>
                <Code code={`<!-- Container Tag Example -->
<p>This paragraph has opening and closing tags.</p>

<!-- Empty Tag Examples -->
<br>
<hr>
<img src="image.jpg" alt="My Image">`} />
                <Task num={2}>Write an HTML page using at least 3 container tags and 3 empty tags. Label each with a comment identifying it as container or empty.</Task>
            </Section>

            {/* 3 */}
            <Section id="body-tag" title="3. Body Tag and Attributes">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;body&gt;</code> tag defines the main visible content of a web page. Everything displayed on screen goes inside this tag.</p>
                <Code code={`<body bgcolor="lightyellow" text="darkblue" 
      link="red" vlink="green" alink="orange"
      background="bg.jpg">
    <h1>Welcome to My Page</h1>
    <p>This is the body content.</p>
</body>`} />
                <AttrTable rows={[
                    ['bgcolor', 'Sets the background color of the page'],
                    ['text', 'Sets the default text color'],
                    ['background', 'Sets a background image'],
                    ['link', 'Color of unvisited links'],
                    ['vlink', 'Color of visited links'],
                    ['alink', 'Color of active (clicked) links'],
                    ['topmargin', 'Top margin of the page'],
                    ['leftmargin', 'Left margin of the page'],
                ]} />
                <Task num={3}>Create a page with <code className="bg-amber-100 px-1 rounded">bgcolor=&quot;lightyellow&quot;</code>, text color &quot;darkblue&quot;, and link color &quot;red&quot;. Add a heading, paragraph, and a link to google.com.</Task>
            </Section>

            {/* 4 */}
            <Section id="p-tag" title='4. <p> Tag and Its Attributes'>
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code> tag defines a paragraph. Browsers automatically add margin before and after each paragraph.</p>
                <Code code={`<p>This is a simple paragraph.</p>
<p align="center">This paragraph is center-aligned.</p>
<p align="right">This paragraph is right-aligned.</p>
<p align="justify">This paragraph text is justified. 
It stretches the text so each line has equal width.</p>`} />
                <AttrTable rows={[['align', 'left (default), center, right, justify']]} />
                <p><strong>Important:</strong> HTML ignores extra white spaces and line breaks in source code. Multiple spaces become one. Use <code className="bg-gray-100 px-1 rounded">&lt;br&gt;</code> for breaks and <code className="bg-gray-100 px-1 rounded">&amp;nbsp;</code> for extra spaces.</p>
                <Task num={4}>Create a page with 4 paragraphs — one with each alignment value (left, center, right, justify). Each paragraph should have at least 2 lines of text.</Task>
            </Section>

            {/* 5 */}
            <Section id="pre-tag" title="5. <pre> Tag">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;pre&gt;</code> tag defines preformatted text. It preserves spaces and line breaks exactly as written. Text is displayed in a fixed-width font (Courier).</p>
                <Code code={`<pre>
    Name        Age     City
    ----        ---     ----
    Rahul       20      Delhi
    Priya       22      Mumbai
    Amit        19      Jaipur
</pre>`} />
                <p>Unlike <code className="bg-gray-100 px-1 rounded">&lt;p&gt;</code>, the <code className="bg-gray-100 px-1 rounded">&lt;pre&gt;</code> tag does <strong>not collapse</strong> spaces or line breaks.</p>
                <Code code={`<p>This    has    extra    spaces.</p>
<!-- Browser shows: "This has extra spaces." -->

<pre>This    has    extra    spaces.</pre>
<!-- Browser shows: "This    has    extra    spaces." -->`} />
                <Task num={5}>Create an HTML page that displays a multiplication table (1 to 5) using the <code className="bg-amber-100 px-1 rounded">&lt;pre&gt;</code> tag. Columns should be properly aligned using spaces.</Task>
            </Section>

            {/* 6 */}
            <Section id="br-tag" title="6. <br> Tag">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;br&gt;</code> tag inserts a line break. It is an empty tag (no closing tag). Useful for addresses, poems, or anywhere you need a line break without a new paragraph.</p>
                <Code code={`<p>
    Knobly Education<br>
    123, Main Street<br>
    New Delhi - 110001<br>
    India
</p>

<!-- Poem example -->
<p>
    Twinkle twinkle little star,<br>
    How I wonder what you are.<br>
    Up above the world so high,<br>
    Like a diamond in the sky.
</p>`} />
                <div className="overflow-x-auto my-3">
                    <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead><tr className="bg-blue-50"><th className="text-left py-2 px-3 text-blue-700 border-b border-gray-200">&lt;br&gt;</th><th className="text-left py-2 px-3 text-blue-700 border-b border-gray-200">&lt;p&gt;</th></tr></thead>
                        <tbody>
                            <tr className="bg-white"><td className="py-2 px-3 border-b border-gray-100">Only adds a line break</td><td className="py-2 px-3 border-b border-gray-100">Adds line break with margin</td></tr>
                            <tr className="bg-gray-50"><td className="py-2 px-3 border-b border-gray-100">Empty tag (no closing)</td><td className="py-2 px-3 border-b border-gray-100">Container tag (has closing)</td></tr>
                            <tr className="bg-white"><td className="py-2 px-3">No extra spacing</td><td className="py-2 px-3">Adds space above and below</td></tr>
                        </tbody>
                    </table>
                </div>
                <Task num={6}>Write your school/college address using <code className="bg-amber-100 px-1 rounded">&lt;br&gt;</code>. Also write a short poem (4 lines) using <code className="bg-amber-100 px-1 rounded">&lt;br&gt;</code> for line breaks.</Task>
            </Section>

            {/* 7 */}
            <Section id="formatting" title="7. HTML Formatting Elements">
                <p>HTML provides several tags for formatting text:</p>
                <Code code={`<b>Bold Text</b>
<strong>Strong/Important Text</strong>
<i>Italic Text</i>
<em>Emphasized Text</em>
<u>Underlined Text</u>
<s>Strikethrough Text</s>
<del>Deleted Text</del>
<ins>Inserted Text</ins>
<mark>Highlighted Text</mark>
<small>Smaller Text</small>
<big>Bigger Text</big>
<sub>Subscript</sub> like H<sub>2</sub>O
<sup>Superscript</sup> like x<sup>2</sup>
<code>Inline Code</code>
<kbd>Keyboard Input</kbd>
<abbr title="HyperText Markup Language">HTML</abbr>
<blockquote>This is a blockquote.</blockquote>
<address>Contact: student@example.com</address>`} />
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 my-3">
                    <h4 className="text-sm font-bold text-purple-700 mb-2">Quick Reference:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;b&gt;</code> — <b>Bold</b></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;strong&gt;</code> — <strong>Strong</strong></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;i&gt;</code> — <i>Italic</i></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;em&gt;</code> — <em>Emphasized</em></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;u&gt;</code> — <u>Underline</u></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;del&gt;</code> — <del>Deleted</del></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;mark&gt;</code> — <mark>Highlighted</mark></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;small&gt;</code> — <small>Small</small></div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;sub&gt;</code> — H<sub>2</sub>O</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;sup&gt;</code> — x<sup>2</sup></div>
                    </div>
                </div>
                <Task num={7}>Create a page demonstrating ALL formatting tags. Write H₂O using sub and a²+b²=c² using sup tags.</Task>
            </Section>

            {/* 8 */}
            <Section id="heading-tag" title="8. Heading Tags (h1-h6)">
                <p>HTML provides six levels of headings. <code className="bg-gray-100 px-1 rounded">&lt;h1&gt;</code> is the largest and most important, <code className="bg-gray-100 px-1 rounded">&lt;h6&gt;</code> is the smallest.</p>
                <Code code={`<h1>Heading 1 - Most Important</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6 - Least Important</h6>

<h1 align="center">Centered Heading</h1>
<h2 align="right">Right-aligned Heading</h2>`} />
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 my-3 space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">H1 Heading</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">H2 Heading</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-700">H3 Heading</p>
                    <p className="text-base sm:text-lg font-bold text-gray-700">H4 Heading</p>
                    <p className="text-sm font-bold text-gray-600">H5 Heading</p>
                    <p className="text-xs font-bold text-gray-500">H6 Heading</p>
                </div>
                <p><strong>Rules:</strong> Use only one <code className="bg-gray-100 px-1 rounded">&lt;h1&gt;</code> per page. Do not skip heading levels. Headings help SEO.</p>
                <Task num={8}>Create a page for your school: School Name (h1 centered), Department (h2), Course (h3), Subjects (h4), Topics (h5), Sub-topics (h6).</Task>
            </Section>

            {/* 9 */}
            <Section id="img-tag" title="9. <img> Tag and Attributes">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;img&gt;</code> tag embeds images. It is a self-closing (empty) tag.</p>
                <Code code={`<img src="photo.jpg" alt="A photo" width="300" height="200">

<!-- Image with border -->
<img src="pic.jpg" alt="Picture" border="2">

<!-- Image as a link -->
<a href="https://knoblyweb.in">
    <img src="logo.png" alt="Knobly" width="100">
</a>

<!-- Image with text wrap -->
<img src="photo.jpg" alt="Photo" align="left" hspace="10" vspace="10">
<p>This text wraps around the image.</p>`} />
                <AttrTable rows={[
                    ['src', 'Path/URL of the image (required)'],
                    ['alt', 'Alternative text if image fails (required)'],
                    ['width', 'Width in pixels or percentage'],
                    ['height', 'Height in pixels or percentage'],
                    ['border', 'Border around the image'],
                    ['align', 'left, right, top, middle, bottom'],
                    ['hspace', 'Horizontal space around image'],
                    ['vspace', 'Vertical space around image'],
                ]} />
                <Task num={9}>Create a page with 3 images: one left-aligned with text wrapping, one centered, and one as a clickable link. Set proper alt text for all.</Task>
            </Section>

            {/* 10 */}
            <Section id="anchor-tag" title="10. <a> Anchor Tag">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;a&gt;</code> tag creates hyperlinks.</p>
                <Code code={`<!-- External link -->
<a href="https://www.google.com">Visit Google</a>

<!-- Open in new tab -->
<a href="https://www.google.com" target="_blank">Open in New Tab</a>

<!-- Email link -->
<a href="mailto:info@knoblyweb.in">Send Email</a>

<!-- Phone link -->
<a href="tel:+919876543210">Call Us</a>

<!-- Bookmark link (same page) -->
<a href="#section3">Jump to Section 3</a>
...
<h2 id="section3">Section 3</h2>

<!-- Download link -->
<a href="notes.pdf" download>Download Notes</a>`} />
                <AttrTable rows={[
                    ['href', 'URL of the link destination (required)'],
                    ['target', '_self (same tab), _blank (new tab), _parent, _top'],
                    ['title', 'Tooltip text on hover'],
                    ['download', 'Downloads file instead of navigating'],
                    ['name', 'Name of anchor (for bookmarks)'],
                ]} />
                <Task num={10}>Create a page with 5 link types: external, internal, email, phone, and a bookmark link that jumps to a section on the same page.</Task>
            </Section>

            {/* 11 */}
            <Section id="list-tags" title="11. List Tags (ul, ol, dl)">
                <p>HTML supports three types of lists:</p>
                <h4 className="text-sm font-bold text-blue-700 mt-2">A. Unordered List (&lt;ul&gt;)</h4>
                <Code code={`<ul>
    <li>Apple</li>
    <li>Banana</li>
    <li>Cherry</li>
</ul>

<!-- Types: disc (default), circle, square -->
<ul type="circle">
    <li>Circle bullet</li>
</ul>

<!-- Nested list -->
<ul>
    <li>Fruits
        <ul type="circle">
            <li>Apple</li>
            <li>Mango</li>
        </ul>
    </li>
</ul>`} />
                <h4 className="text-sm font-bold text-blue-700 mt-2">B. Ordered List (&lt;ol&gt;)</h4>
                <Code code={`<ol>
    <li>First</li>
    <li>Second</li>
    <li>Third</li>
</ol>

<!-- Types: 1, A, a, I, i -->
<ol type="A"><li>Uppercase letters</li></ol>
<ol type="i"><li>Lowercase Roman</li></ol>
<ol start="5"><li>Starts from 5</li></ol>`} />
                <h4 className="text-sm font-bold text-blue-700 mt-2">C. Description List (&lt;dl&gt;)</h4>
                <Code code={`<dl>
    <dt>HTML</dt>
    <dd>HyperText Markup Language</dd>
    <dt>CSS</dt>
    <dd>Cascading Style Sheets</dd>
</dl>`} />
                <Task num={11}>Create: (a) Nested unordered list of favorite foods by category, (b) Ordered list of steps to make tea using Roman numerals, (c) Description list of 5 computer terms.</Task>
            </Section>

            {/* 12 */}
            <Section id="table-tag" title="12. Table Tag and Attributes">
                <p>Tables arrange data into rows and columns.</p>
                <Code code={`<table border="1" cellpadding="8" cellspacing="0" width="100%">
    <caption>Student Marks Sheet</caption>
    <tr bgcolor="#0ea5e9">
        <th>Roll No</th><th>Name</th>
        <th>Hindi</th><th>English</th><th>Math</th>
    </tr>
    <tr align="center">
        <td>1</td><td>Rahul</td>
        <td>85</td><td>90</td><td>95</td>
    </tr>
    <tr align="center" bgcolor="#f0f9ff">
        <td>2</td><td>Priya</td>
        <td>78</td><td>88</td><td>82</td>
    </tr>
</table>

<!-- Colspan & Rowspan -->
<table border="1">
    <tr><th colspan="3">Student Info</th></tr>
    <tr>
        <td rowspan="2">India</td>
        <td>Delhi</td><td>28°C</td>
    </tr>
    <tr><td>Mumbai</td><td>32°C</td></tr>
</table>`} />
                <AttrTable rows={[
                    ['border', 'Border width in pixels'],
                    ['cellpadding', 'Space between content and border'],
                    ['cellspacing', 'Space between cells'],
                    ['width', 'Table width (px or %)'],
                    ['bgcolor', 'Background color'],
                    ['colspan', 'Merge columns horizontally'],
                    ['rowspan', 'Merge rows vertically'],
                    ['align', 'left, center, right'],
                ]} />
                <Task num={12}>Create a marksheet for 5 students: Roll No, Name, Hindi, English, Math, Science, Total, Percentage. Use colspan for title and bgcolor for alternate rows.</Task>
            </Section>

            {/* 13 */}
            <Section id="form-tag" title="13. Form Tag and Elements">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;form&gt;</code> tag collects user input.</p>
                <Code code={`<form action="/submit" method="POST">
    <label>Name:</label><br>
    <input type="text" name="name" placeholder="Enter name" 
           size="30" maxlength="50"><br><br>

    <label>Password:</label><br>
    <input type="password" name="password"><br><br>

    <label>Email:</label><br>
    <input type="email" name="email"><br><br>

    <p>Gender:</p>
    <input type="radio" name="gender" value="male"> Male
    <input type="radio" name="gender" value="female"> Female

    <p>Hobbies:</p>
    <input type="checkbox" value="coding"> Coding
    <input type="checkbox" value="reading"> Reading

    <br><br><label>Course:</label>
    <select name="course">
        <option value="">-- Select --</option>
        <option value="olevel">O-Level</option>
        <option value="ccc">CCC</option>
    </select>

    <br><br><label>Message:</label><br>
    <textarea rows="4" cols="40"></textarea>

    <br><br>
    <input type="file"><br><br>
    <input type="color" value="#22d3ee">
    <input type="range" min="1" max="10">
    <br><br>
    <input type="submit" value="Submit">
    <input type="reset" value="Reset">
</form>`} />
                <AttrTable rows={[
                    ['action', 'URL where form data is sent'],
                    ['method', 'GET (in URL) or POST (in body)'],
                    ['enctype', 'Encoding type (for file uploads)'],
                ]} />
                <Task num={13}>Create a Student Registration Form: Name, Email, Password, DOB (date), Gender (radio), Course (dropdown with 5 options), Hobbies (checkboxes), Photo (file), Address (textarea), Submit & Reset buttons.</Task>
            </Section>

            {/* 14 */}
            <Section id="div-span" title="14. <div> and <span> Tags">
                <p><code className="bg-gray-100 px-1 rounded">&lt;div&gt;</code> is a block-level container. <code className="bg-gray-100 px-1 rounded">&lt;span&gt;</code> is an inline container.</p>
                <Code code={`<!-- div - Block level -->
<div style="background:#eee; padding:20px; margin:10px 0;">
    <h2>Section Title</h2>
    <p>Content in a div.</p>
</div>

<!-- span - Inline -->
<p>My name is <span style="color:blue; font-weight:bold;">
Rahul</span> and I study <span style="color:orange;">
Computer Science</span>.</p>`} />
                <div className="overflow-x-auto my-3">
                    <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead><tr className="bg-blue-50"><th className="py-2 px-3 text-left text-blue-700 border-b border-gray-200">Feature</th><th className="py-2 px-3 text-left text-blue-700 border-b border-gray-200">&lt;div&gt;</th><th className="py-2 px-3 text-left text-blue-700 border-b border-gray-200">&lt;span&gt;</th></tr></thead>
                        <tbody>
                            <tr className="bg-white"><td className="py-2 px-3 border-b border-gray-100 font-medium">Type</td><td className="py-2 px-3 border-b border-gray-100">Block-level</td><td className="py-2 px-3 border-b border-gray-100">Inline</td></tr>
                            <tr className="bg-gray-50"><td className="py-2 px-3 border-b border-gray-100 font-medium">Width</td><td className="py-2 px-3 border-b border-gray-100">Full width</td><td className="py-2 px-3 border-b border-gray-100">Content width</td></tr>
                            <tr className="bg-white"><td className="py-2 px-3 border-b border-gray-100 font-medium">New Line</td><td className="py-2 px-3 border-b border-gray-100">Yes</td><td className="py-2 px-3 border-b border-gray-100">No</td></tr>
                            <tr className="bg-gray-50"><td className="py-2 px-3 font-medium">Use</td><td className="py-2 px-3">Group sections</td><td className="py-2 px-3">Style inline text</td></tr>
                        </tbody>
                    </table>
                </div>
                <Task num={14}>Create a page with 3 div sections (header, content, footer) with different background colors. Use span to highlight words inside the content div.</Task>
            </Section>

            {/* 15 */}
            <Section id="semantic" title="15. HTML5 Semantic Elements">
                <p>Semantic elements describe their meaning clearly, helping browsers and search engines understand page structure.</p>
                <Code code={`<header>
    <nav>
        <a href="/">Home</a> | 
        <a href="/about">About</a>
    </nav>
</header>
<main>
    <article>
        <h1>Article Title</h1>
        <p>Content...</p>
    </article>
    <section>
        <h2>Section Title</h2>
    </section>
    <aside>
        <h3>Related Links</h3>
    </aside>
</main>
<footer>
    <p>&copy; 2025 Knobly Education</p>
</footer>`} />
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 my-3">
                    <h4 className="text-sm font-bold text-teal-700 mb-2">Semantic Tags:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;header&gt;</code> — Page header</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;nav&gt;</code> — Navigation</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;main&gt;</code> — Main content</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;article&gt;</code> — Independent content</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;section&gt;</code> — Thematic group</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;aside&gt;</code> — Sidebar</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;footer&gt;</code> — Page footer</div>
                        <div><code className="bg-white px-1 rounded text-red-600">&lt;figure&gt;</code> — Image + caption</div>
                    </div>
                </div>
                <Task num={15}>Create a complete webpage using ONLY semantic elements: header with nav, main with article and aside, and footer. No div tags allowed.</Task>
            </Section>

            {/* 16 */}
            <Section id="audio-video" title="16. Audio and Video Tags">
                <p>HTML5 supports audio and video directly.</p>
                <Code code={`<!-- Audio -->
<audio controls>
    <source src="song.mp3" type="audio/mpeg">
    Browser does not support audio.
</audio>

<!-- Video -->
<video width="640" height="360" controls poster="thumb.jpg">
    <source src="video.mp4" type="video/mp4">
    Browser does not support video.
</video>

<!-- YouTube Embed -->
<iframe width="560" height="315" 
    src="https://www.youtube.com/embed/VIDEO_ID"
    allowfullscreen></iframe>`} />
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 my-3">
                    <h4 className="text-sm font-bold text-indigo-700 mb-2">Attributes:</h4>
                    <div className="space-y-1 text-xs text-gray-700">
                        <div><code className="bg-white px-1 rounded text-red-600">controls</code> — Show play/pause buttons</div>
                        <div><code className="bg-white px-1 rounded text-red-600">autoplay</code> — Auto-start playing</div>
                        <div><code className="bg-white px-1 rounded text-red-600">loop</code> — Repeat playback</div>
                        <div><code className="bg-white px-1 rounded text-red-600">muted</code> — Start muted</div>
                        <div><code className="bg-white px-1 rounded text-red-600">poster</code> — Video thumbnail image</div>
                    </div>
                </div>
                <Task num={16}>Create a multimedia page with an audio player, a video player with controls and poster, and an embedded YouTube video.</Task>
            </Section>

            {/* 17 */}
            <Section id="iframe-tag" title="17. <iframe> Tag">
                <p>The <code className="bg-gray-100 px-1 rounded">&lt;iframe&gt;</code> tag embeds another HTML page within the current page.</p>
                <Code code={`<!-- Embed a webpage -->
<iframe src="https://www.example.com" 
    width="600" height="400"></iframe>

<!-- Embed Google Maps -->
<iframe src="https://www.google.com/maps/embed?pb=..."
    width="600" height="450" 
    style="border:0;" allowfullscreen 
    loading="lazy"></iframe>

<!-- Link targeting iframe -->
<iframe src="page.html" name="myframe" 
    width="100%" height="500"></iframe>
<a href="page2.html" target="myframe">Load Page 2</a>`} />
                <Task num={17}>Create a page with an iframe that loads a website. Add 3 links that load different pages into the same iframe using target and name attributes.</Task>
            </Section>

            {/* 18 */}
            <Section id="entities" title="18. HTML Entities (Special Characters)">
                <p>Reserved characters in HTML must be displayed using entities.</p>
                <div className="overflow-x-auto my-3">
                    <table className="w-full text-xs sm:text-sm border border-gray-200 rounded-lg overflow-hidden">
                        <thead><tr className="bg-blue-50"><th className="py-2 px-2 sm:px-3 text-left text-blue-700 border-b border-gray-200">Char</th><th className="py-2 px-2 sm:px-3 text-left text-blue-700 border-b border-gray-200">Entity</th><th className="py-2 px-2 sm:px-3 text-left text-blue-700 border-b border-gray-200">Code</th><th className="py-2 px-2 sm:px-3 text-left text-blue-700 border-b border-gray-200">Description</th></tr></thead>
                        <tbody>
                            {[['<', '&lt;', '&#60;', 'Less than'], ['>', '&gt;', '&#62;', 'Greater than'], ['&', '&amp;', '&#38;', 'Ampersand'], ['"', '&quot;', '&#34;', 'Double quote'], [' ', '&nbsp;', '&#160;', 'Non-breaking space'], ['©', '&copy;', '&#169;', 'Copyright'], ['®', '&reg;', '&#174;', 'Registered'], ['™', '&trade;', '&#8482;', 'Trademark'], ['₹', '&#8377;', '&#8377;', 'Rupee'], ['♥', '&hearts;', '&#9829;', 'Heart'], ['→', '&rarr;', '&#8594;', 'Right arrow'], ['★', '&#9733;', '&#9733;', 'Star']].map(([c, e, n, d], i) => (
                                <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="py-2 px-2 sm:px-3 border-b border-gray-100 text-lg">{c}</td>
                                    <td className="py-2 px-2 sm:px-3 border-b border-gray-100"><code className="text-red-600 text-xs">{e}</code></td>
                                    <td className="py-2 px-2 sm:px-3 border-b border-gray-100"><code className="text-red-600 text-xs">{n}</code></td>
                                    <td className="py-2 px-2 sm:px-3 border-b border-gray-100 text-gray-600">{d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Code code={`<p>5 &lt; 10 and 10 &gt; 5</p>
<p>Price: &#8377;500</p>
<p>&copy; 2025 Knobly Education</p>
<p>I &hearts; HTML</p>`} />
                <Task num={18}>Display all entities from the table above. Also write: 5 &lt; 10 &amp; 10 &gt; 5 using proper HTML entities.</Task>
            </Section>
        </SidebarLayout>
    );
}
