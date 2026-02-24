import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on product management, AI, and building.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Blog
      </h1>
      <p className="mb-10 text-zinc-600 dark:text-zinc-400">
        Takeaways from conferences, reflections on building, and lessons from
        the AI product landscape.
      </p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border border-zinc-200 p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              />
            </div>
            <h2 className="mb-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {post.title}
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.subtitle}
            </p>
            <time className="text-xs text-zinc-400 dark:text-zinc-500">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </Link>
        ))}
      </div>
    </div>
  );
}
