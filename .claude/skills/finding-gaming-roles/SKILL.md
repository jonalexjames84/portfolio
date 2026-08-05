---
name: finding-gaming-roles
description: Use when searching game studios or gaming platforms for roles, adding a game company to the target list, or when a gaming board returns only "Product Manager" titles and no producer, live-ops, or program-management roles.
---

# Finding Gaming Roles

## Overview

Jon spent 15 years in games (Zynga, Jam City, Bandai Namco, Big Fish, Genies,
Mythical). On 2026-08-05 the pipeline held **240 target companies and zero game
studios**, and had never surfaced a single production role.

Two independent causes, both of which will come back if you are not deliberate:

1. **No gaming boards were registered.** The nightly ingest only reads companies
   in `job_target_companies`. None were game studios, so the industry was
   invisible — not "not hiring", *never looked at*.
2. **The title filter discarded the roles he is best qualified for.**
   `isRelevantTitle` excluded `program manager`, `project manager` and
   `product operations` outright, and had no `producer` term. In games the
   person who owns scope, schedule and shipping is a **Producer**, not a PM.

## The Rule

**Games use a different title vocabulary. Set `industry` to `Gaming` or the
pipeline will throw away the best roles.**

`isRelevantTitle` and `computeAutoFitScore` are both **industry-gated**. A board
whose `job_target_companies.industry` is `Gaming` accepts producer, production,
live-ops, program and project titles and scores them as real PM work. Any other
industry keeps the strict PM-only behaviour.

This is deliberately not global: widening it for all 269 companies would flood
the pipeline with Technical Program Manager reqs from every SaaS vendor.

```ts
// src/lib/job-search/ats.ts
isRelevantTitle("Senior Producer")                    // false — correct off-board
isRelevantTitle("Senior Producer", { gaming: true })  // true
fetchBoard({ ...board, industry: "Gaming" })          // flag is derived here
```

Verified live: Scopely returns **11** roles as `Gaming` and **8** as `AI/ML` —
the missing three are the Producer and Production Director reqs.

## Adding a Game Company

```bash
# 1. Find the real board token. Never guess it.
.claude/skills/finding-gaming-roles/probe-boards.ts zynga zyngacareers unity

# 2. Register it WITH industry='Gaming', or step 1 was pointless.
#    ats_type/ats_token/industry all three, every time.
```

Board tokens are unguessable — 130 educated guesses yielded 31 real boards.
Zynga is `zyngacareers`, Skillz is `skillzinc`, 2K is `2k`, Take-Two is
`taketwo`. Unity, Playtika, Rec Room and Wizards of the Coast have **no public
board**; do not record a guess as fact.

## Verified Boards

| Greenhouse | Ashby | Lever |
|---|---|---|
| `roblox` `riotgames` `epicgames` `scopely` `2k` `taketwo` `zyngacareers` `krafton` `hasbro` `tripledotstudios` `twitch` `discord` `applovin` `bandainamco` `skillzinc` `mythicalgames` `digitalextremes` `singularity6` `bungie` `gearbox` `zwift` | `voodoo` `supercell` `moonactive` `improbable` `seconddinner` `genies` | `xsolla` `jamcity` `kabam` `sandboxvr` |

**Niantic's games division is now Scopely** — `nianticlabs.com/careers` 301s to
`explore.scopely.com`. Do not add it separately.

## The Big Platforms Need a Browser

Google, Apple and Meta render job pages client-side. This breaks the normal
verification path in a way that **fails silently and looks like success**:

| Source | What scripted checks return | Truth |
|---|---|---|
| `careers.google.com` | `verify.ts` → **LIVE** (`via generic`) | 1.2MB SPA shell, title "Jobs search". Proves nothing. |
| `jobs.apple.com` | WebFetch → footer boilerplate | Detail renders client-side. |
| `metacareers.com` | WebFetch → empty | Search renders client-side. |

`LIVE via generic` means "HTTP 200, no closure phrase". Every dead posting in the
2026-08-04 audit returned HTTP 200. **For these three hosts, open the page in
Chrome and read it.** Search their own board — do not trust web search results:
four Google Play *Games* PM roles that web search still indexes are absent from
Google's live board and are closed.

Meta had **zero** gaming or Horizon PM roles on 2026-08-05. That is a real
answer, not a failed search.

## Common Mistakes

| Mistake | Consequence |
|---|---|
| Adding a studio with `industry` left null | Board gets read, every producer role silently dropped. The exact original bug. |
| Guessing a board token and recording the miss as "not hiring" | Zynga looked absent for months; the token was `zyngacareers`. |
| Trusting `verify.ts` LIVE on a Google/Apple URL | Soft-200. Verify these in the browser. |
| Queueing a Google role found via web search | Four such reqs were already closed. |
| Keeping "Producer, Art" / "Global Benefits Program Manager" | Different crafts sharing a noun. `GAMING_TITLE_EXCLUDE` drops these; don't re-add by hand. |
| Widening `isRelevantTitle` globally instead of per-industry | Floods the pipeline with TPM reqs from all 269 companies. |

## Red Flags — Stop

- About to write `insert into job_target_companies` without `industry='Gaming'`
- A gaming board returned only "Product Manager" titles — the flag isn't set
- Concluding a studio isn't hiring after one token guess 404'd
- Marking a Google/Apple/Meta role live without having opened it in a browser
- Scoring a Producer role against `computeAutoFitScore` with `industry` unset
  (its `title_match` will be 0 and it will rank last)

## Related

- `src/lib/job-search/ats.ts` — `isGamingBoard`, `isRelevantTitle(title, {gaming})`
- `src/lib/job-search/fit-score.ts` — gaming title terms and JD keywords
- `verifying-job-listings` — the ATS APIs are authoritative; these hosts are not
- `one-application-per-company` — **Take-Two and 2K Games collapse to one key**
  (`2k-games`) and share a single application slot. Zynga (`zynga`) and Gearbox
  (`gearbox`) are separate keys despite Take-Two owning all three, so they do
  not. Verify with `normalizeCompany` before assuming a slot is free.
