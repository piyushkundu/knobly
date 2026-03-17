'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Editor, { OnMount, OnChange, BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { cn } from '@/lib/python-utils';
import { Trash2, RotateCcw, Sparkles, Play, Sun, Moon, History } from 'lucide-react';
import { Button } from './ui/Button';

interface PythonCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  errorLine?: number | null;
  isLoading?: boolean;
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
  onShowHistory?: () => void;
  onRun?: () => void;
  isRunning?: boolean;
  isReady?: boolean;
  onAskAI?: () => void;
}

const DEFAULT_CODE = `print("Hello, World!")`;

export function PythonCodeEditor({ 
  code, 
  onChange, 
  errorLine, 
  isLoading, 
  theme = 'dark',
  onThemeToggle,
  onShowHistory,
  onRun,
  isRunning,
  isReady,
  onAskAI
}: PythonCodeEditorProps) {
  const [isMobile, setIsMobile] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('python-lab-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'f472b6', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'string.escape', foreground: 'fbbf24' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'number.hex', foreground: 'fbbf24' },
        { token: 'function', foreground: '22d3ee' },
        { token: 'function.builtin', foreground: '22d3ee', fontStyle: 'bold' },
        { token: 'variable', foreground: 'f8fafc' },
        { token: 'variable.parameter', foreground: 'fb923c' },
        { token: 'operator', foreground: 'f472b6' },
        { token: 'delimiter', foreground: '94a3b8' },
        { token: 'delimiter.bracket', foreground: '94a3b8' },
        { token: 'type', foreground: 'a78bfa' },
        { token: 'class', foreground: 'a78bfa', fontStyle: 'bold' },
        { token: 'tag', foreground: 'f472b6' },
        { token: 'attribute.name', foreground: '22d3ee' },
        { token: 'attribute.value', foreground: '34d399' },
      ],
      colors: {
        'editor.background': '#16161e',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#1e1e2e',
        'editor.selectionBackground': '#818cf850',
        'editorCursor.foreground': '#2dd4bf',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#9ca3af',
        'editor.inactiveSelectionBackground': '#818cf830',
        'editorCursor.background': '#16161e',
        'editor.findMatchBackground': '#818cf840',
        'editor.findMatchHighlightBackground': '#818cf830',
        'editorBracketMatch.background': '#818cf830',
        'editorBracketMatch.border': '#818cf8',
        'editorIndentGuide.background': '#28283d',
        'editorIndentGuide.activeBackground': '#3a3a5a',
      },
    });

    monaco.editor.defineTheme('python-lab-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'db2777', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'string.escape', foreground: 'd97706' },
        { token: 'number', foreground: 'd97706' },
        { token: 'number.hex', foreground: 'd97706' },
        { token: 'function', foreground: '0891b2' },
        { token: 'function.builtin', foreground: '0891b2', fontStyle: 'bold' },
        { token: 'variable', foreground: '1e293b' },
        { token: 'variable.parameter', foreground: 'ea580c' },
        { token: 'operator', foreground: 'db2777' },
        { token: 'delimiter', foreground: '475569' },
        { token: 'delimiter.bracket', foreground: '475569' },
        { token: 'type', foreground: '7c3aed' },
        { token: 'class', foreground: '7c3aed', fontStyle: 'bold' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editor.selectionBackground': '#6366f140',
        'editorCursor.foreground': '0891b2',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#475569',
        'editor.inactiveSelectionBackground': '#6366f120',
        'editorCursor.background': '#ffffff',
        'editorIndentGuide.background': '#e2e8f0',
        'editorIndentGuide.activeBackground': '#cbd5e1',
      },
    });
  };

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(monaco.KeyCode.F5, () => {
      const runButton = document.querySelector('[data-run-button]') as HTMLButtonElement;
      if (runButton) {
        runButton.click();
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      const clearButton = document.querySelector('[data-clear-button]') as HTMLButtonElement;
      if (clearButton) {
        clearButton.click();
      }
    });

    const savedCode = localStorage.getItem('python-code');
    if (savedCode && !code) {
      onChange(savedCode);
    }
    
    editor.focus();
  };

  const handleChange: OnChange = useCallback((value) => {
    const newValue = value || '';
    onChange(newValue);
    localStorage.setItem('python-code', newValue);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    localStorage.setItem('python-code', '');
    if (editorRef.current) {
      editorRef.current.setValue('');
      editorRef.current.focus();
    }
  }, [onChange]);

  const handleReset = useCallback(() => {
    onChange(DEFAULT_CODE);
    localStorage.setItem('python-code', DEFAULT_CODE);
    if (editorRef.current) {
      editorRef.current.setValue(DEFAULT_CODE);
      editorRef.current.focus();
    }
  }, [onChange]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current && errorLine) {
      const model = editorRef.current.getModel();
      if (model) {
        const lineCount = model.getLineCount();
        const validLine = Math.min(Math.max(1, errorLine), lineCount);
        
        const decorations = editorRef.current.deltaDecorations(
          decorationsRef.current,
          [
            {
              range: new monacoRef.current!.Range(validLine, 1, validLine, 1),
              options: {
                isWholeLine: true,
                className: 'error-line-highlight',
                glyphMarginClassName: 'error-glyph',
                overviewRuler: {
                  color: '#ef4444',
                  position: monacoRef.current!.editor.OverviewRulerLane.Full,
                },
              },
            },
          ]
        );
        decorationsRef.current = decorations;

        editorRef.current.revealLineInCenter(validLine);
      }
    } else if (editorRef.current && monacoRef.current && !errorLine) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [errorLine]);

  return (
    <div className="relative h-full w-full flex flex-col bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--glass-bg)] h-11">
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Python</span>
            <span className="text-xs text-[var(--text-secondary)]">•</span>
            <span className="text-xs text-[var(--text-secondary)]">F5 to run</span>
          </div>
          
          <div className="flex md:hidden items-center gap-2">
            {onRun && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRun}
                disabled={!isReady || isRunning}
                className={cn(
                  "px-3 h-7 shadow-sm",
                  isReady && !isRunning && 'animate-pulse-glow'
                )}
              >
                {isRunning ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    <span className="text-xs">Run</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isMobile && onThemeToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-7 px-2"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
          )}
          {isMobile && onShowHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowHistory}
              title="Show History"
              className="h-7 px-2"
            >
              <History className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            title="Clear code (Ctrl+L)"
            className="h-7 px-2"
            data-clear-button
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--text-muted)]">Loading Python Runtime...</span>
            </div>
          </div>
        )}
        <div className={cn('h-full w-full', isLoading && 'opacity-50')}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code ?? DEFAULT_CODE}
            onChange={handleChange}
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            theme={theme === 'light' ? 'python-lab-light' : 'python-lab-dark'}
            options={{
              fontSize: isMobile ? 13 : 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: 'on',
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              cursorStyle: 'line',
              cursorWidth: 2,
              renderLineHighlight: 'all',
              glyphMargin: true,
              folding: true,
              foldingHighlight: true,
              showFoldingControls: 'mouseover',
              lineDecorationsWidth: 8,
              lineNumbersMinChars: 3,
              contextmenu: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              snippetSuggestions: 'top',
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
