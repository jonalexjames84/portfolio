# Job Search Dashboard — North Star Redesign

**Date:** 2026-08-05
**Status:** Approved, ready for implementation

## Problem

The dashboard has nine blocks of equal visual weight. Nothing is ranked, so nothing surfaces. The data underneath makes this concrete:

- **270 roles** sit at `saved`
- **73 open tasks** are outstanding
- **9 finished applications** are written, verified, and unsent
- **26 connections exist and none have been contacted** — the referral channel, which the OS itself calls 5x more effective than a cold application, is at exactly zero

The clutter is not only layout. The action list has no notion of impact, so the two highest-leverage moves available are invisible among 73 undifferentiated rows.

There is one north star — **job offers** — and the dashboard never says so.

## Design

Three bands own the first screen. Everything currently on the page moves below a `Details` divider, unchanged.

### Band 1 — North star

`0 OFFERS`, set large. One line of context beneath it: applications out, interviews in flight, and how long the search has been running.

The zero is the point. The subtitle exists so the zero reads as *early* rather than as *failing* — the first application went out 2026-08-04.

### Band 2 — The funnel

Four stage counts — Applications → Screens → Interviews → Offers — with conversion between each.

**Conversion rates are suppressed until a stage has enough sample.** Below threshold they render greyed with an `n=` note instead of a percentage. This reuses the `MIN_SAMPLE` convention already established in `channel-attribution.ts`, so the dashboard never presents "8% response rate" as a finding when it rests on two data points.

Chosen over a leading-indicator set (response rate, referral coverage) because the funnel maps directly onto the north star: every stage is a thing that must happen before an offer exists.

### Band 3 — Do this next

A ranked list of at most **five** rows. Each row carries what to do, how many, and why it ranks where it does. Ranking is by expected movement toward an offer:

| Driver | Why it ranks | Current |
|---|---|---|
| Finished work not sent | Written and verified; minutes of effort each | 9 applications |
| Referral coverage gap | The 5x channel sitting at zero | 26 contacts, 0 reached |
| Follow-ups due | Submitted ≥7 days with no reply | Webflow, Artisan |
| Stale active roles | A live screen or interview gone quiet | — |
| Interview prep | Highest stage reached; protect it | 1 interview |

**The 270 saved roles and 73 open tasks are deliberately excluded from Band 3.** They are the reason nothing surfaces today. They remain reachable below the divider.

## Architecture

Two pure, tested modules, following the shape of `application-ledger.ts`:

- **`src/lib/job-search/funnel.ts`** — stage counts and conversion, with sample-size suppression. Input: pipeline entries and ledger rows. Output: a `FunnelReport`.
- **`src/lib/job-search/next-actions.ts`** — the ranking. Input: counts of each driver. Output: a ranked `NextAction[]`, capped at five.

Ranking is a pure function so "what matters most" is testable and cannot rot into layout logic.

Two components:

- **`NorthStar.tsx`** — Bands 1 and 2. They share the same data and are read together.
- **`NextActions.tsx`** — Band 3.

`src/app/dashboard/job-search/page.tsx` composes the three bands, then a `Details` divider, then the existing blocks in their current order.

## Testing

Unit tests on both lib modules:

- Conversion suppressed below sample threshold; shown above it
- Division by zero at an empty stage does not produce `NaN`
- Ranking places unsent applications above referral gap above follow-ups
- A driver with a zero count is omitted entirely rather than rendered as an empty row
- The five-row cap holds when more drivers qualify

No snapshot tests on the components; the logic under test lives in the libs.

## Out of scope

- Changing, deleting, or reordering any existing block
- Triaging the 270 saved roles or 73 open tasks — a data problem, tracked separately
- Any change to the ledger, guard, or ingestion
