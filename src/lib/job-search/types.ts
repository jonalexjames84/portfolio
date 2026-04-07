export type PipelineStatus =
  | "saved"
  | "applied"
  | "screen"
  | "interview"
  | "offer"
  | "rejected"
  | "passed";

export type TaskCategory =
  | "apply"
  | "outreach"
  | "follow_up"
  | "content"
  | "linkedin_post"
  | "prep"
  | "admin";

export type TaskImpact = "high" | "medium" | "low";

export type TaskSource =
  | "interview_prep"
  | "stale_pipeline"
  | "apply_new_job"
  | "outreach"
  | "backlog";

export interface PipelineEntry {
  id: string;
  company: string;
  role: string;
  status: PipelineStatus;
  created_at: string;
  applied_date: string | null;
  last_update: string;
  job_url: string | null;
  fit_score: number | null;        // manual override
  fit_score_auto: number;          // computed
  score_breakdown: ScoreBreakdown | null;
  jd_text: string | null;
  industry: string | null;
  stage: string | null;
  location: string | null;
  interview_date: string | null;
  notes: string | null;
}

export interface ScoreBreakdown {
  title_match: number;
  seniority_fit: number;
  keyword_match: number;
  industry_fit: number;
  stage_fit: number;
  red_flags: number;
}

export interface DailyTask {
  id: string;
  date: string;
  category: TaskCategory;
  task: string;
  company: string | null;
  link: string | null;
  impact: TaskImpact;
  probability_lift: number;
  source: TaskSource | null;
  blocked_by: string | null;
  carried_over: boolean;
  done: boolean;
}

export interface Connection {
  id: string;
  name: string;
  company_name: string | null;
  outreach_stage: string | null;
  referral_status: string | null;
  last_contact: string | null;
  replied_at: string | null;
  next_action: string | null;
}

export interface WeeklyMetricsRow {
  week_start: string;
  applications_sent: number;
  outreach_sent: number;
  follow_ups_sent: number;
  linkedin_posts: number;
  conversations: number;
  phone_screens: number;
  interviews: number;
  offers: number;
  response_rate: number;
  active_pipeline_count: number;
  interviews_completed: number;
}
