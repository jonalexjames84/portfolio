export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { MaterialsGrid, type Material } from "@/components/job-search/MaterialsGrid";

export const metadata = { title: "Materials" };

export default async function MaterialsPage() {
  const { data } = await supabase
    .from("job_materials")
    .select("*")
    .order("created_at", { ascending: false });

  return <MaterialsGrid materials={(data || []) as Material[]} />;
}
