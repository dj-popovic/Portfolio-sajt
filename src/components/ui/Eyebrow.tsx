import { cn } from "@/lib/cn";

type EyebrowProps = {
  a: string;
  b?: string;
  tone?: "dark" | "light";
  className?: string;
};

// Small uppercase label above each section title: dot · part A — part B.
// Part B (with its rule) wraps under part A as one unit on narrow screens.
export function Eyebrow({ a, b, tone = "dark", className }: EyebrowProps) {
  return (
    <span className={cn(tone === "dark" ? "eyebrow" : "eyebrow-light", className)} data-eyebrow>
      <span className="eb-part">
        <span className={cn("ember-dot", tone === "light" && "ember-dot-soft")} aria-hidden />
        <span data-eyebrow-part>{a}</span>
      </span>
      {b ? (
        <span className="eb-part">
          <span className="sep" aria-hidden />
          <span data-eyebrow-part>{b}</span>
        </span>
      ) : null}
    </span>
  );
}
