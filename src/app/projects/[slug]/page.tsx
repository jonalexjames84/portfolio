import { notFound, permanentRedirect } from "next/navigation";
import { getProject, projects } from "@/lib/projects";

// Case studies live at /work/[slug]. This route only exists so older
// /projects/[slug] links land on the real page.
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  permanentRedirect(`/work/${slug}`);
}
