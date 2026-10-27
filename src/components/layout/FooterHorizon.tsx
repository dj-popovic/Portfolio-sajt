"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Horizon2D } from "@/components/canvas/Horizon2D";
import { useOrbMode } from "@/components/three/OrbLayer";
import { ScrollTrigger } from "@/lib/gsap";
import { horizon, horizonLayout, rippleOnHorizon } from "@/lib/horizon";
import { overlay } from "@/lib/overlay";

const HorizonScene = dynamic(() => import("@/components/three/HorizonScene"), { ssr: false });

/**
 * The footer's horizon: the hero's orb rises again at the bottom of the
 * page, huge, in the same dots. It comes up as the footer scrolls in, the
 * pointer parts and warms the dots, a tap anywhere off the links sends a
 * ripple across it. WebGL like the hero; a 2D canvas without it; one still
 * frame under reduced motion.
 */
export function FooterHorizon({ className }: { className?: string }) {
  const mode = useOrbMode();
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const covered = useSyncExternalStore(overlay.subscribe, overlay.isOpen, () => false);

  useEffect(() => {
    const el = box.current;
    const footer = el?.closest("footer");
    if (!el || !footer || mode === "pending") return;

    // the renderer wakes just before it shows and sleeps when it's gone
    const io = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    if (mode === "still") {
      horizon.rise = 1;
      return () => io.disconnect();
    }

    // it rises as the footer comes in: fully up when the page ends
    const st = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => (horizon.rise = self.progress),
      onRefresh: (self) => (horizon.rise = self.progress),
    });

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const p = local(e);
      horizon.pointer.x = p.x;
      horizon.pointer.y = p.y;
      horizon.pointer.over = true;
    };
    const leave = () => (horizon.pointer.over = false);
    // links and buttons keep their clicks; anywhere else, a ripple
    const tap = (e: PointerEvent) => {
      if ((e.target as Element).closest("a, button, input, textarea")) return;
      const p = local(e);
      rippleOnHorizon(p.x, p.y, horizonLayout(p.w, p.h));
    };
    footer.addEventListener("pointermove", move);
    footer.addEventListener("pointerleave", leave);
    footer.addEventListener("pointerdown", tap);
    return () => {
      io.disconnect();
      st.kill();
      footer.removeEventListener("pointermove", move);
      footer.removeEventListener("pointerleave", leave);
      footer.removeEventListener("pointerdown", tap);
      horizon.pointer.over = false;
    };
  }, [mode]);

  const count = typeof window !== "undefined" && window.innerWidth < 760 ? 9000 : 22000;
  return (
    <div ref={box} className={className} aria-hidden>
      {mode === "webgl" && seen ? <HorizonScene count={count} active={near && !covered} /> : null}
      {mode === "canvas" || mode === "still" ? <Horizon2D live={mode === "canvas"} /> : null}
    </div>
  );
}
