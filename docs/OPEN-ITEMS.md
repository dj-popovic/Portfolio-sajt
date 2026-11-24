# Open items

Things that are intentionally unfinished, and why. Search the code for `TODO(` to find the spots.

## 1. Photos — needed before launch

The site is built so photos drop in without layout changes. Until then the slots show `[bracketed]` placeholders.

| Where                                | What                                                                                                                                                                  | Why it matters                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Work — coffee concept (Copper & Oak) | Optional: a real cupping-table or roastery photo for the story block (drawn for now in `demos/coffee/CuppingTable.tsx`) and real bag shots to replace the drawn bags. | The drawings already carry the shop; real photos would make the concept read even more like finished client work.        |
| Work — street-food concept (Tako)    | Optional: dish photos (tacos, bowls, drinks; top-down or 3/4) to replace the flat illustrations in `demos/food/Dish.tsx`                                              | Food apps live or die on appetite appeal. The illustrations work, but real food photography is what makes people hungry. |
| Work — wellness concept (Stillwater) | Optional: 2–3 calm ambient images (water, sky, texture)                                                                                                               | Nice to have — the app UI already carries itself.                                                                        |

About uses no photos any more: the founders are 3D name cards with their tools (decided in the About redesign). Contact doesn't either (the owners' call): each founder is a lens of glass with their craft drawn in it.

Image licensing: use photos you own or that are explicitly licensed for commercial use.

## 2. Name, logo and domain

- **Done (Nov 2026):** the studio is **klin** (always lowercase), and its logo is in: the header, the phone menu, the footer's copyright line, the About tile (the mark), the page title and share title in all four languages, the favicon, the Apple icon and the web manifest. Files in `public/brand/` (`logo-dark/light/mono.svg`, `mark.svg`, icons); the build is described in `src/components/brand/`.
- **Still open: the domain.** Until it's registered, `[studio]` stays in the email addresses: `hello@[studio].com` (footer, Copy email) and `djordje@[studio].com` / `relja@[studio].com` (founder profiles), all in `src/lib/placeholders.ts`. The part before the @ follows the founders' names; change it there if the real addresses differ.
- **Done (Nov 2026): the share images**, one per language (1200×630: the logo, the hero's headline and the orb), in `public/og/`. They're made from the real hero by `scripts/og/build.mjs`; run it again if the headline, the logo or the orb changes.
- **Done (Nov 2026): search-engine basics.** The site's address comes from `src/lib/site.ts` (Vercel's production domain, or `NEXT_PUBLIC_SITE_URL`), and with it the canonical and language links, `sitemap.xml`, `robots.txt` and the structured data (the studio, the two of you, Novi Sad).
- **Once the domain is set:** add it in Vercel. The next deploy moves the share images, links, sitemap and structured data to it by itself. The steps for mail on the domain are in [BACKEND.md](./BACKEND.md), section 3.
- The one placeholder left, `[studio]`, lives in `src/lib/placeholders.ts` — never translate it.

## 3. Copy

- All copy is in `messages/en.json` (+ `sr`, `ru`, `de`). The current text is the design's placeholder copy.
- **Done (Nov 2026):** the founders are Đorđe (frontend and design) and Relja (backend), the city is Novi Sad. The names are in the message files (`about.people.*.name`). Two choices to confirm:
  - Russian writes them in Cyrillic, as Russian text does with names and cities: Джордже, Реля, Нови-Сад. To keep the Latin spelling there instead, change `about.people.*.name`, `contact.brief.for` and the two footer lines in `messages/ru.json`.
  - Serbian and Russian decline them where the sentence asks for it ("Za Đorđa i Relju", "u Novom Sadu", "в Нови-Саде").
- Founder profiles (the About cards open into them):
  - Bios are bracketed first-person drafts in `about.people.*.bio` — write your own.
  - Emails `djordje@[studio].com` / `relja@[studio].com` live in `src/lib/placeholders.ts`.
  - LinkedIn / GitHub links are `#` in `src/lib/founders.ts`.
  - The tool stacks in the same file are a first pick (12 each, frontend left, backend right). Logos come from Simple Icons (`src/lib/tech-icons.ts`, generated); adding a tool means adding its path there.
- Social links are `#` (Instagram, Dribbble, LinkedIn, X, GitHub) — real URLs needed, or remove the ones you won't use. GitHub took the place of "Read the journal" in the footer (no journal is planned, the owners' call): Dribbble shows the design, GitHub the code.
- Wording from the old orange palette: settled. The orb's screen-reader name is "Interactive sphere of dots" now; `contact.done.hint` keeps "a warm, human reply" (the owners' call: it's human warmth, not fire).
- The four Work concepts have real names now (fictional client brands, filled in at the owners' request): Copper & Oak, Northbound, Stillwater, Tako. No brackets are left inside the demos: origins, cities, people and numbers are filled. A rename touches `src/components/work/concepts.ts` and the demo copy; the marks are drawn icons (`src/components/work/marks.tsx`).

## 4. Prices

Decided so far: two packages get a fixed price and one stays custom. Basic and Pro are the pair; the amounts are still to be agreed.

Until then the cards say how each is priced instead of three times "Let's talk": Basic and Pro "Fixed price" ("Quoted up front · usually 2–3 weeks" / "5–8 weeks"), Custom "Per project" ("Scoped and priced together"). To confirm or change, all in `fit.packages.*` in each language file:

- **The timelines** (2–3 and 5–8 weeks) are typical figures for a custom one-pager and a multi-page animated site, put in so the cards say something concrete. Change them if yours differ.
- **The amounts.** When they're set, `price` becomes e.g. "From €1,500" and the hint keeps the rest. Pricing pages that show a starting price do better than ones that hide it, so it's worth doing soon. For orientation (agency and freelancer blogs, Nov 2026, so rough): small European studios quote about €500–2,000 for a custom landing page and €3,000–12,000 for a 5–10 page site; a custom animated one-pager from a creative developer is quoted at $3,000–5,000; public Serbian package prices are far lower (about €50–750) but are for template sites, not this kind of work.
- **"Recommended"** on Pro replaced "Most popular": with no clients yet, "most popular" can't be backed up.
- **The three promises** under the cards ("The two of us, start to finish", "Live previews every week", "Everything is yours at handover") restate what the site already says elsewhere; drop or change any that isn't how you work.

## 5. Contact backend

Being built separately: everything the backend needs (the contract, email, domain, booking, security, privacy) is in [BACKEND.md](./BACKEND.md). The current `/api/contact` is a **stub that does not deliver messages**. The conversation in Contact sends the same payload the form did (the four answers, the package and add-ons picked in Find your fit, the language).

## 6. Booking a call — mockup only

A mockup of a booking step in the site's look, not built into the site yet: <https://claude.ai/artifact/TsS9Q4ErHmiUt9RRrn3f1q> (private until it's shared from its Share menu). The idea: Cal.com behind our own design, offered once the brief is sent. Redrawn in Nov 2026 in the blue and lime glass of the Contact section, with your names and Novi Sad; booked, it confirms the way the brief card does (a lime thread through the rows, a "Booked" pill, the orb whole in the corner) instead of the old ticket and stamp.

To decide together:

- **Hours.** The mockup shows sample hours only.
- **Call lengths.** The mockup offers a 20-minute intro and a 45-minute deep dive.
- **Who joins.** Sometimes one of you, sometimes both. Cal.com's free plan covers one person; letting visitors pick either of you (round-robin) or book you both at once (collective) needs its Teams plan (about $12–16 per person a month according to third-party pricing pages; cal.com itself couldn't be reached from here to confirm) or a self-hosted Cal.com.
- **How much of the look is ours.** Cal.com's embed takes our colours and fonts; a booking UI drawn entirely by us, like the mockup, goes through its API, so check what the chosen plan allows.
- The privacy policy will need to name the booking service (section 9).

## 7. Translations

SR (Latin), RU and DE were drafted by Claude and need a native-speaker pass before launch. Choices worth a second look:

- **German uses "du"** (matches the warm, informal English). Switching to "Sie" touches most strings in `messages/de.json`.
- **Founder roles are gender-neutral only in German** ("Co-Founder"). Serbian "suosnivači" and Russian "сооснователи" are the masculine plural, which is also the generic one; say if it should read differently.
- Headlines were rewritten to fit, not translated word for word: the hero in SR ("Kreativa koja odbija da se uklopi."), RU ("Креатив, который не сливается с фоном.") and DE ("Kreative Arbeit, die aus der Reihe tanzt.") had to stay short because Unbounded is wide.
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

With a contact form and a German audience: a privacy policy (GDPR) and probably an Impressum. Not designed yet. Once booking is in, the privacy policy names the booking service too (the owners asked to leave that for later). What it has to cover is listed in [BACKEND.md](./BACKEND.md), section 6, including the one cookie the site sets (`NEXT_LOCALE`, the language a visitor picked).

## 10. Later

- Testimonials / social proof section (reserved in the brief, add when there are clients).
- Smoother on some laptops, if you notice lag: the glass panes blur the moving blue lights behind them, and a laptop's graphics redraw that blur every frame. Freezing the lights under the panes, or a lighter blur there, would cost a little of the look; left as it is until it shows (the owners' call, Nov 2026).
- **Done (Nov 2026): a different exit for the hero orb on phones.** The owners picked the calm one: it scrolls away with the hero, shrinking back and fading (the thread into the About sheet read oddly in one column, and gathering the dots into the header's logo was too small to read on a phone). Desktop keeps the thread into the klin tile.

## 11. A Next.js security patch — done (Nov 2026)

The site is on Next.js 16.4.6 (with `eslint-config-next` to match), which fixes [GHSA-mfr8-8qww-v76h](https://github.com/advisories/GHSA-mfr8-8qww-v76h) (information disclosure across root params through `unstable_cache()` and `'use cache'`; the site used neither, so it was never exposed). The same day the lint tools' advisories were cleared too (typescript-eslint's copy of minimatch, which never ships to the site): `npm audit` reports none.

## 12. Checks on real devices before launch

Everything is tested here in Chrome only (desktop and phone emulation). The owners' iPhone found three things Chrome never showed: the Work previews' text (CSS zoom), the orb cut off after scrolling back up, and the What we offer panes shaking while stuck (a clip above a sticky element). All three are fixed and confirmed on the iPhone (Nov 2026). Still to look at once, on real hardware: Safari on a Mac, an iPad (both ways round), an Android phone in Chrome, and Firefox on a computer.

## 13. Front-end round — done (Nov 2026)

- **A 404 page** in the site's look, in all four languages (the language the address starts with), with a real 404 status for every unknown address: `src/app/global-not-found.tsx`.
- **The headline on slow phones** starts appearing after about 2 seconds instead of 5: the hero's entrance is CSS now and no longer waits for the page's scripts. The motion is the same.
- **Screen readers and speech control:** the language button and the Work cards are named by what they show.
- **Windows high contrast and "reduce transparency"** are handled: outlines where colour did the work, the logo visible on light themes, solid glass when asked for.
- **Security headers** (no framing, no file-type guessing, a strict referrer, browser features off) and **search basics** (canonical links, sitemap, robots, structured data).
- **Backend handover:** everything that needs a server, an account or a secret is in [BACKEND.md](./BACKEND.md), for Relja.
