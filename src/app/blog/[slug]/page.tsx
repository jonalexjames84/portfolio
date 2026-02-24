import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.subtitle,
  };
}

function renderBlock(block: string, index: number) {
  // Heading
  if (block.startsWith("## ")) {
    return (
      <h2
        key={index}
        className="mb-3 mt-10 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {block.slice(3)}
      </h2>
    );
  }

  // Heading with ### prefix
  if (block.startsWith("### ")) {
    return (
      <h3
        key={index}
        className="mb-2 mt-8 font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {block.slice(4)}
      </h3>
    );
  }

  // List items (block contains \n- pattern)
  if (block.includes("\n- ")) {
    const lines = block.split("\n");
    const intro = lines[0];
    const items = lines.slice(1).filter((l) => l.startsWith("- "));
    return (
      <div key={index} className="mb-4">
        {intro && (
          <p className="mb-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {intro}
          </p>
        )}
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              <span
                dangerouslySetInnerHTML={{
                  __html: item
                    .slice(2)
                    .replace(
                      /\*\*(.+?)\*\*/g,
                      '<strong class="text-zinc-900 dark:text-zinc-100">$1</strong>'
                    ),
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Bold text and inline formatting
  const formatted = block
    .replace(
      /\*\*(\d+\..+?)\*\*/g,
      '<strong class="text-zinc-900 dark:text-zinc-100">$1</strong>'
    )
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="text-zinc-900 dark:text-zinc-100">$1</strong>'
    )
    .replace(/\n\n/g, "</p><p class='mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400'>")
    .replace(/\n/g, "<br/>");

  // Blockquote
  if (block.startsWith('"') || block.startsWith("\u201C")) {
    return (
      <blockquote
        key={index}
        className="my-6 border-l-2 border-zinc-300 pl-4 italic text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  }

  return (
    <p
      key={index}
      className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-400"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft size={14} />
        All posts
      </Link>

      <div className="mb-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {post.title}
      </h1>
      <p className="mb-3 text-lg text-zinc-500 dark:text-zinc-400">
        {post.subtitle}
      </p>
      <div className="mb-10 flex items-center gap-3 text-sm text-zinc-400 dark:text-zinc-500">
        <time>
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {post.source && (
          <>
            <span>&middot;</span>
            <span>{post.source}</span>
          </>
        )}
      </div>

      <article>{post.content.map((block, i) => renderBlock(block, i))}</article>
    </div>
  );
}
