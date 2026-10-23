// Shared between server and client components (keep free of "use client").
export const PACKAGES = ["basic", "pro", "custom"] as const;
export const ADDONS = ["branding", "copy", "languages", "maintenance", "hosting", "cms", "analytics"] as const;

export type PackageKey = (typeof PACKAGES)[number];
export type AddonKey = (typeof ADDONS)[number];
