'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Star, Download, Save, Search, Code2, Play, Copy, Pencil, Eye, EyeOff, Sparkles, Check, FolderOpen, FolderPlus, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedCodeItem } from '@/types/python';
import { formatTimestamp, truncateCode } from '@/lib/python-utils';

// Predefined tags
const AVAILABLE_TAGS = ['loops', 'input', 'list', 'string', 'function', 'class', 'project', 'math', 'file', 'dictionary'];

// Folder config with colors
const DEFAULT_FOLDERS = [
  { name: 'Practice', color: '#3b82f6', icon: '📘' },
  { name: 'Projects', color: '#8b5cf6', icon: '🚀' },
  { name: 'School', color: '#f59e0b', icon: '🎓' },
  { name: 'Experiments', color: '#10b981', icon: '🧪' },
];

// Simple Python syntax highlighter
function highlightPython(code: string): string {
  const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|and|or|not|in|is|True|False|None|pass|break|continue|raise|global|nonlocal|assert|del|print|input|range|len|int|str|float|list|dict|set|tuple|type|map|filter|zip|enumerate|sorted|reversed|open|super|self)\b/g;
  const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const comments = /(#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;

  let highlighted = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  highlighted = highlighted
    .replace(comments, '<span style="color:#6b7280;font-style:italic">$1</span>')
    .replace(strings, '<span style="color:#059669">$1</span>')
    .replace(keywords, '<span style="color:#7c3aed;font-weight:600">$1</span>')
    .replace(numbers, '<span style="color:#d97706">$1</span>');
  return highlighted;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
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
  isOpen, onClose, codes, isLoading, onSave, onDelete, onToggleImportant, onUpdate, onSelect, onRun, onExplain, currentCode, initialShowSaveInput,
}: SavedCodesModalProps) {
  const [activeFolder, setActiveFolder] = useState('all');
  const [tagFilter, setTagFilter] = useState<'all' | 'important' | string>('all');
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
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [customFolders, setCustomFolders] = useState<{ name: string; color: string; icon: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Load custom folders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('knobly-custom-folders');
    if (saved) {
      try { setCustomFolders(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowSaveInput(initialShowSaveInput || false);
      setSaveTitle(''); setSaveTags([]); setSaveFolder('');
      setExpandedCodeId(null); setEditingId(null); setLongPressId(null);
    }
  }, [isOpen, initialShowSaveInput]);

  const allFolders = useMemo(() => {
    const folderSet = new Set<string>();
    codes.forEach(c => { if (c.folder) folderSet.add(c.folder); });
    DEFAULT_FOLDERS.forEach(f => folderSet.add(f.name));
    customFolders.forEach(f => folderSet.add(f.name));
    return Array.from(folderSet);
  }, [codes, customFolders]);

  const folderConfig = useMemo(() => {
    const map: Record<string, { color: string; icon: string }> = {};
    DEFAULT_FOLDERS.forEach(f => { map[f.name] = { color: f.color, icon: f.icon }; });
    customFolders.forEach(f => { map[f.name] = { color: f.color, icon: f.icon }; });
    return map;
  }, [customFolders]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: codes.length };
    allFolders.forEach(f => { counts[f] = codes.filter(c => c.folder === f).length; });
    counts['unfiled'] = codes.filter(c => !c.folder || c.folder === '').length;
    return counts;
  }, [codes, allFolders]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    codes.forEach(c => c.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [codes]);

  const filteredCodes = useMemo(() => {
    let result = codes;
    if (activeFolder !== 'all') {
      if (activeFolder === 'unfiled') result = result.filter(c => !c.folder || c.folder === '');
      else result = result.filter(c => c.folder === activeFolder);
    }
    if (tagFilter === 'important') result = result.filter(c => c.isImportant);
    else if (tagFilter !== 'all') result = result.filter(c => c.tags?.includes(tagFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.tags?.some(t => t.toLowerCase().includes(q)));
    }
    return [...result].sort((a, b) => {
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [codes, activeFolder, tagFilter, searchQuery]);

  const lastSaved = codes.length > 0 ? relativeTime(codes.reduce((latest, c) => c.createdAt > latest ? c.createdAt : latest, codes[0].createdAt)) : 'Never';

  const handleSave = async () => {
    if (!currentCode.trim()) return;
    setIsSaving(true);
    await onSave(saveTitle || `Code ${new Date().toLocaleString()}`, currentCode, saveTags, saveFolder || (activeFolder !== 'all' && activeFolder !== 'unfiled' ? activeFolder : ''));
    setSaveTitle(''); setSaveTags([]); setSaveFolder('');
    setShowSaveInput(false); setIsSaving(false);
  };

  const handleCopy = useCallback(async (id: string, code: string) => {
    try { await navigator.clipboard.writeText(code); } catch {
      const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleStartEdit = (item: SavedCodeItem) => { setEditingId(item.id); setEditTitle(item.title); };
  const handleSaveEdit = async (id: string) => { if (onUpdate && editTitle.trim()) await onUpdate(id, { title: editTitle.trim() }); setEditingId(null); setEditTitle(''); };
  const toggleSaveTag = (tag: string) => setSaveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const colors = ['#ef4444', '#f97316', '#14b8a6', '#06b6d4', '#6366f1', '#ec4899', '#84cc16'];
    const icons = ['📁', '📂', '💼', '🗂️', '📦', '🎯', '💡'];
    const idx = customFolders.length % colors.length;
    const newFolder = { name: newFolderName.trim(), color: colors[idx], icon: icons[idx] };
    const updated = [...customFolders, newFolder];
    setCustomFolders(updated);
    localStorage.setItem('knobly-custom-folders', JSON.stringify(updated));
    setNewFolderName(''); setShowCreateFolder(false);
    setActiveFolder(newFolder.name);
  };

  const handleMoveToFolder = async (id: string, folder: string) => {
    if (onUpdate) await onUpdate(id, { folder });
  };

  const handleTouchStart = (id: string) => { longPressTimer.current = setTimeout(() => setLongPressId(id), 500); };
  const handleTouchEnd = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };

  const handleDownloadPDF = () => {
    const codesToExport = tagFilter === 'important' ? codes.filter(c => c.isImportant) : codes;
    if (codesToExport.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `<!DOCTYPE html><html><head><title>My Saved Codes</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;padding:40px;color:#1e293b}
    .header{text-align:center;margin-bottom:40px;padding-bottom:20px;border-bottom:3px solid #6366f1}.header h1{font-size:28px;color:#312e81;margin-bottom:4px}.header p{font-size:13px;color:#64748b}
    .code-block{margin-bottom:30px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;page-break-inside:avoid}
    .code-header{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center}
    .code-header h3{font-size:15px;font-weight:700}.code-header .meta{font-size:11px;opacity:0.85}
    .code-body{padding:16px 20px;background:#f8fafc}.code-body pre{font-family:'Fira Code',monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;color:#334155}
    .footer{text-align:center;margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}@media print{body{padding:20px}}</style></head><body>
    <div class="header"><h1>🐍 My Saved Codes</h1><p>Knobly Python Lab • ${codesToExport.length} codes • ${new Date().toLocaleDateString()}</p></div>
    ${codesToExport.map((c, i) => `<div class="code-block"><div class="code-header"><h3>#${i+1} ${c.title}${c.isImportant ? ' ⭐' : ''}</h3><span class="meta">${new Date(c.createdAt).toLocaleDateString()}</span></div><div class="code-body"><pre>${c.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></div></div>`).join('')}
    <div class="footer">Generated by Knobly Python Lab</div></body></html>`;
    printWindow.document.write(html); printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" />
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-2 sm:inset-3 md:inset-auto md:top-[2%] md:left-1/2 md:-translate-x-1/2 md:w-[880px] md:max-h-[96vh] bg-white rounded-2xl z-[201] overflow-hidden shadow-2xl flex flex-col border border-gray-200/80"
          >
            {/* ═══════ HEADER ═══════ */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.06] pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-md">
                    <path fill="#FFCA28" d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z"/>
                    <path fill="#FFD54F" d="M20,8H4v10h16V8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[15px] font-black tracking-wide !text-white drop-shadow-sm">Code Manager</h2>
                  <span className="text-[10px] font-medium !text-white/80 block">{codes.length} code{codes.length !== 1 ? 's' : ''} • {lastSaved}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={handleDownloadPDF} disabled={codes.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold !bg-red-500 !text-white border border-red-400 hover:!bg-red-600 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-red-500/30">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button onClick={onClose} className="p-1.5 rounded-xl !bg-white/15 hover:!bg-white/25 transition-all border border-white/20">
                  <X className="w-5 h-5 !text-white stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* ═══════ BODY: SIDEBAR + CONTENT ═══════ */}
            <div className="flex flex-1 overflow-hidden min-h-0">

              {/* ───── SIDEBAR ───── */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-r border-gray-100 bg-gradient-to-b from-gray-50/80 to-white flex flex-col shrink-0 overflow-hidden"
                  >
                    <div className="px-3 pt-3 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">📁 Folders</span>
                        <button onClick={() => setShowCreateFolder(true)} className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-all" title="New Folder">
                          <FolderPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
                      {/* All Codes */}
                      <button onClick={() => setActiveFolder('all')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-[12px] font-semibold group ${
                          activeFolder === 'all'
                            ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}>
                        <span className="text-sm">📂</span>
                        <span className="flex-1 truncate">All Codes</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFolder === 'all' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>{folderCounts.all}</span>
                      </button>

                      {/* Unfiled */}
                      <button onClick={() => setActiveFolder('unfiled')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-[12px] font-semibold group ${
                          activeFolder === 'unfiled'
                            ? 'bg-gray-700 text-white shadow-md shadow-gray-700/30'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}>
                        <span className="text-sm">📄</span>
                        <span className="flex-1 truncate">Unfiled</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFolder === 'unfiled' ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'}`}>{folderCounts.unfiled || 0}</span>
                      </button>

                      <div className="h-px bg-gray-100 my-1.5 mx-1" />

                      {/* Folder List */}
                      {allFolders.map(folderName => {
                        const cfg = folderConfig[folderName] || { color: '#6b7280', icon: '📁' };
                        const isActive = activeFolder === folderName;
                        return (
                          <button key={folderName} onClick={() => setActiveFolder(folderName)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all text-[12px] font-semibold group ${
                              isActive ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                            style={isActive ? { backgroundColor: cfg.color, boxShadow: `0 4px 14px -3px ${cfg.color}50` } : {}}
                          >
                            <span className="text-sm">{cfg.icon}</span>
                            <span className="flex-1 truncate">{folderName}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>{folderCounts[folderName] || 0}</span>
                          </button>
                        );
                      })}

                      {/* Create Folder Inline */}
                      {showCreateFolder && (
                        <div className="mt-2 p-2 bg-white rounded-xl border border-indigo-200 shadow-lg shadow-indigo-500/10">
                          <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                            placeholder="Folder name..." autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowCreateFolder(false); }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 mb-1.5"
                          />
                          <div className="flex gap-1">
                            <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-40">Create</button>
                            <button onClick={() => { setShowCreateFolder(false); setNewFolderName(''); }} className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                          </div>
                        </div>
                      )}

                      {/* New Folder Button */}
                      {!showCreateFolder && (
                        <button onClick={() => setShowCreateFolder(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[11px] font-semibold text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mt-1 border border-dashed border-indigo-200/60 hover:border-indigo-300">
                          <Plus className="w-3.5 h-3.5" />
                          <span>New Folder</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sidebar Toggle */}
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute left-0 bottom-4 z-10 p-1 rounded-r-lg bg-white border border-l-0 border-gray-200 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all shadow-sm md:hidden"
                style={sidebarOpen ? { left: '200px' } : { left: '0px' }}
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {/* ───── MAIN CONTENT ───── */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Stats + Search + Filters */}
                <div className="px-4 py-2.5 border-b border-gray-100 space-y-2 shrink-0 bg-white">
                  {/* Stats Row */}
                  <div className="flex items-center gap-3 text-[11px] overflow-x-auto no-scrollbar">
                    <span className="font-bold text-gray-800">📊 {filteredCodes.length}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 whitespace-nowrap">⭐ {codes.filter(c => c.isImportant).length} important</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 whitespace-nowrap">🕐 {lastSaved}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-purple-500 font-bold whitespace-nowrap">🐍 Python</span>
                    {/* Mobile sidebar toggle */}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden ml-auto p-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-500">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Save */}
                  {showSaveInput ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)}
                          placeholder="Code title (e.g. Fibonacci Series)" autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSave()}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                        <button onClick={handleSave} disabled={isSaving || !currentCode.trim()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40">
                          <Save className="w-3.5 h-3.5" /> {isSaving ? '...' : 'Save'}
                        </button>
                        <button onClick={() => { setShowSaveInput(false); setSaveTitle(''); setSaveTags([]); setSaveFolder(''); }} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider self-center mr-1">Tags:</span>
                        {AVAILABLE_TAGS.map(tag => (
                          <button key={tag} onClick={() => toggleSaveTag(tag)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-all ${saveTags.includes(tag) ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-200'}`}>
                            {tag}
                          </button>
                        ))}
                      </div>
                      {activeFolder === 'all' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Folder:</span>
                          <select value={saveFolder} onChange={e => setSaveFolder(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[10px] text-gray-700 focus:outline-none focus:border-indigo-400">
                            <option value="">No Folder</option>
                            {allFolders.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => setShowSaveInput(true)} disabled={!currentCode.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 text-xs text-gray-400 hover:text-indigo-500 transition-all disabled:opacity-30 group">
                      <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Save Current Code
                    </button>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by title, code, tags..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>

                  {/* Tag Filters */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                    <button onClick={() => setTagFilter('all')}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${tagFilter === 'all' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                      All
                    </button>
                    <button onClick={() => setTagFilter('important')}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border flex items-center gap-1 ${tagFilter === 'important' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'}`}>
                      ⭐ Important
                    </button>
                    {allTags.map(tag => (
                      <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? 'all' : tag)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${tagFilter === tag ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ═══════ CODE LIST ═══════ */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
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
                      <p className="text-xs text-gray-500">{codes.length === 0 ? 'No codes saved yet' : 'No matching codes'}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{codes.length === 0 ? 'Save your code to see it here' : 'Try changing filters or search'}</p>
                    </div>
                  ) : (
                    filteredCodes.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)]"
                        onTouchStart={() => handleTouchStart(item.id)} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {item.isImportant && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                            {editingId === item.id ? (
                              <div className="flex items-center gap-1 flex-1">
                                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                                  className="flex-1 bg-gray-50 border border-indigo-300 rounded px-2 py-0.5 text-[11px] text-gray-800 focus:outline-none" />
                                <button onClick={() => handleSaveEdit(item.id)} className="p-0.5 rounded bg-indigo-500 text-white"><Check className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-800 truncate">{item.title}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {item.folder && (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[8px] font-bold text-gray-500" style={{ borderLeft: `2px solid ${folderConfig[item.folder]?.color || '#94a3b8'}` }}>
                                {item.folder}
                              </span>
                            )}
                            <span className="text-[9px] text-gray-400">{relativeTime(item.createdAt)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 px-3 pb-1 flex-wrap">
                            {item.tags.map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-semibold border border-indigo-100">{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Code Preview */}
                        <div className="px-3 pb-1.5">
                          <div className={`bg-gray-50 rounded-lg border border-gray-100 overflow-hidden transition-all ${expandedCodeId === item.id ? 'max-h-[350px]' : 'max-h-[72px]'}`}>
                            <pre className="text-[10px] font-mono leading-relaxed p-2 overflow-auto text-gray-700"
                              dangerouslySetInnerHTML={{ __html: expandedCodeId === item.id ? highlightPython(item.code) : highlightPython(truncateCode(item.code, 3)) }} />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 px-3 pb-2.5 flex-wrap">
                          {onRun && (
                            <button onClick={() => { onSelect(item.code); onRun(item.code); onClose(); }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 active:scale-95 transition-all">
                              <Play className="w-2.5 h-2.5" /> Run
                            </button>
                          )}
                          <button onClick={() => { onSelect(item.code); onClose(); }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all">
                            <Pencil className="w-2.5 h-2.5" /> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleCopy(item.id, item.code); }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border active:scale-95 transition-all ${copiedId === item.id ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                            {copiedId === item.id ? <><Check className="w-2.5 h-2.5" /> Copied!</> : <><Copy className="w-2.5 h-2.5" /> Copy</>}
                          </button>
                          <button onClick={() => setExpandedCodeId(expandedCodeId === item.id ? null : item.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 active:scale-95 transition-all">
                            {expandedCodeId === item.id ? <><EyeOff className="w-2.5 h-2.5" /> Less</> : <><Eye className="w-2.5 h-2.5" /> View</>}
                          </button>
                          {onExplain && (
                            <button onClick={() => { onSelect(item.code); onExplain(item.code); onClose(); }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all">
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </button>
                          )}
                          <div className="flex-1" />
                          {/* Move to Folder dropdown */}
                          <select
                            value={item.folder || ''}
                            onChange={e => handleMoveToFolder(item.id, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="text-[8px] font-semibold bg-gray-50 border border-gray-200 rounded px-1 py-0.5 text-gray-500 focus:outline-none hover:border-indigo-300 cursor-pointer"
                            title="Move to folder"
                          >
                            <option value="">📁 Move</option>
                            {allFolders.map(f => <option key={f} value={f}>{folderConfig[f]?.icon || '📁'} {f}</option>)}
                          </select>
                          <button onClick={e => { e.stopPropagation(); handleStartEdit(item); }} className="p-1 rounded text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all" title="Rename">
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); onToggleImportant(item.id); }}
                            className={`p-1 rounded transition-all ${item.isImportant ? 'text-amber-400 hover:bg-amber-50' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}>
                            <Star className={`w-2.5 h-2.5 ${item.isImportant ? 'fill-amber-400' : ''}`} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); onDelete(item.id); }} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Mobile Long Press Overlay */}
                        <AnimatePresence>
                          {longPressId === item.id && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-2 p-4 rounded-xl">
                              <p className="text-[11px] font-bold text-gray-800 mb-1">{item.title}</p>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                {onRun && <button onClick={() => { onSelect(item.code); onRun(item.code); onClose(); setLongPressId(null); }} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-green-500 text-white">▶️ Run</button>}
                                <button onClick={() => { onSelect(item.code); onClose(); setLongPressId(null); }} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-blue-500 text-white">✏️ Edit</button>
                                <button onClick={() => { handleCopy(item.id, item.code); setLongPressId(null); }} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gray-500 text-white">📋 Copy</button>
                                <button onClick={() => { onDelete(item.id); setLongPressId(null); }} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-red-500 text-white">🗑️ Delete</button>
                              </div>
                              <button onClick={() => setLongPressId(null)} className="mt-1 text-[10px] text-gray-500">Cancel</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
