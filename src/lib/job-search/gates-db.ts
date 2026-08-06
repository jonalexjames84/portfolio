import { supabase } from "@/lib/supabase";
import type { GateOverride } from "./gates";

export async function loadGateOverrides(): Promise<GateOverride[]> {
  const { data, error } = await supabase
    .from("job_gate_overrides")
    .select("company_key, decision, gate, reason");
  if (error) throw error;
  return (data ?? []) as GateOverride[];
}
