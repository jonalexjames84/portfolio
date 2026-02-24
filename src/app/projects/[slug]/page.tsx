import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.subtitle}`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/projects"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft size={14} />
        All projects
      </Link>

      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {project.title}
      </h1>
      <p className="mb-8 text-lg text-zinc-500 dark:text-zinc-400">
        {project.subtitle}
      </p>

      {/* Screenshot */}
      {project.screenshot && (
        <div className="mb-12 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Image
            src={project.screenshot}
            alt={`${project.title} screenshot`}
            width={1280}
            height={800}
            className="w-full"
          />
        </div>
      )}

      {/* Additional screenshots */}
      {project.screenshots && project.screenshots.length > 1 && (
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {project.screenshots.slice(1).map((src) => (
            <div
              key={src}
              className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <Image
                src={src}
                alt={`${project.title} screenshot`}
                width={640}
                height={400}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Problem */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          The Problem
        </h2>
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.problem}
        </p>
      </section>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Overview
        </h2>
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
      </section>

      {/* Why I Built This */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Why I Built This
        </h2>
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.pitch}
        </p>
      </section>

      {/* Key Highlights */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Key Highlights
        </h2>
        <ul className="space-y-2">
          {project.highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              {h}
            </li>
          ))}
        </ul>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Tech Stack
        </h2>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Repos / Products */}
      <section className="mb-12">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Products Built
        </h2>
        <div className="space-y-3">
          {project.repos.map((repo) => (
            <div
              key={repo.name}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {repo.name}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {repo.role}
                </p>
              </div>
              <ExternalLink
                size={16}
                className="text-zinc-400 dark:text-zinc-500"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
