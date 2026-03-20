'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, History, Sparkles, Code2, Zap, Sun, Moon, Trash2, ChevronLeft, Save, FolderOpen, User, LogIn, LogOut, Globe, Bot, ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PythonCodeEditor } from './PythonCodeEditor';
import { PythonConsole } from './PythonConsole';
import { PythonHistory } from './PythonHistory';
import { PythonAskAIModal } from './PythonAskAIModal';
import { SavedCodesModal } from './SavedCodesModal';
import LoginModal from '@/components/auth/LoginModal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Toggle } from './ui/Toggle';
import { usePyodide } from '@/hooks/usePyodide';
import { useAIExplain } from '@/hooks/useAIExplain';
import { useCodeHistory } from '@/hooks/useCodeHistory';
import { useSavedCodes } from '@/hooks/useSavedCodes';
import { useAuth } from '@/context/AuthContext';
import { CodeHistoryItem, Language, HelpMode } from '@/types/python';
import { cn } from '@/lib/python-utils';

const DEFAULT_CODE = `# Welcome to AI Python Learning Lab!
# Write your Python code here and click Run to execute

print("Hello, World!")

# Try creating an error to see AI explanation:
# print(undefined_variable)
`;

import './python-lab.css';

export function PythonLab() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [helpMode, setHelpMode] = useState<HelpMode>('manual');
  const [showHistory, setShowHistory] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);
  const [showSavedCodes, setShowSavedCodes] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastExecution, setLastExecution] = useState<{ code: string; error: string } | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mobileTab, setMobileTab] = useState<'editor' | 'console'>('editor');
  // Interactive prompt state - re-run with accumulation approach
  const [terminalLines, setTerminalLines] = useState<Array<{ type: 'prompt' | 'input'; text: string }>>([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [startSavingCode, setStartSavingCode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  // Ref to resolve when user submits input
  const inputResolveRef = useRef<((value: string) => void) | null>(null);
  const collectedInputsRef = useRef<string[]>([]);
  const terminalLinesRef = useRef<Array<{ type: 'prompt' | 'input'; text: string }>>([]);
  const isRunningRef = useRef(false);
  const router = useRouter();

  const { isLoading: isPyodideLoading, isReady: isPyodideReady, executeCode } = usePyodide();
  const { isLoading: isAILoading, explanation, error: aiError, explainError, clearExplanation } = useAIExplain();
  const { history, saveToHistory, deleteFromHistory } = useCodeHistory();
  const { user, logout } = useAuth();
  const { codes, isLoading: isSavedCodesLoading, isLoggedIn, saveCode, deleteCode, toggleImportant } = useSavedCodes();

  const handleSaveCode = useCallback(async (title: string, codeToSave: string) => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    await saveCode(title, codeToSave);
  }, [isLoggedIn, saveCode]);

  const handleEditorSave = useCallback(() => {
    if (isLoggedIn) {
      setStartSavingCode(true);
      setShowSavedCodes(true);
    } else {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  const handleSelectSavedCode = useCallback((savedCode: string) => {
    setCode(savedCode);
    localStorage.setItem('python-code', savedCode);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('python-lab-language') as Language;
    if (savedLang) setLanguage(savedLang);

    const savedCode = localStorage.getItem('python-code');
    if (savedCode) setCode(savedCode);

    const savedTheme = localStorage.getItem('python-lab-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    } else {

      setTheme('light');
      document.documentElement.classList.add('light');
    }
  }, []);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Handle user submitting input — resolves the waiting promise
  const handlePromptSubmit = useCallback((value: string) => {
    // Add user input to terminal lines
    const newLines = [...terminalLinesRef.current, { type: 'input' as const, text: value }];
    terminalLinesRef.current = newLines;
    setTerminalLines(newLines);
    setWaitingForInput(false);
    // Resolve the pending input promise
    if (inputResolveRef.current) {
      inputResolveRef.current(value);
      inputResolveRef.current = null;
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('python-lab-theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as Language);
    localStorage.setItem('python-lab-language', lang);
  };

  const handleRun = useCallback(async () => {
    if (!isPyodideReady || isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);
    setOutput('');
    setError(null);
    setErrorLine(null);
    clearExplanation();
    setTerminalLines([]);
    terminalLinesRef.current = [];
    setWaitingForInput(false);
    setMobileTab('console');
    collectedInputsRef.current = [];
    inputResolveRef.current = null;

    try {
      // Re-run loop: execute code, if it needs input, prompt user, accumulate, re-run
      let done = false;
      while (!done) {
        const result = await executeCode(code, collectedInputsRef.current);

        if (result.needsInput) {
          // Show the prompt in terminal lines
          const promptText = result.inputPrompt || '';
          const newLines = [...terminalLinesRef.current, { type: 'prompt' as const, text: promptText }];
          terminalLinesRef.current = newLines;
          setTerminalLines(newLines);
          setWaitingForInput(true);

          // Wait for user to submit input
          const userValue = await new Promise<string>((resolve) => {
            inputResolveRef.current = resolve;
          });

          // Add the user's value to accumulated inputs for re-run
          collectedInputsRef.current = [...collectedInputsRef.current, userValue];
          // Continue the loop — code will be re-run with all accumulated inputs
        } else {
          // Code finished (success or real error)
          done = true;
          setTerminalLines([]);
          terminalLinesRef.current = [];
          setWaitingForInput(false);
          setOutput(result.output);

          if (result.error) {
            setError(result.error);
            setErrorLine(result.errorLine);
            setLastExecution({ code, error: result.error });
            if (helpMode === 'auto') {
              await explainError(code, result.error, language);
            }
          } else {
            setLastExecution(null);
          }

          await saveToHistory(code, result.output, result.error);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Execution failed';
      setError(errorMsg);
      setLastExecution({ code, error: errorMsg });
    } finally {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  }, [code, isPyodideReady, executeCode, helpMode, language, explainError, saveToHistory, clearExplanation]);

  const handleGetAIHelp = useCallback(async () => {
    if (lastExecution) {
      await explainError(lastExecution.code, lastExecution.error, language);
    }
  }, [lastExecution, explainError, language]);

  const handleApplyFix = useCallback((fixedCode: string) => {
    setCode(fixedCode);
    setError(null);
    setErrorLine(null);
    setOutput('');
    clearExplanation();
    setMobileTab('editor');
    localStorage.setItem('python-code', fixedCode);
  }, [clearExplanation]);

  const handleClearCode = useCallback(() => {
    setCode('');
    setOutput('');
    setError(null);
    setErrorLine(null);
    clearExplanation();
    localStorage.setItem('python-code', '');
  }, [clearExplanation]);

  const handleClearOutput = useCallback(() => {
    setOutput('');
    setError(null);
    setErrorLine(null);
  }, []);

  const handleSelectHistory = useCallback((item: CodeHistoryItem) => {
    setCode(item.code);
    setOutput(item.output);
    setError(item.error);
    localStorage.setItem('python-code', item.code);
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    deleteFromHistory(id);
  }, [deleteFromHistory]);

  const handleGenerateCode = async (prompt: string) => {
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate code');
      }
      const data = await res.json();
      setCode(data.code);
      localStorage.setItem('python-code', data.code);
    } catch (err) {
      console.error('Failed to generate code:', err);
    }
  };

  return (
    <div className="python-lab-root flex flex-col h-[100dvh]">
      {/* Top Bar */}
      <header className="flex flex-col bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--border-color)] relative z-20 w-full">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)]/50 to-transparent"></div>

        {/* Main Row / Desktop Full Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-3 md:px-6 py-2 md:py-3 w-full gap-2 md:gap-0">

          {/* Top section on mobile: Logo, Title, Run/Ask AI */}
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/')}
                className="h-8 w-8 md:h-9 md:w-9 p-0 mr-1 md:mr-2 rounded-lg flex-shrink-0 shadow-sm"
                title="Back to Home"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-primary)]" />
              </Button>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/30 text-white">
                  <Code2 className="w-4 h-4 md:w-5 md:h-5" color="white" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-[var(--accent-success)] rounded-full border-2 border-[var(--bg-primary)]" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base md:text-lg font-bold leading-tight truncate font-mono tracking-tight">
                  <span className="text-[var(--text-primary)] whitespace-nowrap">
                    AI Python Lab
                  </span>
                </h1>
                <span className="text-[9px] md:text-[10px] text-[var(--text-muted,#64748b)] -mt-0.5 hidden sm:block">Learn Python with AI</span>
              </div>
            </div>

            {/* Mobile Right Actions: EN/HI Toggle */}
            <div className="flex md:hidden items-center ml-2">
              <Toggle
                options={[
                  { value: 'en', label: 'EN' },
                  { value: 'hi', label: 'HI' },
                ]}
                value={language}
                onChange={handleLanguageChange}
                className="flex-shrink-0"
              />
            </div>
          </div>

          {/* Desktop Right Actions / Mobile Bottom Scrollable Tools */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar md:overflow-visible pb-1 md:pb-0 scroll-smooth w-full md:w-auto -mx-1 px-1 md:mx-0 md:px-0 mt-2 md:mt-0">
            {/* Desktop Run Button (First on Desktop) */}
            <div className="hidden md:block flex-shrink-0">
              <Button
                variant="primary"
                onClick={handleRun}
                disabled={!isPyodideReady || isRunning}
                data-run-button
                title="Run Code (F5)"
                className={cn(
                  "w-14 h-14 p-0 flex items-center justify-center rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 text-white bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 border-2 border-white/20",
                  isPyodideReady && !isRunning && 'animate-pulse-glow'
                )}
              >
                {isRunning ? (
                  <div className="w-8 h-8 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    stroke="none"
                    style={{ width: '30px', height: '30px', marginLeft: '3px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </Button>
            </div>

            <div className="hidden md:block w-px h-6 bg-[var(--border-color)] mx-2 flex-shrink-0" />

            {/* Ask AI Button (Mobile Row 2 Only) */}
            <div className="md:hidden flex-shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAskAI(true)}
                className="flex bg-[var(--accent-primary)] hover:opacity-90 border-[var(--accent-primary)] shadow-lg px-3 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Ask AI Question</span>
              </Button>
            </div>

            <div className="hidden md:block w-px h-6 bg-[var(--border-color)] mr-2 flex-shrink-0" />

            {/* Save & My Codes Buttons */}
            <div className="hidden md:flex items-center gap-1.5 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg p-0.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isLoggedIn ? setShowSavedCodes(true) : setShowLoginModal(true)}
                title={isLoggedIn ? 'My Saved Codes' : 'Login to save codes'}
                className="h-7 w-7 md:h-10 md:w-10 p-0"
              >
                <FolderOpen className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-1.5 md:gap-2 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg p-0.5 md:p-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="h-7 w-7 md:h-10 md:w-10 p-0"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 md:w-5 md:h-5" /> : <Moon className="w-3.5 h-3.5 md:w-5 md:h-5" />}
              </Button>

              <div className="w-px h-6 bg-[var(--border-color)] mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="h-7 w-7 md:h-10 md:w-10 p-0"
              >
                <History className="w-3.5 h-3.5 md:w-5 md:h-5" />
              </Button>
            </div>

            <div className="ml-auto flex-shrink-0">
              <Toggle
                options={[
                  { value: 'manual', label: 'Manual' },
                  { value: 'auto', label: 'Auto AI' },
                ]}
                value={helpMode}
                onChange={(v) => setHelpMode(v as HelpMode)}
                className="flex-shrink-0"
              />
            </div>

            {/* Desktop EN/HI Toggle (Mobile uses top row) */}
            <div className="hidden md:block flex-shrink-0">
              <Toggle
                options={[
                  { value: 'en', label: 'EN' },
                  { value: 'hi', label: 'HI' },
                ]}
                value={language}
                onChange={handleLanguageChange}
                className="flex-shrink-0"
              />
            </div>

            {/* Desktop Ask AI Button (Hidden on Mobile) */}
            <div className="hidden md:block ml-2 flex-shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowAskAI(true)}
                className="flex bg-[var(--accent-primary)] hover:opacity-90 border-[var(--accent-primary)] shadow-lg px-4 flex-shrink-0 h-11"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Ask AI Question</span>
              </Button>
            </div>

            {/* Profile / Settings Avatar with Dropdown */}
            <div className="hidden md:block flex-shrink-0 relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden shadow-md hover:shadow-lg hover:scale-105",
                  showProfileMenu
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30"
                    : "border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)]",
                  user ? "bg-[var(--glass-bg)]" : "bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                )}
                title={user?.displayName || 'Settings'}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <User className="w-5 h-5 text-[var(--accent-primary)]" />
                )}
              </button>

              {/* Premium Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-80 rounded-3xl z-50"
                  style={{
                    background: 'white',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Profile Header - Gradient Banner */}
                  <div
                    className="relative rounded-t-3xl px-5 pt-5 pb-4"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-t-3xl opacity-20"
                      style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4), transparent 60%)' }}
                    />
                    {user ? (
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/30 overflow-hidden flex-shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                          ) : (
                            user.displayName?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-white truncate drop-shadow-sm">{user.displayName || 'User'}</p>
                          <p className="text-xs text-white/70 truncate">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-white">Guest User</p>
                          <p className="text-xs text-white/70">Sign in to save your work</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Menu Content */}
                  <div className="px-4 py-4 space-y-4">
                    {/* AI Mode Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">AI Mode</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setHelpMode('manual'); }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                          style={helpMode === 'manual' ? {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            boxShadow: '0 4px 15px -3px rgba(99, 102, 241, 0.4)',
                          } : {
                            background: '#f1f5f9',
                            color: '#64748b',
                          }}
                        >
                          ✋ Manual
                        </button>
                        <button
                          onClick={() => { setHelpMode('auto'); }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                          style={helpMode === 'auto' ? {
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            boxShadow: '0 4px 15px -3px rgba(99, 102, 241, 0.4)',
                          } : {
                            background: '#f1f5f9',
                            color: '#64748b',
                          }}
                        >
                          ✨ Auto AI
                        </button>
                      </div>
                    </div>

                    {/* Language Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                          <Globe className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">AI Language</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLanguageChange('en')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                          style={language === 'en' ? {
                            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                            color: 'white',
                            boxShadow: '0 4px 15px -3px rgba(16, 185, 129, 0.4)',
                          } : {
                            background: '#f1f5f9',
                            color: '#64748b',
                          }}
                        >
                          🌐 English
                        </button>
                        <button
                          onClick={() => handleLanguageChange('hi')}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                          style={language === 'hi' ? {
                            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                            color: 'white',
                            boxShadow: '0 4px 15px -3px rgba(16, 185, 129, 0.4)',
                          } : {
                            background: '#f1f5f9',
                            color: '#64748b',
                          }}
                        >
                          🇮🇳 हिंदी
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)' }} />

                    {/* Login / Logout */}
                    {user ? (
                      <button
                        onClick={async () => { setShowProfileMenu(false); await logout(); }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all duration-200 group"
                        style={{ background: '#fef2f2' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                          <LogOut className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="font-bold text-red-600">Log Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShowProfileMenu(false); setShowLoginModal(true); }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                          <LogIn className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="font-bold text-white">Log In to Save Codes</span>
                      </button>
                    )}
                  </div>

                  {/* Bottom accent line */}
                  <div className="h-1 rounded-b-3xl" style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6, #a855f7)' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 pt-2">
        <button
          onClick={() => setMobileTab('editor')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2 rounded-t-lg",
            mobileTab === 'editor'
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
          )}
        >
          Code Editor
        </button>
        <button
          onClick={() => setMobileTab('console')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2 rounded-t-lg",
            mobileTab === 'console'
              ? "border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
              : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
          )}
        >
          Output Console
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-0 md:gap-4 p-0 md:p-4 overflow-hidden h-[calc(100dvh-64px)] md:h-[calc(100dvh-73px)]">
        {/* Top/Left Panel - Code Editor */}
        <div className={cn(
          "h-full w-full md:w-[55%] relative flex-shrink-0 md:block",
          mobileTab !== 'editor' && "hidden"
        )}>
          <Card className="h-full overflow-hidden border-0 md:border-[var(--border-color)] bg-[var(--card-bg)] rounded-none md:rounded-xl">
            <PythonCodeEditor
              code={code}
              onChange={setCode}
              errorLine={errorLine}
              isLoading={isPyodideLoading}
              theme={theme}
              onThemeToggle={handleThemeToggle}
              onShowHistory={() => setShowHistory(true)}
              onRun={handleRun}
              isRunning={isRunning}
              isReady={isPyodideReady}
              onAskAI={() => setShowAskAI(true)}
              onSave={handleEditorSave}
              onShowSavedCodes={() => isLoggedIn ? setShowSavedCodes(true) : setShowLoginModal(true)}
            />
          </Card>
        </div>

        {/* Bottom/Right Panel - Combined Console & AI */}
        <div className={cn(
          "h-full w-full md:w-[45%] flex-shrink-0 md:block",
          mobileTab !== 'console' && "hidden"
        )}>
          <Card className="h-full overflow-hidden border-0 md:border-[var(--border-color)] bg-[var(--card-bg)] rounded-none md:rounded-xl">
            <PythonConsole
              output={output}
              error={error}
              onClear={handleClearOutput}
              onGetAIHelp={handleGetAIHelp}
              onApplyFix={handleApplyFix}
              isAILoading={isAILoading}
              helpMode={helpMode}
              language={language}
              explanation={explanation}
              aiError={aiError}
              terminalLines={terminalLines}
              waitingForInput={waitingForInput}
              onPromptSubmit={handlePromptSubmit}
            />
          </Card>
        </div>
      </main>

      {/* Code History Drawer */}
      <PythonHistory
        history={history}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      <PythonAskAIModal
        isOpen={showAskAI}
        onClose={() => setShowAskAI(false)}
        onGenerate={handleGenerateCode}
        language={language}
      />

      {/* Saved Codes Modal */}
      <SavedCodesModal
        isOpen={showSavedCodes}
        onClose={() => {
          setShowSavedCodes(false);
          setTimeout(() => setStartSavingCode(false), 200);
        }}
        initialShowSaveInput={startSavingCode}
        codes={codes}
        isLoading={isSavedCodesLoading}
        onSave={handleSaveCode}
        onDelete={deleteCode}
        onToggleImportant={toggleImportant}
        onSelect={handleSelectSavedCode}
        currentCode={code}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
