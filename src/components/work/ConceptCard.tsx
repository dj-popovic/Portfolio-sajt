"use client";

import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import type { DemoKey } from "@/components/work/concepts";
import { ConceptMark } from "@/components/work/marks";
import { cn } from "@/lib/cn";

const WEB_W = 960; // the sites' page width in the previews (previews.tsx)
const PHONE = { w: 300, h: 640 }; // the phones' size
// a site preview on hover scrolls itself at an even pace: page px per second
// (of the 960px replica), and how quickly it gets going and comes to a stop
const SCROLL_SPEED = 320;
const RETURN_SPEED = 1200; // back to the top once the pointer leaves
const ACCEL = 1600; // px/s² to pick up speed (or turn round)
const BRAKE = 900; // px/s² to settle at either end
const REST = [900, 1200]; // ms it rests at the top and at the bottom
const DWELL = [2400, 4200, 3600]; // ms on each phone screen while it plays

type ConceptCardProps = {
  demo: DemoKey;
  kind: "web" | "app";
  brand: string;
  kindLabel: string;
  value: ReactNode;
  openLabel: string;
  ariaLabel: string;
  /** backdrop behind an app's phone */
  stage?: string;
  /** floating glass chips beside an app's phone */
  chips?: ReactNode;
  onOpen: (card: HTMLElement) => void;
  /** the preview (previews.tsx) */
  children: ReactNode;
};

/**
 * One concept, as a pane of the dark card material (the founder cards')
 * around a live preview. Pointer: the card tilts and catches the light, an
 * "Open" pill trails the cursor; a site preview scrolls itself down the page
 * and back at an even pace (never tied to the pointer, which can be too
 * quick), an app's phone runs through its screens while its chips drift with
 * the pointer. Touch: the preview plays while the card is in view. Reduced
 * motion: still.
 */
export function ConceptCard({
  demo,
  kind,
  brand,
  kindLabel,
  value,
  openLabel,
  ariaLabel,
  stage,
  chips,
  onOpen,
  children,
}: ConceptCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const media = el?.querySelector<HTMLElement>(".cc-media");
    if (!el || !media) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none)").matches;
    const web = kind === "web";
    const view = el.querySelector<HTMLElement>(".cc-view");
    const track = el.querySelector<HTMLElement>(".pv-track");
    const phone = el.querySelector<HTMLElement>(".pv-phone");
    const thumb = el.querySelector<HTMLElement>(".cc-scroll i");
    const glare = el.querySelector<HTMLElement>(".cc-glare");
    const cursor = el.querySelector<HTMLElement>(".cc-cursor");
    const chipEls = Array.from(el.querySelectorAll<HTMLElement>(".cc-chip"));

    // ---- fit the replica to the card
    let k = 0.6;
    let maxScroll = 0;
    // layout px of the 960px page: the card's tilt and its entrance don't change them
    const measure = () => {
      if (track && view) maxScroll = Math.max(0, track.offsetHeight - view.clientHeight / k);
    };
    const fit = () => {
      if (web && view && track) {
        k = view.clientWidth / WEB_W;
        el.style.setProperty("--k", k.toFixed(4));
        el.style.setProperty("--vh", `${(view.clientHeight / k).toFixed(1)}px`);
        measure();
      } else if (phone) {
        const pk = Math.min((media.clientHeight - 30) / PHONE.h, (media.clientWidth * 0.46) / PHONE.w);
        el.style.setProperty("--pk", pk.toFixed(4));
      }
    };
    const ro = new ResizeObserver(fit);
    ro.observe(media);
    fit();

    // ---- a site scrolling itself: down the page, a rest, back up, a rest, while
    // it plays; home to the top when it stops. Speed eases in and out (never a
    // jolt, even turning round mid-way), and it settles at each end.
    let active = false;
    let y = 0;
    let v = 0;
    let down = false; // heading for the bottom (else the top)
    let restUntil = 0;
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!active) down = false;
      else if (now > restUntil && v === 0 && y === (down ? maxScroll : 0)) down = !down;
      const goal = down ? maxScroll : 0;
      const cruise = active ? SCROLL_SPEED : RETURN_SPEED;
      const d = goal - y;
      // as fast as it may go, and slow enough to stop at the goal
      const want = Math.sign(d) * Math.min(cruise, Math.sqrt(2 * BRAKE * Math.abs(d)));
      v += Math.max(-ACCEL * dt, Math.min(ACCEL * dt, want - v));
      const next = Math.min(maxScroll, Math.max(0, y + v * dt));
      if (Math.abs(d) < 0.5 || (goal - next) * d <= 0) {
        // there: settle, and rest a moment before turning round
        if (y !== goal || v !== 0) restUntil = now + REST[down ? 1 : 0];
        y = goal;
        v = 0;
      } else y = next;
      if (track) track.style.transform = `translate3d(0, ${(-y).toFixed(2)}px, 0)`;
      if (thumb) thumb.style.transform = `translateY(${maxScroll ? ((y / maxScroll) * 257).toFixed(1) : 0}%)`;
      raf = active || y !== 0 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (raf || !web) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // ---- a phone running through its screens
    let screen = 0;
    let timer = 0;
    const show = (n: number) => {
      screen = n;
      if (phone) phone.dataset.screen = String(n);
    };
    const cycle = () => {
      show((screen + 1) % DWELL.length);
      timer = window.setTimeout(cycle, DWELL[screen]);
    };

    const setActive = (on: boolean) => {
      if (on === active) return;
      active = on;
      el.classList.toggle("is-active", on);
      if (reduce) return;
      if (web) {
        if (on) {
          measure(); // the page may have grown since (fonts, images)
          // a beat before it starts from the top (a pointer passing over doesn't set it off);
          // caught on its way home, it heads straight back down
          restUntil = performance.now() + 160;
          if (y > 0) down = true;
        }
        kick();
      } else {
        window.clearTimeout(timer);
        if (on) timer = window.setTimeout(cycle, 700);
        else show(0);
      }
    };

    // ---- on screen: idle motion; on touch screens, mostly in view = playing
    const io = new IntersectionObserver(
      ([e]) => {
        el.classList.toggle("is-live", e.isIntersecting);
        if (touch) setActive(e.intersectionRatio > 0.55);
      },
      { threshold: [0, 0.55, 0.8] },
    );
    io.observe(el);

    // ---- pointer
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setActive(true);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      if (glare) {
        glare.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        glare.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      }
      const m = media.getBoundingClientRect();
      const inside = e.clientY < m.bottom;
      if (cursor) {
        cursor.style.transform = `translate3d(${(e.clientX - m.left + 14).toFixed(1)}px, ${(e.clientY - m.top + 16).toFixed(1)}px, 0)`;
        cursor.classList.toggle("is-on", inside);
      }
      if (reduce) return;
      el.style.setProperty("--rx", `${((0.5 - py) * 5).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * 7).toFixed(2)}deg`);
      // the phone turns a little and its chips drift, at different depths
      if (phone)
        phone.style.transform = `rotateY(${((px - 0.5) * 14).toFixed(2)}deg) rotateX(${((0.5 - py) * 8).toFixed(2)}deg)`;
      chipEls.forEach((c, i) => {
        const depth = i ? 22 : 14;
        c.style.translate = `${((px - 0.5) * depth).toFixed(1)}px ${((py - 0.5) * depth).toFixed(1)}px`;
      });
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setActive(false);
      cursor?.classList.remove("is-on");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      if (phone) phone.style.transform = "";
      chipEls.forEach((c) => (c.style.translate = ""));
    };
    // keyboard focus plays it too
    const onFocus = () => el.matches(":focus-visible") && setActive(true);
    const onBlur = () => setActive(false);

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    };
  }, [kind]);

  const open = () => ref.current && onOpen(ref.current);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <div
      ref={ref}
      className={cn("concept-card", `is-${kind}`)}
      data-demo={demo}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      onClick={open}
      onKeyDown={onKey}
    >
      <div className="cc-media" aria-hidden style={stage ? ({ "--stage": stage } as CSSProperties) : undefined}>
        {kind === "web" ? (
          <>
            <div className="cc-browser">
              <span className="cc-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="cc-address">
                <ConceptMark kind={demo} size={14} />
                {brand}
              </span>
            </div>
            <div className="cc-view">{children}</div>
            <span className="cc-scroll">
              <i />
            </span>
          </>
        ) : (
          <>
            <div className="cc-device">{children}</div>
            {chips}
          </>
        )}
        <span className="cc-cursor">
          <span>
            {openLabel}
            <ArrowUpRight />
          </span>
        </span>
      </div>
      <div className="cc-meta">
        <ConceptMark kind={demo} size={38} />
        <div className="cc-text">
          <p className="cc-brand">{brand}</p>
          <p className="cc-value">{value}</p>
        </div>
        <span className="cc-kind">{kindLabel}</span>
        <span className="cc-go" aria-hidden>
          <ArrowUpRight />
        </span>
      </div>
      <span className="cc-glare" aria-hidden />
    </div>
  );
}
