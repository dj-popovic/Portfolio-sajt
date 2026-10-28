"use client";

import { useEffect, useRef } from "react";
import { dotFill } from "@/components/canvas/Orb2D";
import { buildHorizon, horizon, HORIZON, horizonLayout, stepHorizon } from "@/lib/horizon";

const LEVELS = 14;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The footer's horizon on a 2D canvas, for when there is no WebGL: the same
 * crown of dots with the orb's colour ramp (as Orb2D draws the orb). It
 * turns and gathers in without WebGL; under reduced motion it is one still frame.
 */
export function Horizon2D({ className, live }: { className?: string; live: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const count = window.innerWidth < 760 ? 5000 : 9000;
    const { pos, seed } = buildHorizon(count);
    const [lx, ly, lz] = HORIZON.light;
    const fills = Array.from({ length: LEVELS }, (_, i) => dotFill(i / (LEVELS - 1)));
    const buckets: number[][] = Array.from({ length: LEVELS }, () => []);
    const px = new Float32Array(count * 3);

    let dpr = 1;
    let W = 0;
    let H = 0;

    function draw() {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const L = horizonLayout(W, H);
      const intro = live ? horizon.intro : 1;
      const c = Math.cos(horizon.yaw);
      const s = Math.sin(horizon.yaw);
      for (const b of buckets) b.length = 0;

      for (let i = 0; i < count; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const z = pos[i * 3 + 2];
        const vx = c * x + s * z;
        const vz = -s * x + c * z;
        const facing = smooth(-0.3, 0.25, vz);
        if (facing <= 0) continue;
        // the gather, as the WebGL horizon does it: in from a loose cloud below, a little
        // apart, quick at first and settling; its fade-in dithered dot by dot
        const gather = 1 - Math.pow(1 - Math.min(1, Math.max(0, (intro - seed[i * 4 + 2] * 0.3) / 0.7)), 3);
        if (gather < 0.12 + ((i * 0.618034) % 1) * 0.5) continue;
        const drift = seed[i * 4 + 3] * Math.PI * 2;
        const far = (70 + seed[i * 4 + 1] * 240) * (1 - gather);
        const light = Math.pow(Math.max(0, vx * lx + y * ly + vz * lz), 0.9);
        const thr = seed[i * 4];
        let show = smooth(thr - 0.07, thr + 0.07, light * 1.06 + 0.05);
        if (thr < 0.06) show = Math.max(show, 0.5);
        if (show * facing < 0.5) continue;
        const sy = L.y - y * L.r + Math.sin(drift) * 0.55 * far + 150 * (1 - gather);
        if (sy > H + 2) continue;
        const level = Math.min(LEVELS - 1, Math.round(light * (LEVELS - 1)));
        px[i * 3] = L.x + vx * L.r + Math.cos(drift) * far;
        px[i * 3 + 1] = sy;
        px[i * 3 + 2] = 1.9 * (0.72 + seed[i * 4 + 1] * 0.62) * (0.88 + 0.28 * light);
        buckets[level].push(i);
      }
      for (let l = 0; l < LEVELS; l++) {
        const list = buckets[l];
        if (!list.length) continue;
        ctx.fillStyle = fills[l];
        for (const i of list) {
          const size = px[i * 3 + 2];
          ctx.fillRect(px[i * 3] - size / 2, px[i * 3 + 1] - size / 2, size, size);
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function resize() {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      draw();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (!live) return () => ro.disconnect();

    let raf = 0;
    let last = performance.now();
    let visible = false;
    const loop = (now: number) => {
      stepHorizon(Math.min((now - last) / 1000, 1 / 20));
      last = now;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (!visible) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [live]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
