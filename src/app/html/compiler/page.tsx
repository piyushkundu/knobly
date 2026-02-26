'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Home, RotateCcw, Download, Maximize2, Minimize2,
    Copy, Check, Smartphone, Monitor, Tablet, Code2, Eye, Sparkles,
    ChevronDown,
} from 'lucide-react';

const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 12px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    p {
      font-size: 1.1em;
      opacity: 0.9;
      line-height: 1.6;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85em;
      margin-top: 20px;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello from Knobly!</h1>
    <p>Edit the code on the left to see your changes appear here in real-time. Try modifying colors, text, or adding new elements!</p>
    <span class="badge">✨ Live Preview Active</span>
  </div>
</body>
</html>`;

const TEMPLATES = [
    {
        name: 'Starter',
        code: DEFAULT_CODE,
    },
    {
        name: 'Profile Card',
        code: `<!DOCTYPE html>
<html><head><style>
body { font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f4f8; margin: 0; }
.card { background: white; border-radius: 20px; padding: 40px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.1); max-width: 350px; }
.avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: white; }
h2 { color: #1a202c; margin-bottom: 4px; }
.role { color: #718096; font-size: 14px; margin-bottom: 20px; }
.stats { display: flex; gap: 20px; justify-content: center; }
.stat { text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; color: #667eea; }
.stat-label { font-size: 11px; color: #a0aec0; text-transform: uppercase; }
</style></head><body>
<div class="card">
  <div class="avatar">👨‍💻</div>
  <h2 id="your-name">Your Name</h2>
  <p class="role">Web Developer</p>
  <div class="stats">
    <div class="stat"><div class="stat-num">42</div><div class="stat-label">Projects</div></div>
    <div class="stat"><div class="stat-num">1.2k</div><div class="stat-label">Followers</div></div>
    <div class="stat"><div class="stat-num">89</div><div class="stat-label">Stars</div></div>
  </div>
</div>
</body></html>`,
    },
    {
        name: 'Login Form',
        code: `<!DOCTYPE html>
<html><head><style>
body { font-family: 'Segoe UI', sans-serif; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a, #1e293b); }
.form-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; width: 350px; backdrop-filter: blur(20px); }
h2 { color: white; text-align: center; margin-bottom: 30px; }
label { color: #94a3b8; font-size: 13px; display: block; margin-bottom: 6px; }
input { width: 100%; padding: 12px 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; background: rgba(255,255,255,0.05); color: white; font-size: 14px; margin-bottom: 20px; outline: none; box-sizing: border-box; }
input:focus { border-color: #667eea; }
button { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
button:hover { opacity: 0.9; }
.footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 13px; }
a { color: #818cf8; text-decoration: none; }
</style></head><body>
<div class="form-box">
  <h2 id="welcome-back">Welcome Back</h2>
  <label>Email</label>
  <input type="email" placeholder="you@example.com">
  <label>Password</label>
  <input type="password" placeholder="••••••••">
  <button>Sign In</button>
  <p class="footer">Don't have an account? <a href="#">Sign Up</a></p>
</div>
</body></html>`,
    },
    {
        name: 'Table',
        code: `<!DOCTYPE html>
<html><head><style>
body { font-family: 'Segoe UI', sans-serif; padding: 30px; background: #f8fafc; margin: 0; }
h2 { color: #1e293b; margin-bottom: 16px; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
th { background: #3b82f6; color: white; padding: 14px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #f0f9ff; }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
.pass { background: #dcfce7; color: #166534; }
.fail { background: #fee2e2; color: #991b1b; }
</style></head><body>
<h2 id="student-results">Student Results</h2>
<table>
  <tr><th>Roll No</th><th>Name</th><th>Subject</th><th>Marks</th><th>Status</th></tr>
  <tr><td>1</td><td>Rahul</td><td>HTML</td><td>92</td><td><span class="badge pass">Pass</span></td></tr>
  <tr><td>2</td><td>Priya</td><td>HTML</td><td>85</td><td><span class="badge pass">Pass</span></td></tr>
  <tr><td>3</td><td>Amit</td><td>HTML</td><td>28</td><td><span class="badge fail">Fail</span></td></tr>
  <tr><td>4</td><td>Neha</td><td>HTML</td><td>76</td><td><span class="badge pass">Pass</span></td></tr>
  <tr><td>5</td><td>Karan</td><td>HTML</td><td>95</td><td><span class="badge pass">Pass</span></td></tr>
</table>
</body></html>`,
    },
    {
        name: 'Empty Page',
        code: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>

</body>
</html>`,
    },
];

const QUICK_KEYS = ['<', '>', '/', '"', '=', ' ', '{', '}', '(', ')', ';', ':'];

export default function HtmlCompiler() {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [copied, setCopied] = useState(false);
    const [previewSize, setPreviewSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [fullscreen, setFullscreen] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [lineCount, setLineCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLineCount(code.split('\n').length);
    }, [code]);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        a.click();
        URL.revokeObjectURL(url);
    }, [code]);

    const insertKey = useCallback((key: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = code.substring(0, start);
        const after = code.substring(end);
        const newCode = before + key + after;
        setCode(newCode);
        requestAnimationFrame(() => {
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + key.length;
        });
    }, [code]);

    const handleTab = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertKey('  ');
        }
    }, [insertKey]);

    const handleScroll = useCallback(() => {
        if (textareaRef.current && lineNumRef.current) {
            lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    const previewWidth = previewSize === 'mobile' ? 'max-w-[375px]' : previewSize === 'tablet' ? 'max-w-[768px]' : 'max-w-full';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ color: '#1f2937' }}>
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/html" className="text-gray-400 hover:text-gray-900 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Code2 size={12} className="text-white" />
                            </div>
                            <h1 className="text-xs sm:text-sm font-bold text-gray-900">HTML Compiler</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5">
                        {/* Templates */}
                        <div className="relative">
                            <button
                                onClick={() => setShowTemplates(!showTemplates)}
                                className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 sm:px-3 py-1.5 rounded-lg border border-purple-200 transition-colors"
                            >
                                <Sparkles size={12} />
                                <span className="hidden sm:inline">Templates</span>
                                <ChevronDown size={10} />
                            </button>
                            {showTemplates && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowTemplates(false)} />
                                    <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-1 w-44">
                                        {TEMPLATES.map((t) => (
                                            <button
                                                key={t.name}
                                                onClick={() => { setCode(t.code); setShowTemplates(false); }}
                                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Copy */}
                        <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
                            {copied ? <><Check size={12} className="text-emerald-600" /><span className="hidden sm:inline text-emerald-600">Copied</span></> : <><Copy size={12} /><span className="hidden sm:inline">Copy</span></>}
                        </button>

                        {/* Download */}
                        <button onClick={handleDownload} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
                            <Download size={12} /><span className="hidden sm:inline">Download</span>
                        </button>

                        {/* Clear */}
                        <button onClick={() => setCode('')} className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2 sm:px-3 py-1.5 rounded-lg border border-red-200 transition-colors">
                            <RotateCcw size={12} /><span className="hidden sm:inline">Clear</span>
                        </button>

                        <Link href="/" className="text-gray-400 hover:text-gray-900 p-1.5"><Home size={16} /></Link>
                    </div>
                </div>
            </header>

            {/* Main split view */}
            <div className={`flex-1 grid ${fullscreen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} min-h-0`}>
                {/* Editor */}
                {!fullscreen && (
                    <div className="flex flex-col border-r border-gray-200 min-h-0 bg-[#1e1e2e]">
                        {/* Editor toolbar */}
                        <div className="px-3 py-1.5 bg-[#181825] border-b border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono ml-2">index.html</span>
                            </div>
                            <span className="text-[10px] text-gray-600">{lineCount} lines</span>
                        </div>

                        {/* Code area with line numbers */}
                        <div className="flex-1 flex min-h-0 overflow-hidden">
                            {/* Line numbers */}
                            <div
                                ref={lineNumRef}
                                className="w-10 sm:w-12 bg-[#181825] text-right pr-2 pt-3 overflow-hidden select-none shrink-0"
                            >
                                {Array.from({ length: lineCount }, (_, i) => (
                                    <div key={i} className="text-[11px] leading-[1.6] text-gray-600 font-mono">{i + 1}</div>
                                ))}
                            </div>

                            {/* Textarea */}
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onScroll={handleScroll}
                                onKeyDown={handleTab}
                                className="flex-1 w-full p-3 pl-2 bg-transparent text-[13px] leading-[1.6] resize-none focus:outline-none font-mono"
                                style={{ color: '#cdd6f4', caretColor: '#89b4fa', tabSize: 2 }}
                                spellCheck={false}
                                autoComplete="off"
                                autoCorrect="off"
                            />
                        </div>

                        {/* Mobile quick keys */}
                        <div className="flex md:hidden gap-1 px-2 py-1.5 bg-[#181825] border-t border-gray-700/50 overflow-x-auto">
                            {QUICK_KEYS.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => insertKey(key)}
                                    className="shrink-0 w-8 h-8 rounded-md bg-gray-700 text-gray-200 text-sm font-mono hover:bg-gray-600 active:scale-95 transition-all flex items-center justify-center"
                                >
                                    {key === ' ' ? '␣' : key}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Preview */}
                <div className="flex flex-col min-h-0 bg-white">
                    {/* Preview toolbar */}
                    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye size={12} className="text-emerald-500" />
                            <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold">Preview</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Viewport switcher */}
                            <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                {([
                                    { key: 'mobile' as const, icon: Smartphone, size: 12 },
                                    { key: 'tablet' as const, icon: Tablet, size: 13 },
                                    { key: 'desktop' as const, icon: Monitor, size: 13 },
                                ]).map(({ key, icon: Ic, size }) => (
                                    <button
                                        key={key}
                                        onClick={() => setPreviewSize(key)}
                                        className={`p-1.5 rounded-md transition-all ${previewSize === key ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <Ic size={size} />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setFullscreen(!fullscreen)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-1"
                            >
                                {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Iframe */}
                    <div className="flex-1 flex items-start justify-center bg-gray-100 p-0 md:p-2 overflow-auto">
                        <div className={`w-full ${previewWidth} h-full ${previewSize !== 'desktop' ? 'mx-auto shadow-xl rounded-lg overflow-hidden border border-gray-200' : ''}`}>
                            <iframe
                                srcDoc={code}
                                className="w-full h-full bg-white"
                                style={{ minHeight: 'calc(100vh - 90px)' }}
                                sandbox="allow-scripts"
                                title="HTML Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
