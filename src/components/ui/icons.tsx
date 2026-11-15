import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

// Sizes are even on purpose: the buttons they sit in are even (44, 38, 36), and an odd icon
// centred in an even box lands on a half pixel, which on a 1x screen draws it soft and a
// touch off centre (the profile's close button did).

function base({ size = 22, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export const SparkIcon = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M12 2c.45 5.2 2.35 7.1 7.5 7.5-5.15.4-7.05 2.3-7.5 7.5-.45-5.2-2.35-7.1-7.5-7.5C9.65 9.1 11.55 7.2 12 2z" />
  </svg>
);

export const BrowserIcon = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M3 9h18M6.2 6.5h.01M8.6 6.5h.01" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <rect x="7" y="3" width="10" height="18" rx="2.6" />
    <path d="M11 18h2" />
  </svg>
);

export const TrendIcon = (p: IconProps) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M3 16.5l5.5-5.5 4 4L21 6.5" />
    <path d="M21 11.5v-5h-5" />
  </svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base({ size: 13, ...p })} strokeWidth={2.4}>
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base({ size: 12, ...p })} strokeWidth={3}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base({ size: 12, ...p })} strokeWidth={2.6}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const BackIcon = (p: IconProps) => (
  <svg {...base({ size: 16, ...p })} strokeWidth={2.2}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base({ size: 16, ...p })} strokeWidth={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const BurgerIcon = (p: IconProps) => (
  <svg {...base({ size: 16, ...p })} strokeWidth={2}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);

export const ImageIcon = (p: IconProps) => (
  <svg {...base({ size: 22, ...p })} strokeWidth={1.5}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m21 16-5.2-5.2a1.5 1.5 0 0 0-2.1 0L5 19.5" />
  </svg>
);

export const GlobeIcon = (p: IconProps) => (
  <svg {...base({ size: 15, ...p })} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base({ size: 12, ...p })} strokeWidth={2.4}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base({ size: 16, ...p })} strokeWidth={1.8}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const CopyIcon = (p: IconProps) => (
  <svg {...base({ size: 16, ...p })} strokeWidth={1.8}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 8.5V6A2.5 2.5 0 0 0 13 3.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
  </svg>
);

// The three networks in the footer, drawn in the house icon style (one line weight, round
// ends) rather than as the brands' own filled marks, so they sit with the other icons.
export const InstagramIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p })} strokeWidth={1.8}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <path d="M17.1 6.9h.01" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p })} strokeWidth={1.8}>
    <path d="M4 4h4.3L20 20h-4.3z" />
    <path d="M4 20l6.8-6.8M13.2 10.8 20 4" />
  </svg>
);

export const LinkedInIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p })} strokeWidth={1.8}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M8 11v5.5M8 7.8h.01M12 16.5V11M12 13.6a2.2 2.2 0 0 1 4.4 0v2.9" />
  </svg>
);
