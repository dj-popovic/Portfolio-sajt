/**
 * Write an inset() clip-path from numbers. Tween the numbers (on a proxy),
 * never the clip-path string itself: browsers normalise strings like
 * "inset(0px 0px 0px 0px round 0px)" to "inset(0px)", which makes string
 * tweening pair the wrong numbers.
 */
export function setInset(el: HTMLElement, y: number, x: number, r: number, unit: "px" | "%" = "px", bottom = y) {
  el.style.clipPath = `inset(${y.toFixed(2)}px ${x.toFixed(2)}${unit} ${bottom.toFixed(2)}px ${x.toFixed(2)}${unit} round ${r.toFixed(2)}px)`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIn = (t: number) => t * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

// y is the top inset, b the bottom one
type Inset = { x: number; y: number; b: number; r: number };

/**
 * About tile ↔ open panel. p = 0 is the small rounded tile in the centre,
 * p = 1 is fully open (`open`: the inset it opens to, a sheet floating on the
 * page). Goes through a rounder "mid" shape, like the reel.
 */
export function tileClip(el: HTMLElement, p: number, tile: number, open: Inset = { x: 0, y: 0, b: 0, r: 0 }) {
  const W = el.offsetWidth;
  const H = el.offsetHeight;
  const cy = Math.max(0, (H - tile) / 2);
  const closed = { x: Math.max(0, (W - tile) / 2), y: cy, b: cy, r: 26 };
  const mid = { x: W * 0.3, y: H * 0.26, b: H * 0.26, r: 64 };
  const [from, to, t] = p <= 0.5 ? [closed, mid, easeIn(p / 0.5)] : [mid, open, easeOut((p - 0.5) / 0.5)];
  const inset = {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    b: lerp(from.b, to.b, t),
    r: lerp(from.r, to.r, t),
  };
  setInset(el, inset.y, inset.x, inset.r, "px", inset.b);
  return inset;
}

/** The sheets' shape from the stylesheet (registered lengths, so they read in px). */
export function sheetShape(el: Element = document.documentElement) {
  const cs = getComputedStyle(el);
  return {
    gap: parseFloat(cs.getPropertyValue("--sheet-gap")) || 0,
    r: parseFloat(cs.getPropertyValue("--sheet-r")) || 0,
  };
}

type V = [number, number];
// a cubic that turns a quarter like a circle
const KAPPA = 0.5523;
const n = (v: number) => v.toFixed(1);

/** a point on the quadratic a → c → b, and its unit tangent there */
function quad(a: V, c: V, b: V, t: number) {
  const u = 1 - t;
  const p: V = [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  const l = Math.hypot(dx, dy) || 1;
  return { p, d: [dx / l, dy / l] as V };
}

/**
 * A sheet as a path: a w × h card with corners rounded by r whose top edge bows up
 * by `top` (its corners that much lower than its middle) and whose bottom edge bows
 * down by `bottom`. Flat edges give the plain rounded card, the border-radius' shape.
 */
export function sheetPath(w: number, h: number, top: number, bottom: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, (h - top - bottom) / 2));
  const k = r * KAPPA;
  // the top edge runs left → right from (0, top) to (w, top), its middle at y = 0
  const ta: V = [0, top];
  const tc: V = [w / 2, -top];
  const tb: V = [w, top];
  // the bottom edge runs right → left, its middle at y = h
  const ba: V = [w, h - bottom];
  const bc: V = [w / 2, h + bottom];
  const bb: V = [0, h - bottom];
  // where each edge hands over to its rounded corners: about r along it
  const ts = Math.min(0.49, r / Math.hypot(w, 4 * top));
  const bs = Math.min(0.49, r / Math.hypot(w, 4 * bottom));
  const t0 = quad(ta, tc, tb, ts);
  const t1 = quad(ta, tc, tb, 1 - ts);
  const b0 = quad(ba, bc, bb, bs);
  const b1 = quad(ba, bc, bb, 1 - bs);
  // the middle stretch of a quadratic is a quadratic: its control by blossoming
  const sub = (a: V, c: V, b: V, s0: number, s1: number): V => {
    const w0 = (1 - s0) * (1 - s1);
    const w1 = (1 - s0) * s1 + s0 * (1 - s1);
    const w2 = s0 * s1;
    return [w0 * a[0] + w1 * c[0] + w2 * b[0], w0 * a[1] + w1 * c[1] + w2 * b[1]];
  };
  const tm = sub(ta, tc, tb, ts, 1 - ts);
  const bm = sub(ba, bc, bb, bs, 1 - bs);
  return [
    `M0 ${n(top + r)}`,
    // top-left corner, the top edge, top-right corner
    `C0 ${n(top + r - k)} ${n(t0.p[0] - t0.d[0] * k)} ${n(t0.p[1] - t0.d[1] * k)} ${n(t0.p[0])} ${n(t0.p[1])}`,
    `Q${n(tm[0])} ${n(tm[1])} ${n(t1.p[0])} ${n(t1.p[1])}`,
    `C${n(t1.p[0] + t1.d[0] * k)} ${n(t1.p[1] + t1.d[1] * k)} ${n(w)} ${n(top + r - k)} ${n(w)} ${n(top + r)}`,
    `L${n(w)} ${n(h - bottom - r)}`,
    // bottom-right corner, the bottom edge, bottom-left corner
    `C${n(w)} ${n(h - bottom - r + k)} ${n(b0.p[0] - b0.d[0] * k)} ${n(b0.p[1] - b0.d[1] * k)} ${n(b0.p[0])} ${n(b0.p[1])}`,
    `Q${n(bm[0])} ${n(bm[1])} ${n(b1.p[0])} ${n(b1.p[1])}`,
    `C${n(b1.p[0] + b1.d[0] * k)} ${n(b1.p[1] + b1.d[1] * k)} 0 ${n(h - bottom - r + k)} 0 ${n(h - bottom - r)}`,
    "Z",
  ].join("");
}
