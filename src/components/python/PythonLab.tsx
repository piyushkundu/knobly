'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, History, Sparkles, Code2, Zap, Sun, Moon, Trash2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PythonCodeEditor } from './PythonCodeEditor';
import { PythonConsole } from './PythonConsole';
import { PythonHistory } from './PythonHistory';
import { PythonAskAIModal } from './PythonAskAIModal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Toggle } from './ui/Toggle';
import { usePyodide } from '@/hooks/usePyodide';
import { useAIExplain } from '@/hooks/useAIExplain';
import { useCodeHistory } from '@/hooks/useCodeHistory';
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
  const [lastExecution, setLastExecution] = useState<{ code: string; error: string } | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [mobileTab, setMobileTab] = useState<'editor' | 'console'>('editor');
  // Interactive prompt state - using refs to avoid stale closures
  const [terminalLines, setTerminalLines] = useState<Array<{ type: 'prompt' | 'input'; text: string }>>([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const promptResolveRef = useRef<((inputs: string[]) => void) | null>(null);
  const pendingPromptsRef = useRef<string[]>([]);
  const promptIndexRef = useRef<number>(0);
  const collectedInputsRef = useRef<string[]>([]);
  const router = useRouter();

  const { isLoading: isPyodideLoading, isReady: isPyodideReady, executeCode } = usePyodide();
  const { isLoading: isAILoading, explanation, error: aiError, explainError, clearExplanation } = useAIExplain();
  const { history, saveToHistory, deleteFromHistory } = useCodeHistory();

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

  // Extract all input() calls and their prompt strings from code
  const extractInputPrompts = (src: string): string[] => {
    const prompts: string[] = [];
    const regex = /\binput\s*\(\s*(?:f?["']([^"']*?)["']|([^)]*))?\s*\)/g;
    let match;
    while ((match = regex.exec(src)) !== null) {
      const prompt = match[1] !== undefined ? match[1] : (match[2]?.trim() || '');
      prompts.push(prompt);
    }
    return prompts;
  };

  // Stable callback using refs — no stale closure issues
  const handlePromptSubmit = useCallback((value: string) => {
    const idx = promptIndexRef.current;
    const prompts = pendingPromptsRef.current;
    collectedInputsRef.current = [...collectedInputsRef.current, value];

    const nextIdx = idx + 1;

    if (nextIdx < prompts.length) {
      // Show next prompt
      promptIndexRef.current = nextIdx;
      setTerminalLines(prev => [
        ...prev,
        { type: 'input', text: value },
        { type: 'prompt', text: prompts[nextIdx] },
      ]);
    } else {
      // All inputs collected — resolve the promise so execution continues
      setTerminalLines(prev => [...prev, { type: 'input', text: value }]);
      setWaitingForInput(false);
      if (promptResolveRef.current) {
        promptResolveRef.current(collectedInputsRef.current);
        promptResolveRef.current = null;
      }
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

  const runCodeWithInputs = useCallback(async (inputValues: string[]) => {
    const inputStr = inputValues.join('\n');
    const result = await executeCode(code, inputStr);

    // Clear prompts BEFORE showing output so they don't duplicate
    setTerminalLines([]);
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
    setIsRunning(false);
  }, [code, executeCode, helpMode, language, explainError, saveToHistory]);

  const handleRun = useCallback(async () => {
    if (!isPyodideReady || isRunning) return;

    setIsRunning(true);
    setOutput('');
    setError(null);
    setErrorLine(null);
    clearExplanation();
    setTerminalLines([]);
    setWaitingForInput(false);
    setMobileTab('console');
    // Reset refs
    collectedInputsRef.current = [];
    promptIndexRef.current = 0;
    promptResolveRef.current = null;

    const prompts = extractInputPrompts(code);

    if (prompts.length > 0) {
      // Interactive mode: show prompts one by one in output panel
      pendingPromptsRef.current = prompts;
      promptIndexRef.current = 0;

      setTerminalLines([{ type: 'prompt', text: prompts[0] }]);
      setWaitingForInput(true);

      // Wait for user to fill all prompts
      const inputValues = await new Promise<string[]>((resolve) => {
        promptResolveRef.current = resolve;
      });

      try {
        await runCodeWithInputs(inputValues);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Execution failed';
        setError(errorMsg);
        setLastExecution({ code, error: errorMsg });
        setIsRunning(false);
      }
    } else {
      // No input prompts, just run
      try {
        await runCodeWithInputs([]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Execution failed';
        setError(errorMsg);
        setLastExecution({ code, error: errorMsg });
        setIsRunning(false);
      }
    }
  }, [code, isPyodideReady, isRunning, runCodeWithInputs, clearExplanation]);

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
      <header className="flex flex-col bg-[var(--header-bg)] backdrop-blur-2xl border-b border-[var(--border-color)] relative z-20 w-full overflow-hidden">
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
                size="lg"
                onClick={handleRun}
                disabled={!isPyodideReady || isRunning}
                data-run-button
                title="Run Code (F5)"
                className={cn(
                  "px-4",
                  isPyodideReady && !isRunning && 'animate-pulse-glow'
                )}
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    <span>Run Code</span>
                  </>
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
    </div>
  );
}
