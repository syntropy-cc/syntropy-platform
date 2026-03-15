"use client";

/**
 * Monaco Editor React wrapper (COMP-035.1).
 * Embeds Monaco with language support, theme, Cmd+S save, and optional LSP WebSocket.
 * Architecture: platform/embedded-ide, ADR-007
 */

import React, { useCallback, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "./theme-provider";

const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "markdown",
  "json",
  "yaml",
] as const;

export type MonacoLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function isSupportedLanguage(lang: string): lang is MonacoLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as MonacoLanguage);
}

function themeToMonaco(theme: "light" | "dark"): string {
  return theme === "dark" ? "vs-dark" : "light";
}

export interface MonacoEditorProps {
  /** Current editor content (controlled). */
  value: string;
  /** Called when content changes. */
  onChange?: (value: string) => void;
  /** Syntax language. Default "typescript". */
  language?: MonacoLanguage | string;
  /** Override app theme for editor (default: use ThemeProvider). */
  theme?: "light" | "dark";
  /** Called on Cmd+S / Ctrl+S. */
  onSave?: () => void;
  /** Editor height (e.g. "400px" or "100%"). Default "100%". */
  height?: string | number;
  /** Optional LSP WebSocket URL; when set, client may connect for language server (stub in 035.1). */
  lspWebSocketUrl?: string | null;
  /** Additional Monaco options. */
  options?: editor.IStandaloneEditorConstructionOptions;
  /** Class name for the wrapper. */
  className?: string;
}

/**
 * Monaco Editor component with TypeScript, Python, MyST Markdown, JSON, YAML support,
 * dark/light theme, Cmd+S save, and optional LSP WebSocket hook.
 */
export function MonacoEditor({
  value,
  onChange,
  language = "typescript",
  theme: themeProp,
  onSave,
  height = "100%",
  lspWebSocketUrl,
  options = {},
  className,
}: MonacoEditorProps): React.ReactElement {
  const appTheme = useTheme().theme;
  const theme = themeProp ?? appTheme;
  const monacoTheme = themeToMonaco(theme);
  const lang = isSupportedLanguage(language) ? language : "plaintext";

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance;

      if (onSave) {
        editorInstance.addAction({
          id: "save",
          label: "Save",
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
          run: () => {
            onSave();
          },
        });
      }

      // LSP WebSocket: stub — actual connection will be wired when gateway exists (COMP-035.2)
      if (lspWebSocketUrl) {
        // Placeholder for future: open WebSocket, forward JSON-RPC to Monaco LSP client
      }
    },
    [onSave, lspWebSocketUrl]
  );

  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    wordWrap: "on",
    scrollBeyondLastLine: false,
    automaticLayout: true,
    ...options,
  };

  return (
    <div className={className} data-testid="monaco-editor-wrapper">
      <Editor
        height={height}
        value={value}
        language={lang}
        theme={monacoTheme}
        onChange={(newValue) => onChange?.(newValue ?? "")}
        onMount={handleEditorDidMount}
        options={defaultOptions}
      />
    </div>
  );
}
