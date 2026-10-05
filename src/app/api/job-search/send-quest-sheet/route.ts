import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkAuth, EMAIL_FROM, EMAIL_TO } from "@/lib/email-templates";
import { addDays, localDateStr } from "@/lib/job-search/dates";
import {
  inPlan,
  parsePlan,
  renderQuestSheetEmail,
  upcomingFriday,
  weekNumberForFriday,
} from "@/lib/job-search/quest-sheet";
import { findWeekRow, readPlanBlocks } from "@/lib/job-search/notion-plan";
import { withRunLog } from "@/lib/job-search/run-log-db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

/**
 * Sunday 6pm PT: the coming week's quest sheet, read from that week's row in
 * the Notion Friday Seven. Replaced the Friday Weekly Review on Oct 4, 2026.
 */
async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return withRunLog("send-quest-sheet", async (counts) => {
    const friday = upcomingFriday(localDateStr(new Date()));
    const week = weekNumberForFriday(friday);
    if (!inPlan(week)) {
      counts.skipped = 1;
      return NextResponse.json({ sent: false, reason: `week ${week} is outside the 100 days` });
    }

    const [row, lastRow] = await Promise.all([
      findWeekRow(week),
      week > 1 ? findWeekRow(week - 1) : Promise.resolve(null),
    ]);
    const days = row ? parsePlan(await readPlanBlocks(row.id)) : [];

    const { subject, html } = renderQuestSheetEmail({
      week,
      friday,
      days,
      rowUrl: row?.url ?? null,
      lastWeek: lastRow ? { numbers: lastRow.numbers, rowUrl: lastRow.url } : null,
    });

    const { error } = await resend.emails.send({ from: EMAIL_FROM, to: EMAIL_TO, subject, html });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    counts.sent = 1;
    counts.quests = days.reduce((n, d) => n + d.quests.length, 0);
    return NextResponse.json({ sent: true, week, monday: addDays(friday, -4), quests: counts.quests });
  });
}
