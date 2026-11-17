"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type ReactNode } from "react";
import { ConceptCard } from "@/components/work/ConceptCard";
import { CONCEPT, DEMO_KEYS, type DemoKey } from "@/components/work/concepts";
import {
  CoffeePreview,
  FintechPreview,
  FoodChips,
  FoodPhone,
  WellnessChips,
  WellnessPhone,
} from "@/components/work/previews";
import { WorkWindow } from "@/components/work/WorkWindow";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { richDark } from "@/lib/rich";

const PREVIEW: Record<DemoKey, { preview: ReactNode; chips?: ReactNode; stage?: string }> = {
  coffee: { preview: <CoffeePreview /> },
  fintech: { preview: <FintechPreview /> },
  wellness: {
    preview: <WellnessPhone />,
    chips: <WellnessChips />,
    stage: "radial-gradient(90% 80% at 36% 26%, #f2f0ff, #e2e4fb 55%, #d2dafa)",
  },
  food: {
    preview: <FoodPhone />,
    chips: <FoodChips />,
    stage: "radial-gradient(90% 80% at 36% 22%, #fff0de, #ffdcb6 55%, #ffc890)",
  },
};

// a row's second card stirs this long after the first (ConceptCard's wake)
const WAKE_STAGGER = 380;

/**
 * The four concepts, as a grid of two shapes: a site takes the wide tile (its
 * page shows larger), an app the narrow one (a phone needs no more), and the
 * two rows mirror each other. Each card tips up into place as it scrolls in
 * (opacity and transforms only, so they stay in the tab order), a soft blue
 * light follows the pointer across the paper behind them, and a card opens its
 * concept in the demo window, where the others are one click away. On touch
 * screens the card nearest the middle of the screen is the one that plays, one
 * at a time.
 */
export function WorkGallery() {
  const t = useTranslations("work");
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<{ key: DemoKey; origin: HTMLElement } | null>(null);

  useGSAP(
    () => {
      const grid = root.current;
      const section = grid?.closest("section");
      if (!grid || !section) return;
      const slots = gsap.utils.toArray<HTMLElement>(".concept-slot", grid);
      const light = section.querySelector<HTMLElement>(".work-light");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        slots.forEach((slot) => {
          gsap.fromTo(
            slot,
            { opacity: 0, y: 120, rotateX: 18, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: { trigger: slot, start: "top bottom", end: "top 56%", scrub: 0.7 },
            },
          );
        });
        if (!light || !window.matchMedia("(hover: hover)").matches) return;
        let raf = 0;
        let x = 0;
        let y = 0;
        const move = (e: PointerEvent) => {
          const r = section.getBoundingClientRect();
          x = e.clientX - r.left;
          y = e.clientY - r.top;
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            light.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
            light.classList.add("is-on");
          });
        };
        const leave = () => light.classList.remove("is-on");
        section.addEventListener("pointermove", move);
        section.addEventListener("pointerleave", leave);
        return () => {
          cancelAnimationFrame(raf);
          section.removeEventListener("pointermove", move);
          section.removeEventListener("pointerleave", leave);
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          slots,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, stagger: 0.08, scrollTrigger: { trigger: grid, start: "top 88%", once: true } },
        );
      });

      // no pointer to hover with: the card nearest the middle of the screen plays (and
      // wears the lime), one at a time; side by side on a tablet, the row plays together
      mm.add("(hover: none)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".concept-card", grid);
        const play = (card: HTMLElement, on: boolean) =>
          card.dispatchEvent(new CustomEvent("concept:play", { detail: on }));
        let playing: HTMLElement[] = [];
        let raf = 0;
        let settled = 0;
        const pick = () => {
          raf = 0;
          const mid = window.innerHeight / 2;
          const seen = cards
            .map((card) => {
              const r = card.getBoundingClientRect();
              const shown = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
              return { card, top: r.top, far: Math.abs((r.top + r.bottom) / 2 - mid), enough: shown > r.height * 0.55 };
            })
            .filter((c) => c.enough)
            .sort((a, b) => a.far - b.far);
          // the nearest, and whatever shares its row
          const next = seen.filter((c) => Math.abs(c.top - seen[0].top) < 24).map((c) => c.card);
          playing.filter((card) => !next.includes(card)).forEach((card) => play(card, false));
          next.filter((card) => !playing.includes(card)).forEach((card) => play(card, true));
          playing = next;
        };
        const onScroll = () => {
          if (!raf) raf = requestAnimationFrame(pick);
          // and once more when the page has come to rest: a card still tipping into place
          // (its entrance trails the scroll) is measured where it ends up
          window.clearTimeout(settled);
          settled = window.setTimeout(pick, 800);
        };
        const io = new IntersectionObserver(([e]) => {
          window.removeEventListener("scroll", onScroll);
          if (e.isIntersecting) window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        });
        io.observe(grid);
        window.addEventListener("resize", onScroll);
        return () => {
          io.disconnect();
          cancelAnimationFrame(raf);
          window.clearTimeout(settled);
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
          playing.forEach((card) => play(card, false));
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const cardOf = (key: DemoKey) =>
    root.current?.querySelector<HTMLElement>(`.concept-card[data-demo="${key}"]`) ?? null;

  return (
    <div ref={root} className="work-grid" data-manual-reveal>
      {DEMO_KEYS.map((key, i) => {
        const { kind, brand } = CONCEPT[key];
        const { preview, chips, stage } = PREVIEW[key];
        return (
          <div className={cn("concept-slot", kind === "web" ? "is-wide" : "is-narrow")} key={key}>
            <ConceptCard
              demo={key}
              kind={kind}
              brand={brand}
              kindLabel={kind === "web" ? t("kindWeb") : t("kindApp")}
              value={t.rich(`items.${key}.value`, richDark)}
              openLabel={t("open")}
              ariaLabel={t("window.openAria", { brand, what: t(`items.${key}.what`) })}
              stage={stage}
              chips={chips}
              wakeDelay={(i % 2) * WAKE_STAGGER}
              onOpen={(origin) => setOpen({ key, origin })}
            >
              {preview}
            </ConceptCard>
          </div>
        );
      })}
      {open ? (
        <WorkWindow
          demo={open.key}
          origin={open.origin}
          cardOf={cardOf}
          onSwitch={(key) => setOpen((o) => (o ? { key, origin: cardOf(key) ?? o.origin } : o))}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
