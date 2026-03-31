import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Sanitize slug to prevent path traversal
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");

  const intelDir = path.join(process.cwd(), "job-search-os", "insider-data", "company-intel");
  const filePath = path.join(intelDir, `${safeSlug}.md`);

  try {
    const content = await readFile(filePath, "utf-8");

    // Extract last updated date from frontmatter or content
    const lastUpdatedMatch = content.match(/Last updated:?\s*(.+)/i);
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null;

    // Check staleness (> 6 months)
    let stale = false;
    if (lastUpdated) {
      const updated = new Date(lastUpdated);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      stale = updated < sixMonthsAgo;
    }

    return NextResponse.json({ slug: safeSlug, content, lastUpdated, stale });
  } catch {
    return NextResponse.json({ error: "Company intel not found" }, { status: 404 });
  }
}
