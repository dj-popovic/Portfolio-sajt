"use client";

import { useId, type SVGProps } from "react";
import { LOGO } from "@/components/brand/logo-geometry";
import { cn } from "@/lib/cn";

export type LogoVariant = "dark" | "light" | "mono";

type Size = {
  /** height in px, or any CSS length ("0.8em" sits it in a line of text) */
  size?: number | string;
};

const { width: W, height: H, letters, wedge, dot, ring, wedgeTop } = LOGO;
const height = (size: number | string) => (typeof size === "number" ? `${size}px` : size);

/**
 * The klin wordmark: k, l and n in Unbounded 700 (outlined, so it never waits for the
 * font), the i a wedge with its dot. Colours come from where it sits (sections.css):
 * dark on the page, light on the paper sheets and under a light theme, or pinned with
 * `variant`. `interactive` adds the dot's glow for a link's hover (the nav's).
 */
export function Logo({
  variant,
  size = 22,
  interactive = false,
  className,
  style,
  ...rest
}: Omit<SVGProps<SVGSVGElement>, "children" | "role"> &
  Size & {
    /** dark: white letters, a lime i. light: deep blue, the dot lime with a deep-blue
     *  outline. mono: all currentColor. Left out: whichever suits where it sits. */
    variant?: LogoVariant;
    interactive?: boolean;
  }) {
  const glow = `klin-glow-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="klin"
      data-variant={variant}
      className={cn("logo", className)}
      style={{ height: height(size), aspectRatio: `${W} / ${H}`, ...style }}
      {...rest}
    >
      {interactive ? (
        <>
          <defs>
            <radialGradient id={glow}>
              <stop offset="0" className="logo-glow-stop" stopOpacity="0.55" />
              <stop offset="1" className="logo-glow-stop" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle className="logo-glow" cx={dot.cx} cy={dot.cy} r={dot.r * 2.6} fill={`url(#${glow})`} />
        </>
      ) : null}
      <path className="logo-ink" d={letters} />
      <path className="logo-wedge" d={wedge} />
      <circle className="logo-dot" cx={dot.cx} cy={dot.cy} r={dot.r} />
      <circle className="logo-ring" cx={dot.cx} cy={dot.cy} r={dot.r - ring / 2} strokeWidth={ring} />
    </svg>
  );
}

/** The mark: the wedge i on its own (decorative; the app icon draws it on its tile). */
export function Mark({ size = 24, className, style, ...rest }: Omit<SVGProps<SVGSVGElement>, "children"> & Size) {
  return (
    <svg
      viewBox={`${dot.cx - wedgeTop / 2} 0 ${wedgeTop} ${H}`}
      aria-hidden
      className={cn("logo logo-i", className)}
      style={{ height: height(size), aspectRatio: `${wedgeTop} / ${H}`, ...style }}
      {...rest}
    >
      <path className="logo-wedge" d={wedge} />
      <circle className="logo-dot" cx={dot.cx} cy={dot.cy} r={dot.r} />
    </svg>
  );
}
