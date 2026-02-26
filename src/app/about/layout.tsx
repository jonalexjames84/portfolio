import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "15 years shipping products at scale. Then I got laid off and built Pottery Friends from scratch. The story of a PM who proves product instincts by building the thing.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
