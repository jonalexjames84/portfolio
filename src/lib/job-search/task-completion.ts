/**
 * Ticking an apply task should move the role, not just grey out a line.
 *
 * Before this existed, `/api/job-search/tasks/[id]/complete` flipped `done` and
 * stopped there. Jon could check "Apply to Zynga" off his list and the pipeline
 * still read `saved`, so the board, the funnel and every metric derived from
 * status disagreed with what had actually happened — and the only way to fix it
 * was to go find the row and change a dropdown by hand.
 *
 * The rules live here rather than in the route because the interesting part is
 * *when not to act*: a stale task must never drag a live interview backwards.
 */

/** Statuses that mean the application is out in the world already. */
const AT_OR_PAST_APPLIED = ["applied", "screen", "interview", "offer", "rejected"];

export interface PipelineEffectInput {
  /** The task's category. Only `apply` tasks move a pipeline row. */
  category: string;
  /** The task's state *after* the toggle. */
  done: boolean;
  /** Current status of the matched pipeline row, or null when nothing matched. */
  entryStatus: string | null;
  /** Local date, for stamping `applied_date`. */
  today: string;
}

export interface PipelineEffect {
  status: "applied" | "saved";
  applied_date: string | null;
}

/**
 * What should happen to the pipeline row, or null to leave it untouched.
 *
 * Deliberately conservative in both directions:
 * - Ticking only promotes a row that is still `saved`. Re-ticking an old task
 *   cannot pull a role that reached `screen` back down to `applied`.
 * - Un-ticking only demotes a row that is exactly `applied`. Once a real human
 *   signal has landed, an accidental un-tick must not erase it.
 */
export function resolvePipelineEffect({
  category,
  done,
  entryStatus,
  today,
}: PipelineEffectInput): PipelineEffect | null {
  if (category !== "apply") return null;
  if (!entryStatus) return null;

  if (done) {
    if (AT_OR_PAST_APPLIED.includes(entryStatus)) return null;
    return { status: "applied", applied_date: today };
  }

  if (entryStatus !== "applied") return null;
  return { status: "saved", applied_date: null };
}
