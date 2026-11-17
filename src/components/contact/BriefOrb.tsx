"use client";

import { useEffect, useRef } from "react";
import { dotFill, sparkFill } from "@/components/canvas/Orb2D";
import { buildOrb, ORB, orbRotation } from "@/lib/orb";

const COUNT = 620;
const LEVELS = 10;
const SPIN = 0.22; // rad/s
const RIPPLE = 1.5; // seconds a pulse takes to cross it and fade

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The brief as an orb: the hero's sphere of dots again, small, taking shape as the
 * conversation goes. With nothing said yet it is a loose cloud with a sparse grain of a
 * sphere in it; each answer draws more of the dots onto the sphere (`fill`, 0 → 1), and a
 * lime ripple runs across it as an answer lands (`pulse`, any new value). Whole, it is the
 * hero's orb: lit from the upper right, the lime back-light on its shadow edge. One still
 * frame per state under reduced motion; it rests while it's off screen.
 */
export function BriefOrb({ fill, pulse, className }: { fill: number; pulse: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // what the loop reads: where the fill is heading, and when the last pulse began
  const state = useRef({ fill, shown: fill, rippleAt: -1, pulse, draw: () => {} });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const st = state.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { pos, seed } = buildOrb(COUNT);
    const [lx, ly, lz] = ORB.light;
    const [bx, by] = ORB.back;
    const fills = Array.from({ length: LEVELS }, (_, i) => dotFill(i / (LEVELS - 1)));
    const limes = Array.from({ length: LEVELS }, (_, i) => sparkFill(i / (LEVELS - 1)));
    const buckets: number[][] = Array.from({ length: LEVELS }, () => []);
    const limeBuckets: number[][] = Array.from({ length: LEVELS }, () => []);
    const px = new Float32Array(COUNT * 3);
    let dpr = 1;
    let size = 0;
    let yaw = 0.6;
    let clock = 0;

    function draw() {
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.globalCompositeOperation = "lighter";
      const c = size / 2;
      const R = size * 0.33;
      const m = orbRotation(yaw, ORB.tilt);
      const age = st.rippleAt < 0 ? -1 : clock - st.rippleAt;
      const front = age * 2.6;
      const live = age >= 0 && age < RIPPLE ? 1 - smooth(0.6 * RIPPLE, RIPPLE, age) : 0;
      for (const b of buckets) b.length = 0;
      for (const b of limeBuckets) b.length = 0;

      for (let i = 0; i < COUNT; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const z = pos[i * 3 + 2];
        const vx = m[0] * x + m[1] * y + m[2] * z;
        const vy = m[3] * x + m[4] * y + m[5] * z;
        const vz = m[6] * x + m[7] * y + m[8] * z;
        const thr = seed[i * 4];
        const join = seed[i * 4 + 3];
        // on the sphere once the fill has passed its turn; before that, out in the cloud
        // (a sixth of them are on it from the start: a grain of a sphere to fill in)
        const on = smooth(join - 0.1, join + 0.06, 0.17 + st.shown * 0.93);
        const light = Math.pow(Math.max(0, vx * lx + vy * ly + vz * lz), 0.9);
        const flat = Math.hypot(vx, vy) || 1e-4;
        const back = Math.pow(1 - Math.min(1, Math.max(0, vz)), 3) * smooth(0.3, 0.95, (vx * bx + vy * by) / flat);
        // the ripple: a ring that runs out from the point facing you
        const wave = live ? Math.exp(-Math.pow((Math.acos(Math.min(1, Math.max(-1, vz))) - front) / 0.3, 2)) * live : 0;
        if (vz < -0.25 && on > 0.5) continue; // the far side of the sphere stays unseen
        let show = smooth(thr - 0.07, thr + 0.07, (light + back * 0.4 * st.shown + wave) * 1.06 + 0.05);
        if (thr < 0.1) show = Math.max(show, 0.5);
        // a dot of the cloud always shows, faintly; one on the sphere shows by the light
        if (on * show + (1 - on) * 0.6 < 0.5) continue;
        const drift = 1 + (1 - on) * (0.34 + seed[i * 4 + 1] * 0.5 + 0.05 * Math.sin(clock * 0.8 + join * 40));
        const reach = R * drift * (1 + wave * 0.1);
        px[i * 3] = c + vx * reach;
        px[i * 3 + 1] = c - vy * reach;
        px[i * 3 + 2] = (1.2 + seed[i * 4 + 1] * 0.8) * (0.75 + 0.25 * on);
        const level = Math.min(LEVELS - 1, Math.round((on * Math.max(light, 0.2) + (1 - on) * 0.3) * (LEVELS - 1)));
        const lime = wave > 0.35 || back * st.shown > 0.42;
        (lime ? limeBuckets : buckets)[lime ? Math.max(level, 5) : level].push(i);
      }
      for (const [set, paint] of [
        [buckets, fills],
        [limeBuckets, limes],
      ] as const) {
        for (let l = 0; l < LEVELS; l++) {
          const list = set[l];
          if (!list.length) continue;
          ctx.fillStyle = paint[l];
          for (const i of list) {
            const s = px[i * 3 + 2];
            ctx.fillRect(px[i * 3] - s / 2, px[i * 3 + 1] - s / 2, s, s);
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function resize() {
      if (!canvas) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      size = canvas.clientWidth;
      canvas.width = canvas.height = Math.round(size * dpr);
      draw();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (still) {
      // no loop: each state is drawn once, already whole
      st.draw = () => {
        st.shown = st.fill;
        draw();
      };
      st.draw();
      return () => {
        st.draw = () => {};
        ro.disconnect();
      };
    }

    let raf = 0;
    let last = 0;
    let visible = false;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      clock += dt;
      yaw += SPIN * dt;
      st.shown += (st.fill - st.shown) * (1 - Math.exp(-dt * 2.4));
      draw();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (!visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    st.draw = () => {
      st.rippleAt = clock;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", run);
    return () => {
      st.draw = () => {};
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  // a new fill or pulse: the loop takes it from here (a still orb redraws once)
  useEffect(() => {
    const st = state.current;
    const pulsed = pulse !== st.pulse;
    st.fill = fill;
    st.pulse = pulse;
    if (pulsed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) st.draw();
  }, [fill, pulse]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
