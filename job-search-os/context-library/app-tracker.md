# Application Pipeline Tracker

Last updated: 2026-08-05

---

## Queued — Not Yet Submitted

Of the 20 roles sourced 2026-08-04: 3 are dead, **8 have been submitted**, 1 passed on, **8 remain live and unsubmitted**. Full detail, apply links, resume assignments, and caveats in `documents/applications/2026-08-04-queue.md`. Cover letters in `documents/applications/cover-letters/`.

All 20 are rows in `job_pipeline_entries` (Supabase, `source = queue_2026_08_04`), so the dashboard and the daily brief can see them. Status is now reconciled against the inbox as of 2026-08-05 — the brief's Applications section reads `applied_date` from the pipeline, not this file.

**Tier 1:** ~~Webflow (Senior PM, AI)~~ ✅ applied 08-04 · ~~Artisan (PM)~~ ✅ applied 08-04 · Careforce (Technical PM) · Trellis AI (Product Lead) · Anthropic (PM, Claude Code **Model Performance** — $305–460K, verified) · ~~Vercel (Senior PM)~~ ❌ closed · ~~Kilo Code (first PM)~~ ❌ closed

**Tier 2:** Broccoli AI (Senior PM) 🔒 hCaptcha · Sourcegraph (PM IC4) 🔒 demographics · Baselayer (Sr. PM) 🔒 email code · ~~Stedi (PM)~~ ✅ applied 08-05 · Anthropic (Web PM) · ~~Assort Health (Director, Agent PM)~~ ✅ applied 08-05 · ~~Vercel (PM, Accounts)~~ ❌ closed

**Tier 3:** ~~Harvey (Senior PM, Command Center)~~ ✅ applied 08-05 · ~~Tailor (Forward-Deployed PM)~~ ⏭️ passed · Anthropic (PM, Enterprise) 🔒 dropdowns · ~~Heidi Health (Head of Product NA)~~ ✅ applied 08-05 · ~~Clipboard (PM)~~ ✅ applied 08-05 · ~~Liberate (Agent PM)~~ ✅ applied 08-05 (incomplete)

🔒 = form fully filled, waiting only on a step Jon has to do himself. Five `apply` tasks are queued in `job_daily_tasks` for 2026-08-05; follow-ups are queued for 08-11 and 08-12.

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

## Reconciliation pass 2, 2026-08-05 17:45 UTC

Four new confirmations since the 17:00 pass. **11 applications are now submitted.**

**Newly submitted (3) — all advanced to `submitted` in the ledger and `applied` in the pipeline:**

- **Broccoli AI — Senior PM** — YC confirmed 17:39 UTC. Jon cleared the hCaptcha that had it parked.
- **Careforce — Technical PM** — YC confirmed 17:41 UTC. Prepared by `session-9f0da98b`, sent by Jon.
- **Trellis AI — Product Lead** — YC confirmed 17:42 UTC. Prepared by `session-9f0da98b`, sent by Jon.

Follow-ups queued for all three on 2026-08-12.

**⚠️ Artisan received a SECOND application** at 17:41 UTC. The first was confirmed 2026-08-04 23:53 UTC and the ledger has held it as `submitted` since. **The guard blocks agents; it cannot block Jon applying by hand.** That is now four duplicated reqs in two days — Stedi ×3, Harvey ×2, Heidi ×2, Artisan ×2.

**The fix is a habit, not code:** before applying to anything, check whether it is already in the ledger.

```bash
.claude/skills/one-application-per-company/apply-guard.ts list --company "Artisan"
```

Every one of these duplicates went to a company small enough to notice.

---

## Ledger reconciliation, 2026-08-05

`job_applications` is now the source of truth for what has been applied to; `job_pipeline_entries.status` is a view of it. Both are reconciled.

**Open applications, all within cap:**

| Status | Roles |
|---|---|
| `submitted` (8) | Webflow · Artisan · Clipboard · Heidi Health · Harvey · Stedi · Assort Health · Liberate |
| `prepared` (4) | Baselayer · Broccoli AI · Sourcegraph · Anthropic (Enterprise) — materials written, waiting on Jon |
| `claimed` (3) | Careforce · Trellis AI · Anthropic (Claude Code Model Performance) — **held by another agent, `session-9f0da98b`** |

**Closed to free company slots (5).** Linear, Replit, Vercel (Product Lead v0) and Anthropic (PM, Consumer) were all submitted 2026-03-31 with four months of silence — the tracker already said to treat them as ghosted. Closing frees the *company* slot; the req stays blocked forever, because a ghosting is not an invitation to reapply. Memorang was also closed, but it is **not** a ghosting — Jon got that role and worked it May–July 2026.

**Anthropic is at its cap of 2**, and that is now a real constraint: Claude Code Model Performance (claimed) and Enterprise (prepared) hold both slots. **Web Product Manager cannot proceed** until one frees, even though it was approved and its letter is rewritten. Its daily task is cancelled with that reason. Decide which two Anthropic reqs you actually want.

**Do not touch Careforce, Trellis AI, or Anthropic (Model Performance)** — another agent claimed all three at 17:03 UTC and is preparing them now.

---

## Inbox reconciliation, 2026-08-05 — the record below was wrong in two places

Reconciled every row in `job_pipeline_entries` against the ATS confirmation emails in Jon's inbox, because a written "submitted" note is not evidence and a written "not submitted" note is not either. **The inbox is the source of truth for what actually went out.** Eight roles now sit at `applied` in Supabase.

**Confirmed submitted — 7 by ATS email, 1 by first-hand record:**

| Company | Role | Confirmation |
|---|---|---|
| Webflow | Senior PM, AI | Webflow, 2026-08-04 23:48 UTC |
| Artisan | Product Manager | Work at a Startup, 2026-08-04 23:53 UTC |
| Clipboard | Product Manager | Work at a Startup, 2026-08-05 00:11 UTC |
| Heidi Health | Head of Product, NA | Ashby, 00:15 UTC **+ 16:57 UTC (dupe)** |
| Harvey | Senior PM, Command Center | Ashby, 16:21 UTC **+ 16:50 UTC (dupe)** |
| Stedi | Product Manager | Ashby, 16:25 **+ 16:45 + 16:47 UTC (×3)** |
| Assort Health | Director, Agent PM, Health Systems | Ashby, 16:54 UTC |
| Liberate | Agent Product Manager | **No email** — Greenhouse org sends none; recorded first-hand below |

**Two corrections to the bottom-up pass:**

- **Artisan was submitted** and never recorded. The queue lists it as hCaptcha-blocked; the YC confirmation at 23:53 UTC on 2026-08-04 says otherwise.
- **Assort Health was submitted**, despite being logged below as "not submitted — Jon's decision." The confirmation landed at 16:54 UTC, after that note was written. Jon still fails the two required gates, so treat it as a courtesy no, not a live prospect.

**Duplicate submissions — Stedi ×3, Harvey ×2, Heidi ×2.** All in a 16:21–16:57 UTC window on 2026-08-05, i.e. a re-submit pass over roles that had already gone out. Recruiters see every copy in the ATS. **Before any future re-submit, check the inbox for a confirmation first** — it is one Gmail search and it is authoritative.

---

## Bottom-up pass, 2026-08-05

Second agent worked the 2026-08-04 queue from #20 upward while the first worked #1 down. Results below; the queue file's ⚠️ rows are now JD-verified where noted. **Superseded in two places by the reconciliation above.**

### Submitted
- **Heidi Health — Head of Product, North America** (#18). Ashby, no cover-letter field. Resume: Zero to One. **Comp is the queue's best: $255–300K + equity + commission + bonus.** Real gap: JD requires having built and run a PM org, which Jon has not; on-site SF. Forward-deployed/custom-solutions requirement is a strong Memorang match.
- **Harvey — Senior PM, Command Center** (#15). $177.7–266.5K + equity + bonus, hybrid SF 3 days. Resume: AI Builder. Partial match — strong on analytics/dashboards, thin on SSO/SCIM/RBAC/audit logging.
- **Stedi — Product Manager** (#12). Remote US. Resume: AI Builder. Wrote a tailored "what interests you" answer. All requirements are soft; posting explicitly invites imperfect matches.
- **Clipboard — Product Manager** (#19). Jon cleared the hCaptcha and sent it; YC confirmation 00:11 UTC. **Re-rank this one up:** comp is $185–275K (queue had it blank), JD wants marketplaces + SQL + small-team shipping, and their first interview stage is a deep dive on the written response submitted with the application.

### Submitted incomplete — known defect
- **Liberate — Agent Product Manager** (#20). Submitted accidentally mid-fill via a combobox interaction that triggered form submit. Went out with name, email, phone, resume, and cover letter; **Country, Location, work-authorization, and the "3+ years management consulting" screener all blank.** Nothing false was asserted. Jon's call was to leave it rather than resubmit — he fails the consulting must-have regardless. Greenhouse's visible question inputs are not natively `required`, so a programmatic submit passes validation with blanks.

### Parked — needs Jon, forms fully filled
- **Baselayer — Sr. Product Manager** (#10). Used the relinked req `5378886008`. Resume switched to **Zero to One** (queue said AI Builder, assigned before the JD was readable; the JD is explicitly first-PM zero-to-one). Blocked on an 8-character email verification code — bot-detection, not automatable.
- **Broccoli AI — Senior PM** (#8). Blocked on hCaptcha. **Best content match in the whole queue:** their "AI PM agent" bullet — an agent ingesting tickets, transcripts, Linear, and metrics — is the Memorang nightly automation almost verbatim. Answer commits Jon to 5 days in the SF office.
- **Sourcegraph — Product Manager [IC4]** (#9). Everything filled except three required demographic questions, deliberately left for Jon. Note: the compensation answer states his real $280–380K TC target and names the gap against their published $167.2K Zone 2 base. Aggressive anchor — worth a read before sending.
- **Anthropic — Product Manager, Enterprise** (#17). Resume + all free-text filled including "Why Anthropic?" and a candid Additional Information note that names the enterprise-security gap outright. Six dropdowns unset — browser was blocked mid-fill by a third-party extension overlay.

### Not submitted — Jon's decision
- **Tailor — Forward-Deployed PM** (#16). $130–170K (half target) and the JD requires LA presence plus ~20% travel despite the "US-Remote" title. Now `passed` in Supabase.
- ~~**Assort Health — Director of Agent PM, Health Systems** (#14).~~ **CORRECTION: this was submitted** at 16:54 UTC, after this note was written — see the reconciliation section above. The fit analysis still stands: it is an implementation/delivery role in Deployment & Operations with two explicit **(required)** gates Jon fails — end-to-end health-system/IDN deployments, and hands-on Epic integration at scale.

### Still open
- **Anthropic — Web Product Manager** (#13). Approved to send, not started.

### Verification notes
- **Vercel (PM, Accounts) #11 confirmed dead** — URL redirects to the careers index and Vercel currently lists **zero PM roles** across ~80 open reqs. Same for **Vercel (Senior PM) #5**, which sits in the top-down agent's half.
- Ran `verify.mjs` against Sourcegraph, Broccoli, both Anthropic reqs, Tailor, and Assort: **6 live, 0 dead**, titles matching the queue.
- **Jon's live LinkedIn is `linkedin.com/in/jonmartin-pm`** (confirmed on the profile itself; it is already set to Open to Work). The portfolio site still points at the old `jon-martin-0b739316` in `src/components/Footer.tsx` and `src/app/contact/page.tsx` — worth fixing.
- The resume caveat in the queue file is **stale**: the repo/migrations/edge-functions bullet is already gone from all three resume `.md` files and absent from all three PDFs.

### Tooling lesson
`form_input` is unsafe on Greenhouse react-select comboboxes — it can fire the form's submit (this is what sent Liberate). On Ashby it silently fails to register in React state, so the form rejects values that visibly render. Use real clicks for dropdowns, and upload files **before** filling text, since Greenhouse re-renders on upload and wipes text fields.

---

## Run 3 — 2026-08-05, un-applied sweep

Worked the queue for anything never touched. Six candidates; **three were not ours to take.**

### Blocked by the application guard — not applied

The `one-application-per-company` ledger caught two things the queue and this file both missed:

- **Artisan (#2)** — `BLOCKED`. Req `yc:artisan:9a5WFVO` **already has a submitted application dated 2026-08-04.** Nothing in this tracker or the queue recorded it; both still listed Artisan as un-applied Tier 1. Had the guard not existed this would have been Artisan's second application. This is the Stedi failure mode, caught.
- **Anthropic Web PM (#13)** and **Anthropic Enterprise (#17)** — company cap is **2**. At the time this run started, one slot was held by the ghosted *PM, Consumer* application from 2026-03-31, so only one req could proceed. It went to **Model Performance** (higher fit, $305–460K). This session did not touch the half-filled Enterprise form.
  - **Since then, a parallel agent closed the March application and prepared Enterprise into the freed slot.** Anthropic now sits at its cap of 2 with *Model Performance* and *Enterprise* both `prepared`. **Web PM remains blocked** and should stay that way unless one of those two is closed. Note both still need Jon's own "Why Anthropic?" answer — see below.

### Prepared, parked, awaiting Jon

All three verified LIVE against their ATS immediately before filling.

- **Anthropic — PM, Claude Code Model Performance** (#5). Greenhouse, tab open. Resume: AI Builder. Every field filled and **verified committed** — all six react-select comboboxes read back their values, zero empty required hidden inputs. **One field deliberately left blank: "Why Anthropic?"** See the AI-policy note below. Jon must write it before this can submit.
- **Careforce — Technical PM** (#3). YC direct-contact modal, no account needed. Resume: AI Builder. 1168-char "what interests you" answer, location committed via autocomplete, work-auth Yes / sponsorship No. **Blocked by hCaptcha.**
- **Trellis AI — Product Lead** (#4). Same modal shape. Resume: AI Builder. 1494-char answer plus a second required field, "Hardest problem you have solved." **Blocked by hCaptcha.**

### Anthropic's candidate AI policy — read this before finishing that form

Anthropic's application carries a required question, *AI Policy for Application*, linking to
`anthropic.com/candidate-ai-guidance`. The policy: **"Please create your first draft yourself, then use Claude to refine it."** The explicitly prohibited example is *"Write my answers to the application questions."*

So "Why Anthropic?" was left empty on purpose. Pasting an agent-written answer and then attesting "Yes" to that question is a false attestation, at the one company where it is least survivable — and they say they weight that answer heavily (200–400 words). **Jon writes a rough first draft; refining it afterward is expressly permitted and is the better application anyway.** The cover letter at `cover-letters/anthropic-claude-code.md` is fine as raw material to react to, not to paste.

### Tooling lessons

- **Silent truncation.** Trellis's "hardest problem" field has `maxlength=250`. The first answer went in at 500+ chars and was **cut mid-word** — it rendered fine and would have submitted as a broken sentence. Reading the value back caught it. Always read `.value.length` and the tail, not the screenshot.
- **Check the right element type.** That same field is a `textarea`, not an `input`; a verification pass that only counted inputs reported it as unfilled and nearly caused a pointless retype.
- **`ArrowDown` + `Enter` on a react-select picks the *second* option** — the first is already highlighted when the menu opens. It silently chose "No" where "Yes" was intended. Click the option, or account for the pre-highlight.
- **`find` can return a neighbouring ref.** A click aimed at the AI-policy combobox landed in the "Why Anthropic?" textarea. Screenshot before clicking a dropdown.
- **`javascript_tool` refuses any output containing an href/query string** on YC pages — dump `innerText` and tag names only.

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

