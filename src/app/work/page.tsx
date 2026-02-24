import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies and products I've designed, built, and shipped — from mobile apps to SaaS platforms.",
};

export default function WorkPage() {
  const featured = projects.filter((p) => p.featured);
  const other = projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Work
      </h1>
      <p className="mb-10 text-zinc-600 dark:text-zinc-400">
        Products I conceived, designed, built, and shipped — each one a case
        study in product thinking.
      </p>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Featured
      </h2>
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {other.length > 0 && (
        <>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Other Work
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {other.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
