import { NextResponse } from "next/server";
import { validatePayload, type ContactPayload, type ContactResponse } from "@/lib/contact";

/**
 * STUB — the real backend is being built separately (see docs/CONTACT_API.md).
 * It validates the request exactly like the real endpoint should, then answers
 * { ok: true } WITHOUT delivering the message anywhere, so the form can be
 * reviewed on preview deployments. Replace before launch.
 */
export async function POST(request: Request) {
  let body: Partial<ContactPayload>;
  try {
    body = (await request.json()) as Partial<ContactPayload>;
  } catch {
    return NextResponse.json<ContactResponse>({ ok: false, error: "validation" }, { status: 400 });
  }

  // bots fill the honeypot; pretend success so they don't retry
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json<ContactResponse>({ ok: true });
  }

  const fields = validatePayload(body);
  if (fields.length) {
    return NextResponse.json<ContactResponse>({ ok: false, error: "validation", fields }, { status: 400 });
  }

  console.warn("[contact] stub endpoint — message NOT delivered:", {
    package: body.package,
    addons: body.addons,
    locale: body.locale,
  });
  return NextResponse.json<ContactResponse>({ ok: true });
}
