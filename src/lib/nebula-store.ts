// Mutable state shared between GSAP scroll triggers / pointer listeners and
// the R3F render loop. Plain object on purpose: written often, read every frame.
export const nebula = {
  /** 0 → 1 while the hero scrolls out (camera pushes into the nebula) */
  hero: 0,
  /** how bright the field should be behind the current section (lerped in the loop) */
  intensity: 1,
  /** pointer in normalised device coords (-1..1), and whether it is over the hero */
  pointer: { x: 0, y: 0, active: false },
};

export const NEBULA_INTENSITY = {
  hero: 1,
  /** soft ember glow left behind the dark content sections */
  glow: 0.45,
  off: 0,
} as const;
