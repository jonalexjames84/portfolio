# Memorang Portfolio Integration — Design

**Date:** 2026-08-04
**Goal:** Add Jon's Memorang role and work to the portfolio in a form that helps him land his next PM job, without violating his NDA.

## Context

Jon was Founding Technical Product Manager at Memorang (May 2026 – Jul 2026), an AI edtech
infrastructure company. He reported to the founder and owned launch readiness across four
concurrent white-label learning-app programs, plus the AI tooling that ran the program.

The portfolio currently ends its story at Pottery Friends and still describes Jon as
post-layoff and pre-employment. That is stale and undersells him: the strongest version of
his narrative is *laid off → built alone with AI → got hired to do exactly that at a company →
shipped it at scale*.

Source material lives in `~/Desktop/Claude Projects/memorang` (the PM hub repo) and the
associated Claude Code memory directory.

## Disclosure rules (NDA)

Everything is anonymized. These categories are excluded without exception:

| Excluded | Rationale |
|---|---|
| Client names (ETS, Pearson, McGraw-Hill, AAPA, JBJS, PSI, TherapyEd) | Pearson and McGraw-Hill are not publicly linked to Memorang at all |
| Contract values, revenue-share terms, SOW/signature status | Commercially sensitive |
| Coworker and executive names | Not Jon's to publish |
| Linear / Notion / Slack URLs, ticket IDs, bug counts, at-risk statuses | Internal delivery state |
| Unreleased product architecture (Learning Artifact Studio, platform layer names, KG schema) | Unannounced |
| Security findings, infrastructure weaknesses, audit results | Actively harmful to disclose |

Permitted: Jon's role and scope, frameworks he authored, systems he personally built, and
scale described generically ("a global testing organization", "four concurrent white-label
launches", "~8M annual test-takers across the programs" — a figure that describes the
addressable programs, not Memorang's revenue or user counts).

Note: ETS Capital's investment in Memorang was publicly announced in January 2026, and PSI
and TherapyEd appear as named customers on memorang.com. Even so, the decision is to
anonymize uniformly — partial naming invites inference about the unnamed ones.

## Changes

### 1. `src/lib/experience.ts`

Add Memorang as the first entry in `career[]`:

- **Company:** Memorang · **Title:** Founding Technical Product Manager
- **Period:** May 2026 – Jul 2026 · **startYear:** 2026
- **Context:** right hand to the founder at an AI edtech infrastructure company; owned
  delivery across four concurrent white-label launches and built the AI tooling that ran them.
- **Highlights:** launch readiness across 4 concurrent programs in a 9-week window;
  authored the prioritization frameworks (Launch Gate + WSJF-light); built a 51-skill Claude
  Code operating system with nightly automation; shipped clickable prototypes as living specs;
  defined the learner curriculum model applied across programs.

Also in this file:
- `metrics`: add `8M+ / Annual Test-Takers Reached` and `4 / Concurrent Launches`.
- `skillCategories`: add an **AI Product & Agentic Systems** category.
- Remove the "15+ repos, 59 migrations, 19 edge functions" line from the Pottery Friends
  entry (per standing feedback to stop reciting it).

### 2. `src/lib/projects.ts` — four case studies

| Slug | Angle | Featured |
|---|---|---|
| `memorang-pm-os` | An AI operating system for a PM job: 51 Claude Code skills, 94 memory files, nightly launchd standup automation, and the WWYD Gate quality hook | Yes |
| `memorang-launch-program` | Running four launches against one shared QA bench: Launch Gate, WSJF-light, QA/UAT dashboard, capacity-constraint analysis | Yes |
| `memorang-prototypes` | Prototypes as specs: UAT prototype (38-screen spec collapsed to 6 routed surfaces), self-service setup portal, CMS prototype, E2E suite, auth-gated roadmap viewer | No |
| `memorang-curriculum-model` | Product thinking in a regulated domain: formative vs summative split, three persona onboarding paths, disjoint item banks | No |

All four use `category: "software"` so they surface on `/work` and `/projects`. Client-facing
detail is generic throughout; no `liveUrl` on any of them (all internal or local-only).

### 3. `src/app/about/page.tsx`

Extend the narrative past Pottery Friends into Memorang, closing the arc. Remove the
repo/migration-count sentence. Add a Memorang stat to the stats row.

### 4. `CLAUDE.md`

Update "Who Is Jon", "Jon's Positioning", and the goal framing to reflect that Memorang
happened and ended, so future sessions do not reintroduce the stale pre-employment framing.

## Out of scope

- Regenerating the tailored resume PDFs/HTML in `documents/resumes/` (per-company, would be
  overwritten blind).
- Adding a Memorang logo tile to the `companies` array (no asset available).
