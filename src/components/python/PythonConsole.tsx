'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Check, Sparkles, Zap, Lightbulb, Wrench, FileCode, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface PythonConsoleProps {
  output: string;
  error: string | null;
  onClear: () => void;
  onGetAIHelp?: () => void;
  onApplyFix?: (code: string) => void;
  isAILoading?: boolean;
  helpMode?: 'manual' | 'auto';
  language?: 'en' | 'hi';
  explanation?: {
    error_type: string;
    error_line: string;
    simple_explanation_english: string;
    simple_explanation_hindi: string;
    why_error_happened: string;
    how_to_fix: string;
    corrected_code: string;
  } | null;
  aiError?: string | null;
}

export function PythonConsole({ 
  output, 
  error, 
  onClear, 
  onGetAIHelp, 
  onApplyFix,
  isAILoading, 
  helpMode = 'manual', 
  language = 'en',
  explanation,
  aiError 
}: PythonConsoleProps) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output, error, explanation]);

  const handleCopy = async () => {
    const text = output + (error ? '\n' + error : '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyFix = () => {
    if (explanation?.corrected_code && onApplyFix) {
      onApplyFix(explanation.corrected_code);
    }
  };

  const getErrorTypeColor = (errorType: string) => {
    const colors: Record<string, string> = {
      SyntaxError: 'bg-[var(--error-bg)] text-[var(--accent-error)]',
      NameError: 'bg-[var(--error-bg)] text-[var(--accent-warning)]',
      TypeError: 'bg-[var(--error-bg)] text-[var(--accent-primary)]',
      ValueError: 'bg-[var(--error-bg)] text-[var(--accent-warning)]',
      IndexError: 'bg-[var(--error-bg)] text-[var(--accent-error)]',
      KeyError: 'bg-[var(--error-bg)] text-[var(--accent-secondary)]',
      ImportError: 'bg-[var(--error-bg)] text-[var(--accent-success)]',
      IndentationError: 'bg-[var(--error-bg)] text-[var(--accent-error)]',
    };
    return colors[errorType] || 'bg-[var(--glass-bg)] text-[var(--text-muted)]';
  };

  const hasOutput = output || error;
  const showExplanation = error && (explanation || isAILoading);
  const currentExp = language === 'hi' ? explanation?.simple_explanation_hindi : explanation?.simple_explanation_english;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--glass-bg)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-400">Output</span>
        </div>
        <div className="flex items-center gap-1">
          {hasOutput && (
            <>
              <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy" className="text-slate-400 hover:text-white">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClear} title="Clear" className="text-slate-400 hover:text-white">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={consoleRef} className="flex-1 overflow-auto p-4 custom-scroll bg-[var(--bg-primary)]">
        {!hasOutput && !showExplanation ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <span>Run your Python code to see output here</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {output && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-pre-wrap text-[var(--text-primary)] font-mono text-sm leading-relaxed"
              >
                {output}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-pre-wrap text-[var(--accent-error)] font-mono text-sm leading-relaxed p-2 bg-[var(--error-bg)] rounded-lg border border-[var(--error-border)]/50"
              >
                {error}
              </motion.div>
            )}

            {isAILoading && (
              <div className="flex items-center gap-2 text-indigo-400 bg-indigo-950/30 p-3 rounded-lg border border-indigo-900/50">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">AI is finding the problem...</span>
              </div>
            )}

            {aiError && !isAILoading && (
              <div className="p-3 bg-[var(--error-bg)] border border-[var(--error-border)]/30 rounded-lg">
                <p className="text-sm text-[var(--accent-error)]">{aiError}</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onGetAIHelp}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}

            {explanation && !isAILoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mt-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getErrorTypeColor(explanation.error_type)}`}>
                    {explanation.error_type}
                  </span>
                  {explanation.error_line && (
                    <span className="text-xs text-slate-400">Line {explanation.error_line}</span>
                  )}
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {language === 'hi' ? 'समस्या क्या है?' : 'What is the problem?'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {currentExp}
                  </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {language === 'hi' ? 'कैसे ठीक करें?' : 'How to fix?'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {explanation.how_to_fix}
                  </p>
                </div>

                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {language === 'hi' ? 'सही कोड' : 'Corrected Code'}
                      </span>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleApplyFix} className="h-8">
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                      {language === 'hi' ? 'कोड लागू करें' : 'Apply Fix'}
                    </Button>
                  </div>
                  <pre className="text-xs overflow-x-auto p-2 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)]">
                    <code className="text-green-400 font-mono">
                      {explanation.corrected_code}
                    </code>
                  </pre>
                </div>
              </motion.div>
            )}

            {error && !explanation && !isAILoading && helpMode === 'manual' && (
              <Button
                variant="primary"
                onClick={onGetAIHelp}
                className="w-full mt-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'hi' ? 'AI से मदद लें' : 'Get AI Help'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
