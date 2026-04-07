import { renderSparklineSvg, type SparklineOptions } from "@/lib/job-search/sparkline";

interface Props extends SparklineOptions {
  values: number[];
  className?: string;
}

export function Sparkline({ values, className, ...opts }: Props) {
  const svg = renderSparklineSvg(values, opts);
  return (
    <span
      className={className}
      // svg is locally generated, not user input
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
