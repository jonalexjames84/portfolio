import { readFile, readdir } from "fs/promises";
import path from "path";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

async function getIntel(slug: string) {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  const intelDir = path.join(process.cwd(), "job-search-os", "insider-data", "company-intel");
  const filePath = path.join(intelDir, `${safeSlug}.md`);

  try {
    const content = await readFile(filePath, "utf-8");
    const lastUpdatedMatch = content.match(/Last updated:?\s*(.+)/i);
    const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null;

    let stale = false;
    if (lastUpdated) {
      const updated = new Date(lastUpdated);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      stale = updated < sixMonthsAgo;
    }

    return { content, lastUpdated, stale, found: true };
  } catch {
    return { content: "", lastUpdated: null, stale: false, found: false };
  }
}

export async function generateStaticParams() {
  const intelDir = path.join(process.cwd(), "job-search-os", "insider-data", "company-intel");
  try {
    const files = await readdir(intelDir);
    return files
      .filter((f) => f.endsWith(".md") && f !== "index.md")
      .map((f) => ({ slug: f.replace(".md", "") }));
  } catch {
    return [];
  }
}

export default async function IntelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const intel = await getIntel(slug);

  if (!intel.found) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-zinc-400">No intel found for &quot;{slug}&quot;</p>
        <Link href="/job-search/companies" className="text-sm text-accent-600 hover:text-accent-700 mt-2 inline-block">
          Back to companies
        </Link>
      </div>
    );
  }

  const sections = intel.content.split(/^## /m).filter(Boolean).map((section) => {
    const lines = section.split("\n");
    const title = lines[0].trim();
    const body = lines.slice(1).join("\n").trim();
    return { title, body };
  });

  return (
    <div>
      <Link
        href="/job-search/companies"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to companies
      </Link>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </h2>

      {intel.lastUpdated && (
        <p className="text-xs text-zinc-400 mb-4">Last updated: {intel.lastUpdated}</p>
      )}

      {intel.stale && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This intel may be outdated. Run <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">/company-research {slug.replace(/-/g, " ")}</code> for fresh data.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{section.title}</h3>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {section.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
