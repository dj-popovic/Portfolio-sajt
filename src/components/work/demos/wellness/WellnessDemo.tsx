"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ConceptMark } from "@/components/work/marks";
import { PhoneFrame, useFitToWindow, useWideWindow } from "../Phone";

/* Stillwater, a sleep & breathing app concept: a landing page whose phone
   actually works. Copy stays English on purpose (fictional client). */

const THEME = {
  "--ink": "#2A2553",
  "--muted": "#5F5794",
  "--soft": "#7A71B8",
  "--primary": "#6C5CE7",
  "--violet": "#8E7DF0",
  "--blue": "#4F8DF0",
  "--lilac": "#B49BFF",
  "--card": "rgba(255,255,255,.72)",
  "--line": "rgba(108,92,231,.14)",
  fontFamily: "var(--font-nunito), system-ui, sans-serif",
} as CSSProperties;

const EASE = [0.25, 1, 0.5, 1] as const;

type Screen = "home" | "breathe" | "sleep" | "progress";
type SetScreen = Dispatch<SetStateAction<Screen>>;

type Track = { id: string; title: string; kind: string; minutes: number; art: string };
const TRACKS: Track[] = [
  { id: "deep", title: "Deep Sleep", kind: "Sleep story", minutes: 22, art: "linear-gradient(150deg,#8E7DF0,#5A4BD6)" },
  { id: "focus", title: "Focus Flow", kind: "Ambient", minutes: 15, art: "linear-gradient(150deg,#7FB3FF,#4F7FE6)" },
  { id: "calm", title: "Calm Mind", kind: "Guided", minutes: 10, art: "linear-gradient(150deg,#C3A8FF,#8E7DF0)" },
];

const CHAPTERS: Array<{ screen: Exclude<Screen, "home">; kicker: string; title: string; body: string; note: string }> =
  [
    {
      screen: "breathe",
      kicker: "01 · Breathe",
      title: "A ring that breathes with you.",
      body: "In for four, hold for four, out for six. Follow the circle until your shoulders drop. The phone does the counting.",
      note: "Try it on the phone →",
    },
    {
      screen: "sleep",
      kicker: "02 · Sleep",
      title: "Stories that fade out on their own.",
      body: "Pick a story and a timer. The voice softens and the sound bed lowers as you drift off. No abrupt stop at minute thirty.",
      note: "Press play →",
    },
    {
      screen: "progress",
      kicker: "03 · Rhythm",
      title: "Streaks without the guilt.",
      body: "Miss a night and nothing breaks. Stillwater counts what you did, not what you didn’t.",
      note: "12 nights and counting →",
    },
  ];

export default function WellnessDemo() {
  const root = useRef<HTMLDivElement>(null);
  const wide = useWideWindow();
  const [screen, setScreen] = useState<Screen>("home");
  const [track, setTrack] = useState<Track>(TRACKS[0]);

  const jump = (id: string) =>
    root.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const phone = <Phone screen={screen} setScreen={setScreen} track={track} setTrack={setTrack} />;

  return (
    <div
      ref={root}
      style={THEME}
      className="min-h-full bg-[linear-gradient(180deg,#EEEBFF,#E5E6FF_40%,#DCE7FF_75%,#E9E5FF)] text-(--ink)"
    >
      <Nav jump={jump} />
      {wide ? (
        <WideStory screen={screen} setScreen={setScreen} phone={phone} jump={jump} />
      ) : (
        <NarrowStory setScreen={setScreen} phone={phone} jump={jump} />
      )}
      <Pricing />
      <Cta />
      <footer className="flex flex-wrap items-center justify-between gap-3 px-[clamp(18px,5vw,64px)] pt-4 pb-12 text-[12.5px] text-(--muted)">
        <span>© 2026 Stillwater · a concept app, not a real product</span>
        <span className="flex gap-5">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </span>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-0.01em]">
      <ConceptMark kind="wellness" size={30} />
      Stillwater
    </span>
  );
}

function StoreButtons({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        ["Download for", "iPhone"],
        ["Get it for", "Android"],
      ].map(([a, b]) => (
        <span
          key={b}
          className={`flex cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-2.5 transition-transform hover:-translate-y-0.5 ${dark ? "bg-(--ink) text-white" : "bg-white text-(--ink)"}`}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="6" y="2.5" width="12" height="19" rx="3" />
            <path d="M10.5 18.5h3" strokeLinecap="round" />
          </svg>
          <span className="leading-tight">
            <span className="block text-[10.5px] font-semibold opacity-70">{a}</span>
            <span className="text-[14px] font-extrabold">{b}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

function Nav({ jump }: { jump: (id: string) => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-(--line) bg-[#EEEBFF]/80 px-[clamp(18px,5vw,64px)] py-3.5 backdrop-blur-md">
      <Logo />
      <nav className="ml-auto hidden gap-7 text-[14px] font-bold text-(--muted) sm:flex">
        {[
          ["How it works", "sw-how"],
          ["Pricing", "sw-pricing"],
        ].map(([l, id]) => (
          <button key={id} type="button" onClick={() => jump(id)} className="transition-colors hover:text-(--ink)">
            {l}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => jump("sw-get")}
        className="ml-auto rounded-full bg-(--primary) px-4 py-2 text-[13.5px] font-extrabold text-white shadow-[0_10px_24px_-10px_rgba(108,92,231,.8)] transition-transform hover:-translate-y-0.5 sm:ml-0"
      >
        Get the app
      </button>
    </header>
  );
}

function HeroCopy({ jump }: { jump: (id: string) => void }) {
  return (
    <div>
      <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[12px] font-extrabold tracking-[0.08em] text-(--primary) uppercase">
        <span className="size-1.5 rounded-full bg-(--primary)" /> Sleep & breathing
      </p>
      <h1 className="mt-5 text-[clamp(38px,5.4vw,64px)] leading-[1.02] font-extrabold tracking-[-0.03em]">
        Good evening,
        <span className="block bg-[linear-gradient(90deg,#6C5CE7,#4F8DF0)] bg-clip-text text-transparent">
          let’s unwind.
        </span>
      </h1>
      <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed text-(--muted)">
        Two-minute breathing, sleep stories that fade out on their own, and streaks that never guilt-trip you.
      </p>
      <div className="mt-7">
        <StoreButtons />
      </div>
      <button
        type="button"
        onClick={() => jump("sw-how")}
        className="mt-6 flex items-center gap-2 text-[13.5px] font-bold text-(--muted) transition-colors hover:text-(--ink)"
      >
        <span className="text-[#F5B83D]">★★★★★</span> Loved by light sleepers · see how it works ↓
      </button>
    </div>
  );
}

function WideStory({
  screen,
  setScreen,
  phone,
  jump,
}: {
  screen: Screen;
  setScreen: SetScreen;
  phone: ReactNode;
  jump: (id: string) => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState<Screen>("home");

  useEffect(() => {
    const el = list.current;
    const body = el?.closest<HTMLElement>(".ww-body");
    if (!el || !body) return;
    // whichever chapter crosses the middle of the window drives the phone
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const next = (e.target as HTMLElement).dataset.screen as Screen;
          setChapter(next);
          setScreen(next);
        }
      },
      { root: body, rootMargin: "-48% 0px -48% 0px" },
    );
    el.querySelectorAll("[data-screen]").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [setScreen]);
  useFitToWindow(holder);

  return (
    <div
      ref={list}
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-[clamp(32px,6vw,96px)] px-[clamp(18px,5vw,64px)]"
    >
      <div>
        <section data-screen="home" className="flex min-h-[min(74vh,700px)] items-center py-12">
          <HeroCopy jump={jump} />
        </section>
        <div id="sw-how">
          {CHAPTERS.map((c, i) => {
            const on = chapter === c.screen;
            return (
              <section key={c.screen} data-screen={c.screen} className="flex min-h-[min(70vh,640px)] items-center">
                <div
                  className={`transition-[opacity,translate] duration-500 ${on ? "opacity-100" : "translate-y-2 opacity-35"}`}
                >
                  <p className="text-[12.5px] font-extrabold tracking-[0.14em] text-(--primary) uppercase">
                    {c.kicker}
                  </p>
                  <h2 className="mt-3 max-w-[22rem] text-[clamp(28px,3.4vw,40px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
                    {c.title}
                  </h2>
                  <p className="mt-4 max-w-[27rem] text-[16px] leading-relaxed text-(--muted)">{c.body}</p>
                  <button
                    type="button"
                    onClick={() => setScreen(c.screen)}
                    className={`mt-6 rounded-full px-4 py-2 text-[13.5px] font-extrabold transition-colors ${screen === c.screen ? "bg-(--primary) text-white" : "bg-white/70 text-(--primary)"}`}
                  >
                    {c.note}
                  </button>
                  {i === CHAPTERS.length - 1 ? null : <div className="mt-14 h-px w-16 bg-(--line)" />}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <div className="relative">
        <div ref={holder} className="sticky top-6 py-6">
          {phone}
        </div>
      </div>
    </div>
  );
}

function NarrowStory({
  setScreen,
  phone,
  jump,
}: {
  setScreen: SetScreen;
  phone: ReactNode;
  jump: (id: string) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  return (
    <div className="px-[clamp(18px,5vw,64px)]">
      <section className="py-10">
        <HeroCopy jump={jump} />
      </section>
      <div ref={holder} className="flex scroll-mt-20 justify-center pb-8">
        {phone}
      </div>
      <div id="sw-how" className="grid scroll-mt-20 gap-3 pb-6">
        {CHAPTERS.map((c) => (
          <button
            key={c.screen}
            type="button"
            onClick={() => {
              setScreen(c.screen);
              holder.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-3xl border border-(--line) bg-white/65 p-5 text-left"
          >
            <p className="text-[11.5px] font-extrabold tracking-[0.14em] text-(--primary) uppercase">{c.kicker}</p>
            <p className="mt-2 text-[20px] leading-tight font-extrabold">{c.title}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-(--muted)">{c.body}</p>
            <p className="mt-3 text-[13px] font-extrabold text-(--primary)">Show on the phone ↑</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- the phone ---------- */

const TABS: Array<{ id: Screen; label: string; icon: ReactNode }> = [
  { id: "home", label: "Today", icon: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" /> },
  {
    id: "breathe",
    label: "Breathe",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.5" />
      </>
    ),
  },
  { id: "sleep", label: "Sleep", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /> },
  { id: "progress", label: "Rhythm", icon: <path d="M5 20v-8m7 8V5m7 15v-6" /> },
];

function Phone({
  screen,
  setScreen,
  track,
  setTrack,
}: {
  screen: Screen;
  setScreen: SetScreen;
  track: Track;
  setTrack: (t: Track) => void;
}) {
  return (
    <PhoneFrame frame="#221E3F" screen="bg-[linear-gradient(180deg,#F4F2FF,#E8E9FF_55%,#DEE6FF)]">
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            {screen === "home" ? (
              <HomeScreen setScreen={setScreen} setTrack={setTrack} />
            ) : screen === "breathe" ? (
              <BreatheScreen />
            ) : screen === "sleep" ? (
              <SleepScreen key={track.id} track={track} setTrack={setTrack} />
            ) : (
              <ProgressScreen />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <nav
        className="flex shrink-0 justify-around border-t border-(--line) bg-white/70 px-3 pt-2 pb-5"
        aria-label="App"
      >
        {TABS.map((t) => {
          const on = screen === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setScreen(t.id)}
              aria-current={on ? "page" : undefined}
              className={`relative flex w-14 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-extrabold transition-colors ${on ? "text-(--primary)" : "text-(--soft)"}`}
            >
              {on ? (
                <motion.span
                  layoutId="sw-tab"
                  className="absolute inset-0 rounded-2xl bg-(--primary)/10"
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
                />
              ) : null}
              <svg
                className="relative size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {t.icon}
              </svg>
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </nav>
    </PhoneFrame>
  );
}

const MOODS = [
  { id: "calm", label: "Calm", mouth: "M8.5 14.5q3.5 2.6 7 0", eyes: "M8 10h1.8M14.2 10H16", rec: "focus" },
  { id: "tired", label: "Tired", mouth: "M9 15h6", eyes: "M7.8 10.5q1.2.9 2.4 0M13.8 10.5q1.2.9 2.4 0", rec: "deep" },
  {
    id: "restless",
    label: "Restless",
    mouth: "M8.5 15q1.75-1.6 3.5 0t3.5 0",
    eyes: "M8.6 10h.8M14.6 10h.8",
    rec: "breathe",
  },
  {
    id: "wired",
    label: "Wired",
    mouth: "M12 16.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z",
    eyes: "M8.4 9.6h1.2M14.4 9.6h1.2",
    rec: "calm",
  },
] as const;

function HomeScreen({ setScreen, setTrack }: { setScreen: SetScreen; setTrack: (t: Track) => void }) {
  const [mood, setMood] = useState<(typeof MOODS)[number]["id"]>("calm");
  const rec = MOODS.find((m) => m.id === mood)!.rec;
  const recTrack = TRACKS.find((t) => t.id === rec);
  const open = (t: Track) => {
    setTrack(t);
    setScreen("sleep");
  };

  return (
    <div className="px-5 pt-2">
      <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-(--soft)">
        <ConceptMark kind="wellness" size={15} />
        Stillwater
      </p>
      <p className="mt-1 text-[22px] leading-[1.15] font-extrabold tracking-[-0.01em]">
        Good evening,
        <span className="block">let’s unwind.</span>
      </p>
      <p className="mt-4 text-[10.5px] font-extrabold tracking-[0.12em] text-(--soft) uppercase">
        How are you arriving?
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {MOODS.map((m) => {
          const on = m.id === mood;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              aria-pressed={on}
              className={`flex flex-col items-center gap-1 rounded-2xl border py-2 text-[10px] font-extrabold transition-colors ${on ? "border-(--primary)/40 bg-white text-(--primary)" : "border-transparent bg-white/45 text-(--soft)"}`}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                animate={{ scale: on ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" fill={on ? "rgba(108,92,231,.1)" : "none"} />
                <path d={m.eyes} />
                <path d={m.mouth} />
              </motion.svg>
              {m.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.button
          key={rec}
          type="button"
          onClick={() => (recTrack ? open(recTrack) : setScreen("breathe"))}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="relative mt-3 flex w-full items-center gap-3 overflow-hidden rounded-[22px] p-3.5 text-left text-white shadow-[0_16px_30px_-16px_rgba(90,75,214,.8)]"
          style={{ background: recTrack?.art ?? "linear-gradient(150deg,#6C5CE7,#4F8DF0)" }}
        >
          <span className="sw-breathe-soft absolute -right-6 -bottom-10 size-28 rounded-full bg-white/15" />
          <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/20">
            {recTrack ? (
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
              </svg>
            ) : (
              <span className="size-4 rounded-full border-2 border-white" />
            )}
          </span>
          <span className="relative">
            <span className="block text-[10px] font-extrabold tracking-[0.12em] uppercase opacity-80">
              For right now
            </span>
            <span className="block text-[15px] font-extrabold">{recTrack ? recTrack.title : "Breathe 4 · 4 · 6"}</span>
            <span className="block text-[11px] font-semibold opacity-85">
              {recTrack ? `${recTrack.kind} · ${recTrack.minutes} min` : "Guided ring · 2 min"}
            </span>
          </span>
        </motion.button>
      </AnimatePresence>

      <p className="mt-4 text-[10.5px] font-extrabold tracking-[0.12em] text-(--soft) uppercase">Tonight</p>
      <ul className="mt-2 grid gap-2">
        {TRACKS.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => open(t)}
              className="flex w-full items-center gap-3 rounded-2xl border border-(--line) bg-white/70 p-2.5 text-left transition-colors hover:bg-white"
            >
              <span className="size-9 shrink-0 rounded-xl" style={{ background: t.art }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold">{t.title}</span>
                <span className="block text-[10.5px] font-semibold text-(--soft)">
                  {t.minutes} min · {t.kind.toLowerCase()}
                </span>
              </span>
              <span className="mr-1 text-[15px] text-(--soft)" aria-hidden>
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PHASES = [
  { label: "Breathe in", secs: 4, scale: 1 },
  { label: "Hold", secs: 4, scale: 1 },
  { label: "Breathe out", secs: 6, scale: 0.62 },
] as const;
const ROUNDS = 5;

type Breath = { phase: number; left: number; round: number };
const START: Breath = { phase: 0, left: PHASES[0].secs, round: 1 };
const tick = (b: Breath): Breath => {
  if (b.left > 1) return { ...b, left: b.left - 1 };
  if (b.phase < PHASES.length - 1) return { ...b, phase: b.phase + 1, left: PHASES[b.phase + 1].secs };
  return { phase: 0, left: PHASES[0].secs, round: (b.round % ROUNDS) + 1 };
};

function BreatheScreen() {
  const [running, setRunning] = useState(false);
  const [b, setB] = useState<Breath>(START);
  const phase = PHASES[b.phase];

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setB(tick), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const toggle = () => {
    setB(START);
    setRunning((r) => !r);
  };
  const r = 96;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex h-full flex-col items-center px-5 pt-1">
      <p className="text-[11.5px] font-bold text-(--soft)">In 4 · hold 4 · out 6</p>
      <p className="mt-0.5 text-[19px] font-extrabold">
        {running ? `Round ${b.round} of ${ROUNDS}` : "Breathe with the ring"}
      </p>
      <div className="relative mt-5 grid size-[220px] place-items-center">
        <svg viewBox="0 0 220 220" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(108,92,231,.14)" strokeWidth="6" />
          {running ? (
            <motion.circle
              key={`${b.round}-${b.phase}`}
              cx="110"
              cy="110"
              r={r}
              fill="none"
              stroke="#6C5CE7"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: phase.secs, ease: "linear" }}
            />
          ) : null}
        </svg>
        <motion.span
          className="absolute size-[176px] rounded-full bg-(--violet)/15"
          animate={{ scale: running ? phase.scale * 1.08 : 0.74 }}
          transition={{ duration: running ? phase.secs : 0.8, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute size-[150px] rounded-full bg-[radial-gradient(circle_at_50%_36%,#fff,#C9D3FF_68%,#AFA4F5)] shadow-[0_20px_40px_-14px_rgba(108,92,231,.6),inset_0_0_0_8px_rgba(255,255,255,.5)]"
          animate={{ scale: running ? phase.scale : 0.7 }}
          transition={{ duration: running ? phase.secs : 0.8, ease: "easeInOut" }}
        />
        <span className="relative text-center">
          <span className="block text-[15px] font-extrabold text-[#4A3FB0]" aria-live="polite">
            {running ? phase.label : "Ready"}
          </span>
          <span className="block text-[30px] leading-none font-extrabold text-[#4A3FB0] tabular-nums" aria-hidden>
            {running ? b.left : ""}
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`mt-6 w-full rounded-2xl py-3 text-[14px] font-extrabold transition-colors ${running ? "bg-white text-(--primary)" : "bg-(--primary) text-white shadow-[0_14px_28px_-14px_rgba(108,92,231,.9)]"}`}
      >
        {running ? "Stop" : "Start · 2 min"}
      </button>
      <p className="mt-3 text-center text-[11px] font-semibold text-(--soft)">
        Haptics follow the ring when your screen is off.
      </p>
    </div>
  );
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function SleepScreen({ track, setTrack }: { track: Track; setTrack: (t: Track) => void }) {
  const total = track.minutes * 60;
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(0);
  const [timer, setTimer] = useState<"off" | "15" | "30" | "45">("30");
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!playing) return;
    // fast-forwarded so the demo visibly moves: 4 s of story per 250 ms
    const id = window.setInterval(() => setAt((s) => Math.min(total, s + 4)), 250);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const next = (dir: 1 | -1) => {
    const i = TRACKS.findIndex((t) => t.id === track.id);
    setTrack(TRACKS[(i + dir + TRACKS.length) % TRACKS.length]);
  };

  return (
    <div className="px-5 pt-1">
      <div
        className="relative h-[168px] overflow-hidden rounded-[26px] shadow-[0_20px_40px_-20px_rgba(42,37,83,.6)]"
        style={{ background: track.art }}
      >
        <svg viewBox="0 0 260 168" className="absolute inset-0 size-full" aria-hidden>
          <circle cx="196" cy="52" r="24" fill="#FFF6E0" opacity=".95" />
          <circle cx="206" cy="46" r="22" fill="rgba(0,0,0,.14)" style={{ mixBlendMode: "multiply" }} />
          {[
            [40, 30],
            [92, 54],
            [140, 24],
            [60, 82],
            [228, 100],
            [120, 92],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 2 ? 1.4 : 2}
              fill="#fff"
              className="sw-twinkle"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}
          <path d="M0 132 Q 40 118 80 130 T 160 128 T 260 126 V168 H0Z" fill="rgba(255,255,255,.18)" />
          <path d="M0 146 Q 50 134 100 146 T 200 144 T 260 142 V168 H0Z" fill="rgba(255,255,255,.22)" />
        </svg>
        <span className="absolute top-3 left-3 rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.1em] text-white uppercase backdrop-blur">
          {track.kind}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[18px] leading-tight font-extrabold">{track.title}</p>
          <p className="text-[11.5px] font-semibold text-(--soft)">Narrated by Mira Holt · {track.minutes} min</p>
        </div>
        <span className="flex h-6 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full bg-(--primary) ${playing ? "sw-eq" : "h-1.5"}`}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      </div>
      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-(--primary)/15">
          <div
            className="h-full rounded-full bg-(--primary) transition-[width] duration-200 ease-linear"
            style={{ width: `${(at / total) * 100}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[10.5px] font-bold text-(--soft) tabular-nums">
          <span>{fmt(at)}</span>
          <span>−{fmt(total - at)}</span>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => next(-1)}
          aria-label="Previous"
          className="grid size-10 place-items-center rounded-full text-(--muted) hover:bg-white/60"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6 5h2v14H6zM20 5v14L9 12z" />
          </svg>
        </button>
        <motion.button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          whileTap={{ scale: 0.92 }}
          aria-label={playing ? "Pause" : "Play"}
          className="grid size-[58px] place-items-center rounded-full bg-(--primary) text-white shadow-[0_14px_28px_-12px_rgba(108,92,231,.9)]"
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </motion.button>
        <button
          type="button"
          onClick={() => next(1)}
          aria-label="Next"
          className="grid size-10 place-items-center rounded-full text-(--muted) hover:bg-white/60"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-[10.5px] font-extrabold tracking-[0.12em] text-(--soft) uppercase">Sleep timer</p>
      <div className="mt-1.5 grid grid-cols-4 gap-1 rounded-2xl bg-white/55 p-1 text-[11.5px] font-extrabold">
        {(["off", "15", "30", "45"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setTimer(v)}
            aria-pressed={timer === v}
            className="relative rounded-xl py-1.5"
          >
            {timer === v ? (
              <motion.span
                layoutId="sw-timer"
                className="absolute inset-0 rounded-xl bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            ) : null}
            <span className={`relative ${timer === v ? "text-(--primary)" : "text-(--soft)"}`}>
              {v === "off" ? "Off" : `${v}m`}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[12px] font-bold">
        <span id="sw-fade">Fade the voice as I drift off</span>
        <button
          type="button"
          role="switch"
          aria-checked={fade}
          aria-labelledby="sw-fade"
          onClick={() => setFade((f) => !f)}
          className={`flex h-6 w-10 items-center rounded-full p-1 transition-colors ${fade ? "justify-end bg-(--primary)" : "justify-start bg-(--primary)/20"}`}
        >
          <motion.span
            layout
            className="size-4 rounded-full bg-white shadow"
            transition={{ type: "spring", stiffness: 700, damping: 36 }}
          />
        </button>
      </div>
    </div>
  );
}

const WEEK = [
  { d: "M", min: 18, done: true },
  { d: "T", min: 24, done: true },
  { d: "W", min: 12, done: true },
  { d: "T", min: 30, done: true },
  { d: "F", min: 8, done: true },
  { d: "S", min: 26, done: true },
  { d: "S", min: 0, done: false },
];

function ProgressScreen() {
  const [pick, setPick] = useState(5);
  const max = Math.max(...WEEK.map((w) => w.min));
  const total = WEEK.reduce((s, w) => s + w.min, 0);
  return (
    <div className="px-5 pt-1">
      <p className="text-[11.5px] font-bold text-(--soft)">Your rhythm</p>
      <div className="mt-2 flex items-center gap-4 rounded-[24px] bg-[linear-gradient(150deg,#6C5CE7,#4F8DF0)] p-4 text-white shadow-[0_18px_34px_-18px_rgba(90,75,214,.9)]">
        <svg className="size-11 shrink-0" viewBox="0 0 24 24" fill="#FFF6E0" aria-hidden>
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        </svg>
        <div>
          <p className="text-[30px] leading-none font-extrabold">12 nights</p>
          <p className="mt-1 text-[11.5px] font-semibold opacity-85">in a row, your longest yet</p>
        </div>
      </div>
      <div className="mt-3 rounded-[24px] border border-(--line) bg-white/70 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-extrabold">This week</p>
          <p className="text-[11.5px] font-bold text-(--soft) tabular-nums">
            {WEEK[pick].min ? `${WEEK[pick].min} min` : "Tonight?"} · {total} total
          </p>
        </div>
        <div className="mt-3 flex h-[96px] items-end justify-between gap-2">
          {WEEK.map((w, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPick(i)}
              aria-label={`${w.d}: ${w.min} minutes`}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <motion.span
                className={`w-full rounded-lg ${i === pick ? "bg-(--primary)" : w.done ? "bg-(--violet)/45" : "border border-dashed border-(--violet)/50"}`}
                initial={{ height: 6 }}
                animate={{ height: `${Math.max(8, (w.min / max) * 76)}px` }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: EASE }}
              />
              <span className={`text-[10px] font-extrabold ${i === pick ? "text-(--primary)" : "text-(--soft)"}`}>
                {w.d}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[10.5px] font-extrabold tracking-[0.12em] text-(--soft) uppercase">Milestones</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          ["7", "First week", true],
          ["100", "Minutes", true],
          ["30", "Nights", false],
        ].map(([n, l, got]) => (
          <div
            key={String(l)}
            className={`rounded-2xl p-2.5 text-center ${got ? "bg-white/80" : "border border-dashed border-(--violet)/40"}`}
          >
            <p className={`text-[18px] font-extrabold ${got ? "text-(--primary)" : "text-(--soft)"}`}>{n}</p>
            <p className="text-[10px] font-bold text-(--soft)">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- pricing + closing ---------- */

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="sw-pricing" className="scroll-mt-16 px-[clamp(18px,5vw,64px)] py-[clamp(56px,9vw,110px)]">
      <div className="text-center">
        <p className="text-[12.5px] font-extrabold tracking-[0.14em] text-(--primary) uppercase">Pricing</p>
        <h2 className="mx-auto mt-3 max-w-[26rem] text-[clamp(28px,3.6vw,42px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
          Free to start. Plus when you’re ready.
        </h2>
        <div
          className="mt-7 inline-flex rounded-full bg-white/70 p-1 text-[13px] font-extrabold"
          role="radiogroup"
          aria-label="Billing"
        >
          {[
            [false, "Monthly"],
            [true, "Yearly · save 40%"],
          ].map(([v, l]) => (
            <button
              key={String(l)}
              type="button"
              role="radio"
              aria-checked={yearly === v}
              onClick={() => setYearly(v as boolean)}
              className="relative rounded-full px-4 py-2"
            >
              {yearly === v ? (
                <motion.span
                  layoutId="sw-bill"
                  className="absolute inset-0 rounded-full bg-(--primary)"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null}
              <span className={`relative ${yearly === v ? "text-white" : "text-(--muted)"}`}>{l}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-[760px] gap-4 sm:grid-cols-2">
        <div className="rounded-[28px] border border-(--line) bg-white/60 p-7">
          <p className="text-[15px] font-extrabold">Free</p>
          <p className="mt-3 text-[40px] leading-none font-extrabold">$0</p>
          <p className="mt-1 text-[13px] font-semibold text-(--muted)">forever</p>
          <ul className="mt-6 grid gap-2.5 text-[14px] font-semibold text-(--muted)">
            {["The breathing ring", "3 sleep stories", "Daily check-in"].map((f) => (
              <li key={f} className="flex gap-2.5">
                <span className="text-(--primary)">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(155deg,#6C5CE7,#4F8DF0)] p-7 text-white shadow-[0_30px_60px_-30px_rgba(90,75,214,.9)]">
          <span className="sw-breathe-soft absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
          <p className="relative flex items-center justify-between text-[15px] font-extrabold">
            Plus{" "}
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] tracking-[0.08em] uppercase">
              Most loved
            </span>
          </p>
          <div className="relative mt-3 h-10 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={String(yearly)}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="text-[40px] leading-none font-extrabold tabular-nums"
              >
                {yearly ? "$4.17" : "$6.99"}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="relative mt-1 text-[13px] font-semibold opacity-85">
            {yearly ? "a month, billed $49.99 yearly" : "a month, cancel anytime"}
          </p>
          <ul className="relative mt-6 grid gap-2.5 text-[14px] font-semibold">
            {["Everything in Free", "200+ stories & soundscapes", "Fade-out sleep timer", "Offline listening"].map(
              (f) => (
                <li key={f} className="flex gap-2.5">
                  <span>✓</span>
                  {f}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section id="sw-get" className="scroll-mt-16 px-[clamp(18px,5vw,64px)] pb-10">
      <div className="relative overflow-hidden rounded-[36px] bg-(--ink) px-[clamp(24px,5vw,64px)] py-[clamp(40px,6vw,72px)] text-white">
        <span className="sw-breathe absolute -right-20 -bottom-24 size-[220px] rounded-full opacity-70 sm:top-1/2 sm:right-[8%] sm:bottom-auto sm:size-[260px] sm:-translate-y-1/2 sm:opacity-100 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,.9),rgba(185,198,255,.55)_55%,rgba(142,125,240,0)_72%)]" />
        <p className="relative text-[12.5px] font-extrabold tracking-[0.14em] text-(--lilac) uppercase">Tonight</p>
        <p className="relative mt-3 max-w-[22rem] text-[clamp(28px,3.6vw,44px)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          Try four minutes before bed.
        </p>
        <p className="relative mt-3 max-w-[26rem] text-[15px] leading-relaxed text-white/70">
          No account needed for the breathing ring. Stories unlock with a free sign-up.
        </p>
        <div className="relative mt-7">
          <StoreButtons dark={false} />
        </div>
      </div>
    </section>
  );
}
