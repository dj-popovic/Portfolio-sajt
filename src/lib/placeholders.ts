// What's still undecided stays visible as a placeholder (see docs/OPEN-ITEMS.md): only the
// email domain now. Never translate it. Decided: the studio is klin (src/lib/brand.ts), the
// founders are Đorđe and Relja (their names are in the message files, `about.people.*.name`,
// since Russian writes them in Cyrillic), and the city is Novi Sad.
export const PLACEHOLDER = {
  studio: "[studio]", // the email domain, until it's registered
  emailOne: "djordje@[studio].com",
  emailTwo: "relja@[studio].com",
} as const;

// The studio's clock in the footer runs on Serbian time, not the visitor's.
export const STUDIO_TIME_ZONE = "Europe/Belgrade";
