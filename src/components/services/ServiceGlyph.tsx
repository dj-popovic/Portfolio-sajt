import { Fragment } from "react";

export type ServiceKey = "branding" | "websites" | "apps" | "marketing";

// The service icons again (ui/icons), as single paths so they can draw
// themselves in (rects written out, pathLength works the same everywhere),
// each with a viewBox that centres its shape.
const GLYPHS: Record<ServiceKey, { box: string; d: string }> = {
  branding: {
    box: "2 -0.5 20 20",
    d: "M12 2c.45 5.2 2.35 7.1 7.5 7.5-5.15.4-7.05 2.3-7.5 7.5-.45-5.2-2.35-7.1-7.5-7.5C9.65 9.1 11.55 7.2 12 2z",
  },
  websites: {
    box: "0 0 24 24",
    d: "M5.5 4h13a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4zM3 9h18M6.2 6.5h.01M8.6 6.5h.01",
  },
  apps: {
    box: "0 0 24 24",
    d: "M9.6 3h4.8A2.6 2.6 0 0 1 17 5.6v12.8a2.6 2.6 0 0 1-2.6 2.6H9.6A2.6 2.6 0 0 1 7 18.4V5.6A2.6 2.6 0 0 1 9.6 3zM11 18h2",
  },
  marketing: {
    box: "0 -0.5 24 24",
    d: "M3 16.5l5.5-5.5 4 4L21 6.5M21 11.5v-5h-5",
  },
};

// the dot grid, in the symbol's own units (its box is 20–24 across): fine where the symbol
// is big, coarse on phones, where it's under 100px and fine dots would be a pixel each
const GRIDS = { fine: { pitch: 0.7, r: 0.17 }, coarse: { pitch: 1.05, r: 0.3 } } as const;

/**
 * A service's symbol drawn in lime dots, the orb's stipple again: a thick
 * line seen through a fixed grid of dots (the mask), with a soft blue glow of
 * the same line behind it (colours: .svc-glyph in sections.css). `--draw`
 * (1 → 0) draws it in along its path. Only the line moves; the mask never
 * changes (Safari doesn't repaint a mask whose contents animate). The line
 * is there twice, once per dot grid; CSS shows the one that suits the size.
 */
export function ServiceGlyph({ kind }: { kind: ServiceKey }) {
  const { box, d } = GLYPHS[kind];
  const id = `svc-glyph-${kind}`;
  const [x, y, w, h] = box.split(" ").map(Number);
  return (
    <svg className="svc-glyph" viewBox={box} aria-hidden>
      <defs>
        {(["fine", "coarse"] as const).map((grid) => (
          <Fragment key={grid}>
            <pattern
              id={`${id}-dots-${grid}`}
              width={GRIDS[grid].pitch}
              height={GRIDS[grid].pitch}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={GRIDS[grid].pitch / 2} cy={GRIDS[grid].pitch / 2} r={GRIDS[grid].r} fill="white" />
            </pattern>
            <mask id={`${id}-mask-${grid}`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
              <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-dots-${grid})`} />
            </mask>
          </Fragment>
        ))}
        <linearGradient id={`${id}-tint`} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={x + w} y2={y + h}>
          <stop offset="0" className="svc-tint-a" />
          <stop offset="0.45" className="svc-tint-b" />
          <stop offset="1" className="svc-tint-c" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <path
        className="svc-glyph-line svc-glyph-glow"
        d={d}
        pathLength={1}
        strokeWidth="1.8"
        filter={`url(#${id}-blur)`}
      />
      {(["fine", "coarse"] as const).map((grid) => (
        <path
          key={grid}
          className={`svc-glyph-line svc-glyph-${grid}`}
          d={d}
          pathLength={1}
          stroke={`url(#${id}-tint)`}
          strokeWidth="2.6"
          mask={`url(#${id}-mask-${grid})`}
        />
      ))}
    </svg>
  );
}
