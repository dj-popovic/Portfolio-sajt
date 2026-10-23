"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Motion (the micro-interaction library) follows the OS reduced-motion setting: movement off, fades stay. */
export function MotionPreferences({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
