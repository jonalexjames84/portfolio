"use client";

import Link from "next/link";
import { Mail, Linkedin, Github, Send, Calendar, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

const socials = [
  {
    label: "Email",
    href: "mailto:hello@jonnymartin.blog",
    icon: Mail,
    detail: "hello@jonnymartin.blog",
    description: "Best for initial outreach",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jon-martin-0b739316/",
    icon: Linkedin,
    detail: "linkedin.com/in/jon-martin-0b739316",
    description: "Connect professionally",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    label: "GitHub",
    href: "https://github.com/jonalexjames84",
    icon: Github,
    detail: "github.com/jonalexjames84",
    description: "See my code",
    gradient: "from-zinc-600 to-zinc-800",
  },
  {
    label: "Substack",
    href: "https://jonnymartin.substack.com",
    icon: BookOpen,
    detail: "jonnymartin.substack.com",
    description: "Read my writing",
    gradient: "from-orange-500 to-rose-500",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-8 text-center sm:p-12 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30"
      >
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10" />
        <div className="relative">
          <span className="mb-4 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Open to opportunities
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Let&apos;s Connect
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            I&apos;ve spent 15 years shipping products at scale and the last year
            building them from scratch. Whether you have an opportunity, want to
            chat about product, or just want to say hi — I&apos;d love to hear
            from you.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <form
            action="https://formspree.io/f/xojnywrp"
            method="POST"
            className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Send a Message
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  placeholder="Tell me about the role or what you'd like to discuss..."
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                <Send size={14} />
                Send Message
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right column: Direct links + Calendly */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-4"
        >
          {/* Direct links */}
          {socials.map((s) => (
            <motion.div key={s.label} variants={staggerItem}>
              <Link
                href={s.href}
                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
              >
                <div className={`rounded-lg bg-gradient-to-br ${s.gradient} p-2.5 shadow-lg transition-transform group-hover:scale-110`}>
                  <s.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.label}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {s.detail}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {s.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Calendly placeholder */}
          <motion.div
            variants={staggerItem}
            className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/30"
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
              <Calendar size={20} className="text-white" />
            </div>
            <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Schedule a Call
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Calendly integration coming soon.
              <br />
              For now, reach out via email to book time.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
