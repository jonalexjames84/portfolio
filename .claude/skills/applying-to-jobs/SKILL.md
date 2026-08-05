---
name: applying-to-jobs
description: Use when filling or submitting a job application in Jon's Chrome browser via the claude-in-chrome tools — Greenhouse, Ashby, Lever, Y Combinator, LinkedIn Easy Apply, or any ATS form. Covers which tool to use per field type, the silent-failure modes that submit blank required fields, file uploads from the repo, and where to stop for a human.
---

# Applying To Jobs Through Chrome

## Overview

Filling an ATS form looks like typing into boxes. It is not. Every board in this
family is React, and **the tool that writes a value is not always the tool that
commits it.** A field can display your text, pass a visual check, and still
submit empty.

That happened twice in the session that produced this skill. Greenhouse's consent
combobox showed `Yes` with an empty hidden input behind it. Ashby's "How did you
find us?" showed 177 characters and the server rejected the submit as *Missing
entry for required field*. Both would have gone out broken if the only check was
a screenshot.

**Verify committed state, not rendered text.**

## Before You Touch A Form

1. Run the verifier on the URL. A page that loads is not a job that exists, and
   the canonical title it returns tells you whether the req is the one you
   queued. The executable is **`verify.ts`**, not the `verify.mjs` its own
   SKILL.md documents:
   ```bash
   .claude/skills/verifying-job-listings/verify.ts "<url>"
   ```
2. **Claim the role.** Stedi received three applications from three agents
   because nothing checked whether the job was already spoken for. One command,
   and it is binding — exit 1 means another agent holds this req, or the company
   already has an open application. **Do not open the form.** See
   `one-application-per-company`:
   ```bash
   .claude/skills/one-application-per-company/apply-guard.ts claim \
     --agent "$CLAUDE_AGENT_ID" --company "<name>" --role "<title>" --url "<url>"
   ```
3. Read the JD if the queue row is marked ⚠️ *JD not read*. Say plainly if Jon
   fails a stated requirement — Stedi wanted 2+ years of healthcare RCM he does
   not have. Flag it; do not quietly paper over it.
4. Pull the answers from the repo. Never invent a phone number, a LinkedIn slug,
   or a demographic answer.

| Field | Value | Source |
|---|---|---|
| Name | Jon Martin | — |
| Email | jonalexjames@gmail.com | — |
| Phone | (650) 627-6352 | `documents/resumes/resume-*.md` header |
| LinkedIn | https://www.linkedin.com/in/jonmartin-pm/ | confirmed by Jon 2026-08-05 |
| Location | Concord, CA, USA | — |
| Website | https://portfolio.jonnymartin.blog | — |
| Work auth | Yes / US citizen | `documents/applications/screening-answers.md` |
| Sponsorship | No | same |
| Resume | `documents/resumes/Jon Martin - Resume (AI Builder).pdf` | queue assigns the variant |
| Cover letter | `documents/applications/cover-letters/pdf/Jon Martin - Cover Letter ({Company}).pdf` | — |

`src/lib/experience.ts` and `Footer.tsx` carry an **older** LinkedIn URL
(`jon-martin-0b739316`). Do not use it.

## Tool Selection — The Core Table

This is the part that saves tokens and prevents silent failures.

| Field type | Use | Never use |
|---|---|---|
| Plain `<input type=text/email/tel>` | `form_input` | — |
| Native `<select>` | `form_input` (matches option text) | clicking through the list |
| **React combobox** (Greenhouse "Select…", Ashby dropdown) | click → type filter → **click the option** | `form_input` — sets display text, leaves the value empty |
| **Textarea in a React form** | click → `computer:type` | `form_input`, and the JS native-setter trick — Ashby ignores both |
| Radio / checkbox | `computer:left_click` on the ref | `form_input` |
| Autocomplete location | click → type → wait 2s → click the suggestion | typing alone; the free text does not commit |
| File upload | `file_upload` with the input's ref | clicking "Attach"/"Upload" — opens a native picker you cannot see |

### The textarea rule, stated plainly

`form_input` writes `el.value` and fires an event, but Ashby's form state does
not pick it up. Neither does the usual React native-setter bypass. **Both were
tried and both failed the server-side check.** What works:

```
computer:left_click  → the textarea ref
computer:key         → "cmd+a"
computer:type        → the full text
```

If a textarea already holds text you injected another way, you can commit it
without retyping: click into it, `cmd+ArrowDown` to the end, type a space, press
Backspace. The real keystroke makes the handler read the whole current value.

## Per-Platform Playbooks

### Greenhouse — `job-boards.greenhouse.io/{org}/jobs/{id}`

- Click **Apply** first. The form may already be in the DOM — `find` will happily
  return its "Submit application" button — but it is **hidden and unreachable
  until Apply is clicked**. Do not conclude the form is ready just because a JS
  query finds its fields.
- `read_page` **only returns elements near the viewport** on this board. Scroll
  the form into view first, then read; expect to read in 2–3 chunks as you go.
  A whole-page `read_page` will report 3 links and hide 34 inputs.
- `scrollIntoView()` does nothing on some boards (Sourcegraph). When a JS scroll
  leaves `read_page` returning the same 3 header links, fall back to
  `computer:scroll` in batches of 10 ticks.
- Field types vary **per board, not per platform**. "How did you hear about this
  position?" is a combobox on Webflow and a plain text input on Sourcegraph.
  Read the dump; do not assume.
- Fast field map without scrolling — dump ids and labels in one call:
  ```js
  [...document.querySelectorAll('input,select,textarea')].map((e,i)=>{
    const l=document.querySelector(`label[for="${e.id}"]`);
    return `${i}|${e.type||e.tagName}|${e.id}|req=${e.required?1:0}|${l?l.innerText:''}`
  }).join('\n')
  ```
- Every dropdown is a combobox backed by a **hidden required sentinel input with
  no id**. The sentinel is *removed from the DOM* once the dropdown commits a
  real value — so the count of remaining empties is exactly your count of
  unfilled dropdowns. Use this as a live progress meter:
  ```js
  (()=>{const f=document.forms[0];
    const bad=[...f.querySelectorAll('input,select,textarea')]
      .filter(e=>e.required&&!e.value&&e.type!=='file');
    return `valid=${f.checkValidity()} remainingEmpty=${bad.length}`})()
  ```
  **Do not panic at a nonzero count mid-fill** — it counts dropdowns you have
  not reached yet, not silent failures. Run it again after each selection and
  watch it tick down. Only a count that fails to drop after a selection means
  that selection did not commit.
- Read a dropdown's options without scrolling — filter to the *visible* listbox,
  or you get the 200-entry country/phone list instead:
  ```js
  [...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.trim())
  ```
- Preflight before submit: `document.forms[0].checkValidity()` plus a scan for
  empty required fields.
- **Some boards email an 8-character code to confirm you're human before the
  submit completes.** Stop there. See *Where To Stop*.

### Ashby — `jobs.ashbyhq.com/{org}/{id}`

- Append **`/application`** to the URL to land directly on the form. Skips the
  JD page and a click.
- No cover-letter upload. It asks free-text questions instead ("How did you find
  us?", "What interests you in working at X?"). Write these from the matching
  file in `cover-letters/`, condensed — do not paste the letter whole.
- Ignore the "Autofill from resume" file input at index 0; it is not the resume
  field.
- Type every textarea. See the textarea rule above. This is the board that
  taught it.
- The page scroll can be swallowed by a focused textarea. Use
  `javascript_tool: window.scrollBy(0,600)` rather than `computer:scroll`.
- On failure it renders a red *"Your form needs corrections"* banner naming the
  field, and **keeps everything else you entered** — fix only what it names and
  resubmit. It reports one missing field at a time.

### Y Combinator — `ycombinator.com/companies/{co}/jobs/{slug}`

- The header says "Log in" and the **Apply to role ›** link points at a
  Work at a Startup signup. Ignore both. Clicking the in-page **Apply to role**
  button opens a *"Get in touch directly with the team"* modal that needs **no
  account**.
- The modal is a portal — `read_page` picks it up, but `window.scrollBy` scrolls
  the page behind it, not the modal. Use refs and `scroll_to`.
- Fields: first, last, email, LinkedIn (required), country code + phone,
  location autocomplete, two radio pairs, resume upload, one free-text
  "What interests you about X?".
- Submit is labelled **Send Message**.
- **Guarded by an hCaptcha "I am human" checkbox.** Stop there.

### LinkedIn Easy Apply

- Search with the Easy Apply filter: `linkedin.com/jobs/search/?keywords=...&f_AL=true&location=...&sortBy=DD`
- List the results cheaply instead of screenshotting:
  ```js
  [...document.querySelectorAll('li[data-occludable-job-id]')]
    .map(li=>li.innerText.replace(/\s*\n\s*/g,' · ').slice(0,120)).join('\n')
  ```
- **Judge the pool before applying.** The Easy Apply set skews to staffing firms
  and mid-market SaaS, not seed–Series B AI/dev tools. Tell Jon when nothing fits
  rather than submitting filler under his name.
- It is a 3-step wizard: Contact info → Resume → optional "top choice" →
  Review → Submit. Progress % tells you where you are.
- Email is a native `<select>` of his verified addresses — `form_input` works.
  It defaults to `hello@jonnymartin.blog`; he wants `jonalexjames@gmail.com`.
- The stored resume goes stale. Check the "Uploaded on" date and re-upload the
  current PDF via the hidden file input rather than reusing it.
- Easy Apply sends **no cover letter**. That is the reason to prefer a real ATS
  link when both exist.

## File Uploads

`file_upload` accepts absolute paths inside the project directory — both the
resume and the cover-letter PDFs uploaded straight from
`/Users/jonathanmartin/Desktop/Claude Projects/portfolio/...`. No copying to a
scratch folder.

Get the ref from `find` ("resume and cover letter file input elements"), not from
a click. LinkedIn's is a *hidden* input behind an "Upload resume" label — `find`
still returns it.

Check the PDF before sending it. `resume-ai-builder.md` once carried the
repos/migrations/edge-functions bullet Jon banned:

```bash
python3 -c "
import re,zlib
d=open('<pdf>','rb').read(); t=''
for m in re.finditer(rb'stream\r?\n(.*?)endstream',d,re.S):
    try: t+=zlib.decompress(m.group(1)).decode('latin1')
    except: pass
print('HAS_REPO_STATS:', bool(re.search(r'15\+ repos|59 migrations|19 edge', t)))"
```

## Speed And Token Discipline

- **One tab per application.** Navigating away loses a filled form. Create tabs
  with `tabs_create_mcp` and park each completed form on its submit button.
- **Prefer `javascript_tool` dumps over screenshots** for reading form structure.
  One JS call replaces four scroll-and-screenshot rounds.
- **Batch with `browser_batch`** whenever you can predict two steps ahead — a
  click, a type, and a screenshot belong in one call. Two things it will not
  take: `tabs_create_mcp` (blocked), and **long multi-paragraph `type` text**,
  which reliably fails JSON parsing. Send each essay-length `type` as its own
  standalone `computer` call and batch the short steps around it.
- **Screenshot to confirm, not to explore.** Take one after a dropdown opens
  (you need option coordinates) and one before submit.
- `javascript_tool` refuses output that looks like cookies or query strings —
  a `JSON.stringify` of iframe `src` values trips it. Return a plain template
  string of counts instead.

## Where To Stop

Fill the form completely, then stop and hand back for these — they are not
yours to complete:

- **CAPTCHA of any kind.** Artisan's hCaptcha checkbox, reCAPTCHA challenges.
- **Emailed human-verification codes.** Webflow's Greenhouse form mails an
  8-character code and will not submit without it. Do not go read it out of
  Gmail — retrieving the code is completing the bot check.
- **Demographic questions** — gender, race, transgender experience, sexual
  orientation, age, disability, veteran status. Never answer these. They are
  Jon's to answer, and there is nothing in the repo that could tell you the
  answers anyway.

  Usually they are optional (Webflow, Artisan, Stedi) — leave them blank and
  move on. But **some boards mark them required** and the form will not validate
  without them (Sourcegraph marks Gender, Race/ethnicity, and Veteran Status
  with a red asterisk while the surrounding copy calls the survey "completely
  voluntary"). When that happens, do not pick something to unblock yourself.
  Each dropdown carries an **"I don't wish to answer"** option — surface that to
  Jon and let him choose between answering, declining, and having you select the
  decline option for him.
- **The submit click itself, unless Jon has approved that specific
  application.** He authorized browser automation and still wants per-application
  say over what goes out under his name.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Nobody else is applying to this one" | You cannot see the other sessions. Stedi got three applications that way. Claim it. |
| "It's a different role at the same company" | Still one company, still one slot. That is precisely how Stedi got three. |
| "The field shows my text" | Greenhouse showed `Yes` over an empty hidden input; Ashby showed 177 chars and the server said missing. |
| "`form_input` worked on the name field" | It works on plain inputs and native selects. It does not commit React comboboxes or Ashby textareas. |
| "I'll dispatch an input event from JS instead" | Tried on Ashby. Server still rejected it. Type the text. |
| "`read_page` returned everything" | It returns what is near the viewport. On Greenhouse that was 3 links out of 34 inputs. |
| "I'll click Attach and pick the file" | That opens a native dialog you cannot see and it blocks the session. |
| "The code is just in his inbox" | Fetching a human-verification code is completing a bot check. Hand it back. |
| "Easy Apply is fast, apply to a few" | Speed is not the goal. A bad-fit application still goes out under his name. |
| "I'll fill both forms in one tab" | Navigating away destroys the first form. One tab each. |
| "Screenshot after every action" | Use JS dumps for structure; screenshot for coordinates and final confirmation. |
| "`find` sees the Submit button, so the form is open" | Greenhouse keeps the form in the DOM but hidden until Apply is clicked. |
| "`remainingEmpty` is nonzero, something failed" | It counts dropdowns you have not filled yet. Re-run after each selection and watch it drop. |
| "The demographics are required, so I have to pick one" | Every one of them offers "I don't wish to answer." That choice is still Jon's. |
| "Webflow needed an email code, so this board will too" | Sourcegraph submitted with no code gate. Gates are per-board; find out by reaching the end. |

## Related

- `verifying-job-listings` — run first, always.
- `one-application-per-company` — claim the role second, before any tailoring.
  Also where to mark it `submitted` once Jon sends it, so the next agent sees it.
- `documents/applications/screening-answers.md` — canonical answers to the
  recurring questions, including the employment-gap narrative.
- `documents/applications/{date}-queue.md` — ranked queue, resume variant per
  role, and the apply links.
