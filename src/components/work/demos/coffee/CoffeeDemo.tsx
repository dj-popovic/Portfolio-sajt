"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BAGS, Bean, BagArt, Seal } from "./BagArt";
import { PLACEHOLDER } from "@/lib/placeholders";

/* [Ember & Oak] — a self-contained concept storefront. Content stays in
   English on purpose (fictional client brand). */

type Coffee = {
  id: "sunday" | "dusk" | "no6";
  name: string;
  roast: 1 | 2 | 3;
  roastLabel: string;
  origin: string;
  notes: string[];
  price: { small: number; large: number };
  method: Array<"filter" | "espresso" | "press">;
  body: number; // 0 bright … 100 chocolatey
};

const COFFEES: Coffee[] = [
  {
    id: "sunday",
    name: "Sunday",
    roast: 1,
    roastLabel: "Light",
    origin: "[Origin] · washed",
    notes: ["cocoa", "plum", "honey"],
    price: { small: 19, large: 62 },
    method: ["filter"],
    body: 20,
  },
  {
    id: "dusk",
    name: "Dusk",
    roast: 3,
    roastLabel: "Dark",
    origin: "[Origin] · natural",
    notes: ["berry", "cane", "cacao nib"],
    price: { small: 21, large: 68 },
    method: ["espresso", "press"],
    body: 85,
  },
  {
    id: "no6",
    name: "No. 6",
    roast: 2,
    roastLabel: "Medium",
    origin: "[Origin] blend",
    notes: ["caramel", "citrus", "almond"],
    price: { small: 22, large: 72 },
    method: ["filter", "espresso", "press"],
    body: 55,
  },
];

const THEME = {
  "--cream": "#F4EBDD",
  "--paper": "#FBF5EC",
  "--ink": "#2B1D14",
  "--clay": "#B6552F",
  "--clay-ink": "#9A4423", // clay for small text: AA on cream
  "--gold": "#C8862E",
  "--muted": "#6E5A47",
} as CSSProperties;

const serif = "font-[family-name:var(--font-dmserif)] font-normal";

type CartLine = { id: Coffee["id"]; size: "small" | "large"; qty: number };

export default function CoffeeDemo() {
  const [cart, setCart] = useState<CartLine[]>([{ id: "no6", size: "small", qty: 2 }]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef(0);
  const shopRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);

  const count = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((sum, l) => {
    const c = COFFEES.find((x) => x.id === l.id)!;
    return sum + c.price[l.size] * l.qty;
  }, 0);

  function add(id: Coffee["id"], size: CartLine["size"]) {
    setCart((lines) => {
      const hit = lines.find((l) => l.id === id && l.size === size);
      if (hit) return lines.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l));
      return [...lines, { id, size, qty: 1 }];
    });
    setBump((b) => b + 1);
    const c = COFFEES.find((x) => x.id === id)!;
    setToast(`Added ${c.name} · ${size === "small" ? "250 g" : "1 kg"}`);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }

  function changeQty(line: CartLine, delta: number) {
    setCart((lines) =>
      lines.flatMap((l) => (l === line ? (l.qty + delta <= 0 ? [] : [{ ...l, qty: l.qty + delta }]) : [l])),
    );
  }

  const goTo = (ref: React.RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={THEME} className="relative min-h-full bg-(--cream) font-sans text-(--ink) [line-height:1.55]">
      {/* nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-(--ink)/8 bg-(--cream)/86 px-[clamp(20px,4vw,46px)] py-4 backdrop-blur-md">
        <span className={`${serif} flex items-center gap-2.5 text-[21px] tracking-[0.01em]`}>
          <span className="grid size-[26px] place-items-center rounded-full bg-(--ink) text-[11px] text-(--cream)">
            E
          </span>
          [Ember&nbsp;&amp;&nbsp;Oak]
          <span className="font-mono text-[10px] text-(--muted)">{PLACEHOLDER.logo}</span>
        </span>
        <span className="hidden gap-[26px] text-[13.5px] font-medium text-(--muted) md:flex">
          {["Shop", "Subscriptions", "Our story", "Journal"].map((l) => (
            <a
              key={l}
              className="relative cursor-pointer transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-(--clay) after:transition-transform after:duration-200 after:ease-out hover:text-(--ink) hover:after:scale-x-100"
              onClick={() => goTo(l === "Our story" ? processRef : shopRef)}
            >
              {l}
            </a>
          ))}
        </span>
        <div className="relative">
          <motion.button
            key={bump}
            type="button"
            onClick={() => setCartOpen((o) => !o)}
            initial={bump ? { scale: 1.12 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="inline-flex items-center gap-2 rounded-full border border-(--ink)/12 bg-(--paper) px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-white"
            aria-expanded={cartOpen}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M6 6h15l-1.5 9h-12L6 6Z" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M6 6 5 3H2" />
            </svg>
            Cart · {count}
          </motion.button>
          <AnimatePresence>
            {cartOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                className="absolute top-[calc(100%+10px)] right-0 w-[300px] origin-top-right rounded-2xl border border-(--ink)/10 bg-(--paper) p-4 shadow-[0_30px_60px_-24px_rgba(60,24,8,.45)]"
              >
                <p className={`${serif} mb-3 text-[20px]`}>Your cart</p>
                {cart.length === 0 ? (
                  <p className="py-4 text-[13px] text-(--muted)">Empty for now — the roasts are below.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {cart.map((l) => {
                      const c = COFFEES.find((x) => x.id === l.id)!;
                      return (
                        <li key={`${l.id}-${l.size}`} className="flex items-center gap-3">
                          <BagArt theme={BAGS[c.id]} name={c.name} roast={c.roast} className="h-12 w-10 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-semibold">{c.name}</p>
                            <p className="text-[11.5px] text-(--muted)">{l.size === "small" ? "250 g" : "1 kg"}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px]">
                            <button
                              type="button"
                              onClick={() => changeQty(l, -1)}
                              className="grid size-6 place-items-center rounded-full border border-(--ink)/15"
                              aria-label="Fewer"
                            >
                              −
                            </button>
                            <span className="w-4 text-center tabular-nums">{l.qty}</span>
                            <button
                              type="button"
                              onClick={() => changeQty(l, 1)}
                              className="grid size-6 place-items-center rounded-full border border-(--ink)/15"
                              aria-label="More"
                            >
                              +
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-(--ink)/10 pt-3 text-[13.5px]">
                  <span className="text-(--muted)">Subtotal</span>
                  <span className="font-semibold tabular-nums">${subtotal}</span>
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-full bg-(--ink) py-2.5 text-[13.5px] font-semibold text-(--cream) transition-colors hover:bg-(--clay)"
                >
                  Checkout
                </button>
                <p className="mt-2 text-center text-[11px] text-(--muted)">Concept demo — no real checkout.</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </nav>

      {/* hero */}
      <header className="grid items-center gap-[clamp(24px,4vw,56px)] px-[clamp(20px,4vw,46px)] pt-[clamp(38px,5vw,68px)] pb-[clamp(30px,4vw,52px)] md:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="mb-[18px] text-[12px] font-semibold tracking-[0.2em] text-(--clay-ink) uppercase">
            Roasted in [city] · since [year]
          </p>
          <h1 className={`${serif} mb-5 text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.02] tracking-[-0.01em]`}>
            Small-batch coffee,
            <br />
            <em className="text-(--clay) italic">roasted to order.</em>
          </h1>
          <p className="mb-7 max-w-[42ch] text-[clamp(.98rem,1.2vw,1.12rem)] text-pretty text-(--muted)">
            Single-origin beans we source ourselves and roast the morning they ship — so what lands on your doorstep
            tastes like it just left the drum.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => goTo(shopRef)}
              className="rounded-full bg-(--ink) px-[26px] py-3.5 text-[15px] font-semibold text-(--cream) transition-[transform,background,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-(--clay) hover:shadow-[0_14px_30px_-12px_rgba(182,85,47,.6)] active:scale-[0.98]"
            >
              Shop the roast
            </button>
            <button
              type="button"
              onClick={() => goTo(processRef)}
              className="group inline-flex items-center gap-2 text-[14.5px] font-semibold"
            >
              How we roast
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <figure className="relative mx-auto aspect-[1/1] w-full max-w-[460px]">
          <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#FBF5EC,#E9D6BC_70%)]" />
          <Bean className="coffee-float absolute top-[10%] left-[8%] w-10 rotate-[-20deg] [animation-delay:-1s]" />
          <Bean className="coffee-float absolute right-[10%] bottom-[16%] w-12 rotate-[30deg] [animation-delay:-2.4s]" />
          <Bean className="coffee-float absolute bottom-[8%] left-[18%] w-8 rotate-[60deg] [animation-delay:-3.2s]" />
          <svg
            className="absolute top-[4%] left-1/2 w-[70px] -translate-x-1/2 opacity-60"
            viewBox="0 0 70 60"
            aria-hidden
          >
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                className="coffee-steam"
                style={{ animationDelay: `${i * 0.7}s` }}
                d={`M${18 + i * 16} 58 C${10 + i * 16} 44 ${30 + i * 16} 36 ${20 + i * 16} 20 S${26 + i * 16} 6 ${20 + i * 16} 2`}
                fill="none"
                stroke="#B6552F"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="coffee-float absolute inset-x-[22%] top-[16%] bottom-[8%]">
            <BagArt
              theme={BAGS.no6}
              name="No. 6"
              roast={2}
              className="h-full w-full rotate-[-6deg] drop-shadow-[0_36px_40px_rgba(60,24,8,.35)]"
            />
          </div>
          <Seal className="coffee-spin absolute top-[6%] right-[2%] w-[26%]" />
        </figure>
      </header>

      {/* marquee */}
      <div className="overflow-hidden border-y border-(--ink)/10 bg-(--ink) text-(--cream)">
        <div className="coffee-marquee flex w-max gap-10 py-3.5 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Direct trade", "Roasted to order", "Compostable bags", "Free shipping over [$X]"].map((s) => (
              <span key={`${k}-${s}`} className={`${serif} inline-flex items-center gap-10 text-[16px]`}>
                {s}
                <span className="text-[12px] text-(--gold)">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      {/* shop */}
      <section ref={shopRef} className="scroll-mt-20 px-[clamp(20px,4vw,46px)] py-[clamp(40px,5vw,68px)]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${serif} text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05]`}>This week’s roasts</h2>
          <p className="max-w-[34ch] text-[14px] text-(--muted)">
            Rotating selection — whatever’s tasting best right now.
          </p>
        </div>
        <div className="grid gap-[22px] md:grid-cols-3">
          {COFFEES.map((c) => (
            <ProductCard key={c.id} coffee={c} onAdd={add} />
          ))}
        </div>
      </section>

      <RoastFinder onAdd={add} />

      {/* story */}
      <section
        ref={processRef}
        className="grid scroll-mt-20 items-center gap-[clamp(24px,4vw,56px)] border-y border-(--ink)/8 bg-(--paper) px-[clamp(20px,4vw,46px)] py-[clamp(30px,4vw,56px)] md:grid-cols-2"
      >
        {/* TODO(photos): founders / cupping table — see docs/OPEN-ITEMS.md */}
        <figure className="grid h-[clamp(240px,28vw,330px)] place-items-center rounded-xl bg-[repeating-linear-gradient(45deg,#E7D8C4_0_11px,#F0E4D5_11px_22px)] font-mono text-[11px] tracking-[0.04em] text-[#9A7B5E]">
          [photo — founders / cupping table]
        </figure>
        <div>
          <h2 className={`${serif} mb-4 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.06]`}>
            We only sell what we’d brew at home.
          </h2>
          <p className="mb-3.5 max-w-[46ch] text-[15px] text-(--muted)">
            [Ember &amp; Oak] started as two people, one drum roaster and a stubborn idea: coffee should reach you
            fresh, not after a month on a shelf.
          </p>
          <ol className="mt-5 grid gap-3 text-[14px]">
            {[
              ["Cup", "Every lot is cupped and logged before it earns a name."],
              ["Roast", "Small batches, never more than we can ship that week."],
              ["Ship", "Bagged warm, out the door within 48 hours."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className={`${serif} text-[22px] leading-none text-(--clay)`}>0{i + 1}</span>
                <span>
                  <b className="font-semibold">{t}.</b> <span className="text-(--muted)">{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex gap-[34px]">
            {[
              ["[14]", "Origins"],
              ["[48h]", "Roast to door"],
              ["[100%]", "Compostable"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className={`${serif} text-[30px] text-(--clay)`}>{n}</div>
                <div className="text-[12px] tracking-[0.04em] text-(--muted)">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SubscriptionBuilder />

      <CoffeeFooter />

      {/* toast */}
      <div className="pointer-events-none sticky bottom-4 z-30 flex justify-center">
        <AnimatePresence>
          {toast ? (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-full bg-(--ink) px-5 py-2.5 text-[13px] font-medium text-(--cream) shadow-[0_18px_40px_-16px_rgba(0,0,0,.6)]"
              role="status"
            >
              ✓ {toast}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProductCard({ coffee, onAdd }: { coffee: Coffee; onAdd: (id: Coffee["id"], size: CartLine["size"]) => void }) {
  const [size, setSize] = useState<CartLine["size"]>("small");
  return (
    <article className="group overflow-hidden rounded-[18px] border border-(--ink)/8 bg-(--paper) transition-[transform,box-shadow] duration-300 [transition-timing-function:cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2 hover:shadow-[0_34px_50px_-28px_rgba(60,24,8,.4)]">
      <div className="relative grid h-[210px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_60%,#F4E6D2,#EADBC5)]">
        <BagArt
          theme={BAGS[coffee.id]}
          name={coffee.name}
          roast={coffee.roast}
          className="h-[180px] transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-2 group-hover:rotate-[-4deg]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-(--paper) px-2.5 py-1 text-[11px] font-semibold text-(--muted)">
          {coffee.roastLabel} roast
        </span>
      </div>
      <div className="px-[18px] pt-4 pb-5">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className={`${serif} text-[22px]`}>{coffee.name}</span>
          <span className="text-[15px] font-semibold text-(--clay-ink) tabular-nums">${coffee.price[size]}</span>
        </div>
        <p className="mt-1.5 text-[13px] text-(--muted)">
          {coffee.origin} · notes of {coffee.notes.join(", ")}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div
            className="relative grid grid-cols-2 rounded-full bg-(--ink)/6 p-1 text-[12px] font-semibold"
            role="radiogroup"
            aria-label="Bag size"
          >
            {(["small", "large"] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                onClick={() => setSize(s)}
                className="relative z-[1] rounded-full px-3 py-1.5 transition-colors"
              >
                {size === s ? (
                  <motion.span
                    layoutId={`size-${coffee.id}`}
                    className="absolute inset-0 -z-[1] rounded-full bg-(--paper) shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                ) : null}
                {s === "small" ? "250 g" : "1 kg"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onAdd(coffee.id, size)}
            className="rounded-full bg-(--ink) px-4 py-2 text-[13px] font-semibold text-(--cream) transition-[background,transform] hover:bg-(--clay) active:scale-[0.96]"
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

const METHODS = [
  { id: "filter", label: "Pour-over / filter" },
  { id: "espresso", label: "Espresso" },
  { id: "press", label: "French press" },
] as const;

function RoastFinder({ onAdd }: { onAdd: (id: Coffee["id"], size: CartLine["size"]) => void }) {
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("filter");
  const [body, setBody] = useState(40);
  const pick = useMemo(() => {
    const options = COFFEES.filter((c) => c.method.includes(method));
    return options.reduce((best, c) => (Math.abs(c.body - body) < Math.abs(best.body - body) ? c : best), options[0]);
  }, [method, body]);

  return (
    <section className="px-[clamp(20px,4vw,46px)] pb-[clamp(40px,5vw,68px)]">
      <div className="grid gap-8 rounded-[24px] bg-(--ink) p-[clamp(22px,3.4vw,44px)] text-(--cream) md:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mb-2 text-[12px] font-semibold tracking-[0.2em] text-(--gold) uppercase">Find your roast</p>
          <h2 className={`${serif} mb-6 text-[clamp(1.7rem,2.8vw,2.4rem)] leading-[1.08]`}>
            Tell us how you brew. We’ll pour the right bag.
          </h2>
          <p className="mb-3 text-[13px] text-(--cream)/60">How do you make it?</p>
          <div className="mb-7 flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={method === m.id}
                onClick={() => setMethod(m.id)}
                className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
                  method === m.id
                    ? "border-(--gold) bg-(--gold) text-(--ink)"
                    : "border-(--cream)/20 text-(--cream)/80 hover:border-(--cream)/45"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <label className="mb-3 block text-[13px] text-(--cream)/60" htmlFor="coffee-body">
            Bright and fruity, or deep and chocolatey?
          </label>
          <input
            id="coffee-body"
            type="range"
            min={0}
            max={100}
            value={body}
            onChange={(e) => setBody(Number(e.target.value))}
            className="coffee-range w-full"
          />
          <div className="mt-2 flex justify-between text-[12px] text-(--cream)/55">
            <span>Bright</span>
            <span>Chocolatey</span>
          </div>
        </div>
        <div className="relative grid place-items-center rounded-[18px] bg-(--cream)/6 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pick.id}
              initial={{ opacity: 0, y: 14, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col items-center text-center"
            >
              <BagArt
                theme={BAGS[pick.id]}
                name={pick.name}
                roast={pick.roast}
                className="mb-4 h-[170px] drop-shadow-[0_24px_30px_rgba(0,0,0,.45)]"
              />
              <p className="text-[12px] tracking-[0.14em] text-(--gold) uppercase">Your match</p>
              <p className={`${serif} text-[28px]`}>{pick.name}</p>
              <p className="mb-4 text-[13px] text-(--cream)/65">{pick.notes.join(" · ")}</p>
              <button
                type="button"
                onClick={() => onAdd(pick.id, "small")}
                className="rounded-full bg-(--gold) px-5 py-2.5 text-[13.5px] font-semibold text-(--ink) transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
              >
                Add to cart — ${pick.price.small}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
}: {
  options: Array<{ id: T; label: ReactNode }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
  layoutId: string;
}) {
  return (
    <div className="flex rounded-full bg-(--ink)/6 p-1 text-[13px] font-semibold" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className="relative z-[1] flex-1 rounded-full px-3 py-2 whitespace-nowrap"
        >
          {value === o.id ? (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 -z-[1] rounded-full bg-(--paper) shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
            />
          ) : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SubscriptionBuilder() {
  const [every, setEvery] = useState<"2" | "3" | "4">("3");
  const [bags, setBags] = useState(2);
  const [size, setSize] = useState<"small" | "large">("small");
  const unit = size === "small" ? 20 : 66;
  const perDelivery = Math.round(bags * unit * 0.9);
  const perMonth = Math.round((perDelivery * 4) / Number(every));

  return (
    <section className="px-[clamp(20px,4vw,46px)] py-[clamp(40px,5vw,68px)]">
      <div className="grid items-center gap-8 md:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="mb-2 text-[12px] font-semibold tracking-[0.2em] text-(--clay-ink) uppercase">Subscriptions</p>
          <h2 className={`${serif} mb-4 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.06]`}>Never run out on a Monday.</h2>
          <p className="max-w-[40ch] text-[15px] text-(--muted)">
            Pick a rhythm, we’ll roast to it. Pause, skip or change beans anytime — 10% off every bag.
          </p>
        </div>
        <div className="rounded-[22px] border border-(--ink)/10 bg-(--paper) p-[clamp(20px,3vw,32px)] shadow-[0_30px_60px_-36px_rgba(60,24,8,.4)]">
          <p className="mb-2 text-[12.5px] font-semibold text-(--muted)">Delivery every</p>
          <Segmented
            label="Delivery frequency"
            layoutId="sub-every"
            value={every}
            onChange={setEvery}
            options={[
              { id: "2", label: "2 weeks" },
              { id: "3", label: "3 weeks" },
              { id: "4", label: "4 weeks" },
            ]}
          />
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-[12.5px] font-semibold text-(--muted)">Bags</p>
              <div className="flex items-center justify-between rounded-full bg-(--ink)/6 p-1">
                <button
                  type="button"
                  onClick={() => setBags((b) => Math.max(1, b - 1))}
                  className="grid size-9 place-items-center rounded-full bg-(--paper) text-[18px] shadow-sm"
                  aria-label="Fewer bags"
                >
                  −
                </button>
                <span className="text-[16px] font-semibold tabular-nums">{bags}</span>
                <button
                  type="button"
                  onClick={() => setBags((b) => Math.min(4, b + 1))}
                  className="grid size-9 place-items-center rounded-full bg-(--paper) text-[18px] shadow-sm"
                  aria-label="More bags"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[12.5px] font-semibold text-(--muted)">Size</p>
              <Segmented
                label="Bag size"
                layoutId="sub-size"
                value={size}
                onChange={setSize}
                options={[
                  { id: "small", label: "250 g" },
                  { id: "large", label: "1 kg" },
                ]}
              />
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between border-t border-(--ink)/10 pt-5">
            <div>
              <p className="text-[12.5px] text-(--muted)">Per delivery</p>
              <motion.p
                key={perDelivery}
                initial={{ opacity: 0.4, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${serif} text-[34px] leading-none tabular-nums`}
              >
                ${perDelivery}
              </motion.p>
            </div>
            <p className="text-right text-[12.5px] text-(--muted)">
              ≈ ${perMonth} / month
              <br />
              <span className="font-semibold text-(--clay-ink)">you save 10%</span>
            </p>
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-full bg-(--ink) py-3 text-[14.5px] font-semibold text-(--cream) transition-colors hover:bg-(--clay)"
          >
            Start my subscription
          </button>
        </div>
      </div>
    </section>
  );
}

function CoffeeFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <footer className="bg-(--ink) px-[clamp(20px,4vw,46px)] py-[clamp(40px,5vw,64px)] text-(--cream)">
      <p className={`${serif} mb-[26px] max-w-[18ch] text-[clamp(2rem,4vw,3.2rem)] leading-[1.04]`}>
        Fresh coffee, <em className="text-(--gold) italic">every</em> few weeks.
      </p>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[15px] text-(--gold)"
          >
            ✓ You’re on the list. First roast notes land soon.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -6 }}
            className="flex max-w-[430px] gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (/\S+@\S+\.\S+/.test(email)) setDone(true);
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email"
              className="min-w-0 flex-1 rounded-full border border-(--cream)/18 bg-(--cream)/8 px-[18px] py-3 text-[14px] text-(--cream) placeholder:text-(--cream)/50 focus:border-(--gold) focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-(--gold) px-6 py-3 text-[14px] font-semibold text-(--ink) transition-transform hover:-translate-y-0.5"
            >
              Subscribe
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <div className="mt-[34px] flex flex-wrap justify-between gap-5 border-t border-(--cream)/14 pt-[22px] text-[12.5px] text-(--cream)/60">
        <span>© [year] [Ember &amp; Oak] · {PLACEHOLDER.logo}</span>
        <span>Instagram · TikTok · Newsletter</span>
      </div>
    </footer>
  );
}
