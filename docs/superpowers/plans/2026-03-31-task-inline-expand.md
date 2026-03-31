# Task Inline Expand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace click-to-toggle-done with inline expand cards showing task details, notes, and action buttons (Mark Done, Open Link, Snooze).

**Architecture:** Add `notes` column to Supabase, create a snooze API endpoint, and refactor TaskList.tsx to support expand/collapse with separated checkbox and row click targets.

**Tech Stack:** Next.js App Router, Supabase, React (client component), framer-motion, Tailwind CSS, lucide-react icons.

---

### Task 1: Add `notes` column to Supabase

**Files:**
- None (Supabase migration via MCP tool)

- [ ] **Step 1: Run the migration**

Use the Supabase MCP tool to run:

```sql
ALTER TABLE job_daily_tasks ADD COLUMN notes text;
```

- [ ] **Step 2: Verify the column exists**

Use the Supabase MCP tool to run:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'job_daily_tasks' AND column_name = 'notes';
```

Expected: one row showing `notes | text`.

- [ ] **Step 3: Commit**

No file changes — this is a DB-only migration. Move to next task.

---

### Task 2: Create snooze API endpoint

**Files:**
- Create: `src/app/api/job-search/tasks/[id]/snooze/route.ts`

- [ ] **Step 1: Create the snooze route**

Create `src/app/api/job-search/tasks/[id]/snooze/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_daily_tasks")
    .update({ date: tomorrowStr })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}
```

- [ ] **Step 2: Verify endpoint works**

Start the dev server and test with curl:

```bash
# Get a task ID first
curl -s http://localhost:3000/api/job-search/tasks?date=$(date +%Y-%m-%d) \
  -H "Cookie: job_search_auth=jon-job-search-2026" | jq '.tasks[0].id'

# Test snooze (use the ID from above)
curl -s -X POST http://localhost:3000/api/job-search/tasks/<ID>/snooze \
  -H "Cookie: job_search_auth=jon-job-search-2026"
```

Expected: response with updated task, `date` set to tomorrow.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/tasks/\[id\]/snooze/route.ts
git commit -m "feat: add snooze endpoint for job search tasks"
```

---

### Task 3: Refactor TaskList.tsx — expand/collapse with separated click targets

**Files:**
- Modify: `src/components/job-search/TaskList.tsx`

This is the main task. The full component is rewritten to support:
1. `expandedId` state for tracking which task is open
2. Checkbox click (stopPropagation) toggles done without expanding
3. Row click toggles expand/collapse (one at a time)
4. Expanded card shows company, notes, blocked status, and action buttons
5. Snooze removes the task from the list optimistically
6. Mark Done from card toggles done and collapses

- [ ] **Step 1: Update the Task type**

In `src/components/job-search/TaskList.tsx`, update the `Task` type to include `notes`:

```typescript
type Task = {
  id: string;
  task: string;
  category: string;
  impact: string;
  company: string | null;
  link: string | null;
  date: string;
  done: boolean;
  blocked_by: string | null;
  is_blocked: boolean;
  notes: string | null;
};
```

- [ ] **Step 2: Add expandedId state and snooze handler**

Add these to the component body, after the existing state declarations:

```typescript
const [expandedId, setExpandedId] = useState<string | null>(null);

function toggleExpand(id: string) {
  setExpandedId((prev) => (prev === id ? null : id));
}

async function snoozeTask(id: string) {
  // Optimistically remove from list
  setTasks((prev) => prev.filter((t) => t.id !== id));
  setExpandedId(null);
  await fetch(`/api/job-search/tasks/${id}/snooze`, { method: "POST" });
}
```

- [ ] **Step 3: Update toggleComplete to collapse card after marking done**

Replace the existing `toggleComplete` function:

```typescript
async function toggleComplete(id: string) {
  const task = tasks.find((t) => t.id === id);
  if (!task || task.is_blocked) return;

  const newDone = !task.done;
  setTasks((prev) =>
    prev.map((t) => {
      if (t.id === id) return { ...t, done: newDone };
      if (t.blocked_by === id) return { ...t, is_blocked: !newDone };
      return t;
    })
  );
  // Collapse card when marking done from the card buttons
  if (newDone && expandedId === id) {
    setExpandedId(null);
  }
  await fetch(`/api/job-search/tasks/${id}/complete`, { method: "POST" });
}
```

- [ ] **Step 4: Replace the task row rendering**

Replace the entire `{tasks.map((task) => (...))}` block inside `<AnimatePresence>` with the new version that separates checkbox click from row click and renders the expanded card:

```tsx
{tasks.map((task) => {
  const isExpanded = expandedId === task.id;
  return (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all overflow-hidden ${
        isExpanded
          ? "border-teal-500 dark:border-teal-600 shadow-md"
          : task.is_blocked
            ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-50"
            : task.done
              ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-60"
              : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700"
      }`}
    >
      {/* Header row */}
      <div
        className={`flex items-start gap-3 p-3 cursor-pointer ${
          isExpanded ? "border-b border-zinc-100 dark:border-zinc-800" : ""
        }`}
        onClick={() => !task.is_blocked && toggleExpand(task.id)}
      >
        <div
          className="mt-0.5 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(task.id);
          }}
        >
          {task.is_blocked ? (
            <Lock className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          ) : task.done ? (
            <CheckCircle2 className="h-5 w-5 text-teal-500" />
          ) : (
            <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600 hover:text-teal-400 transition-colors" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{categoryEmoji[task.category]}</span>
            <span className={`text-sm font-medium ${task.done ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
              {task.task}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-7 mt-0.5">
            {task.company && (
              <span className="text-xs text-zinc-500">{task.company}</span>
            )}
            {task.is_blocked && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400">
                <Lock className="h-3 w-3" />
                do {tasks.find((t) => t.id === task.blocked_by)?.task.split(" ").slice(0, 4).join(" ") || "prerequisite"} first
              </span>
            )}
            {!task.is_blocked && isFromPastDay(task) && !task.done && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                rolled over
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${impactStyles[task.impact]}`}>
            {task.impact}
          </span>
          {task.link && !isExpanded && (
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-teal-500 hover:text-teal-600"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Expanded card body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Company */}
              {task.company && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Company</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{task.company}</span>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                  <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Notes</div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{task.notes}</div>
                </div>
              )}

              {/* Blocked indicator */}
              {task.is_blocked && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    Blocked by: <strong>{tasks.find((t) => t.id === task.blocked_by)?.task || "prerequisite"}</strong>
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(task.id);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    task.done
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {task.done ? "Undo" : "Mark Done"}
                </button>
                {task.link && (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Link
                  </a>
                )}
                {!task.done && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snoozeTask(task.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Snooze
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
})}
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000/dashboard/job-search` (with auth cookie). Verify:
- Clicking a task row expands it into the detail card
- Clicking the checkbox toggles done without expanding
- Only one card is expanded at a time
- Mark Done button works and collapses the card
- Open Link opens in new tab
- Snooze removes the task from the list
- Expand/collapse animates smoothly

- [ ] **Step 6: Commit**

```bash
git add src/components/job-search/TaskList.tsx
git commit -m "feat: inline expand task cards with notes, actions, and snooze"
```
