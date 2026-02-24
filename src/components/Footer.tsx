import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Jonny Martin
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/jonnymartin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="GitHub"
          >
            <Github size={18} />
          </Link>
          <Link
            href="https://linkedin.com/in/jonnymartin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </Link>
          <Link
            href="mailto:hello@jonnymartin.blog"
            className="text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Email"
          >
            <Mail size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
