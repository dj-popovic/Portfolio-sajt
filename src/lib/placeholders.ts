// Undecided content stays visible as placeholders until the studio name,
// copy and photos are decided (see docs/OPEN-ITEMS.md). Never translate these.
export const PLACEHOLDER = {
  logo: "<logo>",
  studio: "[studio]",
  nameOne: "<Name One>",
  nameTwo: "<Name Two>",
  city: "[Novi Sad]",
} as const;

// The studio's clock in the footer runs on Serbian time, not the visitor's.
export const STUDIO_TIME_ZONE = "Europe/Belgrade";
