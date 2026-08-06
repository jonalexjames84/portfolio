"use client";

import { useMemo, useState } from "react";
import { FileText, Copy, X, Check, Download, ExternalLink, Search } from "lucide-react";

export type Material = {
  id: string;
  company: string;
  role: string;
  type: string;
  content: string | null;
  jd_text: string | null;
  coverage_score: number | null;
  gaps: string | null;
  created_at: string;
  label: string | null;
  format: string | null;
  storage_path: string | null;
  source_path: string | null;
  file_bytes: number | null;
  origin: string | null;
};

const typeStyles: Record<string, { label: string; color: string }> = {
  resume: { label: "Resume", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cover_letter: { label: "Cover Letter", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  work_product: { label: "Work Product", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "resume", label: "Resumes" },
  { key: "cover_letter", label: "Cover Letters" },
  { key: "work_product", label: "Work Products" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatBytes(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Card title. Cards already sit under a company heading, so a stored label of
 * "Anthropic — Web Product Manager" would read the company twice.
 */
function title(material: Material) {
  const raw = material.label || material.role || material.company;
  const prefix = `${material.company} — `;
  return raw.startsWith(prefix) ? raw.slice(prefix.length) : raw;
}

/** Modal title, where there's no company heading above it to lean on. */
function heading(material: Material) {
  const text = title(material);
  // "General" is the bucket for resumes that target no company, and several
  // resume labels already carry the company name ("Figma AI Platform PM
  // Resume"). Neither wants a prefix.
  if (material.company === "General" || text.toLowerCase().includes(material.company.toLowerCase())) {
    return text;
  }
  return `${material.company} — ${text}`;
}

export function MaterialsGrid({ materials }: { materials: Material[] }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return materials.filter((material) => {
      if (filter !== "all" && material.type !== filter) return false;
      if (!needle) return true;
      // Search the body too — the fastest way back to a letter is often a
      // phrase you remember writing, not the company name.
      return [material.company, material.role, material.label, material.content]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle));
    });
  }, [materials, filter, query]);

  // Resumes are the thing Jon reaches for most and they aren't tied to one
  // company, so they get their own block above the per-company letters instead
  // of being scattered alphabetically among them.
  const { resumes, byCompany } = useMemo(() => {
    const resumeList: Material[] = [];
    const grouped = new Map<string, Material[]>();

    for (const material of filtered) {
      if (material.type === "resume") {
        resumeList.push(material);
        continue;
      }
      const list = grouped.get(material.company) || [];
      list.push(material);
      grouped.set(material.company, list);
    }

    return {
      resumes: resumeList.sort((a, b) => title(a).localeCompare(title(b))),
      byCompany: [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)),
    };
  }, [filtered]);

  const viewing = materials.find((material) => material.id === viewingId) || null;

  async function copyContent(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((option) => {
            const count =
              option.key === "all"
                ? materials.length
                : materials.filter((material) => material.type === option.key).length;
            if (count === 0 && option.key !== "all") return null;
            return (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  filter === option.key
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {option.label}
                <span className="ml-1.5 opacity-60 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search materials…"
            className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="space-y-6">
        {resumes.length > 0 && (
          <Section heading="Resumes" materials={resumes} onView={setViewingId} />
        )}
        {byCompany.map(([company, items]) => (
          <Section key={company} heading={company} materials={items} onView={setViewingId} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-lg font-medium">
            {materials.length === 0 ? "No materials yet" : "Nothing matches that search"}
          </p>
          {materials.length === 0 && (
            <p className="text-sm mt-1">
              Run{" "}
              <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                node scripts/sync-materials.mjs
              </code>{" "}
              to pull in everything under <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">documents/</code>
            </p>
          )}
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setViewingId(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyles[viewing.type]?.color}`}>
                    {typeStyles[viewing.type]?.label || viewing.type}
                  </span>
                  <FormatChip material={viewing} />
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {heading(viewing)}
                </p>
                {viewing.source_path && (
                  <p className="mt-0.5 font-mono text-[11px] text-zinc-400 truncate">{viewing.source_path}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {viewing.content && (
                  <button
                    onClick={() => copyContent(viewing.content!)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
                {viewing.storage_path && (
                  <>
                    <a
                      href={`/api/job-search/materials/${viewing.id}/file`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                    <a
                      href={`/api/job-search/materials/${viewing.id}/file?download=1`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Save
                    </a>
                  </>
                )}
                <button
                  onClick={() => setViewingId(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto">
              {viewing.content ? (
                <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  {viewing.content}
                </pre>
              ) : (
                <div className="text-center py-10 text-zinc-400">
                  <FileText className="h-7 w-7 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">This one is a PDF with no text source. Open or download it above.</p>
                </div>
              )}

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

function FormatChip({ material }: { material: Material }) {
  if (!material.format) return null;
  const label = material.storage_path?.endsWith(".pdf")
    ? "PDF"
    : material.format === "markdown"
      ? "MD"
      : material.format.toUpperCase();
  return (
    <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">
      {label}
    </span>
  );
}

function Section({
  heading,
  materials,
  onView,
}: {
  heading: string;
  materials: Material[];
  onView: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{heading}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {materials.map((material) => {
          const typeInfo = typeStyles[material.type] || typeStyles.resume;
          const size = formatBytes(material.file_bytes);
          return (
            <div
              key={material.id}
              className="relative rounded-xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <button onClick={() => onView(material.id)} className="w-full text-left p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  {material.coverage_score !== null && (
                    <span className="text-xs font-mono text-zinc-400">{material.coverage_score}%</span>
                  )}
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  {title(material)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 pr-16 text-xs text-zinc-400">
                  {formatDate(material.created_at)}
                  <FormatChip material={material} />
                  {size && <span className="tabular-nums">{size}</span>}
                </p>
              </button>

              {material.storage_path && (
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5">
                  <a
                    href={`/api/job-search/materials/${material.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    title="Open in browser"
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={`/api/job-search/materials/${material.id}/file?download=1`}
                    title="Download PDF"
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
