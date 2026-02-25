"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 120, mouse }: { count?: number; mouse: React.MutableRefObject<[number, number]> }) {
  const mesh = useRef<THREE.Points>(null);
  const { viewport } = useThree();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = 0;
    }
    return [pos, vel];
  }, [count, viewport.width, viewport.height]);

  // Per-particle colors cycling through indigo/violet/purple
  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [
      [0.39, 0.40, 0.95],  // indigo
      [0.55, 0.36, 0.96],  // violet
      [0.66, 0.33, 0.97],  // purple
      [0.51, 0.55, 0.98],  // lighter indigo
      [0.60, 0.42, 0.93],  // mid violet
    ];
    for (let i = 0; i < count; i++) {
      const color = palette[i % palette.length];
      c[i * 3] = color[0];
      c[i * 3 + 1] = color[1];
      c[i * 3 + 2] = color[2];
    }
    return c;
  }, [count]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * 2 + 1;
    }
    return s;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const posAttr = mesh.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    const [mx, my] = mouse.current;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;

      // Drift
      arr[ix] += velocities[ix];
      arr[iy] += velocities[iy];

      // Subtle mouse influence
      const dx = mx * viewport.width * 0.5 - arr[ix];
      const dy = my * viewport.height * 0.5 - arr[iy];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) {
        arr[ix] += dx * 0.0008;
        arr[iy] += dy * 0.0008;
      }

      // Wrap edges
      const hw = viewport.width * 1.2;
      const hh = viewport.height * 1.2;
      if (arr[ix] > hw) arr[ix] = -hw;
      if (arr[ix] < -hw) arr[ix] = hw;
      if (arr[iy] > hh) arr[iy] = -hh;
      if (arr[iy] < -hh) arr[iy] = hh;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.5}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Lines({ count = 120 }: { count?: number; mouse?: React.MutableRefObject<[number, number]> }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  useFrame(({ scene }) => {
    if (!lineRef.current) return;
    const particles = scene.children.find((c) => c instanceof THREE.Points) as THREE.Points | undefined;
    if (!particles) return;

    const posArr = particles.geometry.attributes.position.array as Float32Array;
    const linePositions: number[] = [];
    const threshold = 2.5;

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = posArr[i * 3] - posArr[j * 3];
        const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
        const d = dx * dx + dy * dy;
        if (d < threshold * threshold) {
          linePositions.push(
            posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2],
            posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]
          );
        }
      }
    }

    const geo = lineRef.current.geometry;
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#818cf8" transparent opacity={0.1} />
    </lineSegments>
  );
}

export function HeroCanvas() {
  const mouse = useRef<[number, number]>([0, 0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Disable on low-power / mobile devices
    const mq = window.matchMedia("(max-width: 768px)");
    if (mq.matches) {
      setVisible(false);
      return;
    }

    // Check for reduced motion preference
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) {
      setVisible(false);
      return;
    }

    const handleMove = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ];
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Particles count={120} mouse={mouse} />
        <Lines count={120} mouse={mouse} />
      </Canvas>
    </div>
  );
}
