import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  title: "Jonny Martin | Senior Product Manager",
  description:
    "15 years shipping products at scale. Then I got laid off and built four myself. A PM who proves product instincts by building the thing.",
};

export default function Home() {
  return <HomePage />;
}
