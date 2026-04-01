# Unified Company Cards — Design Spec

## Overview

Redesign `/job-search/companies` from a simple expandable table into rich "war room" cards. Each card consolidates everything about one company — pipeline status, contacts, outreach tracking, artifacts, scores, and research — into a single expandable view. Replaces the existing `CompaniesTable` component.

Other hub views (`/job-search/network`, `/job-search/materials`, `/job-search/interviews`) remain unchanged for cross-company views.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Where it lives | Replace `/job-search/companies` (option A) | Current table is already expandable; this enriches it rather than adding a new view |
| Roles per company | One role assumed | Jon doesn't normally apply to multiple roles at the same company |
| Outreach tracking | Stage-based per contact (option C) | Clear at-a-glance status without logging overhead |
| Scores | Multiple: fit score, coverage score, ATS score | Maps to existing Job OS agents: `/job-fit-scorer`, `/resume-tailor`, `/review-as-ats` |

## Card Layout

### Collapsed State

A single row per company showing the most important signals at a glance:

```
[Rank] [Company Name] [Stage badge]    [Role Title]    [Pipeline Status badge]    [Outreach indicator]    [Fit Score]
```

- **Rank** — user-defined priority number
- **Company name** — bold, primary text
- **Stage** — company funding stage (e.g., "Series B", "Public") in muted text
- **Role title** — the role from the linked pipeline entry, truncated if long
- **Pipeline status badge** — colored badge showing: saved / applied / screen / interview / offer / rejected / passed (reuses existing `statusStyles` from `PipelineBacklog`)
- **Outreach indicator** — small icon showing the furthest-along contact's outreach stage (color-coded dot or mini badge)
- **Fit score** — small number like "78" in a circle, colored by band (green 75+, amber 60-74, red <60), hidden if no score

### Expanded State

When clicked, the card expands to show 5 sections in a clean vertical layout.

#### Section 1: Role & Pipeline

| Field | Source | Editable? |
|-------|--------|-----------|
| Job title | `job_pipeline_entries.role` | No (set via `/app-tracker`) |
| Job URL | `job_pipeline_entries.job_url` (new column) | Yes (inline) |
| Pipeline stage | `job_pipeline_entries.status` | Yes (dropdown, same as PipelineBacklog) |
| Applied date | `job_pipeline_entries.applied_date` | No |
| Last update | `job_pipeline_entries.last_update` | No |

If no pipeline entry exists for this company, show a muted prompt: "No application tracked yet. Run `/app-tracker add` to start."

#### Section 2: Contact & Outreach

Shows all connections linked to this company from `job_connections`, with the new outreach stage tracking.

Per contact:

| Field | Source | Editable? |
|-------|--------|-----------|
| Name | `job_connections.name` | No |
| LinkedIn connected | `job_connections.linkedin_connected` | No |
| Relationship type | Inferred: if `referral_status != "none"` → referral path, else cold outreach | — |
| Outreach stage | `job_connections.outreach_stage` (new column) | Yes (dropdown) |
| Referral status | `job_connections.referral_status` | Yes (dropdown) |
| Last contact | `job_connections.last_contact` | Yes (date picker) |
| Next action | `job_connections.next_action` | Yes (inline text) |

**Outreach stages** (new enum for `outreach_stage` column):
1. `identified` — know who to contact, haven't reached out
2. `contacted` — sent initial message (LinkedIn DM, email, etc.)
3. `followed_up` — sent follow-up after no response
4. `responded` — got a response
5. `referral_requested` — asked for a referral
6. `referral_received` — referral confirmed

Stage badges use progressive coloring: gray → blue → blue → green → amber → emerald.

If no connections exist for this company, show: "No contacts yet. Run `/connection-request` to find people here."

#### Section 3: Artifacts

Shows all materials from `job_materials` linked by company name.

Per artifact:

| Field | Source |
|-------|--------|
| Type badge | `job_materials.type` — resume / cover_letter / work_product |
| Role | `job_materials.role` |
| Created date | `job_materials.created_at` |
| Coverage score | `job_materials.coverage_score` (resumes only) |

Click an artifact → opens the existing MaterialsGrid modal (full content view with copy button). Reuse the modal from `MaterialsGrid.tsx`.

If no materials exist: "No materials generated. Run `/resume-tailor` or `/cover-letter` to create."

#### Section 4: Scores

Three score indicators displayed as a horizontal row of mini score cards:

| Score | Source | Display |
|-------|--------|---------|
| Job Fit Score | `job_pipeline_entries.fit_score` (new column) | `XX/100` with colored ring (green ≥75, amber 60-74, red <60) |
| Resume Coverage | `job_materials.coverage_score` (existing, from latest resume) | `XX%` |
| ATS Result | `job_pipeline_entries.ats_result` (new column) | PASS / WARNINGS / FAIL badge |

Each score card also shows the recommendation band for fit score: "Apply Immediately" / "Referral Only" / "Skip".

If no scores exist: "Run `/job-fit-scorer` with the JD to score this role."

#### Section 5: Research & Notes

| Field | Source | Editable? |
|-------|--------|-----------|
| Intel link | Link to `/job-search/intel/[slug]` (existing) | No |
| Notes | `job_target_companies.notes` | Yes (textarea) |
| Recent news | `job_target_companies.recent_news` | No (set via `/company-research`) |

## Database Changes

All changes in existing Supabase project (`red-ox-mobile`) with `job_` prefix.

### job_pipeline_entries — add columns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `job_url` | text | null | Link to the job posting |
| `fit_score` | integer | null | 0-100, set by `/job-fit-scorer` |
| `ats_result` | text | null | "pass", "pass_with_warnings", "fail" |

### job_connections — add column

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `outreach_stage` | text | "identified" | One of: identified, contacted, followed_up, responded, referral_requested, referral_received |

### No new tables needed

All data is joined from existing tables:
- `job_target_companies` (company info, notes, rank)
- `job_pipeline_entries` (role, pipeline status, scores) — joined by company name
- `job_connections` (contacts, outreach) — joined by `company_id` FK
- `job_materials` (artifacts) — joined by company name

## API Changes

### GET /api/job-search/companies

Modify the existing endpoint to return enriched company data with joins:

```typescript
// Fetch companies with their pipeline entries, connections, and materials
const { data: companies } = await supabase
  .from("job_target_companies")
  .select("*")
  .order("rank", { ascending: true, nullsFirst: false });

// For each company, fetch related data
// Pipeline entry (one per company, most recent)
// Connections (all for this company)
// Materials (all for this company)
```

Return shape per company:

```typescript
type EnrichedCompany = {
  // From job_target_companies
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

  // Joined from job_pipeline_entries (latest for this company)
  pipeline: {
    id: string;
    role: string;
    status: string;
    applied_date: string | null;
    last_update: string;
    job_url: string | null;
    fit_score: number | null;
    ats_result: string | null;
  } | null;

  // Joined from job_connections
  connections: {
    id: string;
    name: string;
    linkedin_connected: boolean;
    outreach_stage: string;
    referral_status: string;
    last_contact: string | null;
    next_action: string | null;
  }[];

  // Joined from job_materials
  materials: {
    id: string;
    type: string;
    role: string;
    coverage_score: number | null;
    created_at: string;
    content: string;
    gaps: string | null;
  }[];
};
```

### PATCH /api/job-search/companies/[id]

Already exists — continues to update `job_target_companies` fields (rank, hiring_status, notes).

### PATCH /api/job-search/pipeline/[id]

Already exists — add support for updating `job_url`, `fit_score`, `ats_result` alongside `status`.

### PATCH /api/job-search/connections/[id]

Already exists — add support for updating `outreach_stage`.

## Component Changes

### Replace: CompaniesTable.tsx → CompanyCards.tsx

New client component that renders the enriched company data as expandable cards.

**Props:** `{ companies: EnrichedCompany[] }`

**State:**
- `expandedId` — which company card is expanded (null = none)
- `editingField` — which field is being inline-edited
- `filter` — pipeline status filter (all / active / applied / interview / etc.)
- `sortBy` — rank (default) / name / last updated / fit score
- `viewingMaterialId` — triggers the material content modal

**Filters update:** Instead of filtering by hiring status (active/unknown/frozen), filter by pipeline status (all / active / saved / applied / screen / interview). "Active" = not rejected/passed. Companies with no pipeline entry show under "all" only.

**Sort options:** Rank, company name, last updated, fit score (desc).

### Reuse from existing components

- Pipeline status dropdown + styles from `PipelineBacklog.tsx`
- Referral status badges from `ConnectionsList.tsx`
- Material type badges + content modal from `MaterialsGrid.tsx`
- Card styling patterns: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl`

### New: OutreachStageBadge

Small inline component for the outreach stage dropdown/badge:

```
identified → contacted → followed_up → responded → referral_requested → referral_received
```

Color scheme:
- `identified`: gray (zinc)
- `contacted`: blue
- `followed_up`: indigo
- `responded`: green
- `referral_requested`: amber
- `referral_received`: emerald

## Data Flow

```
Page load (server component)
  → Fetch companies from Supabase with joins
  → Pass enriched data to CompanyCards client component

User expands card
  → All data already loaded, no additional fetch

User edits field (pipeline status, outreach stage, notes, etc.)
  → Optimistic UI update
  → PATCH to appropriate API route
  → Revert on error
```

## Empty States

| Scenario | Display |
|----------|---------|
| No companies at all | "No target companies yet. Run `/company-research generate target list` in Claude Code" |
| Company has no pipeline entry | Role section shows "No application tracked" prompt |
| Company has no connections | Contact section shows "No contacts yet" prompt |
| Company has no materials | Artifacts section shows "No materials generated" prompt |
| Company has no scores | Scores section shows "Run `/job-fit-scorer`" prompt |

## Job OS Integration

The existing Job OS skills write to the hub via API. These mappings remain unchanged:

| Skill | Table | New Fields Used |
|-------|-------|-----------------|
| `/job-fit-scorer` | `job_pipeline_entries` | `fit_score` (new) |
| `/review-as-ats` | `job_pipeline_entries` | `ats_result` (new) |
| `/resume-tailor` | `job_materials` | `coverage_score` (existing) |
| `/app-tracker add` | `job_pipeline_entries` | `job_url` (new) |
| `/connection-request` | `job_connections` | `outreach_stage` (new, defaults to "identified") |
| `/cover-letter` | `job_materials` | (existing) |
| `/work-product` | `job_materials` | (existing) |

Skills that write scores (`/job-fit-scorer`, `/review-as-ats`) should be updated to POST/PATCH the scores to `job_pipeline_entries` after generating output. This is a Job OS skill update, not a frontend change.

## Out of Scope

- Multi-role per company support (optimize for one role)
- Drag-and-drop reordering of cards
- Kanban/board view (pipeline entries already have this in the dashboard)
- Bulk actions (select multiple companies)
- Real-time updates (page refresh to see new data)
