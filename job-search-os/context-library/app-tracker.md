# Application Pipeline Tracker

Last updated: 2026-08-04

---

## Queued — Not Yet Submitted

Of the 20 roles sourced 2026-08-04: 3 are dead, Webflow was sent, **16 remain live and unsubmitted**. Full detail, apply links, resume assignments, and caveats in `documents/applications/2026-08-04-queue.md`. Cover letters in `documents/applications/cover-letters/`.

All 20 are now rows in `job_pipeline_entries` (Supabase, `source = queue_2026_08_04`), so the dashboard and the daily brief can see them. Update status **there** as you submit — the brief's Applications section reads `applied_date` from the pipeline, not this file.

**Tier 1 (apply first):** ~~Webflow (Senior PM, AI)~~ ✅ applied · Artisan (PM) · Careforce (Technical PM) · Trellis AI (Product Lead) · Anthropic (PM, Claude Code **Model Performance** — $305–460K, verified) · ~~Vercel (Senior PM)~~ ❌ closed · ~~Kilo Code (first PM)~~ ❌ closed

**Tier 2:** Broccoli AI (Senior PM) · Sourcegraph (PM IC4) · Baselayer (Sr. PM — **new req link**, old one 404s) · Stedi (PM) · Anthropic (Web PM) · Assort Health (Director, Agent PM) · ~~Vercel (PM, Accounts)~~ ❌ closed

**Tier 3:** Harvey (Senior PM, Command Center) · Tailor (Forward-Deployed PM) · Anthropic (PM, Enterprise) · Heidi Health (Head of Product NA) · Clipboard (PM) · Liberate (Agent PM)

**Liveness sweep complete, 2026-08-04.** All 20 postings — not just Tier 1 — were re-checked against the employers' own ATS APIs (Greenhouse `boards-api`, Ashby `posting-api`, YC company job pages), which is authoritative in a way that loading the public page is not.

- **3 dead:** Vercel (Senior PM), Vercel (PM Accounts), Kilo Code — all `passed` in Supabase with a CLOSED note. Kilo's BuiltIn listing expired 2025-12-03 and Kilo's own Ashby board returns zero postings.
- **1 wrong link:** Anthropic corrected to `5247640008` (Claude Code Model Performance, $305–460K). The old ID `5251866008` is a real, still-open req — *PM, Claude Tag* — just a different one.
- **1 rotted req (new find):** Baselayer's `5288970008` 404s. The role is still open under `5378886008`. This was **not** caught by the earlier browser pass.
- **15 confirmed open**, links unchanged. All six YC postings still appear as active on their company job pages; all four Ashby postings still return from their org's API.

No ⚠️ rows remain unverified — the ⚠️ marker in the queue file now means only "posting is live but the JD wasn't read before the cover letter was written."

**Baselayer row updated in Supabase** with the new apply URL (`5378886008`) and restored to `saved` — it had been briefly retired by the earlier, shallower browser pass.

**This can't silently recur.** `/api/job-search/recheck-listings` runs daily at 05:30 UTC (`vercel.json`), sweeping `saved` rows oldest-first and retiring any whose posting has closed. It only ever downgrades on positive evidence — a 404/410, a redirect to a board index, or an explicit closure notice on the page. Timeouts, 403s, and 5xx return `unknown` and leave the row untouched, so a rate-limited board never costs a live role. Logic is in `src/lib/job-search/listing-liveness.ts`, 21 tests.

---

## Whole-pipeline audit, 2026-08-05

The queue was only the visible part. Auditing all 98 rows in `job_pipeline_entries` found the rot was much wider, and found a hole in the checker itself.

**The cron was blind to a third of the pipeline.** It filtered on `job_url is not null`, but the scraper often leaves `job_url` null and buries the link in `notes` (`... | Link: https://... | Auto-scraped`). 22 rows were in that state and had never been checked by anything. **17 of them were dead** — including a Vercel req and eleven Roblox reqs. Fixed: `extractListingUrl()` now falls back to the notes field, the route no longer filters those rows out, and a live row's notes-URL gets promoted onto `job_url` so the next sweep is cheap.

**The checker would have retired live roles.** The dry run flagged a Roblox posting as dead because `boards.greenhouse.io/roblox/jobs/8014742` hands off to `careers.roblox.com/jobs/8014742?gh_jid=8014742` — a legitimate board-to-employer redirect that drops a path segment and tripped the "bounced to an index" rule. Greenhouse's API confirmed the req was open. `looksLikeBoardIndex` now treats the redirect as live when the destination still carries the same req id, in the path or the query string. Retiring a live role is the more expensive error of the two, so the tie goes to keeping it.

**Actions taken on Supabase:**

- **22 rows retired** (`saved` → `passed`, prior notes preserved): 10 Roblox, 4 2K Games, 4 Vercel, 4 Anthropic. The four Anthropic ones (*PM, Claude Code* / *Claude Code Enterprise* / *Claude Code Growth* / *Claude Experiences*) were March wishlist entries with no URL — none of those titles exists on Anthropic's board. The real Claude Code PM req is the Model Performance one already in the queue.
- **2 rows relinked** rather than retired — the role is open under a new req, the Baselayer pattern again: Anthropic *Research Product Manager, Model Behaviors* → `5247407008`, and Roblox *Senior PM, User Lifecycle* → `8014742` (renamed *User Life Cycle: Engagement*).
- **4 rows backfilled** with `job_url` so the cron can see them.

**Final dry run: 48 checked, 43 live, 0 dead, 5 unknown, 17 unlinked.** The 5 unknowns are all ZoomInfo returning HTTP 403 to a scripted request — checked by hand against Greenhouse's API, **all 5 are live**. That is the conservative path working as intended.

**17 rows still can't be auto-verified** — hand-entered from 2026-03-30/31 with no URL in any field (Discord, Notion, Pinecone, Hex, FlutterFlow, Manticore, Weights & Biases, and others). They're now reported in the route's `unlinked` array instead of aging silently. They are four months old; treat them as a wishlist, not a pipeline, and re-source any that still matter.

**Known gap, not yet built:** the probe fetches the public HTML page, which is what the ZoomInfo 403s come from. For Greenhouse and Ashby URLs it could hit the JSON API instead (`boards-api.greenhouse.io/v1/boards/{org}/jobs/{id}`, `api.ashbyhq.com/posting-api/job-board/{org}`) — no bot-blocking, no JS rendering, and an authoritative title to diff against the stored role. That is how this audit was actually done by hand.

---

## Applied -- Waiting

> **Stale entries below.** The three applications from 2026-03-31 all had "follow up by 2026-04-07" as their next action and no outcome was ever logged. As of 2026-08-04 that is roughly four months of silence — treat all three as ghosted unless you know otherwise, and move them to Closed. The Anthropic connections (Scott White, Cat Wu) are still uncontacted and still worth more than a cold reapplication.

### Webflow - Senior Product Manager, AI
- **Status:** Applied
- **Date applied:** 2026-08-04
- **Referral:** No
- **Resume version:** `resume-ai-builder.md`
- **Cover letter:** `documents/applications/cover-letters/webflow.md`
- **Connection at company:** None identified
- **Work product sent:** No
- **Company tier:** Tier 1, Rank #1 of the 2026-08-04 queue (fit 94)
- **Comp posted:** $187.5–225K base, Zone A
- **Last action:** Applied 2026-08-04, confirmation email received 4:48pm PT
- **Next action:** Follow up if no response by 2026-08-11. Worth finding a Webflow AI-team contact before then.
- **Notes:** Series C, remote US. JD was verified against the live posting before the letter was written. Highest-fit role in the batch.
- **History:**
  - 2026-08-04 Applied (confirmed by ATS email)

### Anthropic - Product Manager
- **Status:** Applied
- **Date applied:** 2026-03-31
- **Referral:** No (connections available: Scott White - Head of Product, Claude; Cat Wu - Head of Product, Claude Code)
- **Resume version:** TBD
- **Cover letter:** TBD
- **Connection at company:** Scott White, Cat Wu (both cold, not yet contacted)
- **Work product sent:** No
- **Company tier:** Tier 1, Rank #1
- **Last action:** Applied 2026-03-31
- **Next action:** Follow up if no response by 2026-04-07. Consider sending connection request + work product to Scott White or Cat Wu.
- **Notes:** Dream target. AI-native, PM ships product, builder culture. Late-stage private ($60B+ valuation), ~1,000 employees.
- **History:**
  - 2026-03-31 Applied

### Linear - Product Manager
- **Status:** Applied
- **Date applied:** 2026-03-31
- **Referral:** No
- **Resume version:** TBD
- **Cover letter:** TBD
- **Connection at company:** None
- **Work product sent:** No
- **Company tier:** Tier 1, Rank #4
- **Last action:** Applied 2026-03-31
- **Next action:** Follow up if no response by 2026-04-07. Consider running /connection-request to find contacts at Linear.
- **Notes:** Series B, ~80 employees, remote-first. PM owns everything. Design excellence. Role requires 6+ years, prior engineering/design experience.
- **History:**
  - 2026-03-31 Applied

### Replit - Product Manager
- **Status:** Applied
- **Date applied:** 2026-03-31
- **Referral:** No (connections available: Aman Mathur - Product at Replit; Amjad Masad - CEO)
- **Resume version:** TBD
- **Cover letter:** TBD
- **Connection at company:** Aman Mathur (cold, not yet contacted), Amjad Masad (cold, not yet contacted)
- **Work product sent:** No
- **Company tier:** Tier 1, Rank #6
- **Last action:** Applied 2026-03-31
- **Next action:** Follow up if no response by 2026-04-07. Consider sending connection request to Aman Mathur with work product.
- **Notes:** AI + dev tools, consumer-facing, fast shipping culture. Late stage (~$9B valuation), ~300 employees.
- **History:**
  - 2026-03-31 Applied

---

## Referral In Progress


---

## Recruiter Screen


---

## Phone Interview


---

## Onsite / Final Round


---

## Offers


---

## Closed

### Rejected


### Withdrawn


### Ghosted

