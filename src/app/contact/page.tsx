"use client";

import Link from "next/link";
import { Linkedin, Github, Send, Calendar, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeAnimations } from "@/lib/animations";

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jon-martin-0b739316/",
    icon: Linkedin,
    description: "Connect professionally",
    gradient: "from-sky-500 to-blue-500",
  },
  {
    label: "GitHub",
    href: "https://github.com/jonalexjames84",
    icon: Github,
    description: "See my code",
    gradient: "from-zinc-600 to-zinc-800",
  },
  {
    label: "Substack",
    href: "https://jonnymartin.substack.com",
    icon: BookOpen,
    description: "Read my writing",
    gradient: "from-orange-500 to-rose-500",
  },
  {
    label: "Schedule a Call",
    href: "https://calendly.com/jonalexjames/30min",
    icon: Calendar,
    description: "Book a 30-minute chat",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function ContactPage() {
  const { fadeIn, staggerContainer, staggerItem } = useThemeAnimations();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative mb-12 overflow-hidden rounded-2xl gradient-bg-subtle p-8 text-center sm:p-12"
      >
        <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-accent-400/20 blur-3xl dark:bg-accent-600/10" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10" />
        <div className="relative">
          <span className="mb-4 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Seeking Senior PM at a high-growth startup
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            Let&apos;s Connect
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            I&apos;m targeting Senior PM roles at seed-to-Series B startups in
            SaaS, dev tools, AI/ML, or consumer platforms. Whether you have a
            role, want to talk product, or just want to say hi, I&apos;d love
            to hear from you.
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
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-accent-500 dark:focus:ring-accent-500"
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
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-accent-500 dark:focus:ring-accent-500"
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
                  className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-accent-400 focus:ring-1 focus:ring-accent-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-accent-500 dark:focus:ring-accent-500"
                  placeholder="Tell me about the role or what you'd like to discuss..."
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg gradient-btn px-5 py-2.5 text-sm font-medium transition-all"
              >
                <Send size={14} />
                Send Message
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right column: Direct links */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-4"
        >
          {socials.map((s) => (
            <motion.div key={s.label} variants={staggerItem}>
              <Link
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
              >
                <div className={`rounded-lg bg-gradient-to-br ${s.gradient} p-2.5 shadow-lg transition-transform group-hover:scale-110`}>
                  <s.icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.label}
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    {s.description}
                  </p>
                </div>
                <ExternalLink size={16} className="mt-1 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
