'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CodeExecutionResult } from '@/types/python';
import { extractLineNumber, formatPythonError } from '@/lib/python-utils';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
    currentPyodideInputLines: string[];
    pyodideInputNeededPrompt: string | null;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (config: { batched: (msg: string) => void }) => void;
  setStderr: (config: { batched: (msg: string) => void }) => void;
}

const EXECUTION_TIMEOUT = 30000;

// Special error marker to detect when input is needed
const INPUT_NEEDED_MARKER = '___PYODIDE_INPUT_NEEDED___';

export interface ExecuteResult extends CodeExecutionResult {
  needsInput?: boolean;
  inputPrompt?: string;
}

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initPyodide() {
      try {
        if (!window.loadPyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Pyodide script. Please check your internet connection or ad blocker.'));
          });
        }

        if (!mounted) return;

        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
          stdout: (msg: string) => { /* Ignore default stdout to prevent React overlay issues */ },
          stderr: (msg: string) => { /* Ignore default stderr to prevent React overlay issues */ },
        });

        if (!mounted) return;

        pyodideRef.current = pyodide;
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
        setIsLoading(false);
      }
    }

    initPyodide();

    return () => {
      mounted = false;
    };
  }, []);

  const executeCode = useCallback(async (
    code: string,
    inputLines: string[] = [],
  ): Promise<ExecuteResult> => {
    if (!pyodideRef.current) {
      return {
        output: '',
        error: 'Python runtime not loaded yet. Please wait.',
        errorLine: null,
      };
    }

    let output = '';
    let errorOutput = '';

    // Set up pre-filled input lines
    window.currentPyodideInputLines = [...inputLines];
    window.pyodideInputNeededPrompt = null;

    pyodideRef.current.setStdout({
      batched: (msg: string) => {
        output += msg + '\n';
      },
    });

    pyodideRef.current.setStderr({
      batched: (msg: string) => {
        errorOutput += msg + '\n';
      },
    });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timed out (30s limit)')), EXECUTION_TIMEOUT);
      });

      // Inject custom input that consumes from queue or raises special marker error
      await pyodideRef.current.runPythonAsync(`
import builtins
import js

def custom_input(prompt_text=""):
    if hasattr(js, 'currentPyodideInputLines') and js.currentPyodideInputLines.length > 0:
        val = js.currentPyodideInputLines.shift()
        return str(val)
    # No input available — store the prompt and raise marker
    js.pyodideInputNeededPrompt = str(prompt_text)
    raise EOFError("${INPUT_NEEDED_MARKER}" + str(prompt_text))

builtins.input = custom_input
      `);

      const pyodidePromise = pyodideRef.current.runPythonAsync(code);
      pyodidePromise.catch(() => {}); // Prevent unhandled rejection if timeout hits

      await Promise.race([
        pyodidePromise,
        timeoutPromise,
      ]);

      return {
        output: output.trim(),
        error: errorOutput ? formatPythonError(errorOutput.trim()) : null,
        errorLine: errorOutput ? extractLineNumber(errorOutput) : null,
        needsInput: false,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Check if this is our "needs input" marker
      if (errorMessage.includes(INPUT_NEEDED_MARKER)) {
        const prompt = window.pyodideInputNeededPrompt || '';
        return {
          output: output.trim(),
          error: null,
          errorLine: null,
          needsInput: true,
          inputPrompt: prompt,
        };
      }

      const cleanError = formatPythonError(errorMessage);
      return {
        output: output.trim(),
        error: cleanError,
        errorLine: extractLineNumber(errorMessage),
        needsInput: false,
      };
    }
  }, []);

  return {
    isLoading,
    isReady,
    error,
    executeCode,
  };
}
