"use client";

import { useSyncExternalStore } from "react";
import { Orb2D } from "@/components/canvas/Orb2D";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (change: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", change);
  return () => mq.removeEventListener("change", change);
};

/**
 * The 404's orb: the hero's sphere of dots on a 2D canvas, where the hero has it (right of
 * the headline, above it on phones). It drifts by itself; under reduced motion it is a
 * still frame. No WebGL layer here: a page you land on by mistake shouldn't load one.
 */
export function LostOrb() {
  const still = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCE).matches,
    () => null,
  );
  if (still === null) return null;
  return <Orb2D className="hero-canvas" live={!still} />;
}
