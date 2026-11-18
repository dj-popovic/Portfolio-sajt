"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

/**
 * Calls `onSlow` when a canvas keeps missing frames (averaging under ~48 a second over a
 * second and a half of drawing), so its owner can draw it at a lower pixel ratio. The
 * first two seconds don't count (shaders compile, the page settles), nor does the gap
 * after a pause; after a step down it waits again before judging.
 */
export function useSlowFrames(onSlow?: () => void) {
  const s = useRef({ warm: 0, sum: 0, n: 0 });
  useFrame((_, delta) => {
    if (!onSlow) return;
    const p = s.current;
    if (delta > 0.25) return; // a pause (asleep, a hidden tab), not a slow frame
    p.warm += delta;
    if (p.warm < 2) return;
    p.sum += delta;
    p.n += 1;
    if (p.sum < 1.5) return;
    const slow = p.sum / p.n > 1 / 48;
    p.sum = 0;
    p.n = 0;
    if (!slow) return;
    p.warm = 1;
    onSlow();
  });
}
