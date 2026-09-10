# The Training Block

**Date:** 2026-08-27
**Status:** Design approved, pending implementation plan

## Why

The existing job search machinery reacts. `weekly-plan-generator.ts` builds a
weekday plan out of pipeline state — apply to what posted, follow up on what
went stale, prep for what's scheduled. Every task it can emit is downstream of
something a company did. When the pipeline is quiet, the plan is empty, and a
quiet pipeline is exactly when the search needs work done.

`TaskCategory` has carried `content` and `linkedin_post` slots since the
redesign. Nothing has ever filled them. There is no `write`, no `read`, no
`build` at all.

Getting hired is not a controllable outcome. Between Jon and an offer sit an
ATS, a recruiter's inbox, a feed algorithm, every other candidate, and a hiring
manager's Tuesday. So this system measures the inputs instead: five verbs, a
prescribed weekly volume, and a scoreboard that grades adherence rather than
results.

It runs **alongside** the existing pipeline system, not inside it. Separate
tables, separate page, separate push. That was a deliberate call — the cost is
a second surface to check, paid for with a morning email so the page is never
something Jon has to remember.

## The program

### Verbs and reps

A rep is one bounded unit of a verb with a fixed size, so weekly work can be
prescribed as volume the way a training block is.

| Verb | Sub-types | Rep size |
|---|---|---|
| `connect` | warm DM batch, cold DM batch, call/coffee, event | 30–45 min |
| `build` | ship a slice, instrument it, user session | 90 min |
| `write` | draft, revise, case study | 45 min |
| `read` | deep read + one note, podcast/talk, teardown | 30–45 min |
| `post` | build-in-public, POV/insight, comment pass | 30 min |

### The 8-week cycle

Periodized: four loaded weeks, a deload, two more loaded, then a peak week that
is high-intensity and low-volume.

| Wk | Phase | connect | build | write | read | post | Reps | ~Hrs |
|---|---|---|---|---|---|---|---|---|
| 1 | prepare | 4 | 3 | 3 | 6 | 2 | 18 | 14 |
| 2 | prepare | 4 | 4 | 3 | 5 | 2 | 18 | 15 |
| 3 | build | 3 | 8 | 2 | 2 | 3 | 18 | 18 |
| 4 | build | 3 | 8 | 2 | 2 | 3 | 18 | 18 |
| 5 | deload | 3 | 4 | 2 | 1 | 1 | 11 | 10 |
| 6 | publish | 4 | 3 | 6 | 2 | 3 | 18 | 16 |
| 7 | publish | 5 | 2 | 6 | 1 | 4 | 18 | 16 |
| 8 | peak | 9 | 1 | 2 | 1 | 4 | 17 | 14 |
| | **total** | **35** | **33** | **26** | **20** | **22** | **136** | **121** |

Cycle 1 runs **2026-08-31 → 2026-10-23** and is anchored to **Macro Chef**: an
AI meal-planning app already in testing with the Everfit Motion gym community.
The verbs feed one project so they compound instead of competing — research the
problem, ship to testers, measure, write the case study, publish, work the
replies.

### Standing rules

1. **Weekends are rest.** No reps, no make-up work. Volume is sized for five
   days deliberately.
2. **Connect never drops below 3/week**, including through the build block.
   Replies land 1–3 days out, so a silent fortnight costs a month to restart.
3. **Week 5 ships, it does not start.** Half the build volume, none of the new
   scope.
4. **A missed rep is missed.** It does not roll forward or stack onto tomorrow.
   Un-repayable debt is how a training block turns into guilt.

### Day shape

Within a week, reps distribute so build days cluster Monday–Thursday and Friday
carries distribution. Week 3 as the worked example:

| Day | Reps | Hrs |
|---|---|---|
| Mon | build ×2, connect ×1 | 3.5 |
| Tue | build ×2, post ×1 | 3.5 |
| Wed | build ×2, connect ×1 | 3.5 |
| Thu | build ×2, read ×1 | 3.5 |
| Fri | write ×2, post ×2, connect ×1, read ×1 | 3.5 |

Friday ends on distribution so nothing shipped sits unseen over a weekend, and
outreach lands while replies still have a workday to arrive in.

## Architecture

### The split

The **skeleton is deterministic**, the **content is filled**. This is the load-
bearing decision:

- `training-program.ts` is a pure function from `(cycleWeek, dayIndex)` to rep
  slots, with the phase table above as data. It is fully testable and it means
  week 6 Thursday is knowable on day one — which is the entire promise of a
  training plan.
- Rep *content* ("DM these three people", "read this") is filled in per-day and
  adapts to current state.

### Modules

**`src/lib/job-search/training-program.ts`** — pure, no I/O.

```ts
export const PHASES: PhaseSpec[]          // the 8-week table
export const REP_SIZES: Record<Verb, number>
export function weekSpec(cycleWeek: number): WeekSpec
export function dayReps(cycleWeek: number, dayIndex: 0|1|2|3|4): RepSlot[]
export function cycleDates(startDate: string): { week: number; start: string }[]
```

**`src/lib/job-search/training-adherence.ts`** — pure scoring.

```ts
export function weekAdherence(reps: Rep[]): AdherenceReport
export function outputTotals(reps: Rep[]): OutputCounts
export function streakDays(reps: Rep[], today: string): number
export function connectFloorBreach(reps: Rep[], today: string): boolean
```

### Data

Three tables in the shared red-ox-mobile Supabase, `job_` prefixed per project
convention. No new Supabase project.

**`job_training_cycles`**
`id`, `cycle_no`, `project`, `start_date`, `end_date`,
`phase_config` (jsonb — a frozen snapshot, so amending the program never
rewrites finished history), `created_at`

**`job_training_reps`**
`id`, `cycle_id`, `date`, `cycle_week`, `verb`, `subtype`,
`planned_minutes`, `prescription` (text — what to do),
`status` (`planned` | `done` | `skipped`),
`evidence` (jsonb — what it produced),
`completed_at`, `user_edited` (bool, default false), `created_at`

**`job_training_outputs`**
`id`, `cycle_id`, `week_start`, `metric`, `value`

`user_edited` is override protection: any fill or regeneration writes only into
rows where it is `false`. A rep Jon rewrote, swapped, or deleted stays as he
left it.

### Surfaces

Three, each with exactly one job.

| Surface | Job |
|---|---|
| Morning email, 07:00 | The prompt. Today's reps with prescriptions. |
| `/dashboard/job-search/training` | Review and edit. Add, swap, delete, re-prescribe. |
| This conversation | Logging. Jon reports; the agent writes. |

**Logging is conversational.** Repo monitoring and word-count detection were
considered and rejected as too granular. Jon reports completion in chat; the
agent writes it through `POST /api/job-search/training/reps/[id]` using the
existing `JOB_SEARCH_API_KEY` bearer pattern from `/api/job-search/tasks`.

When logging, record **what the rep produced**, not merely that it happened.
The `evidence` field accumulates the raw material for the week-6 case study;
reconstructing that in October from a column of checkmarks is not possible.

### Scoreboard

Two layers, deliberately separated:

- **Adherence** — reps done over reps planned, per verb and per week, plus a
  weekday streak. Entirely within Jon's control; the only fair grade.
- **Output** — DMs sent, posts published, slices shipped, words written.
  Counts what the reps produced, not what anyone did in response.

Replies, conversations and interviews are downstream of both and stay on the
existing pipeline dashboard. A quiet week is not a failed week, and the
training page must never imply otherwise.

### Nudges

- **Connect-floor alarm.** Two weekdays with no `connect` rep escalates it to
  the top of the morning email as the only item above the fold.
- **Autoregulation prompt.** Two consecutive weeks under 70% adherence adds a
  line to the Friday email asking whether to deload the coming week. It is a
  question, never an automatic rewrite — the plan does not change itself.

## Testing

`training-program.ts` and `training-adherence.ts` are pure and get unit tests
beside the existing eleven suites in `src/lib/job-search/`. Minimum coverage:

- Each of the 8 weeks emits exactly its prescribed per-verb counts.
- The connect floor holds at ≥3 in weeks 3, 4 and 5.
- Weekend dates never receive a rep.
- Day totals sum to the week total for every week.
- Adherence with zero planned reps returns `unknown`, not 0% — matching the
  "absent evidence is not evidence of failure" rule already enforced in
  `funnel.ts`, `strategy.ts` and `channel-attribution.ts`.
- `user_edited` rows survive a regeneration pass untouched.

## Out of scope

- Any coupling to `job_pipeline_entries`, `job_daily_tasks`, or the reactive
  generator. The systems stay separate.
- Downstream conversion tracking (reply → conversation → interview). That lives
  on the pipeline dashboard and belongs to cycle 2 at the earliest.
- Automatic detection of build or write activity.
- Cycle 2 planning. This spec covers one cycle and the machinery to repeat it.

## Open question

Which repository Macro Chef lives in is still unknown — it is not at the top
level of `~/Desktop/Claude Projects`. It does not block implementation, since
build verification is manual, but the prescriptions in the build phase will
read better once the project's actual backlog is visible.
