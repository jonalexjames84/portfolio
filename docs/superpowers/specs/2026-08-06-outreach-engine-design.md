# Spec 2 — The Outreach Engine

**Date:** 2026-08-06
**Depends on:** Spec 1 (shares the approvals page and email digest).
**Overview:** `2026-08-06-job-search-os-overview-design.md`

## Problem

26 connections on file. Zero ever contacted. Zero referral-channel
applications, while 24 companies have a live application and 8 of them have a
contact already sitting in the table.

`generate-weekly-plan` creates `outreach` tasks. A task that says "reach out to
Sarah" and nothing else is a task that doesn't get done, because the work isn't
the reaching out — it's deciding what to say.

Referrals convert several times better than cold applications. This is the
highest-leverage unbuilt thing in the system.

## Goal

Every morning, drafted messages waiting for review — persistent enough to
actually get replies, disciplined enough that nobody gets burned.

## Warmth

Inferred, not asked. `inferWarmth(connection, experience)` cross-references the
contact's `company_name` against `src/lib/experience.ts`:

| Tier | Rule | Base score |
|---|---|---|
| `worked_together` | Company matches **and** date ranges overlap | 100 |
| `same_company` | Company matches, no date overlap | 70 |
| `second_degree` | Company is a target company, or shares an industry with Jon's record | 40 |
| `cold` | No connection found | 10 |

Modifiers: `+20` if `replied_at` is set; `+10` if `last_contact` is within 90
days; `−30` if a prior thread closed as `exhausted`; `0` (hard) if
`do_not_contact`.

`warmth_source` stores the reason in plain text — "overlapped at Jam City,
2018–2020" — so a wrong tier is obvious on sight and correctable in one edit.
Inference is decent; it cannot know who actually likes Jon. The first weekly
plan surfaces the tiers for a quick correction pass, but nothing blocks on it.

## Cadence

```
touch 1 (day 0) ──▶ touch 2 (day +5) ──▶ touch 3 (day +12) ──▶ closed(exhausted)
      │                    │                      │                     │
      └────────────────────┴──────────────────────┘                     ▼
                    any reply ──▶ closed(replied)              dormant 90 days
```

Three touches, then stop. Persistent without crowding.

```sql
job_outreach_threads (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references job_connections(id),
  company_key   text,
  purpose       text not null,
  state         text not null default 'open',
  touch_count   int  not null default 0,
  started_at    timestamptz default now(),
  last_touch_at timestamptz,
  replied_at    timestamptz,
  closed_at     timestamptz,
  close_reason  text
);

-- One open thread per contact. Ever. Enforced by the database.
create unique index job_outreach_one_open_per_contact
  on job_outreach_threads (connection_id) where state = 'open';

job_outreach_messages (
  id           uuid primary key default gen_random_uuid(),
  thread_id    uuid not null references job_outreach_threads(id),
  touch_number int  not null,
  channel      text not null check (channel in ('email','linkedin')),
  subject      text,
  body         text not null,
  value_hook   text not null,
  state        text not null default 'drafted',
  due_date     date not null,
  sent_at      timestamptz
);
```

## Burn guards

All four are enforced at **draft time**. A message that should not exist is
never written, rather than written and withheld — there is no queue of
almost-sent messages to leak.

**Stop instantly on any reply.** Any `replied_at` closes the thread
permanently, including "not right now." A bot never follows a human reply. The
draft cron's first action each run is to close threads whose connection has a
newer `replied_at` than `last_touch_at`.

**One thread per contact, ever.** The partial unique index above. Application
logic can be wrong; a constraint cannot. This is the Stedi lesson applied to
people, where the cost of getting it wrong is higher.

**Every follow-up carries a new value hook.** `value_hook` is `not null`. The
generation prompt must produce a distinct, concrete hook per touch — something
Jon built, a piece of the company's news, a relevant post. If the model cannot
find one, it returns `null` and **no draft is generated**; the thread stalls
until there is something worth saying. "Just bumping this" is not a message,
it's an imposition.

**Global weekly cap.** `OUTREACH_WEEKLY_CAP`, a module constant set to 10 new
threads per week (Spec 4 moves it into `job_search_config` with this same
value). With 26 untouched contacts the backlog drips over three
weeks instead of detonating in one morning. Follow-ups on open threads do not
count against the cap — finishing a conversation is not new outreach.

## `draft-outreach` (06:30 daily)

1. Close threads with new replies.
2. Close threads at `touch_count = 3` past their window →
   `close_reason = 'exhausted'`, set `dormant_until = now() + 90 days`.
3. Emit follow-ups: open threads whose next touch is due today.
4. Open new threads, warmest-first, up to the weekly cap — skipping
   `do_not_contact`, anyone dormant, and anyone with an open thread.
5. Generate each message with `claude-opus-5`.

### Generation

Context per message: the contact, warmth tier and its source, the company, any
live application at that company, the thread's prior touches, and Jon's voice.

Voice is load-bearing and already documented: warm, funny, self-deprecating,
conversational. **Never corporate or pitch-deck-y in a DM.** A message that
reads like a cover letter is worse than no message. The prompt carries this
explicitly and the review queue is where it gets caught.

NDA rules apply in full. No client names, no contract values, no coworker
names, no bug counts. Memorang customers are described generically.

Channel: `email` when an address is on file, otherwise `linkedin`. LinkedIn has
no API and its ToS forbids automation — those messages are drafted for
copy-paste, and the system never touches the site.

## Review

Drafts appear in two places, per the chosen delivery:

**`/job-search/outreach`** — grouped by thread so the whole arc is visible at
once, which is how you tell whether touch 3 has earned its place. Per message:
**Approve** (marks ready, copies to clipboard), **Edit**, **Skip**, and **Close
thread** for "this person is not the right ask."

**The 09:00 email** — drafts inline with copy buttons and a link to the queue.

Marking a message sent is manual and honest: Jon sends it, then marks it. The
system records `sent_at` and schedules the next touch from that timestamp, not
from the draft date — so a message sent three days late doesn't compress the
cadence.

## Migration

`20260806000002_job_outreach.sql` — creates both tables and the partial unique
index; adds `warmth_tier`, `warmth_score`, `warmth_source`, `do_not_contact`,
`dormant_until` to `job_connections`; backfills warmth for all 26 rows.

## Tests

`outreach-cadence.test.ts` — due-date arithmetic across all three touches; a
reply at any touch closes the thread; a closed thread never re-opens; the
partial index rejects a second open thread; the weekly cap counts new threads
only; a null value hook suppresses the draft; dormancy expires at 90 days.

`warmth.test.ts` — each tier from real `experience.ts` data; overlapping vs
non-overlapping dates; modifier stacking; `do_not_contact` overrides everything.

## Non-goals

- Sending anything. The system drafts; Jon sends.
- LinkedIn automation.
- Finding new contacts. This works the existing 26 and whoever gets added by
  hand. Sourcing is a different problem.

## Success

Ten drafted messages in the first week, each one Jon would actually send. A
reply. Then a referral-channel application — the first one this system has ever
produced.
