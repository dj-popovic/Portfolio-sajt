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

/**
 * The four concepts. Each card tips up into place as it scrolls in (opacity
 * and transforms only, so they stay in the tab order), a warm light follows
 * the pointer across the paper behind them, and a card opens its concept in
 * the demo window, where the others are one click away.
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
      return () => mm.revert();
    },
    { scope: root },
  );

  const cardOf = (key: DemoKey) =>
    root.current?.querySelector<HTMLElement>(`.concept-card[data-demo="${key}"]`) ?? null;

  return (
    <div ref={root} className="work-grid" data-manual-reveal>
      {DEMO_KEYS.map((key) => {
        const { kind, brand } = CONCEPT[key];
        const { preview, chips, stage } = PREVIEW[key];
        return (
          <div className="concept-slot" key={key}>
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
