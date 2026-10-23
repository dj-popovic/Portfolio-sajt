# Contact API — contract for the backend

The front end (the 4-step "conversation" in the Contact section) sends **one JSON POST** when the visitor presses "Send it". This document is the contract; the TypeScript source of truth is `src/lib/contact.ts`.

## Endpoint

- Default: `POST /api/contact` (same origin).
- To host the backend elsewhere, set `NEXT_PUBLIC_CONTACT_ENDPOINT` (e.g. `https://api.example.com/contact`) in Vercel's environment variables and allow the site's origin via CORS.
- If you build it inside this repo, replace the stub in `src/app/api/contact/route.ts` (Vercel deploys it as a serverless function automatically).

## Request

`Content-Type: application/json`

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

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 1–80 chars |
| `project` | string | required, 3–1000 chars |
| `timeline` | string | required, 2–200 chars (free text or one of the quick chips) |
| `email` | string | required, valid email, ≤254 chars |
| `package` | `"basic" \| "pro" \| "custom" \| null` | the package button the visitor clicked in "Find your fit", if any |
| `addons` | array of `"branding" \| "copy" \| "languages" \| "maintenance" \| "hosting" \| "cms" \| "analytics"` | add-on chips the visitor selected (can be empty) |
| `locale` | `"en" \| "sr" \| "ru" \| "de"` | language the visitor used — handy for replying in their language |
| `company` | string | **honeypot**. Hidden from people; bots fill it. If non-empty, drop the message but still answer `200 { "ok": true }`. |

Always validate on the server too (`validatePayload()` in `src/lib/contact.ts` can be reused).

## Responses

| Status | Body | Front-end behaviour |
|---|---|---|
| `200` | `{ "ok": true }` | Shows "Thanks — message on its way." |
| `400` | `{ "ok": false, "error": "validation", "fields": ["email"] }` | Shows the generic error and keeps the answers |
| `429` | `{ "ok": false, "error": "rate_limited" }` | Same |
| `5xx` | `{ "ok": false, "error": "server" }` | Same |

Any non-2xx or `ok: false` shows: "Something went wrong sending that. Try again in a moment, or email us directly."

## Suggestions

- Deliver by email (e.g. Resend/Postmark) to both founders; put `name`, `email`, `package`, `addons`, `timeline` in the subject or a small table so you can triage fast.
- Rate-limit by IP (a few requests per minute is plenty).
- Don't store more than you need (GDPR); if you store, document it in the privacy policy.

## Try it

```bash
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana","project":"A new site","timeline":"ASAP","email":"ana@example.com","package":null,"addons":[],"locale":"en","company":""}'
```
