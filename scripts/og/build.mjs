// Share images (Open Graph and X), one per language, made from the real hero: the klin
// logo, the headline and the orb, with the menu, the buttons and the lede hidden.
// Output: public/og/<locale>.jpg, 1200×630 (the layout's metadata points at them).
//
// usage: npm run build && npx next start -p 3100, then
//        node scripts/og/build.mjs http://localhost:3100
// Run it again whenever the headline, the logo or the orb changes.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [, , base = "http://localhost:3000"] = process.argv;
const LOCALES = ["en", "sr", "ru", "de"];
const OUT = path.join(process.cwd(), "public", "og");

// everything but the logo, the headline and the orb
const CARD = `
  .nav-links, .nav-right, .hero-actions, .hero-sub, .orb-hint, nextjs-portal { display: none !important; }
  /* the logo larger, so it still reads where a preview is shown small, and lower, clear of
     the strip X crops off the top of a 1200×630 image */
  .nav-logo { transform: translateY(18px) scale(1.4); transform-origin: 0 0; }
`;

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const locale of LOCALES) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(new URL(locale === "en" ? "/" : `/${locale}`, base).toString(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: CARD });
  // the intro: the headline sweeps in and the orb's dots gather into the sphere
  await page.waitForTimeout(5000);
  const file = path.join(OUT, `${locale}.jpg`);
  // JPEG keeps it small: some apps skip a preview image over a few hundred KB
  await page.screenshot({ path: file, type: "jpeg", quality: 90 });
  console.log(`${path.relative(process.cwd(), file)}  ${Math.round(fs.statSync(file).size / 1024)} KB`);
  if (errors.length) console.warn(`  page errors (${locale}):`, errors);
  await page.close();
}
await browser.close();
