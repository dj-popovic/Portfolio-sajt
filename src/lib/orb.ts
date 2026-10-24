// The hero orb: a sphere of ember dots lit from the upper right, dense where
// the light falls and grainy in the shadow. Shared by the WebGL layer (fixed
// behind the page), the 2D fallback inside the hero and the hit area that
// takes the pointer and the keys. Plain mutable state on purpose: it is
// written by events and read every frame.

export type OrbLayout = { x: number; y: number; r: number };

const len = Math.hypot(0.62, 0.5, 0.6);

export const ORB = {
  /** light direction in view space (x right, y up, z toward the viewer) */
  light: [0.62 / len, 0.5 / len, 0.6 / len] as const,
  /** idle spin, rad/s */
  drift: 0.09,
  /** resting pitch: a little of the top shows */
  tilt: 0.32,
  pitchLimit: 1.05,
  /** seconds a ripple takes to cross the surface and fade */
  rippleLife: 1.7,
};

/** Stacked hero (phones, tall tablets): the orb on top, the headline under it. Mirrors the CSS media query. */
export const isStacked = (w: number, h: number) => w < 760 || (w < 1024 && h > w * 1.1);

/** Where the orb sits in a w × h viewport (CSS px). */
export function orbLayout(w: number, h: number): OrbLayout {
  if (isStacked(w, h)) {
    const r = Math.min(w * 0.38, h * 0.21);
    return { x: w * 0.5, y: Math.max(r + 86, h * 0.31), r };
  }
  const r = Math.min(w * 0.26, h * 0.37);
  return { x: w * 0.7, y: h * 0.5, r };
}

// Phones resize the viewport when the URL bar slides away; the orb should not
// jump with it, so small height-only changes keep the previous height.
let stable = { w: 0, h: 0 };
export function viewportSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w !== stable.w || Math.abs(h - stable.h) > 150) stable = { w, h };
  return stable;
}

/**
 * Fibonacci lattice with grain. Per dot: a unit-sphere position (radius
 * jittered so the surface reads as stipple) and four seeds: dither threshold,
 * size/brightness, unravel order (bottom first) and a free phase.
 */
export function buildOrb(count: number) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  // about one lattice spacing of jitter, so the spiral pattern dissolves into stipple
  const jitter = 1.7 * Math.sqrt((4 * Math.PI) / count);
  for (let i = 0; i < count; i++) {
    const ly = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(1 - ly * ly);
    const a = i * golden;
    let x = Math.cos(a) * ring + (Math.random() - 0.5) * jitter;
    let y = ly + (Math.random() - 0.5) * jitter;
    let z = Math.sin(a) * ring + (Math.random() - 0.5) * jitter;
    const rr =
      (Math.random() < 0.05 ? 1 + Math.random() * 0.08 : 1 + (Math.random() - 0.5) * 0.035) / Math.hypot(x, y, z);
    x *= rr;
    y *= rr;
    z *= rr;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    seed[i * 4] = Math.random();
    seed[i * 4 + 1] = Math.random();
    seed[i * 4 + 2] = Math.min(1, Math.max(0, (y + 1) / 2)) * 0.84 + Math.random() * 0.16;
    seed[i * 4 + 3] = Math.random();
  }
  return { pos, seed };
}

type Aim = { el: HTMLElement; edge: "center" | "top" };

export const orb = {
  yaw: 0.7,
  pitch: ORB.tilt,
  vyaw: ORB.drift,
  vpitch: 0,
  dragging: false,
  /** pointer in viewport px and whether it is over the disc */
  pointer: { x: -9999, y: -9999, over: false },
  /** object-space direction of the last ripple and its age in seconds (< 0: none) */
  ripple: { x: 0, y: 0, z: 1, t: -1 },
  /** 0 → 1 while the hero scrolls into About: sphere → thread → the ★ tile */
  morph: 0,
  /** what the thread runs into: the About tile (desktop) or the top of the About panel */
  aim: null as Aim | null,
};

/** Advance the spin. A drag sets it directly; afterwards it eases back into the drift. */
export function stepOrb(dt: number, drift = true) {
  if (orb.ripple.t >= 0) {
    orb.ripple.t += dt;
    if (orb.ripple.t > ORB.rippleLife) orb.ripple.t = -1;
  }
  if (orb.dragging) return;
  const k = 1 - Math.exp(-dt * 1.4);
  orb.vyaw += ((drift ? ORB.drift : 0) - orb.vyaw) * k;
  orb.vpitch -= orb.vpitch * Math.min(1, k * 2);
  orb.yaw += orb.vyaw * dt;
  orb.pitch += orb.vpitch * dt;
  orb.pitch += (ORB.tilt - orb.pitch) * (1 - Math.exp(-dt * 0.9));
}

/** Object → view rotation (pitch after yaw), row-major. */
export function orbRotation(yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy] as const;
}

/** Start a ripple where a viewport point lands on the disc (the front of the orb when off it). */
export function rippleAt(px: number, py: number, layout: OrbLayout) {
  let dx = (px - layout.x) / layout.r;
  let dy = -(py - layout.y) / layout.r;
  const d2 = dx * dx + dy * dy;
  if (d2 > 1) {
    const d = Math.sqrt(d2);
    dx /= d;
    dy /= d;
  }
  const dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
  // view → object: the transpose of the rotation
  const m = orbRotation(orb.yaw, orb.pitch);
  orb.ripple.x = m[0] * dx + m[3] * dy + m[6] * dz;
  orb.ripple.y = m[1] * dx + m[4] * dy + m[7] * dz;
  orb.ripple.z = m[2] * dx + m[5] * dy + m[8] * dz;
  orb.ripple.t = 0;
}

// The 2D fallback draws on demand under reduced motion: tell it when the orb moved.
const listeners = new Set<() => void>();
export const orbEvents = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  emit() {
    listeners.forEach((fn) => fn());
  },
};
