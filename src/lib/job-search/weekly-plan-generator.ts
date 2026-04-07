import type { TaskCategory, TaskImpact, TaskSource } from "./types";

export interface PlanInput {
  weekStartDate: string; // Monday
  interviews: Array<{ id: string; company: string; role: string; date: string }>;
  stalePipelineEntries: Array<{ id: string; company: string; daysSinceUpdate: number }>;
  newScoredJobs: Array<{ id: string; company: string; role: string; score: number }>;
  staleConnections: Array<{ id: string; name: string; company: string | null }>;
  targetCompanyBacklog: Array<{ id: string; company: string }>;
  carriedOverHighImpact: Array<{
    id: string;
    task: string;
    category: TaskCategory;
    company: string | null;
  }>;
}

export interface GeneratedTask {
  date: string;
  category: TaskCategory;
  task: string;
  company: string | null;
  link: string | null;
  impact: TaskImpact;
  probability_lift: number;
  source: TaskSource;
  carried_over: boolean;
}

const DAY_CAP = 5;
const WEEK_CAP = 25;
const MIN_PROBABILITY_LIFT = 3;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function weekdayDates(weekStartDate: string): string[] {
  return [0, 1, 2, 3, 4].map((i) => addDays(weekStartDate, i));
}

export function generateWeeklyPlan(input: PlanInput): GeneratedTask[] {
  const candidates: GeneratedTask[] = [];

  // 1. Carry-forward high-impact tasks → Monday
  for (const c of input.carriedOverHighImpact) {
    candidates.push({
      date: input.weekStartDate,
      category: c.category,
      task: c.task,
      company: c.company,
      link: null,
      impact: "high",
      probability_lift: 9,
      source: "stale_pipeline",
      carried_over: true,
    });
  }

  // 2. Interview prep — pinned to interview_date - 1
  for (const iv of input.interviews) {
    const prepDate = addDays(iv.date, -1);
    candidates.push({
      date: prepDate,
      category: "prep",
      task: `Prep for ${iv.company} interview (${iv.role})`,
      company: iv.company,
      link: null,
      impact: "high",
      probability_lift: 10,
      source: "interview_prep",
      carried_over: false,
    });
  }

  // 3. Apply to new top-scored jobs
  for (const job of input.newScoredJobs) {
    const isHigh = job.score >= 80;
    candidates.push({
      date: "", // assigned later
      category: "apply",
      task: `Apply: ${job.role} — ${job.company}`,
      company: job.company,
      link: null,
      impact: isHigh ? "high" : "medium",
      probability_lift: isHigh ? 8 : 4,
      source: "apply_new_job",
      carried_over: false,
    });
  }

  // 4. Stale pipeline follow-ups
  for (const stale of input.stalePipelineEntries) {
    candidates.push({
      date: "",
      category: "follow_up",
      task: `Follow up with ${stale.company} (${stale.daysSinceUpdate}d since last touch)`,
      company: stale.company,
      link: null,
      impact: "high",
      probability_lift: 7,
      source: "stale_pipeline",
      carried_over: false,
    });
  }

  // 5. Stale connection outreach
  for (const conn of input.staleConnections) {
    candidates.push({
      date: "",
      category: "outreach",
      task: `Reach out to ${conn.name}${conn.company ? ` (${conn.company})` : ""}`,
      company: conn.company,
      link: null,
      impact: "medium",
      probability_lift: 5,
      source: "outreach",
      carried_over: false,
    });
  }

  // 6. Backlog outreach (lowest priority)
  for (const tc of input.targetCompanyBacklog) {
    candidates.push({
      date: "",
      category: "outreach",
      task: `New outreach to ${tc.company}`,
      company: tc.company,
      link: null,
      impact: "medium",
      probability_lift: 3,
      source: "backlog",
      carried_over: false,
    });
  }

  // Prune by minimum probability_lift
  const pruned = candidates.filter((t) => t.probability_lift >= MIN_PROBABILITY_LIFT);

  // Pinned tasks (already have a date) keep theirs; unpinned will be assigned
  const pinned = pruned.filter((t) => t.date !== "");
  const unpinned = pruned.filter((t) => t.date === "");

  // Sort unpinned by probability_lift desc
  unpinned.sort((a, b) => b.probability_lift - a.probability_lift);

  // Track day fill counts
  const days = weekdayDates(input.weekStartDate);
  const fill: Record<string, number> = {};
  for (const d of days) fill[d] = 0;
  for (const t of pinned) fill[t.date] = (fill[t.date] || 0) + 1;

  // Distribute unpinned across days, day-cap aware
  for (const t of unpinned) {
    const target = days.find((d) => fill[d] < DAY_CAP);
    if (!target) break; // all days full
    t.date = target;
    fill[target]++;
  }

  // Combine
  const combined = [...pinned, ...unpinned.filter((t) => t.date !== "")];

  // Apply week cap (25 max), keep highest probability_lift
  combined.sort((a, b) => b.probability_lift - a.probability_lift);
  return combined.slice(0, WEEK_CAP);
}
