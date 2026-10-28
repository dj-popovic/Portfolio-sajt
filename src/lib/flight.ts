// Little flights across the page in the orb's dots: an add-on into the package buttons,
// an answer into the brief, a package's ticket down to Contact. They're decoration: each
// resolves when it lands, and at once under reduced motion. Points are in the viewport and
// targets are read again every frame, so a page that scrolls mid-flight is still met.

export type Point = { x: number; y: number };

const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let layer: HTMLDivElement | null = null;
function flightLayer() {
  if (!layer || !layer.isConnected) {
    layer = document.createElement("div");
    layer.className = "flight-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }
  return layer;
}

/** A point in an element's box, in the viewport (its centre by default). */
export function pointIn(el: Element, fx = 0.5, fy = 0.5): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width * fx, y: r.top + r.height * fy };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// a bow off the straight line from a to b, on the upper side, as deep as `bow` × the trip
function bend(a: Point, b: Point, bow: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = dy / len;
  let ny = -dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return { x: a.x + dx / 2 + nx * len * bow, y: a.y + dy / 2 + ny * len * bow };
}
function along(a: Point, c: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}

const TRAIL = 6;

/**
 * A comet of ember dots on a bow from one point to a target. `to` is asked every frame
 * (null keeps the last point).
 */
export function flyDots(
  from: Point,
  to: () => Point | null,
  { delay = 0, duration = 0.6, bow = 0.28 }: { delay?: number; duration?: number; bow?: number } = {},
): Promise<void> {
  if (reduce()) return Promise.resolve();
  return new Promise((resolve) => {
    const host = flightLayer();
    const dots = Array.from({ length: TRAIL }, (_, i) => {
      const d = document.createElement("i");
      d.className = i ? "fl-dot" : "fl-dot is-head";
      d.style.opacity = "0";
      host.appendChild(d);
      return d;
    });
    const start = performance.now() + delay * 1000;
    let end = to() ?? from;
    const frame = (now: number) => {
      end = to() ?? end;
      const c = bend(from, end, bow);
      let flying = now < start;
      dots.forEach((d, i) => {
        const t = clamp01((now - start) / (duration * 1000) - i * 0.045);
        if (t < 1) flying = true;
        const p = along(from, c, end, easeInOut(t));
        const size = 1 - i * 0.11;
        d.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${size.toFixed(2)})`;
        d.style.opacity = t <= 0 || t >= 1 ? "0" : ((1 - i / TRAIL) * Math.min(1, t * 8)).toFixed(2);
      });
      if (flying) requestAnimationFrame(frame);
      else {
        dots.forEach((d) => d.remove());
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
}

/**
 * A package's ticket: it lifts out of the button it was picked with and rides down the
 * page with the scroll to its slot in Contact (`to`, asked every frame), then settles
 * into it. Resolves when it has landed.
 */
export function flyTicket(
  from: Element,
  label: { name: string; more: string | null },
  to: () => Element | null,
  { duration = 1.35 }: { duration?: number } = {},
): Promise<void> {
  if (reduce()) return Promise.resolve();
  return new Promise((resolve) => {
    const host = flightLayer();
    const ticket = document.createElement("div");
    ticket.className = "fl-ticket";
    const inner = document.createElement("span");
    inner.className = "fl-ticket-in";
    const name = document.createElement("b");
    name.textContent = label.name;
    inner.append(name);
    if (label.more) {
      const more = document.createElement("i");
      more.textContent = label.more;
      inner.append(more);
    }
    ticket.append(inner);
    host.appendChild(ticket);
    const trail = Array.from({ length: 4 }, () => {
      const d = document.createElement("i");
      d.className = "fl-dot";
      d.style.opacity = "0";
      host.appendChild(d);
      return d;
    });
    const w = ticket.offsetWidth;
    const h = ticket.offsetHeight;
    const a = pointIn(from);
    const history: Point[] = [];
    const t0 = performance.now();
    let end = a;
    let landedAt = 0;
    let still = 0;

    const frame = (now: number) => {
      const target = to();
      const next = target ? pointIn(target) : end;
      still = Math.hypot(next.x - end.x, next.y - end.y) < 0.5 ? still + 1 : 0;
      end = next;
      const t = clamp01((now - t0) / (duration * 1000));
      // out of the button first (a small pop and lift), then down to the slot
      const pop = clamp01(t / 0.16);
      const travel = easeInOut(clamp01((t - 0.1) / 0.9));
      const lifted = { x: a.x, y: a.y - 26 * pop };
      const p = along(lifted, bend(lifted, end, 0.12), end, travel);
      const scale = 0.55 + 0.45 * (1 - Math.pow(1 - pop, 3));
      ticket.style.transform = `translate3d(${(p.x - w / 2).toFixed(1)}px, ${(p.y - h / 2).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      ticket.style.opacity = String(Math.min(1, pop * 2));
      history.unshift(p);
      history.length = Math.min(history.length, 24);
      trail.forEach((d, i) => {
        const q = history[(i + 1) * 4];
        if (!q || t >= 1) return void (d.style.opacity = "0");
        d.style.transform = `translate3d(${q.x.toFixed(1)}px, ${(q.y + h * 0.1).toFixed(1)}px, 0) scale(${(1 - i * 0.18).toFixed(2)})`;
        d.style.opacity = (0.7 - i * 0.15).toFixed(2);
      });
      if (t < 1) return void requestAnimationFrame(frame);
      // there: ride with the slot while the page settles, then sink into it
      landedAt ||= now;
      if (still < 3 && now - landedAt < 450) return void requestAnimationFrame(frame);
      ticket.classList.add("is-docking");
      ticket.style.transform = `translate3d(${(end.x - w / 2).toFixed(1)}px, ${(end.y - h / 2).toFixed(1)}px, 0) scale(0.86)`;
      ticket.style.opacity = "0";
      trail.forEach((d) => d.remove());
      window.setTimeout(() => {
        ticket.remove();
        resolve();
      }, 220);
    };
    requestAnimationFrame(frame);
  });
}

/** Where a picked package's ticket lands: its row in the brief, or on phones the chat's note of it. */
export function ticketSlot(): Element | null {
  const compact = window.matchMedia("(max-width: 920px)").matches;
  return document.querySelector(compact ? '[data-dock="start-compact"]' : '[data-dock="start"]');
}
