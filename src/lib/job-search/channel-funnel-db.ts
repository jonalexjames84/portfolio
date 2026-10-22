/**
 * Reads for the channel funnel section. The arithmetic lives in the
 * `plan_channel_funnel` view; the rendering in channel-funnel.ts.
 */

import { supabase } from "@/lib/supabase";
import type { ChannelSectionInput } from "./channel-funnel";

export async function readChannelSection(): Promise<ChannelSectionInput> {
  const [rows, almost, missing] = await Promise.all([
    supabase.from("plan_channel_funnel").select("*").order("sort"),
    supabase
      .from("plan_touchpoints")
      .select("person, company, note")
      .eq("kind", "referral")
      .eq("status", "promised")
      .order("occurred_on"),
    supabase
      .from("plan_touchpoints")
      .select("person, kind, format, occurred_on")
      .is("channel", null)
      .neq("status", "cancelled")
      .order("occurred_on", { ascending: false }),
  ]);
  const error = rows.error ?? almost.error ?? missing.error;
  if (error) throw new Error(`channel funnel: ${error.message}`);
  return { rows: rows.data ?? [], almost: almost.data ?? [], missing: missing.data ?? [] };
}
