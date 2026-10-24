import { gsap } from "@/lib/gsap";

/**
 * Blur-in sweep for headings: a soft-edged mask travels left → right while
 * the blur clears. No DOM splitting, so native line breaks, hyphenation and
 * gradient words stay exactly as designed (in every language).
 * Animate the returned target's "--rv" from 0 to 1 (alongside blur/y).
 */
export function prepareSweep(el: HTMLElement) {
  el.classList.add("rv-sweep");
  gsap.set(el, { "--rv": 0, filter: "blur(4px)", y: 8, autoAlpha: 1 });
}

export function sweepTo(el: HTMLElement, vars: gsap.TweenVars = {}) {
  return gsap.to(el, {
    "--rv": 1,
    filter: "blur(0px)",
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    ...vars,
  });
}

export function finishSweep(el: HTMLElement) {
  el.classList.remove("rv-sweep");
  gsap.set(el, { clearProps: "filter,transform,--rv" });
}
