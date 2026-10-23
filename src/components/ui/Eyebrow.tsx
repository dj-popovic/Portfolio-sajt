import DecryptedText from "@/components/reactbits/DecryptedText";
import { cn } from "@/lib/cn";

type EyebrowProps = {
  a: string;
  b?: string;
  tone?: "dark" | "light";
  className?: string;
  /** leave undefined to decrypt when scrolled into view; pass a boolean to start it from a timeline */
  play?: boolean;
};

function Part({ text, play }: { text: string; play?: boolean }) {
  return (
    <DecryptedText
      text={text}
      data-eyebrow-part
      animateOn={play === undefined ? "view" : "manual"}
      play={play}
      sequential
      revealDirection="start"
      useOriginalCharsOnly
      speed={38}
      maxIterations={8}
    />
  );
}

// Small uppercase label above each section title: dot · part A — part B.
// Part B (with its rule) wraps under part A as one unit on narrow screens.
export function Eyebrow({ a, b, tone = "dark", className, play }: EyebrowProps) {
  return (
    <span className={cn(tone === "dark" ? "eyebrow" : "eyebrow-light", className)} data-eyebrow>
      <span className="eb-part">
        <span className={cn("ember-dot", tone === "light" && "ember-dot-soft")} aria-hidden />
        <Part text={a} play={play} />
      </span>
      {b ? (
        <span className="eb-part">
          <span className="sep" aria-hidden />
          <Part text={b} play={play} />
        </span>
      ) : null}
    </span>
  );
}
