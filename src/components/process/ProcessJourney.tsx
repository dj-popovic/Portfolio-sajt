"use client";

import { useRef, type FocusEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { useScroll } from "@/components/motion/SmoothScroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// big screens hold the section still while the steps travel past; smaller ones stack them down a rail
const TRACK = "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 560px)";
const RAIL = "(prefers-reduced-motion: no-preference) and (max-width: 1023px)";

const READ = 0.56; // rail: how far down the viewport the thread is drawn to
const AHEAD = 0.36; // track: the head rides this share of the width past the first node
const HOLD = 0.9; // track: the thread is whole here; the rest of the pinned scroll is a breath
const PACE = 1.1; // track: px of scrolling per px of thread

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

type Geo = { axis: "x" | "y"; at: number[] };

/**
 * How we work, as a thread of light. Big screens: the section holds still
 * while the four panes of glass travel past on a line; the thread is drawn
 * along it, each step's number rolls up like an odometer as the head comes,
 * then its node lights and its pane comes on. Smaller screens: the same down
 * a rail, drawn to a line across the viewport. The phase labels on the line
 * jump to their step. Reduced motion: everything lit, still.
 */
export function ProcessJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const scroll = useScroll();
  const jumpTo = useRef<(i: number) => void>(() => {});

  useGSAP(
    () => {
      const el = root.current;
      const section = el?.closest<HTMLElement>("section");
      const track = el?.querySelector<HTMLElement>(".jy-track");
      const line = el?.querySelector<HTMLElement>(".jy-line");
      const fill = el?.querySelector<HTMLElement>(".jy-fill");
      const head = el?.querySelector<HTMLElement>(".jy-head");
      if (!el || !section || !track || !line || !fill || !head) return;
      const steps = gsap.utils.toArray<HTMLElement>(".jy-step", el);
      const nodes = steps.map((s) => s.querySelector<HTMLElement>(".jy-node"));
      const [glowA, glowB] = gsap.utils.toArray<HTMLElement>(".jy-lights span", el);
      if (steps.length < 2 || nodes.some((n) => !n)) return;

      // node centres in the track's own px (its transform doesn't count); the line runs
      // from the first to the last through their centres, so they sit exactly on it
      let geo: Geo = { axis: "x", at: [] };
      const measure = () => {
        const pts = nodes.map((n, i) => ({
          x: steps[i].offsetLeft + n!.offsetLeft + n!.offsetWidth / 2,
          y: steps[i].offsetTop + n!.offsetTop + n!.offsetHeight / 2,
        }));
        const axis = Math.abs(pts[1].x - pts[0].x) >= Math.abs(pts[1].y - pts[0].y) ? "x" : "y";
        const at = pts.map((p) => p[axis]);
        const across = axis === "x" ? pts[0].y : pts[0].x;
        const len = at[at.length - 1] - at[0];
        el.dataset.axis = axis;
        line.style.left = `${axis === "x" ? at[0] : across - 1}px`;
        line.style.top = `${axis === "x" ? across - 1 : at[0]}px`;
        line.style.width = axis === "x" ? `${len}px` : "2px";
        line.style.height = axis === "x" ? "2px" : `${len}px`;
        line.style.right = line.style.bottom = "auto";
        geo = { axis, at };
      };

      // the thread drawn to h (px along the line's axis, in track px)
      let run = 120; // the number rolls over this stretch before its node
      const paint = (h: number, shift = 0) => {
        const { axis, at } = geo;
        const len = at[at.length - 1] - at[0];
        const f = clamp01((h - at[0]) / len);
        fill.style.transform = axis === "x" ? `scaleX(${f.toFixed(4)})` : `scaleY(${f.toFixed(4)})`;
        const d = (f * len).toFixed(1);
        head.style.transform = axis === "x" ? `translate3d(${d}px, 0, 0)` : `translate3d(0, ${d}px, 0)`;
        head.style.opacity = f > 0.002 && f < 0.998 ? "1" : "0";
        let on = -1;
        steps.forEach((s, i) => {
          const lit = h >= at[i] - 0.5;
          if (lit) on = i;
          s.classList.toggle("is-lit", lit);
          s.style.setProperty("--roll", easeOut(clamp01((h - at[i] + run) / run)).toFixed(3));
        });
        steps.forEach((s, i) => s.classList.toggle("is-on", i === on));
        // warm light rides with the head and waits at the next step, for the glass to bend
        const ahead = at[Math.min(at.length - 1, on + 1)];
        const pos = (v: number) =>
          axis === "x" ? `translate3d(${v.toFixed(0)}px, 0, 0)` : `translate3d(0, ${v.toFixed(0)}px, 0)`;
        if (glowA) glowA.style.transform = pos(shift + h);
        if (glowB) glowB.style.transform = pos(shift + Math.max(ahead, h + 40));
      };
      const reset = () => {
        delete section.dataset.journey;
        track.style.transform = "";
        fill.style.transform = "";
        head.style.transform = "";
        head.style.opacity = "";
        steps.forEach((s) => {
          s.classList.remove("is-lit", "is-on");
          s.style.removeProperty("--roll");
        });
        [glowA, glowB].forEach((g) => g && (g.style.transform = ""));
      };
      // still (reduced motion, or a wide but very short screen): every step in view, in order
      const settle = (i: number) => scroll.scrollTo(steps[i], { offset: -110 });
      jumpTo.current = settle;

      let redraw = () => {};
      const ro = new ResizeObserver(() => {
        measure();
        redraw();
      });
      ro.observe(track);
      measure();

      const mm = gsap.matchMedia();

      // ---------- big screens: pinned, the steps travel past on the line ----------
      mm.add(TRACK, () => {
        section.dataset.journey = "track";
        let readX = 0;
        let maxShift = 0;
        let travel = 1;
        const size = () => {
          measure();
          const { at } = geo;
          run = (at[1] - at[0]) * 0.42;
          readX = at[0] + el.clientWidth * AHEAD;
          maxShift = Math.max(0, track.offsetWidth - el.clientWidth);
          travel = at[at.length - 1] - at[0] + run;
        };
        size();
        const state = { p: 0 };
        const headAt = (p: number) => geo.at[0] - run + travel * Math.min(1, p / HOLD);
        const render = () => {
          const h = headAt(state.p);
          const shift = Math.min(0, Math.max(-maxShift, readX - h));
          track.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0)`;
          paint(h, shift);
        };
        const tween = gsap.to(state, {
          p: 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.round((travel / HOLD) * PACE)}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefreshInit: size,
            onRefresh: render,
          },
        });
        render();
        redraw = render;
        jumpTo.current = (i) => {
          const st = tween.scrollTrigger;
          if (!st) return;
          // just past the step's node: lit, its number rolled up
          const p = clamp01(((geo.at[i] + 6 - (geo.at[0] - run)) / travel) * HOLD);
          scroll.scrollTo(st.start + p * (st.end - st.start));
        };
        return () => {
          reset();
          redraw = () => {};
          jumpTo.current = settle;
        };
      });

      // ---------- smaller screens: down the rail, drawn to a line across the viewport ----------
      mm.add(RAIL, () => {
        section.dataset.journey = "rail";
        const size = () => {
          measure();
          run = Math.min(150, (geo.at[1] - geo.at[0]) * 0.5);
        };
        size();
        const render = () => paint(window.innerHeight * READ - track.getBoundingClientRect().top);
        ScrollTrigger.create({
          trigger: track,
          start: "top bottom",
          end: "bottom top",
          onUpdate: render,
          onRefreshInit: size,
          onRefresh: render,
        });
        render();
        redraw = render;
        jumpTo.current = (i) => {
          const y = window.scrollY + track.getBoundingClientRect().top + geo.at[i];
          scroll.scrollTo(y - window.innerHeight * READ + 6);
        };
        return () => {
          reset();
          redraw = () => {};
          jumpTo.current = settle;
        };
      });

      return () => {
        ro.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  const stepOf = (target: EventTarget) => {
    const step = (target as HTMLElement).closest<HTMLElement>(".jy-step");
    return step ? Array.from(step.parentElement?.children ?? []).indexOf(step) : -1;
  };
  const tracking = () => root.current?.closest("section")?.dataset.journey === "track";

  // a phase label jumps to its step; on the pinned track, so does a pane that isn't on
  const onClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    const i = stepOf(t);
    if (i < 0) return;
    if (t.closest(".jy-phase")) jumpTo.current(i);
    else if (tracking() && t.closest(".jy-pane") && !t.closest(".jy-step")?.classList.contains("is-on"))
      jumpTo.current(i);
  };
  // keyboard on the pinned track: a label that comes into focus is brought on screen
  const onFocus = (e: FocusEvent) => {
    if (!tracking() || document.documentElement.dataset.input !== "keyboard") return;
    const i = stepOf(e.target);
    if (i >= 0 && (e.target as HTMLElement).matches(".jy-phase")) jumpTo.current(i);
  };
  // a soft light follows the pointer across the glass
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const pane = (e.target as HTMLElement).closest<HTMLElement>(".jy-pane");
    if (!pane) return;
    const r = pane.getBoundingClientRect();
    pane.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    pane.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  return (
    // delegated: the controls are the labels' buttons; the panes only add a pointer shortcut
    <div ref={root} className="journey" onClick={onClick} onFocus={onFocus} onPointerMove={onMove}>
      <div className="jy-lights" aria-hidden>
        <span className="a" />
        <span className="b" />
      </div>
      <div className="jy-track">
        <div className="jy-line" aria-hidden>
          <div className="jy-fill" />
          <span className="jy-head" />
        </div>
        {children}
      </div>
    </div>
  );
}
