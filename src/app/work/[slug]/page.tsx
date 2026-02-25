import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, Target, GitBranch, BarChart3, Package, Globe, Layers, Search, Compass } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { getTagColor } from "@/lib/tagColors";
import { BrowserFrame } from "@/components/BrowserFrame";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AnimatedSection } from "@/components/AnimatedSection";

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

function SectionHeader({ icon: Icon, title, gradient }: { icon: typeof Target; title: string; gradient: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-md`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="my-2 flex items-center">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />
    </div>
  );
}

function InsightCards({ items, gradient }: { items: string[]; gradient: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <div
          key={item}
          className="rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className="flex gap-3">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[11px] font-bold text-white shadow-sm`}>
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DecisionCards({ items, gradient }: { items: string[]; gradient: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={item}
          className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`} />
          <div className="flex gap-3 p-4 pl-5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 text-[11px] font-bold text-indigo-600 dark:border-indigo-800 dark:text-indigo-400">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item}</p>
          </div>
        </div>
      ))}
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

const metricColors = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-cyan-500",
];

const metricBgColors = [
  "from-indigo-50/80 to-violet-50/80 dark:from-indigo-950/30 dark:to-violet-950/30",
  "from-violet-50/80 to-purple-50/80 dark:from-violet-950/30 dark:to-purple-950/30",
  "from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30",
  "from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30",
  "from-rose-50/80 to-pink-50/80 dark:from-rose-950/30 dark:to-pink-950/30",
  "from-sky-50/80 to-cyan-50/80 dark:from-sky-950/30 dark:to-cyan-950/30",
];

const strategyLabelColors: Record<string, string> = {
  Target: "text-rose-600 dark:text-rose-400",
  "Go-to-Market": "text-amber-600 dark:text-amber-400",
  "Business Model": "text-emerald-600 dark:text-emerald-400",
  Vision: "text-sky-600 dark:text-sky-400",
};

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

      {/* Hero with embedded context */}
      <AnimatedSection className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-6 sm:p-8 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
          <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl dark:bg-violet-600/10" />
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

            {/* Context integrated into hero */}
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {project.description}
            </p>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Globe size={14} />
                Visit Live Site
              </a>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Hero screenshot */}
      {project.screenshot && (
        <AnimatedSection className="mb-12" delay={0.1}>
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
        </AnimatedSection>
      )}

      {/* Supporting screenshots */}
      {!project.features && project.screenshots && project.screenshots.length > 1 && (
        <AnimatedSection className="mb-12">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:pb-0">
            {project.screenshots.slice(1).map((src) => (
              <div key={src} className="w-[80%] shrink-0 snap-center sm:w-auto sm:shrink">
                <BrowserFrame
                  src={src}
                  alt={`${project.title} screenshot`}
                  width={640}
                  height={400}
                />
              </div>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Problem callout card */}
      <AnimatedSection className="mb-12">
        <div className="rounded-2xl border border-rose-200/60 bg-gradient-to-br from-rose-50 via-pink-50/30 to-white p-6 dark:border-rose-800/30 dark:from-rose-950/20 dark:via-pink-950/10 dark:to-zinc-900/50">
          <SectionHeader icon={Target} title={isDesign ? "The Challenge" : "The Problem"} gradient="from-rose-500 to-pink-500" />
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            {project.problem}
          </p>
        </div>
      </AnimatedSection>

      <SectionDivider />

      {/* Research as insight cards */}
      {project.userResearch.length > 0 && (
        <AnimatedSection className="mb-12">
          <SectionHeader icon={Search} title="Research & Discovery" gradient="from-amber-500 to-orange-500" />
          <InsightCards items={project.userResearch} gradient="from-amber-500 to-orange-500" />
        </AnimatedSection>
      )}

      {project.userResearch.length > 0 && <SectionDivider />}

      {/* Strategy */}
      {(project.strategyPoints || project.strategy) && (
        <AnimatedSection className="mb-12">
          <SectionHeader icon={Compass} title={isDesign ? "Design Strategy" : "Strategy"} gradient="from-sky-500 to-cyan-500" />
          {project.strategyPoints ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {project.strategyPoints.map((point) => (
                <div
                  key={point.label}
                  className="rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
                >
                  <p className={`mb-1.5 text-[11px] font-bold uppercase tracking-widest ${strategyLabelColors[point.label] || "text-sky-600 dark:text-sky-400"}`}>
                    {point.label}
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {point.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              {project.strategy}
            </p>
          )}
        </AnimatedSection>
      )}

      {(project.strategyPoints || project.strategy) && <SectionDivider />}

      {/* Feature Showcase */}
      {project.features && project.features.length > 0 && (
        <AnimatedSection className="mb-12">
          <SectionHeader icon={Layers} title="What I Built" gradient="from-emerald-500 to-teal-500" />
          <div className="space-y-8">
            {project.features.map((feature, featureIdx) => (
              <AnimatedSection
                key={feature.title}
                as="div"
                delay={featureIdx * 0.08}
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <div className="p-5">
                  <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
                <div className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100/50 p-4 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-950/30">
                  <div className={`flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:snap-none sm:overflow-visible sm:pb-0 ${feature.screenshots.length === 1 ? "justify-center" : "sm:grid"}`} style={feature.screenshots.length > 1 ? { gridTemplateColumns: `repeat(${feature.screenshots.length}, minmax(0, 1fr))` } : undefined}>
                    {feature.screenshots.map((src) => (
                      <div key={src} className={`shrink-0 snap-center overflow-hidden rounded-lg border border-zinc-200 shadow-sm transition-transform hover:scale-[1.02] dark:border-zinc-700 ${feature.screenshots.length === 1 ? "w-[200px] sm:w-[240px]" : "w-[200px] sm:w-auto sm:shrink"}`}>
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
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      )}

      {project.features && project.features.length > 0 && <SectionDivider />}

      {/* Key Decisions */}
      {project.decisions.length > 0 && (
        <AnimatedSection className="mb-12">
          <SectionHeader icon={GitBranch} title={isDesign ? "Design Decisions" : "Key Decisions"} gradient="from-indigo-500 to-blue-500" />
          <DecisionCards items={project.decisions} gradient="from-indigo-500 to-blue-500" />
        </AnimatedSection>
      )}

      {project.decisions.length > 0 && <SectionDivider />}

      {/* Results & Impact */}
      <AnimatedSection className="mb-12">
        <SectionHeader icon={BarChart3} title="Results & Impact" gradient="from-emerald-500 to-green-500" />

        {/* Metrics grid */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {project.metrics.map((m, i) => (
              <div
                key={m.label}
                className={`rounded-xl border border-zinc-200/80 bg-gradient-to-br ${metricBgColors[i % metricBgColors.length]} p-4 text-center transition-all hover:shadow-md dark:border-zinc-800/80`}
              >
                <p className={`text-3xl font-extrabold bg-gradient-to-br ${metricColors[i % metricColors.length]} bg-clip-text text-transparent`}>
                  {m.value}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {project.outcomes.length > 0 && (
          <BulletList items={project.outcomes} gradient="from-emerald-500 to-green-500" />
        )}
      </AnimatedSection>

      {/* Tech Stack */}
      <AnimatedSection className="mb-12">
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
      </AnimatedSection>

      {/* Deliverables (design projects) */}
      {project.deliverables && project.deliverables.length > 0 && (
        <AnimatedSection className="mb-12">
          <SectionHeader icon={Package} title="Deliverables" gradient="from-violet-500 to-purple-500" />
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
        </AnimatedSection>
      )}

    </div>
  );
}
