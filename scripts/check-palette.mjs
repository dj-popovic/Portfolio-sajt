// Checks that src/lib/palette.ts (the colours WebGL and canvas code use) matches the
// --color-* tokens in src/app/globals.css, so the site has one palette.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const ts = readFileSync(new URL("../src/lib/palette.ts", import.meta.url), "utf8");

const theme = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map(([, k, v]) => [k, v.toLowerCase()]),
);
const block = ts.match(/export const PALETTE = \{([\s\S]*?)\}/);
if (!block) {
  console.error("palette.ts: no PALETTE object found");
  process.exit(1);
}
const kebab = (k) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
let bad = 0;
let n = 0;
for (const [, key, hex] of block[1].matchAll(/(\w+):\s*"(#[0-9a-f]{3,8})"/gi)) {
  n++;
  const want = theme[kebab(key)];
  if (!want) {
    console.error(`palette.ts: ${key} has no --color-${kebab(key)} in globals.css`);
    bad++;
  } else if (want !== hex.toLowerCase()) {
    console.error(`palette.ts: ${key} is ${hex}, globals.css --color-${kebab(key)} is ${want}`);
    bad++;
  }
}
if (bad) process.exit(1);
console.log(`palette OK: ${n} colours match globals.css`);
