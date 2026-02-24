import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  title: "Jonny Martin — Senior Product Manager",
  description:
    "15 years shipping games and products at scale. From FarmVille at Zynga to blockchain gaming — now I build the products I manage.",
};

export default function Home() {
  return <HomePage />;
}
