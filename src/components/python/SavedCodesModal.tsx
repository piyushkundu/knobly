'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Star, Download, Save, Search, Code2, Play, Copy, Pencil, Eye, EyeOff, Sparkles, Check, FolderOpen, FolderPlus, ChevronLeft, ChevronRight, Plus, MoreVertical, Palette, Tag } from 'lucide-react';
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

const PRESET_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'];

function highlightPython(code: string): string {
  const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|and|or|not|in|is|True|False|None|pass|break|continue|raise|global|nonlocal|assert|del|print|input|range|len|int|str|float|list|dict|set|tuple|type|map|filter|zip|enumerate|sorted|reversed|open|super|self)\b/g;
  const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const comments = /(#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
    let h = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(comments, '<span style="color:#6b7280;font-style:italic">$1</span>')
    .replace(strings, '<span style="color:#059669">$1</span>')
    .replace(keywords, '<span style="color:#7c3aed;font-weight:bold">$1</span>')
    .replace(numbers, '<span style="color:#d97706">$1</span>');
  return h;
}

function highlightPythonDark(code: string): string {
  const keywords = /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|and|or|not|in|is|True|False|None|pass|break|continue|raise|global|nonlocal|assert|del|print|input|range|len|int|str|float|list|dict|set|tuple|type|map|filter|zip|enumerate|sorted|reversed|open|super|self)\b/g;
  const strings = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const comments = /(#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
    let h = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(comments, '<span style="color:#64748b;font-style:italic">$1</span>')
    .replace(strings, '<span style="color:#34d399">$1</span>')
    .replace(keywords, '<span style="color:#c084fc;font-weight:bold">$1</span>')
    .replace(numbers, '<span style="color:#fbbf24">$1</span>');
    
  return h.split('\n').map((line, i) => `<span class="opacity-30 mr-3 text-[9px] select-none inline-block w-5 text-right border-r border-slate-700/50 pr-2">${i + 1}</span>${line}`).join('\n');
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
  onSave: (title: string, code: string, tags?: string[], folder?: string, lastOutput?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleImportant: (id: string) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<Pick<SavedCodeItem, 'title' | 'code' | 'tags' | 'folder' | 'isImportant' | 'lastOutput'>>) => Promise<void>;
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
  const [customFolders, setCustomFolders] = useState<{ name: string; color: string; icon: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('knobly-custom-folders');
      if (saved) { try { return JSON.parse(saved); } catch { return [...DEFAULT_FOLDERS]; } }
      localStorage.setItem('knobly-custom-folders', JSON.stringify(DEFAULT_FOLDERS));
    }
    return [...DEFAULT_FOLDERS];
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<{ id: string, x: number, y: number, item: SavedCodeItem } | null>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<{ name: string, x: number, y: number, isCustom: boolean } | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string | null>(null);
  const [editFolderNameInput, setEditFolderNameInput] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(null);
  
  // Mobile long press
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (showSaveInput) handleSave();
        else setShowSaveInput(true);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSaveInput, currentCode, saveTitle, saveTags, saveFolder, activeFolder, onSave]);



  const saveCustomFolders = (updated: { name: string; color: string; icon: string }[]) => {
    setCustomFolders(updated);
    localStorage.setItem('knobly-custom-folders', JSON.stringify(updated));
  };

  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowSaveInput(initialShowSaveInput || false);
      setSaveTitle(''); setSaveTags([]); setExpandedCodeId(null); setEditingId(null); setActiveMenu(null); setFolderContextMenu(null); setEditingFolderName(null);
    }
  }, [isOpen, initialShowSaveInput]);

  const allFolders = useMemo(() => {
    const s = new Set<string>();
    customFolders.forEach(f => s.add(f.name));
    codes.forEach(c => { if (c.folder) s.add(c.folder); });
    return Array.from(s);
  }, [codes, customFolders]);

  const folderConfig = useMemo(() => {
    const m: Record<string, { color: string; icon: string; isCustom: boolean }> = {};
    customFolders.forEach(f => { m[f.name] = { color: f.color, icon: f.icon, isCustom: true }; });
    codes.forEach(c => { if (c.folder && !m[c.folder]) m[c.folder] = { color: '#94a3b8', icon: '📁', isCustom: true }; });
    return m;
  }, [codes, customFolders]);

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
    await onSave(saveTitle || `Code ${new Date().toLocaleString()}`, currentCode, saveTags, saveFolder);
    setSaveTitle(''); setSaveTags([]); setSaveFolder(''); setShowSaveInput(false); setIsSaving(false);
    showToast('✔ Code Saved successfully!');
  };

  const handleCopy = useCallback(async (id: string, code: string) => {
    try { await navigator.clipboard.writeText(code); } catch {
      const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
    showToast('📋 Code copied to clipboard');
  }, [showToast]);

  const handleStartEdit = (item: SavedCodeItem) => { setEditingId(item.id); setEditTitle(item.title); setActiveMenu(null); };
  const handleSaveEdit = async (id: string) => { if (onUpdate && editTitle.trim()) await onUpdate(id, { title: editTitle.trim() }); setEditingId(null); };
  const toggleSaveTag = (tag: string) => setSaveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || allFolders.includes(newFolderName.trim())) return;
    const name = newFolderName.trim();
    const icons = ['📁', '📂', '💼', '🗂️', '📦', '🎯', '💡', '🌟', '🔮', '🧩'];
    const idx = customFolders.length % PRESET_COLORS.length;
    const nf = { name, color: PRESET_COLORS[idx], icon: icons[idx] };
    saveCustomFolders([...customFolders, nf]);
    setNewFolderName(''); setShowCreateFolder(false); setActiveFolder(nf.name);
  };

  const renameFolder = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName || allFolders.includes(trimmed)) { setEditingFolderName(null); return; }
    
    // update custom folders
    const updatedFolders = customFolders.map(f => f.name === oldName ? { ...f, name: trimmed } : f);
    saveCustomFolders(updatedFolders);
    
    // update all codes
    const codesToUpdate = codes.filter(c => c.folder === oldName);
    for (const c of codesToUpdate) {
      if (onUpdate) await onUpdate(c.id, { folder: trimmed });
    }
    
    if (activeFolder === oldName) setActiveFolder(trimmed);
    setEditingFolderName(null); setFolderContextMenu(null);
  };

  const deleteFolder = async (folderName: string) => {
    const isCustom = customFolders.some(f => f.name === folderName);
    if (!isCustom) {
      // Just unfile the codes
      const codesToUpdate = codes.filter(c => c.folder === folderName);
      for (const c of codesToUpdate) { if (onUpdate) await onUpdate(c.id, { folder: '' }); }
    } else {
      // Delete custom folder and unfile codes
      saveCustomFolders(customFolders.filter(f => f.name !== folderName));
      const codesToUpdate = codes.filter(c => c.folder === folderName);
      for (const c of codesToUpdate) { if (onUpdate) await onUpdate(c.id, { folder: '' }); }
    }
    if (activeFolder === folderName) setActiveFolder('all');
    setFolderContextMenu(null);
  };

  const changeFolderColor = (folderName: string, color: string) => {
    saveCustomFolders(customFolders.map(f => f.name === folderName ? { ...f, color } : f));
    setFolderContextMenu(null);
  };

  // Drag and Drop
  const handleMoveToFolder = async (id: string, folder: string) => { if (onUpdate) await onUpdate(id, { folder: folder === 'unfiled' ? '' : folder }); setActiveMenu(null); showToast(`📁 Moved to ${folder === 'unfiled' ? 'Unfiled' : folder}`); };
  
  const onDragStartCode = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('code_id', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Duplicate Code
  const handleDuplicate = async (item: SavedCodeItem) => { await onSave(item.title + ' (copy)', item.code, item.tags, item.folder, item.lastOutput); setActiveMenu(null); showToast('📄 Snippet duplicated successfully!'); };
  
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
            className="fixed inset-2 sm:inset-3 md:inset-auto md:top-[2%] md:left-1/2 md:-translate-x-1/2 md:w-[940px] md:max-h-[96vh] bg-white rounded-2xl z-[201] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col border border-gray-200/80"
          >
            {/* ═══════ HEADER ═══════ */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shrink-0 relative overflow-hidden" onClick={() => { setActiveMenu(null); setFolderContextMenu(null); }}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-md">
                    <path fill="#FFCA28" d="M20,6h-8l-2-2H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z"/>
                    <path fill="#FFD54F" d="M20,8H4v10h16V8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[16px] font-black tracking-wide !text-white drop-shadow-sm">File Manager</h2>
                  <span className="text-[10px] font-medium !text-white/80 block">{codes.length} code{codes.length !== 1 ? 's' : ''} • Last saved {lastSaved}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 relative z-10">
                <button onClick={() => setShowSaveInput(true)} disabled={!currentCode.trim()} title="Save New Code"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold !bg-white/10 !text-white border border-white/20 hover:!bg-white/20 active:scale-95 transition-all disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add Code</span>
                </button>
                <div className="w-px h-5 bg-white/20 mx-1" />
                <button onClick={handleDownloadPDF} disabled={codes.length === 0} title="Export PDF"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold !bg-red-500 !text-white border border-red-400 hover:!bg-red-600 active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-red-500/20">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={onClose} className="p-1.5 rounded-xl !bg-white/10 hover:!bg-white/20 transition-all border border-white/15 group">
                  <X className="w-5 h-5 !text-white stroke-[2.5] group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* ═══════ BODY ═══════ */}
            <div className="flex flex-1 overflow-hidden min-h-0" onClick={() => { setActiveMenu(null); setFolderContextMenu(null); }}>

              {/* ─── SIDEBAR ─── */}
              <AnimatePresence initial={false}>
                {sidebarOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="border-r border-gray-100 bg-gradient-to-b from-gray-50/80 to-white flex flex-col shrink-0 overflow-hidden relative z-10 shadow-[2px_0_15px_rgba(0,0,0,0.02)]"
                  >
                    <div className="px-4 pt-5 pb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">📁 Folders</span>
                      <button onClick={() => setShowCreateFolder(true)} className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors tooltip" title="New Folder">
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-0.5 no-scrollbar">
                      {/* Standard folders */}
                      <SidebarItem label="All Codes" id="all" icon="📂" count={folderCounts.all} isActive={activeFolder === 'all'} color="#6366f1" onClick={() => setActiveFolder('all')} onDrop={handleMoveToFolder} />
                      <SidebarItem label="Unfiled" id="unfiled" icon="📄" count={folderCounts.unfiled || 0} isActive={activeFolder === 'unfiled'} color="#f97316" onClick={() => setActiveFolder('unfiled')} onDrop={handleMoveToFolder} />

                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

                      {/* Custom/Code folders */}
                      {allFolders.map(name => {
                        const cfg = folderConfig[name];
                        const isEditing = editingFolderName === name;

                        return (
                          <div key={name} className="relative">
                            {isEditing ? (
                              <div className="px-2 py-1.5 flex gap-1 bg-white border border-indigo-300 shadow-sm rounded-lg mb-0.5">
                                <input type="text" value={editFolderNameInput} onChange={e => setEditFolderNameInput(e.target.value)} autoFocus
                                  onKeyDown={e => { if (e.key === 'Enter') renameFolder(name, editFolderNameInput); if (e.key === 'Escape') setEditingFolderName(null); }}
                                  className="flex-1 min-w-0 text-xs text-gray-800 outline-none" />
                                <button onClick={() => renameFolder(name, editFolderNameInput)} className="text-indigo-500"><Check className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <SidebarItem label={name} id={name} icon={cfg.icon} count={folderCounts[name] || 0} isActive={activeFolder === name} color={cfg.color} onClick={() => setActiveFolder(name)} onDrop={handleMoveToFolder}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  if (folderContextMenu?.name === name) { setFolderContextMenu(null); return; }
                                  setFolderContextMenu({ name, x: e.clientX, y: e.clientY, isCustom: cfg.isCustom });
                                }} />
                            )}
                          </div>
                        );
                      })}

                      {/* Create Folder Box */}
                      {showCreateFolder && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 p-2.5 bg-white rounded-xl border border-indigo-200 shadow-lg shadow-indigo-500/10 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                          <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowCreateFolder(false); }}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-800 focus:outline-none focus:border-indigo-400 mb-2" />
                          <div className="flex gap-1.5">
                            <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-sm">Save</button>
                            <button onClick={() => setShowCreateFolder(false)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"><X className="w-3 h-3" /></button>
                          </div>
                        </motion.div>
                      )}

                      {/* Prominent Neon New Folder Button */}
                      {!showCreateFolder && (
                        <button onClick={() => setShowCreateFolder(true)}
                          className="w-full relative group flex items-center justify-center gap-2 mt-4 px-3 py-2.5 rounded-xl text-[11px] font-bold text-indigo-100 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/50 hover:border-purple-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-inner" />
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                          <FolderPlus className="w-4 h-4 shadow-sm relative z-10 text-white" />
                          <span className="relative z-10 !text-white drop-shadow-sm" style={{ color: '#ffffff' }}>New Folder</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sidebar Toggle Handle */}
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute z-20 left-0 bottom-6 p-1 rounded-r-lg bg-white border border-l-0 border-gray-200 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 hover:w-8 transition-all shadow-md md:hidden flex justify-center"
                style={sidebarOpen ? { left: '220px' } : { left: '0px' }}
              >
                {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {/* ─── MAIN CONTENT ─── */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/40">

                {/* Top Headers: Stats & Search & Save */}
                <div className="px-5 py-3 border-b border-gray-100 space-y-3 shrink-0 bg-white/70 backdrop-blur-md relative z-10 shadow-sm">
                  
                  {/* Elite Stats Row */}
                  <div className="flex items-center gap-3 text-[11px] overflow-x-auto no-scrollbar font-medium">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <span className="text-[13px]">📊</span> <b className="text-gray-800 text-xs">{filteredCodes.length}</b> Codes
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <span className="text-[13px]">⭐</span> <b className="text-amber-600 text-xs">{codes.filter(c => c.isImportant).length}</b> Important
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <span className="text-[13px]">🕒</span> <b className="text-gray-800">{lastSaved}</b>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100/50">
                      <span className="text-[12px]">🐍</span> <b className="text-indigo-600 text-xs">Python</b>
                    </div>
                    
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden ml-auto p-1.5 rounded-lg bg-indigo-50 text-indigo-500 border border-indigo-100 shadow-sm">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Save New Block */}
                  <AnimatePresence>
                    {showSaveInput && (
                      <motion.div initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-xl border border-indigo-100 p-3 shadow-lg shadow-indigo-500/5 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <input type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Enter code title..." autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()}
                            className="flex-1 bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                          <button onClick={handleSave} disabled={isSaving || !currentCode.trim()} className="flex items-center justify-center min-w-[80px] px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-40 transition-all">
                            {isSaving ? '...' : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
                          </button>
                          <button onClick={() => { setShowSaveInput(false); setSaveTitle(''); setSaveTags([]); }} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors bg-gray-50">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Save to:</span>
                          <select value={saveFolder} onChange={(e) => setSaveFolder(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold rounded-md px-2 py-1 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer">
                            <option value="">📄 Unfiled</option>
                            {allFolders.map(f => (
                              <option key={f} value={f}>{folderConfig[f]?.icon || '📁'} {f}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Search and Tag Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search snippets, tags, code..."
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all" />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar sm:max-w-[50%] pt-1 sm:pt-0">
                      {[{ key: 'all', label: 'All', c: 'indigo' }, { key: 'important', label: '⭐ Important', c: 'amber' }].map(f => (
                        <button key={f.key} onClick={() => setTagFilter(f.key as typeof tagFilter)}
                          className={`h-8 px-4 flex items-center justify-center min-w-[60px] rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all whitespace-nowrap border ${tagFilter === f.key ? `bg-${f.c}-500 !text-white border-${f.c}-500 shadow-md shadow-${f.c}-500/30` : `bg-transparent text-gray-500 border-gray-300 hover:border-${f.c}-400 hover:text-${f.c}-500 hover:bg-${f.c}-50/50 hover:shadow-sm`}`}
                          style={tagFilter === f.key ? { backgroundColor: f.c === 'amber' ? '#f59e0b' : '#6366f1', borderColor: f.c === 'amber' ? '#f59e0b' : '#6366f1', color: '#ffffff' } : {}}>
                          {f.label}
                        </button>
                      ))}
                      {defaultTagsFilters(allTags, tagFilter, setTagFilter)}
                    </div>
                  </div>
                </div>

                {/* ═══════ CODE LIST (WITH DRAG & DROP) ═══════ */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-gray-400">Loading magic...</span>
                    </div>
                  ) : filteredCodes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center animate-fade-in">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 shadow-inner">
                        <Code2 className="w-8 h-8 text-indigo-300" />
                      </div>
                      <p className="text-[13px] font-bold text-gray-800">{codes.length === 0 ? 'Your vault is empty' : 'No matching codes found'}</p>
                      <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">{codes.length === 0 ? 'Click "Add Code" to save your current work here.' : 'Try taking out some filters.'}</p>
                    </div>
                  ) : (
                    filteredCodes.map((item, idx) => (
                      <motion.div key={item.id}
                        draggable
                        onDragStart={(e) => onDragStartCode(e as any, item.id)}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.04, 0.4), ease: 'easeOut' }}
                        className="group relative rounded-2xl border border-gray-200/80 bg-white/90 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.12)] hover:border-indigo-300"
                        style={{ backdropFilter: 'blur(10px)' }}
                        onTouchStart={() => handleTouchStart(item.id)} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd}
                      >
                        {/* Interactive Folder Color border */}
                        {item.folder && folderConfig[item.folder] && (
                          <div className="absolute top-0 left-0 w-[2px] opacity-0 h-full transition-all duration-300 group-hover:opacity-100 group-hover:w-[3px]" style={{ backgroundColor: folderConfig[item.folder].color }} />
                        )}

                        <div className="px-5 pt-4 pb-2">
                          {/* Header Line */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {item.isImportant && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 drop-shadow-sm" />}
                              {editingId === item.id ? (
                                <div className="flex items-center gap-1.5 flex-1">
                                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} autoFocus
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                                    className="flex-1 bg-white border border-indigo-400 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 shadow-[0_0_0_3px_rgba(99,102,241,0.2)] outline-none" />
                                  <button onClick={() => handleSaveEdit(item.id)} className="p-1 rounded-lg bg-indigo-500 text-white shadow-md"><Check className="w-3.5 h-3.5" /></button>
                                </div>
                              ) : (
                                <span className="text-[14px] font-extrabold text-gray-800 truncate">{item.title}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-semibold text-gray-400 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">{relativeTime(item.createdAt)}</span>
                              {/* Action Menu (Vertical Dots) */}
                              <div className="relative">
                                <button onClick={e => {
                                  e.stopPropagation();
                                  if (activeMenu?.id === item.id) { setActiveMenu(null); return; }
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const yOffsets = rect.bottom + 250 > window.innerHeight ? rect.top - 200 : rect.bottom + 8;
                                  setActiveMenu({ id: item.id, x: rect.right, y: yOffsets, item });
                                  setFolderContextMenu(null);
                                }} className="p-2 ml-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Folder Badge & Tags Inline */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {item.folder && folderConfig[item.folder] && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border shadow-sm" style={{ backgroundColor: `${folderConfig[item.folder].color}12`, borderColor: `${folderConfig[item.folder].color}30`, color: folderConfig[item.folder].color }}>
                                {folderConfig[item.folder].icon} {item.folder}
                              </div>
                            )}
                            {item.tags?.map(tag => (
                              <button key={tag} onClick={(e) => { e.stopPropagation(); setTagFilter(tag); }} className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 hover:border-purple-200 text-[9px] font-bold border border-gray-200 transition-colors active:scale-95">#{tag}</button>
                            ))}
                          </div>

                          {/* Code Preview Box Dark Mode */}
                          <div className={`relative bg-[#0f172a] rounded-xl border border-slate-700 shadow-inner overflow-hidden transition-all duration-300 group/code ${expandedCodeId === item.id ? 'max-h-[500px]' : 'max-h-[90px]'}`}>
                            {/* Window dots decoration */}
                            <div className="absolute top-0 left-0 w-full h-7 bg-slate-800/80 border-b border-slate-700/50 flex items-center px-3 gap-1.5 z-10 backdrop-blur-sm">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="ml-auto text-[9px] font-bold !text-white uppercase tracking-wider" style={{ color: '#ffffff' }}>snippet.py</span>
                            </div>
                            <pre className="text-[11px] font-mono leading-relaxed p-4 pt-9 overflow-auto !text-white"
                              dangerouslySetInnerHTML={{ __html: expandedCodeId === item.id ? highlightPythonDark(item.code) : highlightPythonDark(truncateCode(item.code, 4)) }} />
                            {item.lastOutput && (
                              <div className="border-t border-slate-700/80 bg-slate-900/80">
                                <div className="px-4 py-1.5 text-[9px] font-bold !text-white uppercase tracking-widest bg-slate-800/50 border-b border-slate-800" style={{ color: '#ffffff' }}>🚀 Last Output:</div>
                                <pre className="text-[10px] font-mono leading-relaxed px-4 py-3 text-emerald-400 overflow-x-auto">
                                  {expandedCodeId === item.id ? item.lastOutput : truncateCode(item.lastOutput, 3)}
                                </pre>
                              </div>
                            )}
                            {expandedCodeId !== item.id && <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none" />}
                          </div>

                          {/* Primary Actions (Run, Edit, Copy) */}
                          <div className="flex items-center gap-2 mt-4 flex-wrap">
                            {onRun && (
                              <button onClick={() => { onSelect(item.code); onRun(item.code); onClose(); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-br from-[#00c853] to-[#64dd17] text-white shadow-[0_0_15px_rgba(0,200,83,0.5)] hover:shadow-[0_0_20px_rgba(0,200,83,0.7)] hover:scale-[1.03] active:scale-95 transition-all">
                                <Play className="w-3.5 h-3.5 fill-current" /> RUN
                              </button>
                            )}
                            <button onClick={() => { onSelect(item.code); onClose(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:shadow-md transition-all active:scale-95">
                              <Pencil className="w-3.5 h-3.5" /> EDIT
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleCopy(item.id, item.code); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border hover:shadow-md transition-all active:scale-95 ${copiedId === item.id ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                              {copiedId === item.id ? <><Check className="w-3.5 h-3.5" /> COPIED</> : <><Copy className="w-3.5 h-3.5" /> COPY</>}
                            </button>
                            
                            <div className="flex-1" />
                            
                            {/* Secondary Desktop Actions */}
                            <button onClick={() => setExpandedCodeId(expandedCodeId === item.id ? null : item.id)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all active:scale-95 hidden sm:flex">
                              {expandedCodeId === item.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {expandedCodeId === item.id ? 'Collapse' : 'Full Preview'}
                            </button>
                            {onExplain && (
                              <button onClick={() => { onSelect(item.code); onExplain(item.code); onClose(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 hover:shadow shadow-amber-500/10 transition-all active:scale-95 hidden sm:flex">
                                <Sparkles className="w-3 h-3" /> AI Explain
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); onToggleImportant(item.id); }} className={`p-2 rounded-lg transition-all border ${item.isImportant ? 'bg-amber-50 text-amber-400 border-amber-200 shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:text-amber-400 hover:border-amber-300 hover:bg-amber-50'}`}>
                              <Star className={`w-3.5 h-3.5 ${item.isImportant ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Action Longpress Sheet */}
                        <AnimatePresence>
                          {longPressId === item.id && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
                              <p className="text-[14px] font-black text-gray-800 mb-4">{item.title}</p>
                              <div className="grid grid-cols-2 gap-3 w-full max-w-[200px]">
                                {onRun && <button className="py-2.5 rounded-xl text-[11px] font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" onClick={() => { onSelect(item.code); onRun(item.code); onClose(); setLongPressId(null); }}>▶️ Run</button>}
                                <button className="py-2.5 rounded-xl text-[11px] font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" onClick={() => { onSelect(item.code); onClose(); setLongPressId(null); }}>✏️ Edit</button>
                                <button className="py-2.5 rounded-xl text-[11px] font-bold bg-gray-700 text-white shadow-lg" onClick={() => { handleCopy(item.id, item.code); setLongPressId(null); }}>📋 Copy</button>
                                <button className="py-2.5 rounded-xl text-[11px] font-bold bg-red-500 text-white shadow-lg shadow-red-500/30" onClick={() => { onDelete(item.id); setLongPressId(null); }}>🗑️ Delete</button>
                              </div>
                              <button onClick={() => setLongPressId(null)} className="mt-5 text-[11px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider">Cancel</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                  {/* End of List Graphic */}
                  <div className="py-12 mt-4 flex flex-col items-center justify-center opacity-70">
                    <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                      🚀
                    </div>
                    <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest">You've reached the end!</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-1">Keep coding and saving magic snippets.</p>
                  </div>
                  <div className="h-4" />
                </div>
              </div>
            </div>
            {/* Global Toast */}
            <AnimatePresence>
              {toastMsg && (
                <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] px-5 py-2.5 rounded-full bg-gray-900/90 backdrop-blur-md text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-gray-700 font-bold text-[11px] tracking-wider pointer-events-none">
                  {toastMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Global Confirm Modal */}
          <AnimatePresence>
            {confirmAction && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] overflow-hidden w-[320px] border border-gray-100 relative max-w-[90vw]" onClick={e => e.stopPropagation()}>
                  <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
                      <Trash2 className="w-6 h-6 text-red-500 drop-shadow-sm" />
                    </div>
                    <h3 className="text-[16px] font-black text-gray-900 mb-1.5 tracking-wide">Confirm Deletion</h3>
                    <p className="text-[12px] font-medium text-gray-500 mb-6">{confirmAction.message}</p>
                    <div className="flex gap-2.5 w-full">
                      <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl font-bold text-[12px] text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200/50">Cancel</button>
                      <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] text-white bg-red-500 hover:bg-red-600 transition-all shadow-md shadow-red-500/25 active:scale-95"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Folder Context Menu */}
          <AnimatePresence>
            {folderContextMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ position: 'fixed', top: folderContextMenu.y, left: folderContextMenu.x, transformOrigin: 'top left' }}
                className="z-[999] w-40 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/80 shadow-2xl shadow-gray-400/50 overflow-hidden"
                onClick={e => e.stopPropagation()}>
                {folderContextMenu.isCustom && (
                  <button onClick={() => { setEditingFolderName(folderContextMenu.name); setEditFolderNameInput(folderContextMenu.name); setFolderContextMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-indigo-50/80 transition-all">
                    <Pencil className="w-3 h-3" /> Rename
                  </button>
                )}
                
                <button onClick={() => { setFolderContextMenu(null); setConfirmAction({ message: `Are you sure you want to delete folder '${folderContextMenu.name}'?`, onConfirm: () => deleteFolder(folderContextMenu.name) }); }} className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-700 hover:bg-indigo-50/80 transition-all">
                  <Trash2 className="w-3 h-3" /> {folderContextMenu.isCustom ? 'Delete' : 'Remove Empty'}
                </button>

                {folderContextMenu.isCustom && (
                  <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-1">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => changeFolderColor(folderContextMenu.name, c)} className="w-4 h-4 rounded-full border border-black/10 transition-transform hover:scale-125 hover:shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Floating 3-dot Menu */}
          <AnimatePresence>
            {activeMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ position: 'fixed', top: activeMenu.y, left: activeMenu.x - 192, transformOrigin: 'top right' }}
                className="z-[999] w-48 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/80 shadow-2xl shadow-gray-400/50 overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <button onClick={() => { handleStartEdit(activeMenu.item); setActiveMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-indigo-50/80 transition-all border-b border-gray-100"><Pencil className="w-3.5 h-3.5 text-indigo-500" /> Rename Snippet</button>
                <button onClick={() => { setActiveMenu(null); setConfirmAction({ message: 'Do you want to delete this code snippet?', onConfirm: () => onDelete(activeMenu.id) }); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-indigo-50/80 transition-all border-b border-gray-100"><Trash2 className="w-3.5 h-3.5 text-gray-500" /> Delete Snippet</button>
                <button onClick={() => handleDuplicate(activeMenu.item)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-purple-50/80 transition-all border-b border-gray-100"><Copy className="w-3.5 h-3.5 text-purple-500" /> Duplicate</button>
                <div className="px-3 pt-2 pb-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">Move to Folder</div>
                <div className="pb-1 max-h-[120px] overflow-y-auto no-scrollbar">
                  <button onClick={() => handleMoveToFolder(activeMenu.id, 'unfiled')} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:bg-gray-100"><span className="text-[14px]">📄</span> Unfiled</button>
                  {allFolders.map(f => (
                    <button key={f} onClick={() => handleMoveToFolder(activeMenu.id, f)} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-indigo-50 transition-all"><span className="text-[14px]">{folderConfig[f]?.icon || '📁'}</span> {f}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </>
      )}
    </AnimatePresence>
  );
}

// SidebarItem with Elite UI styling and Drop Target handling
function SidebarItem({ label, id, icon, count, isActive, color, onClick, onDrop, onContextMenu }: {
  label: string; id: string; icon: string; count: number; isActive: boolean; color: string; onClick: () => void;
  onDrop: (codeId: string, folderName: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const codeId = e.dataTransfer.getData('code_id'); if (codeId) onDrop(codeId, id); }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-300 text-[12px] font-bold group overflow-hidden cursor-pointer select-none ${
        isActive 
          ? 'text-gray-800' 
          : isDragOver 
            ? 'bg-gray-200 scale-105 border-dashed border border-gray-400'
            : 'text-gray-600 hover:bg-white hover:shadow-sm hover:translate-x-1'
      }`}
      style={isActive ? {
        background: `${color}1A`, // 10% opacity
        color: '#1f2937', 
        borderLeft: `3px solid ${color}`
      } : {}}
    >
      <span className={`text-base transition-transform duration-300 ${isActive || isDragOver ? 'scale-125' : 'group-hover:scale-110 drop-shadow-sm'}`}>{icon}</span>
      <span className="flex-1 truncate group-hover:text-gray-900 transition-colors" style={isActive ? { color: color, fontWeight: 900 } : {}}>{label}</span>
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full min-w-[24px] text-center transition-all shadow-sm ${
        isActive ? 'text-white' : 'group-hover:opacity-80'
      } mr-6`} style={isActive ? { backgroundColor: color, boxShadow: `0 4px 10px ${color}60` } : { backgroundColor: `${color}26`, color: color }}>{count}</span>
      {onContextMenu && (
        <button onClick={(e) => { e.stopPropagation(); onContextMenu(e); }} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-all z-10 hidden sm:block">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// Small helper for tags map
function defaultTagsFilters(allTags: string[], tagFilter: string, setTagFilter: (v: string) => void) {
  return allTags.map(tag => (
    <button key={tag} onClick={() => setTagFilter(tagFilter === tag ? 'all' : tag)}
      className={`h-8 px-4 flex items-center justify-center min-w-[60px] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${tagFilter === tag ? 'text-white border-purple-500 shadow-sm shadow-purple-500/20' : 'bg-transparent text-gray-500 border-gray-300 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50/50 hover:shadow-sm'}`}
      style={tagFilter === tag ? { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6', color: 'white' } : {}}>
      #{tag}
    </button>
  ));
}
