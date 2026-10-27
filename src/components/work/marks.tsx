import type { CSSProperties, ReactNode } from "react";
import type { DemoKey } from "@/components/work/concepts";
import { cn } from "@/lib/cn";

// Icon-only marks for the four concept brands, each in its own brand's
// language. The tile is an HTML box (its gradient needs no SVG ids, so a mark
// can appear any number of times on the page); the glyph is drawn on 32×32.

const MARKS: Record<DemoKey, { tile: string; round?: boolean; glyph: ReactNode }> = {
  // Copper & Oak: a coffee bean with a copper crease, on dark oak in a thin ring
  coffee: {
    tile: "radial-gradient(circle at 34% 28%, #4a3324, #2b1d14 72%)",
    round: true,
    glyph: (
      <>
        <circle cx="16" cy="16" r="12.6" fill="none" stroke="#C8862E" strokeOpacity=".6" strokeWidth=".9" />
        <g transform="rotate(-35 16 16)">
          <ellipse cx="16" cy="16" rx="6.4" ry="9.2" fill="#F4EBDD" />
          <path
            d="M16 7.6c-2.2 2.8-2.2 5.6 0 8.4s2.2 5.6 0 8.4"
            fill="none"
            stroke="#B6552F"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </g>
      </>
    ),
  },
  // Northbound: an N whose last stroke climbs into an arrow (north, and up)
  fintech: {
    tile: "linear-gradient(140deg, #34e1b4, #1fa6c9)",
    glyph: (
      <path
        d="M10 22.6V10l12 12.6V9.6M18.8 12.8 22 9.6l3.2 3.2"
        fill="none"
        stroke="#0B1220"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  // Stillwater: a crescent moon over still water
  wellness: {
    tile: "linear-gradient(160deg, #9a8cf5, #6c5ce7 55%, #4f6fe0)",
    glyph: (
      <>
        <path d="M18.4 6.6a5.8 5.8 0 1 0 3.9 9.4 4.6 4.6 0 0 1-3.9-9.4Z" fill="#FFF6E0" />
        <path d="M8 20.6h16" stroke="#fff" strokeOpacity=".92" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.9 24h10.2" stroke="#fff" strokeOpacity=".6" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13.7 27.3h4.6" stroke="#fff" strokeOpacity=".34" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  // Tako: a street taco, tipped on its side, filling peeking out of the shell
  food: {
    tile: "linear-gradient(140deg, #ff6b35, #e63946)",
    glyph: (
      <g transform="rotate(-16 16 17)">
        <path d="M8.4 16.6a7.6 7.6 0 0 0 15.2 0Z" fill="#7A3B1E" />
        <path
          d="M7.6 16.8q1.35-2.7 2.7 0t2.7 0 2.7 0 2.7 0 2.7 0 2.7 0"
          fill="none"
          stroke="#7CCB57"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5.4 16.6a10.6 10.6 0 0 0 21.2 0h-2.8a7.8 7.8 0 0 1-15.6 0Z" fill="#FFC93C" />
      </g>
    ),
  },
};

export function ConceptMark({
  kind,
  size = 28,
  className,
  style,
}: {
  kind: DemoKey;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const mark = MARKS[kind];
  return (
    <span
      aria-hidden
      className={cn("concept-mark", className)}
      style={{
        width: size,
        height: size,
        borderRadius: mark.round ? "50%" : Math.round(size * 0.3),
        background: mark.tile,
        ...style,
      }}
    >
      <svg viewBox="0 0 32 32" width={size} height={size}>
        {mark.glyph}
      </svg>
    </span>
  );
}
