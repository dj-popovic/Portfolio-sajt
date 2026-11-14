// Renders SVGs to PNG at exact pixel sizes, transparent corners kept (used by build.py).
// usage: node scripts/logo/icons.mjs <svg> <size> <out.png> [<svg> <size> <out.png> ...]
import fs from "node:fs";
import { chromium } from "playwright";
const jobs = [];
for (let i = 2; i < process.argv.length; i += 3) jobs.push(process.argv.slice(i, i + 3));
const browser = await chromium.launch();
for (const [svgPath, size, out] of jobs) {
  const s = +size;
  const page = await browser.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 });
  const svg = fs.readFileSync(svgPath, "utf8").replace("<svg ", `<svg width="${s}" height="${s}" `);
  await page.setContent(
    `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`,
  );
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: s, height: s } });
  await page.close();
}
await browser.close();
