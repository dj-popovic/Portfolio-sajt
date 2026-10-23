import {
  Bricolage_Grotesque,
  DM_Serif_Display,
  Inter,
  JetBrains_Mono,
  Nunito,
  Space_Grotesk,
  Unbounded,
} from "next/font/google";

// Self-hosted at build time (no requests to Google from visitors).
// Every subset (latin-ext for Serbian č ć đ š ž, cyrillic for Russian, …) is always in the CSS
// and fetched on demand via unicode-range; `subsets` only picks what is *preloaded*. Preloading
// just latin keeps EN/DE from downloading Cyrillic + Latin-ext files they never use.

export const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

// Concept-demo brand faces: only fetched when a demo renders them.
export const dmSerif = DM_Serif_Display({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dmserif",
  display: "swap",
  preload: false,
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-spacegrotesk",
  display: "swap",
  preload: false,
});

export const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  display: "swap",
  preload: false,
});

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
  preload: false,
});

export const fontVariables = [
  unbounded.variable,
  inter.variable,
  jetbrains.variable,
  dmSerif.variable,
  spaceGrotesk.variable,
  nunito.variable,
  bricolage.variable,
].join(" ");
