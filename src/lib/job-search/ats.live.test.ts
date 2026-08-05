/**
 * Live smoke test against real ATS boards. Skipped by default because it makes
 * network calls; run with LIVE_ATS=1 npx vitest run src/lib/job-search/ats.live.test.ts
 * to confirm the boards still answer and still yield PM roles.
 */
import { describe, it, expect } from "vitest";
import { fetchBoard, type AtsBoard } from "./ats";
import { computeAutoFitScore } from "./fit-score";
import type { PipelineEntry } from "./types";

const BOARDS: AtsBoard[] = [
  { company: "Anthropic", atsType: "greenhouse", atsToken: "anthropic", industry: "AI/ML" },
  { company: "Vercel", atsType: "greenhouse", atsToken: "vercel", industry: "Dev Tools" },
  { company: "OpenAI", atsType: "ashby", atsToken: "openai", industry: "AI/ML" },
  { company: "Cursor", atsType: "ashby", atsToken: "cursor", industry: "AI/ML" },
  { company: "Notion", atsType: "ashby", atsToken: "notion", industry: "SaaS" },
  { company: "Palantir", atsType: "lever", atsToken: "palantir", industry: "SaaS" },
];

const run = process.env.LIVE_ATS === "1" ? describe : describe.skip;

run("live ATS boards", () => {
  it(
    "returns scoreable PM postings from every provider",
    async () => {
      for (const board of BOARDS) {
        const postings = await fetchBoard(board);
        const scored = postings.map((p) => {
          const { total } = computeAutoFitScore({
            role: p.title,
            jd_text: p.description,
            industry: board.industry ?? null,
            stage: null,
            location: p.location,
          } as PipelineEntry);
          return { ...p, total };
        });

        console.log(
          `\n${board.company} (${board.atsType}) — ${postings.length} PM roles`
        );
        for (const s of scored.sort((a, b) => b.total - a.total).slice(0, 5)) {
          console.log(`  ${s.total}  ${s.title} — ${s.location}`);
          console.log(`      ${s.url}`);
        }

        expect(Array.isArray(postings)).toBe(true);
        for (const p of postings) {
          expect(p.url).toMatch(/^https?:\/\//);
          expect(p.title.length).toBeGreaterThan(0);
        }
      }
    },
    180_000
  );
});
