"use client";

import { useEffect, useRef } from "react";
import { dotFill } from "@/components/canvas/Orb2D";

const LEVELS = 14;

type Dot = {
  x: number;
  y: number;
  /** size in px, as the orb's dots */
  s: number;
  vx: number;
  vy: number;
  /** resting brightness: 0 grain … 1 amber */
  e: number;
  ph: number;
  sp: number;
  /** pushed aside by the pointer, easing back */
  ox: number;
  oy: number;
  /** warmed by the pointer, cooling off */
  heat: number;
};

/**
 * Loose dots of the orb drifting up behind Contact: the same small square
 * stipple and colour ramp (grain → ember → amber), twinkling a little. Near
 * the pointer they part and warm up, as on the orb.
 */
export function ContactParticles({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fills = Array.from({ length: LEVELS }, (_, i) => dotFill(i / (LEVELS - 1)));
    const buckets: Dot[][] = Array.from({ length: LEVELS }, () => []);

    let W = 0;
    let H = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let visible = false;
    const pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(170, Math.floor((W * H) / 9000));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 1.4 + Math.random() * 1.3,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -0.04 - Math.random() * 0.14,
        e: Math.pow(Math.random(), 1.6) * 0.85,
        ph: Math.random() * Math.PI * 2,
        sp: 0.5 + Math.random() * 1.2,
        ox: 0,
        oy: 0,
        heat: 0,
      }));
      if (reduce) draw(0);
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const t = now * 0.001;
      for (const b of buckets) b.length = 0;
      for (const d of dots) {
        if (!reduce) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.y < -6) {
            d.y = H + 6;
            d.x = Math.random() * W;
          }
          if (d.x < -6) d.x = W + 6;
          if (d.x > W + 6) d.x = -6;
        }
        // the pointer parts them and warms them, as on the orb
        let tx = 0;
        let ty = 0;
        if (pointer.active) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const R = 150;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const dist = Math.sqrt(d2) || 1;
            const f = 1 - dist / R;
            tx = (dx / dist) * f * 30;
            ty = (dy / dist) * f * 30;
            d.heat = Math.min(1, d.heat + f * 0.12);
          }
        }
        d.ox += (tx - d.ox) * 0.08;
        d.oy += (ty - d.oy) * 0.08;
        d.heat *= 0.96;
        const twinkle = reduce ? 1 : 0.8 + 0.2 * Math.sin(t * d.sp + d.ph);
        const energy = Math.min(1, d.e * twinkle + d.heat * 0.8);
        buckets[Math.round(energy * (LEVELS - 1))].push(d);
      }
      for (let l = 0; l < LEVELS; l++) {
        const list = buckets[l];
        if (!list.length) continue;
        ctx.fillStyle = fills[l];
        for (const d of list) {
          const s = d.s * (0.9 + (0.3 * l) / (LEVELS - 1));
          ctx.fillRect(d.x + d.ox - s / 2, d.y + d.oy - s / 2, s, s);
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (visible) draw(now);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !canvas) return;
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });

    resize();
    io.observe(canvas);
    window.addEventListener("resize", onResize);
    if (!reduce) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
