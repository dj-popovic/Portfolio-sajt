/**
 * Write an inset() clip-path from numbers. Tween the numbers (on a proxy),
 * never the clip-path string itself: browsers normalise strings like
 * "inset(0px 0px 0px 0px round 0px)" to "inset(0px)", which makes string
 * tweening pair the wrong numbers.
 */
export function setInset(el: HTMLElement, y: number, x: number, r: number, unit: "px" | "%" = "px") {
  el.style.clipPath = `inset(${y.toFixed(2)}px ${x.toFixed(2)}${unit} ${y.toFixed(2)}px ${x.toFixed(2)}${unit} round ${r.toFixed(2)}px)`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIn = (t: number) => t * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/**
 * About tile ↔ full panel. p = 0 is the small rounded tile in the centre,
 * p = 1 is fully open. Goes through a rounder "mid" shape, like the reel.
 */
export function tileClip(el: HTMLElement, p: number, tile: number) {
  const W = el.offsetWidth;
  const H = el.offsetHeight;
  const closed = { x: Math.max(0, (W - tile) / 2), y: Math.max(0, (H - tile) / 2), r: 26 };
  const mid = { x: W * 0.3, y: H * 0.26, r: 64 };
  if (p <= 0.5) {
    const t = easeIn(p / 0.5);
    setInset(el, lerp(closed.y, mid.y, t), lerp(closed.x, mid.x, t), lerp(closed.r, mid.r, t));
  } else {
    const t = easeOut((p - 0.5) / 0.5);
    setInset(el, lerp(mid.y, 0, t), lerp(mid.x, 0, t), lerp(mid.r, 0, t));
  }
}
