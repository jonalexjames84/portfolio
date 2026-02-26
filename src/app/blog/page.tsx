"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { posts } from "@/lib/posts";
import { getTagColor } from "@/lib/tagColors";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-8 sm:p-10 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-fuchsia-950/30"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/10" />
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Blog
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Takeaways from conferences, reflections on building, and lessons from
          the AI product landscape.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        {posts.map((post) => (
          <motion.div key={post.slug} variants={staggerItem}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block h-full overflow-hidden rounded-xl border border-zinc-200 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              {/* Hero image */}
              {post.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              {/* Gradient top border (only when no image) */}
              {!post.image && (
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-60 transition-opacity group-hover:opacity-100" />
              )}
              <div className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-500 dark:group-hover:text-violet-400"
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
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
