import { supabase } from "@/lib/supabase";
import { CompaniesTable } from "@/components/job-search/CompaniesTable";

export const metadata = { title: "Target Companies" };

export default async function CompaniesPage() {
  const { data } = await supabase
    .from("job_target_companies")
    .select("*")
    .order("rank", { ascending: true, nullsFirst: false });

  return <CompaniesTable companies={data || []} />;
}
