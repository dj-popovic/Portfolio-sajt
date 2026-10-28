import { cn } from "@/lib/cn";

// No photos here (the owners' call): each founder is a lens of glass with their craft in it.
const PenGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
    <path d="M12 3.5 18.5 13 12 20.5 5.5 13 12 3.5Z" strokeLinejoin="round" />
    <path d="M12 3.5v8.2" />
    <circle cx="12" cy="13.2" r="1.6" />
  </svg>
);
const CodeGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
    <path d="m8.5 7.5-4.5 4.5 4.5 4.5M15.5 7.5l4.5 4.5-4.5 4.5" strokeLinejoin="round" />
    <path d="m13.4 5.5-2.8 13" />
  </svg>
);

/** The two founders as lenses of glass (design, code), side by side. */
export function FounderLenses({ one, two, size }: { one: string; two: string; size?: "sm" | "xs" }) {
  return (
    <span className={cn("founder-avatars", size && `is-${size}`)}>
      <span className="founder-avatar" role="img" aria-label={one}>
        <PenGlyph />
      </span>
      <span className="founder-avatar" role="img" aria-label={two}>
        <CodeGlyph />
      </span>
    </span>
  );
}
