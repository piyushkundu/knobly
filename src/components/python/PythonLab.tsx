'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, History, Sparkles, Code2, Zap, Sun, Moon, Trash2, ChevronLeft, Save, FolderOpen, User, LogIn, LogOut, Globe, Bot, ChevronDown, X, Settings } from 'lucide-react';
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
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
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

  // Close profile and settings menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        profileMenuRef.current && !profileMenuRef.current.contains(target) &&
        (!mobileProfileMenuRef.current || !mobileProfileMenuRef.current.contains(target))
      ) {
        setShowProfileMenu(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) {
        setShowSettingsMenu(false);
      }
    };
    if (showProfileMenu || showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showSettingsMenu]);

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
              <button
                onClick={() => router.push('/')}
                title="Back to Home"
                className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-gray-200/80 shadow-sm flex items-center justify-center bg-white hover:bg-gray-50 mr-1 md:mr-3 flex-shrink-0 transition-all hover:shadow-md hover:-translate-x-1"
              >
                <img src="https://img.icons8.com/fluency/48/circled-left-2.png" alt="Back" className="w-5 h-5 md:w-7 md:h-7 object-contain" />
              </button>
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/10 flex items-center justify-center shadow-lg border border-[var(--border-color)] text-white">
                  <img src="https://img.icons8.com/color/48/python--v1.png" alt="Python" className="w-5 h-5 md:w-6 md:h-6 object-contain drop-shadow-md" />
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

            {/* Mobile Profile / Avatar */}
            <div className="md:hidden flex-shrink-0 relative" ref={mobileProfileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden shadow-md",
                  showProfileMenu
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30"
                    : "border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)]",
                  user ? "bg-[var(--glass-bg)]" : "bg-gradient-to-br from-indigo-50/10 to-purple-50/10"
                )}
                title={user?.displayName || 'Profile'}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <img src="https://img.icons8.com/fluency/48/user-male-circle--v1.png" alt="User" className="w-full h-full object-contain" />
                )}
              </button>

              {/* Mobile Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl z-50 bg-white border border-gray-100 overflow-hidden shadow-2xl">
                  <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 bg-white">
                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100 flex-shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-full h-full object-cover rounded-full" alt="" />
                          ) : (
                            user.displayName?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          <img src="https://img.icons8.com/fluency/48/user-male-circle--v1.png" alt="Guest" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Guest User</p>
                          <p className="text-[11px] text-gray-500">Sign in to save your work</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50/50">
                    {user ? (
                      <button onClick={() => { logout(); setShowProfileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    ) : (
                      <button onClick={() => { setShowLoginModal(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors">
                        <LogIn className="w-4 h-4" /> Sign In
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Actions / Mobile Bottom Scrollable Tools */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar md:overflow-visible pb-1 md:pb-0 scroll-smooth w-full md:w-auto -mx-1 px-1 md:mx-0 md:px-0 mt-2 md:mt-0">
            {/* Run Button (Hidden on Mobile) */}
            <div className="hidden md:block flex-shrink-0 md:ml-auto">
              <Button
                variant="ghost"
                onClick={handleRun}
                disabled={!isPyodideReady || isRunning}
                data-run-button
                title="Run Code (F5)"
                className={cn(
                  "flex items-center justify-center gap-2 px-6 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all group",
                  isPyodideReady && !isRunning && 'shadow-indigo-500/10'
                )}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className={cn(
                  "w-4 h-4 text-blue-500 transition-transform duration-300",
                  isRunning ? "animate-spin" : "group-hover:scale-110"
                )}>
                  {isRunning ? (
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10H20c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8V2z" />
                  ) : (
                    <polygon points="6,4 20,12 6,20" />
                  )}
                </svg>
                <span className="font-extrabold text-[#2a2a2a] text-[14px] tracking-widest uppercase mt-0.5">
                  {isRunning ? 'Running' : 'Run'}
                </span>
              </Button>
            </div>

            {/* Ask AI Button (Pushed left on mobile, right on desktop) */}
            <div className="mr-auto md:mr-0 md:ml-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowAskAI(true)}
                className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-5 h-9 md:h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-all group"
              >
                <svg viewBox="0 0 100 100" className="w-4 h-4 md:w-5 md:h-5 animate-[spin_3s_linear_infinite]">
                  <defs>
                    <linearGradient id="iask-grad-desktop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="32" stroke="url(#iask-grad-desktop)" strokeWidth="22" fill="none" />
                </svg>
                <span className="font-extrabold text-[#2a2a2a] text-[13px] md:text-sm tracking-tight mt-0.5">
                  i<span className="text-[15px] md:text-base uppercase">A</span>sk
                </span>
              </Button>
            </div>

            <div className="hidden md:block w-px h-6 bg-[var(--border-color)] mx-2 flex-shrink-0" />

            {/* History Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowHistory(true)}
                title="Code History"
                className={cn(
                  "w-11 h-11 rounded-full border flex items-center justify-center transition-all bg-[var(--glass-bg)] shadow-sm hover:shadow-md hover:scale-105",
                  showHistory
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
                    : "border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40"
                )}
              >
                <img src="https://img.icons8.com/fluency/48/time-machine.png" alt="History" className="w-6 h-6 object-contain drop-shadow-sm hover:-rotate-12 transition-transform duration-300" />
              </button>
            </div>

            {/* Save & My Codes Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => isLoggedIn ? setShowSavedCodes(true) : setShowLoginModal(true)}
                title={isLoggedIn ? 'My Saved Codes' : 'Login to save codes'}
                className={cn(
                  "w-11 h-11 rounded-full border flex items-center justify-center transition-all bg-[var(--glass-bg)] shadow-sm hover:shadow-md hover:scale-105",
                  showSavedCodes
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
                    : "border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40"
                )}
              >
                <img src="https://img.icons8.com/fluency/48/opened-folder.png" alt="Saved" className="w-6 h-6 object-contain drop-shadow-sm hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>

            {/* Settings Menu Dropdown */}
            <div className="flex-shrink-0 relative md:ml-2" ref={settingsMenuRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={cn(
                  "w-11 h-11 rounded-full border flex items-center justify-center transition-all bg-[var(--glass-bg)] shadow-sm hover:shadow-md hover:scale-105",
                  showSettingsMenu
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
                    : "border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40"
                )}
                title="Settings"
              >
                <img src="https://img.icons8.com/fluency/48/settings.png" alt="Settings" className="w-6 h-6 object-contain drop-shadow-sm hover:rotate-90 transition-transform duration-300" />
              </button>

              {showSettingsMenu && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-2xl z-50 bg-white border border-gray-100 overflow-hidden"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1), 0 0 20px -5px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="px-4 py-3 border-b border-gray-100/80 bg-white flex items-center gap-2">
                    <img src="https://img.icons8.com/fluency/48/settings.png" alt="Settings" className="w-5 h-5 object-contain" />
                    <h3 className="text-sm font-bold text-gray-900">Lab Settings</h3>
                  </div>
                  
                  <div className="p-3 space-y-4 bg-white/50 backdrop-blur-md">
                    {/* Theme Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        {theme === 'dark' ? <img src="https://img.icons8.com/fluency/48/bright-moon.png" alt="Dark" className="w-4 h-4 object-contain" /> : <img src="https://img.icons8.com/fluency/48/sun.png" alt="Light" className="w-4 h-4 object-contain" />}
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Theme Mode</span>
                      </div>
                      <div className="flex gap-1.5 p-1 bg-gray-50/80 rounded-xl border border-gray-100">
                        <button
                          onClick={() => { if (theme !== 'light') handleThemeToggle(); }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={theme === 'light' ? {
                            background: 'white',
                            color: '#4f46e5',
                            boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.15)',
                            border: '1px solid rgba(79, 70, 229, 0.1)'
                          } : {
                            color: '#64748b',
                            border: '1px solid transparent'
                          }}
                        >
                          <img src="https://img.icons8.com/fluency/48/sun.png" alt="Sun" className="w-4 h-4" /> Light
                        </button>
                        <button
                          onClick={() => { if (theme !== 'dark') handleThemeToggle(); }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={theme === 'dark' ? {
                            background: 'white',
                            color: '#4f46e5',
                            boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.15)',
                            border: '1px solid rgba(79, 70, 229, 0.1)'
                          } : {
                            color: '#64748b',
                            border: '1px solid transparent'
                          }}
                        >
                          <img src="https://img.icons8.com/fluency/48/bright-moon.png" alt="Moon" className="w-4 h-4" /> Dark
                        </button>
                      </div>
                    </div>

                    {/* AI Mode Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <img src="https://img.icons8.com/fluency/48/bot.png" alt="AI Mode" className="w-4 h-4 object-contain" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AI Mode</span>
                      </div>
                      <div className="flex gap-1.5 p-1 bg-gray-50/80 rounded-xl border border-gray-100">
                        <button
                          onClick={() => { setHelpMode('manual'); }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={helpMode === 'manual' ? {
                            background: 'white',
                            color: '#4f46e5',
                            boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.15)',
                            border: '1px solid rgba(79, 70, 229, 0.1)'
                          } : {
                            color: '#64748b',
                            border: '1px solid transparent'
                          }}
                        >
                          <span className="text-sm">✋</span> Manual
                        </button>
                        <button
                          onClick={() => { setHelpMode('auto'); }}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={helpMode === 'auto' ? {
                            background: 'white',
                            color: '#4f46e5',
                            boxShadow: '0 2px 8px -2px rgba(79, 70, 229, 0.15)',
                            border: '1px solid rgba(79, 70, 229, 0.1)'
                          } : {
                            color: '#64748b',
                            border: '1px solid transparent'
                          }}
                        >
                          <span className="text-sm">✨</span> Auto
                        </button>
                      </div>
                    </div>

                    {/* Language Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <img src="https://img.icons8.com/color/48/translation.png" alt="Language" className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AI Language</span>
                      </div>
                      <div className="flex gap-1.5 p-1 bg-gray-50/80 rounded-xl border border-gray-100">
                        <button
                          onClick={() => handleLanguageChange('en')}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={language === 'en' ? {
                            background: 'white',
                            color: '#10b981',
                            boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.1)'
                          } : {
                            color: '#64748b',
                            border: '1px solid transparent'
                          }}
                        >
                          <span className="text-sm">🌐</span> English
                        </button>
                        <button
                          onClick={() => handleLanguageChange('hi')}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
                          style={language === 'hi' ? {
                            background: 'white',
                            color: '#10b981',
                            boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.1)'
                          } : {
                            color: '#64748b',
                            border: '1px solid transparent'
                          }}
                        >
                          <span className="text-sm">🇮🇳</span> हिंदी
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Avatar with Dropdown */}
            <div className="hidden md:block flex-shrink-0 relative ml-2" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all overflow-hidden shadow-md hover:shadow-lg hover:scale-105",
                  showProfileMenu
                    ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/30"
                    : "border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)]",
                  user ? "bg-[var(--glass-bg)]" : "bg-gradient-to-br from-indigo-50/10 to-purple-50/10"
                )}
                title={user?.displayName || 'Profile'}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                ) : (
                  <img src="https://img.icons8.com/fluency/48/user-male-circle--v1.png" alt="User" className="w-full h-full object-contain" />
                )}
              </button>

              {/* Premium Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-72 rounded-2xl z-50 bg-white border border-gray-100 overflow-hidden"
                  style={{
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1), 0 0 20px -5px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Profile Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-gray-100/80 bg-white">
                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-100 flex-shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} className="w-full h-full object-cover rounded-full" alt="" />
                          ) : (
                            user.displayName?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                          <img src="https://img.icons8.com/fluency/48/user-male-circle--v1.png" alt="Guest" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Guest User</p>
                          <p className="text-[11px] text-gray-500">Sign in to save your work</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Menu Content */}
                  <div className="p-3 space-y-3 bg-white/50 backdrop-blur-md">
                    {/* Login / Logout */}
                    {user ? (
                      <button
                        onClick={async () => { setShowProfileMenu(false); await logout(); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-red-600 bg-red-50/50 hover:bg-red-50 border border-red-100/50"
                      >
                        <img src="https://img.icons8.com/fluency/48/exit.png" alt="Logout" className="w-5 h-5 object-contain" />
                        <span>Log Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShowProfileMenu(false); setShowLoginModal(true); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md shadow-indigo-500/20"
                      >
                        <img src="https://img.icons8.com/fluency/48/login-rounded-right.png" alt="Login" className="w-5 h-5 object-contain" />
                        <span>Log In to Save Codes</span>
                      </button>
                    )}
                  </div>
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
