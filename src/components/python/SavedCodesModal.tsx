'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Star, Download, Save, Search, Code2, Play, Copy, Pencil, Eye, EyeOff, Sparkles, Check, FolderOpen, FolderPlus, ChevronLeft, ChevronRight, Plus, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedCodeItem } from '@/types/python';
import { formatTimestamp, truncateCode } from '@/lib/python-utils';

const AVAILABLE_TAGS = ['loops', 'input', 'list', 'string', 'function', 'class', 'project', 'math', 'file', 'dictionary'];

const DEFAULT_FOLDERS = [
  { name: 'Practice', color: '#3b82f6', icon: '📘' },
  { name: 'Projects', color: '#8b5cf6', icon: '🚀' },
  { name: 'School', color: '#f59e0b', icon: '🎓' },
  { name: 'Experiments', color: '#10b981', icon: '🧪' },
];

function highlightPython(code: string): string {
  const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|and|or|not|in|is|True|False|None|pass|break|continue|raise|global|nonlocal|assert|del|print|input|range|len|int|str|float|list|dict|set|tuple|type|map|filter|zip|enumerate|sorted|reversed|open|super|self)\b/g;
  const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const comments = /(#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  let h = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(comments, '<span style="color:#6b7280;font-style:italic">$1</span>')
    .replace(strings, '<span style="color:#059669">$1</span>')
    .replace(keywords, '<span style="color:#7c3aed;font-weight:600">$1</span>')
    .replace(numbers, '<span style="color:#d97706">$1</span>');
  return h;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
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
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('knobly-custom-folders');
    if (saved) { try { setCustomFolders(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  useEffect(() => {
    if (isOpen) { setShowSaveInput(initialShowSaveInput || false); setSaveTitle(''); setSaveTags([]); setSaveFolder(''); setExpandedCodeId(null); setEditingId(null); setLongPressId(null); setContextMenuId(null); }
  }, [isOpen, initialShowSaveInput]);

  const allFolders = useMemo(() => {
    const s = new Set<string>();
    codes.forEach(c => { if (c.folder) s.add(c.folder); });
    DEFAULT_FOLDERS.forEach(f => s.add(f.name));
    customFolders.forEach(f => s.add(f.name));
    return Array.from(s);
  }, [codes, customFolders]);

  const folderConfig = useMemo(() => {
    const m: Record<string, { color: string; icon: string }> = {};
    DEFAULT_FOLDERS.forEach(f => { m[f.name] = { color: f.color, icon: f.icon }; });
    customFolders.forEach(f => { m[f.name] = { color: f.color, icon: f.icon }; });
    return m;
  }, [customFolders]);

  const folderCounts = useMemo(() => {
    const c: Record<string, number> = { all: codes.length };
    allFolders.forEach(f => { c[f] = codes.filter(x => x.folder === f).length; });
    c['unfiled'] = codes.filter(x => !x.folder || x.folder === '').length;
    return c;
  }, [codes, allFolders]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    codes.forEach(c => c.tags?.forEach(t => s.add(t)));
    return Array.from(s);
  }, [codes]);

  const filteredCodes = useMemo(() => {
    let r = codes;
    if (activeFolder !== 'all') {
      if (activeFolder === 'unfiled') r = r.filter(c => !c.folder || c.folder === '');
      else r = r.filter(c => c.folder === activeFolder);
    }
    if (tagFilter === 'important') r = r.filter(c => c.isImportant);
    else if (tagFilter !== 'all') r = r.filter(c => c.tags?.includes(tagFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter(c => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.tags?.some(t => t.toLowerCase().includes(q)));
    }
    return [...r].sort((a, b) => {
      if (a.isImportant && !b.isImportant) return -1;
      if (!a.isImportant && b.isImportant) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [codes, activeFolder, tagFilter, searchQuery]);

  const lastSaved = codes.length > 0 ? relativeTime(codes.reduce((l, c) => c.createdAt > l ? c.createdAt : l, codes[0].createdAt)) : 'Never';

  const handleSave = async () => {
    if (!currentCode.trim()) return;
    setIsSaving(true);
    await onSave(saveTitle || `Code ${new Date().toLocaleString()}`, currentCode, saveTags, saveFolder || (activeFolder !== 'all' && activeFolder !== 'unfiled' ? activeFolder : ''));
    setSaveTitle(''); setSaveTags([]); setSaveFolder(''); setShowSaveInput(false); setIsSaving(false);
  };

  const handleCopy = useCallback(async (id: string, code: string) => {
    try { await navigator.clipboard.writeText(code); } catch {
      const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleStartEdit = (item: SavedCodeItem) => { setEditingId(item.id); setEditTitle(item.title); setContextMenuId(null); };
  const handleSaveEdit = async (id: string) => { if (onUpdate && editTitle.trim()) await onUpdate(id, { title: editTitle.trim() }); setEditingId(null); };
  const toggleSaveTag = (tag: string) => setSaveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const colors = ['#ef4444', '#f97316', '#14b8a6', '#06b6d4', '#6366f1', '#ec4899', '#84cc16'];
    const icons = ['📁', '📂', '💼', '🗂️', '📦', '🎯', '💡'];
    const idx = customFolders.length % colors.length;
    const nf = { name: newFolderName.trim(), color: colors[idx], icon: icons[idx] };
    const up = [...customFolders, nf];
    setCustomFolders(up); localStorage.setItem('knobly-custom-folders', JSON.stringify(up));
    setNewFolderName(''); setShowCreateFolder(false); setActiveFolder(nf.name);
  };

  const handleMoveToFolder = async (id: string, folder: string) => { if (onUpdate) await onUpdate(id, { folder }); setContextMenuId(null); };
  const handleDuplicate = async (item: SavedCodeItem) => { await onSave(item.title + ' (copy)', item.code, item.tags, item.folder); setContextMenuId(null); };
  const handleTouchStart = (id: string) => { longPressTimer.current = setTimeout(() => setLongPressId(id), 500); };
  const handleTouchEnd = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };

  const handleDownloadPDF = () => {
    const exp = tagFilter === 'important' ? codes.filter(c => c.isImportant) : codes;
    if (!exp.length) return;
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Saved Codes</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;padding:40px;color:#1e293b}.header{text-align:center;margin-bottom:40px;padding-bottom:20px;border-bottom:3px solid #6366f1}.header h1{font-size:28px;color:#312e81;margin-bottom:4px}.header p{font-size:13px;color:#64748b}.cb{margin-bottom:30px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;page-break-inside:avoid}.ch{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center}.ch h3{font-size:15px;font-weight:700}.ch .m{font-size:11px;opacity:.85}.cby{padding:16px 20px;background:#f8fafc}.cby pre{font-family:monospace;font-size:13px;line-height:1.6;white-space:pre-wrap;color:#334155}.ft{text-align:center;margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}@media print{body{padding:20px}}</style></head><body><div class="header"><h1>🐍 My Saved Codes</h1><p>Knobly • ${exp.length} codes • ${new Date().toLocaleDateString()}</p></div>${exp.map((c,i)=>`<div class="cb"><div class="ch"><h3>#${i+1} ${c.title}${c.isImportant?' ⭐':''}</h3><span class="m">${new Date(c.createdAt).toLocaleDateString()}</span></div><div class="cby"><pre>${c.code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></div></div>`).join('')}<div class="ft">Knobly Python Lab</div></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 500);
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
            className="fixed inset-2 sm:inset-3 md:inset-auto md:top-[2%] md:left-1/2 md:-translate-x-1/2 md:w-[920px] md:max-h-[96vh] bg-white rounded-2xl z-[201] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col border border-gray-200/60"
          >
            {/* ═══════ HEADER ═══════ */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-md">
                    <path fill="#FFCA28" d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z"/>
                    <path fill="#FFD54F" d="M20,8H4v10h16V8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[16px] font-black tracking-wide !text-white drop-shadow-sm">Code Manager</h2>
                  <span className="text-[10px] font-medium !text-white/75 block">{codes.length} code{codes.length !== 1 ? 's' : ''} • Last saved {lastSaved}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <button onClick={handleDownloadPDF} disabled={codes.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold !bg-red-500 !text-white border border-red-400 hover:!bg-red-600 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-red-500/20">
                  <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PDF</span>
                </button>
                <button onClick={onClose} className="p-2 rounded-xl !bg-white/15 hover:!bg-white/25 transition-all border border-white/20 group">
                  <X className="w-5 h-5 !text-white stroke-[2.5] group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* ═══════ BODY ═══════ */}
            <div className="flex flex-1 overflow-hidden min-h-0">

              {/* ─── SIDEBAR ─── */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }} animate={{ width: 210, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="border-r border-gray-100 bg-gradient-to-b from-slate-50 via-gray-50/60 to-white flex flex-col shrink-0 overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">📁 Folders</span>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                      {/* All Codes */}
                      <SidebarItem label="All Codes" icon="📂" count={folderCounts.all} isActive={activeFolder === 'all'} color="#6366f1" onClick={() => setActiveFolder('all')} />
                      <SidebarItem label="Unfiled" icon="📄" count={folderCounts.unfiled || 0} isActive={activeFolder === 'unfiled'} color="#64748b" onClick={() => setActiveFolder('unfiled')} />

                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2 mx-2" />

                      {allFolders.map(name => {
                        const cfg = folderConfig[name] || { color: '#6b7280', icon: '📁' };
                        return <SidebarItem key={name} label={name} icon={cfg.icon} count={folderCounts[name] || 0} isActive={activeFolder === name} color={cfg.color} onClick={() => setActiveFolder(name)} />;
                      })}

                      {/* Create Folder */}
                      {showCreateFolder ? (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2.5 bg-white rounded-xl border border-indigo-200 shadow-lg shadow-indigo-500/10">
                          <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                            placeholder="Folder name..." autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowCreateFolder(false); setNewFolderName(''); } }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 mb-2" />
                          <div className="flex gap-1.5">
                            <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-sm">Create</button>
                            <button onClick={() => { setShowCreateFolder(false); setNewFolderName(''); }} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">Cancel</button>
                          </div>
                        </motion.div>
                      ) : (
                        <button onClick={() => setShowCreateFolder(true)}
                          className="w-full flex items-center justify-center gap-2 mt-3 px-3 py-2.5 rounded-xl text-[11px] font-bold text-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                          <FolderPlus className="w-4 h-4" />
                          New Folder
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── MAIN CONTENT ─── */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/30">

                {/* Stats + Search + Filters */}
                <div className="px-4 py-3 border-b border-gray-100 space-y-2.5 shrink-0 bg-white/80 backdrop-blur-sm">
                  {/* Stats Row */}
                  <div className="flex items-center gap-3 text-[11px] overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                      <span className="font-bold text-indigo-600">📊 {filteredCodes.length}</span>
                      <span className="text-indigo-400">codes</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100">
                      <span className="font-bold text-amber-600">⭐ {codes.filter(c => c.isImportant).length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-gray-500">🕐 {lastSaved}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100">
                      <span className="text-purple-600 font-bold">🐍 Python</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden ml-auto p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-500 transition-all">
                      {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <FolderOpen className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Save */}
                  {showSaveInput ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Code title (e.g. Fibonacci Series)" autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm" />
                        <button onClick={handleSave} disabled={isSaving || !currentCode.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 shadow-sm shadow-indigo-500/20 transition-all">
                          <Save className="w-3.5 h-3.5" /> {isSaving ? '...' : 'Save'}
                        </button>
                        <button onClick={() => { setShowSaveInput(false); setSaveTitle(''); setSaveTags([]); setSaveFolder(''); }} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider self-center mr-1">Tags:</span>
                        {AVAILABLE_TAGS.map(tag => (
                          <button key={tag} onClick={() => toggleSaveTag(tag)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-all ${saveTags.includes(tag) ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'}`}>
                            {tag}
                          </button>
                        ))}
                      </div>
                      {activeFolder === 'all' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Folder:</span>
                          <select value={saveFolder} onChange={e => setSaveFolder(e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[10px] text-gray-700 focus:outline-none focus:border-indigo-400 shadow-sm">
                            <option value="">No Folder</option>
                            {allFolders.map(f => <option key={f} value={f}>{folderConfig[f]?.icon || '📁'} {f}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={() => setShowSaveInput(true)} disabled={!currentCode.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-400 text-xs text-gray-400 hover:text-indigo-500 transition-all disabled:opacity-30 group bg-white/50 hover:bg-indigo-50/50">
                      <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Save Current Code
                    </button>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by title, code, tags..."
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm" />
                  </div>

                  {/* Tag Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {[{ key: 'all', label: 'All', bg: 'indigo' }, { key: 'important', label: '⭐ Important', bg: 'amber' }].map(f => (
                      <button key={f.key} onClick={() => setTagFilter(f.key as typeof tagFilter)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${tagFilter === f.key ? `bg-${f.bg}-500 text-white border-${f.bg}-500 shadow-sm shadow-${f.bg}-500/20` : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                        style={tagFilter === f.key ? { backgroundColor: f.bg === 'amber' ? '#f59e0b' : '#6366f1', borderColor: f.bg === 'amber' ? '#f59e0b' : '#6366f1', color: 'white' } : {}}>
                        {f.label}
                      </button>
                    ))}
                    {allTags.map(tag => (
                      <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? 'all' : tag)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${tagFilter === tag ? 'text-white border-purple-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'}`}
                        style={tagFilter === tag ? { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' } : {}}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ═══════ CODE LIST ═══════ */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-500">Loading codes...</span>
                      </div>
                    </div>
                  ) : filteredCodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                        <Code2 className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">{codes.length === 0 ? 'No codes saved yet' : 'No matching codes'}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{codes.length === 0 ? 'Save your code to see it here' : 'Try changing filters or search'}</p>
                    </div>
                  ) : (
                    filteredCodes.map((item, idx) => (
                      <motion.div key={item.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group relative rounded-2xl border border-gray-200/80 bg-white overflow-hidden transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-[2px]"
                        style={{ backdropFilter: 'blur(8px)' }}
                        onTouchStart={() => handleTouchStart(item.id)} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
                        onContextMenu={e => { e.preventDefault(); setContextMenuId(contextMenuId === item.id ? null : item.id); }}
                      >
                        {/* Folder color accent line */}
                        {item.folder && folderConfig[item.folder] && (
                          <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: folderConfig[item.folder].color }} />
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {item.isImportant && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 drop-shadow-sm" />}
                            {editingId === item.id ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                                  className="flex-1 bg-gray-50 border border-indigo-300 rounded-lg px-2.5 py-1 text-[11px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                                <button onClick={() => handleSaveEdit(item.id)} className="p-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-sm"><Check className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <span className="text-[12px] font-bold text-gray-800 truncate">{item.title}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {item.folder && (
                              <span className="px-2 py-0.5 rounded-lg text-[8px] font-bold border flex items-center gap-1"
                                style={{ backgroundColor: `${folderConfig[item.folder]?.color || '#94a3b8'}10`, color: folderConfig[item.folder]?.color || '#94a3b8', borderColor: `${folderConfig[item.folder]?.color || '#94a3b8'}30` }}>
                                {folderConfig[item.folder]?.icon || '📁'} {item.folder}
                              </span>
                            )}
                            <span className="text-[9px] text-gray-400 font-medium">{relativeTime(item.createdAt)}</span>
                            {/* Context menu trigger */}
                            <button onClick={e => { e.stopPropagation(); setContextMenuId(contextMenuId === item.id ? null : item.id); }}
                              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Context (Right Click) Menu */}
                        <AnimatePresence>
                          {contextMenuId === item.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-3 top-10 z-20 w-44 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden"
                              onClick={e => e.stopPropagation()}>
                              <button onClick={() => handleStartEdit(item)} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                <Pencil className="w-3 h-3" /> Rename
                              </button>
                              <button onClick={() => handleDuplicate(item)} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all">
                                <Copy className="w-3 h-3" /> Duplicate
                              </button>
                              <div className="border-t border-gray-100 mx-2" />
                              <div className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Move to</div>
                              {allFolders.map(f => (
                                <button key={f} onClick={() => handleMoveToFolder(item.id, f)}
                                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium transition-all ${item.folder === f ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'}`}>
                                  <span className="text-xs">{folderConfig[f]?.icon || '📁'}</span> {f}
                                </button>
                              ))}
                              <div className="border-t border-gray-100 mx-2" />
                              <button onClick={() => { onDelete(item.id); setContextMenuId(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-all">
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 px-4 pb-1.5 flex-wrap">
                            {item.tags.map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[8px] font-semibold border border-indigo-100">{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Code Preview */}
                        <div className="px-4 pb-2">
                          <div className={`bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 ${expandedCodeId === item.id ? 'max-h-[400px]' : 'max-h-[80px]'}`}>
                            <pre className="text-[10px] font-mono leading-relaxed p-3 overflow-auto text-gray-700"
                              dangerouslySetInnerHTML={{ __html: expandedCodeId === item.id ? highlightPython(item.code) : highlightPython(truncateCode(item.code, 3)) }} />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 px-4 pb-3 flex-wrap">
                          {onRun && (
                            <button onClick={() => { onSelect(item.code); onRun(item.code); onClose(); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all">
                              <Play className="w-3 h-3" /> Run
                            </button>
                          )}
                          <button onClick={() => { onSelect(item.code); onClose(); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:shadow-md hover:shadow-blue-500/10 active:scale-95 transition-all">
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleCopy(item.id, item.code); }}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold border active:scale-95 transition-all ${copiedId === item.id ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-md shadow-emerald-500/10' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:shadow-md hover:shadow-gray-500/5'}`}>
                            {copiedId === item.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                          <button onClick={() => setExpandedCodeId(expandedCodeId === item.id ? null : item.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-violet-50 text-violet-600 border border-violet-200 hover:bg-violet-100 hover:shadow-md hover:shadow-violet-500/10 active:scale-95 transition-all">
                            {expandedCodeId === item.id ? <><EyeOff className="w-3 h-3" /> Less</> : <><Eye className="w-3 h-3" /> View</>}
                          </button>
                          {onExplain && (
                            <button onClick={() => { onSelect(item.code); onExplain(item.code); onClose(); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 hover:shadow-md hover:shadow-amber-500/10 active:scale-95 transition-all">
                              <Sparkles className="w-3 h-3" /> AI
                            </button>
                          )}
                          <div className="flex-1" />
                          <button onClick={e => { e.stopPropagation(); onToggleImportant(item.id); }}
                            className={`p-1.5 rounded-lg transition-all ${item.isImportant ? 'text-amber-400 bg-amber-50 hover:bg-amber-100 shadow-sm' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}>
                            <Star className={`w-3 h-3 ${item.isImportant ? 'fill-amber-400' : ''}`} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Mobile Long Press */}
                        <AnimatePresence>
                          {longPressId === item.id && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-3 p-5 rounded-2xl">
                              <p className="text-[12px] font-bold text-gray-800">{item.title}</p>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                {onRun && <button onClick={() => { onSelect(item.code); onRun(item.code); onClose(); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-[11px] font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/20">▶️ Run</button>}
                                <button onClick={() => { onSelect(item.code); onClose(); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-[11px] font-bold bg-blue-500 text-white shadow-md shadow-blue-500/20">✏️ Edit</button>
                                <button onClick={() => { handleCopy(item.id, item.code); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-[11px] font-bold bg-gray-500 text-white shadow-md shadow-gray-500/20">📋 Copy</button>
                                <button onClick={() => { onDelete(item.id); setLongPressId(null); }} className="px-4 py-2 rounded-xl text-[11px] font-bold bg-red-500 text-white shadow-md shadow-red-500/20">🗑️ Delete</button>
                              </div>
                              <button onClick={() => setLongPressId(null)} className="mt-1 text-[11px] text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
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

/* ═══════ SIDEBAR ITEM COMPONENT ═══════ */
function SidebarItem({ label, icon, count, isActive, color, onClick }: {
  label: string; icon: string; count: number; isActive: boolean; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 text-[12px] font-semibold group relative overflow-hidden ${
        isActive ? 'text-white shadow-lg' : 'text-gray-600 hover:bg-white hover:shadow-sm hover:scale-[1.02]'
      }`}
      style={isActive ? {
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        boxShadow: `0 4px 15px -3px ${color}40`,
      } : {}}
    >
      {/* Active left accent */}
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] rounded-r-full bg-white/60" />}

      <span className={`text-sm transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[22px] text-center transition-all ${
        isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
      }`}>{count}</span>
    </button>
  );
}
