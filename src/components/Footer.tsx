import Link from "next/link";
import { Github, Linkedin, Mail, BookOpen } from "lucide-react";

const socials = [
  { href: "https://github.com/jonalexjames84", icon: Github, label: "GitHub", hoverColor: "hover:text-zinc-900 dark:hover:text-zinc-100" },
  { href: "https://www.linkedin.com/in/jon-martin-0b739316/", icon: Linkedin, label: "LinkedIn", hoverColor: "hover:text-sky-600 dark:hover:text-sky-400" },
  { href: "mailto:hello@jonnymartin.blog", icon: Mail, label: "Email", hoverColor: "hover:text-amber-600 dark:hover:text-amber-400", internal: true },
  { href: "https://jonnymartin.substack.com", icon: BookOpen, label: "Substack", hoverColor: "hover:text-orange-600 dark:hover:text-orange-400" },
];

export function Footer() {
  return (
    <footer className="relative">
      {/* Gradient top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent dark:via-indigo-800" />

      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Jonny Martin
        </p>
        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target={s.internal ? undefined : "_blank"}
              rel={s.internal ? undefined : "noopener noreferrer"}
              className={`text-zinc-400 transition-colors ${s.hoverColor}`}
              aria-label={s.label}
            >
              <s.icon size={18} />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
