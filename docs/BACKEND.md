# Backend: start here

For Relja. Everything on the site that needs a server, an account or a secret, in one place. The front end is finished around it: the forms, the states and the messages are there and wait for the pieces below. Đorđe keeps the front end (`src/components`, `src/styles`, `messages`); this file is the line between the two.

## 1. The project in two minutes

- **One page, four languages:** English at `/`, Serbian (Latin) at `/sr`, Russian at `/ru`, German at `/de`. Next.js **16.4** (App Router), TypeScript, Tailwind 4, next-intl. Hosted on **Vercel**, deployed from `main` on every push.
- **This Next.js is newer than most docs and memory.** Read the bundled docs in `node_modules/next/dist/docs/` before using an API: the middleware file is `src/proxy.ts`, and **Cache Components are on** (`cacheComponents: true`), which changes what renders statically and when.
- Rules for everyone are in `CLAUDE.md` (the studio is always lowercase **klin**, never translated) and the unfinished things in `docs/OPEN-ITEMS.md`.

```bash
npm install
npm run dev                # http://localhost:3000
npm run build && npx next start -p 3100   # the production build, as Vercel runs it
npm run lint
npm run check:messages     # after touching messages/*.json
```

Commits go straight to `main`. Vercel builds every push; a red build means production keeps the last good one.

## 2. The contact endpoint (the first job)

The Contact section is a four-question conversation. On the last answer it sends **one JSON POST** and shows the result. Today `/api/contact` is a **stub**: it validates and answers `{ ok: true }` **without delivering anything** (`src/app/api/contact/route.ts`). Replace it.

**Where it posts:** `CONTACT_ENDPOINT` in `src/lib/contact.ts`: `NEXT_PUBLIC_CONTACT_ENDPOINT` if set, else `/api/contact` on the site itself. Building it inside this repo (a Route Handler, deployed by Vercel as a function) is the simplest. If it lives elsewhere, set that variable in Vercel and allow only the site's origin in CORS.

**The contract** (TypeScript source of truth: `ContactPayload`, `ContactResponse` and `validatePayload()` in `src/lib/contact.ts`; keep this section in step with it):

```json
{
  "name": "Ana",
  "project": "A storefront for our coffee roastery",
  "timeline": "1–3 months",
  "email": "ana@example.com",
  "package": "pro",
  "addons": ["branding", "languages"],
  "locale": "sr",
  "company": ""
}
```

| Field      | Type                                                                                                   | Rules                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `name`     | string                                                                                                 | required, 1–80 characters                                                                    |
| `project`  | string                                                                                                 | required, 3–1000                                                                             |
| `timeline` | string                                                                                                 | required, 2–200 (free text or one of the quick replies)                                      |
| `email`    | string                                                                                                 | required, a valid address, at most 254                                                       |
| `package`  | `"basic"` / `"pro"` / `"custom"` / `null`                                                              | the package picked in Find your fit, if any                                                  |
| `addons`   | array of `"branding"`, `"copy"`, `"languages"`, `"maintenance"`, `"hosting"`, `"cms"`, `"analytics"` | add-ons picked there (can be empty)                                                          |
| `locale`   | `"en"` / `"sr"` / `"ru"` / `"de"`                                                                      | the language they wrote in: reply in it                                                      |
| `company`  | string                                                                                                 | **honeypot**, hidden from people. Filled means a bot: drop it, but answer `200 { ok: true }` |

Validate on the server as well (`validatePayload()` can be imported as is).

| Status | Body                                                       | What the visitor sees                                    |
| ------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| `200`  | `{ "ok": true }`                                           | the brief is sent: the orb bursts, "Sent"                |
| `400`  | `{ "ok": false, "error": "validation", "fields": [...] }` | "Something went wrong…", their answers stay, they can retry |
| `429`  | `{ "ok": false, "error": "rate_limited" }`                 | the same                                                 |
| `5xx`  | `{ "ok": false, "error": "server" }`                       | the same                                                 |

Anything that isn't a 2xx with `ok: true` counts as a failure; the visitor keeps their answers and can send again, or email us.

**What it should do:**

- **Deliver by email** to both of us (Resend or Postmark both fit, your pick). Put the name, package, add-ons and timeline in the subject or a small table, and set **Reply-To** to the visitor's address so a reply goes straight to them.
- **Rate-limit** by IP: a few sends a minute is plenty. A Vercel Firewall rate-limit rule (check what our plan includes) or Upstash Redis (`@upstash/ratelimit`) both work without a server of our own.
- **Spam:** the honeypot is in. Add Cloudflare Turnstile only if real spam gets through; it would need a widget in the conversation, so tell Đorđe first.
- **Keep nothing you don't need.** If messages are stored, the privacy policy has to say where and for how long (section 6).

```bash
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","project":"A new site","timeline":"ASAP","email":"ana@example.com","package":null,"addons":[],"locale":"en","company":""}'
```

## 3. Domain and email

Nothing in the code waits for the domain except the email addresses.

1. **Register the domain** and add it to the Vercel project (Settings → Domains), DNS as Vercel asks.
2. **The site's address follows by itself:** `src/lib/site.ts` takes Vercel's production domain at build time (`VERCEL_PROJECT_PRODUCTION_URL`), so the canonical links, the sitemap, `robots.txt`, the share images and the structured data switch to the new domain on the next deploy. To pin it anyway, set `NEXT_PUBLIC_SITE_URL=https://the-domain` in Vercel.
3. **Mail on the domain:** an inbox provider for `hello@`, `djordje@` and `relja@`, and for sending from the contact endpoint the provider's **SPF, DKIM and DMARC** records (without them our replies land in spam).
4. **Replace the placeholder:** `[studio]` in `src/lib/placeholders.ts` is the only stand-in left (the footer's address, Copy email, the founder profiles). Change `studio` there; the rest follows. Then tick it off in `docs/OPEN-ITEMS.md`.

## 4. Booking a call (Cal.com, still to decide)

The idea: after the brief is sent, offer a call, booked through Cal.com behind our own design. The design mockup: <https://claude.ai/artifact/TsS9Q4ErHmiUt9RRrn3f1q> (the flow, the states and the questions below; ask Đorđe for access). To decide together first (`docs/OPEN-ITEMS.md`, section 6):

- **Who joins:** either of us (round-robin) or both (collective). One person fits Cal.com's free plan; picking between us or booking both needs the Teams plan or a self-hosted Cal.com.
- **Call lengths and hours:** the mockup has a 20-minute intro and a 45-minute deep dive, sample hours, times shown in the visitor's own zone.
- **Embed or API:** Cal.com's embed takes our colours and fonts and is quick; a booking UI drawn by us, like the mockup, talks to its API (free slots in, booking out) through our own endpoint, so the key stays on the server. Check what the chosen plan allows.
- When it's settled, the front end draws it; the backend side is the API calls, the key, and the webhooks if we want a booking to land in the same inbox as the briefs.

## 5. Security

**Already in** (`next.config.ts`, `headers()`): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` with CSP `frame-ancestors 'none'` (plus `base-uri`, `object-src`, `form-action`), `Cross-Origin-Opener-Policy: same-origin-allow-popups`, and a `Permissions-Policy` that turns off camera, microphone, location, payment, USB and Topics. Every unknown address returns a real **404** (`src/app/global-not-found.tsx`).

**Yours:**

- **HSTS:** Vercel sends it on its domains. Once ours is live, check with `curl -sI https://the-domain | grep -i strict` and add the header in `next.config.ts` if it's missing.
- **A full Content-Security-Policy** (which scripts, styles, connections may load) belongs with the backend, because it must list whatever the backend adds (an email or booking API, Turnstile). Two constraints: the pages are **static** (prerendered), and a nonce-based CSP would make every page render per request and drop that; and the page has small inline scripts (the head script in `src/app/[locale]/layout.tsx`, the structured data, the 404's language pick). So it's `script-src 'self' 'unsafe-inline'`, or the experimental hash-based route (`experimental.sri`, see `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`). `connect-src` must include the contact endpoint if it's on another origin. Test on a preview deployment with the browser console open: a blocked resource shows there.
- **Secrets** only in Vercel's environment variables (server-side names, never `NEXT_PUBLIC_…`), never in the repo or in a chat.
- **Dependencies:** `npm audit` is clean today. Next.js security releases are worth taking quickly (`docs/OPEN-ITEMS.md`, section 11).

## 6. Privacy and legal

With a contact form and visitors from Germany the site needs a **privacy policy** (GDPR) and probably an **Impressum** before launch (`docs/OPEN-ITEMS.md`, section 9). The backend decides most of what goes in it:

- what we collect: name, the project description, timeline, email, package and add-ons, language, and the IP address if it's used for rate limiting;
- where it goes (the email provider, Cal.com once booking is in) and how long we keep it;
- the site runs **no analytics** and sets **one cookie**, `NEXT_LOCALE` (next-intl's, for the session: it remembers the language a visitor chose, so it needs no consent banner, but the policy names it). If you add analytics, choose a cookieless one (Vercel Web Analytics is) and name it.

Write the text (EN first; Đorđe will translate and lay it out as its own page and link it from the footer and the conversation).

## 7. Environment variables

| Name                           | Who reads it                        | Needed                                                     |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | the conversation (`src/lib/contact.ts`) | only if the endpoint is not `/api/contact` on the site |
| `NEXT_PUBLIC_SITE_URL`         | `src/lib/site.ts`                   | optional: Vercel's production domain is used otherwise    |
| your provider keys             | your endpoint                       | server-side only, set in Vercel (e.g. `RESEND_API_KEY`)    |

`NEXT_PUBLIC_…` values are built into the page and visible to everyone: never a key.

## 8. Before launch (backend's list)

- [ ] `/api/contact` delivers to both inboxes, with Reply-To; validation, honeypot and rate limit tested (`curl` above, plus a real send from each language)
- [ ] domain on Vercel, HTTPS and HSTS checked
- [ ] mailboxes working; SPF, DKIM and DMARC pass (send one to Gmail and check "Show original")
- [ ] `[studio]` replaced in `src/lib/placeholders.ts`
- [ ] CSP added and checked on a preview deployment
- [ ] privacy policy (and Impressum) text written
- [ ] booking decided (or explicitly postponed)
