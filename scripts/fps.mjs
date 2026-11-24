// Frames a second, section by section, on the production build: scrolling through each section
// at a steady pace (one scroll step per frame), then sitting still in its middle, plus how much of
// each second the page's own thread spends on script, layout and style (Chrome's metrics).
//
// usage: npm run build && npx next start -p 3100, then
//        node scripts/fps.mjs http://localhost:3100 phone      (390x844 at 3x, touch)
//        node scripts/fps.mjs http://localhost:3100 desktop    (1440x900)
// options: [label] [extra CSS] [extra JS] after the mode, to switch one family of effects off,
//        e.g. node scripts/fps.mjs http://localhost:3100 phone "no canvases" "canvas{display:none!important}"
// env:   SECTIONS=services,work (only those), PW_CHROMIUM=/path/to/chromium (a browser build other
//        than the one this Playwright expects)
// The test browser draws in software, so its numbers are low in absolute terms, the glass blur
// and the orbs most of all: compare before and after, and on a phone emulation first.
import { chromium } from "playwright";
const [, , base = "http://localhost:3100", mode = "phone", label = "", extraCss = "", extraJs = ""] = process.argv;
const SECTIONS = (process.env.SECTIONS || "top,about,services,work,process,fit,contact,footer").split(",");
const phone = mode === "phone";
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const ctx = await browser.newContext(
  phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const cdp = await ctx.newCDPSession(page);
await cdp.send("Performance.enable");
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
if (extraCss) await page.addStyleTag({ content: extraCss });
if (extraJs) await page.evaluate(extraJs);
await page.waitForTimeout(3000);
const metrics = async () =>
  Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
const share = (a, b, secs) => ({
  script: Math.round(((b.ScriptDuration - a.ScriptDuration) / secs) * 100),
  layout: Math.round(((b.LayoutDuration - a.LayoutDuration) / secs) * 100),
  style: Math.round(((b.RecalcStyleDuration - a.RecalcStyleDuration) / secs) * 100),
  task: Math.round(((b.TaskDuration - a.TaskDuration) / secs) * 100),
});
const count = (opts) =>
  page.evaluate(
    ({ from, to, ms }) =>
      new Promise((done) => {
        const t0 = performance.now();
        let last = t0,
          frames = 0,
          long = 0,
          worst = 0;
        const step = (now) => {
          const dt = now - last;
          last = now;
          if (frames++) {
            if (dt > 34) long++;
            worst = Math.max(worst, dt);
          }
          const p = Math.min(1, (now - t0) / ms);
          if (to !== from) window.scrollTo(0, from + (to - from) * p);
          if (p < 1) requestAnimationFrame(step);
          else done({ fps: +((frames - 1) / ((now - t0) / 1000)).toFixed(1), long, worst: Math.round(worst) });
        };
        requestAnimationFrame(step);
      }),
    opts,
  );
const rows = [];
for (const id of SECTIONS) {
  const r = await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const box = (el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el).getBoundingClientRect();
    const top = box.top + scrollY,
      max = document.documentElement.scrollHeight - innerHeight;
    const from = Math.max(0, Math.min(max, top - innerHeight * 0.3));
    const to = Math.max(from, Math.min(max, top + box.height - innerHeight * 0.7));
    return { from, to };
  }, id);
  if (!r) continue;
  const speed = phone ? 1200 : 1500;
  const ms = Math.min(6000, Math.max(1500, ((r.to - r.from) / speed) * 1000));
  await page.evaluate((y) => window.scrollTo(0, y), r.from);
  await page.waitForTimeout(1200);
  let a = await metrics();
  const scroll = await count({ from: r.from, to: r.to, ms });
  let b = await metrics();
  const scrollMain = share(a, b, ms / 1000);
  const mid = (r.from + r.to) / 2;
  await page.evaluate((y) => window.scrollTo(0, y), mid);
  await page.waitForTimeout(1000);
  a = await metrics();
  const idle = await count({ from: mid, to: mid, ms: 2000 });
  b = await metrics();
  rows.push({ id, scroll, scrollMain, idle, idleMain: share(a, b, 2) });
}
const pad = (s, n) => String(s).padEnd(n);
console.log(`${mode}${label ? " · " + label : ""}`);
console.log(
  pad("section", 10) +
    pad("scroll fps", 12) +
    pad("long/worst", 12) +
    pad("main % (script/layout/style)", 30) +
    pad("still fps", 11) +
    "main % still",
);
for (const { id, scroll, scrollMain: s, idle, idleMain: i } of rows)
  console.log(
    pad(id, 10) +
      pad(scroll.fps, 12) +
      pad(`${scroll.long}/${scroll.worst}ms`, 12) +
      pad(`${s.task} (${s.script}/${s.layout}/${s.style})`, 30) +
      pad(idle.fps, 11) +
      `${i.task} (${i.script}/${i.layout}/${i.style})`,
  );
if (errors.length) console.log("page errors:", errors.slice(0, 3));
await browser.close();
