import type { CSSProperties, ReactNode } from "react";

// Flat food illustrations for [Tako] (64×64). Stand-ins until real food photography exists.

export type DishKind = "taco" | "fish" | "bowl" | "verde" | "elote" | "churros" | "horchata" | "jamaica";

const tortilla = (
  <>
    <path d="M7 31a25 25 0 0 0 50 0Z" fill="#F5C064" />
    <path
      d="M11.5 34a20.5 20.5 0 0 0 41 0"
      fill="none"
      stroke="#E2A04A"
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity=".7"
    />
    <circle cx="21" cy="42" r="1.3" fill="#D68B39" />
    <circle cx="33" cy="48" r="1.3" fill="#D68B39" />
    <circle cx="44" cy="41" r="1.3" fill="#D68B39" />
  </>
);

const bowl = (soup: string, toppings: ReactNode) => (
  <>
    <path d="M7 30a25 23 0 0 0 50 0Z" fill="#EBD5B8" />
    <path d="M12 41q20 8 40 0" fill="none" stroke="#E63946" strokeWidth="2.6" strokeLinecap="round" opacity=".85" />
    <ellipse cx="32" cy="30" rx="25" ry="7.5" fill="#F7E9D6" />
    <ellipse cx="32" cy="30.6" rx="21" ry="5.4" fill={soup} />
    {toppings}
  </>
);

const glass = (drink: string, extra: ReactNode) => (
  <>
    <path d="M19 13h26l-3.6 41a4 4 0 0 1-4 3.6H26.6a4 4 0 0 1-4-3.6Z" fill="#FFFDF9" stroke="rgba(36,25,16,.14)" />
    <path d="M20.3 24h23.4l-2.7 30.4a2.8 2.8 0 0 1-2.8 2.6H25.8a2.8 2.8 0 0 1-2.8-2.6Z" fill={drink} />
    <rect x="24" y="26" width="7" height="7" rx="1.6" fill="#fff" opacity=".55" transform="rotate(-12 27.5 29.5)" />
    <rect x="32" y="30" width="6.5" height="6.5" rx="1.6" fill="#fff" opacity=".45" transform="rotate(14 35 33)" />
    <path d="M38 5l-4 27" stroke="#E63946" strokeWidth="3" strokeLinecap="round" />
    <path d="M37.4 9l-.5 3.2M36.7 14.5l-.5 3.2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    {extra}
  </>
);

const ART: Record<DishKind, ReactNode> = {
  taco: (
    <>
      <circle cx="17" cy="30" r="7" fill="#6CBF4B" />
      <circle cx="27" cy="26" r="8" fill="#B8432D" />
      <circle cx="38" cy="26" r="8" fill="#D9632F" />
      <circle cx="48" cy="30" r="7" fill="#6CBF4B" />
      <rect x="28.5" y="16.5" width="7" height="7" rx="1.6" fill="#FFC93C" transform="rotate(18 32 20)" />
      <circle cx="21.5" cy="21.5" r="1.7" fill="#2F8F3A" />
      <circle cx="43.5" cy="20.5" r="1.7" fill="#2F8F3A" />
      {tortilla}
    </>
  ),
  fish: (
    <>
      <circle cx="17" cy="30" r="6.5" fill="#8E5BB5" />
      <circle cx="47" cy="30" r="6.5" fill="#8E5BB5" />
      <path d="M13 27q19-14 38 0q-19 9-38 0Z" fill="#E9A13B" />
      <path d="M17 26.6q15-8.5 30 0" fill="none" stroke="#C97F22" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M17 22l4-2.2 4 2.2 4-2.2 4 2.2 4-2.2 4 2.2 4-2.2"
        fill="none"
        stroke="#FFF7EA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M46 13a8 8 0 0 1 11 9.5Z" fill="#9BD15A" />
      <path d="M48 15.5a5 5 0 0 1 6.6 5.6Z" fill="#D9F2A8" />
      {tortilla}
    </>
  ),
  bowl: bowl(
    "#B23A24",
    <>
      <circle cx="23" cy="29.5" r="2.2" fill="none" stroke="#fff" strokeWidth="1.3" />
      <circle cx="39" cy="31.5" r="2.2" fill="none" stroke="#fff" strokeWidth="1.3" />
      <circle cx="30" cy="28" r="1.5" fill="#3F9B3A" />
      <circle cx="35" cy="29" r="1.3" fill="#3F9B3A" />
      <circle cx="27" cy="32" r="1.2" fill="#3F9B3A" />
      <path d="M48 24a6.5 6.5 0 0 1 9 7Z" fill="#9BD15A" />
    </>,
  ),
  verde: bowl(
    "#86B24E",
    <>
      <circle cx="22" cy="30" r="1.8" fill="#3A2A26" />
      <circle cx="26" cy="32" r="1.8" fill="#3A2A26" />
      <circle cx="24.5" cy="28" r="1.8" fill="#3A2A26" />
      <circle cx="37" cy="28.5" r="1.6" fill="#FFC93C" />
      <circle cx="40" cy="31" r="1.6" fill="#FFC93C" />
      <path d="M29 27.5q4 5 9 1.5" fill="none" stroke="#4E7A2A" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M29 27.5q4 5 9 1.5" fill="none" stroke="#C9E58E" strokeWidth="1.6" strokeLinecap="round" />
    </>,
  ),
  elote: (
    <g transform="rotate(-30 32 32)">
      <rect x="29" y="45" width="6" height="15" rx="2.5" fill="#C98B4E" />
      <ellipse cx="32" cy="28" rx="11" ry="20" fill="#FFC93C" />
      {[13, 18, 23, 28, 33, 38, 43].map((y) =>
        [-6, 0, 6].map((dx) => (
          <circle
            key={`${y}${dx}`}
            cx={32 + dx}
            cy={y}
            r="2"
            fill="#F2A91B"
            opacity={Math.abs(dx) === 6 && (y < 16 || y > 40) ? 0 : 1}
          />
        )),
      )}
      <circle cx="28" cy="20" r="1.2" fill="#E63946" />
      <circle cx="35" cy="27" r="1.2" fill="#E63946" />
      <circle cx="30" cy="35" r="1.2" fill="#E63946" />
      <circle cx="34" cy="17" r="1.4" fill="#fff" />
      <circle cx="29" cy="28" r="1.4" fill="#fff" />
      <circle cx="35" cy="38" r="1.4" fill="#fff" />
      <path d="M21 41q-7 11 4 17q1-9 7-13Z" fill="#8CC152" />
      <path d="M43 41q7 11-4 17q-1-9-7-13Z" fill="#76AD3F" />
    </g>
  ),
  churros: (
    <>
      <rect x="18.5" y="8" width="7" height="34" rx="3.5" fill="#D4893A" transform="rotate(-12 22 25)" />
      <rect x="28.5" y="4" width="7" height="36" rx="3.5" fill="#E6A04A" />
      <rect x="38.5" y="8" width="7" height="33" rx="3.5" fill="#D4893A" transform="rotate(12 42 25)" />
      <path d="M32 8v30M20 13l5 25M44 13l-5 25" stroke="#B8702A" strokeWidth="1" opacity=".6" />
      <circle cx="31" cy="12" r="1" fill="#fff" />
      <circle cx="33" cy="20" r="1" fill="#fff" />
      <circle cx="22" cy="18" r="1" fill="#fff" />
      <circle cx="42" cy="17" r="1" fill="#fff" />
      <path d="M16 33h32l-4.5 25h-23Z" fill="#E63946" />
      <path d="M22 33l2.5 25M32 33v25M42 33l-2.5 25" stroke="#fff" strokeWidth="2.4" opacity=".85" />
      <path d="M15 33h34" stroke="#C72F3C" strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  horchata: glass(
    "#F1DFC6",
    <>
      <circle cx="26" cy="40" r="0.9" fill="#B07A45" />
      <circle cx="33" cy="44" r="0.9" fill="#B07A45" />
      <circle cx="29" cy="49" r="0.9" fill="#B07A45" />
      <circle cx="37" cy="40" r="0.9" fill="#B07A45" />
      <rect x="15" y="9" width="4" height="22" rx="2" fill="#9A5B2E" transform="rotate(-24 17 20)" />
    </>,
  ),
  jamaica: glass(
    "#B0124A",
    <>
      <circle cx="45" cy="15" r="7.5" fill="#9BD15A" />
      <circle cx="45" cy="15" r="5.6" fill="#D9F2A8" />
      <path d="M45 9.4v11.2M39.4 15h11.2M41 11l8 8M49 11l-8 8" stroke="#9BD15A" strokeWidth="1" />
    </>,
  ),
};

export function Dish({ kind, className, style }: { kind: DishKind; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      {ART[kind]}
    </svg>
  );
}
