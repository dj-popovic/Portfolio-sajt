"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConceptCard } from "@/components/work/ConceptCard";
import { WorkWindow } from "@/components/work/WorkWindow";
import { CoffeePreview, FintechPreview, FoodPreview, WellnessPreview } from "@/components/work/previews";
import { richLight } from "@/lib/rich";

export type DemoKey = "coffee" | "fintech" | "wellness" | "food";

const CONCEPTS: Array<{ key: DemoKey; kind: "web" | "app"; stage?: string; Preview: () => React.JSX.Element }> = [
  { key: "coffee", kind: "web", Preview: CoffeePreview },
  { key: "fintech", kind: "web", Preview: FintechPreview },
  {
    key: "wellness",
    kind: "app",
    stage: "radial-gradient(70% 60% at 50% 30%, #EDEBFF, #E3E7FA 70%, #DCE7FF)",
    Preview: WellnessPreview,
  },
  {
    key: "food",
    kind: "app",
    stage: "radial-gradient(70% 60% at 50% 26%, #FFE7CE, #FFDDB8 70%, #FFD0A0)",
    Preview: FoodPreview,
  },
];

export function WorkGallery() {
  const t = useTranslations("work");
  const [open, setOpen] = useState<{ key: DemoKey; kind: "web" | "app"; origin: HTMLElement } | null>(null);

  return (
    <div className="work-grid" data-reveal-group data-reveal-stagger="0.06">
      {CONCEPTS.map(({ key, kind, stage, Preview }) => (
        <ConceptCard
          key={key}
          kind={kind}
          stage={stage}
          kindLabel={kind === "web" ? t("kindWeb") : t("kindApp")}
          value={t.rich(`items.${key}.value`, richLight)}
          openLabel={t("open")}
          ariaLabel={t("window.openAria", { name: t(`items.${key}.name`) })}
          onOpen={(origin) => setOpen({ key, kind, origin })}
        >
          <Preview />
        </ConceptCard>
      ))}
      {open ? <WorkWindow demo={open.key} kind={open.kind} origin={open.origin} onClose={() => setOpen(null)} /> : null}
    </div>
  );
}
