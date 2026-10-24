# Project rules

Single-page portfolio for a two-person creative studio. Read `AGENTS.md` too: this is Next.js 16.4 — check `node_modules/next/dist/docs/` before using an API from memory (e.g. `proxy.ts` instead of `middleware.ts`, `next/root-params`, Cache Components are on).

## Non-negotiables

- **"Ember" is the colour palette's codename, never the studio name.** Don't hardcode it as a name anywhere.
- **Keep placeholders** until the owners decide. Name placeholders — `<logo>`, `[studio]`, `<Name One>`, `<Name Two>`, `[Novi Sad]` and the concept brands (`[Ember & Oak]`, `[Northwind]`, `[Stillwater]`, `[Tako]`) — are never translated (`src/lib/placeholders.ts` / the message files). Bracketed draft copy (`[founder photo 1]`, `[a clear brief & timeline]`, `[From €X …]`) is translated but keeps its brackets, so it still reads as a placeholder in every language.
- **The Claude Design export is the visual source of truth.** Skills and reviews are for polish, never to redesign. Section styles in `src/styles/sections.css` are ported from it; changes are marked `build:`.
- Open items (photos, name, prices, backend, legal) are tracked in `docs/OPEN-ITEMS.md` — keep it current.

## Design system (from the brief + export)

- Palette (Tailwind theme in `src/app/globals.css`): base `#0E0B0A`, surface `#1A1513`, cream text `#F5EDE4`, ember `#FF6B35`, amber `#FFB627`, paper `#FBF6F0`, coal (footer) `#080605`, ink `#2A211C` for text on light sections.
- Light sections: About, Work, Find your fit. Everything else dark; footer darkest.
- Type: **Unbounded** only for large display (hero, section titles, big numbers); **Inter** for body/UI; **JetBrains Mono** for small numerals ("01", "Step 01 / 04").
- Section order: Hero → About → What we offer → Work → How we work → Find your fit → Contact → Footer.

## Stack conventions

- Next.js App Router, TypeScript, Tailwind 4, next-intl (EN at `/`, `/sr` Serbian **Latin**, `/ru`, `/de`). Strings live in `messages/*.json`; rich tags `<glow>`, `<b>`, `<br></br>`; quote angle-bracket placeholders as `'<logo>'`.
- Use typographic apostrophes (’) in messages — a straight `'` can start ICU quoting. Titles keep a no-break space before " — " so a line never starts with a dash. After editing messages run `npm run check:messages` (keys, ICU arguments/tags, placeholders, parsing).
- Go easy on em dashes in copy (a stacked-up "—" reads as AI cadence): use periods, commas or colons. They stay only in the concept names ("[Tako] — …") and in Russian where grammar needs them ("Мы — студия").
- **GSAP (+ScrollTrigger/SplitText) is the main animation engine**, all scroll-driven motion. **Motion (`motion/react`) only for small UI interactions.** Lenis for smooth scroll. React Three Fiber for 3D (the hero orb).
- React Bits: pull only components we use (TS + Tailwind variant, from GitHub raw — reactbits.dev is blocked here) and adapt to Ember.
- Demo mini-sites (Work section) are fictional client brands: their inner content stays in English; only our frame around them is translated.
- Respect `prefers-reduced-motion` everywhere (no pins/scrubs, simple fades). The global rule in `globals.css` kills loops and movement but keeps 0.15s opacity/colour transitions; `MotionPreferences` puts Motion in `reducedMotion="user"`. GSAP code branches with `gsap.matchMedia`.
- Fonts: `subsets` in `src/lib/fonts.ts` only controls **preloading** (every subset is in the CSS and loads on demand), so keep it at `["latin"]`.

## Workflow

- Commits: author `dj-popovic <dj.popovic5503@gmail.com>` (set in local git config), Claude as co-author via trailer. Push straight to `main`.
- Visual check: `npm run build && npx next start -p 3100`, then `node scripts/shoot.mjs http://localhost:3100 .shots /` for section screenshots at 1440/390, or `node scripts/scrollshots.mjs http://localhost:3100/ .shots/scroll 260` to step through the scroll choreography with real wheel events (Lenis-aware).
- Motion map: `src/components/motion/` (Lenis provider, reveal orchestrator, heading sweep, panel clips), `AboutStage.tsx` (pinned signature sequence), `src/components/three/` (the hero orb: a fixed R3F layer drawn in screen pixels; on scroll it unravels into a thread of dots that lands on the About ★ tile), `src/components/reactbits/` (adapted React Bits — keep their LICENSE.md).
- Hero orb: shared state, layout and lattice in `src/lib/orb.ts`; `OrbControls.tsx` is the invisible hit area in the hero (drag, hover, tap ripple, arrow keys/Enter) and writes `--orb-x/y/r` for the aura and hint; `canvas/Orb2D.tsx` draws it inside the hero for reduced motion (still, turns by hand) and no-WebGL. `isStacked()` and the stacked-hero media query in `sections.css` must stay in sync.
- Header: dark liquid-glass pills (`.glass` in `sections.css`), fixed from the first screen, with a section marker (Motion `layoutId`) and the language dropdown `layout/LangMenu.tsx` (native names, no flags). The header's Start a project button keeps a soft ember glow on purpose.
- Work demos: `src/components/work/WorkWindow.tsx` opens a concept out of its card (portal, focus trap, page scroll locked, background renderers paused via `src/lib/overlay.ts`). Each concept is its own lazily loaded mini-site in `src/components/work/demos/<name>/`; the two app concepts share `demos/Phone.tsx` (device frame, wide/narrow layout, zoom-to-fit). Demo styles/keyframes: `src/styles/demos.css`.
- Never tween `clip-path` strings directly (browsers normalise them) — tween numbers and write the string (`motion/clip.ts`).
