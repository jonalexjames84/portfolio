# Job Search Hub — Design Spec

## Overview

A private, password-gated section of the portfolio site that surfaces Job Search OS data in an interactive frontend. Separate from the existing daily dashboard (`/dashboard/job-search`), which remains the quick daily task view. The hub is the full operating system — target companies, networking CRM, materials library, interview history, and company intel.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Relationship to dashboard | Separate page (B) | Dashboard stays as daily task view; hub is the comprehensive operating system |
| Data source | Supabase (A) | Matches existing patterns; enables interactive CRUD; Job Search OS skills POST via API |
| Navigation | Nested routes (B) | Deep-linkable; independent data loading per section; matches Next.js app router patterns |
| Auth | Simple password gate (B) | Cookie-based; enter once, persists. No full auth overhead. Protects sensitive pipeline data |

## Route Structure

```
/job-search                → password gate → overview/landing
/job-search/companies      → target companies list
/job-search/network        → connections CRM
/job-search/materials      → materials library
/job-search/interviews     → interview prep & history
/job-search/intel/[slug]   → individual company intel profile
```

## Auth Gate

- Middleware checks for a `job_search_token` cookie on all `/job-search/*` routes
- If missing, renders a password input page
- Password is validated against `JOB_SEARCH_PASSWORD` env var
- On success, sets an httpOnly cookie (30-day expiry)
- API routes continue using existing Bearer token pattern (`JOB_SEARCH_API_KEY`)

## Database Schema

All tables in existing Supabase project (`red-ox-mobile`) with `job_` prefix.

### job_target_companies (new)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| rank | integer | User-defined priority rank |
| name | text | Company name |
| stage | text | e.g., "Series B", "Public", "Seed" |
| industry | text | e.g., "AI/ML", "SaaS", "Dev Tools" |
| product_focus | text | What they build |
| hiring_status | text | "active", "unknown", "frozen" |
| recent_news | text | 1-2 sentences |
| connections_count | integer | Default 0, denormalized for list view |
| notes | text | Freeform |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### job_connections (new)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | Contact name |
| company_id | uuid | FK → job_target_companies.id, nullable |
| company_name | text | Denormalized for display when no FK |
| linkedin_url | text | nullable |
| linkedin_connected | boolean | Default false |
| met_in_person | boolean | Default false |
| meeting_notes | text | nullable |
| referral_status | text | "none", "requested", "received", "strong" |
| referral_role | text | Which role the referral is for |
| last_contact | date | nullable |
| next_action | text | nullable |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

### job_materials (new)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| company | text | Company name |
| role | text | Role title |
| type | text | "resume", "cover_letter", "work_product" |
| content | text | Full generated content (markdown) |
| jd_text | text | The JD it was tailored for |
| coverage_score | integer | Keyword coverage % (resumes only) |
| gaps | text | Flagged gaps from generation |
| created_at | timestamptz | Default now() |

### job_interviews (new)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| company | text | Company name |
| role | text | Role title |
| round | integer | Interview round number |
| date | date | Interview date |
| interviewer | text | nullable |
| format | text | "behavioral", "product_sense", "execution", "technical" |
| questions | jsonb | Array of {question, score, type} |
| overall | text | "strong", "adequate", "weak" |
| signals | text | What they probed hardest |
| key_improvement | text | Specific thing to do differently |
| next_round_prediction | text | nullable |
| prep_package | text | Generated prep content (markdown) |
| created_at | timestamptz | Default now() |

## API Routes

All new routes follow existing patterns: GET is public (behind frontend auth gate), POST/PATCH/DELETE require Bearer token.

### /api/job-search/companies

- `GET` — list all, supports `?status=active&industry=AI/ML&sort=rank`
- `POST` — create one or bulk insert (array body)
- `PATCH /:id` — update fields
- `DELETE /:id` — remove

### /api/job-search/connections

- `GET` — list all, supports `?company_id=xxx&needs_followup=true`
- `POST` — create
- `PATCH /:id` — update
- `DELETE /:id` — remove

### /api/job-search/materials

- `GET` — list all, supports `?company=xxx&type=resume`
- `POST` — create (Job Search OS skills call this after generating)
- `DELETE /:id` — remove

### /api/job-search/interviews

- `GET` — list all, supports `?company=xxx&upcoming=true`
- `POST` — create
- `PATCH /:id` — update (e.g., add debrief scores)
- `DELETE /:id` — remove

### /api/job-search/intel/[slug]

- `GET` — returns parsed company intel from `insider-data/company-intel/[slug].md`
- Read-only, no database table. Parses markdown at request time.

## Frontend Sections

### /job-search (Overview)

Quick stats bar: total target companies, active connections, materials generated, upcoming interviews. Links to each section. Acts as a landing page after auth.

### /job-search/companies

- Sortable, filterable table view
- Columns: rank, name, stage, industry, hiring status, connections count, last updated
- Filters: hiring status, industry, stage
- Sort: rank (default), name, last updated
- Click row → inline expand or detail panel showing: full notes, recent news, linked connections, linked materials, link to intel page
- Inline edit for rank, hiring status, notes

### /job-search/network

- Grouped by company (collapsible sections)
- Each contact card: name, LinkedIn status, referral status badge, last contact date, next action
- Quick filters: "needs follow-up" (last_contact > 7 days ago + has next_action), "has referral", "all"
- Inline edit for referral status, next action, meeting notes
- Add new contact form

### /job-search/materials

- Card grid grouped by company
- Each card: type badge (resume/cover letter/work product), role, creation date, coverage score (resumes)
- Click card → full content view with markdown rendering
- Copy to clipboard button
- Filter by type, company

### /job-search/interviews

- Two tabs: "Upcoming" and "History"
- Upcoming: date, company, role, round, format. Click for prep package (markdown rendered)
- History: date, company, role, overall score badge. Click for full debrief (questions, scores, signals, improvements)
- Story bank section: renders stories from experience library for quick reference

### /job-search/intel/[slug]

- Rich markdown rendering of company intel profile
- Sections: overview, interview process, culture, key people, recent news
- "Last updated" date with staleness warning if > 6 months
- Link back to company in target list

## Layout

- Shared layout at `/job-search/layout.tsx` with:
  - Horizontal tab bar navigation across the 5 sections
  - Consistent max-width container matching portfolio site (max-w-5xl)
  - Same styling patterns as existing dashboard (white/zinc cards, rounded-2xl, border styling)
- No sidebar — matches the portfolio's clean, content-focused aesthetic
- Mobile responsive: tab bar becomes scrollable on small screens

## Component Patterns

- Follow existing patterns: server components for data fetching, client components for interactivity
- Card styling: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm`
- Status badges: reuse `statusStyles` pattern from PipelineBacklog
- Inline editing: optimistic UI updates with API calls (same as TaskList toggle pattern)
- Use existing dependencies only: framer-motion for animations, lucide-react for icons, recharts if charts needed

## Job Search OS Integration

The Job Search OS skills in Claude Code write to the hub via API POST calls. Each skill's output maps to a table:

| Skill | Writes To |
|-------|-----------|
| `/company-research` | job_target_companies |
| `/connection-request`, `/referral-request` | job_connections |
| `/resume-tailor` | job_materials (type: resume) |
| `/cover-letter` | job_materials (type: cover_letter) |
| `/work-product` | job_materials (type: work_product) |
| `/interview-prep` | job_interviews (prep_package) |
| `/interview-debrief` | job_interviews (scores, questions) |
| `/app-tracker` | job_pipeline_entries (existing) |

This means running a skill in the terminal automatically populates the hub frontend.

## Out of Scope (v2)

- Pipeline kanban board (existing dashboard covers this)
- Weekly retro / analytics charts
- Real-time sync (webhook from Supabase)
- Full auth (Supabase Auth)
- Mobile app / PWA
