# Job Search Strategy Page — Design

**Date:** 2026-08-05
**Route:** `/dashboard/job-search/strategy`

## Problem

The dashboard measures `applications_sent` against `TARGETS.applications_sent`.
When 12 applications have produced 0 interviews, that framing has exactly one
answer: send more. It is a volume machine, and volume is not the strategy the
Job Search OS describes.

`job-search-os/CLAUDE.md` states five principles the dashboard cannot see:

- Precision over volume. Every application tailored. No spray-and-pray.
- Referrals before cold applications. A referral is 5x. Build the path first.
- Work products lead hiring-manager outreach.
- The system compounds — each debrief sharpens the next interview.
- Real experience only; flag gaps honestly.

Measured against live data on 2026-08-05, every one of those is being violated:

| Principle | Reality |
|---|---|
| Referrals first | 26 connections, **0 ever contacted**, 0 referral-channel applications |
| Precision | applied at avg fit **77**, while **34 saved roles score ≥80** untouched |
| Work product | 37 materials, **0 work products** |
| Compounds | **0 interviews logged**, so 0 debriefs |
| — | 24 companies have a live application; 8 have a contact on file; none approached |
| — | **13 applications sit `prepared` and unsent** |

## Goal

A page that answers *"is the machine converting, and where is the leak?"* and
names the single highest-leverage move — including what to **stop** doing.

The existing dashboard stays as the execution surface. This is the page you
open first; it links down into that one.

## Non-goals

- Replacing or modifying the dashboard, `ApplicationTable`, or the hub pages.
- A task system. `weekly-plan-generator.ts` and `next-actions.ts` already exist.
  This page ranks *levers*, not tasks.
- Editing data. The page is read-only; every move is a link to where you act.

## Architecture

```
src/app/dashboard/job-search/strategy/page.tsx    server component, loadStrategy()
src/lib/job-search/strategy.ts                    pure functions — the brain
src/lib/job-search/strategy.test.ts               tests
src/components/job-search/ThesisBand.tsx
src/components/job-search/LeakFunnel.tsx
src/components/job-search/LeverCard.tsx
src/components/job-search/StopDoing.tsx
```

Follows the established repo pattern (`funnel.ts`, `next-actions.ts`,
`signals.ts`): all aggregation is a pure function over plain inputs, testable
without Supabase. The page fetches and renders, nothing more.

`HubNav` gains a "Strategy" tab.

## The honesty rule

**Zero data must not render as failure.** `funnel.ts` already establishes this
with `MIN_STAGE_SAMPLE = 20`, and `channel-attribution.ts` with `MIN_SAMPLE`.
This page inherits it.

With 12 applications and 0 interviews, a conversion rate of "0%" is
indistinguishable from failure — but 12 is below the sample where a rate means
anything. So a lever with insufficient evidence returns state `unknown` and
reads *"too early to read — 12 of ~20 applications needed"*, never a red 0%.

The two levers that *do* shout need no statistics. "0 of 26 contacts worked"
and "34 better roles untouched" are facts, not rates.

A page that shouts everywhere is a page you learn to ignore.

## Components

### 1. ThesisBand

The career-plan thesis in one line — Senior PM · seed–Series B AI/ML and dev
tools · Bay Area/remote — and how *submitted* applications measure against it:
on-thesis %, referral %, avg fit.

On-thesis is **computed, not asserted**: `industry` and `stage` columns already
exist on `job_pipeline_entries`. A typed `THESIS` constant in `strategy.ts`
declares which values count, with a comment naming
`job-search-os/context-library/career-plan.md` as its source of truth.

### 2. LeakFunnel

Every stage company-scoped, each naming the stage it narrows from:

```
Targets tracked → Qualified → Applied → Active → Interview
                                └── Referral path built   (branch)
```

**Referral path is a branch, not a gate.** The first build put it in sequence
*before* Applied, reasoning that the Job OS says build it first. Rendered
against live data that produced a chain reading `0 → 24 → 2`, which looks like
a bug — and it *is* wrong: two roles reached Active with no warm intro behind
either, so applications demonstrably do not pass through it. It measures
coverage of Applied. Stages therefore carry an explicit `parentKey` rather than
assuming the row above.

**A widening stage is the finding, not an error.** Applied (24) exceeds
Qualified (13). Rather than smooth that over, `overflow` records the excess and
renders as *"+11 beyond what qualifies"* — applying past your own thesis is
precisely the shotgun signature this page exists to name. The percentage is
suppressed when overflow is set; "185%" reads as a broken chart.

`findLeak(stages)` returns the worst-converting stage, skipping both withheld
rates and overflowing stages. On current data it lands on referral path (0 of 24).

**One definition of "worth acting on."** The funnel and the precision lever
initially counted different things (on-thesis + ≥80 vs. ≥80 alone), putting 13
and 34 on one screen as if they measured the same idea. Both now use
`qualifiedUntouched` / `qualifiedCompanies` — on-thesis *and* scoring — because
a page arguing for thesis discipline cannot then point at the highest-scoring
roles regardless of thesis.

**Gaming counts as on-thesis.** The career plan calls games "deep but not the
target"; Jon's later standing instruction is that game studios are in scope. 62
gaming rows are in the pipeline because of that instruction, and grading them
off-thesis would contradict it.

Industry matching is **token-based, not substring** — the stored values are
messy (`Growth / Dev Tools`, `Healthcare AI`) and a bare `includes("ai")` also
matches `International` and `Retail`.

### 3. LeverCard × 5

```ts
export type LeverKey =
  | "referral_path" | "precision" | "depth" | "conversion" | "compounding";
export type LeverState = "critical" | "weak" | "working" | "unknown";

export interface Lever {
  key: LeverKey;
  principle: string;      // the Job OS line, quoted
  headline: string;       // "0 of 8 warm contacts worked"
  state: LeverState;
  finding: string;        // what the data says, one sentence
  move: string;           // the single next move — imperative, countable
  href: string | null;
  score: number | null;   // 0-100 bar; null when unmeasurable
}
```

| Lever | Measured as |
|---|---|
| `referral_path` | contacts worked ÷ contacts at companies with a live application |
| `precision` | avg fit applied vs. count of untouched *qualified* roles |
| `depth` | work products ÷ companies with a live application |
| `conversion` | funnel rates, reusing `buildFunnel` |
| `compounding` | interviews logged → debriefs → material reuse |

Ordered by state severity, then by leverage weight. Rendered with the existing
`Panel` visual language.

### 4. StopDoing

The counterweight, and the part that most directly answers the brief. Derived
with thresholds:

- *"Stop adding to the 255 saved roles — 20 you haven't acted on are already on-thesis and score ≥80."*
- *"Don't claim a new application while 13 sit prepared and unsent."*

## Data flow

One `loadStrategy()` server function; parallel Supabase queries mirroring the
existing dashboard's `loadData()`. Sources: `job_pipeline_entries`,
`job_applications` (the ledger — the record that an application happened),
`job_connections`, `job_target_companies`, `job_materials`, `job_interviews`.

Contact→company matching goes through `buildContactIndex` from `referrals.ts`,
which normalizes company spelling via `normalizeCompany`.

## Testing

`strategy.test.ts`:

- `findLeak` picks the correct stage, and skips stages below sample threshold
- lever scoring at boundaries (0 contacts, all contacted, no live companies)
- **zero-data produces `unknown`, not `critical`** — the load-bearing case
- move ranking order under mixed states
- `THESIS` matching against real `industry`/`stage` values, including nulls

## Reuse

`buildFunnel` · `normalizeCompany` · `Panel` / `Divider` visual language ·
`HubNav`.

## Rendering note

Each lever renders **exactly once**. The first build showed the top three under
"Do this first" and then all five under "Every lever", restating three cards
verbatim — the same duplication the dashboard page's own header comment warns
about. The trailing section now shows only the levers not already surfaced as
moves, under "Also tracked".
