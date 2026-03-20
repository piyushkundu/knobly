'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Star, Download, Save, Search, Code2, Play, Copy, Pencil, Eye, EyeOff, Sparkles, Pin, ChevronDown, Check, FolderOpen, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedCodeItem } from '@/types/python';
import { formatTimestamp, truncateCode } from '@/lib/python-utils';

// Predefined tags
const AVAILABLE_TAGS = ['loops', 'input', 'list', 'string', 'function', 'class', 'project', 'math', 'file', 'dictionary'];
const AVAILABLE_FOLDERS = ['', 'Practice', 'Projects', 'School', 'Experiments'];

// Simple Python syntax highlighter
function highlightPython(code: string): string {
  const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|and|or|not|in|is|True|False|None|pass|break|continue|raise|global|nonlocal|assert|del|print|input|range|len|int|str|float|list|dict|set|tuple|type|map|filter|zip|enumerate|sorted|reversed|open|super|self)\b/g;
  const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const comments = /(#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const decorators = /(@\w+)/g;

  // Escape HTML first
  let highlighted = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Apply highlighting in order of priority
  const tokens: { start: number; end: number; html: string }[] = [];
  
  // We'll do a simple replacement approach
  highlighted = highlighted
    .replace(comments, '<span style="color:#6b7280;font-style:italic">$1</span>')
    .replace(strings, '<span style="color:#059669">$1</span>')
    .replace(keywords, '<span style="color:#7c3aed;font-weight:600">$1</span>')
    .replace(numbers, '<span style="color:#d97706">$1</span>')
    .replace(decorators, '<span style="color:#0891b2">$1</span>');
  
  return highlighted;
}

// Relative time helper
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface SavedCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  codes: SavedCodeItem[];
  isLoading: boolean;
  onSave: (title: string, code: string, tags?: string[], folder?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleImportant: (id: string) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Pick<SavedCodeItem, 'title' | 'code' | 'tags' | 'folder' | 'isImportant'>>) => Promise<void>;
  onSelect: (code: string) => void;
  onRun?: (code: string) => void;
  onExplain?: (code: string) => void;
  currentCode: string;
  initialShowSaveInput?: boolean;
}

export function SavedCodesModal({
  isOpen,
  onClose,
  codes,
  isLoading,
  onSave,
  onDelete,
  onToggleImportant,
  onUpdate,
  onSelect,
  onRun,
  onExplain,
  currentCode,
  initialShowSaveInput,
}: SavedCodesModalProps) {
  const [filter, setFilter] = useState<'all' | 'important' | string>('all');
  const [folderFilter, setFolderFilter] = useState('');
  const [saveTitle, setSaveTitle] = useState('');
  const [saveTags, setSaveTags] = useState<string[]>([]);
  const [saveFolder, setSaveFolder] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveInput, setShowSaveInput] = useState(initialShowSaveInput || false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowSaveInput(initialShowSaveInput || false);
      setSaveTitle('');
      setSaveTags([]);
      setSaveFolder('');
      setExpandedCodeId(null);
      setEditingId(null);
      setLongPressId(null);
    }
  }, [isOpen, initialShowSaveInput]);

  // Get all unique tags from codes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    codes.forEach(c => c.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [codes]);

  // Get all unique folders from codes
  const allFolders = useMemo(() => {
    const folderSet = new Set<string>();
    codes.forEach(c => { if (c.folder) folderSet.add(c.folder); });
    AVAILABLE_FOLDERS.forEach(f => { if (f) folderSet.add(f); });
    return Array.from(folderSet);
  }, [codes]);

  const filteredCodes = useMemo(() => {
    let result = codes;
    if (filter === 'important') result = result.filter(c => c.isImportant);
    else if (filter !== 'all') result = result.filter(c => c.tags?.includes(filter));
    if (folderFilter) result = result.filter(c => c.folder === folderFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q)) ||
        c.folder?.toLowerCase().includes(q)
      );
    }
    // Pin important ones to top
    return [...result].sort((a, b) => {
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [codes, filter, folderFilter, searchQuery]);

  // Stats
  const lastSaved = codes.length > 0 ? relativeTime(codes.reduce((latest, c) => c.createdAt > latest ? c.createdAt : latest, codes[0].createdAt)) : 'Never';

  const handleSave = async () => {
    if (!currentCode.trim()) return;
    setIsSaving(true);
    await onSave(saveTitle || `Code ${new Date().toLocaleString()}`, currentCode, saveTags, saveFolder);
    setSaveTitle('');
    setSaveTags([]);
    setSaveFolder('');
    setShowSaveInput(false);
    setIsSaving(false);
  };

  const handleCopy = useCallback(async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const handleStartEdit = (item: SavedCodeItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (onUpdate && editTitle.trim()) {
      await onUpdate(id, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const toggleSaveTag = (tag: string) => {
    setSaveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Long press for mobile
  const handleTouchStart = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressId(id);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDownloadPDF = () => {
    const codesToExport = filter === 'important' ? codes.filter(c => c.isImportant) : codes;
    if (codesToExport.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>My Saved Codes — Knobly Python Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; background: #fff; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #6366f1; }
    .header h1 { font-size: 28px; color: #312e81; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #64748b; }
    .code-block { margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; page-break-inside: avoid; }
    .code-header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
    .code-header h3 { font-size: 15px; font-weight: 700; }
    .code-header .meta { font-size: 11px; opacity: 0.85; }
    .code-header .star { color: #fbbf24; margin-left: 8px; }
    .code-body { padding: 16px 20px; background: #f8fafc; }
    .code-body pre { font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-break: break-all; color: #334155; }
    .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
    @media print { body { padding: 20px; } .code-block { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐍 My Saved Codes</h1>
    <p>Knobly Python Lab • ${filter === 'important' ? 'Important Codes' : 'All Codes'} • ${codesToExport.length} code${codesToExport.length !== 1 ? 's' : ''} • ${new Date().toLocaleDateString()}</p>
  </div>
  ${codesToExport.map((c, i) => `
    <div class="code-block">
      <div class="code-header">
        <h3>#${i + 1} ${c.title}${c.isImportant ? ' <span class="star">⭐</span>' : ''}</h3>
        <span class="meta">${new Date(c.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="code-body">
        <pre>${c.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
      </div>
    </div>
  `).join('')}
  <div class="footer">Generated by Knobly Python Lab — knoblyweb.in</div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-2 sm:inset-4 md:inset-auto md:top-[3%] md:left-1/2 md:-translate-x-1/2 md:w-[680px] md:max-h-[94vh] bg-white border border-gray-200 rounded-2xl z-[201] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* ═══════ HEADER ═══════ */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 shrink-0 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 drop-shadow-md">
                    <path fill="#FFCA28" d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z"/>
                    <path fill="#FFD54F" d="M20,8H4v10h16V8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[15px] sm:text-[16px] font-black tracking-wide drop-shadow-sm !text-white !opacity-100 m-0">My Saved Codes</h2>
                  <span className="text-[10px] sm:text-[11px] font-semibold !text-white/90 m-0 block">{codes.length} code{codes.length !== 1 ? 's' : ''} saved</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 relative z-10">
                <button
                  onClick={handleDownloadPDF}
                  disabled={codes.length === 0}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold !bg-red-600 !text-white shadow-[0_4px_16px_rgba(239,68,68,0.5)] border border-red-500 hover:!bg-red-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl !bg-black/20 hover:!bg-black/30 transition-all backdrop-blur-md border border-white/10 hover:border-white/30 shadow-sm flex items-center justify-center group"
                  title="Close"
                >
                  <X className="w-5 h-5 !text-white !stroke-white group-hover:scale-110 transition-transform stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* ═══════ STATS BAR ═══════ */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                <span className="text-indigo-500 font-bold">📊</span>
                <span className="text-gray-500">Total:</span>
                <span className="font-bold text-gray-800">{codes.length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                <span className="text-green-500 font-bold">🕐</span>
                <span className="text-gray-500">Last:</span>
                <span className="font-bold text-gray-800">{lastSaved}</span>
              </div>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                <span>⭐</span>
                <span className="text-gray-500">Important:</span>
                <span className="font-bold text-amber-600">{codes.filter(c => c.isImportant).length}</span>
              </div>
              <div className="w-px h-4 bg-gray-200 shrink-0" />
              <div className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                <span>🐍</span>
                <span className="font-bold text-purple-600">Python</span>
              </div>
            </div>

            {/* ═══════ SAVE NEW + SEARCH + FILTERS ═══════ */}
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 space-y-2.5 shrink-0 bg-white">
              {/* Save New Code */}
              {showSaveInput ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={saveTitle}
                      onChange={e => setSaveTitle(e.target.value)}
                      placeholder="Code title (e.g. Fibonacci Series)"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                    />
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !currentCode.trim()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-40"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setShowSaveInput(false); setSaveTitle(''); setSaveTags([]); setSaveFolder(''); }}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Tag selection */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider self-center mr-1">Tags:</span>
                    {AVAILABLE_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleSaveTag(tag)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border ${
                          saveTags.includes(tag)
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-200 hover:text-indigo-500'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {/* Folder selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Folder:</span>
                    <select
                      value={saveFolder}
                      onChange={e => setSaveFolder(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] text-gray-700 focus:outline-none focus:border-indigo-400"
                    >
                      <option value="">No Folder</option>
                      {AVAILABLE_FOLDERS.filter(f => f).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveInput(true)}
                  disabled={!currentCode.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 text-xs text-gray-400 hover:text-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  Save Current Code
                </button>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by title, code, tags..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Filter Tags Row */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                    filter === 'all' ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('important')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 border ${
                    filter === 'important' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-500'
                  }`}
                >
                  ⭐ Important
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilter(filter === tag ? 'all' : tag)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                      filter === tag ? 'bg-purple-500 text-white border-purple-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-500'
                    }`}
                  >
                    🏷️ {tag}
                  </button>
                ))}
              </div>

              {/* Folder Filter */}
              {allFolders.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <FolderOpen className="w-3 h-3 text-gray-400 shrink-0" />
                  <button
                    onClick={() => setFolderFilter('')}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap border ${
                      !folderFilter ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:text-indigo-500'
                    }`}
                  >
                    All Folders
                  </button>
                  {allFolders.map(f => (
                    <button
                      key={f}
                      onClick={() => setFolderFilter(folderFilter === f ? '' : f)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap border ${
                        folderFilter === f ? 'bg-yellow-50 text-yellow-700 border-yellow-300' : 'bg-white text-gray-500 border-gray-200 hover:text-yellow-600'
                      }`}
                    >
                      📁 {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ═══════ CODE LIST ═══════ */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">Loading codes...</span>
                  </div>
                </div>
              ) : filteredCodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Code2 className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-xs text-gray-500">
                    {codes.length === 0 ? 'No codes saved yet' : filter === 'important' ? 'No important codes' : 'No matching codes'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {codes.length === 0 ? 'Save your code to see it here' : 'Try changing your search or filter'}
                  </p>
                </div>
              ) : (
                filteredCodes.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    style={{ backdropFilter: 'blur(10px)' }}
                    onTouchStart={() => handleTouchStart(item.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-3 sm:px-4 pt-3 pb-1.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {item.isImportant && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        {editingId === item.id ? (
                          <div className="flex items-center gap-1 flex-1">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                              className="flex-1 bg-gray-50 border border-indigo-300 rounded-lg px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                              autoFocus
                            />
                            <button onClick={() => handleSaveEdit(item.id)} className="p-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-800 truncate">{item.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.folder && (
                          <span className="px-1.5 py-0.5 rounded-md bg-yellow-50 text-yellow-700 text-[9px] font-semibold border border-yellow-200">📁 {item.folder}</span>
                        )}
                        <span className="text-[9px] text-gray-400">{relativeTime(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 px-3 sm:px-4 pb-1.5 flex-wrap">
                        {item.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-semibold border border-indigo-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Code Preview */}
                    <div className="px-3 sm:px-4 pb-2">
                      <div className={`bg-gray-50 rounded-xl border border-gray-100 overflow-hidden transition-all ${expandedCodeId === item.id ? 'max-h-[400px]' : 'max-h-[80px]'}`}>
                        <pre
                          className="text-[11px] font-mono leading-relaxed p-3 overflow-auto text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: expandedCodeId === item.id
                              ? highlightPython(item.code)
                              : highlightPython(truncateCode(item.code, 3))
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons — Always visible */}
                    <div className="flex items-center gap-1 px-3 sm:px-4 pb-3 flex-wrap">
                      {onRun && (
                        <button
                          onClick={() => { onSelect(item.code); onRun(item.code); onClose(); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all active:scale-95"
                        >
                          <Play className="w-3 h-3" /> Run
                        </button>
                      )}
                      <button
                        onClick={() => { onSelect(item.code); onClose(); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all active:scale-95"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(item.id, item.code); }}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                          copiedId === item.id
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {copiedId === item.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <button
                        onClick={() => setExpandedCodeId(expandedCodeId === item.id ? null : item.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all active:scale-95"
                      >
                        {expandedCodeId === item.id ? <><EyeOff className="w-3 h-3" /> Collapse</> : <><Eye className="w-3 h-3" /> View</>}
                      </button>
                      {onExplain && (
                        <button
                          onClick={() => { onSelect(item.code); onExplain(item.code); onClose(); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all active:scale-95"
                        >
                          <Sparkles className="w-3 h-3" /> AI Explain
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(item); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                        title="Rename"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleImportant(item.id); }}
                        className={`p-1.5 rounded-lg transition-all ${item.isImportant ? 'text-amber-400 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}
                        title={item.isImportant ? 'Remove important' : 'Mark important'}
                      >
                        <Star className={`w-3 h-3 ${item.isImportant ? 'fill-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Mobile Long Press Actions Sheet */}
                    <AnimatePresence>
                      {longPressId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl"
                        >
                          <p className="text-xs font-bold text-gray-800 mb-1">{item.title}</p>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {onRun && (
                              <button onClick={() => { onSelect(item.code); onRun(item.code); onClose(); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500 text-white shadow-sm">
                                ▶️ Run
                              </button>
                            )}
                            <button onClick={() => { onSelect(item.code); onClose(); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white shadow-sm">
                              ✏️ Edit
                            </button>
                            <button onClick={() => { handleCopy(item.id, item.code); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-500 text-white shadow-sm">
                              📋 Copy
                            </button>
                            <button onClick={() => { onDelete(item.id); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white shadow-sm">
                              🗑️ Delete
                            </button>
                          </div>
                          <button onClick={() => setLongPressId(null)} className="mt-2 text-[11px] text-gray-500 hover:text-gray-700">
                            Cancel
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
