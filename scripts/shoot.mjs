// Section-by-section screenshots for visual review.
// usage: node scripts/shoot.mjs [baseUrl=http://localhost:3000] [outDir=.shots] [path=/]
// env:   WIDTHS="1440,390"  REDUCED=1 (prefers-reduced-motion)
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [, , baseUrl = "http://localhost:3000", outDir = ".shots", route = "/"] = process.argv;
const widths = (process.env.WIDTHS || "1440,390").split(",").map(Number);
const sections = ["#top", "#about", "#services", "#work", "#process", "#fit", "#contact", "#footer"];

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

for (const width of widths) {
  const mobile = width < 600;
  const height = mobile ? 844 : 900;
  const page = await browser.newPage({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: process.env.REDUCED ? "reduce" : "no-preference",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  for (const sel of sections) {
    const box = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, h: r.height };
    }, sel);
    if (!box) continue;
    const steps = Math.min(4, Math.max(1, Math.ceil(box.h / height)));
    for (let i = 0; i < steps; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), box.top + i * height);
      await page.waitForTimeout(700);
      const name = `${width}-${sel.slice(1)}-${i}.png`;
      await page.screenshot({ path: path.join(outDir, name) });
    }
  }
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(
    `${width}px: page height ${total}${errors.length ? `, errors:\n  ${errors.join("\n  ")}` : ", no errors"}`,
  );
  await page.close();
}
await browser.close();
