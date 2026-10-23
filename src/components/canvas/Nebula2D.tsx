"use client";

import { useEffect, useRef } from "react";

type RGB = readonly [number, number, number];

// Ember palette for particles: white-hot → gold → orange → ember red → maroon
const PALETTE: Array<{ c: RGB; w: number }> = [
  { c: [255, 241, 221], w: 0.05 },
  { c: [255, 199, 77], w: 0.2 },
  { c: [255, 150, 60], w: 0.24 },
  { c: [255, 107, 53], w: 0.26 },
  { c: [230, 66, 28], w: 0.16 },
  { c: [205, 52, 30], w: 0.06 },
  { c: [140, 46, 40], w: 0.03 },
];

function weighted(arr: typeof PALETTE): RGB {
  const total = arr.reduce((s, p) => s + p.w, 0);
  let roll = Math.random() * total;
  for (const p of arr) {
    roll -= p.w;
    if (roll <= 0) return p.c;
  }
  return arr[arr.length - 1].c;
}

// bias toward bright/warm in the core, ember toward the edge
function pickColor(r: number): RGB {
  if (r < 0.22) return weighted(PALETTE.slice(0, 4));
  if (r < 0.6) return weighted(PALETTE.slice(1, 5));
  return weighted(PALETTE.slice(3, 7));
}

// angular density → irregular lobes
function angularDensity(a: number) {
  return (
    0.55 +
    0.26 * Math.sin(3 * a + 0.7) +
    0.18 * Math.sin(5 * a + 2.1) +
    0.12 * Math.sin(7 * a + 4.0) +
    0.1 * Math.sin(2 * a + 1.0)
  );
}

type Sparkle = { x: number; y: number; col: RGB; base: number; speed: number; phase: number; size: number };

/**
 * The design's canvas nebula, ported 1:1. Used as the static/fallback hero
 * visual (reduced motion, no WebGL) — the 3D nebula renders over it.
 */
export function Nebula2D({ className, animate = true }: { className?: string; animate?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const live = animate && !reduce;

    let W = 0;
    let H = 0;
    let off: HTMLCanvasElement | null = null;
    let offCtx: CanvasRenderingContext2D | null = null;
    const center = { x: 0, y: 0 };
    let maxR = 0;
    let sparkles: Sparkle[] = [];
    let rot = 0;
    let raf = 0;
    let visible = true;

    function drawDot(x: number, y: number, rr: number) {
      if (!offCtx) return;
      const col = pickColor(rr);
      let alpha = (1 - rr * 0.72) * (0.32 + Math.random() * 0.6);
      alpha = Math.max(0.04, Math.min(0.95, alpha));
      let size = Math.random() < 0.86 ? 1 : Math.random() < 0.7 ? 1.6 : 2.4;
      // a handful of bright glowing embers, mostly near the core
      if (rr < 0.5 && Math.random() < 0.02) {
        const gr = 6 + Math.random() * 10;
        const grad = offCtx.createRadialGradient(x, y, 0, x, y, gr);
        grad.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0.9)`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        offCtx.fillStyle = grad;
        offCtx.beginPath();
        offCtx.arc(x, y, gr, 0, Math.PI * 2);
        offCtx.fill();
        size = 1.8;
        alpha = 1;
      }
      offCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
      offCtx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    function buildNebula() {
      off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      offCtx = off.getContext("2d");
      if (!offCtx) return;
      offCtx.clearRect(0, 0, W, H);
      offCtx.globalCompositeOperation = "lighter";
      const cx = center.x;
      const cy = center.y;

      // 1) soft glow underlayer
      const glows = [
        { x: cx, y: cy, r: maxR * 0.95, col: "rgba(255,107,53,0.10)" },
        { x: cx - maxR * 0.18, y: cy - maxR * 0.1, r: maxR * 0.55, col: "rgba(255,182,39,0.10)" },
        { x: cx + maxR * 0.22, y: cy + maxR * 0.16, r: maxR * 0.5, col: "rgba(230,66,28,0.06)" },
      ];
      for (const g of glows) {
        const grad = offCtx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
        grad.addColorStop(0, g.col);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        offCtx.fillStyle = grad;
        offCtx.fillRect(0, 0, W, H);
      }

      // 2) main particle cloud (rejection-sampled for an irregular shape)
      const N = Math.min(16000, Math.floor((W * H) / 95));
      let placed = 0;
      let guard = 0;
      while (placed < N && guard < N * 4) {
        guard++;
        const a = Math.random() * Math.PI * 2;
        if (Math.random() > angularDensity(a)) continue;
        let rr = Math.pow(Math.random(), 1.9);
        if (Math.random() < 0.04) rr = 0.85 + Math.random() * 0.55;
        const radius = rr * maxR;
        const jx = (Math.random() - 0.5) * maxR * 0.05;
        const jy = (Math.random() - 0.5) * maxR * 0.05;
        placed++;
        drawDot(cx + Math.cos(a) * radius + jx, cy + Math.sin(a) * radius * 0.92 + jy, rr);
      }

      // 3) filament streaks radiating out
      const fil = 16;
      for (let f = 0; f < fil; f++) {
        const baseA = (f / fil) * Math.PI * 2 + Math.random() * 0.3;
        if (angularDensity(baseA) < 0.5 && Math.random() < 0.6) continue;
        const len = maxR * (0.7 + Math.random() * 0.7);
        const curve = (Math.random() - 0.5) * 0.6;
        const steps = Math.floor(len / 1.4);
        for (let s = 0; s < steps; s++) {
          const t = s / steps;
          const a = baseA + curve * t * t;
          const spread = (1 - t) * maxR * 0.05 + maxR * 0.012;
          const px = cx + Math.cos(a) * len * t + (Math.random() - 0.5) * spread;
          const py = cy + Math.sin(a) * len * t * 0.92 + (Math.random() - 0.5) * spread;
          if (Math.random() < 0.55) drawDot(px, py, 0.4 + t * 0.6);
        }
      }

      // 4) faint scattered background stars
      for (let i = 0; i < 260; i++) {
        const col = Math.random() < 0.5 ? [255, 199, 77] : [255, 160, 120];
        offCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.06 + Math.random() * 0.16})`;
        offCtx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
    }

    function buildSparkles() {
      sparkles = [];
      const n = live ? 150 : 0;
      for (let i = 0; i < n; i++) {
        let x: number;
        let y: number;
        if (Math.random() < 0.7) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 1.4) * maxR * 0.95;
          x = center.x + Math.cos(a) * r;
          y = center.y + Math.sin(a) * r * 0.92;
        } else {
          x = Math.random() * W;
          y = Math.random() * H;
        }
        sparkles.push({
          x,
          y,
          col: Math.random() < 0.5 ? [255, 199, 77] : [255, 130, 90],
          base: 0.2 + Math.random() * 0.6,
          speed: 0.6 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
          size: Math.random() < 0.8 ? 1.2 : 2,
        });
      }
    }

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // composition: nebula sits centre-right, a touch above the middle
      center.x = W * (W < 760 ? 0.6 : 0.64);
      center.y = H * (W < 760 ? 0.4 : 0.46);
      maxR = Math.min(W, H) * (W < 760 ? 0.5 : 0.46);
      buildNebula();
      buildSparkles();
      renderStatic();
    }

    function renderStatic() {
      if (!ctx || !off) return;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const s of sparkles) {
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${s.base})`;
        ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
      }
      ctx.globalCompositeOperation = "source-over";
    }

    let t0 = performance.now();
    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = (now - t0) / 1000;
      t0 = now;
      if (!visible || !ctx || !off) return;
      ctx.clearRect(0, 0, W, H);
      // extremely slow rotation for subtle life
      rot += dt * 0.012;
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(rot);
      ctx.translate(-center.x, -center.y);
      ctx.drawImage(off, 0, 0, W, H);
      ctx.restore();
      ctx.globalCompositeOperation = "lighter";
      for (const s of sparkles) {
        const tw = s.base * (0.45 + 0.55 * Math.abs(Math.sin(now * 0.001 * s.speed + s.phase)));
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${tw})`;
        ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
        if (s.size > 1.5 && tw > 0.5) {
          ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${tw * 0.25})`;
          ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    resize();
    if (live) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [animate]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
