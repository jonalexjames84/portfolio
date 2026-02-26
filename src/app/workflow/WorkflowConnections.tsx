"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StepData, WorkflowColor } from "./workflowData";
import { getConnectionPath, getConnections } from "./workflowData";

/* ── Flowing particles (vanilla JS for perf) ──────────── */

function useFlowingParticles(
  svgRef: React.RefObject<SVGSVGElement | null>,
  color: string,
  pathCount: number,
  enabled: boolean,
) {
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<SVGCircleElement[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const svg = svgRef.current;
    if (!svg) return;

    // Wait a frame for paths to render
    const timer = setTimeout(() => {
      const paths = svg.querySelectorAll<SVGPathElement>("[data-connection-path]");
      if (paths.length === 0) return;

      // Clean up old particles
      particlesRef.current.forEach((p) => p.remove());
      particlesRef.current = [];

      // Create 2 particles per path
      const particles: Array<{
        el: SVGCircleElement;
        path: SVGPathElement;
        offset: number;
        speed: number;
        length: number;
      }> = [];

      paths.forEach((path) => {
        const length = path.getTotalLength();
        for (let i = 0; i < 2; i++) {
          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          circle.setAttribute("r", "3");
          circle.setAttribute("fill", color);
          circle.setAttribute("opacity", "0.7");
          circle.setAttribute("filter", "url(#particleGlow)");
          svg.appendChild(circle);
          particlesRef.current.push(circle);
          particles.push({
            el: circle,
            path,
            offset: (i / 2) * length,
            speed: 0.3 + Math.random() * 0.2,
            length,
          });
        }
      });

      let lastTime = performance.now();

      const animate = (time: number) => {
        const dt = Math.min(time - lastTime, 50); // cap delta
        lastTime = time;

        particles.forEach((p) => {
          p.offset = (p.offset + p.speed * dt * 0.06) % p.length;
          try {
            const point = p.path.getPointAtLength(p.offset);
            p.el.setAttribute("cx", String(point.x));
            p.el.setAttribute("cy", String(point.y));
          } catch {
            // Path may not be ready
          }
        });

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
      particlesRef.current.forEach((p) => p.remove());
      particlesRef.current = [];
    };
  }, [svgRef, color, pathCount, enabled]);
}

/* ── SVG connections layer ────────────────────────────── */

export function WorkflowConnections({
  steps,
  color,
  containerWidth,
  containerHeight,
  hoveredNode,
  workflowId,
}: {
  steps: StepData[];
  color: WorkflowColor;
  containerWidth: number;
  containerHeight: number;
  hoveredNode: number | null;
  workflowId: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const connections = getConnections(steps);

  // Detect reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFlowingParticles(
    svgRef,
    color.hex,
    connections.length,
    !prefersReducedMotion && containerWidth > 0,
  );

  const getPath = useCallback(
    (fromIdx: number, toIdx: number) => {
      if (containerWidth === 0 || containerHeight === 0) return "";
      const from = steps[fromIdx];
      const to = steps[toIdx];
      return getConnectionPath(
        from.x,
        from.y,
        to.x,
        to.y,
        containerWidth,
        containerHeight,
      );
    },
    [steps, containerWidth, containerHeight],
  );

  if (containerWidth === 0 || containerHeight === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0"
      width={containerWidth}
      height={containerHeight}
      style={{ zIndex: 10 }}
    >
      <defs>
        {/* Glow filter for particles */}
        <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Path glow filter */}
        <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <AnimatePresence mode="wait">
        <motion.g key={workflowId}>
          {connections.map(({ from, to }) => {
            const d = getPath(from, to);
            if (!d) return null;

            const isHighlighted =
              hoveredNode === from || hoveredNode === to;

            return (
              <motion.path
                key={`${workflowId}-${from}-${to}`}
                data-connection-path
                d={d}
                fill="none"
                stroke={color.hex}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeOpacity={isHighlighted ? 0.7 : 0.25}
                filter={isHighlighted ? "url(#pathGlow)" : undefined}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  pathLength: {
                    duration: 0.8,
                    delay: from * 0.1,
                    ease: "easeInOut",
                  },
                }}
              />
            );
          })}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
