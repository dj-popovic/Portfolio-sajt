import type { CSSProperties, ReactNode } from "react";
import { BAGS, BagArt, Bean, Seal } from "@/components/work/demos/coffee/BagArt";
import { Dish, type DishKind } from "@/components/work/demos/food/Dish";
import { ConceptMark } from "@/components/work/marks";

// Card previews: small replicas of each concept, drawn at the demo's own size
// (a 960px-wide page for the sites, a 300×640 phone for the apps) and zoomed
// down to the card by ConceptCard (--k). The sites scroll under a fixed bar,
// the phones keep their status bar and switch screens (data-screen), all
// driven by the card. Decorative (the card is aria-hidden inside); copy stays
// English on purpose, like the demos (fictional client brands).

const icon = (d: ReactNode, props: { size?: number; stroke?: number; className?: string } = {}) => (
  <svg
    className={props.className}
    width={props.size ?? 16}
    height={props.size ?? 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.stroke ?? 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

/* ------------------------------------------------------------- Copper & Oak */

const ROASTS = [
  {
    id: "sunday",
    name: "Sunday",
    roast: 1,
    label: "Light",
    price: 19,
    notes: "Rwanda · washed · cocoa, plum, honey",
  },
  {
    id: "dusk",
    name: "Dusk",
    roast: 3,
    label: "Dark",
    price: 21,
    notes: "Ethiopia · natural · berry, cane, cacao nib",
  },
  {
    id: "no6",
    name: "No. 6",
    roast: 2,
    label: "Medium",
    price: 22,
    notes: "Brazil & Colombia · caramel, citrus, almond",
  },
] as const;

export function CoffeePreview() {
  return (
    <div className="pv-web pv-coffee">
      <div className="cf-nav">
        <span className="cf-brand">
          <ConceptMark kind="coffee" size={26} />
          Copper&nbsp;&amp;&nbsp;Oak
        </span>
        <span className="cf-links">
          <span>Shop</span>
          <span>Subscriptions</span>
          <span>Our story</span>
          <span>Journal</span>
        </span>
        <span className="cf-cart">
          {icon(
            <>
              <path d="M6 6h15l-1.5 9h-12L6 6Z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6 5 3H2" />
            </>,
            { size: 15 },
          )}
          Cart ·
          <span className="cf-count">
            <i>2</i>
            <i>3</i>
          </span>
        </span>
      </div>
      <div className="pv-track">
        <div className="cf-hero">
          <div>
            <p className="cf-kicker">Roasted in Novi Sad · since 2016</p>
            <h3>
              Small-batch coffee,
              <br />
              <em>roasted to order.</em>
            </h3>
            <p className="cf-lede">
              Single-origin beans we source ourselves and roast the morning they ship, so what lands on your doorstep
              tastes like it just left the drum.
            </p>
            <div className="cf-ctas">
              <span className="cf-btn">Shop the roast</span>
              <span className="cf-more">
                How we roast
                {icon(<path d="M5 12h14M13 6l6 6-6 6" />, { size: 16, stroke: 2.2 })}
              </span>
            </div>
          </div>
          <div className="cf-figure">
            <span className="cf-disc" />
            <Bean className="cf-bean b1" />
            <Bean className="cf-bean b2" />
            <Bean className="cf-bean b3" />
            <div className="cf-bag">
              <BagArt theme={BAGS.no6} name="No. 6" roast={2} />
            </div>
            <Seal className="cf-seal" />
          </div>
        </div>
        <div className="cf-marquee">
          <div className="cf-marquee-run">
            {Array.from({ length: 2 }).flatMap((_, k) =>
              ["Direct trade", "Roasted to order", "Compostable bags", "Free shipping over $40"].map((s) => (
                <span key={`${k}${s}`}>
                  {s}
                  <i>✦</i>
                </span>
              )),
            )}
          </div>
        </div>
        <div className="cf-shop">
          <div className="cf-shop-head">
            <h4>This week’s roasts</h4>
            <p>Rotating selection: whatever’s tasting best right now.</p>
          </div>
          <div className="cf-grid">
            {ROASTS.map((c) => (
              <div className="cf-card" key={c.id}>
                <div className="cf-card-art">
                  <span className="cf-chip">{c.label} roast</span>
                  <BagArt theme={BAGS[c.id]} name={c.name} roast={c.roast} />
                </div>
                <div className="cf-card-body">
                  <div className="cf-card-top">
                    <span>{c.name}</span>
                    <b>${c.price}</b>
                  </div>
                  <p>{c.notes}</p>
                  <div className="cf-card-row">
                    <span className="cf-size">
                      <i className="on">250 g</i>
                      <i>1 kg</i>
                    </span>
                    <span className="cf-add">Add</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cf-finder">
          <div>
            <p className="cf-finder-kicker">Find your roast</p>
            <h4>Tell us how you brew. We’ll pour the right bag.</h4>
            <p className="cf-finder-q">How do you make it?</p>
            <div className="cf-methods">
              <span className="on">Pour-over / filter</span>
              <span>Espresso</span>
              <span>French press</span>
            </div>
            <span className="cf-range">
              <i />
            </span>
          </div>
          <div className="cf-match">
            <BagArt theme={BAGS.no6} name="No. 6" roast={2} />
            <p className="cf-match-k">Your match</p>
            <p className="cf-match-n">No. 6</p>
          </div>
        </div>
      </div>
      <div className="pv-toast cf-toast">✓ Added No. 6 · 250 g</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Northbound */

// same deterministic series idea as the demo, so the bars never jump around
function series(seed: number, n: number, base: number, swing: number, trend: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: n }, (_, i) => Math.round(base + trend * i + (rnd() - 0.45) * swing));
}
const REVENUE = series(3, 12, 38000, 14000, 2600);
const REV_TOP = 75000;
const spark = (values: number[]) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`)
    .join(" ");
};
const INFLOW = spark(series(4, 14, 40, 30, 2));
const BURN = spark(series(9, 14, 30, 20, -0.6));
const TXS = [
  ["S", "Stripe payout", "Revenue · Today", "+$12,400", true],
  ["A", "AWS", "Cloud · Today", "−$2,180", false],
  ["P", "Payroll, October", "Payroll · Yesterday", "−$9,600", false],
  ["I", "Invoice #2231 · Fieldwork", "Revenue · Oct 20", "+$5,000", true],
  ["F", "Figma", "Software · Oct 19", "−$144", false],
  ["G", "Google Ads", "Marketing · Oct 18", "−$1,250", false],
] as const;

export function FintechPreview() {
  return (
    <div className="pv-web pv-fintech">
      <div className="nw-rail">
        <ConceptMark kind="fintech" size={30} />
        {[
          <path key="o" d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />,
          <path key="f" d="M4 7h10M4 7l3-3M4 7l3 3m13 7H10m10 0-3-3m3 3-3 3" />,
          <path key="c" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 3h18" />,
        ].map((d, i) => (
          <span key={i} className={i === 0 ? "on" : undefined}>
            {icon(d, { size: 19 })}
          </span>
        ))}
        <span className="nw-rail-sync" />
      </div>
      <div className="nw-top">
        <p>Good morning, Ana</p>
        <span className="nw-range">
          <i>30D</i>
          <i>90D</i>
          <i className="on">12M</i>
        </span>
        <span className="nw-bell">
          {icon(<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9m-4.3 13a2 2 0 0 1-3.4 0" />, { size: 16 })}
        </span>
        <span className="nw-avatar">AK</span>
      </div>
      <div className="pv-track">
        <div className="nw-main">
          <div className="nw-left">
            <div className="nw-kpis">
              <div className="nw-panel">
                <p className="nw-label">Total balance</p>
                <p className="nw-big">$248,910</p>
                <p className="nw-delta">
                  <b>▲ 12.4%</b> vs. previous year
                </p>
                <div className="nw-split">
                  <i style={{ flexGrow: 154 }} />
                  <i style={{ flexGrow: 70 }} />
                  <i style={{ flexGrow: 25 }} />
                </div>
                <p className="nw-legend">
                  <span>
                    <i className="m" /> Operating <b>$154.3K</b>
                  </span>
                  <span>
                    <i className="t" /> Treasury <b>$69.7K</b>
                  </span>
                </p>
              </div>
              <div className="nw-panel nw-kpi">
                <p className="nw-label">Inflow · Oct</p>
                <p className="nw-mid up">+$62k</p>
                <p className="nw-sub">▲ 8% vs. Sep</p>
                <svg viewBox="0 0 100 32" preserveAspectRatio="none">
                  <polygon points={`0,32 ${INFLOW} 100,32`} className="area up" />
                  <polyline points={INFLOW} pathLength={1} className="line up" />
                </svg>
              </div>
              <div className="nw-panel nw-kpi">
                <p className="nw-label">Burn · monthly</p>
                <p className="nw-mid">$18k</p>
                <p className="nw-sub">▼ 3% vs. Sep</p>
                <svg viewBox="0 0 100 32" preserveAspectRatio="none">
                  <polygon points={`0,32 ${BURN} 100,32`} className="area down" />
                  <polyline points={BURN} pathLength={1} className="line down" />
                </svg>
              </div>
            </div>
            <div className="nw-panel nw-revenue">
              <div className="nw-rev-head">
                <div>
                  <p className="nw-title">Net revenue</p>
                  <p className="nw-sub">Monthly · last 12 months</p>
                </div>
                <p className="nw-total">$645.8K</p>
              </div>
              <div className="nw-chart">
                <span className="nw-grid g1">
                  <em>$75K</em>
                </span>
                <span className="nw-grid g2">
                  <em>$37.5K</em>
                </span>
                <span className="nw-grid g3">
                  <em>$0</em>
                </span>
                <div className="nw-bars">
                  {REVENUE.map((v, i) => (
                    <i key={i} style={{ "--h": `${(v / REV_TOP) * 100}%`, "--i": i } as CSSProperties} />
                  ))}
                </div>
                <span className="nw-tip">
                  <small>Oct</small>$64,120
                </span>
              </div>
            </div>
            <div className="nw-panel nw-tx">
              <div className="nw-tx-head">
                <p className="nw-title">Transactions</p>
                <span className="nw-filter">
                  <i className="on">All</i>
                  <i>In</i>
                  <i>Out</i>
                </span>
              </div>
              {TXS.map(([l, n, c, a, up]) => (
                <div className="nw-row" key={n}>
                  <span className={up ? "nw-av up" : "nw-av"}>{l}</span>
                  <span className="nw-row-name">
                    {n}
                    <small>{c}</small>
                  </span>
                  <b className={up ? "up" : "down"}>{a}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="nw-right">
            <div className="nw-panel">
              <p className="nw-label">Runway</p>
              <div className="nw-runway">
                <svg viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="46" className="track" />
                  <circle cx="55" cy="55" r="46" pathLength={1} className="fill" />
                </svg>
                <div>
                  <p className="nw-mid">19 mo</p>
                  <p className="nw-sub">at current burn</p>
                  <p className="nw-sub up">+3 mo since July</p>
                </div>
              </div>
            </div>
            <div className="nw-panel">
              <p className="nw-label">Upcoming</p>
              {[
                ["Nov", "1", "Payroll", "$9,600"],
                ["Nov", "2", "AWS", "$2,180"],
                ["Nov", "10", "Quarterly VAT", "$7,240"],
              ].map(([m, d, n, a]) => (
                <div className="nw-up" key={n}>
                  <span className="nw-date">
                    <small>{m}</small>
                    {d}
                  </span>
                  <span className="nw-row-name">
                    {n}
                    <small>
                      {m} {d}
                    </small>
                  </span>
                  <b>{a}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="pv-toast nw-toast">
        <i />
        Stripe payout <b>+$12,400</b>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- phones (shared) */

function PhoneShell({
  className,
  tabs,
  children,
}: {
  className: string;
  /** the app's tab bar, if it has one */
  tabs?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`pv-phone ${className}`} data-screen="0">
      <div className="pv-screen">
        <div className="pv-status">
          <span>9:41</span>
          <i className="pv-island" />
          <span className="pv-signal">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
              <rect x="0" y="7" width="3" height="4" rx="1" />
              <rect x="4.3" y="5" width="3" height="6" rx="1" />
              <rect x="8.6" y="2.5" width="3" height="8.5" rx="1" />
              <rect x="12.9" y="0" width="3" height="11" rx="1" />
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
              <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity=".45" />
              <rect x="2" y="2" width="14" height="7" rx="1.6" fill="currentColor" />
              <rect x="22" y="3.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45" />
            </svg>
          </span>
        </div>
        <div className="pv-screens">{children}</div>
        {tabs}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Stillwater */

const MOODS = [
  ["Calm", "M8 10h1.8M14.2 10H16", "M8.5 14.5q3.5 2.6 7 0"],
  ["Tired", "M7.8 10.5q1.2.9 2.4 0M13.8 10.5q1.2.9 2.4 0", "M9 15h6"],
  ["Restless", "M8.6 10h.8M14.6 10h.8", "M8.5 15q1.75-1.6 3.5 0t3.5 0"],
  ["Wired", "M8.4 9.6h1.2M14.4 9.6h1.2", "M12 16.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"],
] as const;
const SW_TRACKS = [
  ["Deep Sleep", "22 min · sleep story", "linear-gradient(150deg,#8E7DF0,#5A4BD6)"],
  ["Focus Flow", "15 min · ambient", "linear-gradient(150deg,#7FB3FF,#4F7FE6)"],
  ["Calm Mind", "10 min · guided", "linear-gradient(150deg,#C3A8FF,#8E7DF0)"],
] as const;
const SW_TABS = [
  ["Today", <path key="t" d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />],
  [
    "Breathe",
    <g key="b">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </g>,
  ],
  ["Sleep", <path key="s" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />],
  ["Rhythm", <path key="r" d="M5 20v-8m7 8V5m7 15v-6" />],
] as const;

export function WellnessPhone() {
  return (
    <PhoneShell
      className="pv-sw"
      tabs={
        <div className="sw-tabs">
          <i className="sw-tab-pill" />
          {SW_TABS.map(([label, d]) => (
            <span key={label}>
              {icon(d, { size: 20, stroke: 2 })}
              {label}
            </span>
          ))}
        </div>
      }
    >
      <div className="pv-scr sw-home">
        <p className="sw-brand">
          <ConceptMark kind="wellness" size={15} />
          Stillwater
        </p>
        <p className="sw-hello">
          Good evening,
          <span>let’s unwind.</span>
        </p>
        <p className="sw-k">How are you arriving?</p>
        <div className="sw-moods">
          {MOODS.map(([label, eyes, mouth], i) => (
            <span key={label} className={i === 0 ? "on" : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d={eyes} />
                <path d={mouth} />
              </svg>
              {label}
            </span>
          ))}
        </div>
        <div className="sw-now">
          <i className="sw-now-glow" />
          <span className="sw-play">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
            </svg>
          </span>
          <span>
            <small>For right now</small>
            <b>Focus Flow</b>
            <em>Ambient · 15 min</em>
          </span>
        </div>
        <p className="sw-k">Tonight</p>
        {SW_TRACKS.map(([t, s, art]) => (
          <div className="sw-track" key={t}>
            <i style={{ background: art }} />
            <span>
              <b>{t}</b>
              <small>{s}</small>
            </span>
            <em>›</em>
          </div>
        ))}
      </div>
      <div className="pv-scr sw-breathe">
        <p className="sw-sub">In 4 · hold 4 · out 6</p>
        <p className="sw-title">Round 1 of 5</p>
        <div className="sw-ring">
          <svg viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="96" className="track" />
            <circle cx="110" cy="110" r="96" pathLength={1} className="fill" />
          </svg>
          <i className="sw-halo" />
          <i className="sw-orb" />
          <span className="sw-cue">
            <b>Breathe in</b>
          </span>
        </div>
        <span className="sw-btn">Stop</span>
        <p className="sw-note">Haptics follow the ring when your screen is off.</p>
      </div>
      <div className="pv-scr sw-sleep">
        <div className="sw-art">
          <svg viewBox="0 0 260 168">
            <circle cx="196" cy="52" r="24" fill="#FFF6E0" />
            <circle cx="206" cy="46" r="22" fill="#000" opacity=".14" />
            {[
              [40, 30],
              [92, 54],
              [140, 24],
              [60, 82],
              [228, 100],
              [120, 92],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i % 2 ? 1.4 : 2} fill="#fff" className="sw-star" />
            ))}
            <path d="M0 132 Q 40 118 80 130 T 160 128 T 260 126 V168 H0Z" fill="#fff" opacity=".18" />
            <path d="M0 146 Q 50 134 100 146 T 200 144 T 260 142 V168 H0Z" fill="#fff" opacity=".22" />
          </svg>
          <span>Sleep story</span>
        </div>
        <div className="sw-sleep-head">
          <span>
            <b>Deep Sleep</b>
            <small>Narrated by Mira Holt · 22 min</small>
          </span>
          <span className="sw-eq">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <span className="sw-progress">
          <i />
        </span>
        <div className="sw-controls">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
          <span className="sw-pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            </svg>
          </span>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
          </svg>
        </div>
        <p className="sw-k">Sleep timer</p>
        <div className="sw-timer">
          <i>Off</i>
          <i>15m</i>
          <i className="on">30m</i>
          <i>45m</i>
        </div>
      </div>
    </PhoneShell>
  );
}

/** Floating glass chips beside the Stillwater phone. */
export function WellnessChips() {
  return (
    <>
      <div className="cc-chip cc-chip-a">
        <svg viewBox="0 0 24 24" className="cc-chip-ic sw-moon" fill="#FFF6E0">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
        <span>
          <b>12 nights</b>
          <small>in a row, your longest yet</small>
        </span>
      </div>
      <div className="cc-chip cc-chip-b">
        <span className="cc-breath">
          <i />
        </span>
        <span>
          <b>Breathe</b>
          <small>4 · 4 · 6</small>
        </span>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- Tako */

const TK_ITEMS: Array<[string, string, string, DishKind, string, boolean]> = [
  ["Al Pastor", "pineapple · cilantro", "$4.50", "taco", "#FFE1C7", true],
  ["Baja Fish", "slaw · lime crema", "$5.00", "fish", "#FFF0C2", true],
  ["Birria Bowl", "consommé · onion", "$7.50", "bowl", "#FFD9D2", false],
  ["Elote", "cotija · chili · lime", "$3.50", "elote", "#FFF0C2", false],
];
const TK_ROUTE = "M34 132C62 132 64 104 92 98S128 74 150 70S196 52 214 30";

export function FoodPhone() {
  return (
    <PhoneShell className="pv-tk">
      <div className="pv-scr tk-menu">
        <div className="tk-head">
          <span className="tk-loc">
            Deliver to
            <b>Dorćol, BG ▾</b>
          </span>
          <span className="tk-brand">
            <ConceptMark kind="food" size={18} />
            Tako
          </span>
          <span className="tk-bag">
            {icon(
              <>
                <path d="M6 8h12l-1 12H7L6 8Z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </>,
              { size: 18, stroke: 2 },
            )}
            <i>2</i>
          </span>
        </div>
        <span className="tk-search">
          {icon(
            <>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </>,
            { size: 14, stroke: 2.2 },
          )}
          Search tacos, bowls, drinks…
        </span>
        <div className="tk-chips">
          <span className="on">Popular</span>
          <span>Tacos</span>
          <span>Bowls</span>
          <span>Sides</span>
        </div>
        <div className="tk-promo">
          <div className="tk-promo-run">
            <div className="tk-slide a">
              <small>Tonight only</small>
              <b>
                2-for-1
                <br />
                street tacos
              </b>
              <em>Every second taco is on us</em>
              <i />
              <Dish kind="taco" />
            </div>
            <div className="tk-slide b">
              <small>Every night</small>
              <b>
                Free delivery
                <br />
                over $15
              </b>
              <em>No codes, no small print</em>
              <i />
              <Dish kind="jamaica" />
            </div>
          </div>
        </div>
        <p className="tk-k">Popular</p>
        {TK_ITEMS.map(([name, desc, price, dish, tint, deal], i) => (
          <div className="tk-item" key={name}>
            <span className="tk-thumb" style={{ background: tint }}>
              <Dish kind={dish} />
            </span>
            <span className="tk-item-text">
              <b>{name}</b>
              <small>{desc}</small>
              <em>
                {price}
                {deal ? <i>2-for-1</i> : null}
              </em>
            </span>
            <span className={i === 0 ? "tk-step has" : "tk-step"}>
              {i === 0 ? (
                <>
                  <i>−</i>
                  <i>2</i>
                </>
              ) : null}
              <i>+</i>
            </span>
          </div>
        ))}
        <div className="tk-cartbar">
          <span>
            <i>2</i>View cart
          </span>
          <b>$4.50</b>
        </div>
      </div>
      <div className="pv-scr tk-cart">
        <div className="tk-dim" />
        <div className="tk-sheet">
          <i className="tk-grab" />
          <p className="tk-sheet-title">Your order</p>
          <p className="tk-sheet-sub">from Tako Dorćol · about 20 min</p>
          {[
            ["Al Pastor", "taco", "#FFE1C7", "2"],
            ["Elote", "elote", "#FFF0C2", "1"],
          ].map(([n, d, tint, q]) => (
            <div className="tk-line" key={n}>
              <span className="tk-thumb" style={{ background: tint }}>
                <Dish kind={d as DishKind} />
              </span>
              <b>{n}</b>
              <span className="tk-step has">
                <i>−</i>
                <i>{q}</i>
                <i>+</i>
              </span>
            </div>
          ))}
          <span className="tk-free">
            <i />
          </span>
          <p className="tk-free-note">Add $3.00 more for free delivery</p>
          <div className="tk-sum">
            <span>2-for-1 tacos</span>
            <b>−$4.50</b>
          </div>
          <div className="tk-sum total">
            <span>Total</span>
            <b>$9.49</b>
          </div>
          <span className="tk-place">Place order · $9.49</span>
        </div>
      </div>
      <div className="pv-scr tk-track">
        <p className="tk-k">Order #4821</p>
        <p className="tk-eta">Arriving in 12 min</p>
        <div className="tk-map">
          <svg viewBox="0 0 250 160">
            <path d="M0 72C46 62 84 88 132 80S206 52 250 60V76C206 70 178 96 130 96S48 80 0 90Z" fill="#BFE3F5" />
            <rect x="156" y="100" width="70" height="44" rx="12" fill="#CFEAB4" />
            {[
              [12, 12, 52, 36],
              [74, 8, 58, 30],
              [144, 10, 40, 26],
              [194, 40, 46, 14],
              [12, 102, 50, 40],
              [76, 112, 66, 38],
            ].map(([x, y, w, h]) => (
              <rect key={`${x}${y}`} x={x} y={y} width={w} height={h} rx="8" fill="#F5D2AC" />
            ))}
            <path d={TK_ROUTE} fill="none" stroke="rgba(36,25,16,.28)" strokeWidth="4" strokeDasharray="2 7" />
            <path d={TK_ROUTE} pathLength={1} className="tk-route" />
            <circle cx="34" cy="132" r="9" fill="#E63946" />
            <circle cx="214" cy="30" r="9" fill="#241910" />
            <path d="M209.5 31.5 214 27l4.5 4.5v4h-9Z" fill="#fff" />
          </svg>
          <span className="tk-courier" style={{ offsetPath: `path("${TK_ROUTE}")` }}>
            {icon(
              <>
                <circle cx="6" cy="17" r="2.5" />
                <circle cx="18" cy="17" r="2.5" />
                <path d="M8.5 17H14l2.5-6H19M13 7h3l1.5 4" />
              </>,
              { size: 17, stroke: 2 },
            )}
          </span>
        </div>
        {[
          ["Order placed", "Tako Dorćol has it", "done"],
          ["On the plancha", "Tortillas are hitting the heat", "done"],
          ["On the way", "Luka is riding over", "now"],
          ["Delivered", "Buen provecho!", "next"],
        ].map(([t, s, state], i) => (
          <div className={`tk-step-row ${state}`} key={t}>
            <span>{state === "done" ? "✓" : i + 1}</span>
            <p>
              <b>{t}</b>
              <small>{s}</small>
            </p>
          </div>
        ))}
      </div>
      <i className="tk-home" />
    </PhoneShell>
  );
}

/** Floating glass chips beside the Tako phone. */
export function FoodChips() {
  return (
    <>
      <div className="cc-chip cc-chip-a">
        <span className="cc-chip-dish">
          <Dish kind="taco" />
        </span>
        <span>
          <b>2-for-1 tonight</b>
          <small>every second taco</small>
        </span>
      </div>
      <div className="cc-chip cc-chip-b">
        <svg viewBox="0 0 24 24" className="cc-chip-ic tk-scooter" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="17" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <path d="M8.5 17H14l2.5-6H19M13 7h3l1.5 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>
          <b>12 min away</b>
          <small className="cc-trip">
            <i />
          </small>
        </span>
      </div>
    </>
  );
}
