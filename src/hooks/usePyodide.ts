'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CodeExecutionResult } from '@/types/python';
import { extractLineNumber, formatPythonError } from '@/lib/python-utils';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
    currentPyodideInputLines: string[];
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (config: { batched: (msg: string) => void }) => void;
  setStderr: (config: { batched: (msg: string) => void }) => void;
}

const EXECUTION_TIMEOUT = 30000;

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
            script.onerror = reject;
          });
        }

        if (!mounted) return;

        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
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
    customInput: string = '',
  ): Promise<CodeExecutionResult> => {
    if (!pyodideRef.current) {
      return {
        output: '',
        error: 'Python runtime not loaded yet. Please wait.',
        errorLine: null,
      };
    }

    let output = '';
    let errorOutput = '';

    // Set up standard input buffer from pre-filled lines
    window.currentPyodideInputLines = customInput
      ? customInput.split('\n').filter((l) => l !== '')
      : [];

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

      // Inject synchronous input override from pre-filled JS array
      await pyodideRef.current.runPythonAsync(`
import builtins
import js

def custom_input(prompt_text=""):
    if hasattr(js, 'currentPyodideInputLines') and js.currentPyodideInputLines.length > 0:
        val = js.currentPyodideInputLines.shift()
        return str(val)
    raise EOFError("EOF: No more input provided")

builtins.input = custom_input
      `);

      await Promise.race([
        pyodideRef.current.runPythonAsync(code),
        timeoutPromise,
      ]);

      return {
        output: output.trim(),
        error: errorOutput ? formatPythonError(errorOutput.trim()) : null,
        errorLine: errorOutput ? extractLineNumber(errorOutput) : null,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const cleanError = formatPythonError(errorMessage);
      return {
        output: output.trim(),
        error: cleanError,
        errorLine: extractLineNumber(errorMessage),
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
