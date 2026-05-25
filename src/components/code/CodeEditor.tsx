"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
      <div className="w-5 h-5 border-2 border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full animate-spin" />
    </div>
  ),
});

const LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "java",
  "cpp",
  "css",
  "html",
  "json",
  "markdown",
  "sql",
];

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const [language, setLanguage] = useState("typescript");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2a2a] bg-[#0d0d0d]">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-[#aaa] rounded px-2 py-1 outline-none"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <span className="text-xs text-[#555]">Shift+Enter for new line</span>
      </div>

      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            tabSize: 2,
            wordWrap: "on",
            renderLineHighlight: "none",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
}
