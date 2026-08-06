# Spec 3 — The In-Person Layer

**Date:** 2026-08-06
**Depends on:** Spec 2 (warmth tiers; thread state).
**Overview:** `2026-08-06-job-search-os-overview-design.md`

## Problem

Digital outreach opens doors. Coffee closes them. But "go to more events" is
advice, not a system — it fails on the two questions that actually matter:
*which* event, and *who* do I already know who might be there.

The same applies to old coworkers. Jon has 15 years of them. Nothing in the
system suggests seeing any of them in person.

## Goal

Every Monday: three named people worth getting coffee with, warmest first, with
a reason and an opener — plus any events in the next two weeks worth the
evening, ranked by who from the network might be there.

## Coffee suggestions

Generated inside `generate-weekly-plan` (Mon 06:00). Three per week, ranked by
`warmth_score`, excluding:

- anyone with an **open outreach thread** — do not ask for coffee mid-sequence;
  it reads as pressure and it muddies which channel got the reply
- `do_not_contact` and anyone dormant
- anyone seen in the last 60 days

Each suggestion carries the warmth source ("overlapped at Jam City, 2018–2020"),
what they're doing now if known, why now, and a two-sentence opener in Jon's
voice. The opener is a draft like any other — reviewed, never sent.

A coffee ask **opens an outreach thread** at touch 1 with
`purpose = 'coffee'`. It runs the same cadence and the same burn guards. The
in-person track is not a loophole around the messaging discipline; it's a
different ask on the same rails.

## Event discovery

Weekly cron, Monday 05:30, before the plan generates.

Search via `web_search_20260209` on `claude-opus-5` — dynamic filtering is built
into that tool version, so no separate `code_execution` tool is declared.
Queries target Luma, Meetup, Eventbrite, and SF-area tech calendars for AI, PM,
and gaming events in the next 14 days.

```sql
job_networking_events (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  url                text not null unique,
  starts_at          timestamptz,
  venue              text,
  city               text,
  source             text,
  relevance_score    int,
  relevance_reason   text,
  suggested_contacts jsonb,
  state              text not null default 'suggested',
  created_at         timestamptz default now()
)
```

Relevance scores on: topical fit with Jon's targets (AI/ML, dev tools, SaaS,
consumer, gaming); whether target companies are hosting or sponsoring; whether
any known contact's company is involved; and travel cost from the Bay Area.
Only events scoring above a threshold surface. Dedupe on `url`.

`suggested_contacts` holds contacts whose company or domain overlaps the event —
the answer to "who do I already know who might be there."

**Event data is unreliable and the system says so.** Scraped listings go stale,
dates move, some results won't be events at all. Every card links to the source
and is labeled unverified. Nothing auto-adds to a calendar. Low-confidence
results are shown as such rather than filtered silently, because a filtered
result looks like an empty week.

Dismissing an event records the reason. Dismissal reasons tune future relevance
scoring, and they feed the retrospective in Spec 4.

## Surfacing

**Monday email** — the three coffee suggestions with openers, then up to three
events with their contact matches.

**`/job-search/network`** — extended with a "This week" panel: suggestions,
events, and any in-person meeting already scheduled.

Marking a coffee as *happened* logs it against the connection, resets the
60-day cooldown, and prompts for a one-line debrief. That debrief is the input
the retrospective needs to tell whether in-person time is converting.

## Migration

`20260806000003_job_networking_events.sql` — creates the table; adds
`last_in_person_at` to `job_connections`.

## Tests

`coffee-suggestions.test.ts` — ranks by warmth; excludes open threads,
dormant, `do_not_contact`, and the 60-day window; returns fewer than three
without error when the pool is thin (a short list is honest, padding is not).

`event-relevance.test.ts` — scoring across topical fit, target-company
involvement, and contact overlap; dedupe on URL; sub-threshold events are
withheld from the plan but retained in the table.

## Non-goals

- Booking anything. No calendar writes, no invites.
- Paid or ticketed event handling.
- Sourcing new contacts from event attendee lists.

## Success

Jon has coffee with someone he hasn't spoken to in two years, because the
system put the name in front of him with a reason and an opener on a Monday
morning.
