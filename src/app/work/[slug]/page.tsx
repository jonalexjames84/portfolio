import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, ArrowRight, Users, Lightbulb, Target, Wrench, GitBranch, BarChart3, AlertTriangle, Cpu, Package, Globe, Palette, Layers } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { getTagColor } from "@/lib/tagColors";
import { BrowserFrame } from "@/components/BrowserFrame";
import { PhoneFrame } from "@/components/PhoneFrame";

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

const sectionConfig = [
  { key: "role", icon: Users, title: "My Role", gradient: "from-indigo-500 to-violet-500" },
  { key: "problem", icon: Target, title: "The Problem", gradient: "from-rose-500 to-pink-500" },
  { key: "userResearch", icon: Users, title: "What I Learned from Users", gradient: "from-amber-500 to-orange-500" },
  { key: "pitch", icon: Lightbulb, title: "Why I Built This", gradient: "from-violet-500 to-purple-500" },
  { key: "strategy", icon: Target, title: "Strategy", gradient: "from-sky-500 to-cyan-500" },
  { key: "description", icon: Wrench, title: "What I Built", gradient: "from-emerald-500 to-teal-500" },
  { key: "decisions", icon: GitBranch, title: "Key Decisions & Tradeoffs", gradient: "from-indigo-500 to-blue-500" },
  { key: "outcomes", icon: BarChart3, title: "Outcomes & Results", gradient: "from-emerald-500 to-green-500" },
  { key: "failures", icon: AlertTriangle, title: "What Didn't Work (And What I Changed)", gradient: "from-amber-500 to-orange-500" },
  { key: "highlights", icon: Cpu, title: "Technical Highlights", gradient: "from-fuchsia-500 to-pink-500" },
];

function SectionHeader({ icon: Icon, title, gradient }: { icon: typeof Users; title: string; gradient: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
    </div>
  );
}

function BulletList({ items, gradient }: { items: string[]; gradient: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400"
        >
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${gradient}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const isDesign = project.category === "design";

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/work"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={14} />
        All work
      </Link>

      {/* Project hero */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-6 sm:p-8 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
        <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
        <div className="relative">
          <div className="mb-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {project.title}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {project.subtitle}
          </p>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <Globe size={14} />
              Visit Live Site
            </a>
          )}
        </div>
      </div>

      {/* Hero screenshot */}
      {project.screenshot && (
        <div className="relative mb-12">
          {project.features ? (
            <PhoneFrame src={project.screenshot} alt={project.title} />
          ) : (
            <>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-purple-500/20 blur-sm dark:from-indigo-500/10 dark:via-violet-500/10 dark:to-purple-500/10" />
              <div className="relative">
                <BrowserFrame
                  src={project.screenshot}
                  alt={project.title}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Legacy screenshot grid for projects without features */}
      {!project.features && project.screenshots && project.screenshots.length > 1 && (
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {project.screenshots.slice(1).map((src) => (
            <div key={src} className="transition-transform hover:scale-[1.02]">
              <BrowserFrame
                src={src}
                alt={`${project.title} screenshot`}
                width={640}
                height={400}
              />
            </div>
          ))}
        </div>
      )}

      {/* Team Context */}
      <section className="mb-12 relative overflow-hidden rounded-xl p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/20 dark:via-violet-950/15 dark:to-purple-950/20" />
        <div className="absolute inset-0 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30" />
        <div className="relative">
          <SectionHeader icon={Users} title="My Role" gradient="from-indigo-500 to-violet-500" />
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {project.teamContext}
          </p>
        </div>
      </section>

      {/* The Problem / Challenge */}
      <section className="mb-12">
        <SectionHeader icon={Target} title={isDesign ? "The Challenge" : "The Problem"} gradient="from-rose-500 to-pink-500" />
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.problem}
        </p>
      </section>

      {/* User Research & Discovery */}
      {project.userResearch.length > 0 && (
        <section className="mb-12">
          <SectionHeader icon={Users} title={isDesign ? "Client Discovery" : "What I Learned from Users"} gradient="from-amber-500 to-orange-500" />
          <BulletList items={project.userResearch} gradient="from-amber-500 to-orange-500" />
        </section>
      )}

      {/* Why I Built This */}
      <section className="mb-12">
        <SectionHeader icon={Lightbulb} title={isDesign ? "The Approach" : "Why I Built This"} gradient="from-violet-500 to-purple-500" />
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.pitch}
        </p>
      </section>

      {/* Strategy */}
      {project.strategy && (
        <section className="mb-12">
          <SectionHeader icon={Target} title={isDesign ? "Design Strategy" : "Strategy"} gradient="from-sky-500 to-cyan-500" />
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            {project.strategy}
          </p>
        </section>
      )}

      {/* Overview */}
      <section className="mb-12">
        <SectionHeader icon={isDesign ? Palette : Wrench} title={isDesign ? "What I Delivered" : "What I Built"} gradient="from-emerald-500 to-teal-500" />
        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
          {project.description}
        </p>
      </section>

      {/* Feature Showcases */}
      {project.features && project.features.length > 0 && (
        <section className="mb-12">
          <SectionHeader icon={Layers} title="Feature Showcase" gradient="from-indigo-500 to-cyan-500" />
          <div className="space-y-10">
            {project.features.map((feature) => (
              <div
                key={feature.title}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="p-5">
                  <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
                <div className="border-t border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:snap-none sm:overflow-visible sm:pb-0" style={{ gridTemplateColumns: `repeat(${feature.screenshots.length}, minmax(0, 1fr))` }}>
                    {feature.screenshots.map((src) => (
                      <div key={src} className="w-[200px] shrink-0 snap-center overflow-hidden rounded-lg border border-zinc-200 shadow-sm sm:w-auto sm:shrink dark:border-zinc-700">
                        <Image
                          src={src}
                          alt={feature.title}
                          width={390}
                          height={844}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Decisions & Tradeoffs */}
      <section className="mb-12">
        <SectionHeader icon={GitBranch} title={isDesign ? "Design Decisions" : "Key Decisions & Tradeoffs"} gradient="from-indigo-500 to-blue-500" />
        <BulletList items={project.decisions} gradient="from-indigo-500 to-blue-500" />
      </section>

      {/* Outcomes & Results */}
      <section className="mb-12">
        <SectionHeader icon={BarChart3} title="Outcomes & Results" gradient="from-emerald-500 to-green-500" />
        <BulletList items={project.outcomes} gradient="from-emerald-500 to-green-500" />
      </section>

      {/* What Didn't Work */}
      {project.failures.length > 0 && (
        <section className="mb-12">
          <SectionHeader icon={AlertTriangle} title="What Didn't Work (And What I Changed)" gradient="from-amber-500 to-orange-500" />
          <BulletList items={project.failures} gradient="from-amber-500 to-orange-500" />
        </section>
      )}

      {/* Key Highlights */}
      <section className="mb-12">
        <SectionHeader icon={Cpu} title={isDesign ? "Highlights" : "Technical Highlights"} gradient="from-fuchsia-500 to-pink-500" />
        <BulletList items={project.highlights} gradient="from-fuchsia-500 to-pink-500" />
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <SectionHeader icon={Package} title={isDesign ? "Tools & Platform" : "Tech Stack"} gradient="from-teal-500 to-emerald-500" />
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${getTagColor(tech)}`}
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Deliverables (design) or Products Built (software) */}
      {project.deliverables && project.deliverables.length > 0 && (
        <section className="mb-12">
          <SectionHeader icon={Palette} title="Deliverables" gradient="from-violet-500 to-purple-500" />
          <div className="space-y-3">
            {project.deliverables.map((d) => (
              <div
                key={d}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-500" />
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {d}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.repos && project.repos.length > 0 && (
        <section className="mb-12">
          <SectionHeader icon={Wrench} title="Products Built" gradient="from-violet-500 to-purple-500" />
          <div className="space-y-3">
            {project.repos.map((repo) => (
              <div
                key={repo.name}
                className="group flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700"
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
                  className="text-zinc-400 transition-colors group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden rounded-xl p-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30" />
        <div className="absolute inset-0 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30" />
        <div className="relative">
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            {isDesign
              ? "Need a brand identity or website for your creative practice?"
              : "Want to discuss how I approach product problems like this?"}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Let&apos;s connect
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
