"use client";

import { useEffect, useRef } from "react";

/**
 * A warm light that follows the pointer across its section, behind the
 * glass, so the panes have something to bend. Drop it straight inside a
 * <section> (it's positioned against it). Mouse and motion only.
 */
export function SectionLight({ className }: { className: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const light = ref.current;
    const section = light?.closest("section");
    if (!light || !section) return;
    if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = section.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        light.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
        light.classList.add("is-on");
      });
    };
    const leave = () => light.classList.remove("is-on");
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <span ref={ref} className={className} aria-hidden />;
}
