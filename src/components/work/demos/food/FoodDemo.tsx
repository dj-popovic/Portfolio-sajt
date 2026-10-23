"use client";

import { AnimatePresence, animate, motion, useDragControls, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PLACEHOLDER } from "@/lib/placeholders";
import { PhoneFrame, useFitToWindow, useWideWindow } from "../Phone";
import { Dish, type DishKind } from "./Dish";

/* [Tako] — street-food delivery app concept. The landing page and the phone
   share one cart. Copy stays English on purpose (fictional client). */

const THEME = {
  "--bg": "#FFF4E6",
  "--ink": "#241910",
  "--muted": "#7A5A3C",
  "--red": "#E63946",
  "--orange": "#FF6B35",
  "--yellow": "#FFC93C",
  "--line": "rgba(36,25,16,.1)",
  fontFamily: "var(--font-bricolage), system-ui, sans-serif",
} as CSSProperties;

const EASE = [0.25, 1, 0.5, 1] as const;

type Cat = "tacos" | "bowls" | "sides" | "drinks";
type Item = {
  id: string;
  name: string;
  desc: string;
  price: number;
  cat: Cat;
  dish: DishKind;
  tint: string;
  popular?: boolean;
};

const MENU: Item[] = [
  {
    id: "pastor",
    name: "Al Pastor",
    desc: "pineapple · cilantro",
    price: 4.5,
    cat: "tacos",
    dish: "taco",
    tint: "#FFE1C7",
    popular: true,
  },
  {
    id: "baja",
    name: "Baja Fish",
    desc: "slaw · lime crema",
    price: 5,
    cat: "tacos",
    dish: "fish",
    tint: "#FFF0C2",
    popular: true,
  },
  {
    id: "birria",
    name: "Birria Bowl",
    desc: "consommé · onion",
    price: 7.5,
    cat: "bowls",
    dish: "bowl",
    tint: "#FFD9D2",
    popular: true,
  },
  {
    id: "verde",
    name: "Verde Bowl",
    desc: "black beans · tomatillo",
    price: 7,
    cat: "bowls",
    dish: "verde",
    tint: "#E4F1D3",
  },
  {
    id: "elote",
    name: "Elote",
    desc: "cotija · chili · lime",
    price: 3.5,
    cat: "sides",
    dish: "elote",
    tint: "#FFF0C2",
    popular: true,
  },
  {
    id: "churros",
    name: "Churros",
    desc: "cinnamon sugar · cajeta",
    price: 4,
    cat: "sides",
    dish: "churros",
    tint: "#FFE1C7",
  },
  {
    id: "horchata",
    name: "Horchata",
    desc: "rice · cinnamon · vanilla",
    price: 3,
    cat: "drinks",
    dish: "horchata",
    tint: "#F3E6D6",
  },
  {
    id: "jamaica",
    name: "Jamaica",
    desc: "hibiscus · lime",
    price: 3,
    cat: "drinks",
    dish: "jamaica",
    tint: "#FBD3E0",
  },
];

const CATS = [
  { id: "popular", label: "Popular" },
  { id: "tacos", label: "Tacos" },
  { id: "bowls", label: "Bowls" },
  { id: "sides", label: "Sides" },
  { id: "drinks", label: "Drinks" },
] as const;
type CatFilter = (typeof CATS)[number]["id"];

const FREE_OVER = 15;
const DELIVERY = 1.99;

const money = (n: number) => `$${n.toFixed(2)}`;

type Cart = Record<string, number>;
type Line = { item: Item; qty: number };

function totalsFor(cart: Cart) {
  const lines: Line[] = MENU.filter((m) => cart[m.id]).map((m) => ({ item: m, qty: cart[m.id] }));
  const subtotal = lines.reduce((s, l) => s + l.qty * l.item.price, 0);
  // tonight's promo: every second street taco is on the house
  const promo = lines
    .filter((l) => l.item.cat === "tacos")
    .reduce((s, l) => s + Math.floor(l.qty / 2) * l.item.price, 0);
  const delivery = subtotal === 0 || subtotal - promo >= FREE_OVER ? 0 : DELIVERY;
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return { lines, subtotal, promo, delivery, total: subtotal - promo + delivery, count };
}
type Totals = ReturnType<typeof totalsFor>;

type Order = { id: number; lines: Line[]; total: number };
type Flight = { id: number; item: Item; from: { x: number; y: number }; to: { x: number; y: number } };

type Store = {
  cart: Cart;
  totals: Totals;
  add: (item: Item, from?: HTMLElement | null) => void;
  setQty: (id: string, qty: number) => void;
  bump: number;
  sheet: boolean;
  setSheet: (open: boolean) => void;
  screen: "menu" | "track";
  order: Order | null;
  placeOrder: () => void;
  reorder: () => void;
  backToMenu: () => void;
};

const TakoContext = createContext<Store | null>(null);
const useTako = () => {
  const store = useContext(TakoContext);
  if (!store) throw new Error("useTako outside FoodDemo");
  return store;
};

// the first cart icon actually visible inside the window takes the flying dish
function cartTarget(root: HTMLElement) {
  const view = root.closest(".ww-body")?.getBoundingClientRect();
  if (!view) return null;
  return (
    [...root.querySelectorAll<HTMLElement>("[data-cart-target]")].find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.top >= view.top && r.bottom <= view.bottom;
    }) ?? null
  );
}

export default function FoodDemo() {
  const root = useRef<HTMLDivElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const wide = useWideWindow();
  const reduce = useReducedMotion();
  const [cart, setCart] = useState<Cart>({});
  const [bump, setBump] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [sheet, setSheet] = useState(false);
  const [screen, setScreen] = useState<"menu" | "track">("menu");
  const [order, setOrder] = useState<Order | null>(null);
  const [phoneInView, setPhoneInView] = useState(true);
  const flightId = useRef(0);
  const totals = useMemo(() => totalsFor(cart), [cart]);
  useFitToWindow(holder, wide);

  // narrow windows: the floating cart only shows while the phone is scrolled away
  useEffect(() => {
    const phone = holder.current;
    const body = phone?.closest(".ww-body");
    if (wide || !phone || !body) return;
    const io = new IntersectionObserver(([e]) => setPhoneInView(e.isIntersecting), { root: body, threshold: 0.2 });
    io.observe(phone);
    return () => io.disconnect();
  }, [wide]);

  const add = (item: Item, from?: HTMLElement | null) => {
    setCart((c) => ({ ...c, [item.id]: (c[item.id] ?? 0) + 1 }));
    const r = root.current;
    const target = r ? cartTarget(r) : null;
    if (!r || !from || !target || reduce) {
      setBump((b) => b + 1);
      return;
    }
    const base = r.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    flightId.current += 1;
    const flight: Flight = {
      id: flightId.current,
      item,
      from: { x: a.left + a.width / 2 - base.left, y: a.top + a.height / 2 - base.top },
      to: { x: b.left + b.width / 2 - base.left, y: b.top + b.height / 2 - base.top },
    };
    setFlights((f) => [...f, flight]);
  };

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const store: Store = {
    cart,
    totals,
    add,
    setQty,
    bump,
    sheet,
    setSheet,
    screen,
    order,
    placeOrder: () => {
      if (!totals.count) return;
      setOrder({ id: Date.now(), lines: totals.lines, total: totals.total });
      setCart({});
      setSheet(false);
      setScreen("track");
    },
    reorder: () => {
      if (order) setCart(Object.fromEntries(order.lines.map((l) => [l.item.id, l.qty])));
      setScreen("menu");
      setSheet(true);
    },
    backToMenu: () => setScreen("menu"),
  };

  const jump = (id: string) =>
    root.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // "Order now": bring the phone into view and give it a little shake
  const focusPhone = () => {
    const phone = root.current?.querySelector<HTMLElement>("[data-phone]");
    if (!phone) return;
    if (!wide) phone.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!reduce) animate(phone, { rotate: [0, -3, 3, -1.5, 0], y: [0, -10, 0] }, { duration: 0.6, ease: "easeInOut" });
  };

  return (
    <TakoContext value={store}>
      <div ref={root} style={THEME} className="relative min-h-full bg-(--bg) text-(--ink)">
        <Nav onOrder={focusPhone} jump={jump} />
        {wide ? (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-[clamp(32px,6vw,96px)] px-[clamp(18px,5vw,64px)]">
            <div className="min-w-0">
              <section className="flex min-h-[min(74vh,700px)] items-center py-12">
                <HeroCopy onOrder={focusPhone} jump={jump} />
              </section>
              <Specials />
              <How />
            </div>
            <div className="relative">
              <div ref={holder} className="sticky top-6 py-6">
                <Phone />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-[clamp(18px,5vw,64px)]">
            <section className="py-10">
              <HeroCopy onOrder={focusPhone} jump={jump} />
            </section>
            <div ref={holder} className="flex justify-center pb-6">
              <Phone />
            </div>
            <Specials />
            <How />
          </div>
        )}
        <CtaBand onOrder={focusPhone} />
        <footer className="flex flex-wrap items-center justify-between gap-3 px-[clamp(18px,5vw,64px)] pt-4 pb-12 text-[12.5px] font-semibold text-(--muted)">
          <span>© 2026 [Tako] · a concept app, not a real delivery service</span>
          <span className="flex gap-5">
            <span>Couriers</span>
            <span>Privacy</span>
            <span>Terms</span>
          </span>
        </footer>
        {wide ? null : (
          <FloatingCart
            show={!phoneInView}
            onOpen={() => {
              root.current?.querySelector("[data-phone]")?.scrollIntoView({ behavior: "smooth", block: "center" });
              setSheet(true);
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden>
          {flights.map((f) => (
            <motion.span
              key={f.id}
              className="absolute top-0 left-0 grid size-12 place-items-center rounded-full shadow-[0_12px_24px_-10px_rgba(36,25,16,.6)]"
              style={{ background: f.item.tint }}
              initial={{ x: f.from.x - 24, y: f.from.y - 24, scale: 0.5, opacity: 0 }}
              animate={{
                x: [f.from.x - 24, (f.from.x + f.to.x) / 2 - 24, f.to.x - 24],
                y: [f.from.y - 24, Math.min(f.from.y, f.to.y) - 90, f.to.y - 24],
                scale: [0.5, 1.15, 0.3],
                opacity: [0, 1, 0.9],
              }}
              transition={{ duration: 0.75, ease: "easeInOut", times: [0, 0.45, 1] }}
              onAnimationComplete={() => {
                setFlights((all) => all.filter((x) => x.id !== f.id));
                setBump((b) => b + 1);
              }}
            >
              <Dish kind={f.item.dish} className="size-9" />
            </motion.span>
          ))}
        </div>
      </div>
    </TakoContext>
  );
}

/* ---------- the page ---------- */

function Brand({ size = "lg" }: { size?: "lg" | "sm" }) {
  return (
    <span
      className={`flex items-baseline gap-1.5 font-extrabold tracking-[-0.03em] text-(--red) ${size === "lg" ? "text-[22px]" : "text-[18px]"}`}
    >
      [Tako]
      <span className={`font-semibold tracking-normal text-(--muted) ${size === "lg" ? "text-[11px]" : "text-[9px]"}`}>
        {PLACEHOLDER.logo}
      </span>
    </span>
  );
}

function Nav({ onOrder, jump }: { onOrder: () => void; jump: (id: string) => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-(--line) bg-(--bg)/85 px-[clamp(18px,5vw,64px)] py-3 backdrop-blur-md">
      <Brand />
      <nav className="ml-auto hidden gap-6 text-[14px] font-semibold text-(--muted) sm:flex">
        <button type="button" onClick={() => jump("tk-specials")} className="transition-colors hover:text-(--ink)">
          Tonight’s specials
        </button>
        <button type="button" onClick={() => jump("tk-how")} className="transition-colors hover:text-(--ink)">
          How it works
        </button>
      </nav>
      <button
        type="button"
        onClick={onOrder}
        className="ml-auto rounded-full bg-(--red) px-4 py-2 text-[13.5px] font-extrabold text-white shadow-[0_10px_22px_-10px_rgba(230,57,70,.9)] transition-transform hover:-translate-y-0.5 sm:ml-0"
      >
        Order now
      </button>
    </header>
  );
}

function HeroCopy({ onOrder, jump }: { onOrder: () => void; jump: (id: string) => void }) {
  return (
    <div>
      <p className="inline-flex -rotate-2 items-center gap-2 rounded-full bg-(--yellow) px-3.5 py-1.5 text-[12.5px] font-extrabold shadow-[0_6px_0_rgba(36,25,16,.12)]">
        <span className="size-2 rounded-full bg-(--red)" /> Tonight only · 2-for-1 street tacos
      </p>
      <h1 className="mt-6 text-[clamp(42px,6.2vw,80px)] leading-[0.94] font-extrabold tracking-[-0.04em]">
        Street food,
        <span className="block text-(--red)">at your door</span>
        before it cools.
      </h1>
      <p className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-(--muted)">
        Tacos, bowls and aguas frescas from Belgrade’s best street carts — at your door in about twenty minutes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOrder}
          className="rounded-2xl bg-(--ink) px-5 py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
        >
          Order on the phone →
        </button>
        <button
          type="button"
          onClick={() => jump("tk-specials")}
          className="rounded-2xl border-2 border-(--ink) px-5 py-3 text-[15px] font-extrabold transition-colors hover:bg-(--ink) hover:text-white"
        >
          Tonight’s specials
        </button>
      </div>
      <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
        {[
          ["20 min", "average delivery"],
          ["4.8", "average cart rating"],
          ["38", "street carts"],
        ].map(([v, l]) => (
          <div key={l}>
            <dt className="sr-only">{l}</dt>
            <dd className="text-[28px] leading-none font-extrabold">{v}</dd>
            <dd className="mt-1 text-[12.5px] font-semibold text-(--muted)" aria-hidden>
              {l}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Specials() {
  const { add, cart } = useTako();
  return (
    <section id="tk-specials" className="scroll-mt-20 py-14">
      <p className="text-[12.5px] font-extrabold tracking-[0.14em] text-(--red) uppercase">Tonight’s specials</p>
      <h2 className="mt-3 max-w-[24rem] text-[clamp(28px,3.6vw,42px)] leading-[1.02] font-extrabold tracking-[-0.03em]">
        Tap add — it lands in the app’s cart.
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MENU.filter((m) => m.popular).map((m) => (
          <article key={m.id} className="group relative rounded-[28px] border border-(--line) bg-white p-4">
            <div className="grid h-40 place-items-center overflow-hidden rounded-[22px]" style={{ background: m.tint }}>
              <Dish
                kind={m.dish}
                className="size-28 transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110 group-hover:-rotate-6"
              />
            </div>
            {m.cat === "tacos" ? (
              <span className="absolute top-2 right-2 rotate-6 rounded-full bg-(--yellow) px-2.5 py-1 text-[11px] font-extrabold shadow-[0_4px_0_rgba(36,25,16,.12)]">
                2-for-1
              </span>
            ) : null}
            <div className="mt-4 flex items-start justify-between gap-3 px-1">
              <div>
                <p className="text-[18px] leading-tight font-extrabold">{m.name}</p>
                <p className="mt-0.5 text-[13px] font-semibold text-(--muted)">{m.desc}</p>
              </div>
              <p className="text-[16px] font-extrabold text-(--red)">{money(m.price)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => add(m, e.currentTarget)}
              className="mt-4 w-full rounded-2xl bg-(--ink) py-3 text-[14px] font-extrabold text-white transition-colors hover:bg-(--red)"
            >
              {cart[m.id] ? `Add another · ${cart[m.id]} in cart` : "Add to cart"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function How() {
  return (
    <section id="tk-how" className="scroll-mt-20 pt-6 pb-16">
      <p className="text-[12.5px] font-extrabold tracking-[0.14em] text-(--red) uppercase">How it works</p>
      <h2 className="mt-3 max-w-[24rem] text-[clamp(28px,3.6vw,42px)] leading-[1.02] font-extrabold tracking-[-0.03em]">
        Three taps between you and a taco.
      </h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Pick a cart", "Thirty-eight street carts, one menu. Filter by whatever you’re craving."],
          ["We ride it over", "Couriers pick up straight off the plancha — about twenty minutes door to door."],
          ["Eat it hot", "Follow every turn on the map, then rate the cart, not the courier."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-[24px] border border-(--line) bg-white p-5">
            <span className="grid size-10 place-items-center rounded-full bg-(--yellow) text-[16px] font-extrabold">
              {i + 1}
            </span>
            <p className="mt-4 text-[17px] font-extrabold">{t}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-(--muted)">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CtaBand({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="px-[clamp(18px,5vw,64px)] pb-10">
      <div className="relative overflow-hidden rounded-[36px] bg-(--red) px-[clamp(24px,5vw,64px)] py-[clamp(40px,6vw,72px)] text-white">
        <Dish kind="taco" className="tk-float absolute -right-6 -bottom-8 size-[190px] sm:right-[6%]" />
        <Dish
          kind="horchata"
          className="tk-float absolute top-8 right-[34%] hidden size-20 sm:block"
          style={{ animationDelay: "-2.4s" }}
        />
        <p className="relative text-[12.5px] font-extrabold tracking-[0.14em] text-(--yellow) uppercase">Hungry yet?</p>
        <p className="relative mt-3 max-w-[19rem] text-[clamp(30px,4vw,48px)] leading-[1] font-extrabold tracking-[-0.03em]">
          The carts are open till 2am.
        </p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOrder}
            className="rounded-2xl bg-white px-5 py-3.5 text-[15px] font-extrabold text-(--ink) transition-transform hover:-translate-y-0.5"
          >
            Order on the phone
          </button>
          <span className="rounded-2xl border-2 border-white/70 px-5 py-3 text-[15px] font-extrabold">
            iPhone · Android
          </span>
        </div>
      </div>
    </section>
  );
}

function FloatingCart({ show, onOpen }: { show: boolean; onOpen: () => void }) {
  const { totals, bump } = useTako();
  return (
    <AnimatePresence>
      {show && totals.count > 0 ? (
        <motion.button
          type="button"
          data-cart-target
          onClick={onOpen}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="sticky bottom-4 z-40 mx-auto mb-4 flex w-[min(92%,360px)] items-center justify-between rounded-2xl bg-(--ink) px-4 py-3 text-white shadow-[0_18px_40px_-16px_rgba(36,25,16,.8)]"
        >
          <span className="flex items-center gap-2.5 text-[14px] font-extrabold">
            <motion.span
              key={bump}
              initial={{ scale: 1.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 14 }}
              className="grid size-6 place-items-center rounded-full bg-(--red) text-[12px]"
            >
              {totals.count}
            </motion.span>
            View cart
          </span>
          <span className="text-[14px] font-extrabold tabular-nums">{money(totals.total)}</span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- the phone ---------- */

function Phone() {
  const { screen } = useTako();
  const dir = screen === "track" ? 1 : -1;
  return (
    <PhoneFrame frame="#1B1410" island="#0E0A08" screen="bg-(--bg)">
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={screen}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: 28 * d }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: -28 * d }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.24, ease: EASE }}
            className="absolute inset-0"
          >
            {screen === "menu" ? <MenuScreen /> : <TrackScreen />}
          </motion.div>
        </AnimatePresence>
        <CartBar />
      </div>
      <span
        className="absolute bottom-2 left-1/2 z-40 h-[5px] w-28 -translate-x-1/2 rounded-full bg-(--ink)/80"
        aria-hidden
      />
      <CartSheet />
    </PhoneFrame>
  );
}

function PhoneHeader() {
  const { totals, bump, setSheet } = useTako();
  return (
    <div className="flex items-center justify-between px-4 pt-1 pb-2">
      <span className="text-[10px] font-semibold text-(--muted)">
        Deliver to
        <b className="block text-[13px] font-extrabold text-(--ink)">Dorćol, BG ▾</b>
      </span>
      <Brand size="sm" />
      <button
        type="button"
        data-cart-target
        onClick={() => setSheet(true)}
        aria-label={`Cart, ${totals.count} items`}
        className="relative grid size-9 place-items-center rounded-full bg-white shadow-[0_4px_12px_-6px_rgba(36,25,16,.4)]"
      >
        <motion.svg
          key={bump}
          className="size-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ rotate: bump ? -16 : 0 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 12 }}
          aria-hidden
        >
          <path d="M6 8h12l-1 12H7L6 8Z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </motion.svg>
        {totals.count > 0 ? (
          <motion.span
            key={`n${bump}`}
            initial={{ scale: 1.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 14 }}
            className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-(--red) px-1 text-[10px] font-extrabold text-white"
          >
            {totals.count}
          </motion.span>
        ) : null}
      </button>
    </div>
  );
}

const PROMOS: Array<{
  tag: string;
  title: string;
  sub: string;
  bg: string;
  fg: string;
  badge: string;
  dish: DishKind;
}> = [
  {
    tag: "Tonight only",
    title: "2-for-1\nstreet tacos",
    sub: "Every second taco is on us",
    bg: "linear-gradient(120deg,#E63946,#FF6B35)",
    fg: "#fff",
    badge: "#FFC93C",
    dish: "taco",
  },
  {
    tag: "Every night",
    title: "Free delivery\nover $15",
    sub: "No codes, no small print",
    bg: "linear-gradient(120deg,#FFC93C,#FFB020)",
    fg: "#241910",
    badge: "#FF6B35",
    dish: "jamaica",
  },
  {
    tag: "New",
    title: "Birria Bowl\nis here",
    sub: "Slow-braised, consommé on the side",
    bg: "linear-gradient(120deg,#241910,#5A3020)",
    fg: "#fff",
    badge: "#E63946",
    dish: "bowl",
  },
];

const slide = {
  enter: (d: number) => ({ x: `${d * 100}%` }),
  center: { x: "0%" },
  exit: (d: number) => ({ x: `${d * -100}%` }),
};

function Promo() {
  const reduce = useReducedMotion();
  const [{ i, dir }, setSlide] = useState({ i: 0, dir: 1 });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => setSlide((s) => ({ i: (s.i + 1) % PROMOS.length, dir: 1 })), 3800);
    return () => window.clearInterval(id);
  }, [paused, reduce]);

  const go = (n: number) => setSlide((s) => ({ i: (n + PROMOS.length) % PROMOS.length, dir: n >= s.i ? 1 : -1 }));
  const p = PROMOS[i];

  return (
    <div className="px-4" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="relative h-[116px] overflow-hidden rounded-[18px]">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.35}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) go(i + 1);
              else if (info.offset.x > 40) go(i - 1);
            }}
            className="absolute inset-0 cursor-grab overflow-hidden p-4 active:cursor-grabbing"
            style={{ background: p.bg, color: p.fg }}
          >
            <p className="text-[9px] font-extrabold tracking-[0.12em] uppercase opacity-90">{p.tag}</p>
            <p className="mt-1.5 text-[21px] leading-[1] font-extrabold tracking-[-0.02em] whitespace-pre-line">
              {p.title}
            </p>
            <p className="mt-1.5 text-[10.5px] font-semibold opacity-90">{p.sub}</p>
            <span className="absolute -right-3 -bottom-4 size-[84px] rounded-full" style={{ background: p.badge }} />
            <Dish kind={p.dish} className="absolute right-1 bottom-0 size-[70px] -rotate-12" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-1 flex justify-center gap-1">
        {PROMOS.map((promo, n) => (
          <button
            key={promo.tag}
            type="button"
            onClick={() => go(n)}
            aria-label={`Offer ${n + 1}: ${promo.title.replace("\n", " ")}`}
            aria-current={n === i ? "true" : undefined}
            className="relative grid size-4 place-items-center"
          >
            <span className="size-1.5 rounded-full bg-(--ink)/20" />
            {/* the active pill slides between dots (layout animation = transforms, no width tween) */}
            {n === i ? (
              <motion.span
                layoutId="tk-promo-dot"
                className="absolute h-1.5 w-5 rounded-full bg-(--red)"
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stepper({ qty, onAdd, onSet }: { qty: number; onAdd: (el: HTMLElement) => void; onSet: (n: number) => void }) {
  return (
    <motion.div
      layout
      className="flex shrink-0 items-center overflow-hidden rounded-[11px] bg-(--ink) text-white"
      transition={{ type: "spring", stiffness: 500, damping: 38 }}
    >
      <AnimatePresence initial={false}>
        {qty > 0 ? (
          <motion.button
            key="minus"
            type="button"
            onClick={() => onSet(qty - 1)}
            aria-label="Remove one"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 26, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="grid h-[30px] place-items-center text-[16px] font-bold"
          >
            −
          </motion.button>
        ) : null}
        {qty > 0 ? (
          <motion.span
            key="qty"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 16, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="text-center text-[12px] font-extrabold tabular-nums"
          >
            {qty}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={(e) => onAdd(e.currentTarget)}
        aria-label="Add one"
        className="grid size-[30px] place-items-center text-[18px] font-bold"
      >
        +
      </button>
    </motion.div>
  );
}

function MenuScreen() {
  const { totals, cart, add, setQty } = useTako();
  const [cat, setCat] = useState<CatFilter>("popular");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const items = MENU.filter((m) =>
    needle ? `${m.name} ${m.desc}`.toLowerCase().includes(needle) : cat === "popular" ? m.popular : m.cat === cat,
  );

  return (
    <div className={`tk-scroll h-full overflow-y-auto ${totals.count > 0 ? "pb-24" : "pb-8"}`}>
      <PhoneHeader />
      <label className="relative mx-4 block">
        <span className="sr-only">Search the menu</span>
        <svg
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-(--muted)"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tacos, bowls, drinks…"
          className="h-[36px] w-full rounded-[12px] border border-(--line) bg-white pr-3 pl-8 text-[12px] font-semibold text-(--ink) placeholder:text-[#9A7A5A] focus:border-(--red)/50 focus:outline-none"
        />
      </label>
      <div className="tk-scroll flex gap-2 overflow-x-auto px-4 py-3">
        {CATS.map((c) => {
          const on = !needle && cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCat(c.id);
                setQ("");
              }}
              aria-pressed={on}
              className={`relative shrink-0 rounded-full border px-3.5 py-1.5 text-[11.5px] font-bold transition-colors ${on ? "border-(--red) text-white" : "border-(--line) bg-white text-[#5A4634]"}`}
            >
              {on ? (
                <motion.span
                  layoutId="tk-chip"
                  className="absolute inset-0 rounded-full bg-(--red)"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null}
              <span className="relative">{c.label}</span>
            </button>
          );
        })}
      </div>
      {needle ? null : <Promo />}
      <p className="mt-4 px-4 text-[10.5px] font-extrabold tracking-[0.12em] text-(--muted) uppercase">
        {needle ? `Results for “${q.trim()}”` : CATS.find((c) => c.id === cat)?.label}
      </p>
      <ul className="px-4 pt-1">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((m) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="flex items-center gap-3 border-b border-(--line) py-2.5 last:border-0"
            >
              <span
                className="grid size-[56px] shrink-0 place-items-center rounded-[16px]"
                style={{ background: m.tint }}
              >
                <Dish kind={m.dish} className="size-11" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-extrabold">{m.name}</span>
                <span className="block truncate text-[10.5px] font-semibold text-(--muted)">{m.desc}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-extrabold text-(--red)">
                  {money(m.price)}
                  {m.cat === "tacos" ? (
                    <span className="rounded-full bg-(--yellow) px-1.5 py-px text-[8.5px] text-(--ink)">2-for-1</span>
                  ) : null}
                </span>
              </span>
              <Stepper qty={cart[m.id] ?? 0} onAdd={(el) => add(m, el)} onSet={(n) => setQty(m.id, n)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {items.length === 0 ? (
        <p className="px-6 py-8 text-center text-[12.5px] font-semibold text-(--muted)">
          Nothing called “{q.trim()}” tonight — try “taco”.
        </p>
      ) : null}
    </div>
  );
}

function CartBar() {
  const { totals, setSheet, screen } = useTako();
  return (
    <AnimatePresence>
      {totals.count > 0 && screen === "menu" ? (
        <motion.button
          type="button"
          onClick={() => setSheet(true)}
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-x-3 bottom-5 z-10 flex items-center justify-between rounded-[18px] bg-(--red) px-4 py-3 text-white shadow-[0_14px_30px_-12px_rgba(230,57,70,.85)]"
        >
          <span className="flex items-center gap-2.5 text-[13.5px] font-extrabold">
            <span className="grid size-6 place-items-center rounded-full bg-white/25 text-[11.5px]">
              {totals.count}
            </span>
            View cart
          </span>
          <span className="text-[14px] font-extrabold tabular-nums">{money(totals.total)}</span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

function CartSheet() {
  const { sheet, setSheet, totals, add, setQty, placeOrder } = useTako();
  const controls = useDragControls();
  const close = () => setSheet(false);
  const afterPromo = totals.subtotal - totals.promo;
  const left = Math.max(0, FREE_OVER - afterPromo);
  const oddTaco = totals.lines.find((l) => l.item.cat === "tacos" && l.qty % 2 === 1);

  return (
    <AnimatePresence>
      {sheet ? (
        <motion.div
          key="scrim"
          className="absolute inset-0 z-20 bg-[#241910]/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        />
      ) : null}
      {sheet ? (
        <motion.div
          key="sheet"
          role="dialog"
          aria-label="Your cart"
          className="absolute inset-x-0 bottom-0 z-30 flex max-h-[84%] flex-col rounded-t-[30px] bg-white px-4 pt-1 pb-7 shadow-[0_-20px_40px_-20px_rgba(0,0,0,.35)]"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          drag="y"
          dragControls={controls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.7 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 || info.velocity.y > 500) close();
          }}
        >
          <div
            onPointerDown={(e) => controls.start(e)}
            className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          >
            <span className="h-1.5 w-10 rounded-full bg-(--ink)/15" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-[19px] font-extrabold tracking-[-0.02em]">Your order</p>
            <button type="button" onClick={close} className="text-[12px] font-bold text-(--muted)">
              Close
            </button>
          </div>
          <p className="text-[11px] font-semibold text-(--muted)">from [Tako] Dorćol · about 20 min</p>

          {totals.count === 0 ? (
            <div className="grid place-items-center py-8 text-center">
              <Dish kind="taco" className="size-20 opacity-90" />
              <p className="mt-3 text-[14px] font-extrabold">Your cart is empty</p>
              <p className="mt-1 text-[11.5px] font-semibold text-(--muted)">Start with tonight’s 2-for-1 tacos.</p>
              <button
                type="button"
                onClick={close}
                className="mt-4 rounded-2xl bg-(--ink) px-4 py-2.5 text-[12.5px] font-extrabold text-white"
              >
                Browse the menu
              </button>
            </div>
          ) : (
            <>
              <ul className="tk-scroll -mx-1 mt-2 min-h-0 flex-1 overflow-y-auto px-1">
                <AnimatePresence initial={false}>
                  {totals.lines.map(({ item, qty }) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 py-2">
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl"
                          style={{ background: item.tint }}
                        >
                          <Dish kind={item.dish} className="size-8" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-extrabold">{item.name}</span>
                          <span className="block text-[10.5px] font-semibold text-(--muted)">
                            {money(item.price)} each
                          </span>
                        </span>
                        <Stepper qty={qty} onAdd={() => add(item)} onSet={(n) => setQty(item.id, n)} />
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {oddTaco ? (
                <button
                  type="button"
                  onClick={() => add(oddTaco.item)}
                  className="mt-2 w-full rounded-xl bg-(--yellow)/60 px-3 py-2 text-left text-[11.5px] font-bold"
                >
                  One more {oddTaco.item.name} is free tonight — <span className="underline">add it</span>
                </button>
              ) : null}
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-(--ink)/10">
                  <motion.div
                    className="h-full rounded-full bg-(--orange)"
                    animate={{ width: `${Math.min(1, afterPromo / FREE_OVER) * 100}%` }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                </div>
                <p className="mt-1 text-[10.5px] font-bold text-(--muted)">
                  {left > 0 ? `Add ${money(left)} more for free delivery` : "Free delivery unlocked"}
                </p>
              </div>
              <dl className="mt-3 grid gap-1 text-[12px] font-semibold">
                <div className="flex justify-between">
                  <dt className="text-(--muted)">Subtotal</dt>
                  <dd className="tabular-nums">{money(totals.subtotal)}</dd>
                </div>
                {totals.promo > 0 ? (
                  <div className="flex justify-between text-(--red)">
                    <dt>2-for-1 tacos</dt>
                    <dd className="tabular-nums">−{money(totals.promo)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-(--muted)">Delivery</dt>
                  <dd className="tabular-nums">{totals.delivery ? money(totals.delivery) : "Free"}</dd>
                </div>
                <div className="mt-1 flex justify-between border-t border-(--line) pt-2 text-[14px] font-extrabold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(totals.total)}</dd>
                </div>
              </dl>
              <motion.button
                type="button"
                onClick={placeOrder}
                whileTap={{ scale: 0.97 }}
                className="mt-3 w-full shrink-0 rounded-[18px] bg-(--red) py-3.5 text-[14.5px] font-extrabold text-white shadow-[0_14px_28px_-14px_rgba(230,57,70,.9)]"
              >
                Place order · {money(totals.total)}
              </motion.button>
            </>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ---------- order tracking ---------- */

const ROUTE = "M34 132C62 132 64 104 92 98S128 74 150 70S196 52 214 30";
const STEPS = [
  { at: 0, label: "Order placed", sub: "[Tako] Dorćol has it" },
  { at: 3, label: "On the plancha", sub: "Tortillas are hitting the heat" },
  { at: 7, label: "On the way", sub: "[Courier] is riding over" },
  { at: 19, label: "Delivered", sub: "Buen provecho!" },
];
const TRIP = { start: 7, end: 19 };

function TrackScreen() {
  const { order } = useTako();
  return order ? <Tracking key={order.id} order={order} /> : null;
}

function Tracking({ order }: { order: Order }) {
  const { reorder, backToMenu } = useTako();
  const [t, setT] = useState(0);

  useEffect(() => {
    // demo time: one "minute" of the trip per second
    const id = window.setInterval(() => setT((v) => (v >= 20 ? v : v + 0.25)), 250);
    return () => window.clearInterval(id);
  }, []);

  const step = STEPS.reduce((acc, s, i) => (t >= s.at ? i : acc), 0);
  const done = step === STEPS.length - 1;
  const p = Math.min(1, Math.max(0, (t - TRIP.start) / (TRIP.end - TRIP.start)));
  const eta = Math.max(1, Math.ceil(20 - t));

  return (
    <div className="tk-scroll h-full overflow-y-auto pb-8">
      <PhoneHeader />
      <div className="px-4">
        <p className="text-[10.5px] font-extrabold tracking-[0.12em] text-(--muted) uppercase">
          Order #{String(order.id).slice(-4)}
        </p>
        <p className="mt-0.5 text-[22px] leading-tight font-extrabold tracking-[-0.02em]" aria-live="polite">
          {done ? "Delivered. Enjoy!" : `Arriving in ${eta} min`}
        </p>
        <div className="relative mt-3 h-[160px] w-[250px] overflow-hidden rounded-[22px] bg-[#FBE3C8]">
          <svg viewBox="0 0 250 160" className="absolute inset-0 size-full" aria-hidden>
            <path d="M0 72C46 62 84 88 132 80S206 52 250 60V76C206 70 178 96 130 96S48 80 0 90Z" fill="#BFE3F5" />
            <rect x="156" y="100" width="70" height="44" rx="12" fill="#CFEAB4" />
            {[
              [12, 12, 52, 36],
              [74, 8, 58, 30],
              [144, 10, 40, 26],
              [194, 40, 46, 14],
              [12, 102, 50, 40],
              [76, 112, 66, 38],
              [232, 100, 30, 44],
            ].map(([x, y, w, h]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="8" fill="#F5D2AC" />
            ))}
            <path
              d={ROUTE}
              fill="none"
              stroke="rgba(36,25,16,.28)"
              strokeWidth="4"
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
            <path
              d={ROUTE}
              fill="none"
              stroke="#E63946"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${p} 1`}
              style={{ transition: "stroke-dasharray .25s linear" }}
            />
            <circle cx="34" cy="132" r="9" fill="#E63946" />
            <path
              d="M30.5 128v8M34 128v8M37.5 128v3.5a3.5 3.5 0 0 1-7 0"
              fill="none"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="214" cy="30" r="9" fill="#241910" />
            <path d="M209.5 31.5 214 27l4.5 4.5v4h-9Z" fill="#fff" />
          </svg>
          <span
            className="absolute top-0 left-0 grid size-8 place-items-center rounded-full bg-white shadow-[0_6px_14px_-4px_rgba(36,25,16,.5)]"
            style={{
              offsetPath: `path("${ROUTE}")`,
              offsetDistance: `${p * 100}%`,
              offsetRotate: "0deg",
              opacity: step >= 2 ? 1 : 0,
              transition: "offset-distance .25s linear, opacity .3s",
            }}
          >
            <svg
              className="size-[18px] text-(--orange)"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="6" cy="17" r="2.5" />
              <circle cx="18" cy="17" r="2.5" />
              <path d="M8.5 17H14l2.5-6H19M13 7h3l1.5 4" />
            </svg>
          </span>
        </div>

        <ol className="mt-4">
          {STEPS.map((s, i) => {
            const state = i < step || (done && i === step) ? "done" : i === step ? "now" : "next";
            return (
              <li key={s.label} className="relative flex gap-3 pb-3.5 last:pb-0">
                {i < STEPS.length - 1 ? (
                  <span className="absolute top-6 bottom-0 left-[11px] w-0.5 overflow-hidden bg-(--ink)/10">
                    <span
                      className="block w-full bg-(--red) transition-[height] duration-500"
                      style={{ height: i < step ? "100%" : "0%" }}
                    />
                  </span>
                ) : null}
                <span
                  className={`relative grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${state === "next" ? "bg-(--ink)/10 text-(--muted)" : "bg-(--red) text-white"}`}
                >
                  {state === "now" ? <span className="tk-ping absolute inset-0 rounded-full bg-(--red)" /> : null}
                  <span className="relative">{state === "done" ? "✓" : i + 1}</span>
                </span>
                <span className="pt-0.5">
                  <span
                    className={`block text-[13px] leading-tight font-extrabold ${state === "next" ? "text-(--muted)" : ""}`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[10.5px] font-semibold text-(--muted)">{s.sub}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 rounded-2xl bg-white p-3 text-[11.5px] font-semibold">
          {order.lines.map((l) => (
            <p key={l.item.id} className="flex justify-between py-0.5">
              <span>
                {l.qty}× {l.item.name}
              </span>
              <span className="text-(--muted) tabular-nums">{money(l.qty * l.item.price)}</span>
            </p>
          ))}
          <p className="mt-1 flex justify-between border-t border-(--line) pt-1.5 font-extrabold">
            <span>Paid</span>
            <span className="tabular-nums">{money(order.total)}</span>
          </p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={reorder}
            className="rounded-2xl bg-(--ink) py-2.5 text-[12.5px] font-extrabold text-white"
          >
            Order again
          </button>
          <button
            type="button"
            onClick={backToMenu}
            className="rounded-2xl border border-(--line) bg-white py-2.5 text-[12.5px] font-extrabold"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
}
