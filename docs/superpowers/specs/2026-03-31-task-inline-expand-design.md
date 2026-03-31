# Task Inline Expand — Design Spec

## Problem

Clicking a task in the job search dashboard toggles it done and it fades out. Tasks should instead expand inline into detail cards with context and action buttons, like a lightweight task tracker.

## Solution

Replace the current "click to toggle done" behavior with an inline expand/collapse card. The checkbox remains separate for toggling done status.

## Data Model Change

Add a `notes` text column to `job_daily_tasks` in Supabase:

```sql
ALTER TABLE job_daily_tasks ADD COLUMN notes text;
```

## Interaction Model

- **Click anywhere on the task row** (except the checkbox) → expand/collapse the card
- **Click the circle checkbox** → toggle done status (does not expand)
- **Only one card expanded at a time** — expanding a new card collapses the current one
- **Mark Done button** inside card → toggles done and collapses the card
- **Open Link button** → opens `task.link` in a new tab (only shown when link exists)
- **Snooze button** → moves the task to tomorrow (updates `date` to tomorrow's date), collapses card, removes from today's list

## Expanded Card Layout

```
┌─────────────────────────────────────────────────┐
│ ○  📝  Apply to Anthropic PM role        [high] │  ← header (same as collapsed row)
│─────────────────────────────────────────────────│
│  Company: Anthropic                              │
│                                                  │
│  ┌─ Notes ────────────────────────────────────┐  │
│  │ Strong match — they want PMs who build     │  │
│  │ with AI tools. Tailor cover letter...      │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  🔒 Blocked by: Update resume for AI roles       │  ← only when blocked
│                                                  │
│  [✓ Mark Done]  [↗ Open Link]  [→ Snooze]       │
└─────────────────────────────────────────────────┘
```

## Components Changed

### `src/components/job-search/TaskList.tsx`

- Add `expandedId` state (string | null) — tracks which task is expanded
- Split click handler: checkbox area → `toggleComplete`, rest of row → `toggleExpand`
- Add expanded card section rendered conditionally below the header row when `expandedId === task.id`
- Add `snoozeTask` function that PATCHes the task date to tomorrow
- Show notes field (read-only) when `task.notes` exists
- Animate expand/collapse with framer-motion `AnimatePresence` + height animation

### `src/app/api/job-search/tasks/[id]/snooze/route.ts` (new)

- POST endpoint that updates the task's `date` to tomorrow
- Uses same auth pattern as the complete endpoint (no Bearer required — cookie auth via middleware)

### Task type update

Add `notes: string | null` to the Task type in TaskList.tsx.

## Styling

- Expanded card: teal border (`border-teal-500`), subtle shadow
- Notes block: gray background (`bg-zinc-50 dark:bg-zinc-800`), rounded
- Blocked indicator: amber background, lock icon
- Buttons: Mark Done (teal filled), Open Link (blue outline), Snooze (gray outline)
- Smooth height animation on expand/collapse via framer-motion `layout` + `AnimatePresence`

## What's NOT in scope

- Editing task name or notes from the card (read-only for now)
- Drag-to-reorder tasks
- Adding new tasks from the UI
- Any changes to the email templates
