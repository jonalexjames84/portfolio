import { supabase } from "@/lib/supabase";
import { ConnectionsList } from "@/components/job-search/ConnectionsList";

export const metadata = { title: "Network" };

export default async function NetworkPage() {
  const { data } = await supabase
    .from("job_connections")
    .select("*")
    .order("updated_at", { ascending: false });

  return <ConnectionsList connections={data || []} />;
}
