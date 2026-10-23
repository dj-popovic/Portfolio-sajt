"use client";

import { useEffect, useRef } from "react";

type RGB = readonly [number, number, number];
type Coal = { x: number; y: number; r: number; hue: RGB; base: number; sp: number; ph: number; heat: number };
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: RGB;
  life: number;
  max: number;
  ph: number;
  sp: number;
};

function warm(): RGB {
  const r = Math.random();
  return r < 0.5 ? [255, 150, 60] : r < 0.8 ? [255, 107, 53] : [255, 182, 39];
}

/**
 * The footer's smouldering coal bed: coals along the very bottom, sparks
 * drifting slowly up, and a flare wherever the cursor passes over the embers.
 */
export function FooterEmbers({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.closest("footer");
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let coals: Coal[] = [];
    let sparks: Spark[] = [];
    let raf = 0;
    let visible = false;
    const pointer = { x: -9999, y: -9999, active: false, lastSpawn: 0 };

    function newSpark(init: boolean, x?: number, y?: number, boost = 1): Spark {
      return {
        x: x ?? Math.random() * W,
        y: y ?? (init ? H - Math.random() * H * 0.7 : H - 2 - Math.random() * 12),
        vx: (Math.random() - 0.5) * 0.18 * boost,
        vy: -(0.12 + Math.random() * 0.4) * boost,
        r: 0.7 + Math.random() * 1.5,
        hue: warm(),
        life: init ? Math.random() * 120 : 0,
        max: 130 + Math.random() * 200,
        ph: Math.random() * Math.PI * 2,
        sp: 1 + Math.random() * 2,
      };
    }

    function seed() {
      coals = [];
      sparks = [];
      const nC = reduce ? 48 : Math.min(200, Math.floor(W / 7));
      for (let i = 0; i < nC; i++) {
        const edge = Math.pow(Math.random(), 1.6); // cluster toward the very bottom
        const hot = Math.random() < 0.18; // a few brighter, smouldering coals
        coals.push({
          x: Math.random() * W,
          y: H - edge * 60,
          r: (hot ? 2.2 : 1.1) + Math.random() * 3.2,
          hue: warm(),
          base: (hot ? 0.55 : 0.28) + Math.random() * 0.55,
          sp: 0.4 + Math.random() * 1.3,
          ph: Math.random() * Math.PI * 2,
          heat: 0,
        });
      }
      const nS = reduce ? 0 : Math.min(36, Math.floor(W / 46));
      for (let i = 0; i < nS; i++) sparks.push(newSpark(true));
    }

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const t = now * 0.001;

      const bed = ctx.createLinearGradient(0, H, 0, H * 0.32);
      bed.addColorStop(0, "rgba(255,107,53,0.11)");
      bed.addColorStop(0.5, "rgba(255,120,50,0.035)");
      bed.addColorStop(1, "rgba(255,120,50,0)");
      ctx.fillStyle = bed;
      ctx.fillRect(0, 0, W, H);

      // cursor flare: a warm bloom where the pointer hovers the bed
      if (pointer.active) {
        const g = ctx.createRadialGradient(pointer.x, H, 0, pointer.x, H, 260);
        g.addColorStop(0, "rgba(255,120,50,0.16)");
        g.addColorStop(1, "rgba(255,120,50,0)");
        ctx.fillStyle = g;
        ctx.fillRect(pointer.x - 260, H - 260, 520, 260);
      }

      for (const c of coals) {
        if (pointer.active) {
          const dx = c.x - pointer.x;
          const dy = (c.y - pointer.y) * 0.6;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) c.heat = Math.min(1, c.heat + (1 - d / 150) * 0.12);
        }
        c.heat *= 0.965;
        const fl = 0.55 + 0.45 * Math.sin(t * c.sp + c.ph);
        const a = c.base * fl * (1 + c.heat * 1.4);
        const gr = c.r * (3.2 + fl * 2.6) * (1 + c.heat * 0.9);
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, gr);
        g.addColorStop(0, `rgba(${c.hue[0]},${c.hue[1]},${c.hue[2]},${Math.min(0.98, a)})`);
        g.addColorStop(1, `rgba(${c.hue[0]},${c.hue[1]},${c.hue[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,240,214,${Math.min(0.95, a * 0.95)})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // stir up a few extra sparks under the cursor
      if (pointer.active && pointer.y > H * 0.45 && now - pointer.lastSpawn > 70 && sparks.length < 90) {
        pointer.lastSpawn = now;
        sparks.push(newSpark(false, pointer.x + (Math.random() - 0.5) * 60, H - Math.random() * 30, 1.8));
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy *= 0.996;
        s.life++;
        const lifeT = s.life / s.max;
        if (lifeT >= 1 || s.y < H * 0.16) {
          // keep the resting population steady; extra cursor sparks just fade out
          if (sparks.length > Math.min(36, Math.floor(W / 46))) sparks.splice(i, 1);
          else Object.assign(s, newSpark(false));
          continue;
        }
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        const a = (1 - lifeT) * 0.62 * tw;
        const gr = s.r * 3.2;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gr);
        g.addColorStop(0, `rgba(${s.hue[0]},${s.hue[1]},${s.hue[2]},${a})`);
        g.addColorStop(1, `rgba(${s.hue[0]},${s.hue[1]},${s.hue[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, gr, 0, Math.PI * 2);
        ctx.fill();
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
      pointer.active = pointer.y > 0;
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
    if (reduce) draw(performance.now());
    else raf = requestAnimationFrame(frame);

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
