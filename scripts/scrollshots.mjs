// Scroll through the page with real wheel events (so Lenis + ScrollTrigger
// behave as for a visitor) and take a frame every step.
// usage: node scripts/scrollshots.mjs [url] [outDir] [step=300] [maxSteps=60] [width=1440] [height=900]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [
  ,
  ,
  url = "http://localhost:3000/",
  outDir = ".shots/scroll",
  stepArg = "300",
  maxArg = "60",
  wArg = "1440",
  hArg = "900",
] = process.argv;
const step = Number(stepArg);
const maxSteps = Number(maxArg);
const width = Number(wArg);
const height = Number(hArg);

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(url, { waitUntil: "networkidle" });
await page.mouse.move(width * 0.62, height * 0.45);
await page.waitForTimeout(3200); // intro
await page.screenshot({ path: path.join(outDir, "000.png") });

let last = -1;
for (let i = 1; i <= maxSteps; i++) {
  await page.mouse.wheel(0, step);
  await page.waitForTimeout(650);
  const y = await page.evaluate(() => Math.round(window.scrollY));
  await page.screenshot({ path: path.join(outDir, `${String(i).padStart(3, "0")}.png`) });
  if (y === last) break;
  last = y;
}
const total = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(
  `frames saved to ${outDir}; page height ${total}; ${errors.length ? "errors:\n  " + errors.join("\n  ") : "no errors"}`,
);
await browser.close();
