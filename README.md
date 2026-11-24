# klin — studio portfolio

Single-page portfolio for a two-person creative studio (branding, websites, apps, marketing). One dark blue-black page in deep blue and electric lime, with light "paper" sections, scroll choreography, a 3D hero and four interactive concept demos. English plus Serbian (Latin), Russian and German.

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
npm run check:messages   # every language has the same keys, tags and placeholders
npm run check:palette    # src/lib/palette.ts matches the colour tokens in globals.css
```

Section screenshots for review (uses Playwright):

```bash
npm run build && npx next start -p 3100
node scripts/shoot.mjs http://localhost:3100 .shots /
```

## Where things live

| Path                           | What                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `messages/*.json`              | All copy, per language                                                                                            |
| `src/app/[locale]/`            | Layout + the single page                                                                                          |
| `src/components/sections/`     | One component per section                                                                                         |
| `src/components/work/`         | Concept cards, previews and the demo window                                                                       |
| `src/components/work/demos/`   | The four concept mini-sites (lazy-loaded when a window opens)                                                     |
| `src/app/globals.css`          | Palette and the design system tokens (type sizes, column, spacing, corners, control heights)                      |
| `src/lib/palette.ts`           | The same palette for WebGL and canvas code (the orb's dots)                                                       |
| `src/styles/sections.css`      | Section styles ported from the design export                                                                      |
| `src/lib/placeholders.ts`      | `[studio]`, the email domain: the one thing still undecided in the copy                                           |
| `src/components/brand/`        | The klin logo (`<Logo>`, `<Mark>`); its geometry, `public/brand/` and the icons come from `scripts/logo/build.py` |
| `src/app/api/contact/route.ts` | Contact endpoint (**stub** — see `docs/BACKEND.md`)                                                               |
| `docs/OPEN-ITEMS.md`           | What's still missing before launch (photos, name, prices…)                                                        |
| `docs/BACKEND.md`              | Start here for the backend: contact endpoint, email and domain, booking, security, privacy                        |
| `src/app/global-not-found.tsx` | The 404, in all four languages (`src/components/sections/Lost.tsx`)                                               |

## Quality bar

- **Languages:** every message file has the same keys, ICU arguments and tags as `en.json`; layouts were checked at 320/390/768/1024/1440 px in all four languages.
- **Reduced motion:** no pins, scrubs or loops; state changes keep short fades. Motion (`motion/react`) follows the OS setting via `MotionConfig`.
- **Accessibility:** keyboard-only flow (skip link, visible focus, focus trap + Esc in demo windows), axe-core clean on the page, inside the demo windows, and through the fit finder and the Contact conversation.
- **Performance:** the 3D scene and each demo load lazily; fonts preload only their Latin subset (other scripts load on demand).

## Deploy

Import the GitHub repo in Vercel; no settings needed. `vercel.json` pins the **Next.js** framework preset and the `.next` output folder, so a project that was created with the "Other" preset (error: _No Output Directory named "public" found_) still builds correctly. Optional env vars: `NEXT_PUBLIC_CONTACT_ENDPOINT` if the contact backend is hosted elsewhere, `NEXT_PUBLIC_SITE_URL` to pin the site's address (otherwise Vercel's production domain is used). See `docs/BACKEND.md`.
