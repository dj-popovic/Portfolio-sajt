// The four concept projects in the Work section. Their names are placeholders
// (never translated); what each one is lives in the messages (work.items.*).

export type DemoKey = "coffee" | "fintech" | "wellness" | "food";

export const DEMO_KEYS: DemoKey[] = ["coffee", "fintech", "wellness", "food"];

export const CONCEPT: Record<
  DemoKey,
  {
    kind: "web" | "app";
    brand: string;
    /** the demo's own background, shown while it loads */
    bg: string;
  }
> = {
  coffee: { kind: "web", brand: "[Ember & Oak]", bg: "#F4EBDD" },
  fintech: { kind: "web", brand: "[Northwind]", bg: "#0B1220" },
  wellness: { kind: "app", brand: "[Stillwater]", bg: "#EEEBFF" },
  food: { kind: "app", brand: "[Tako]", bg: "#FFF4E6" },
};
