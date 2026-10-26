"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ConceptMark } from "@/components/work/marks";

/* [Northwind] — cash-flow dashboard concept. Copy stays English on purpose (fictional client). */

const THEME = {
  "--bg": "#0B1220",
  "--panel": "#121C30",
  "--panel2": "#18243D",
  "--line": "rgba(230,237,247,.08)",
  "--text": "#E6EDF7",
  "--muted": "#7E91B0",
  "--mint": "#34E1B4",
  "--teal": "#1FA6C9",
  "--blue": "#3D7BF2",
  "--red": "#FF7A8A",
  "--amber": "#FFC857",
  // the money-flow categories, stepped into one lightness band and checked for
  // colour-blind separation against the panel (income · spending · taxes · savings)
  "--f-in": "#1E9E78",
  "--f-out": "#3B7BE6",
  "--f-tax": "#C9559B",
  "--f-save": "#C2871F",
  fontFamily: "var(--font-spacegrotesk), system-ui, sans-serif",
} as CSSProperties;

const EASE = [0.25, 1, 0.5, 1] as const;

type Tab = "overview" | "flows" | "cards";
type Range = "30d" | "90d" | "12m";

// deterministic pseudo-random series, so the numbers stay put between renders
function series(seed: number, n: number, base: number, swing: number, trend: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: n }, (_, i) => Math.round(base + trend * i + (rnd() - 0.45) * swing));
}

const RANGES: Record<Range, { caption: string; labels: string[]; values: number[]; delta: number }> = {
  "30d": {
    caption: "Daily · last 30 days",
    labels: Array.from({ length: 30 }, (_, i) => `Oct ${i + 1}`),
    values: series(7, 30, 1800, 1600, 30),
    delta: 4.1,
  },
  "90d": {
    caption: "Weekly · last quarter",
    labels: Array.from({ length: 13 }, (_, i) => `Week ${i + 1}`),
    values: series(21, 13, 11000, 6000, 420),
    delta: 9.8,
  },
  "12m": {
    caption: "Monthly · last 12 months",
    labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    values: series(3, 12, 38000, 14000, 2600),
    delta: 12.4,
  },
};

const BALANCE = 248910;
const ACCOUNTS = [
  { name: "Operating", amount: 154320, color: "var(--mint)" },
  { name: "Treasury", amount: 69700, color: "var(--teal)" },
  { name: "Tax reserve", amount: 24890, color: "var(--blue)" },
];
const INFLOW_SPARK = series(4, 14, 40, 30, 2);
const BURN_SPARK = series(9, 14, 30, 20, -0.6);

const TX = [
  { id: 1, name: "Stripe payout", cat: "Revenue", amount: 12400, date: "Today" },
  { id: 2, name: "AWS", cat: "Cloud", amount: -2180, date: "Today" },
  { id: 3, name: "Payroll, October", cat: "Payroll", amount: -9600, date: "Yesterday" },
  { id: 4, name: "Invoice #2231 · [Client]", cat: "Revenue", amount: 5000, date: "Oct 20" },
  { id: 5, name: "Figma", cat: "Software", amount: -144, date: "Oct 19" },
  { id: 6, name: "Google Ads", cat: "Marketing", amount: -1250, date: "Oct 18" },
  { id: 7, name: "Interest", cat: "Treasury", amount: 412, date: "Oct 17" },
  { id: 8, name: "Office rent", cat: "Operations", amount: -3200, date: "Oct 15" },
];

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
const compactFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});
const compact = (n: number) => compactFmt.format(n);
const niceMax = (v: number) => {
  const p = 10 ** Math.floor(Math.log10(v));
  return (Math.ceil((v / p) * 2) / 2) * p;
};

export default function FintechDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [range, setRange] = useState<Range>("12m");

  const go = (next: Tab) => {
    setTab(next);
    root.current?.closest(".ww-body")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={root} style={THEME} className="@container/app flex min-h-full bg-(--bg) text-(--text)">
      <Sidebar tab={tab} setTab={go} />
      <div className="@container/main min-w-0 flex-1">
        <TopBar tab={tab} setTab={go} range={range} setRange={setRange} />
        <div className="p-[clamp(14px,2.4vw,28px)] pb-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: EASE }}
            >
              {tab === "overview" ? <Overview range={range} /> : tab === "flows" ? <Flows /> : <Cards />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const NAV: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  { id: "overview", label: "Overview", icon: <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" /> },
  { id: "flows", label: "Flows", icon: <path d="M4 7h10M4 7l3-3M4 7l3 3m13 7H10m10 0-3-3m3 3-3 3" /> },
  {
    id: "cards",
    label: "Cards",
    icon: <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 3h18" />,
  },
];

function Brand() {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-bold tracking-[-0.01em]">
      <ConceptMark kind="fintech" size={24} />
      [Northwind]
    </span>
  );
}

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <aside className="sticky top-0 hidden h-[calc(min(88vh,880px)-60px)] w-[224px] shrink-0 flex-col self-start border-r border-(--line) p-4 @4xl/app:flex">
      <div className="mb-9 px-2 pt-1">
        <Brand />
      </div>
      <p className="mb-2 px-3 text-[10.5px] tracking-[0.14em] text-(--muted) uppercase">Workspace</p>
      <nav className="flex flex-col gap-1" aria-label="Dashboard">
        {NAV.map((n) => {
          const on = tab === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setTab(n.id)}
              aria-current={on ? "page" : undefined}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-(--muted) transition-colors hover:text-(--text)"
            >
              {on ? (
                <motion.span
                  layoutId="fin-nav"
                  className="absolute inset-0 rounded-xl bg-(--panel2) shadow-[inset_0_0_0_1px_var(--line)]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null}
              <svg
                className={`relative size-[18px] ${on ? "text-(--mint)" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {n.icon}
              </svg>
              <span className={`relative ${on ? "text-(--text)" : ""}`}>{n.label}</span>
            </button>
          );
        })}
        {["Invoices", "Payroll", "Settings"].map((l) => (
          <span key={l} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] text-(--muted)" aria-hidden>
            <span className="size-[18px] rounded-md border border-(--line)" />
            {l}
            <span className="ml-auto rounded-md bg-(--panel2) px-1.5 py-0.5 text-[9.5px] tracking-[0.08em] uppercase">
              Soon
            </span>
          </span>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-(--line) bg-(--panel) p-3.5">
        <p className="text-[10.5px] tracking-[0.14em] text-(--muted) uppercase">Company</p>
        <p className="mt-1 text-[13.5px] font-semibold">[Company] Ltd.</p>
        <p className="mt-2 flex items-center gap-2 text-[12px] text-(--mint)">
          <span className="size-1.5 rounded-full bg-(--mint) shadow-[0_0_8px_var(--mint)]" />
          Synced 2 min ago
        </p>
      </div>
    </aside>
  );
}

function TopBar({
  tab,
  setTab,
  range,
  setRange,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  range: Range;
  setRange: (r: Range) => void;
}) {
  return (
    <div className="sticky top-0 z-20 border-b border-(--line) bg-(--bg)/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-[clamp(14px,2.4vw,28px)] py-3.5">
        <div className="mr-auto min-w-0">
          <div className="mb-1 @4xl/app:hidden">
            <Brand />
          </div>
          <h2 className="text-[19px] font-bold tracking-[-0.02em]">
            {tab === "overview" ? "Good morning, Ana" : tab === "flows" ? "Money flows" : "Cards"}
          </h2>
        </div>
        {tab === "overview" ? (
          <div
            className="flex rounded-full bg-(--panel) p-1 text-[12px] font-semibold"
            role="radiogroup"
            aria-label="Chart range"
          >
            {(["30d", "90d", "12m"] as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={range === r}
                onClick={() => setRange(r)}
                className="relative rounded-full px-3 py-1.5 uppercase"
              >
                {range === r ? (
                  <motion.span
                    layoutId="fin-range"
                    className="absolute inset-0 rounded-full bg-(--panel2) shadow-[inset_0_0_0_1px_var(--line)]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                ) : null}
                <span className={`relative ${range === r ? "text-(--mint)" : "text-(--muted)"}`}>{r}</span>
              </button>
            ))}
          </div>
        ) : null}
        <span
          className="relative hidden size-9 place-items-center rounded-full border border-(--line) text-(--muted) @lg/main:grid"
          aria-hidden
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9m-4.3 13a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="absolute top-2 right-2 size-2 rounded-full bg-(--mint)" />
        </span>
        <span
          className="hidden size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#2A3A5C,#1C2B49)] text-[12px] font-bold @lg/main:grid"
          aria-hidden
        >
          AK
        </span>
      </div>
      {/* the sidebar's job on narrow windows */}
      <div className="flex gap-1 px-[clamp(14px,2.4vw,28px)] pb-3 @4xl/app:hidden">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setTab(n.id)}
            aria-current={tab === n.id ? "page" : undefined}
            className={`flex-1 rounded-full py-2 text-[12.5px] font-semibold transition-colors ${tab === n.id ? "bg-(--panel2) text-(--text) shadow-[inset_0_0_0_1px_var(--line)]" : "text-(--muted)"}`}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-(--line) bg-(--panel) ${className}`}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-[11px] tracking-[0.12em] text-(--muted) uppercase">{children}</p>;
}

/** Counts up once, then follows new values. Renders a motion value, so no re-render per frame. */
function Count({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => money(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: EASE });
    return () => controls.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

function Spark({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const line = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 32"
      className="mt-auto h-14 w-full overflow-visible pt-4"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon points={`0,32 ${line} 100,32`} fill={color} opacity="0.12" />
      <motion.polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
      />
    </svg>
  );
}

function Overview({ range }: { range: Range }) {
  const data = RANGES[range];
  return (
    <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_290px]">
      <div className="grid min-w-0 gap-4">
        <div className="grid gap-4 @xl/main:grid-cols-[1.5fr_1fr_1fr]">
          <Panel className="p-5">
            <Label>Total balance</Label>
            <p className="mt-2 text-[clamp(26px,3.2vw,34px)] font-bold tracking-[-0.03em]">
              <Count value={BALANCE} />
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
              <span className="rounded-full bg-(--mint)/12 px-2 py-0.5 font-semibold text-(--mint)">
                ▲ {data.delta}%
              </span>
              <span className="text-(--muted)">vs. previous {range === "12m" ? "year" : "period"}</span>
            </div>
            <div className="mt-4 flex h-2 gap-1 overflow-hidden rounded-full">
              {ACCOUNTS.map((a, i) => (
                <motion.i
                  key={a.name}
                  className="block h-full rounded-full"
                  style={{ background: a.color }}
                  initial={{ flexGrow: 0.0001 }}
                  animate={{ flexGrow: a.amount }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.08 }}
                />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-(--muted)">
              {ACCOUNTS.map((a) => (
                <li key={a.name} className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: a.color }} />
                  {a.name} <b className="font-semibold text-(--text)">{compact(a.amount)}</b>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="flex flex-col p-5">
            <Label>Inflow · Oct</Label>
            <p className="mt-2 text-[24px] font-bold text-(--mint)">+$62k</p>
            <p className="mt-0.5 text-[12px] text-(--muted)">▲ 8% vs. Sep</p>
            <Spark values={INFLOW_SPARK} color="var(--mint)" />
          </Panel>
          <Panel className="flex flex-col p-5">
            <Label>Burn · monthly</Label>
            <p className="mt-2 text-[24px] font-bold">$18k</p>
            <p className="mt-0.5 text-[12px] text-(--muted)">▼ 3% vs. Sep</p>
            <Spark values={BURN_SPARK} color="var(--red)" />
          </Panel>
        </div>
        <RevenueChart range={range} />
        <Transactions />
      </div>
      <div className="grid content-start gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-1">
        <Panel className="p-5">
          <Label>Runway</Label>
          <RunwayGauge months={19} />
        </Panel>
        <Panel className="p-5">
          <Label>Upcoming</Label>
          <ul className="mt-3 grid gap-3.5 text-[13px]">
            {[
              ["Payroll", "Nov 1", "$9,600"],
              ["AWS", "Nov 2", "$2,180"],
              ["Quarterly VAT", "Nov 10", "$7,240"],
            ].map(([n, d, a]) => (
              <li key={n} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-content-center rounded-lg bg-(--panel2) text-center leading-none">
                    <span className="text-[9px] tracking-[0.1em] text-(--muted) uppercase">{d.split(" ")[0]}</span>
                    <span className="mt-0.5 text-[13px] font-bold">{d.split(" ")[1]}</span>
                  </span>
                  <span>
                    {n}
                    <span className="block text-[11.5px] text-(--muted)">{d}</span>
                  </span>
                </span>
                <span className="font-semibold tabular-nums">{a}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function RevenueChart({ range }: { range: Range }) {
  const data = RANGES[range];
  const [hover, setHover] = useState<number | null>(null);
  const top = niceMax(Math.max(...data.values));
  const total = data.values.reduce((s, v) => s + v, 0);
  const n = data.values.length;

  return (
    <Panel className="p-5">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[13.5px] font-semibold">Net revenue</p>
          <p className="mt-0.5 text-[12px] text-(--muted)">{data.caption}</p>
        </div>
        <p className="text-[20px] font-bold tracking-[-0.02em]">{compact(total)}</p>
      </div>
      <div className="relative h-[190px] pl-10">
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute right-0 left-10 border-t border-(--line)" style={{ bottom: `${f * 100}%` }}>
            <span className="absolute -top-2 -left-10 w-8 text-right text-[10.5px] text-(--muted) tabular-nums">
              {f === 0 ? "$0" : compact(top * f)}
            </span>
          </div>
        ))}
        <div className="relative flex h-full items-end gap-[3px]" onPointerLeave={() => setHover(null)}>
          {data.values.map((v, i) => {
            const pct = (v / top) * 100;
            const align = i < 2 ? "left-0" : i > n - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
            return (
              <div
                key={`${range}-${i}`}
                className="relative flex h-full flex-1 items-end"
                onPointerEnter={() => setHover(i)}
              >
                <motion.i
                  className="mx-auto block w-full max-w-6 rounded-t-[4px] bg-[linear-gradient(180deg,var(--mint),var(--blue))]"
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%`, opacity: hover === null || hover === i ? 1 : 0.35 }}
                  transition={{ height: { duration: 0.7, delay: i * 0.015, ease: EASE }, opacity: { duration: 0.15 } }}
                />
                <AnimatePresence>
                  {hover === i ? (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14 }}
                      className={`pointer-events-none absolute z-10 rounded-lg bg-(--text) px-2.5 py-1.5 text-[11.5px] leading-tight font-semibold whitespace-nowrap text-(--bg) ${align}`}
                      style={{ bottom: `calc(${pct}% + 8px)` }}
                    >
                      <span className="block text-[10.5px] font-medium opacity-60">{data.labels[i]}</span>
                      {money(v)}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-10 text-[11px] text-(--muted)">
        <span>{data.labels[0]}</span>
        <span>{data.labels[n - 1]}</span>
      </div>
    </Panel>
  );
}

function RunwayGauge({ months }: { months: number }) {
  const pct = Math.min(1, months / 24);
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="mt-3 flex items-center gap-4">
      <svg viewBox="0 0 110 110" className="size-[104px] shrink-0 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="fin-gauge" x1="0" x2="1">
            <stop offset="0" stopColor="#34E1B4" />
            <stop offset="1" stopColor="#1FA6C9" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--panel2)" strokeWidth="10" />
        <motion.circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="url(#fin-gauge)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <div>
        <p className="text-[28px] font-bold tracking-[-0.02em]">{months} mo</p>
        <p className="text-[12px] text-(--muted)">at current burn</p>
        <p className="mt-2 text-[12px] text-(--mint)">+3 mo since July</p>
      </div>
    </div>
  );
}

function Transactions() {
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TX.filter((t) => (filter === "all" ? true : filter === "in" ? t.amount > 0 : t.amount < 0)).filter((t) =>
      `${t.name} ${t.cat}`.toLowerCase().includes(needle),
    );
  }, [filter, q]);

  return (
    <Panel className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className="mr-auto text-[13.5px] font-semibold">Transactions</p>
        <div className="flex rounded-full bg-(--panel2) p-1 text-[12px] font-semibold">
          {(
            [
              ["all", "All"],
              ["in", "In"],
              ["out", "Out"],
            ] as const
          ).map(([id, l]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`rounded-full px-3 py-1.5 transition-colors ${filter === id ? "bg-(--bg) text-(--text)" : "text-(--muted) hover:text-(--text)"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">Search transactions</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--muted)"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-[150px] rounded-full border border-(--line) bg-(--panel2) py-1.5 pr-3 pl-8 text-[12.5px] text-(--text) transition-colors placeholder:text-(--muted) focus:border-(--mint)/50 focus:outline-none"
          />
        </label>
      </div>
      <ul>
        <AnimatePresence initial={false}>
          {rows.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-(--line) py-3 text-[13px]">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold ${t.amount > 0 ? "bg-(--mint)/12 text-(--mint)" : "bg-(--panel2) text-(--muted)"}`}
                >
                  {t.name[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{t.name}</span>
                  <span className="text-[11.5px] text-(--muted)">
                    {t.cat} · {t.date}
                  </span>
                </span>
                <span className={`font-bold tabular-nums ${t.amount > 0 ? "text-(--mint)" : "text-(--red)"}`}>
                  {t.amount > 0 ? "+" : ""}
                  {money(t.amount)}
                </span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {rows.length === 0 ? <p className="py-6 text-center text-[13px] text-(--muted)">Nothing matches “{q}”.</p> : null}
    </Panel>
  );
}

/* ---------- Flows: a small sankey with money moving through it ---------- */

type FlowNode = { id: string; label: string; amount: number; color: string };

const SOURCES: FlowNode[] = [
  { id: "stripe", label: "Stripe", amount: 41200, color: "var(--f-in)" },
  { id: "invoices", label: "Invoices", amount: 18300, color: "var(--f-in)" },
  { id: "interest", label: "Interest", amount: 2500, color: "var(--f-in)" },
];
const SINKS: FlowNode[] = [
  { id: "payroll", label: "Payroll", amount: 28800, color: "var(--f-out)" },
  { id: "cloud", label: "Cloud", amount: 6540, color: "var(--f-out)" },
  { id: "marketing", label: "Marketing", amount: 5100, color: "var(--f-out)" },
  { id: "taxes", label: "Taxes", amount: 9200, color: "var(--f-tax)" },
  { id: "savings", label: "Savings", amount: 12360, color: "var(--f-save)" },
];
const FLOW_TOTAL = SOURCES.reduce((s, n) => s + n.amount, 0);
const SPENT = SINKS.filter((s) => s.id !== "savings").reduce((s, n) => s + n.amount, 0);
const HUB = { top: 70, h: 180, mid: 160 };

// stack a column of nodes around the hub's middle, and their bands inside the hub
function column(nodes: FlowNode[], gap: number) {
  const k = HUB.h / FLOW_TOTAL;
  let y = HUB.mid - (HUB.h + gap * (nodes.length - 1)) / 2;
  let hubY = HUB.top;
  return nodes.map((n) => {
    const h = n.amount * k;
    const placed = { ...n, y, h, hubY };
    y += h + gap;
    hubY += h;
    return placed;
  });
}
const LEFT = column(SOURCES, 34);
const RIGHT = column(SINKS, 26);
type Placed = (typeof LEFT)[number];

// where things sit across: the inflow nodes end at xl, the hub runs hub0–hub1, the outflow nodes start at xr
type Geo = { w: number; xl: number; hub0: number; hub1: number; xr: number; labels: boolean };
const WIDE: Geo = { w: 680, xl: 124, hub0: 300, hub1: 340, xr: 516, labels: true };
const SLIM: Geo = { w: 330, xl: 14, hub0: 150, hub1: 180, xr: 316, labels: false };

const ribbon = (xa: number, ya: number, xb: number, yb: number, h: number) => {
  const xm = (xa + xb) / 2;
  return `M${xa} ${ya}C${xm} ${ya} ${xm} ${yb} ${xb} ${yb}L${xb} ${yb + h}C${xm} ${yb + h} ${xm} ${ya + h} ${xa} ${ya + h}Z`;
};
const spine = (xa: number, ya: number, xb: number, yb: number) => {
  const xm = (xa + xb) / 2;
  return `M${xa} ${ya}C${xm} ${ya} ${xm} ${yb} ${xb} ${yb}`;
};

function Sankey({ geo, focus, setFocus }: { geo: Geo; focus: string | null; setFocus: (id: string | null) => void }) {
  const stream = (n: Placed, area: string, line: string) => (
    <g
      key={n.id}
      onPointerEnter={() => setFocus(n.id)}
      onPointerLeave={() => setFocus(null)}
      style={{ opacity: focus && focus !== n.id ? 0.25 : 1, transition: "opacity .2s" }}
    >
      <path
        d={area}
        fill={n.color}
        fillOpacity={focus === n.id ? 0.6 : 0.34}
        style={{ transition: "fill-opacity .2s" }}
      />
      <path
        d={line}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.75"
        strokeWidth={Math.min(3, Math.max(1.6, n.h * 0.3))}
        className="fin-particles"
      />
    </g>
  );
  const mid = (geo.hub0 + geo.hub1) / 2;
  return (
    <svg
      viewBox={`0 0 ${geo.w} 320`}
      className="h-auto w-full"
      role="img"
      aria-label="Money flowing from income sources through the operating account into spending, taxes and savings"
    >
      {LEFT.map((n) =>
        stream(n, ribbon(geo.xl, n.y, geo.hub0, n.hubY, n.h), spine(geo.xl, n.y + n.h / 2, geo.hub0, n.hubY + n.h / 2)),
      )}
      {RIGHT.map((n) =>
        stream(n, ribbon(geo.hub1, n.hubY, geo.xr, n.y, n.h), spine(geo.hub1, n.hubY + n.h / 2, geo.xr, n.y + n.h / 2)),
      )}
      <rect
        x={geo.hub0}
        y={HUB.top - 6}
        width={geo.hub1 - geo.hub0}
        height={HUB.h + 12}
        rx="10"
        fill="var(--panel2)"
        stroke="var(--line)"
      />
      <text x={mid} y={HUB.top + HUB.h + 28} textAnchor="middle" fontSize="11.5" fill="var(--muted)">
        Operating
      </text>
      {LEFT.map((n) => (
        <g key={n.id}>
          <rect x={geo.xl - 8} y={n.y} width="8" height={Math.max(2, n.h)} rx="2" fill={n.color} />
          {geo.labels ? (
            <text x={geo.xl - 18} y={n.y + n.h / 2 + 4} textAnchor="end" fontSize="12.5" fill="var(--text)">
              {n.label} <tspan fill="var(--muted)">{compact(n.amount)}</tspan>
            </text>
          ) : null}
        </g>
      ))}
      {RIGHT.map((n) => (
        <g key={n.id}>
          <rect x={geo.xr} y={n.y} width="8" height={Math.max(2, n.h)} rx="2" fill={n.color} />
          {geo.labels ? (
            <text x={geo.xr + 18} y={n.y + n.h / 2 + 4} fontSize="12.5" fill="var(--text)">
              {n.label} <tspan fill="var(--muted)">{compact(n.amount)}</tspan>
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/** Narrow panels: the chart drops its labels and this list carries them (and doubles as the table). */
function FlowLegend({ focus, setFocus }: { focus: string | null; setFocus: (id: string | null) => void }) {
  const list = (title: string, nodes: FlowNode[]) => (
    <div>
      <p className="mb-1.5 text-[10.5px] tracking-[0.12em] text-(--muted) uppercase">{title}</p>
      <ul className="grid gap-1">
        {nodes.map((n) => (
          <li
            key={n.id}
            onPointerEnter={() => setFocus(n.id)}
            onPointerLeave={() => setFocus(null)}
            className={`flex items-center gap-2 rounded-lg px-1.5 py-1 text-[12.5px] transition-colors ${focus === n.id ? "bg-(--panel2)" : ""}`}
          >
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: n.color }} />
            <span className="flex-1">{n.label}</span>
            <span className="text-(--muted) tabular-nums">{compact(n.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="mt-3 grid grid-cols-2 gap-4">
      {list("In", SOURCES)}
      {list("Out", SINKS)}
    </div>
  );
}

function Flows() {
  const [focus, setFocus] = useState<string | null>(null);
  const [rules, setRules] = useState({ taxes: true, alert: true, sweep: false });
  const focused = [...LEFT, ...RIGHT].find((n) => n.id === focus);

  return (
    <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_300px]">
      <Panel className="@container/flow min-w-0 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[13.5px] font-semibold">Where October’s money went</p>
            <p className="mt-0.5 h-4 text-[12px] text-(--muted)">
              {focused
                ? `${focused.label} · ${money(focused.amount)} · ${Math.round((focused.amount / FLOW_TOTAL) * 100)}% of inflow`
                : "Hover a stream to trace it"}
            </p>
          </div>
          <div className="flex gap-2 text-[12px]">
            {[
              ["In", compact(FLOW_TOTAL)],
              ["Out", compact(SPENT)],
              ["Saved", compact(FLOW_TOTAL - SPENT)],
            ].map(([k, v]) => (
              <span key={k} className="rounded-xl bg-(--panel2) px-3 py-1.5">
                <span className="text-(--muted)">{k} </span>
                <b className="font-semibold text-(--text)">{v}</b>
              </span>
            ))}
          </div>
        </div>
        <div className="hidden @min-[30rem]/flow:block">
          <Sankey geo={WIDE} focus={focus} setFocus={setFocus} />
        </div>
        <div className="@min-[30rem]/flow:hidden">
          <Sankey geo={SLIM} focus={focus} setFocus={setFocus} />
          <FlowLegend focus={focus} setFocus={setFocus} />
        </div>
      </Panel>
      <Panel className="p-5">
        <p className="mb-1 text-[13.5px] font-semibold">Automations</p>
        <p className="mb-2 text-[12px] text-(--muted)">Rules that run on every payout.</p>
        {(
          [
            ["taxes", "Set aside 18% of every payout for taxes"],
            ["alert", "Ping #finance when burn passes $25k"],
            ["sweep", "Sweep idle cash over $150k into treasury"],
          ] as const
        ).map(([id, label]) => (
          <div
            key={id}
            className="flex items-center justify-between gap-4 border-b border-(--line) py-3.5 text-[13px] last:border-0"
          >
            <span id={`fin-rule-${id}`} className={`transition-colors ${rules[id] ? "" : "text-(--muted)"}`}>
              {label}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={rules[id]}
              aria-labelledby={`fin-rule-${id}`}
              onClick={() => setRules((r) => ({ ...r, [id]: !r[id] }))}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${rules[id] ? "justify-end bg-(--mint)" : "justify-start bg-(--panel2)"}`}
            >
              <motion.span
                layout
                className="size-4 rounded-full bg-white shadow"
                transition={{ type: "spring", stiffness: 700, damping: 36 }}
              />
            </button>
          </div>
        ))}
      </Panel>
    </div>
  );
}

/* ---------- Cards: a virtual card you can tilt, flip and freeze ---------- */

function Cards() {
  const [flipped, setFlipped] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [limit, setLimit] = useState(10000);
  const spent = 4200;
  const card = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20 });
  const glareX = useTransform(sry, [-12, 12], [15, 85]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% 15%, rgba(255,255,255,.28), transparent 55%)`;

  const onMove = (e: React.PointerEvent) => {
    const r = card.current?.getBoundingClientRect();
    if (!r || e.pointerType !== "mouse") return;
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 22);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };
  const pct = Math.min(1, spent / limit);
  const ring = 2 * Math.PI * 50;
  const frost = frozen ? "grayscale-[.85] brightness-90" : "";

  return (
    <div className="grid gap-4 @3xl/main:grid-cols-[1.1fr_.9fr]">
      <Panel className="grid place-items-center gap-7 overflow-hidden px-5 py-9 [perspective:1100px]">
        <motion.div
          ref={card}
          onPointerMove={onMove}
          onPointerLeave={reset}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setFlipped((f) => !f);
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label="Virtual card: flip to see details"
          style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
          className="relative aspect-[1.586] w-full max-w-[370px] cursor-pointer rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mint)"
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ transformStyle: "preserve-3d" }}
            className="absolute inset-0"
          >
            <div
              className={`absolute inset-0 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#123C4A,#0E2236_55%,#1B1240)] p-6 transition-[filter] duration-500 ${frost} shadow-[0_40px_60px_-30px_rgba(0,0,0,.8),inset_0_0_0_1px_rgba(255,255,255,.08)] [backface-visibility:hidden]`}
            >
              <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />
              <div className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-(--mint)/15 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-2 text-[14px] font-bold">
                  <ConceptMark kind="fintech" size={20} />
                  [Northwind]
                </span>
                <span className="text-[10.5px] tracking-[0.16em] text-(--muted) uppercase">Virtual</span>
              </div>
              <div className="relative mt-7 h-9 w-12 rounded-md bg-[linear-gradient(135deg,#E7C76D,#B8913C)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.15)]" />
              <p className="relative mt-5 font-mono text-[clamp(13px,4vw,17px)] tracking-[0.18em]">
                •••• •••• •••• 4821
              </p>
              <div className="relative mt-3 flex justify-between text-[11px] text-(--muted)">
                <span>ANA KOVAČ</span>
                <span>Tap to flip</span>
              </div>
            </div>
            <div
              className={`absolute inset-0 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#0E2236,#123C4A)] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] transition-[filter] duration-500 [transform:rotateY(180deg)] [backface-visibility:hidden] ${frost}`}
            >
              <div className="-mx-6 mt-1 h-10 bg-black/55" />
              <p className="mt-5 font-mono text-[clamp(12px,3.8vw,16px)] tracking-[0.16em]">4921 7730 1186 4821</p>
              <div className="mt-4 flex gap-8 text-[12px]">
                <span>
                  <span className="block text-[10.5px] tracking-[0.12em] text-(--muted) uppercase">Expires</span>
                  09/29
                </span>
                <span>
                  <span className="block text-[10.5px] tracking-[0.12em] text-(--muted) uppercase">CVC</span>
                  •••
                </span>
              </div>
              <p className="mt-4 text-[11px] text-(--muted)">Concept data, not a real card.</p>
            </div>
          </motion.div>
          <AnimatePresence>
            {frozen ? (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-x-0 -top-4 z-10 mx-auto w-max rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-(--bg) shadow-lg"
              >
                ❄ Frozen
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="rounded-full border border-(--line) bg-(--panel2) px-4 py-2 text-[13px] font-semibold transition-colors hover:border-(--mint)/40"
          >
            {flipped ? "Hide details" : "Show details"}
          </button>
          <button
            type="button"
            onClick={() => setFrozen((f) => !f)}
            aria-pressed={frozen}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${frozen ? "bg-(--amber) text-(--bg)" : "border border-(--line) bg-(--panel2) hover:border-(--mint)/40"}`}
          >
            {frozen ? "Unfreeze" : "Freeze card"}
          </button>
        </div>
      </Panel>
      <Panel className="p-6">
        <p className="text-[13.5px] font-semibold">Monthly limit</p>
        <div className="mt-5 flex items-center gap-5">
          <svg viewBox="0 0 120 120" className="size-[116px] shrink-0 -rotate-90" aria-hidden>
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--panel2)" strokeWidth="12" />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={ring}
              initial={{ strokeDashoffset: ring }}
              animate={{ strokeDashoffset: ring * (1 - pct), stroke: pct > 0.8 ? "#FF7A8A" : "#34E1B4" }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </svg>
          <div>
            <p className="text-[24px] font-bold tabular-nums">{money(spent)}</p>
            <p className="text-[12.5px] text-(--muted)">of {money(limit)} this month</p>
            <p className={`mt-2 text-[12px] font-semibold ${pct > 0.8 ? "text-(--red)" : "text-(--mint)"}`}>
              {pct > 0.8 ? "Close to the limit" : `${money(limit - spent)} left`}
            </p>
          </div>
        </div>
        <label className="mt-7 flex justify-between text-[12px] text-(--muted)" htmlFor="fin-limit">
          Adjust limit <span className="text-(--text) tabular-nums">{money(limit)}</span>
        </label>
        <input
          id="fin-limit"
          type="range"
          min={5000}
          max={25000}
          step={500}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="fin-range mt-3 w-full"
          style={{ "--p": `${((limit - 5000) / 20000) * 100}%` } as CSSProperties}
        />
        <p className="mt-7 mb-1 text-[11px] tracking-[0.12em] text-(--muted) uppercase">On this card</p>
        <ul className="grid text-[13px]">
          {[
            ["Figma", "Software", "−$144"],
            ["Linear", "Software", "−$96"],
            ["Uber", "Travel", "−$38"],
          ].map(([n, c, a]) => (
            <li key={n} className="flex items-center justify-between border-b border-(--line) py-3 last:border-0">
              <span>
                {n}
                <span className="block text-[11.5px] text-(--muted)">{c}</span>
              </span>
              <span className="font-semibold tabular-nums">{a}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
