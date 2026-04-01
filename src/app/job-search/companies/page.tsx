import { supabase } from "@/lib/supabase";
import { CompanyCards } from "@/components/job-search/CompanyCards";

export const metadata = { title: "Target Companies" };

export type PipelineEntry = {
  id: string;
  role: string;
  status: string;
  applied_date: string | null;
  last_update: string;
  job_url: string | null;
  fit_score: number | null;
  ats_result: string | null;
};

export type ConnectionEntry = {
  id: string;
  name: string;
  linkedin_connected: boolean;
  linkedin_url: string | null;
  outreach_stage: string;
  referral_status: string;
  last_contact: string | null;
  next_action: string | null;
};

export type MaterialEntry = {
  id: string;
  type: string;
  role: string;
  coverage_score: number | null;
  created_at: string;
  content: string;
  gaps: string | null;
};

export type EnrichedCompany = {
  id: string;
  rank: number | null;
  name: string;
  stage: string | null;
  industry: string | null;
  product_focus: string | null;
  hiring_status: string | null;
  recent_news: string | null;
  notes: string | null;
  job_title: string | null;
  job_url: string | null;
  updated_at: string;
  pipeline: PipelineEntry | null;
  connections: ConnectionEntry[];
  materials: MaterialEntry[];
};

export default async function CompaniesPage() {
  const [companiesRes, pipelineRes, connectionsRes, materialsRes] =
    await Promise.all([
      supabase
        .from("job_target_companies")
        .select("*")
        .order("rank", { ascending: true, nullsFirst: false }),
      supabase
        .from("job_pipeline_entries")
        .select(
          "id, company, role, status, applied_date, last_update, job_url, fit_score, ats_result"
        )
        .order("last_update", { ascending: false }),
      supabase
        .from("job_connections")
        .select(
          "id, name, company_id, company_name, linkedin_connected, linkedin_url, outreach_stage, referral_status, last_contact, next_action"
        ),
      supabase
        .from("job_materials")
        .select(
          "id, company, type, role, coverage_score, created_at, content, gaps"
        )
        .order("created_at", { ascending: false }),
    ]);

  const companies = companiesRes.data || [];
  const pipelineEntries = pipelineRes.data || [];
  const connections = connectionsRes.data || [];
  const materials = materialsRes.data || [];

  // Build lookup maps
  const pipelineByCompany = new Map<string, PipelineEntry>();
  for (const entry of pipelineEntries) {
    const key = (entry.company || "").toLowerCase();
    if (!pipelineByCompany.has(key)) {
      pipelineByCompany.set(key, entry);
    }
  }

  const connectionsByCompanyId = new Map<string, ConnectionEntry[]>();
  const connectionsByCompanyName = new Map<string, ConnectionEntry[]>();
  for (const conn of connections) {
    if (conn.company_id) {
      const list = connectionsByCompanyId.get(conn.company_id) || [];
      list.push(conn);
      connectionsByCompanyId.set(conn.company_id, list);
    }
    if (conn.company_name) {
      const key = conn.company_name.toLowerCase();
      const list = connectionsByCompanyName.get(key) || [];
      list.push(conn);
      connectionsByCompanyName.set(key, list);
    }
  }

  const materialsByCompany = new Map<string, MaterialEntry[]>();
  for (const mat of materials) {
    const key = (mat.company || "").toLowerCase();
    const list = materialsByCompany.get(key) || [];
    list.push(mat);
    materialsByCompany.set(key, list);
  }

  // Enrich companies
  const enriched: EnrichedCompany[] = companies.map((company) => {
    const nameKey = company.name.toLowerCase();
    return {
      ...company,
      pipeline: pipelineByCompany.get(nameKey) || null,
      connections:
        connectionsByCompanyId.get(company.id) ||
        connectionsByCompanyName.get(nameKey) ||
        [],
      materials: materialsByCompany.get(nameKey) || [],
    };
  });

  return <CompanyCards companies={enriched} />;
}
