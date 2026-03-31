"use client";

import { useState } from "react";
import { FileText, Copy, X, Check } from "lucide-react";

type Material = {
  id: string;
  company: string;
  role: string;
  type: string;
  content: string;
  jd_text: string | null;
  coverage_score: number | null;
  gaps: string | null;
  created_at: string;
};

const typeStyles: Record<string, { label: string; color: string }> = {
  resume: { label: "Resume", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cover_letter: { label: "Cover Letter", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  work_product: { label: "Work Product", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

export function MaterialsGrid({ materials: initial }: { materials: Material[] }) {
  const [materials] = useState(initial);
  const [filter, setFilter] = useState<string>("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = materials.filter((m) => {
    if (filter === "all") return true;
    return m.type === filter;
  });

  const grouped: Record<string, Material[]> = {};
  for (const m of filtered) {
    if (!grouped[m.company]) grouped[m.company] = [];
    grouped[m.company].push(m);
  }

  const viewing = materials.find((m) => m.id === viewingId);

  async function copyContent(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "All" },
          { key: "resume", label: "Resumes" },
          { key: "cover_letter", label: "Cover Letters" },
          { key: "work_product", label: "Work Products" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              filter === f.key
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([company, items]) => (
          <div key={company}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{company}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((material) => {
                const typeInfo = typeStyles[material.type] || typeStyles.resume;
                return (
                  <button
                    key={material.id}
                    onClick={() => setViewingId(material.id)}
                    className="text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {material.coverage_score !== null && (
                        <span className="text-xs font-mono text-zinc-400">{material.coverage_score}%</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{material.role}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(material.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">No materials yet</p>
          <p className="text-sm mt-1">Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/resume-tailor</code> or <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/cover-letter</code> in Claude Code</p>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewingId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyles[viewing.type]?.color}`}>
                  {typeStyles[viewing.type]?.label}
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{viewing.company} — {viewing.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyContent(viewing.content)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={() => setViewingId(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(80vh-64px)]">
              <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{viewing.content}</pre>
              {viewing.gaps && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="text-[11px] font-medium text-amber-600 uppercase tracking-wide mb-1">Gaps</div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">{viewing.gaps}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
