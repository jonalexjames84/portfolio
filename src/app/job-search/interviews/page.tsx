export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { InterviewList } from "@/components/job-search/InterviewList";
import { localDateStr } from "@/lib/job-search/dates";

export const metadata = { title: "Interviews" };

export default async function InterviewsPage() {
  const today = localDateStr(new Date());

  const [upcomingRes, pastRes] = await Promise.all([
    supabase.from("job_interviews").select("*").gte("date", today).order("date", { ascending: true }),
    supabase.from("job_interviews").select("*").lt("date", today).order("date", { ascending: false }),
  ]);

  return (
    <InterviewList
      upcoming={upcomingRes.data || []}
      past={pastRes.data || []}
    />
  );
}
