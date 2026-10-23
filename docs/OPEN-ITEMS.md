# Open items

Things that are intentionally unfinished, and why. Search the code for `TODO(` to find the spots.

## 1. Photos — needed before launch

The site is built so photos drop in without layout changes. Until then the slots show `[bracketed]` placeholders.

| Where | What | Why it matters |
|---|---|---|
| About — two tilted cards (`src/components/sections/About.tsx`) | Business portraits of both founders, portrait crop (~4:5), warm light | The About section *is* the human proof — "two people, one studio". Empty cards make the studio feel anonymous, which works against the warm, welcoming brief. |
| Contact — two round avatars (`src/components/sections/Contact.tsx`) | Square crops of the same portraits | "The two of us read every message" only feels true with faces next to it; it's the trust moment right before someone writes to you. |
| Work — coffee concept ([Ember & Oak]) | A founders / cupping-table photo for the story block (the one striped `[photo]` slot left, `TODO(photos)` in `demos/coffee/CoffeeDemo.tsx`). Optional: real bag shots to replace the drawn bags. | The drawn bags already carry the shop; the story block is where a real photo makes the concept read as finished client work instead of a mock-up — the whole point of the Work section. |
| Work — street-food concept ([Tako]) | Optional: dish photos (tacos, bowls, drinks; top-down or 3/4) to replace the flat illustrations in `demos/food/Dish.tsx` | Food apps live or die on appetite appeal. The illustrations work, but real food photography is what makes people hungry. |
| Work — wellness concept ([Stillwater]) | Optional: 2–3 calm ambient images (water, sky, texture) | Nice to have — the app UI already carries itself. |
| Social share (OG) image | 1200×630 with the final logo | Shown when the link is shared in chats/social. Needs the name/logo first. |

Image licensing: use photos you own or that are explicitly licensed for commercial use.

## 2. Name, logo and domain

- Replace `<logo>`, `[studio]` and the ★ placeholder mark (nav, footer, favicon `src/app/icon.svg`, page title in `messages/*.json` → `meta.title`).
- Placeholders live in `src/lib/placeholders.ts` — never translate them.
- Email `hello@[studio].com` in the footer.

## 3. Copy

- All copy is in `messages/en.json` (+ `sr`, `ru`, `de`). The current text is the design's placeholder copy.
- Founder names `<Name One>` / `<Name Two>`, city `[Novi Sad]`.
- Social links are `#` (Instagram, Dribbble, LinkedIn, X) — real URLs needed, or remove the ones you won't use.
- "Read the journal" links to nothing — remove it unless a journal is planned.
- The concept brand names are placeholders too: `[Ember & Oak]`, `[Northwind]`, `[Stillwater]`, `[Tako]`.

## 4. Prices

"Let's talk" everywhere for now. When decided, put "From €X" into `fit.packages.*.hint` in each language file — the layout already has the slot.

## 5. Contact backend

Being built separately — see [CONTACT_API.md](./CONTACT_API.md). The current `/api/contact` is a **stub that does not deliver messages**.

## 6. Translations

SR (Latin), RU and DE were drafted by Claude and need a native-speaker pass before launch.

## 7. Legal (likely needed before launch)

With a contact form and a German audience: a privacy policy (GDPR) and probably an Impressum. Not designed yet.

## 8. Later

- Testimonials / social proof section (reserved in the brief, add when there are clients).
