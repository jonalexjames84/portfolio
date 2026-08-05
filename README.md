# Portfolio + Job Search System

Jon Martin's personal site and the automated job search system that runs behind it. Built end to end with Claude Code — Next.js 16, React 19, TypeScript, Tailwind 4, Supabase, deployed on Vercel.

Live: [portfolio.jonnymartin.blog](https://portfolio.jonnymartin.blog)

## Why this repo exists

Three goals, in priority order:

1. **Show the work.** A public, browsable record of what Jon has built, shipped, and learned — enough that a recruiter or hiring manager can read through it and get a real picture without a call.
2. **Power the application workflow.** The same repo is the machine that finds roles, scores them, verifies they're still open, tracks the pipeline, and pushes a daily brief. Applications get prepped here; Jon submits them himself.
3. **Land the job.** The highest-paying role he can get and stay at for at least two years. Everything above is in service of that. When something in here doesn't move that needle, it's dead weight.

### Platform vs. channels

**This repo is the tool.** It's where the work product gets made and where the pipeline lives — content, case studies, resumes, letters, scoring, verification, tracking.

**Reaching hiring people happens elsewhere.** The site, LinkedIn and social, and the job platforms are the distribution layer. The repo's job is to make those channels cheap to feed and consistent in what they say.

| Channel | What the repo feeds it |
|---|---|
| **The website** | `/work`, `/projects`, `/blog`, `/vibe-stack`, `/posthog` — the destination every other channel links to. Also the one channel Jon fully controls, and instrumented with PostHog so the traffic is measurable |
| **LinkedIn / social** | `documents/linkedin-posts/`, `documents/blog-drafts/` — posts drafted here, published there, pointed back at the site |
| **Job platforms / ATS** | Ingest reads their public APIs; `.md2resume.cjs` and `.md2cover.cjs` produce the tailored PDFs that go back into them |
| **Direct outreach** | `documents/outreach-templates.md`, `job_connections`, per-company intel — referral paths before cold applications |

The repo is also a proof point for goal #1 in its own right: a PM who ships production software with AI tooling, including the automation that runs his own search.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # vitest — 83 tests
npm run build
npm run lint
```

`.env.local` is required for anything touching the job search or the analytics dashboard. See [Environment](#environment).

## Repo map

| Path | What's in it |
|---|---|
| `src/app/` | Next.js App Router — public site, gated job-search hub, API routes |
| `src/components/` | Shared UI; `job-search/` and `dashboard/` are feature-scoped |
| `src/lib/` | Content sources (`experience.ts`, `projects.ts`, `posts.ts`) + `job-search/` logic |
| `src/lib/job-search/` | ATS fetching, fit scoring, listing liveness, signals, metrics, weekly planner — all unit-tested, all pure |
| `src/middleware.ts` | Auth gate for job-search routes + per-IP rate limiting |
| `supabase/migrations/` | Schema for the `job_*` tables (shared `red-ox-mobile` project) |
| `documents/` | Resumes, cover letters, application queues, job scan results, blog drafts, conference notes. **Untracked** — local only, see [Privacy](#privacy) |
| `docs/superpowers/` | Design specs and implementation plans for past features — the "why" behind the code |
| `job-search-os/` | Vendored third-party Claude Code system (18 skills, 250 company intel files) by Aakash Gupta |
| `.claude/skills/` | Project-local Claude Code skills |
| `.md2resume.cjs`, `.md2cover.cjs` | Markdown → one-page PDF generators |
| `scripts/screenshots.mjs` | Playwright screenshot capture across local project repos |

## The public site

The destination channel. All of these are open to anyone:

| Route | Purpose |
|---|---|
| `/` | Home — positioning, featured work |
| `/about` | Career narrative, testimonials |
| `/experience` | Full career history from `src/lib/experience.ts` |
| `/work`, `/work/[slug]` | Case studies |
| `/projects`, `/projects/[slug]` | Project detail pages |
| `/blog`, `/blog/[slug]` | Posts from `src/lib/posts.ts`, with generated OG images |
| `/resume` | Resume page; `/api/resume` renders a PDF via `@react-pdf/renderer` |
| `/vibe-stack` | The AI-native build system — three workflows for consulting, prototyping, buy-in |
| `/workflow` | Interactive workflow diagram (React Three Fiber) |
| `/posthog` | Work-product artifact: a product analysis of PostHog onboarding, written as an application asset |
| `/dashboard` | Public PostHog analytics for the site itself |
| `/contact` | Calendly embed + Formspree form |

Content lives in TypeScript modules, not a CMS. To add a project or post, edit `src/lib/projects.ts` or `src/lib/posts.ts`.

`/posthog` is the template worth copying: a real analysis of a specific company's product, published at a linkable URL, used as the opening move with that company. Scroll depth is tracked, so you can tell whether anyone actually read it.

## The job search system (gated)

Everything under `/job-search/*`, `/dashboard/job-search`, and `/api/job-search/*` is private.

### Auth

Two independent paths, both enforced in `src/middleware.ts`:

- **Browser** — `GET /api/auth/login?email=…&token=…` sets an httpOnly `job_search_auth` cookie for 30 days. Wrong email or token → 401. No cookie on a page route → redirect to `/`.
- **Machine** — any request carrying an `Authorization` header bypasses the cookie check in middleware and is validated by `checkAuth()` in `src/lib/email-templates.ts`, which accepts `Bearer $CRON_SECRET` (what Vercel Cron sends) or `Bearer $JOB_SEARCH_API_KEY` (for manual/agent calls).

Rate limits: 30 req/min on `/api/dashboard/posthog`, 10 req/min on `/api/resume`, keyed by IP in an in-memory map.

### Data model

Supabase, `job_`-prefixed tables in the shared `red-ox-mobile` project (never create a new Supabase project for this):

- `job_pipeline_entries` — every role. Status flows `saved → applied → screen → interview → offer/rejected`. Carries `fit_score` (manual), `fit_score_auto` + `score_breakdown` (computed), `source`, `external_id`, `posted_at`, `jd_text`, `channel`. **`job_url` has a unique index** — it's the dedupe key across ingestion runs.
- `job_target_companies` — ranked targets with `ats_type` + `ats_token`, which is what makes a company ingestable.
- `job_daily_tasks` — the weekly plan, with `impact`, `probability_lift`, `carried_over`.
- `job_connections` — networking contacts, `last_contact` / `replied_at` for response rate.
- `job_weekly_metrics` — rolled-up KPIs per week.

### UI

- `/job-search` — hub: new jobs, week view, metrics, signals
- `/job-search/companies` — target companies with expandable cards
- `/job-search/network` — connections and outreach stages
- `/job-search/interviews` — scheduled interviews
- `/job-search/materials` — resumes and letters
- `/job-search/intel/[slug]` — per-company research
- `/dashboard/job-search` — funnel health, scorecard, sparklines

## Automations

Seven Vercel Cron jobs, defined in `vercel.json`. **Schedules are UTC**; PT equivalents below assume PDT (UTC−7).

| Time (UTC) | PT | Endpoint | What it does |
|---|---|---|---|
| `05:00` daily | ~10pm prev | `/api/job-search/ingest-jobs` | Pulls open roles from every target company's public ATS board |
| `05:30` daily | ~10:30pm prev | `/api/job-search/recheck-listings` | Re-verifies saved postings, retires dead reqs |
| `07:00` daily | ~midnight | `/api/job-search/score-new-jobs` | Backfills fit scores on unscored rows |
| `07:00` daily | ~midnight | `/api/job-search/rollup-metrics` | Computes the week's KPIs |
| `06:00` Mondays | ~11pm Sun | `/api/job-search/generate-weekly-plan` | Builds next week's task list |
| `16:00` Mon–Fri | ~9am | `/api/job-search/send-daily-email` | Daily brief via Resend |
| `16:00` Fridays | ~9am | `/api/job-search/send-weekly-review` | Weekly recap via Resend |

The nightly chain is deliberate: ingest → verify → score → roll up, all before the 9am brief lands.

### Ingest (`ingest-jobs`)

Reads `job_target_companies` where `ats_type` and `ats_token` are both set, then fetches from **Greenhouse, Ashby, or Lever** public APIs (`src/lib/job-search/ats.ts`). Postings are filtered by title relevance and US/remote location, scored, and upserted on `job_url`.

Defaults, all overridable by query param:

- `sinceDays=180` — good roles sit open for months; a tight window hides the backlog, and dedupe on `job_url` is the real "is this new" test
- `limit=25` — drips the backlog in rather than dumping hundreds into one brief
- `minScore=40` — floor for insertion
- `dryRun=1` — inspect without writing

`maxDuration = 300` (Fluid Compute).

### Fit scoring (`score-new-jobs`)

`computeAutoFitScore()` in `src/lib/job-search/fit-score.ts` scores 0–100 against AI/ML + dev-tools keywords, senior-PM title terms (penalizing junior/associate), target industries, seed–Series B stage, and Bay Area / remote location. Stores a `score_breakdown` JSON so the number is auditable, not a black box. `fit_score` (manual) always overrides `fit_score_auto` in the UI.

### Listing liveness (`recheck-listings`)

The most load-bearing automation here, and it exists because of a specific failure: the 2026-08-04 queue had tailored cover letters written against four dead postings, one closed for eight months. **Every dead posting in that audit returned HTTP 200.**

`src/lib/job-search/listing-liveness.ts` asks the employer's ATS API instead of trusting the page, and returns three verdicts, not two:

- **LIVE** — API returned the req, with its canonical title (compare it — a live link can point at a *different* job than the one you queued)
- **DEAD** — positive evidence of closure; retire it
- **UNVERIFIED** — 403 / timeout / 5xx / 200-with-no-signal. **Not dead.** Leave the row alone and check by hand.

The sweep only touches `saved` rows — once you've applied, a posting coming down usually means the req is progressing. 60 rows per run, oldest-checked first, 6-way concurrency, 20s per-fetch timeout so one hung board can't stall the sweep. `dryRun=1` supported.

This same module is shared verbatim with the `verifying-job-listings` skill CLI, so the nightly sweep and a hand-run check can never disagree.

### Weekly plan (`generate-weekly-plan`)

Deletes last week's unfinished low/medium-impact tasks, carries forward the high-impact ones, then generates the coming week from: scheduled interviews, pipeline entries stale 7+ days, new jobs scoring 65+, connections overdue for outreach, and the top-20 active target companies. Logic is in `weekly-plan-generator.ts` and unit-tested.

### Emails

Both use Resend and share the HTML builders in `src/lib/email-templates.ts`. These are the push mechanism — the system comes to Jon rather than waiting to be checked.

- **Daily** (weekdays) — new jobs in the last 24h with scores, what got applied to, the week view, metrics vs. targets, and signals (`computeSignals()` flags things like a stalling funnel or an aging pipeline).
- **Weekly** (Fridays) — scorecard vs. last week, channel attribution, network growth, materials produced.

## Channel attribution

Answers the one question that changes how a week gets spent: does the next hour go into LinkedIn, into warm intros, or into applying straight through company boards?

Every pipeline row carries a `channel` — `ats_direct`, `linkedin`, `referral`, `inbound`, `cold_outreach`, or `other`. Rows the ingest cron pulled are backfilled to `ats_direct`; hand-added rows start null and report as **unattributed** rather than being dumped into `other`, so the gap is visible. Set it from the expanded card on the pipeline board.

`src/lib/job-search/channel-attribution.ts` computes per-channel applied / responded / interviewed / offers / closed and the resulting rates. It surfaces in the Friday email ("Where It's Coming From") and on `/dashboard/job-search`.

Two deliberate guards against fooling yourself:

- **`saved` rows are excluded from the denominator.** They cost no real effort, so counting them would punish whichever channel surfaces the most leads — exactly backwards.
- **Rates below `MIN_SAMPLE` (5 applications) render as a dash, not a number.** One reply on one application is 100%, and rebuilding a week around that is the trap this report exists to prevent. `bestChannel` is null until something clears the floor.

**Known undercount, stated plainly:** `status` is a row's *current* state, not its history. A role that got a screen and was then rejected reads as `rejected`, indistinguishable from one that was never answered. So `responded` is a floor and fast-moving channels look worse than they are. `closed` is reported next to it so the gap is visible instead of hidden. Fixing this properly needs a status-transition log; until then treat the numbers as directional — good enough to spot a channel producing nothing, not to split hairs between two similar ones.

## Operational workflows

### Verifying a listing before writing for it

```bash
.claude/skills/verifying-job-listings/verify.mjs <url> [url...]
cat urls.txt | .claude/skills/verifying-job-listings/verify.mjs
.claude/skills/verifying-job-listings/verify.mjs --json <url>
```

Exits 1 if anything is DEAD, so it can gate a queue build. **Run it before tailoring, not after** — a cover letter written against a dead req is pure waste, and you can't tell it's dead by looking. Full rules in `.claude/skills/verifying-job-listings/SKILL.md`.

### Generating resume and cover-letter PDFs

Markdown in, one-page Letter PDF out. Both scripts drive headless Chromium and auto-shrink type until the content fits a single page, printing `fits 1pg` / `OVERFLOWS` and the scale used.

```bash
node .md2resume.cjs "documents/resumes/resume-ai-builder.md::documents/resumes/Jon Martin - Resume (AI Builder).pdf"
node .md2cover.cjs  "documents/cover-letter-anthropic.md::documents/applications/cover-letters/anthropic.pdf"
```

Multiple `src::out` pairs per invocation. `.md2cover.cjs` stops the letter at the first `##` heading — anything below it is treated as an internal appendix (draft answers for form fields) and excluded from the PDF.

Three resume variants live in `documents/resumes/`: **AI Builder**, **Growth & Scale**, **Zero to One**. Pick the one that matches the role, then tailor.

### Application queue

`documents/applications/` holds dated queues (e.g. `2026-08-04-queue.md`), per-role cover letters, and screening answers. **Rule: prep, don't submit.** The system produces a ranked queue with materials attached; Jon submits himself. Always verify listings are still open before a queue goes out.

### Screenshots

```bash
node scripts/screenshots.mjs
```

Boots each local project's dev server on its own port, captures pages with Playwright into `public/screenshots/`. Paths point at `~/Desktop/Github Repos` — update if your checkout lives elsewhere.

## The Claude Code layer

This repo is built to be worked on by Claude Code, and a lot of the operational knowledge lives in files meant to be read by an agent.

- **`CLAUDE.md`** — who Jon is, what the goal is, positioning, tone, and the Memorang NDA rule. Read this first.
- **`.claude/skills/`** — project-local skills. Currently `verifying-job-listings`.
- **`docs/superpowers/specs/`** and **`docs/superpowers/plans/`** — the design spec and implementation plan for each significant feature (job search hub, email redesign, unified company cards, PostHog work product, Memorang integration). Start here to understand why something is shaped the way it is.
- **`job-search-os/`** — a vendored third-party system (Aakash Gupta's Job Search OS v1.0): 18 skills, 4 reviewer sub-agents, interview intel for ~250 companies, and its own `CLAUDE.md`. Self-contained; not wired into the Next.js app.

Code comments in this repo tend to explain the *decision*, not the mechanism — e.g. why `sinceDays` is 180, why the `job_url` index isn't partial, why only `saved` rows get rechecked. Preserve that when editing.

## Environment

`.env.local`, none committed:

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase client (`src/lib/supabase.ts`) — service role, server only |
| `RESEND_API_KEY` | Daily and weekly emails |
| `JOB_SEARCH_API_KEY` | Bearer token for manual/agent API calls |
| `JOB_SEARCH_AUTH_SECRET` | Cookie value + login token for the browser gate |
| `CRON_SECRET` | Bearer token Vercel Cron sends |
| `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID` | `/dashboard` analytics |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in emails and OG images |

## Testing

```bash
npm test                                              # 83 tests, 1 skipped
LIVE_ATS=1 npx vitest run src/lib/job-search/ats.live.test.ts
```

Everything in `src/lib/job-search/` is pure and unit-tested — scoring, liveness parsing, signals, sparklines, metrics rollup, plan generation. The route handlers stay thin: auth, query, call the pure function, write back.

`ats.live.test.ts` is skipped by default because it hits real boards. Run it with `LIVE_ATS=1` to confirm Greenhouse/Ashby/Lever still answer and still yield PM roles — worth doing if ingest suddenly returns zero.

## Deploying

Vercel, auto-deploy on push to `main`. `vercel.json` carries the cron definitions — **crons only run in production**. `next.config.ts` sets a strict CSP (allowlisting PostHog, Calendly, Formspree, Supabase storage), HSTS, `X-Frame-Options: DENY`, and a restrictive Permissions-Policy.

## Dates and timezones

Vercel runs functions in UTC, so `new Date().getDay()` on the server is the UTC weekday, not Jon's. That is not cosmetic — it silently broke the weekly planner and skewed the metrics rollup.

**Every weekday or day-boundary decision goes through `src/lib/job-search/dates.ts`**, which resolves dates in `America/Los_Angeles` via `Intl` (so DST is handled, not approximated with a fixed offset). Don't reintroduce `new Date().toISOString().split("T")[0]` or a raw `getDay()` — use `localDateStr`, `weekBounds`, `upcomingMonday`, or `addDays`.

## Privacy

This repo is **public**. `documents/` is untracked as of 2026-08-05 and lives only on Jon's disk (it was already excluded from deploys by `.vercelignore`).

Commits *before* that date still contain those files, so anything added earlier — cover letters, screening answers, application queues, company intel — should be treated as already published. Removing it from history would mean a force-push that rewrites every commit SHA on a public repo; that hasn't been done.

## Known rough edges

- **Rate limiting is per-instance.** The counter is an in-memory `Map`, so limits are per Fluid Compute instance, not global. Fine for the traffic this site sees; not a real defense.
- **`scripts/screenshots.mjs` has hardcoded paths** to `~/Desktop/Github Repos`.
- **Channel response rates undercount.** See [Channel attribution](#channel-attribution) — no status-transition log yet, so a role rejected after a screen reads as no response.
- **Outbound posting is still manual.** Attribution now tells you which channel converts, but drafts in `documents/linkedin-posts/` and `documents/blog-drafts/` are still copied out by hand, and nothing ties a specific post to a specific reply.
