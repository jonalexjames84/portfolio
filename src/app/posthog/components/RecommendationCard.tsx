export function RecommendationCard({
  number,
  title,
  summary,
  detail,
  visual,
}: {
  number: number;
  title: string;
  summary: string;
  detail: string;
  visual: "dashboard" | "timeline" | "prompts";
}) {
  return <div>{title}</div>;
}
