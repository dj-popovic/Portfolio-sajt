// Checks every locale against messages/en.json: same keys, same array lengths, same ICU arguments
// and rich tags, untouched name placeholders, and every string must parse as an ICU message.
// usage: npm run check:messages
import { readFileSync } from "node:fs";
import { IntlMessageFormat } from "intl-messageformat";

const LOCALES = ["en", "sr", "ru", "de"];
const KEEP = ["<logo>", "[Novi Sad]", "[Ember & Oak]", "[Northwind]", "[Stillwater]", "[Tako]"];
const load = (l) => JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url), "utf8"));
const en = load("en");
const problems = [];

const signature = (s) => {
  const args = [...s.matchAll(/\{(\w+)\}/g)]
    .map((m) => m[1])
    .sort()
    .join(",");
  const tags = [...s.matchAll(/<(\/?)(\w+)>/g)]
    .map((m) => m[1] + m[2])
    .sort()
    .join(",");
  return `${args}|${tags}`;
};
const values = { name: "x", current: 1, total: 4, nameOne: "a", nameTwo: "b", time: "10:00", mood: "m" };
const tags = { b: (c) => c, glow: (c) => c, br: () => "", city: (c) => c, year: () => "2026" };

function walk(ref, cur, path, locale) {
  if (typeof ref === "string") {
    if (typeof cur !== "string") return problems.push(`${locale}: ${path} is missing`);
    if (signature(ref) !== signature(cur)) problems.push(`${locale}: ${path} arguments/tags differ from en`);
    try {
      new IntlMessageFormat(cur, locale).format({ ...values, ...tags });
    } catch (e) {
      problems.push(`${locale}: ${path} does not parse (${e.message})`);
    }
    if (cur.replaceAll("'<logo>'", "").includes("'"))
      problems.push(`${locale}: ${path} has a straight apostrophe — use ’`);
    for (const p of KEEP)
      if (ref.includes(p) && !cur.includes(p)) problems.push(`${locale}: ${path} lost the placeholder ${p}`);
    return;
  }
  if (Array.isArray(ref)) {
    if (!Array.isArray(cur) || cur.length !== ref.length)
      problems.push(`${locale}: ${path} should have ${ref.length} items`);
    ref.forEach((v, i) => walk(v, cur?.[i], `${path}[${i}]`, locale));
    return;
  }
  for (const k of Object.keys(ref)) walk(ref[k], cur?.[k], path ? `${path}.${k}` : k, locale);
  for (const k of Object.keys(cur ?? {}))
    if (!(k in ref)) problems.push(`${locale}: ${path ? `${path}.` : ""}${k} is not in en.json`);
}

for (const l of LOCALES) walk(en, load(l), "", l);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`messages OK (${LOCALES.join(", ")})`);
