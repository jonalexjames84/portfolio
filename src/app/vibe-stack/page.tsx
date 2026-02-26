import type { Metadata } from "next";
import { WorkflowDiagram } from "./WorkflowDiagram";

export const metadata: Metadata = {
  title: "Vibe Stack",
  description:
    "My AI-native build system. Three approaches for client consulting, solo rapid prototyping, and internal stakeholder buy-in.",
};

export default function WorkflowPage() {
  return <WorkflowDiagram />;
}
