import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAuthorized } from "@/lib/job-search/request-auth";

const BUCKET = "job-materials";
const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Hands back the actual file behind a material — the resume PDF, the rendered
 * cover letter.
 *
 * The bucket is private, so nothing here is a public URL. We mint a short-lived
 * signed URL per click and redirect to it; the link dies in a minute, which
 * keeps a copy-pasted address from becoming a permanent leak of Jon's resume.
 *
 * `?download=1` forces a save-as instead of the browser's inline PDF viewer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: material, error } = await supabase
    .from("job_materials")
    .select("storage_path, label, company, role, format")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!material?.storage_path) {
    return NextResponse.json({ error: "No file for this material" }, { status: 404 });
  }

  const extension = material.storage_path.split(".").pop() || "pdf";
  const title = material.label || `${material.company} - ${material.role}`;
  const filename = `${title.replace(/[^\w\s.()&—-]+/g, "").trim()}.${extension}`;

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(
      material.storage_path,
      SIGNED_URL_TTL_SECONDS,
      request.nextUrl.searchParams.get("download") === "1" ? { download: filename } : undefined
    );

  if (signError || !signed) {
    return NextResponse.json(
      { error: signError?.message || "Could not sign file URL" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}
