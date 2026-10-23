import type { PointerEvent } from "react";

const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pointer tilt for cards: writes --mx/--my (glow position) and --rx/--ry
 * (tilt) on the hovered element; the card's CSS turns them into a transform.
 */
export function tiltMove(e: PointerEvent<HTMLElement>, max = 5) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
  el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  if (reduce()) return;
  el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
}

export function tiltLeave(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}
