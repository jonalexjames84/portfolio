import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700"
    >
      {project.screenshot && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={project.screenshot}
            alt={`${project.title} screenshot`}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {project.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {project.subtitle}
            </p>
          </div>
          <ArrowUpRight
            size={18}
            className="shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
          />
        </div>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
