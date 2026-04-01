"use client";

import { useState } from "react";
import { ExternalLink, Linkedin, Pencil, Check, X, FileText } from "lucide-react";
import type { EnrichedCompany, PipelineEntry, ConnectionEntry } from "@/app/job-search/companies/page";
import { OutreachStageBadge, type OutreachStage } from "./OutreachStageBadge";
import { ScoreIndicators } from "./ScoreIndicator";
import { MaterialPreviewModal } from "./MaterialPreviewModal";

const statusOptions = ["saved", "applied", "screen", "interview", "offer", "rejected", "passed"];

const statusStyles: Record<string, string> = {
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  screen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  interview: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offer: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  passed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const referralStyles: Record<string, string> = {
  none: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  strong: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

const materialTypeStyles: Record<string, { label: string; color: string }> = {
  resume: { label: "Resume", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  cover_letter: { label: "Cover Letter", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  work_product: { label: "Work Product", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-2">
      {children}
    </div>
  );
}

export function CompanyCardExpanded({
  company,
  onUpdatePipeline,
  onUpdateConnection,
  onUpdateCompany,
}: {
  company: EnrichedCompany;
  onUpdatePipeline: (id: string, updates: Partial<PipelineEntry>) => void;
  onUpdateConnection: (id: string, updates: Partial<ConnectionEntry>) => void;
  onUpdateCompany: (id: string, updates: { notes?: string; rank?: number; hiring_status?: string }) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(company.notes || "");
  const [editingJobUrl, setEditingJobUrl] = useState(false);
  const [jobUrlValue, setJobUrlValue] = useState(company.pipeline?.job_url || "");
  const [viewingMaterial, setViewingMaterial] = useState<(typeof company.materials)[number] | null>(null);

  const latestResumeCoverage = company.materials.find((m) => m.type === "resume" && m.coverage_score !== null)?.coverage_score ?? null;

  return (
    <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-5">
      {/* Section 1: Role & Pipeline */}
      <div>
        <SectionLabel>Role & Pipeline</SectionLabel>
        {company.pipeline ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {company.pipeline.role}
              </span>
              <select
                value={company.pipeline.status}
                onChange={(e) => onUpdatePipeline(company.pipeline!.id, { status: e.target.value })}
                className={`appearance-none text-[11px] font-medium pl-2.5 pr-6 py-1 rounded-full border-0 cursor-pointer ${statusStyles[company.pipeline.status] || statusStyles.applied}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              {company.pipeline.applied_date && (
                <span>Applied {new Date(company.pipeline.applied_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              )}
              {company.pipeline.job_url && !editingJobUrl ? (
                <a
                  href={company.pipeline.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Job Posting
                </a>
              ) : null}
              {!editingJobUrl ? (
                <button
                  onClick={() => setEditingJobUrl(true)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {company.pipeline.job_url ? "Edit URL" : "+ Add URL"}
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="url"
                    value={jobUrlValue}
                    onChange={(e) => setJobUrlValue(e.target.value)}
                    placeholder="https://..."
                    className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 w-64"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onUpdatePipeline(company.pipeline!.id, { job_url: jobUrlValue } as Partial<PipelineEntry>);
                      setEditingJobUrl(false);
                    }}
                    className="p-1 text-emerald-500 hover:text-emerald-600"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingJobUrl(false); setJobUrlValue(company.pipeline?.job_url || ""); }}
                    className="p-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : company.job_title ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {company.job_title}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                open
              </span>
            </div>
            {company.job_url && (
              <a
                href={company.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> View Job Posting
              </a>
            )}
            <p className="text-xs text-zinc-400">
              Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/app-tracker add</code> to track your application.
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">
            No job listing added. Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/app-tracker add</code> to start.
          </p>
        )}
      </div>

      {/* Section 2: Contact & Outreach */}
      <div>
        <SectionLabel>Contact & Outreach</SectionLabel>
        {company.connections.length > 0 ? (
          <div className="space-y-2">
            {company.connections.map((conn) => (
              <div key={conn.id} className="flex items-start justify-between bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{conn.name}</span>
                    {conn.linkedin_connected && <Linkedin className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <OutreachStageBadge
                      stage={conn.outreach_stage}
                      editable
                      onChange={(stage: OutreachStage) => onUpdateConnection(conn.id, { outreach_stage: stage })}
                    />
                    {conn.referral_status !== "none" && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${referralStyles[conn.referral_status]}`}>
                        referral: {conn.referral_status}
                      </span>
                    )}
                  </div>
                  {conn.last_contact && (
                    <p className="text-[11px] text-zinc-400">
                      Last contact: {new Date(conn.last_contact + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                  {conn.next_action && (
                    <p className="text-xs text-zinc-500">Next: {conn.next_action}</p>
                  )}
                </div>
                {conn.linkedin_url && (
                  <a href={conn.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">
            No contacts yet. Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/connection-request</code> to find people here.
          </p>
        )}
      </div>

      {/* Section 3: Artifacts */}
      <div>
        <SectionLabel>Artifacts</SectionLabel>
        {company.materials.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {company.materials.map((mat) => {
              const typeInfo = materialTypeStyles[mat.type] || materialTypeStyles.resume;
              return (
                <button
                  key={mat.id}
                  onClick={() => setViewingMaterial(mat)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-left"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(mat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  {mat.coverage_score !== null && (
                    <span className="text-xs font-mono text-zinc-400">{mat.coverage_score}%</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 italic">
            No materials generated. Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/resume-tailor</code> or <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/cover-letter</code> to create.
          </p>
        )}
      </div>

      {/* Section 4: Scores */}
      <div>
        <SectionLabel>Scores</SectionLabel>
        <ScoreIndicators
          fitScore={company.pipeline?.fit_score ?? null}
          coverageScore={latestResumeCoverage}
          atsResult={company.pipeline?.ats_result ?? null}
        />
      </div>

      {/* Section 5: Research & Notes */}
      <div>
        <SectionLabel>Research & Notes</SectionLabel>
        <div className="space-y-3">
          {company.recent_news && (
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Recent News</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{company.recent_news}</p>
            </div>
          )}
          <div className="flex items-start justify-between">
            {editingNotes ? (
              <div className="w-full space-y-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={3}
                  className="w-full text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onUpdateCompany(company.id, { notes: notesValue }); setEditingNotes(false); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600"
                  >
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                  <button
                    onClick={() => { setEditingNotes(false); setNotesValue(company.notes || ""); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {company.notes ? (
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{company.notes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">No notes</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Pencil className="h-3.5 w-3.5" /> {company.notes ? "Edit Notes" : "Add Notes"}
                  </button>
                  <a
                    href={`/job-search/intel/${company.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Company Intel
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Material preview modal */}
      {viewingMaterial && (
        <MaterialPreviewModal
          material={{ ...viewingMaterial, company: company.name }}
          onClose={() => setViewingMaterial(null)}
        />
      )}
    </div>
  );
}
