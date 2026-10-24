"use client";

import { finishSweep, prepareSweep, sweepTo } from "@/components/motion/sweep";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Page-wide scroll reveals, driven by data attributes in the server markup:
 *   data-reveal="title"   heading sharpens in with a left → right sweep
 *   data-reveal="fade"    soft rise + fade
 *   data-reveal-group     its [data-reveal-item] children rise in sequence
 * Everything plays once, when it first comes into view.
 */
export function Reveals() {
  useGSAP(() => {
    document.documentElement.classList.add("motion-ready");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let cancelled = false;

      const run = () => {
        if (cancelled) return;

        gsap.utils.toArray<HTMLElement>('[data-reveal="title"]').forEach((el) => {
          if (el.closest("[data-manual-reveal]")) return;
          prepareSweep(el);
          sweepTo(el, {
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
            onComplete: () => finishSweep(el),
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
          if (el.closest("[data-manual-reveal]")) return;
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
              delay: Number(el.dataset.revealDelay ?? 0.1),
              clearProps: "transform",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
          if (group.closest("[data-manual-reveal]")) return;
          const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
          if (!items.length) return;
          // CSS hover transitions on transform would smear the tween
          items.forEach((item) => item.classList.add("rv-busy"));
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 20 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "expo.out",
              stagger: Number(group.dataset.revealStagger ?? 0.06),
              clearProps: "transform",
              scrollTrigger: { trigger: group, start: "top 84%", once: true },
              onComplete: () => items.forEach((item) => item.classList.remove("rv-busy")),
            },
          );
        });

        // Pro card: the ember border ignites with a sweep as it lands
        gsap.utils.toArray<HTMLElement>("[data-ignite]").forEach((el) => {
          gsap.fromTo(
            el,
            { "--ignite-angle": "-210deg", "--ignite": 0 },
            {
              "--ignite-angle": "150deg",
              "--ignite": 1,
              duration: 1.2,
              delay: 0.3,
              ease: "power2.inOut",
              scrollTrigger: { trigger: el, start: "top 80%", once: true },
            },
          );
        });

        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };

      // split only once real fonts are in, so line breaks are final
      if (document.fonts?.status === "loaded") run();
      else document.fonts?.ready.then(run);

      return () => {
        cancelled = true;
      };
    });

    return () => mm.revert();
  });

  return null;
}
