export function WallCard({
  number,
  title,
  description,
  quote,
  quoteSource,
}: {
  number: number;
  title: string;
  description: string;
  quote: string;
  quoteSource: string;
}) {
  return <div>{title}</div>;
}
