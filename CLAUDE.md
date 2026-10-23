# Project rules

Single-page portfolio for a two-person creative studio. Read `AGENTS.md` too: this is Next.js 16.4 — check `node_modules/next/dist/docs/` before using an API from memory (e.g. `proxy.ts` instead of `middleware.ts`, `next/root-params`, Cache Components are on).

## Non-negotiables

- **"Ember" is the colour palette's codename, never the studio name.** Don't hardcode it as a name anywhere.
- **Keep placeholders** until the owners decide: `<logo>`, `[studio]`, `<Name One>`, `<Name Two>`, `[Novi Sad]`, `[photo …]`, `[From €X …]`. They live in `src/lib/placeholders.ts` / the message files. Never translate them.
- **The Claude Design export is the visual source of truth.** Skills and reviews are for polish, never to redesign. Section styles in `src/styles/sections.css` are ported from it; changes are marked `build:`.
- Open items (photos, name, prices, backend, legal) are tracked in `docs/OPEN-ITEMS.md` — keep it current.

## Design system (from the brief + export)

- Palette (Tailwind theme in `src/app/globals.css`): base `#0E0B0A`, surface `#1A1513`, cream text `#F5EDE4`, ember `#FF6B35`, amber `#FFB627`, paper `#FBF6F0`, coal (footer) `#080605`, ink `#2A211C` for text on light sections.
- Light sections: About, Work, Find your fit. Everything else dark; footer darkest.
- Type: **Unbounded** only for large display (hero, section titles, big numbers); **Inter** for body/UI; **JetBrains Mono** for small numerals ("01", "Step 01 / 04").
- Section order: Hero → About → What we offer → Work → How we work → Find your fit → Contact → Footer.

## Stack conventions

- Next.js App Router, TypeScript, Tailwind 4, next-intl (EN at `/`, `/sr` Serbian **Latin**, `/ru`, `/de`). Strings live in `messages/*.json`; rich tags `<glow>`, `<b>`, `<br></br>`; quote angle-bracket placeholders as `'<logo>'`.
- Use typographic apostrophes (’) in messages — a straight `'` can start ICU quoting.
- **GSAP (+ScrollTrigger/SplitText) is the main animation engine**, all scroll-driven motion. **Motion (`motion/react`) only for small UI interactions.** Lenis for smooth scroll. React Three Fiber for 3D (hero nebula).
- React Bits: pull only components we use (TS + Tailwind variant, from GitHub raw — reactbits.dev is blocked here) and adapt to Ember.
- Demo mini-sites (Work section) are fictional client brands: their inner content stays in English; only our frame around them is translated.
- Respect `prefers-reduced-motion` everywhere (no pins/scrubs, simple fades).

## Workflow

- Commits: author `dj-popovic <dj.popovic5503@gmail.com>` (set in local git config), Claude as co-author via trailer. Push straight to `main`.
- Visual check: `npm run build && npx next start -p 3100`, then `node scripts/shoot.mjs http://localhost:3100 .shots /` for section screenshots at 1440/390.
