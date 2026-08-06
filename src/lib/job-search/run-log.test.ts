import { describe, it, expect } from "vitest";
import {
  findHealthIssues,
  JOB_STALE_HOURS,
  recordRun,
  type JobLastRun,
  type RunLogDeps,
} from "./run-log";

const NOW = new Date("2026-08-06T16:00:00Z");

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3600_000).toISOString();
}

/**
 * A fully healthy set covering every known job, with one job optionally
 * degraded. Every test needs the full set: findHealthIssues reports a
 * never_ran issue for any known job missing from the rows, so passing a
 * single row would surface eight unrelated issues.
 */
function allHealthy(degrade?: Partial<JobLastRun> & { job_name: string }): JobLastRun[] {
  const rows: JobLastRun[] = Object.keys(JOB_STALE_HOURS).map((job_name) => ({
    job_name,
    last_started_at: hoursAgo(11),
    last_ok_at: hoursAgo(11),
    last_status: "ok",
    last_error: null,
  }));
  if (!degrade) return rows;
  const i = rows.findIndex((r) => r.job_name === degrade.job_name);
  if (i === -1) return [...rows, { last_started_at: null, last_ok_at: null, last_status: null, last_error: null, ...degrade }];
  rows[i] = { ...rows[i], ...degrade };
  return rows;
}

describe("findHealthIssues", () => {
  it("reports nothing when every job ran recently and succeeded", () => {
    expect(findHealthIssues(allHealthy(), NOW)).toEqual([]);
  });

  it("flags a daily cron with no successful run inside its window", () => {
    const issues = findHealthIssues(
      allHealthy({ job_name: "ingest-jobs", last_ok_at: hoursAgo(40) }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("stalled");
    expect(issues[0].jobName).toBe("ingest-jobs");
  });

  it("flags a job whose most recent run errored", () => {
    const issues = findHealthIssues(
      allHealthy({ job_name: "ingest-jobs", last_status: "error", last_error: "board 502" }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("errored");
    expect(issues[0].detail).toContain("board 502");
  });

  it("does not report a stall and an error twice for the same job", () => {
    const issues = findHealthIssues(
      allHealthy({
        job_name: "ingest-jobs",
        last_ok_at: hoursAgo(40),
        last_status: "error",
        last_error: "boom",
      }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("errored");
  });

  it("gives the local apply agent a 48-hour window, not 36", () => {
    const at40 = allHealthy({
      job_name: "apply-batch",
      last_ok_at: hoursAgo(40),
      last_started_at: hoursAgo(40),
    });
    expect(findHealthIssues(at40, NOW)).toEqual([]);

    const at50 = allHealthy({
      job_name: "apply-batch",
      last_ok_at: hoursAgo(50),
      last_started_at: hoursAgo(50),
    });
    expect(findHealthIssues(at50, NOW)).toHaveLength(1);
  });

  it("gives weekly crons an eight-day window so Tuesday is not an alarm", () => {
    const sixDays = allHealthy({
      job_name: "generate-weekly-plan",
      last_ok_at: hoursAgo(24 * 6),
      last_started_at: hoursAgo(24 * 6),
    });
    expect(findHealthIssues(sixDays, NOW)).toEqual([]);

    const nineDays = allHealthy({
      job_name: "generate-weekly-plan",
      last_ok_at: hoursAgo(24 * 9),
      last_started_at: hoursAgo(24 * 9),
    });
    expect(findHealthIssues(nineDays, NOW)).toHaveLength(1);
  });

  it("flags a known job that has never run at all", () => {
    const issues = findHealthIssues(
      allHealthy({
        job_name: "ingest-jobs",
        last_ok_at: null,
        last_started_at: null,
        last_status: null,
      }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("never_ran");
  });

  it("flags every known job when no runs exist at all", () => {
    const issues = findHealthIssues([], NOW);
    expect(issues).toHaveLength(Object.keys(JOB_STALE_HOURS).length);
    expect(issues.every((i) => i.kind === "never_ran")).toBe(true);
    expect(issues.map((i) => i.jobName)).toContain("apply-batch");
  });

  it("ignores an unknown job name rather than inventing a threshold", () => {
    const rows = [
      ...allHealthy(),
      {
        job_name: "some-experiment",
        last_started_at: hoursAgo(500),
        last_ok_at: hoursAgo(500),
        last_status: "ok" as const,
        last_error: null,
      },
    ];
    expect(findHealthIssues(rows, NOW)).toEqual([]);
  });

  it("covers every scheduled job in JOB_STALE_HOURS", () => {
    expect(Object.keys(JOB_STALE_HOURS).sort()).toEqual([
      "apply-batch",
      "draft-applications",
      "generate-weekly-plan",
      "ingest-jobs",
      "recheck-listings",
      "rollup-metrics",
      "score-new-jobs",
      "send-daily-email",
      "send-weekly-review",
    ]);
  });
});

function fakeDeps() {
  const opened: string[] = [];
  const closed: Array<{ id: string; status: string; counts: unknown; error: string | null }> = [];
  const deps: RunLogDeps = {
    open: async (jobName) => {
      opened.push(jobName);
      return `run-${opened.length}`;
    },
    close: async (id, status, counts, error) => {
      closed.push({ id, status, counts, error });
    },
  };
  return { deps, opened, closed };
}

describe("recordRun", () => {
  it("opens a run, returns the function's value, and closes it ok", async () => {
    const { deps, opened, closed } = fakeDeps();

    const result = await recordRun("ingest-jobs", async () => "done", deps);

    expect(result).toBe("done");
    expect(opened).toEqual(["ingest-jobs"]);
    expect(closed).toHaveLength(1);
    expect(closed[0].status).toBe("ok");
    expect(closed[0].error).toBeNull();
  });

  it("passes a mutable counts object through to the close call", async () => {
    const { deps, closed } = fakeDeps();

    await recordRun("ingest-jobs", async (counts) => {
      counts.scanned = 120;
      counts.inserted = 3;
    }, deps);

    expect(closed[0].counts).toEqual({ scanned: 120, inserted: 3 });
  });

  it("closes the run as errored and rethrows when the function throws", async () => {
    const { deps, closed } = fakeDeps();

    await expect(
      recordRun("ingest-jobs", async () => {
        throw new Error("board 502");
      }, deps),
    ).rejects.toThrow("board 502");

    expect(closed).toHaveLength(1);
    expect(closed[0].status).toBe("error");
    expect(closed[0].error).toContain("board 502");
  });

  it("still runs the function when opening the run record fails", async () => {
    const deps: RunLogDeps = {
      open: async () => {
        throw new Error("db down");
      },
      close: async () => {},
    };

    await expect(recordRun("ingest-jobs", async () => "done", deps)).resolves.toBe("done");
  });

  it("does not mask the function's own error when closing fails", async () => {
    const deps: RunLogDeps = {
      open: async () => "run-1",
      close: async () => {
        throw new Error("close failed");
      },
    };

    await expect(
      recordRun("ingest-jobs", async () => {
        throw new Error("real failure");
      }, deps),
    ).rejects.toThrow("real failure");
  });

  it("records an error when the callback resolves a non-ok Response instead of throwing", async () => {
    const { deps, closed } = fakeDeps();

    const result = await recordRun(
      "ingest-jobs",
      async () => new Response(JSON.stringify({ error: "board down" }), { status: 500 }),
      deps,
    );

    expect(result.status).toBe(500);
    expect(closed).toHaveLength(1);
    expect(closed[0].status).toBe("error");
    expect(closed[0].error).toContain("500");
  });

  it("records ok when the callback resolves a 2xx Response", async () => {
    const { deps, closed } = fakeDeps();

    const result = await recordRun(
      "ingest-jobs",
      async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      deps,
    );

    expect(result.status).toBe(200);
    expect(closed).toHaveLength(1);
    expect(closed[0].status).toBe("ok");
    expect(closed[0].error).toBeNull();
  });
});
