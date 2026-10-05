import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkAuth, EMAIL_FROM, EMAIL_TO } from "@/lib/email-templates";
import { localDateStr } from "@/lib/job-search/dates";
import {
  inPlan,
  isFilledOut,
  lastFriday,
  reminderOrdinal,
  renderReminderEmail,
  weekNumberForFriday,
} from "@/lib/job-search/quest-sheet";
import { findWeekRow } from "@/lib/job-search/notion-plan";
import { withRunLog } from "@/lib/job-search/run-log-db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

/**
 * Fri 5pm, Sat 10am and Sun 10am PT: if the week's Friday Seven row in Notion
 * is missing any of its job-search numbers, send a reminder. Silent once it's
 * filled in. A week still empty after Sunday is flagged at the top of the
 * Sunday quest sheet instead.
 */
async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return withRunLog("friday-seven-reminder", async (counts) => {
    const today = localDateStr(new Date());
    const friday = lastFriday(today);
    const week = weekNumberForFriday(friday);
    if (!inPlan(week)) {
      counts.skipped = 1;
      return NextResponse.json({ sent: false, reason: `week ${week} is outside the 100 days` });
    }

    const row = await findWeekRow(week);
    if (!row) throw new Error(`No Friday Seven row found for week ${week}`);
    if (isFilledOut(row.numbers)) {
      counts.skipped = 1;
      return NextResponse.json({ sent: false, reason: "filled out" });
    }

    const { subject, html } = renderReminderEmail({
      week,
      numbers: row.numbers,
      rowUrl: row.url,
      attempt: reminderOrdinal(today),
    });
    const { error } = await resend.emails.send({ from: EMAIL_FROM, to: EMAIL_TO, subject, html });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    counts.sent = 1;
    return NextResponse.json({ sent: true, week });
  });
}
