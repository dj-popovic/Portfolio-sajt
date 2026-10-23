# Studio portfolio — `<logo>`

Single-page portfolio for a two-person creative studio (branding, websites, apps, marketing). Dark Ember palette with light "breather" sections, scroll choreography, a 3D hero and four interactive concept demos. English plus Serbian (Latin), Russian and German.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static prerendering) + TypeScript
- Tailwind CSS 4
- [GSAP](https://gsap.com) + ScrollTrigger — scroll animation
- [Lenis](https://lenis.darkroom.engineering) — smooth scrolling
- [Motion](https://motion.dev) — small UI interactions
- [React Three Fiber](https://r3f.docs.pmnd.rs) — 3D
- [next-intl](https://next-intl.dev) — EN at `/`, then `/sr`, `/ru`, `/de`

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (all 4 languages prerendered)
npm run lint
```

Section screenshots for review (uses Playwright):

```bash
npm run build && npx next start -p 3100
node scripts/shoot.mjs http://localhost:3100 .shots /
```

## Where things live

| Path | What |
|---|---|
| `messages/*.json` | All copy, per language |
| `src/app/[locale]/` | Layout + the single page |
| `src/components/sections/` | One component per section |
| `src/components/work/` | Concept cards, previews and the demo window |
| `src/components/work/demos/` | The four concept mini-sites (lazy-loaded when a window opens) |
| `src/styles/sections.css` | Section styles ported from the design export |
| `src/lib/placeholders.ts` | `<logo>`, `[studio]`, names… — undecided content |
| `src/app/api/contact/route.ts` | Contact endpoint (**stub** — see `docs/CONTACT_API.md`) |
| `docs/OPEN-ITEMS.md` | What's still missing before launch (photos, name, prices…) |

## Quality bar

- **Languages:** every message file has the same keys, ICU arguments and tags as `en.json`; layouts were checked at 390/768/1440 px in all four languages.
- **Reduced motion:** no pins, scrubs or loops; state changes keep short fades. Motion (`motion/react`) follows the OS setting via `MotionConfig`.
- **Accessibility:** keyboard-only flow (skip link, visible focus, focus trap + Esc in demo windows), axe-core clean apart from the colour items listed in `docs/OPEN-ITEMS.md`.
- **Performance:** the 3D scene and each demo load lazily; fonts preload only their Latin subset (other scripts load on demand).

## Deploy

Import the GitHub repo in Vercel — it detects Next.js, no settings needed. Optional env var: `NEXT_PUBLIC_CONTACT_ENDPOINT` if the contact backend is hosted elsewhere.
