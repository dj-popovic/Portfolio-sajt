"use client";

// Adapted from React Bits (ScrollReveal) — see ./LICENSE.md.
// Ember changes: renders any tag with the caller's classes, keeps only the
// word-by-word fade + blur, and can be driven by a parent timeline through
// the imperative `render(progress)` handle (used inside the pinned About panel).

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, type ElementType } from "react";
import { gsap } from "@/lib/gsap";

const SCRUB_SPAN = 0.5;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

export type ScrollRevealHandle = {
  /** paint the reveal at progress 0..1 */
  render: (progress: number) => void;
};

type ScrollRevealProps = {
  children: string;
  as?: ElementType;
  className?: string;
  /** "scrub": own ScrollTrigger tied to the element; "external": call render(p) */
  mode?: "scrub" | "external";
  baseOpacity?: number;
  blurStrength?: number;
  stagger?: number;
};

export const ScrollReveal = forwardRef<ScrollRevealHandle, ScrollRevealProps>(function ScrollReveal(
  { children, as: Tag = "p", className, mode = "scrub", baseOpacity = 0.12, blurStrength = 4, stagger = 0.05 },
  ref,
) {
  const rootRef = useRef<HTMLElement>(null);
  const renderRef = useRef<(p: number) => void>(() => {});

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, i) =>
        word.trim() === "" ? (
          word
        ) : (
          <span className="inline-block" data-piece key={i}>
            {word}
          </span>
        ),
      ),
    [children],
  );

  useImperativeHandle(ref, () => ({ render: (p: number) => renderRef.current(p) }), []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const pieces = Array.from(el.querySelectorAll<HTMLElement>("[data-piece]"));
    const total = SCRUB_SPAN + Math.max(0, pieces.length - 1) * stagger;
    const last = pieces.map(() => -1);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const paint = (progress: number) => {
        const at = clamp01(progress) * total;
        pieces.forEach((piece, i) => {
          const t = clamp01((at - i * stagger) / SCRUB_SPAN);
          if (t === last[i]) return;
          last[i] = t;
          piece.style.opacity = t >= 1 ? "" : (baseOpacity + (1 - baseOpacity) * t).toFixed(3);
          piece.style.filter = blurStrength && t < 1 ? `blur(${(blurStrength * (1 - t)).toFixed(2)}px)` : "";
        });
      };
      renderRef.current = paint;
      paint(0);

      if (mode === "scrub") {
        const state = { p: 0 };
        gsap.to(state, {
          p: 1,
          ease: "none",
          onUpdate: () => paint(state.p),
          scrollTrigger: {
            trigger: el,
            start: () => `top bottom-=${0.2 * Math.min(el.offsetHeight, window.innerHeight)}`,
            end: "bottom 55%",
            scrub: true,
          },
        });
      }

      return () => {
        renderRef.current = () => {};
        pieces.forEach((piece) => {
          piece.style.opacity = "";
          piece.style.filter = "";
        });
      };
    });

    return () => mm.revert();
  }, [words, mode, baseOpacity, blurStrength, stagger]);

  return (
    <Tag ref={rootRef} className={className}>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{words}</span>
    </Tag>
  );
});
