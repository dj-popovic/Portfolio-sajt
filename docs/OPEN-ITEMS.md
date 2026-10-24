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

SR (Latin), RU and DE were drafted by Claude and need a native-speaker pass before launch. Choices worth a second look:

- **German uses "du"** (matches the warm, informal English). Switching to "Sie" touches most strings in `messages/de.json`.
- **Founder roles are gender-neutral only in German** ("Co-Founder"). Serbian "Suosnivač" and Russian "Сооснователь" are the generic masculine; change them once the founders are named (e.g. "Suosnivačica").
- **City stays `[Novi Sad]`** everywhere, so Serbian reads "u [Novi Sad]". When the real city goes in, decline it ("u Novom Sadu").
- Headlines were rewritten to fit, not translated word for word: the hero in RU ("Креатив с огнём потеплее") and DE ("Kreative Arbeit, die wärmer brennt") had to stay short because Unbounded is wide.
- Package names (Basic / Pro / Custom) are kept in English in every language.

All four files must keep the same keys, ICU arguments and rich tags, and every string must parse — `npm run check:messages` checks exactly that after any edit.

## 7. Contrast — done

Small text from the design palette was nudged up to WCAG AA (4.5:1 for normal text, 3:1 for large text) without changing the look. axe-core now reports no contrast violations. Every change is marked `build: contrast (WCAG AA)` in `src/styles/sections.css`.

| Where | Before | After |
|---|---|---|
| Package cards — "Investment" label and the "[From €X …]" hint | 3.0 / 3.3:1 | `#837162`, 4.7:1 |
| About — stat labels under 2 / 4 / 1 | 4.0:1 | `#7E6C5F`, 4.7:1 |
| Services — card numbers 01–04 | 3.3:1 | 50% cream, 4.7:1 |
| Work — "Concept · Web" pill | white on orange, 2.5:1 | dark text, 6.7:1 (the dark "App" pill keeps white text) |
| How we work — phase tags and "you get" lines | 3.4 / 4.2:1 | 50% cream, 4.8:1 |
| How we work — big step numbers before they light up | 1.7:1 | 38% cream, 3.2:1 (large text) |
| Hero — "Scroll" cue | 3.7:1 | 50% cream, 4.8:1 |
| Nav — inactive language codes | 2.3:1 | 4.6:1 |
| Contact — input placeholder | 2.5:1 | 4.7:1 |
| Photo placeholder labels (About cards, Contact avatars) | 2.7 / 3.2:1 | 4.6 / 4.7:1, until real photos replace them |

Still flagged by the Impeccable detector, on purpose:

- The miniature site previews on the Work cards. They're pictures of the concept sites (hidden from screen readers), so text contrast rules don't apply to them.
- The ember gradient on the hero headline's highlighted words, now the only gradient text on the page.
- The pulsing dot next to the footer's local clock. It marks a live value, so it stays.
- Inter as the body font: a brief decision.
- Striped image placeholders inside the previews and the coffee concept. They go away with the photos (section 1).
- The 8.5px "[founder photo]" labels in the Contact avatars. They go away with the photos too.

## 8. Legal (likely needed before launch)

With a contact form and a German audience: a privacy policy (GDPR) and probably an Impressum. Not designed yet.

## 9. Later

- Testimonials / social proof section (reserved in the brief, add when there are clients).
