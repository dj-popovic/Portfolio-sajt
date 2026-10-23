"use client";

import { useEffect, useRef } from "react";

type P = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: readonly [number, number, number];
  ph: number;
  sp: number;
  base: number;
  ox: number;
  oy: number;
};

/** Free-floating warm particles behind Contact; they drift up and part around the cursor. */
export function ContactParticles({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let ps: P[] = [];
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
      ps = [];
      const n = reduce ? 0 : Math.min(70, Math.floor((W * H) / 22000));
      for (let i = 0; i < n; i++) {
        ps.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.8 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.05 - Math.random() * 0.16,
          hue: Math.random() < 0.6 ? [255, 150, 60] : [255, 182, 39],
          ph: Math.random() * Math.PI * 2,
          sp: 0.4 + Math.random() * 1.1,
          base: 0.1 + Math.random() * 0.35,
          ox: 0,
          oy: 0,
        });
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible || !ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const t = now * 0.001;
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        // soft push away from the cursor, easing back when it leaves
        let tx = 0;
        let ty = 0;
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const R = 140;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * 34;
            tx = (dx / d) * f;
            ty = (dy / d) * f;
          }
        }
        p.ox += (tx - p.ox) * 0.08;
        p.oy += (ty - p.oy) * 0.08;

        const x = p.x + p.ox;
        const y = p.y + p.oy;
        const glow = pointer.active ? 1 + Math.min(1, Math.hypot(p.ox, p.oy) / 30) * 0.8 : 1;
        const a = p.base * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph)) * glow;
        const gr = p.r * 4;
        const g = ctx.createRadialGradient(x, y, 0, x, y, gr);
        g.addColorStop(0, `rgba(${p.hue[0]},${p.hue[1]},${p.hue[2]},${Math.min(0.9, a)})`);
        g.addColorStop(1, `rgba(${p.hue[0]},${p.hue[1]},${p.hue[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, gr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
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
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    if (!reduce) raf = requestAnimationFrame(frame);

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
