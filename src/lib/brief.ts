// Shared between server and client components (keep free of "use client").
export const PACKAGES = ["basic", "pro", "custom"] as const;
export const ADDONS = ["branding", "copy", "languages", "maintenance", "hosting", "cms", "analytics"] as const;

export type PackageKey = (typeof PACKAGES)[number];
export type AddonKey = (typeof ADDONS)[number];

// Find your fit in three taps: what it is, how much motion, whether there's a brand yet
export const FINDER = {
  make: ["small", "bigger", "app"],
  motion: ["light", "full"],
  brand: ["yes", "no"],
} as const;
export const FINDER_STEPS = ["make", "motion", "brand"] as const;

export type FinderStep = (typeof FINDER_STEPS)[number];
export type FinderAnswers = { [K in FinderStep]?: (typeof FINDER)[K][number] };

/** The package the answers point to: an app is Custom; a bigger site, or the full show, is Pro; else Basic. */
export function fitFor(answers: FinderAnswers): PackageKey | null {
  if (!answers.make) return null;
  if (answers.make === "app") return "custom";
  return answers.make === "bigger" || answers.motion === "full" ? "pro" : "basic";
}
