# Open items

Things that are intentionally unfinished, and why. Search the code for `TODO(` to find the spots.

## 1. Photos — needed before launch

The site is built so photos drop in without layout changes. Until then the slots show `[bracketed]` placeholders.

| Where                                | What                                                                                                                                                                  | Why it matters                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Work — coffee concept (Copper & Oak) | Optional: a real cupping-table or roastery photo for the story block (drawn for now in `demos/coffee/CuppingTable.tsx`) and real bag shots to replace the drawn bags. | The drawings already carry the shop; real photos would make the concept read even more like finished client work.        |
| Work — street-food concept (Tako)    | Optional: dish photos (tacos, bowls, drinks; top-down or 3/4) to replace the flat illustrations in `demos/food/Dish.tsx`                                              | Food apps live or die on appetite appeal. The illustrations work, but real food photography is what makes people hungry. |
| Work — wellness concept (Stillwater) | Optional: 2–3 calm ambient images (water, sky, texture)                                                                                                               | Nice to have — the app UI already carries itself.                                                                        |
| Social share (OG) image              | 1200×630 with the final logo                                                                                                                                          | Shown when the link is shared in chats/social. Needs the name/logo first.                                                |

About uses no photos any more: the founders are 3D name cards with their tools (decided in the About redesign). Contact doesn't either (the owners' call): each founder is a lens of glass with their craft drawn in it.

Image licensing: use photos you own or that are explicitly licensed for commercial use.

## 2. Name, logo and domain

- Replace `<logo>`, `[studio]` and the ★ placeholder mark (nav, footer, favicon `src/app/icon.svg`, page title in `messages/*.json` → `meta.title`).
- Placeholders live in `src/lib/placeholders.ts` — never translate them.
- Email `hello@[studio].com` in the footer.

## 3. Copy

- All copy is in `messages/en.json` (+ `sr`, `ru`, `de`). The current text is the design's placeholder copy.
- Founder names `<Name One>` / `<Name Two>`, city `[Novi Sad]`.
- Founder profiles (the About cards open into them):
  - Bios are bracketed first-person drafts in `about.people.*.bio` — write your own.
  - Emails `[name-one]@[studio].com` / `[name-two]@[studio].com` live in `src/lib/placeholders.ts`.
  - LinkedIn / GitHub links are `#` in `src/lib/founders.ts`.
  - The tool stacks in the same file are a first pick (12 each, frontend left, backend right). Logos come from Simple Icons (`src/lib/tech-icons.ts`, generated); adding a tool means adding its path there.
- Social links are `#` (Instagram, Dribbble, LinkedIn, X) — real URLs needed, or remove the ones you won't use.
- "Read the journal" links to nothing — remove it unless a journal is planned.
- The four Work concepts have real names now (fictional client brands, filled in at the owners' request): Copper & Oak, Northbound, Stillwater, Tako. No brackets are left inside the demos: origins, cities, people and numbers are filled. A rename touches `src/components/work/concepts.ts` and the demo copy; the marks are drawn icons (`src/components/work/marks.tsx`).

## 4. Prices

Decided so far: two packages get a fixed price and one stays custom. Basic and Pro are the pair (Custom already reads "Scoped and priced per project"); the amounts are still to be agreed.

Until then every card says "Let's talk" (one shared `fit.price`), with "Pricing shared in our first chat" under it. When the prices are set, give Basic and Pro their own price in each language file (read in `Fit.tsx`, where a comment marks the spot), change their hints to say the price is fixed, and keep Custom on "Let's talk".

## 5. Contact backend

Being built separately — see [CONTACT_API.md](./CONTACT_API.md). The current `/api/contact` is a **stub that does not deliver messages**. The conversation in Contact sends the same payload the form did (the four answers, the package and add-ons picked in Find your fit, the language).

## 6. Booking a call — mockup only

A mockup of a booking step in the site's look, not built into the site yet: <https://claude.ai/artifact/TsS9Q4ErHmiUt9RRrn3f1q> (private until it's shared from its Share menu). The idea: Cal.com behind our own design, offered once the brief is sent.

To decide together:

- **Hours.** The mockup shows sample hours only.
- **Call lengths.** The mockup offers a 20-minute intro and a 45-minute deep dive.
- **Who joins.** Sometimes one of you, sometimes both. Cal.com's free plan covers one person; letting visitors pick either of you (round-robin) or book you both at once (collective) needs its Teams plan (about $12–16 per person a month according to third-party pricing pages; cal.com itself couldn't be reached from here to confirm) or a self-hosted Cal.com.
- **How much of the look is ours.** Cal.com's embed takes our colours and fonts; a booking UI drawn entirely by us, like the mockup, goes through its API, so check what the chosen plan allows.
- The privacy policy will need to name the booking service (section 9).

## 7. Translations

SR (Latin), RU and DE were drafted by Claude and need a native-speaker pass before launch. Choices worth a second look:

- **German uses "du"** (matches the warm, informal English). Switching to "Sie" touches most strings in `messages/de.json`.
- **Founder roles are gender-neutral only in German** ("Co-Founder"). Serbian "Suosnivač" and Russian "Сооснователь" are the generic masculine; change them once the founders are named (e.g. "Suosnivačica").
- **City stays `[Novi Sad]`** everywhere, so Serbian reads "u [Novi Sad]". When the real city goes in, decline it ("u Novom Sadu").
- Headlines were rewritten to fit, not translated word for word: the hero in RU ("Креатив с огнём потеплее") and DE ("Kreative Arbeit, die wärmer brennt") had to stay short because Unbounded is wide.
- Package names (Basic / Pro / Custom) are kept in English in every language.

All four files must keep the same keys, ICU arguments and rich tags, and every string must parse — `npm run check:messages` checks exactly that after any edit.

## 8. Contrast — done

Small text from the design palette was nudged up to WCAG AA (4.5:1 for normal text, 3:1 for large text) without changing the look. axe-core now reports no contrast violations. Every change is marked `build: contrast (WCAG AA)` in `src/styles/sections.css`.

| Where                                                                   | Before                 | After                                                                                 |
| ----------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| Package cards — "Investment" label and the "[From €X …]" hint           | 3.0 / 3.3:1            | `#837162`, 4.7:1                                                                      |
| About — stat labels under 2 / 4 / 1                                     | 4.0:1                  | `#7E6C5F`, 4.7:1                                                                      |
| Services — card numbers 01–04                                           | 3.3:1                  | 50% cream, 4.7:1                                                                      |
| Work — "Concept · Web" pill                                             | white on orange, 2.5:1 | dark text, 6.7:1; since redesigned as a quiet glass pill on the dark card (78% cream) |
| How we work — phase tags and "you get" lines                            | 3.4 / 4.2:1            | 50% cream, 4.8:1                                                                      |
| How we work — big step numbers before they light up                     | 1.7:1                  | 38% cream, 3.2:1 (large text)                                                         |
| Hero — "Scroll" cue                                                     | 3.7:1                  | 50% cream, 4.8:1                                                                      |
| Nav — inactive language codes (since replaced by the language dropdown) | 2.3:1                  | 4.6:1                                                                                 |
| Contact — input placeholder                                             | 2.5:1                  | 4.7:1                                                                                 |
| Photo placeholder labels (About cards, Contact avatars)                 | 2.7 / 3.2:1            | 4.6 / 4.7:1, until real photos replace them                                           |

Still flagged by the Impeccable detector, on purpose:

- The live previews on the Work cards. They're replicas of the concept sites and apps in those brands' own colours (hidden from screen readers), so the contrast and "nested cards" rules don't apply to them; the coffee site's marquee in its preview only runs while the card is on screen.
- The founder cards' names and roles read as cream on paper to the detector, which can't see the card's dark shell (a separate layer under the text). On screen they're cream on near-black.
- The ember underglow inside the founder cards: part of the cards' material.
- The ember gradient on the hero headline's highlighted words, now the only gradient text on the page.
- The soft ember glow on the header's Start a project button (asked for in the header redesign).
- The pulsing dot next to the footer's local clock. It marks a live value, so it stays.
- Inter as the body font: a brief decision.
- Striped image placeholders inside the previews and the coffee concept. They go away with the photos (section 1).

## 9. Legal (likely needed before launch)

With a contact form and a German audience: a privacy policy (GDPR) and probably an Impressum. Not designed yet. Once booking is in, the privacy policy names the booking service too (the owners asked to leave that for later).

## 10. Later

- Testimonials / social proof section (reserved in the brief, add when there are clients).
