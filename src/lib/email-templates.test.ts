import { describe, it, expect } from "vitest";
import { healthSection } from "./email-templates";
import type { HealthIssue } from "./job-search/run-log";

describe("healthSection", () => {
  it("renders nothing at all when there are no issues", () => {
    expect(healthSection([])).toBe("");
  });

  it("names the job and the reason for each issue", () => {
    const issues: HealthIssue[] = [
      { jobName: "apply-batch", kind: "stalled", detail: "Last successful run 52h ago (window is 48h)." },
      { jobName: "ingest-jobs", kind: "errored", detail: "Last run failed: board 502" },
    ];

    const html = healthSection(issues);

    expect(html).toContain("apply-batch");
    expect(html).toContain("52h ago");
    expect(html).toContain("ingest-jobs");
    expect(html).toContain("board 502");
  });

  it("escapes HTML in error text so a stray tag cannot break the email", () => {
    const issues: HealthIssue[] = [
      { jobName: "ingest-jobs", kind: "errored", detail: "Last run failed: <script>x</script>" },
    ];

    const html = healthSection(issues);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
