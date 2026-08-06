export const dynamic = "force-dynamic";

import Link from "next/link";
import { HubNav } from "@/components/job-search/HubNav";
import { LeakFunnel } from "@/components/job-search/LeakFunnel";
import { LeverCard } from "@/components/job-search/LeverCard";
import { StopDoing } from "@/components/job-search/StopDoing";
import { ThesisBand } from "@/components/job-search/ThesisBand";
import { supabase } from "@/lib/supabase";
import { normalizeCompany } from "@/lib/job-search/application-guard";
import { localDateStr } from "@/lib/job-search/dates";
import { buildFunnel } from "@/lib/job-search/funnel";
import {
  buildStrategy,
  isOnThesis,
  THESIS,
  type StrategyInput,
} from "@/lib/job-search/strategy";
import type { PipelineStatus } from "@/lib/job-search/types";

/**
 * Whether the search is being run well, as opposed to run hard.
 *
 * The dashboard next door measures `applications_sent` against a target, so its
 * answer to twelve applications and zero interviews is: send more. This page
 * asks the question the Job Search OS actually poses — is the machine
 * converting, where does it leak, and what should stop — and it grades the five
 * principles in `job-search-os/CLAUDE.md` against the data.
 *
 * All the judgment lives in `strategy.ts` as pure functions. This file fetches
 * and renders, which is the same split `funnel.ts` and `next-actions.ts` use.
 */

async function loadStrategy(): Promise<StrategyInput> {
  const [
    pipelineRes,
    ledgerRes,
    connectionsRes,
    targetsRes,
    materialsRes,
    interviewsRes,
  ] = await Promise.all([
    supabase
      .from("job_pipeline_entries")
      .select("id, status, fit_score, fit_score_auto, industry, stage, channel, company_key"),
    supabase
      .from("job_applications")
      .select("pipeline_entry_id, company, company_key, status"),
    supabase.from("job_connections").select("id, company_name, last_contact"),
    supabase.from("job_target_companies").select("id", { count: "exact", head: true }),
    supabase.from("job_materials").select("type"),
    supabase.from("job_interviews").select("id, key_improvement"),
  ]);

  if (pipelineRes.error) {
    throw new Error(`Could not load the pipeline: ${pipelineRes.error.message}`);
  }

  const entries = pipelineRes.data || [];
  const ledger = ledgerRes.data || [];
  const connections = connectionsRes.data || [];
  const materials = materialsRes.data || [];
  const interviews = interviewsRes.data || [];

  const scoreOf = (e: { fit_score: number | null; fit_score_auto: number | null }) =>
    e.fit_score ?? e.fit_score_auto ?? null;

  const byId = new Map(entries.map((e) => [e.id, e]));

  // ---- the ledger is the record that an application happened -------------
  // Pipeline `status` is not it: a row can read `applied` with nothing in the
  // ledger, which is exactly how Stedi took three applications unnoticed.
  const live = ledger.filter(
    (a) => a.status === "prepared" || a.status === "submitted",
  );
  const submitted = ledger.filter((a) => a.status === "submitted");
  const preparedUnsent = ledger.filter((a) => a.status === "prepared").length;

  const liveCompanyKeys = new Set(
    live.map((a) => a.company_key || normalizeCompany(a.company)).filter(Boolean),
  );

  // ---- contacts, matched to companies with a live application ------------
  // normalizeCompany so the contact list's spelling need not agree with the
  // job board's.
  let contactsAtLiveCompanies = 0;
  let contactsWorkedAtLiveCompanies = 0;
  const contactCompanyKeys = new Set<string>();
  const workedCompanyKeys = new Set<string>();

  for (const c of connections) {
    if (!c.company_name) continue;
    const key = normalizeCompany(c.company_name);
    if (!key || !liveCompanyKeys.has(key)) continue;
    contactsAtLiveCompanies += 1;
    contactCompanyKeys.add(key);
    if (c.last_contact) {
      contactsWorkedAtLiveCompanies += 1;
      workedCompanyKeys.add(key);
    }
  }

  // ---- what was applied to ------------------------------------------------
  const liveEntries = live
    .map((a) => (a.pipeline_entry_id ? byId.get(a.pipeline_entry_id) : null))
    .filter(Boolean) as typeof entries;

  const liveScores = liveEntries
    .map(scoreOf)
    .filter((s): s is number => s !== null);
  const avgScoreApplied =
    liveScores.length > 0
      ? Math.round(liveScores.reduce((a, b) => a + b, 0) / liveScores.length)
      : null;

  const submittedEntries = submitted
    .map((a) => (a.pipeline_entry_id ? byId.get(a.pipeline_entry_id) : null))
    .filter(Boolean) as typeof entries;

  const onThesisApplied = submittedEntries.filter((e) =>
    isOnThesis(e.industry, e.stage),
  ).length;
  const referralApplied = submittedEntries.filter(
    (e) => e.channel === "referral",
  ).length;

  // ---- the backlog --------------------------------------------------------
  // Qualified means on-thesis *and* scoring, in both places it is counted. Two
  // different definitions of "worth acting on" on one page — one in the funnel,
  // one in the precision lever — read as a contradiction rather than as two
  // measurements.
  const qualifies = (e: (typeof entries)[number]) => {
    const s = scoreOf(e);
    return s !== null && s >= THESIS.worthActingOn && isOnThesis(e.industry, e.stage);
  };

  const saved = entries.filter((e) => e.status === "saved");
  const qualifiedUntouched = saved.filter(qualifies).length;

  // Company-scoped, so it sits in the same units as `companiesApplied` below.
  // Counting roles here and companies there is what made the chain read as
  // though 24 applications came out of 20 opportunities.
  const qualifiedCompanies = new Set(
    entries.filter(qualifies).map((e) => e.company_key).filter(Boolean),
  ).size;

  const activeStatuses: PipelineStatus[] = ["screen", "interview", "offer"];
  const active = entries.filter((e) =>
    activeStatuses.includes(e.status as PipelineStatus),
  ).length;

  const countOf = (status: PipelineStatus) =>
    entries.filter((e) => e.status === status).length;

  // A work product is neither a resume nor a cover letter — those two are the
  // artifacts every candidate sends. Counted by exclusion so a new type added
  // by a skill lands on the right side without a code change here.
  const workProducts = materials.filter(
    (m) => m.type !== "resume" && m.type !== "cover_letter",
  ).length;

  return {
    contactsAtLiveCompanies,
    contactsWorkedAtLiveCompanies,
    totalConnections: connections.length,
    totalContacted: connections.filter((c) => c.last_contact).length,

    avgScoreApplied,
    qualifiedUntouched,
    savedCount: saved.length,

    workProducts,
    companiesApplied: liveCompanyKeys.size,

    funnel: buildFunnel({
      applications: submitted.length,
      screens: countOf("screen"),
      interviews: countOf("interview"),
      offers: countOf("offer"),
    }),
    applicationsSubmitted: submitted.length,

    interviewsLogged: interviews.length,
    interviewsDebriefed: interviews.filter((i) => i.key_improvement).length,

    targetsTracked: targetsRes.count || 0,
    qualifiedCompanies,
    // Companies where somebody inside has actually heard from Jon — not
    // companies where a contact merely exists on the list. `contactCompanyKeys`
    // is the weaker version and is deliberately not what the funnel counts.
    referralPathBuilt: workedCompanyKeys.size,
    active,
    interviews: interviews.length,

    preparedUnsent,
    onThesisApplied,
    referralApplied,
  };
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default async function StrategyPage() {
  const input = await loadStrategy();
  const report = buildStrategy(input);
  const today = localDateStr(new Date());
  const moveKeys = new Set(report.moves.map((m) => m.key));
  const rest = report.levers.filter((l) => !moveKeys.has(l.key));

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Strategy
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Whether the search is being run well — not how hard it is being run.
        </p>
      </div>

      <HubNav />

      <Panel>
        <ThesisBand report={report.thesis} />
      </Panel>

      <Panel>
        <LeakFunnel stages={report.leak} />
      </Panel>

      {/* Each lever is rendered exactly once. The first pass showed the top
          three under "Do this first" and then all five under "Every lever",
          which restated the same three cards verbatim — the same duplication
          the dashboard page's own header comment warns about. */}
      {report.moves.length > 0 && (
        <>
          <Divider label="Do this first" />
          <div className="space-y-3">
            {report.moves.map((lever, i) => (
              <LeverCard key={lever.key} lever={lever} rank={i + 1} />
            ))}
          </div>
        </>
      )}

      {report.stop.length > 0 && (
        <>
          <Divider label="Not this" />
          <Panel>
            <StopDoing items={report.stop} />
          </Panel>
        </>
      )}

      {rest.length > 0 && (
        <>
          <Divider label="Also tracked" />
          <div className="space-y-3">
            {rest.map((lever) => (
              <LeverCard
                key={lever.key}
                lever={lever}
                rank={report.levers.indexOf(lever) + 1}
              />
            ))}
          </div>
        </>
      )}

      <p className="pt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500">
        Graded against the five principles in{" "}
        <code className="text-zinc-500 dark:text-zinc-400">
          job-search-os/CLAUDE.md
        </code>
        . A lever with too little evidence reads &ldquo;too early&rdquo;, never a
        red zero.{" "}
        <Link
          href="/dashboard/job-search"
          className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-600 dark:decoration-zinc-600"
        >
          The execution dashboard is here
        </Link>
        . · {today}
      </p>
    </div>
  );
}
