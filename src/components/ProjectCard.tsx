import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { getTagColor } from "@/lib/tagColors";

export function ProjectCard({ project, hero }: { project: Project; hero?: boolean }) {
  if (hero) {
    return (
      <Link
        href={`/work/${project.slug}`}
        className="group block overflow-hidden rounded-xl border border-zinc-200 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:hover:border-zinc-700"
      >
        {project.screenshot && (
          <div className="relative h-64 w-full overflow-hidden bg-zinc-100 sm:h-80 dark:bg-zinc-800">
            <Image
              src={project.screenshot}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {project.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {project.subtitle}
              </p>
            </div>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
            />
          </div>
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {project.description}
          </p>
          {project.callout && (
            <p className="mb-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {project.callout}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:hover:border-zinc-700"
    >
      {project.screenshot && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={project.screenshot}
            alt={`${project.title} screenshot`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
            className="shrink-0 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
          />
        </div>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
        {project.callout && (
          <p className="mb-3 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {project.callout}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
