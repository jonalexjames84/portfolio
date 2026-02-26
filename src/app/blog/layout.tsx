import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on product management, AI, and building.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
