# Job Search OS Foundation — Deferred Follow-Ups

**Date:** 2026-08-06
**Branch:** `job-search-os` (23 commits, merge-base `d11e4d3`)
**Status:** final whole-branch review passed — APPROVE WITH FOLLOW-UPS.

Everything below was found during implementation, triaged as safe to merge, and
deliberately not fixed. Recorded here because the review ledger is gitignored
scratch and these would otherwise be lost.

Ordered by what actually matters.

## 1. The advisory reasons are stored but never rendered

**The one to do first.** The spec promises that `cadence_assumed`,
`cadence_unstated`, and `location_unknown` "surface on the role card for a human
check". Nothing renders them.

The location gate was deliberately loosened mid-build to stop rejecting roles on
missing data — it was rejecting Anthropic, OpenAI, Google, Apple, Figma and
Notion for having no location field. The safety argument for that loosening was
explicitly *"pass it, but flag it so Jon checks the JD himself."*

Measured after the backfill:

| Reason | Rows |
|---|---|
| `cadence_unstated` | 89 |
| `location_unknown` | 52 |
| `cadence_assumed` | 37 |
| clean (no advisory) | 43 |

So **178 of 221 passing rows — 81% — carry an invisible advisory**, and look
identical to the 43 that were genuinely verified. The data is correct and
recoverable, and the failure direction is safe (a role shown that needs a
second look, rather than one silently hidden). But until a badge ships, the
221 should not be treated as vetted.

Fix: render the reason on the role card and in the daily email's job cards.

## 2. `haystack()` still joins two fields — the branch's recurring defect

Three separate bugs on this branch were the same shape: **a rule stated without
its boundary.** Two were fields concatenated with a space so a pattern matched
across the seam; one was a filter applied without specifying which statuses it
covered. Two of the three were fixed. This is the third.

`gates.ts` `haystack()` joins `location` and `jd_text` with a space before
cadence parsing. Confirmed by probe against the real module:

```
location: "Oakland In Office"  +  jd_text: "6 days a week of onboarding sessions"
  -> REJECT, cadence = 6
```

`ONSITE_MARKER` matches at the end of `location`, `DIGIT days` matches at the
start of `jd_text`, and a fabricated 6-day cadence rejects the role. It is
narrow — it needs the location field to end in an onsite marker with no
punctuation — but it fails in the expensive direction (a false rejection nobody
sees).

Fix: run the cadence patterns per field rather than over the join, the same way
`identityFields()` already fixed the ethics gate.

## 3. Aggregate queries count gate-failed rows

Three places aggregate over ungated rows:

- `rollup-metrics/route.ts:40`
- `send-weekly-review/route.ts:63`
- `send-daily-email/route.ts:221`

Lower stakes than the strategy page (which *was* fixed, correcting
`qualifiedUntouched` from 20 to 7) because these produce counts rather than
prescriptions. The same widened clause fixes them:

```ts
.or("gate_result.is.null,gate_result->>pass.eq.true,status.neq.saved")
```

**One caution:** `rollup-metrics` writes weekly history. Changing what it counts
mid-stream creates a discontinuity in the metrics series. Decide whether to
backfill the affected weeks or accept a documented step change.

## 4. `"slots"` is too generic a flag term

`\bslots\b` correctly matches the literal phrase "time slots" — which appears in
ordinary scheduling and booking job descriptions. Confirmed live on an Airbnb
"Product Manager, Tickets" posting containing *"capacity, time slots, holds, and
real-time availability"*, which now carries a `gambling` badge.

Not a boundary-matching bug — the word-boundary fix works. The term itself is
wrong for JD prose. Disclosure-only, so no rejection or score impact.

Fix: drop bare `"slots"`, or require a qualifier (`"slots game"`,
`"slot machine"`).

## 5. Smaller items

| Item | Note |
|---|---|
| `run-log-db.ts` `close()` ignores its Supabase error | A failed close leaves `status='running'` forever. Degrades safely — the row never becomes a `last_ok_at`, so the job reads as stalled. A `console.warn` would cost nothing. |
| `describeFailure` records `HTTP {status}` only | Not the response body's message. Richer detail would make the health block more actionable. |
| Gate reads full `p.description`, stored `jd_text` truncated to 20k | An auditor reading a rejection may not find the matched term in the stored row. |
| `topInserted` includes gated-out rows | Presented as successful inserts in the ingest response. Cosmetic. |
| `onsiteDays("2-3 days a week")` → 3 | Takes the higher number. Conservative and defensible; just undocumented. |
| Reference words outside the blocklist abutting cadence text | `"Door 4 days a week onsite"` → 4. Needs a location ending in a bare number immediately abutting cadence prose, which real JD text does not produce. |
| `companies/page.tsx` keeps one row per company | Pre-existing `Map` dedup. A visible gate-failed `job_url` may not render there. |
| `normalizeCompany` import sits mid-file in `gates.ts` | Plan-specified verbatim. Lint clean, zero functional effect. |
| Staleness boundary uses `>` | A job exactly at its threshold reads healthy. Correct for an alerting window; simply untested. |
| No test pins the per-job threshold mechanism | The 48h `apply-batch` case was removed with that phantom job. Re-add when a job with a non-default threshold exists. |

## Not follow-ups — settled during the build

- **Ethics gate rejecting Jon's own domains.** Verified by probe against eleven
  real companies (Zynga, Jam City, Playtika, SciPlay, DoubleDown, Treasure DAO,
  Mythical, Sky Mavis, Immutable, Scopely, Machine Zone) plus a 346-row dry run:
  **zero ethics rejections**. Gaming and web3 companies pass carrying a flag, as
  designed.
- **Gate-failed roles leaking to the user.** Four surfacing paths were found and
  closed; every `job_pipeline_entries` query in `src/` was swept.
- **Applied and screening roles vanishing from the tracker.** Caught before
  merge; filtering now applies only to `status = 'saved'`.
