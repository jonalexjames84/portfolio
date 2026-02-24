import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";

const skills = [
  { category: "Product", items: ["Product Strategy", "User Research", "Roadmapping", "PRDs", "A/B Testing"] },
  { category: "Frontend", items: ["React", "Next.js", "React Native", "TypeScript", "TailwindCSS"] },
  { category: "Backend", items: ["Supabase", "PostgreSQL", "REST APIs", "Stripe", "Auth"] },
  { category: "Tools", items: ["Figma", "PostHog", "Sentry", "Vercel", "Git"] },
];

export default function Home() {
  const featured = getFeaturedProjects();

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <p className="mb-4 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Product Manager & Builder
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
          I build products from
          <br />
          zero to one.
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          I&apos;m a product manager who doesn&apos;t just write PRDs — I ship real
          products. From concept to deployed application, I design, build, and
          iterate across web and mobile.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View my work
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
          >
            About me
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Featured Projects
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Products I designed, built, and shipped end-to-end
            </p>
          </div>
          <Link
            href="/projects"
            className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:block dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="pb-20">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          What I Work With
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((group) => (
            <div key={group.category}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {group.category}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Looking for a PM who ships?
          </h2>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            I&apos;m currently exploring new opportunities as a Product Manager.
          </p>
          <Link
            href="mailto:hello@jonnymartin.blog"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
