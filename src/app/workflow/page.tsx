import type { Metadata } from "next";
import { WorkflowDiagram } from "./WorkflowDiagram";

export const metadata: Metadata = {
  title: "AI Workflow",
  description:
    "How I build products using AI-native workflows. Three approaches for client consulting, solo rapid prototyping, and internal stakeholder buy-in.",
};

export default function WorkflowPage() {
  return <WorkflowDiagram />;
}
