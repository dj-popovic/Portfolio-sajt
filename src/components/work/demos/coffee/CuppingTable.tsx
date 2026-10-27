// The story block's picture, drawn in code like the bags: a cupping table seen
// from above (bowls of fresh coffee, spoons, a tasting sheet, loose beans on oak).

const BEANS: Array<[number, number, number]> = [
  [44, 300, 20],
  [70, 318, -35],
  [96, 296, 60],
  [62, 46, -20],
  [402, 44, 35],
  [384, 318, -60],
  [416, 300, 10],
  [598, 330, 45],
];

function Cup({ x, y, crust, spoon }: { x: number; y: number; crust: "full" | "broken" | "clear"; spoon?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="7" cy="11" rx="41" ry="39" fill="#4A2E1B" opacity=".26" />
      <circle r="38" fill="#FBF5EC" />
      <circle r="37" fill="none" stroke="#E4D6C2" strokeWidth="2" />
      <circle r="31" fill="#E9DDCB" />
      <circle r="28" fill="#3A2214" />
      {crust === "full" ? <circle r="27" fill="url(#cupping-crust)" /> : null}
      {crust === "broken" ? (
        <>
          <circle r="24" fill="none" stroke="url(#cupping-crust)" strokeWidth="7" />
          <ellipse cx="-8" cy="-9" rx="9" ry="4.5" fill="#fff" opacity=".1" transform="rotate(-32)" />
        </>
      ) : null}
      {crust === "clear" ? (
        <ellipse cx="-9" cy="-10" rx="10" ry="5" fill="#fff" opacity=".13" transform="rotate(-32)" />
      ) : null}
      {spoon !== undefined ? (
        <g transform={`rotate(${spoon})`}>
          <rect x="6" y="-3.2" width="74" height="6.4" rx="3.2" fill="#D3CBBF" />
          <rect x="6" y="-3.2" width="74" height="2.4" rx="1.2" fill="#fff" opacity=".45" />
          <ellipse cx="0" cy="0" rx="13" ry="11" fill="#DDD6CB" stroke="#B4AA9C" strokeWidth="1.5" />
          <ellipse cx="0" cy="0" rx="8.5" ry="7" fill="#3A2214" opacity=".55" />
        </g>
      ) : null}
    </g>
  );
}

export function CuppingTable({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="A cupping table: bowls of fresh coffee, spoons and a tasting sheet"
    >
      <defs>
        <pattern id="cupping-crust" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#6F4426" />
          <circle cx="2" cy="2" r="1.6" fill="#9A6A40" />
          <circle cx="5.5" cy="5" r="1.2" fill="#835530" />
          <circle cx="5.6" cy="1.4" r=".7" fill="#B38253" />
        </pattern>
        <linearGradient id="cupping-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#2B1D14" stopOpacity=".18" />
        </linearGradient>
      </defs>

      {/* oak planks */}
      <rect width="640" height="360" fill="#B98455" />
      {[18, 58, 96, 142, 178, 216, 262, 300, 338].map((y, i) => (
        <path
          key={y}
          d={`M-20 ${y}C140 ${y - 9} 300 ${y + 10} 460 ${y - 3}S620 ${y + 7} 680 ${y}`}
          fill="none"
          stroke={i % 3 === 1 ? "#CF9E6C" : "#9F6C42"}
          strokeOpacity={i % 3 === 1 ? 0.45 : 0.35}
          strokeWidth={i % 2 ? 1.2 : 2}
        />
      ))}
      <path d="M0 120h640M0 240h640" stroke="#7A4F30" strokeOpacity=".5" strokeWidth="2.2" />
      <path d="M0 123h640M0 243h640" stroke="#D7A877" strokeOpacity=".35" strokeWidth="1.2" />

      {/* the tasting sheet and its pencil */}
      <g transform="translate(468 52) rotate(7)">
        <rect x="4" y="7" width="140" height="196" rx="6" fill="#4A2E1B" opacity=".22" />
        <rect width="140" height="196" rx="6" fill="#FBF5EC" />
        <text x="16" y="32" fontSize="15" fill="#2B1D14" fontFamily="var(--font-dmserif)">
          Cupping · Lot 14
        </text>
        <path d="M16 42h76" stroke="#B6552F" strokeWidth="1.6" />
        {[62, 82, 102, 122, 142, 162].map((ly, i) => (
          <g key={ly}>
            <path d={`M16 ${ly}h${44 + ((i * 17) % 30)}`} stroke="#CDBFA9" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx={112 + ((i * 7) % 12)} cy={ly - 1} r="5" fill="none" stroke="#B6552F" strokeWidth="1.4" />
          </g>
        ))}
        <path
          d="M18 180c8-6 14 4 22-2s12 4 20-1"
          fill="none"
          stroke="#2B1D14"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity=".7"
        />
      </g>
      <g transform="translate(438 318) rotate(-24)">
        <rect x="3" y="5" width="128" height="10" rx="3" fill="#4A2E1B" opacity=".25" />
        <rect width="122" height="10" rx="2.5" fill="#E2B856" />
        <rect width="122" height="3" rx="1.5" fill="#fff" opacity=".35" />
        <rect width="12" height="10" rx="2.5" fill="#C9786A" />
        <path d="M122 0l15 5-15 5z" fill="#F1D9B5" />
        <path d="M132.5 3.5l4.5 1.5-4.5 1.5z" fill="#2B1D14" />
      </g>

      {/* the bowls */}
      <Cup x={92} y={160} crust="full" />
      <Cup x={196} y={94} crust="broken" spoon={-24} />
      <Cup x={318} y={128} crust="full" />
      <Cup x={170} y={266} crust="clear" />
      <Cup x={294} y={252} crust="broken" />

      {/* a rinse glass */}
      <g transform="translate(410 190)">
        <ellipse cx="5" cy="8" rx="24" ry="22" fill="#4A2E1B" opacity=".2" />
        <circle r="22" fill="#E6F0EE" opacity=".85" />
        <circle r="22" fill="none" stroke="#fff" strokeWidth="2.5" opacity=".9" />
        <circle r="15" fill="#D4E6E4" />
        <path d="M-10-8a14 14 0 0 1 12-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* loose beans */}
      {BEANS.map(([bx, by, rot]) => (
        <g key={`${bx}-${by}`} transform={`translate(${bx} ${by}) rotate(${rot})`}>
          <ellipse rx="9.5" ry="6.6" fill="#5B3A26" />
          <path d="M-7.4 1.2Q0-5 7.4-1" fill="none" stroke="#2B1D14" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}

      {/* window light across the table */}
      <rect width="640" height="360" fill="url(#cupping-light)" />
    </svg>
  );
}
