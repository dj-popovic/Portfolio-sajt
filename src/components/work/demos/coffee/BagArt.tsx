// Coffee bag illustration (drawn in code — a product photo can replace it later)

export type BagTheme = { bag: string; shade: string; label: string; ink: string; accent: string };

export const BAGS: Record<string, BagTheme> = {
  sunday: { bag: "#A9B79B", shade: "#7F8F72", label: "#FBF5EC", ink: "#2B1D14", accent: "#6E7F5F" },
  dusk: { bag: "#5A3846", shade: "#3C2430", label: "#F4EBDD", ink: "#2B1D14", accent: "#8E4A5C" },
  no6: { bag: "#C8862E", shade: "#9C6420", label: "#FBF5EC", ink: "#2B1D14", accent: "#B6552F" },
};

export function BagArt({
  theme,
  name,
  roast,
  className,
}: {
  theme: BagTheme;
  name: string;
  roast: 1 | 2 | 3;
  className?: string;
}) {
  const id = `bag-${name.replace(/\W/g, "")}`;
  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label={`${name} coffee bag`}>
      <defs>
        <linearGradient id={`${id}-sheen`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.28" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {/* body */}
      <path
        d="M34 38 Q34 28 44 27 L156 27 Q166 28 166 38 L174 234 Q174 248 160 248 L40 248 Q26 248 26 234 Z"
        fill={theme.bag}
      />
      <path
        d="M34 38 Q34 28 44 27 L156 27 Q166 28 166 38 L174 234 Q174 248 160 248 L40 248 Q26 248 26 234 Z"
        fill={`url(#${id}-sheen)`}
      />
      {/* crimped top */}
      <rect x="32" y="14" width="136" height="18" rx="3" fill={theme.shade} />
      <path
        d="M36 32 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5"
        fill="none"
        stroke={theme.bag}
        strokeWidth="2"
      />
      {/* valve */}
      <circle cx="100" cy="56" r="7" fill={theme.shade} />
      <circle cx="100" cy="56" r="3" fill={theme.bag} />
      {/* label */}
      <rect x="48" y="86" width="104" height="122" rx="10" fill={theme.label} />
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontSize="8"
        letterSpacing="2.2"
        fill={theme.accent}
        fontFamily="var(--font-inter)"
      >
        [EMBER &amp; OAK]
      </text>
      <text x="100" y="146" textAnchor="middle" fontSize="27" fill={theme.ink} fontFamily="var(--font-dmserif)">
        {name}
      </text>
      <g transform="translate(76 166)">
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={i * 24}
            cy="0"
            r="5"
            fill={i < roast ? theme.accent : "none"}
            stroke={theme.accent}
            strokeWidth="1.5"
          />
        ))}
      </g>
      <text
        x="100"
        y="194"
        textAnchor="middle"
        fontSize="8"
        letterSpacing="1.4"
        fill={theme.ink}
        opacity="0.6"
        fontFamily="var(--font-inter)"
      >
        WHOLE BEAN · 250 G
      </text>
    </svg>
  );
}

export function Bean({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" className={className} aria-hidden>
      <ellipse cx="20" cy="14" rx="18" ry="12" fill="#5B3A26" />
      <path d="M6 16 Q20 4 34 12" fill="none" stroke="#2B1D14" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Rotating circular seal: ROASTED TO ORDER · SMALL BATCH · */
export function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <path id="seal-circle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="#2B1D14" />
      <text fontSize="10.5" letterSpacing="3.4" fill="#F4EBDD" fontFamily="var(--font-inter)" fontWeight="600">
        <textPath href="#seal-circle">ROASTED TO ORDER · SMALL BATCH ·</textPath>
      </text>
      <text x="60" y="68" textAnchor="middle" fontSize="24" fill="#C8862E" fontFamily="var(--font-dmserif)">
        E&amp;O
      </text>
    </svg>
  );
}
