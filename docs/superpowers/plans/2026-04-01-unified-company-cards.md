# Unified Company Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/job-search/companies` table with rich, expandable company cards that consolidate pipeline status, contacts, outreach tracking, artifacts, scores, and research per company.

**Architecture:** Server component fetches enriched company data via parallel Supabase queries joined by company name/ID. A single client component (`CompanyCards`) renders expandable cards with inline editing and optimistic updates. Reuses existing API routes (PATCH endpoints) with minor additions for new columns.

**Tech Stack:** Next.js App Router, Supabase (existing `red-ox-mobile` project), React client components, Tailwind CSS, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-04-01-unified-company-cards-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/app/job-search/companies/page.tsx` | Modify: server component fetches enriched data with joins |
| `src/components/job-search/CompanyCards.tsx` | Create: main client component replacing CompaniesTable |
| `src/components/job-search/CompanyCardExpanded.tsx` | Create: expanded card content (5 sections) |
| `src/components/job-search/OutreachStageBadge.tsx` | Create: outreach stage dropdown/badge |
| `src/components/job-search/MaterialPreviewModal.tsx` | Create: extracted material content modal (from MaterialsGrid) |
| `src/components/job-search/ScoreIndicator.tsx` | Create: score display component (fit score ring, coverage %, ATS badge) |
| `src/app/api/job-search/pipeline/[id]/route.ts` | Modify: accept `job_url`, `fit_score`, `ats_result` fields |
| `src/components/job-search/CompaniesTable.tsx` | Delete: replaced by CompanyCards |

---

## Task 1: Database Migrations

Add new columns to existing tables via Supabase SQL.

**Files:**
- No code files — SQL run against Supabase directly

- [ ] **Step 1: Add columns to job_pipeline_entries**

Run this SQL in Supabase SQL editor (or via `supabase` CLI):

```sql
ALTER TABLE job_pipeline_entries
ADD COLUMN IF NOT EXISTS job_url text,
ADD COLUMN IF NOT EXISTS fit_score integer,
ADD COLUMN IF NOT EXISTS ats_result text;
```

- [ ] **Step 2: Add outreach_stage column to job_connections**

```sql
ALTER TABLE job_connections
ADD COLUMN IF NOT EXISTS outreach_stage text DEFAULT 'identified';
```

- [ ] **Step 3: Verify columns exist**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('job_pipeline_entries', 'job_connections')
AND column_name IN ('job_url', 'fit_score', 'ats_result', 'outreach_stage');
```

Expected: 4 rows returned.

- [ ] **Step 4: Commit plan file**

```bash
git add docs/superpowers/plans/2026-04-01-unified-company-cards.md
git commit -m "docs: add unified company cards implementation plan"
```

---

## Task 2: Update Pipeline API to Accept New Fields

Modify the existing PATCH endpoint to pass through the new columns.

**Files:**
- Modify: `src/app/api/job-search/pipeline/[id]/route.ts`

- [ ] **Step 1: Update the PATCH handler to accept new fields**

Replace the entire contents of `src/app/api/job-search/pipeline/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.status) updates.status = body.status;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.job_url !== undefined) updates.job_url = body.job_url;
  if (body.fit_score !== undefined) updates.fit_score = body.fit_score;
  if (body.ats_result !== undefined) updates.ats_result = body.ats_result;
  updates.last_update = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/pipeline/[id]/route.ts
git commit -m "feat: accept job_url, fit_score, ats_result in pipeline PATCH"
```

---

## Task 3: Enriched Data Fetching in Companies Page

Modify the server component to fetch companies with their pipeline entries, connections, and materials via parallel Supabase queries.

**Files:**
- Modify: `src/app/job-search/companies/page.tsx`

- [ ] **Step 1: Define the EnrichedCompany type and fetch function**

Replace the entire contents of `src/app/job-search/companies/page.tsx`:

```typescript
import { supabase } from "@/lib/supabase";
import { CompanyCards } from "@/components/job-search/CompanyCards";

export const metadata = { title: "Target Companies" };

export type PipelineEntry = {
  id: string;
  role: string;
  status: string;
  applied_date: string | null;
  last_update: string;
  job_url: string | null;
  fit_score: number | null;
  ats_result: string | null;
};

export type ConnectionEntry = {
  id: string;
  name: string;
  linkedin_connected: boolean;
  linkedin_url: string | null;
  outreach_stage: string;
  referral_status: string;
  last_contact: string | null;
  next_action: string | null;
};

export type MaterialEntry = {
  id: string;
  type: string;
  role: string;
  coverage_score: number | null;
  created_at: string;
  content: string;
  gaps: string | null;
};

export type EnrichedCompany = {
  id: string;
  rank: number | null;
  name: string;
  stage: string | null;
  industry: string | null;
  product_focus: string | null;
  hiring_status: string | null;
  recent_news: string | null;
  notes: string | null;
  updated_at: string;
  pipeline: PipelineEntry | null;
  connections: ConnectionEntry[];
  materials: MaterialEntry[];
};

export default async function CompaniesPage() {
  const [companiesRes, pipelineRes, connectionsRes, materialsRes] =
    await Promise.all([
      supabase
        .from("job_target_companies")
        .select("*")
        .order("rank", { ascending: true, nullsFirst: false }),
      supabase
        .from("job_pipeline_entries")
        .select("id, company, role, status, applied_date, last_update, job_url, fit_score, ats_result")
        .order("last_update", { ascending: false }),
      supabase
        .from("job_connections")
        .select("id, name, company_id, company_name, linkedin_connected, linkedin_url, outreach_stage, referral_status, last_contact, next_action"),
      supabase
        .from("job_materials")
        .select("id, company, type, role, coverage_score, created_at, content, gaps")
        .order("created_at", { ascending: false }),
    ]);

  const companies = companiesRes.data || [];
  const pipelineEntries = pipelineRes.data || [];
  const connections = connectionsRes.data || [];
  const materials = materialsRes.data || [];

  // Build lookup maps
  const pipelineByCompany = new Map<string, PipelineEntry>();
  for (const entry of pipelineEntries) {
    const key = (entry.company || "").toLowerCase();
    if (!pipelineByCompany.has(key)) {
      pipelineByCompany.set(key, entry);
    }
  }

  const connectionsByCompanyId = new Map<string, ConnectionEntry[]>();
  const connectionsByCompanyName = new Map<string, ConnectionEntry[]>();
  for (const conn of connections) {
    if (conn.company_id) {
      const list = connectionsByCompanyId.get(conn.company_id) || [];
      list.push(conn);
      connectionsByCompanyId.set(conn.company_id, list);
    }
    if (conn.company_name) {
      const key = conn.company_name.toLowerCase();
      const list = connectionsByCompanyName.get(key) || [];
      list.push(conn);
      connectionsByCompanyName.set(key, list);
    }
  }

  const materialsByCompany = new Map<string, MaterialEntry[]>();
  for (const mat of materials) {
    const key = (mat.company || "").toLowerCase();
    const list = materialsByCompany.get(key) || [];
    list.push(mat);
    materialsByCompany.set(key, list);
  }

  // Enrich companies
  const enriched: EnrichedCompany[] = companies.map((company) => {
    const nameKey = company.name.toLowerCase();
    return {
      ...company,
      pipeline: pipelineByCompany.get(nameKey) || null,
      connections:
        connectionsByCompanyId.get(company.id) ||
        connectionsByCompanyName.get(nameKey) ||
        [],
      materials: materialsByCompany.get(nameKey) || [],
    };
  });

  return <CompanyCards companies={enriched} />;
}
```

- [ ] **Step 2: Verify TypeScript compiles** (will fail until CompanyCards exists — that's expected)

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: error about missing `CompanyCards` module (that's the next task)

- [ ] **Step 3: Commit**

```bash
git add src/app/job-search/companies/page.tsx
git commit -m "feat: fetch enriched company data with pipeline, connections, materials joins"
```

---

## Task 4: OutreachStageBadge Component

Small component for displaying and editing the outreach stage.

**Files:**
- Create: `src/components/job-search/OutreachStageBadge.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

const stages = [
  "identified",
  "contacted",
  "followed_up",
  "responded",
  "referral_requested",
  "referral_received",
] as const;

export type OutreachStage = (typeof stages)[number];

const stageStyles: Record<OutreachStage, string> = {
  identified: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  followed_up: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  responded: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  referral_requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  referral_received: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const stageLabels: Record<OutreachStage, string> = {
  identified: "Identified",
  contacted: "Contacted",
  followed_up: "Followed Up",
  responded: "Responded",
  referral_requested: "Referral Requested",
  referral_received: "Referral Received",
};

export function OutreachStageBadge({
  stage,
  editable = false,
  onChange,
}: {
  stage: string;
  editable?: boolean;
  onChange?: (stage: OutreachStage) => void;
}) {
  const validStage = (stages.includes(stage as OutreachStage) ? stage : "identified") as OutreachStage;

  if (editable && onChange) {
    return (
      <select
        value={validStage}
        onChange={(e) => onChange(e.target.value as OutreachStage)}
        className={`appearance-none text-[11px] font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${stageStyles[validStage]}`}
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {stageLabels[s]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${stageStyles[validStage]}`}>
      {stageLabels[validStage]}
    </span>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors from this file

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/OutreachStageBadge.tsx
git commit -m "feat: add OutreachStageBadge component"
```

---

## Task 5: ScoreIndicator Component

Displays fit score, coverage score, and ATS result.

**Files:**
- Create: `src/components/job-search/ScoreIndicator.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

function FitScoreRing({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const bgColor =
    score >= 75
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : score >= 60
        ? "bg-amber-50 dark:bg-amber-900/20"
        : "bg-red-50 dark:bg-red-900/20";

  const bandLabel =
    score >= 75 ? "Apply Immediately" : score >= 60 ? "Referral Only" : "Skip";

  return (
    <div className={`rounded-xl ${bgColor} p-3 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{score}</div>
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
        Fit Score
      </div>
      <div className={`text-[10px] font-medium mt-1 ${color}`}>{bandLabel}</div>
    </div>
  );
}

function CoverageScore({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const bgColor =
    score >= 70
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : score >= 50
        ? "bg-amber-50 dark:bg-amber-900/20"
        : "bg-red-50 dark:bg-red-900/20";

  return (
    <div className={`rounded-xl ${bgColor} p-3 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{score}%</div>
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
        Resume Coverage
      </div>
    </div>
  );
}

function AtsBadge({ result }: { result: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pass: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "PASS",
    },
    pass_with_warnings: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      label: "WARNINGS",
    },
    fail: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      label: "FAIL",
    },
  };

  const style = styles[result] || styles.pass_with_warnings;

  return (
    <div className={`rounded-xl ${style.bg} p-3 text-center`}>
      <div className={`text-lg font-bold ${style.text}`}>{style.label}</div>
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
        ATS Check
      </div>
    </div>
  );
}

export function ScoreIndicators({
  fitScore,
  coverageScore,
  atsResult,
}: {
  fitScore: number | null;
  coverageScore: number | null;
  atsResult: string | null;
}) {
  const hasAny = fitScore !== null || coverageScore !== null || atsResult !== null;

  if (!hasAny) {
    return (
      <p className="text-sm text-zinc-400 italic">
        Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/job-fit-scorer</code> with the JD to score this role.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {fitScore !== null ? (
        <FitScoreRing score={fitScore} />
      ) : (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center text-zinc-400 text-xs">No fit score</div>
      )}
      {coverageScore !== null ? (
        <CoverageScore score={coverageScore} />
      ) : (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center text-zinc-400 text-xs">No coverage</div>
      )}
      {atsResult !== null ? (
        <AtsBadge result={atsResult} />
      ) : (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center text-zinc-400 text-xs">No ATS check</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors from this file

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/ScoreIndicator.tsx
git commit -m "feat: add ScoreIndicators component for fit/coverage/ATS display"
```

---

## Task 6: MaterialPreviewModal Component

Extract the material content modal from MaterialsGrid into a reusable component.

**Files:**
- Create: `src/components/job-search/MaterialPreviewModal.tsx`

- [ ] **Step 1: Create the component**

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/MaterialPreviewModal.tsx
git commit -m "feat: extract MaterialPreviewModal as reusable component"
```

---

## Task 7: CompanyCardExpanded Component

The expanded section of a company card, containing all 5 sections.

**Files:**
- Create: `src/components/job-search/CompanyCardExpanded.tsx`

- [ ] **Step 1: Create the component**

```typescript
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
        ) : (
          <p className="text-sm text-zinc-400 italic">
            No application tracked yet. Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/app-tracker add</code> to start.
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
                      onChange={(stage) => onUpdateConnection(conn.id, { outreach_stage: stage })}
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: no errors (or only errors from missing CompanyCards — next task)

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/CompanyCardExpanded.tsx
git commit -m "feat: add CompanyCardExpanded with 5 sections"
```

---

## Task 8: CompanyCards Main Component

The main component that replaces CompaniesTable. Renders collapsed cards with expand/collapse, filters, sorting, and optimistic updates.

**Files:**
- Create: `src/components/job-search/CompanyCards.tsx`
- Delete: `src/components/job-search/CompaniesTable.tsx`

- [ ] **Step 1: Create CompanyCards component**

```typescript
"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { EnrichedCompany, PipelineEntry, ConnectionEntry } from "@/app/job-search/companies/page";
import { CompanyCardExpanded } from "./CompanyCardExpanded";

const statusStyles: Record<string, string> = {
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  screen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  interview: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offer: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  passed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const outreachColors: Record<string, string> = {
  identified: "bg-zinc-400",
  contacted: "bg-blue-500",
  followed_up: "bg-indigo-500",
  responded: "bg-green-500",
  referral_requested: "bg-amber-500",
  referral_received: "bg-emerald-500",
};

function bestOutreachStage(connections: ConnectionEntry[]): string | null {
  const order = ["referral_received", "referral_requested", "responded", "followed_up", "contacted", "identified"];
  for (const stage of order) {
    if (connections.some((c) => c.outreach_stage === stage)) return stage;
  }
  return null;
}

function FitScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
      : score >= 60
        ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
        : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

export function CompanyCards({ companies: initial }: { companies: EnrichedCompany[] }) {
  const [companies, setCompanies] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rank");

  const filtered = companies.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return c.pipeline && !["rejected", "passed"].includes(c.pipeline.status);
    return c.pipeline?.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "updated_at") return (b.updated_at || "").localeCompare(a.updated_at || "");
    if (sortBy === "fit_score") return (b.pipeline?.fit_score || 0) - (a.pipeline?.fit_score || 0);
    return (a.rank || 999) - (b.rank || 999);
  });

  async function handleUpdatePipeline(pipelineId: string, updates: Partial<PipelineEntry>) {
    // Optimistic update
    setCompanies((prev) =>
      prev.map((c) =>
        c.pipeline?.id === pipelineId
          ? { ...c, pipeline: { ...c.pipeline!, ...updates } }
          : c
      )
    );

    const res = await fetch(`/api/job-search/pipeline/${pipelineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      // Revert on error
      setCompanies(initial);
    }
  }

  async function handleUpdateConnection(connectionId: string, updates: Partial<ConnectionEntry>) {
    // Optimistic update
    setCompanies((prev) =>
      prev.map((c) => ({
        ...c,
        connections: c.connections.map((conn) =>
          conn.id === connectionId ? { ...conn, ...updates } : conn
        ),
      }))
    );

    const res = await fetch(`/api/job-search/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      setCompanies(initial);
    }
  }

  async function handleUpdateCompany(companyId: string, updates: { notes?: string; rank?: number; hiring_status?: string }) {
    // Optimistic update
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, ...updates } : c
      )
    );

    const res = await fetch(`/api/job-search/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      setCompanies(initial);
    }
  }

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "saved", label: "Saved" },
    { key: "applied", label: "Applied" },
    { key: "screen", label: "Screen" },
    { key: "interview", label: "Interview" },
  ];

  return (
    <div>
      {/* Filters and sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg px-3 py-1.5 text-zinc-600 dark:text-zinc-400"
        >
          <option value="rank">Sort by Rank</option>
          <option value="name">Sort by Name</option>
          <option value="updated_at">Last Updated</option>
          <option value="fit_score">Fit Score</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {sorted.map((company) => {
          const isExpanded = expandedId === company.id;
          const outreachStage = bestOutreachStage(company.connections);

          return (
            <div
              key={company.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded
                  ? "border-accent-500 dark:border-accent-600 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Collapsed row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
              >
                <span className="text-xs font-mono text-zinc-400 w-6 text-right shrink-0">
                  {company.rank || "—"}
                </span>
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {company.name}
                  </span>
                  {company.stage && (
                    <span className="text-xs text-zinc-400 ml-2">{company.stage}</span>
                  )}
                </div>
                {company.pipeline && (
                  <>
                    <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">
                      {company.pipeline.role}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[company.pipeline.status] || statusStyles.applied}`}>
                      {company.pipeline.status}
                    </span>
                  </>
                )}
                {outreachStage && (
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${outreachColors[outreachStage] || "bg-zinc-400"}`} title={`Outreach: ${outreachStage}`} />
                )}
                {company.pipeline?.fit_score != null && (
                  <FitScoreBadge score={company.pipeline.fit_score} />
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <CompanyCardExpanded
                  company={company}
                  onUpdatePipeline={handleUpdatePipeline}
                  onUpdateConnection={handleUpdateConnection}
                  onUpdateCompany={handleUpdateCompany}
                />
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg font-medium">No target companies yet</p>
          <p className="text-sm mt-1">
            Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/company-research generate target list</code> in Claude Code
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Delete the old CompaniesTable**

```bash
rm src/components/job-search/CompaniesTable.tsx
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: clean build, no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/job-search/CompanyCards.tsx
git rm src/components/job-search/CompaniesTable.tsx
git commit -m "feat: replace CompaniesTable with CompanyCards

Unified company cards showing pipeline status, contacts, outreach,
artifacts, scores, and research in one expandable view."
```

---

## Task 9: Smoke Test and Fix

Verify the full flow works end to end.

**Files:**
- Possibly modify any file from previous tasks if issues found

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

Navigate to `http://localhost:3000/job-search/companies` and verify:
- Page loads without errors
- Companies render as cards with collapsed view
- Clicking a card expands to show all 5 sections
- Pipeline status dropdown changes and persists
- Outreach stage dropdown changes and persists
- Notes editing works (edit → save → see updated)
- Material artifacts appear and click opens modal
- Scores section shows data or empty state
- Filters (All / Active / Applied / etc.) work
- Sort options (Rank / Name / Last Updated / Fit Score) work

- [ ] **Step 2: Check for console errors**

Open browser DevTools → Console. Verify no React errors, no failed API calls.

- [ ] **Step 3: Fix any issues found**

Address TypeScript errors, broken API calls, or UI issues.

- [ ] **Step 4: Run full type check**

```bash
npx tsc --noEmit --pretty
```

Expected: clean, no errors.

- [ ] **Step 5: Run linter if available**

```bash
npm run lint 2>&1 | head -30
```

Fix any lint errors.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix: address any issues from smoke testing company cards"
```

Only commit if there were actual fixes. Skip if everything was clean.
