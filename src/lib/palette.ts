/**
 * The palette for code that can't read the CSS tokens: WebGL shaders and 2D
 * canvases. Same values as the `--color-*` tokens in src/app/globals.css
 * (`npm run check:palette` compares the two); the rest of the site uses the CSS.
 */
export const PALETTE = {
  bg: "#08080f",
  text: "#ffffff",
  textMuted: "#a3a3c2",
  blue: "#040273",
  blueBright: "#2b28e0",
  blueText: "#8482ff",
  lime: "#d5fb09",
} as const;

export type Rgb = readonly [number, number, number];

/** A hex colour as 0–255 channels. */
export function rgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Two colours mixed, `t` of the way from `a` to `b` (sRGB, as the shaders mix). */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** A colour as a GLSL `vec3(...)` literal, for shader source. */
export function glsl(c: Rgb): string {
  return `vec3(${c.map((v) => (v / 255).toFixed(4)).join(", ")})`;
}

/**
 * The dots' ramp, shared by the hero orb, the footer horizon and Contact's dots
 * (WebGL and 2D): a dim blue grain in the shadow, climbing through blue to
 * a light blue where the light falls, near white at the hottest. Lime is the spark: the
 * hero's tap ripple and a few dots in the footer and Contact.
 */
export const DOTS = {
  grain: mixRgb(rgb(PALETTE.blueText), rgb(PALETTE.bg), 0.55),
  // pure blue-bright reads too dark as a dot of light; the ramp climbs from it to blue-text
  deep: mixRgb(rgb(PALETTE.blueBright), rgb(PALETTE.blueText), 0.6),
  bright: mixRgb(rgb(PALETTE.blueText), rgb(PALETTE.text), 0.35),
  hot: mixRgb(rgb(PALETTE.text), rgb(PALETTE.blueText), 0.08),
  spark: rgb(PALETTE.lime),
} as const;
