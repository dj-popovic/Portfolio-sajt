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
- Warm wording left from the old orange palette, waiting for the owners' OK (the recolour changed only the hero title and the footer line):
  - `hero.orb.label`, the orb's screen-reader name, still says "Ember orb, an interactive sphere of dots" (SR "Žarka kugla", RU "Огненная сфера", DE "Glutkugel"). Suggested: "Interactive sphere of dots".
  - `contact.done.hint`: "Expect a warm, human reply within a day." Human warmth, not fire; fine to keep.
- The footer line reads "made by hand in [Novi Sad]" with the city placeholder, like the footer clock. If Novi Sad is final, drop the brackets in `src/lib/placeholders.ts` and the messages.
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

## 8. Contrast — done (blue and lime palette, Nov 2026)

Every text meets WCAG AA (4.5:1, large text 3:1). axe-core reports no contrast violations on the page (EN desktop, DE phone) or inside the four demo windows. Text over glass, glows and the orb, which axe can't measure, was measured against the real pixels behind it: all 225 such texts at 1440px and 216 at 390px pass. The tightest is "two of us" in the chat, blue-text on the lit glass, at 4.6:1.

| Pair                                                                      | Ratio       |
| ------------------------------------------------------------------------- | ----------- |
| White text on the page (`--text` on `--bg` `#08080F`)                     | 20:1        |
| Muted text (`--text-muted` `#A3A3C2` on `--bg`)                           | 8.2:1       |
| Blue text (`--blue-text` `#8482FF` on `--bg` / on `--surface`)            | 6.3 / 5.9:1 |
| Lime on the page (`--lime` `#D5FB09` on `--bg`)                           | 16.8:1      |
| Deep blue on lime (buttons, badges, the paper markers)                    | 14:1        |
| White on deep blue (chips, Pro, your chat bubbles)                        | 16.6:1      |
| Lime on deep blue ("+2", the finder's step)                               | 14:1        |
| Ink on paper (`--ink` `#0A0A1F` on `--paper` `#F4F4FB`)                   | 17.8:1      |
| Muted ink on paper (`--ink-muted` `#55557A`)                              | 6.5:1       |
| Deep blue on paper (checks, links, focus rings)                           | 15.2:1      |
| Never used for text: deep blue on the dark (1.2:1), lime on paper (1.1:1) | —           |

Still flagged by the Impeccable detector, on purpose:

- The live previews on the Work cards. They're replicas of the concept sites and apps in those brands' own colours (hidden from screen readers), so the contrast and "nested cards" rules don't apply to them; the coffee site's marquee in its preview only runs while the card is on screen.
- The founder cards' names and roles read as white and blue-text on paper to the detector, which can't see the card's dark shell (a separate layer under the text). On screen they're on near-black.
- The blue underglow inside the founder cards: part of the cards' material.
- The soft lime glow on the header's Start a project button (asked for in the header redesign).
- The pulsing lime dot next to the footer's local clock. It marks a live value, so it stays.
- Inter as the body font: a brief decision.
- Striped image placeholders inside the previews and the coffee concept. They go away with the photos (section 1).

## 9. Legal (likely needed before launch)

With a contact form and a German audience: a privacy policy (GDPR) and probably an Impressum. Not designed yet. Once booking is in, the privacy policy names the booking service too (the owners asked to leave that for later).

## 10. Later

- Testimonials / social proof section (reserved in the brief, add when there are clients).
