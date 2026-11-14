// Undecided content stays visible as placeholders until the domain, the founders' names,
// copy and photos are decided (see docs/OPEN-ITEMS.md). Never translate these.
// The studio's name is decided: klin (src/lib/brand.ts).
export const PLACEHOLDER = {
  studio: "[studio]", // the email domain, until it's registered
  nameOne: "<Name One>",
  nameTwo: "<Name Two>",
  emailOne: "[name-one]@[studio].com",
  emailTwo: "[name-two]@[studio].com",
  city: "[Novi Sad]",
} as const;

// The studio's clock in the footer runs on Serbian time, not the visitor's.
export const STUDIO_TIME_ZONE = "Europe/Belgrade";
