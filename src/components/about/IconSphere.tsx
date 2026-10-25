"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { overlay } from "@/lib/overlay";
import { TECH, type TechId } from "@/lib/tech-icons";
import { cn } from "@/lib/cn";

/** Evenly spread directions on a unit sphere (Fibonacci lattice). */
function lattice(n: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const ring = Math.sqrt(1 - y * y);
    return [Math.cos(i * golden) * ring, y, Math.sin(i * golden) * ring] as const;
  });
}

/**
 * The hero orb's idea again, with tools instead of dots: logos on a sphere
 * that turns slowly, nearer ones larger and brighter. Speeds up while its
 * card is hovered; still under reduced motion; pauses off-screen and while
 * a full-screen overlay is open.
 */
export function IconSphere({
  stack,
  className,
  inOverlay = false,
}: {
  stack: TechId[];
  className?: string;
  /** lives inside the overlay itself (the founder dialog), so it keeps turning while it is open */
  inOverlay?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-icon]"));
    const dirs = lattice(items.length);
    const card = el.closest<HTMLElement>("[data-sphere-host]");
    const still = prefersReducedMotion();
    let R = el.clientWidth * 0.36;
    let yaw = 0.4;
    const pitch = -0.32;
    let speed = 0.32;
    let target = 0.32;

    const place = () => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      dirs.forEach(([x, y, z], i) => {
        const x1 = cy * x + sy * z;
        const z1 = -sy * x + cy * z;
        const y2 = cp * y - sp * z1;
        const z2 = sp * y + cp * z1;
        const depth = (z2 + 1) / 2;
        const s = items[i].style;
        s.transform = `translate3d(${(x1 * R).toFixed(1)}px, ${(-y2 * R).toFixed(1)}px, 0) scale(${(0.56 + 0.44 * depth).toFixed(3)})`;
        s.opacity = (0.16 + 0.84 * depth ** 1.6).toFixed(3);
        s.zIndex = String(Math.round(depth * 100));
      });
    };

    const ro = new ResizeObserver(() => {
      R = el.clientWidth * 0.36;
      place();
    });
    ro.observe(el);
    place();
    if (still) return () => ro.disconnect();

    let raf = 0;
    let last = 0;
    let visible = false;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      speed += (target - speed) * (1 - Math.exp(-dt * 3));
      yaw += speed * dt;
      place();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (!visible || document.hidden || (!inOverlay && overlay.isOpen())) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(el);
    const fast = () => (target = 1.1);
    const slow = () => (target = 0.32);
    card?.addEventListener("pointerenter", fast);
    card?.addEventListener("pointerleave", slow);
    const unsubscribe = overlay.subscribe(run);
    document.addEventListener("visibilitychange", run);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      unsubscribe();
      card?.removeEventListener("pointerenter", fast);
      card?.removeEventListener("pointerleave", slow);
      document.removeEventListener("visibilitychange", run);
    };
  }, [inOverlay]);

  return (
    <div ref={root} className={cn("isphere", className)} aria-hidden>
      <span className="isphere-core" />
      <span className="isphere-ring" />
      <span className="isphere-ring is-tilted" />
      {stack.map((id) => (
        <span key={id} className="isphere-icon" data-icon>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d={TECH[id].path} />
          </svg>
        </span>
      ))}
    </div>
  );
}
