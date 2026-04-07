export interface SparklineOptions {
  width?: number;
  height?: number;
  stroke?: string;
}

export function renderSparklineSvg(
  values: number[],
  options: SparklineOptions = {}
): string {
  const width = options.width ?? 80;
  const height = options.height ?? 20;
  const stroke = options.stroke ?? "#0d9488";

  if (values.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><polyline fill="none" stroke="${stroke}" stroke-width="1.5" points="${points}" /></svg>`;
}
