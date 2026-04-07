import { describe, it, expect } from "vitest";
import { renderSparklineSvg } from "./sparkline";

describe("renderSparklineSvg", () => {
  it("returns an SVG string", () => {
    const svg = renderSparklineSvg([1, 2, 3, 4, 5]);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("uses width and height defaults", () => {
    const svg = renderSparklineSvg([1, 2, 3]);
    expect(svg).toContain('width="80"');
    expect(svg).toContain('height="20"');
  });

  it("includes a polyline element", () => {
    const svg = renderSparklineSvg([1, 2, 3, 4, 5]);
    expect(svg).toContain("<polyline");
  });

  it("renders a flat baseline for constant input", () => {
    const svg = renderSparklineSvg([3, 3, 3, 3]);
    expect(svg).toContain("<polyline");
  });

  it("returns an empty SVG for empty input", () => {
    const svg = renderSparklineSvg([]);
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("<polyline");
  });
});
