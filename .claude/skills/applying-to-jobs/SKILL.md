---
name: applying-to-jobs
description: Use when filling or submitting a job application in Jon's Chrome browser via the claude-in-chrome tools — Greenhouse, Ashby, Lever, Y Combinator, LinkedIn Easy Apply, or any ATS form. Covers which tool to use per field type, the silent-failure modes that submit blank required fields, file uploads from the repo, and where to stop for a human.
---

# Applying To Jobs Through Chrome

## Overview

Filling an ATS form looks like typing into boxes. It is not. Every board in this
family is React, and **the thing that shows your answer is not the thing that
submits it.**

On 2026-09-14, thirteen applications went out in one session. Across them:

- Snowflake displayed `Jon Martin` in a required name field and submitted it
  **empty**, twice, until the text was retyped with real keystrokes.
- Baseten's work-authorization button rendered as selected while the server
  called the field missing — and the "fix" click *toggled the committed answer
  off*.
- Descript's submit was rejected over a **Country** field nobody had touched.
- A location autocomplete pre-highlighted **Concordia, Entre Ríos, Argentina**
  when the answer was Concord, California. Pressing Enter would have shipped it.

**Verify committed state against the server, not against the screen.**

## The Sequence (never reorder)

1. `verifying-job-listings` — is the req open? Cheapest check, run it first.
2. `one-application-per-company` — **claim before writing a single word.**
3. Write the letter → render → confirm the PDF → `advance --status prepared`.
4. Fill the form in Chrome. Anything under **Never Mine To Answer** gets left
   blank and logged, not asked mid-fill. Keep going.
5. **Confirm with Jon before every submit.** Per-application, every time — but
   in one batched message, not one interruption per form. See **Batch Approval**.
6. Submit → **prove it landed** → `advance --status submitted` + update the
   pipeline row.

Skipping step 3's render check means attaching a stale PDF. Skipping step 6's
proof means recording a submission that never happened.

## Coordinate Discipline (five misfires in one session)

Coordinate clicks are mandatory on Ashby. They are also the single largest
source of silent error.

- **Coordinates come from the frame's own coordinate system.** A `scale: 0.5`
  screenshot reports `coordinate frame: 1270x780` — use *those* numbers. A
  full-resolution screenshot needs no doubling. Doubling an already-full-res
  coordinate put five clicks ~456px right of target.
- **Layout shifts invalidate every coordinate you hold.** It shifts when: an
  error banner appears or clears (~170px), a resume finishes parsing, a dropdown
  closes, a file attaches. **Re-screenshot immediately before the click.**
- Never carry coordinates across a scroll. Never reuse them after any of the
  above.

## Refs Go Stale Too

`read_page` refs are positional, not stable. After a scroll or re-render, `ref_19`
may point at a different control than it did a minute ago. Twice in one session a
stale ref flipped a *correct* answer to a wrong one.

- Re-read before a ref click if anything has changed since the read.
- After any ref click on a Yes/No pair, **verify by screenshot or checkbox count.**

## Tool Selection

| Field type | Use | Never use |
|---|---|---|
| Plain `<input>` on **Greenhouse** | `form_input` | — |
| Plain `<input>` on **Ashby** | click → `computer:type` | `form_input` — displays, doesn't commit |
| React combobox (both boards) | click → type → **click the option row** | Enter, `form_input` |
| Ashby Yes/No button pair | **coordinate** click, then verify | ref click; re-clicking "to be sure" |
| Radio / checkbox | coordinate click from a fresh frame | `form_input` |
| Textarea | click → `computer:type` | `form_input`, JS native-setter |
| File upload | `file_upload` with the input's ref | clicking Attach (opens a native dialog) |
| Page scroll | `javascript_tool: window.scrollBy/scrollTo` | `computer:scroll` when a textarea has focus — it eats the scroll |

## read_page Reports Placeholders, Not Values

`textbox "Type here..." [ref_8]` means the field's **placeholder** is "Type
here…" — it says nothing about whether the field is filled. I once announced
that a resume parser had wiped five fields; it hadn't. A JS probe showed
`filledTextInputs=5, emptyTextInputs=0`.

To read real values: `[...document.querySelectorAll('input')].filter(e=>e.value)`.

## Ashby (`jobs.ashbyhq.com`)
- Append **`/application`** to the URL to land on the form.
- **The submit button only responds to a coordinate click.** Ref clicks report
  success and do nothing. This cost two "failed" submits that had never fired.
- **Yes/No pairs are backed by hidden checkboxes.** The rendering lies; the count
  is the truth:
  ```js
  (()=>{const c=[...document.querySelectorAll('input[type=checkbox]')];
    return c.filter(x=>x.checked).length+' of '+c.length})()
  ```
  Only **"Yes"** answers check a box. "No" leaves it unchecked. So 2 of 16 with
  two Yes answers and a ticked consent box is correct, not a failure.
- **Never re-click a Yes/No that already looks right.** It toggles off.
- Success = the form is **replaced by a `status` element**:
  ```
  status → heading "Success" → "Your application was successfully submitted."
  ```
  Read it with `read_page` + `ref_id` on the tabpanel. `inputs=0`,
  `formPresent=false`.
- Failure = a red **"Your form needs corrections"** banner naming one field at a
  time. It keeps everything else you entered. Fix only what it names.
- After a resume upload the "Autofill from resume" panel re-renders and **the
  page grows taller** — re-capture before clicking anything.

## Greenhouse (`job-boards.greenhouse.io`)

- `form_input` works on plain inputs here. Comboboxes still need the click-the-row
  treatment.
- **Country is required and easy to miss** — it rejected a submit that otherwise
  looked complete.
- **Autocomplete default highlights are frequently wrong.** "Concord" pre-selects
  New Hampshire or Concordia, Argentina. *Always click the row you want.*
- Success = URL becomes **`…/confirmation`**, "Thank you for applying", form gone.
- `read_page` returns only elements near the viewport — scroll and re-read.

## Company-Site Wrappers Are Usually iframes

`brex.com/careers/…`, `databricks.com/…/job?gh_jid=…`, `asana.com/jobs/apply/…`
render the Greenhouse form in an **iframe from `job-boards.greenhouse.io`**.

- The page screenshots fine; `read_page` returns only site nav and **zero form
  controls**. That combination means iframe.
- If that domain is blocked in the extension, the form is unreachable from *any*
  wrapper. Get the site-access grant; don't coordinate-click into a frame you
  cannot read back.

## Browser Environment Failures

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot access a chrome-extension:// URL of different extension` | Another extension (password manager) grabbed the surface, usually on a text-field click | Disable it for that domain. A page reload
clears it **but wipes the form** |
| `Permission denied for this action on this domain` | Site access not granted | `chrome://extensions` → Claude → Site access → add the domain → **reload the tab** |
| `Couldn't determine which page this action targets` | Tab group died | `tabs_context_mcp {createIfEmpty:true}` |
| Screenshots and JS fail, `read_page` still works | Injection blocked, a11y tree unaffected | Use `read_page` to diagnose; it survived every outage |

**One application per tab, and never close a tab down to an empty group** — that
auto-removes the group and takes sibling tabs with it. A group collapse loses a
filled form outright (it cost a completed Descript fill once).

## Never Mine To Answer

Leave these blank and put them in the batch's **Open questions** column (see
**Batch Approval**). Never answer them yourself. Every one of these came up in a
single session.

- **Demographics** — gender, race, veteran, disability. Always voluntary in
  practice; leave blank. If a board marks them required, surface the "I don't
  wish to answer" option rather than picking one.
- **Legal acceptance** — arbitration agreements, privacy notices, and
  certifications that *you personally completed this application*. Note the irony
  of the last one and name it.
- **Life commitments** — office days per week, start date, relocation. Yes to
  three days at one company is not yes at another; ask each time.
- **Money** — desired salary. The number anchors his negotiation. Bring the
  posted band and his $280–380K target to the question.
- **Personal data not in the repo** — zip code, pronouns. Ask; don't infer.
- **The NDA question.** "Are you bound by any agreement… including
  confidentiality or non-disclosure…" — Jon signed a Memorang NDA, so the literal
  answer is **Yes**, with an explanation that it carries no non-compete and
  restricts nothing about where he works. Don't click No because it's faster.
- **"Why [frontier lab]"** free text — Jon writes the first draft. Refine only.
- **Internal-transfer questions leaking onto external forms** (Plaid served "have
  you spoken with your current manager — required"). Both answers are false for
  an external candidate. Surface it.

## Batch Approval

Jon should not have to watch the console. Every application still gets his
explicit yes — he just gives all of them at once.

1. **Fill every queued application to the brink of Submit**, one tab each. Don't
   stop to ask about a Never-Mine-To-Answer field; leave it blank, note it, move
   to the next form.
2. **Send one push notification** (`PushNotification`) when the batch is ready:
   "5 applications ready for review, 3 questions."
3. **Post one approval table**, then wait:

   | # | Company — Role | Letter PDF | Open questions |
   |---|---|---|---|
   | 1 | Acme — Sr PM, AI | `acme-sr-pm.pdf` ✓ 1 page | Salary (band $210–260K) |
   | 2 | … | … | none |

   Answers are per row and explicit: "submit 1, 2, 4; for 1 put $240K". Silence,
   "looks good", or "go ahead" without numbers is **not** approval for a row.
4. **Fill the answers Jon gave → submit only the named rows → prove each one
   landed** (see below). Rows he didn't name stay prepared, tabs open.
5. Report once at the end: what submitted, what's still waiting.

A row with any open question can't be submitted until it's answered. Nothing
under Never Mine To Answer gets a default because the batch is waiting.

## Application Limits Worth Knowing

Some boards ration applications. Spend the slot deliberately.

| Company | Limit |
|---|---|
| Plaid | 3 applications / 60 days; **12-month lock** on the same role after rejection |
| OpenAI | 5 applications / 180 days |
| Scale AI | 90-day wait before reconsidering the same candidate |

## Proving A Submit Landed

A click result of "success" means the click dispatched, not that the form went.

```js
// Ashby
(()=>{const t=document.body.innerText;
  const i=t.indexOf('Your form needs corrections');
  if(i>=0) return 'BANNER: '+t.slice(i,240);
  return 'success='+/successfully submitted|thank you for applying/i.test(t)
    +' | inputs='+document.querySelectorAll('input,textarea').length})()
```

`inputs=0` plus a Success heading is proof. A page that still has 39 inputs is
not submitted, whatever the click said.

**Do not write a boolean probe that matches page boilerplate.** `/required/`
matches "* indicates a required field" on every form; that false signal wasted a
round trip.

### A timed-out batch is not a failed submit

Supabase's submit-and-verify batch returned *"The browser_batch tool did not
respond in time."* The click was the **first** action in that batch — it had
already landed, and only the verification hung. The application was in.

**Never re-click Submit after a timeout.** On a req with an application cap
(Supabase: 3 per 60 days; Plaid: 3 per 60; OpenAI: 5 per 180) a duplicate burns a
real slot, and on any req it can double-submit under Jon's name.

Instead, probe with something lighter than a screenshot — `read_page` survived
every outage this session:

```
read_page → tabpanel → status → heading "Success"
```

A `status` element where the form used to be means it went. If the tooling is too
degraded even for that, **ask Jon what the tab shows** rather than guessing.

## Recording The Result

```bash
G=.claude/skills/one-application-per-company/apply-guard.ts
$G advance --url "<url>" --status submitted
```

Then the pipeline row — **by exact row id, never a company-wide filter**:

```bash
# WRONG: matched 10 Snowflake rows and marked 9 of them falsely applied
curl -X PATCH "$U/rest/v1/job_pipeline_entries?company=eq.Snowflake&source=eq.ats_ingest"

# RIGHT: look up the id, confirm it's unique, patch that row
```

That mistake corrupted nine rows and destroyed their prior `last_update` values,
which are unrecoverable.

Ledger dates can **cross midnight UTC mid-session** — a count that looks short by
one is often a row filed under tomorrow, not a lost record. Check before alarming.

## Materials

- Letters: `documents/applications/cover-letters/<slug>.md`. Heading
  `# Company — Role`, then notes **to Jon**, then `---`, then the letter.
  Everything above the rule is dropped; a letter with no `---` is refused.
- The PostToolUse hook **re-renders on every edit** — `render-pdfs.mjs --only <slug>`
  does *not* force a rebuild ("0 rendered, 1 already present"). Check the PDF's
  mtime and grep its text to confirm an edit reached it.
- Always verify before attaching: one page, and no notes-to-Jon leaked:
  ```bash
  pdftotext "<pdf>" - | grep -ciE "JD verified|HONEST GAP|Resume variant|COMP"
  ```

### Resume variants

| Variant | Use for |
|---|---|
| AI Builder | AI-native, agents, applied-AI infra, edtech |
| PM Resume | Developer platforms, creator tools, dev experience |
| Growth & Scale | Growth, monetization, funnels, P&L |
| Zero to One | Founding PM, 0→1, no-playbook roles |

### Standard answers

| Field | Value |
|---|---|
| Name / Email | Jon Martin · jonalexjames@gmail.com |
| Phone | (650) 627-6352 |
| Location | Concord, California, United States |
| LinkedIn | https://www.linkedin.com/in/jonmartin-pm/ |
| Portfolio | https://portfolio.jonnymartin.blog |
| Current company / title | Frame Story · Co-Founder & Director of Product |
| Work auth / sponsorship | Yes / No |
| Pronouns | he/him *(confirmed by Jon)* |

`src/lib/experience.ts` and `Footer.tsx` carry an **older** LinkedIn URL. Don't use it.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The field shows my text" | Snowflake showed `Jon Martin` and submitted empty, twice. |
| "The button looks selected" | Baseten's did; the server said missing. Count the checkboxes. |
| "I'll re-click it to be safe" | That toggles it **off**. Did it twice. |
| "I'll re-click it to be safe" | That toggles it **off**. Did it twice. |
| "`emptyRequired=0`, so it's complete" | That reads `el.value`, which is the same lie. |
| "The click returned success" | The click dispatched. The form may not have moved. |
| "I'll reuse the coordinates from a second ago" | A banner cleared and everything moved 170px. |
| "`read_page` says the field is 'Type here…'" | That's the placeholder. Probe `.value`. |
| "Enter will pick the highlighted option" | It pre-highlighted Argentina. Click the row. |
| "It's just a checkbox" | It was an arbitration agreement waiving his right to sue. |
| "He said yes to 3 days at the last company" | Different commute, different company. Ask again. |
| "I'll fill the iframe by coordinates" | You cannot read back what committed. Don't. |
| "Company-wide PATCH is fine, there's one row" | There were ten. Nine went false. |
| "The batch is waiting, I'll pick a sensible default" | Blank it and put it in the table. Jon answers it. |
| "He said 'looks good', that covers the batch" | Only rows he names by number get submitted. |

## Related

- `verifying-job-listings` — run first, always. 
- `one-application-per-company` — claim second, before any tailoring.
- `show-dont-say` — run over a letter before it goes out; replace self-labels with scenes.
- `documents/applications/screening-answers.md` — canonical recurring answers.
