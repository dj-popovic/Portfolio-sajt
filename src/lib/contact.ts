import type { AddonKey, PackageKey } from "@/lib/brief";

/**
 * Contract between the contact form (front end) and the backend.
 * Documented for the backend in docs/CONTACT_API.md — keep both in sync.
 */
export type ContactPayload = {
  name: string;
  project: string;
  timeline: string;
  email: string;
  package: PackageKey | null;
  addons: AddonKey[];
  locale: string;
  /** honeypot — real visitors never fill it; reject when non-empty */
  company: string;
};

export type ContactResponse =
  | { ok: true }
  | { ok: false; error: "validation" | "rate_limited" | "server"; fields?: Array<keyof ContactPayload> };

export const CONTACT_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || "/api/contact";

/** The conversation's questions, in order (Contact) */
export const CONTACT_STEPS = ["name", "project", "timeline", "email"] as const;
export type ContactStep = (typeof CONTACT_STEPS)[number];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = {
  name: 80,
  project: 1000,
  timeline: 200,
  email: 254,
} as const;

export function validatePayload(p: Partial<ContactPayload>): Array<keyof ContactPayload> {
  const bad: Array<keyof ContactPayload> = [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  if (!str(p.name) || str(p.name).length > LIMITS.name) bad.push("name");
  if (str(p.project).length < 3 || str(p.project).length > LIMITS.project) bad.push("project");
  if (str(p.timeline).length < 2 || str(p.timeline).length > LIMITS.timeline) bad.push("timeline");
  if (!EMAIL_PATTERN.test(str(p.email)) || str(p.email).length > LIMITS.email) bad.push("email");
  return bad;
}
