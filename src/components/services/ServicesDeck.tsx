"use client";

import { useRef, useState, type ReactNode } from "react";
import { useScroll } from "@/components/motion/SmoothScroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

// same split as the About stage
const DECK = "(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)";
const STACK =
  "(prefers-reduced-motion: no-preference) and (max-width: 900px), (prefers-reduced-motion: no-preference) and (max-height: 699px)";

const LIFT = 16; // px a covered pane peeks above the one in front of it
const SINK = 0.045; // how much smaller each covered pane gets
const SHADE = [0, 0.42, 0.6, 0.74]; // how dim, by depth
const STEP = 0.36; // viewport heights of scrolling per pane

// where the two lights sit behind the deck for each pane (percent of their own size)
const LIGHTS = [
  { a: [-8, -12], b: [18, 22] },
  { a: [30, 6], b: [-22, 30] },
  { a: [-14, 34], b: [26, -16] },
  { a: [24, -18], b: [4, 30] },
];

type DeckProps = {
  /** accessible name of the index */
  label: string;
  /** service names, in order, for the index */
  names: string[];
  /** the panes (ServiceCard) */
  children: ReactNode;
  foot: ReactNode;
};

/**
 * What we offer, told one pane at a time. Big screens: the section pins and
 * the panes of glass stack as you scroll, each new one sliding up over the
 * last (which sinks back, its edge still showing through), a light behind
 * them shifting with each, the index on the left following along (and
 * jumping there on click); at the end its marker wraps all four for the
 * closing line. Phones: the panes stick and stack in the flow. Reduced
 * motion: the plain grid.
 */
export function ServicesDeck({ label, names, children, foot }: DeckProps) {
  const root = useRef<HTMLDivElement>(null);
  const scroll = useScroll();
  // the pane in front (names.length = all of them, at the end)
  const [active, setActive] = useState(0);
  const jumpTo = useRef<(i: number) => void>(() => {});

  useGSAP(
    () => {
      const stage = root.current;
      const section = stage?.closest<HTMLElement>("section");
      if (!stage || !section) return;
      const q = gsap.utils.selector(stage);
      const deck = q(".svc-deck")[0] as HTMLElement;
      const cards = q(".svc-card") as HTMLElement[];
      const shades = cards.map((c) => c.querySelector<HTMLElement>(".svc-shade"));
      const glyphs = cards.map((c) => c.querySelector<SVGElement>(".svc-glyph"));
      const glares = cards.map((c) => c.querySelector<HTMLElement>(".svc-glare"));
      const bodies = cards.map((c) => c.querySelector<HTMLElement>(".svc-body"));
      const rows = q(".svc-index button") as HTMLElement[];
      const [marker] = q(".svc-marker") as HTMLElement[];
      const [lightA] = q(".svc-light .a") as HTMLElement[];
      const [lightB] = q(".svc-light .b") as HTMLElement[];
      const [footEl] = q(".sec-foot") as HTMLElement[];
      const mm = gsap.matchMedia();

      // ---------- big screens: the pinned deck ----------
      mm.add(DECK, () => {
        section.dataset.deck = "deck";
        let current = -1;
        const show = (i: number) => {
          if (i !== current) setActive((current = i));
        };
        const below = () => deck.offsetHeight + 60;
        const depth = (k: number) => ({ y: -LIFT * k, scale: 1 - SINK * k });
        // measured on every refresh, so the marker fits the rows at any size
        const rowBox = (i: number) => ({ y: () => rows[i].offsetTop, height: () => rows[i].offsetHeight });
        const allBox = () => ({
          y: () => rows[0].offsetTop,
          height: () => rows.at(-1)!.offsetTop + rows.at(-1)!.offsetHeight - rows[0].offsetTop,
        });
        const light = (i: number) => [
          { el: lightA, xPercent: LIGHTS[i].a[0], yPercent: LIGHTS[i].a[1] },
          { el: lightB, xPercent: LIGHTS[i].b[0], yPercent: LIGHTS[i].b[1] },
        ];

        gsap.set(cards, { transformOrigin: "50% 0%" });
        gsap.set(cards.slice(1), { y: below });
        gsap.set(glyphs.slice(1), { "--draw": 1 });
        gsap.set(marker, rowBox(0));
        gsap.set(footEl, { opacity: 0 });
        light(0).forEach(({ el, ...to }) => gsap.set(el, to));

        const n = cards.length;
        // one unit per pane coming in, then the closing beat and a short hold
        const total = n;
        const tl = gsap.timeline({
          defaults: { ease: "none", immediateRender: false },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * STEP * total}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const time = self.progress * total;
              show(time > n - 1 + 0.3 ? n : Math.min(n - 1, Math.floor(time + 0.5)));
            },
          },
        });

        for (let i = 1; i < n; i++) {
          const at = i - 1 + 0.12;
          const ease = "power2.out";
          tl.fromTo(cards[i], { y: below }, { y: 0, duration: 0.76, ease }, at);
          // everything under it sinks one level deeper
          for (let j = 0; j < i; j++) {
            tl.fromTo(cards[j], depth(i - 1 - j), { ...depth(i - j), duration: 0.76, ease }, at);
            tl.fromTo(shades[j], { opacity: SHADE[i - 1 - j] }, { opacity: SHADE[i - j], duration: 0.76 }, at);
          }
          // its words leave as it's covered (through the glass they'd only smudge); its glow stays
          tl.fromTo(bodies[i - 1], { opacity: 1 }, { opacity: 0, duration: 0.45 }, at + 0.1);
          tl.fromTo(glyphs[i], { "--draw": 1 }, { "--draw": 0, duration: 0.62, ease: "power1.inOut" }, at + 0.22);
          tl.fromTo(glares[i], { xPercent: 0 }, { xPercent: 340, duration: 0.9, ease: "power1.inOut" }, at + 0.05);
          tl.fromTo(marker, rowBox(i - 1), { ...rowBox(i), duration: 0.5, ease: "power2.inOut" }, at + 0.14);
          light(i).forEach(({ el, ...to }, k) => {
            const from = light(i - 1)[k];
            tl.fromTo(
              el,
              { xPercent: from.xPercent, yPercent: from.yPercent },
              { ...to, duration: 0.8, ease: "power1.inOut" },
              at,
            );
          });
        }
        // the closing beat: the marker takes in all four, the line lands
        tl.fromTo(marker, rowBox(n - 1), { ...allBox(), duration: 0.42, ease: "power2.inOut" }, n - 1 + 0.15);
        tl.fromTo(
          footEl,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
          n - 1 + 0.38,
        );
        tl.set({}, {}, total);

        // the way in: the front pane and the index rise as the section arrives
        // (yPercent and opacity only: y belongs to the deck timeline above; opacity,
        // not visibility, so the index stays reachable by Tab and the line by screen readers)
        const enter = { trigger: section, start: "top 85%", end: "top 25%", scrub: 0.5 };
        gsap.fromTo(
          cards[0],
          { yPercent: 9, opacity: 0 },
          { yPercent: 0, opacity: 1, ease: "power2.out", scrollTrigger: enter },
        );
        gsap.fromTo(
          rows,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, ease: "power2.out", stagger: 0.05, scrollTrigger: { ...enter } },
        );
        gsap.fromTo(marker, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { ...enter } });
        const arrive = { trigger: section, start: "top 60%", end: "top top", scrub: 0.5 };
        gsap.fromTo(glyphs[0], { "--draw": 1 }, { "--draw": 0, ease: "power1.inOut", scrollTrigger: arrive });
        gsap.fromTo(glares[0], { xPercent: 0 }, { xPercent: 340, ease: "power1.inOut", scrollTrigger: { ...arrive } });

        // the index jumps to a pane
        jumpTo.current = (i) => {
          const st = tl.scrollTrigger;
          if (!st) return;
          const time = i === 0 ? 0 : i - 1 + 0.9;
          scroll.scrollTo(st.start + (st.end - st.start) * (time / total), { duration: 1 });
        };
        // a keyboard visit to the index from outside the pin brings the deck into place
        const onFocus = (e: FocusEvent) => {
          const st = tl.scrollTrigger;
          if (!st || !(e.target instanceof Element) || !e.target.closest(".svc-index")) return;
          if (window.scrollY < st.start - 1) scroll.scrollTo(st.start + 1, { duration: 0.8 });
          else if (window.scrollY > st.end + 1) scroll.scrollTo(st.end - 1, { duration: 0.8 });
        };
        stage.addEventListener("focusin", onFocus);
        ScrollTrigger.refresh();

        return () => {
          stage.removeEventListener("focusin", onFocus);
          delete section.dataset.deck;
          jumpTo.current = () => {};
          setActive(0);
        };
      });

      // ---------- phones: the panes stick and stack in the flow ----------
      mm.add(STACK, () => {
        section.dataset.deck = "stack";
        const top = (i: number) => parseFloat(getComputedStyle(cards[i]).top) || 0;
        cards.forEach((card, i) => {
          const arrive = { trigger: card, start: "top 90%", end: "top 40%", scrub: 0.4 };
          gsap.fromTo(glyphs[i], { "--draw": 1 }, { "--draw": 0, ease: "power1.inOut", scrollTrigger: arrive });
          gsap.fromTo(
            glares[i],
            { xPercent: 0 },
            { xPercent: 340, ease: "power1.inOut", scrollTrigger: { ...arrive } },
          );
          if (i === 0) return;
          // the pane underneath sinks and dims as this one slides over it
          const cover = { trigger: card, start: "top bottom", end: () => `top ${top(i)}px`, scrub: 0.3 };
          gsap.fromTo(cards[i - 1], { scale: 1 }, { scale: 1 - SINK * 1.4, ease: "none", scrollTrigger: cover });
          gsap.fromTo(shades[i - 1], { opacity: 0 }, { opacity: SHADE[1], ease: "none", scrollTrigger: { ...cover } });
          // its words only leave once this one is well over it (still being read till then)
          gsap.fromTo(
            bodies[i - 1],
            { opacity: 1 },
            { opacity: 0, ease: "none", scrollTrigger: { ...cover, start: "top 45%" } },
          );
        });
        gsap.set(cards, { transformOrigin: "50% 0%" });
        gsap.fromTo(
          footEl,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: footEl, start: "top 90%", once: true },
          },
        );
        ScrollTrigger.refresh();
        return () => {
          delete section.dataset.deck;
        };
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [] },
  );

  return (
    <div ref={root} className="svc-stage" data-manual-reveal>
      <div className="svc-index" role="group" aria-label={label}>
        <span className="svc-marker glass" aria-hidden />
        {names.map((name, i) => (
          <button
            key={name}
            type="button"
            aria-current={active === i || active === names.length ? "true" : undefined}
            onClick={() => jumpTo.current(i)}
          >
            <span className="n" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            {name}
          </button>
        ))}
      </div>
      <div className="svc-deck">
        <div className="svc-light" aria-hidden>
          <span className="a" />
          <span className="b" />
        </div>
        {children}
      </div>
      {foot}
    </div>
  );
}
