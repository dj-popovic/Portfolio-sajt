// The footer's horizon: the hero's orb once more, risen huge behind the edge
// of the page so only its crown shows, in the same dots. Shared by the WebGL
// scene, the 2D fallback and the footer that feeds them the pointer, taps
// and when to gather in. Plain mutable state, like the orb's: written by
// events, read every frame.

const unit = (x: number, y: number, z: number) => {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l] as const;
};

export const HORIZON = {
  /** at rest, light from the upper right like the orb's, a little behind so the rim burns */
  light: unit(0.55, 0.8, -0.05),
  /** idle spin about the vertical axis, rad/s */
  drift: 0.04,
  /** dots exist only above this height on the unit sphere: the crown */
  yMin: 0.5,
  /** seconds a ripple takes to run out */
  rippleLife: 2.4,
  /** seconds the dots take to gather in from a loose cloud, the first time the footer shows */
  gather: 2.6,
};

export type HorizonLayout = { x: number; y: number; r: number };

/** The sphere in a w × h canvas: wider than the page, its crown rising from the bottom edge. */
export function horizonLayout(w: number, h: number): HorizonLayout {
  const r = Math.max(w * 0.7, 640);
  const crown = Math.min(h * 0.88, r * (1 - HORIZON.yMin) * 0.9);
  return { x: w / 2, y: h - crown + r, r };
}

/**
 * Fibonacci lattice over the crown (y from yMin to 1), with the orb's grain:
 * a small radius jitter so it reads as stipple, and four seeds per dot
 * (dither threshold, size/brightness, gather order, phase).
 */
export function buildHorizon(count: number) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const span = 1 - HORIZON.yMin;
  // about one lattice spacing of jitter, so the spiral dissolves into stipple
  const jitter = 1.7 * Math.sqrt((2 * Math.PI * span) / count);
  for (let i = 0; i < count; i++) {
    const ly = 1 - (span * (i + 0.5)) / count;
    const ring = Math.sqrt(Math.max(0, 1 - ly * ly));
    const a = i * golden;
    let x = Math.cos(a) * ring + (Math.random() - 0.5) * jitter;
    let y = ly + (Math.random() - 0.5) * jitter;
    let z = Math.sin(a) * ring + (Math.random() - 0.5) * jitter;
    // the orb's grain, scaled to a sphere about three times its size
    const rr =
      (Math.random() < 0.05 ? 1 + Math.random() * 0.028 : 1 + (Math.random() - 0.5) * 0.012) / Math.hypot(x, y, z);
    x *= rr;
    y *= rr;
    z *= rr;
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    seed[i * 4] = Math.random();
    seed[i * 4 + 1] = Math.random();
    seed[i * 4 + 2] = Math.random();
    seed[i * 4 + 3] = Math.random();
  }
  return { pos, seed };
}

/** The light the pointer shines on the sphere from where it is (view space). */
export function pointerLight(px: number, py: number, layout: HorizonLayout) {
  return unit((px - layout.x) / layout.r, ((layout.y - py) / layout.r) * 0.7 + 0.3, 0.5);
}

export const horizon = {
  yaw: 0,
  /** set once the footer is in view: the dots start gathering in */
  started: false,
  /** 0 → 1 over HORIZON.gather seconds once started (time, not scroll: it always completes) */
  intro: 0,
  /** pointer in canvas px, and whether it is over the footer */
  pointer: { x: -9999, y: -9999, over: false },
  /** object-space direction of the last tap and its age in seconds (< 0: none) */
  ripple: { x: 0, y: 1, z: 0, t: -1 },
};

/** Object → view rotation about the vertical axis, row-major. */
export function horizonRotation(yaw: number) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [c, 0, s, 0, 1, 0, -s, 0, c] as const;
}

/** Start a ripple where a canvas point lands on the sphere (nothing if it misses). */
export function rippleOnHorizon(px: number, py: number, layout: HorizonLayout) {
  const dx = (px - layout.x) / layout.r;
  const dy = -(py - layout.y) / layout.r;
  const d2 = dx * dx + dy * dy;
  if (d2 > 1) return false;
  const dz = Math.sqrt(1 - d2);
  // view → object: the transpose of the rotation
  const m = horizonRotation(horizon.yaw);
  horizon.ripple.x = m[0] * dx + m[3] * dy + m[6] * dz;
  horizon.ripple.y = m[1] * dx + m[4] * dy + m[7] * dz;
  horizon.ripple.z = m[2] * dx + m[5] * dy + m[8] * dz;
  horizon.ripple.t = 0;
  return true;
}

/** Advance the spin, the gathering and the ripple. */
export function stepHorizon(dt: number) {
  horizon.yaw += HORIZON.drift * dt;
  if (horizon.started && horizon.intro < 1) horizon.intro = Math.min(1, horizon.intro + dt / HORIZON.gather);
  if (horizon.ripple.t >= 0) {
    horizon.ripple.t += dt;
    if (horizon.ripple.t > HORIZON.rippleLife) horizon.ripple.t = -1;
  }
}
