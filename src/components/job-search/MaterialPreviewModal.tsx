"use client";

import { useState } from "react";
import { Copy, X, Check } from "lucide-react";

const typeStyles: Record<string, { label: string; color: string }> = {
  resume: { label: "Resume", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cover_letter: { label: "Cover Letter", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  work_product: { label: "Work Product", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

export function MaterialPreviewModal({
  material,
  onClose,
}: {
  material: {
    type: string;
    company?: string;
    role: string;
    content: string;
    gaps: string | null;
  };
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const typeInfo = typeStyles[material.type] || typeStyles.resume;

  async function copyContent() {
    await navigator.clipboard.writeText(material.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {material.company ? `${material.company} — ` : ""}{material.role}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyContent}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <X className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(80vh-64px)]">
          <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
            {material.content}
          </pre>
          {material.gaps && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wide mb-1">Gaps</div>
              <div className="text-sm text-amber-700 dark:text-amber-300">{material.gaps}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
