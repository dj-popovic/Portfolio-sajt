"use client";

import { useEffect, useRef } from "react";
import { buildOrb, orb, ORB, orbEvents, orbLayout, orbRotation, stepOrb, viewportSize } from "@/lib/orb";

const LEVELS = 14;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// the shader's colour ramp, baked into buckets: shadow grain → ember → amber
const GRAIN = [92, 74, 64];
const EMBER = [255, 107, 53];
const AMBER = [255, 182, 39];
function fill(e: number) {
  const t1 = smooth(0.04, 0.42, e);
  const t2 = smooth(0.58, 0.98, e);
  const c = GRAIN.map((g, i) => Math.round(mix(mix(g, EMBER[i], t1), AMBER[i], t2)));
  const a = 0.32 + 0.68 * smooth(0, 0.75, e);
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
}

/**
 * The orb on a 2D canvas inside the hero, for when there is no WebGL layer:
 * it drifts and spins without WebGL, and under reduced motion it is a still
 * frame that only turns when you drag it (or use the arrow keys).
 */
export function Orb2D({ className, live }: { className?: string; live: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const count = window.innerWidth < 760 ? 4200 : 7000;
    const { pos, seed } = buildOrb(count);
    const [lx, ly, lz] = ORB.light;
    const fills = Array.from({ length: LEVELS }, (_, i) => fill(i / (LEVELS - 1)));
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
      const view = viewportSize();
      const L = orbLayout(view.w, view.h);
      const m = orbRotation(orb.yaw, orb.pitch);
      for (const b of buckets) b.length = 0;

      for (let i = 0; i < count; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const z = pos[i * 3 + 2];
        const vx = m[0] * x + m[1] * y + m[2] * z;
        const vy = m[3] * x + m[4] * y + m[5] * z;
        const vz = m[6] * x + m[7] * y + m[8] * z;
        const rl = Math.hypot(vx, vy, vz);
        const facing = smooth(-0.3, 0.25, vz / rl);
        if (facing <= 0) continue;
        const light = Math.pow(Math.max(0, (vx * lx + vy * ly + vz * lz) / rl), 0.9);
        const thr = seed[i * 4];
        let show = smooth(thr - 0.07, thr + 0.07, light * 1.06 + 0.05);
        if (thr < 0.06) show = Math.max(show, 0.5);
        if (show * facing < 0.5) continue;
        const level = Math.min(LEVELS - 1, Math.round(light * (LEVELS - 1)));
        px[i * 3] = L.x + vx * L.r;
        px[i * 3 + 1] = L.y - vy * L.r;
        px[i * 3 + 2] = 1.9 * (0.72 + seed[i * 4 + 1] * 0.62) * (0.88 + 0.28 * light);
        buckets[level].push(i);
      }
      for (let l = 0; l < LEVELS; l++) {
        const list = buckets[l];
        if (!list.length) continue;
        ctx.fillStyle = fills[l];
        for (const i of list) {
          const s = px[i * 3 + 2];
          ctx.fillRect(px[i * 3] - s / 2, px[i * 3 + 1] - s / 2, s, s);
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

    if (!live) {
      // reduced motion: redraw only when someone turns it
      let queued = 0;
      const unsubscribe = orbEvents.subscribe(() => {
        if (queued) return;
        queued = requestAnimationFrame(() => {
          queued = 0;
          draw();
        });
      });
      return () => {
        unsubscribe();
        cancelAnimationFrame(queued);
        ro.disconnect();
      };
    }

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      stepOrb(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (!visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", run);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, [live]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
