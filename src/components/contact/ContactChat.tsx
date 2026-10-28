"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { stirDots } from "@/components/canvas/ContactParticles";
import { INK_DELAY } from "@/components/contact/BriefCard";
import { FounderLenses } from "@/components/contact/lenses";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  CONTACT_ENDPOINT,
  CONTACT_STEPS,
  EMAIL_PATTERN,
  LIMITS,
  type ContactPayload,
  type ContactResponse,
  type ContactStep,
} from "@/lib/contact";
import { flyDots, pointIn } from "@/lib/flight";
import { PLACEHOLDER } from "@/lib/placeholders";
import { richDark } from "@/lib/rich";

const EASE = [0.25, 1, 0.5, 1] as const;
// how long we "type" before a message of ours lands (s)
const TYPING = 0.6;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = () => window.matchMedia("(max-width: 920px)").matches;

function isValid(step: ContactStep, value: string) {
  const v = value.trim();
  if (step === "email") return EMAIL_PATTERN.test(v);
  if (step === "project") return v.length >= 3;
  if (step === "timeline") return v.length >= 2;
  return v.length >= 1;
}

type Item =
  | { id: string; who: "us"; body: ReactNode; hint?: string; hintId?: string }
  | { id: string; who: "you"; step: ContactStep; text: string };

/**
 * Contact as a conversation with the two of us: our questions arrive in glass bubbles
 * after a moment of typing, your answers stay in the thread as ember bubbles (tap one
 * to change it), and each answer flies into the brief beside it (BriefCard). The quick
 * replies take the number keys. Same questions and backend as ever.
 */
export function ContactChat() {
  const t = useTranslations("contact");
  const tf = useTranslations("fit");
  const ta = useTranslations("about.people");
  const locale = useLocale();
  const { pkg, addons, answers, status, arriving, setAnswer, setStatus, choosePackage, removeAddon, reset } =
    useBrief();

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [showError, setShowError] = useState(false);
  const [failed, setFailed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const interacted = useRef(false);

  const step = CONTACT_STEPS[index];
  const sending = status === "sending";
  const done = status === "done";
  const chips = step === "timeline" && !done ? (t.raw("steps.timeline.chips") as string[]) : [];
  const errorId = `chat-err-${step}`;

  // the thread, as it stands: our questions so far, your answers to them
  const items = useMemo(() => {
    const list: Item[] = [{ id: "hello", who: "us", body: t.rich("founders", richDark) }];
    const answered = status === "editing" ? index : CONTACT_STEPS.length;
    CONTACT_STEPS.slice(0, index + 1).forEach((s, i) => {
      list.push({
        id: `q-${s}`,
        who: "us",
        body: t(`steps.${s}.ask`),
        hint: t(`steps.${s}.hint`),
        hintId: `chat-hint-${s}`,
      });
      if (i < answered) list.push({ id: `a-${s}`, who: "you", step: s, text: answers[s] });
    });
    if (status === "done") list.push({ id: "done", who: "us", body: t("done.ask"), hint: t("done.hint") });
    return list;
  }, [t, index, answers, status]);

  // ours arrive one at a time after a moment of typing; yours show at once. The server and
  // the first paint show the thread as it stands; off screen at first, it waits to be seen.
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(() => new Set(items.map((it) => it.id)));
  const [live, setLive] = useState(true);
  const motionOk = typeof window !== "undefined" && !reduced();
  // the first of ours not out yet: we're typing it, and the thread shows what comes before
  const pending = motionOk ? items.findIndex((it) => it.who === "us" && !revealed.has(it.id)) : -1;
  const visible = !live ? [] : pending < 0 ? items : items.slice(0, pending);
  const typing = live && pending >= 0;
  const next = pending >= 0 ? items[pending].id : null;

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    // hold the opening messages back until the conversation is in view
    let io: IntersectionObserver | null = null;
    const raf = requestAnimationFrame(() => {
      setRevealed(new Set());
      setLive(false);
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setLive(true);
          io?.disconnect();
        },
        { threshold: 0.3 },
      );
      io.observe(el);
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!live || !next) return;
    const id = window.setTimeout(
      () => setRevealed((r) => new Set(r).add(next)),
      TYPING * 1000 * (next === "hello" ? 1.2 : 1),
    );
    return () => window.clearTimeout(id);
  }, [live, next]);

  // the thread keeps its latest message in view
  useLayoutEffect(() => {
    const el = thread.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: interacted.current && !reduced() ? "smooth" : "auto" });
  }, [visible.length, typing]);

  // move focus with the conversation, but never on first paint
  useEffect(() => {
    if (interacted.current && status === "editing") field.current?.focus({ preventScroll: true });
  }, [index, status]);

  // a growing field for the longer answer
  useLayoutEffect(() => {
    const el = field.current;
    if (!el || el.tagName !== "TEXTAREA") return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [draft, step]);

  async function submit(final: Record<ContactStep, string>) {
    setStatus("sending");
    setFailed(false);
    const payload: ContactPayload = {
      name: final.name.trim(),
      project: final.project.trim(),
      timeline: final.timeline.trim(),
      email: final.email.trim(),
      package: pkg,
      addons,
      locale,
      company: honeypot,
    };
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as ContactResponse | null;
      if (!res.ok || !data?.ok) throw new Error("send failed");
      setStatus("done");
    } catch {
      setStatus("editing");
      setFailed(true);
    }
  }

  // the answer's dots fly from the field into its row of the brief
  function flyToBrief(s: ContactStep) {
    if (reduced() || compact()) return;
    const from = field.current;
    const row = document.querySelector(`[data-brief-row="${s}"] dd`);
    if (!from || !row) return;
    const start = pointIn(from, 0.25, 0.5);
    void flyDots(start, () => (row.isConnected ? pointIn(row, 0.2, 0.5) : null), { duration: INK_DELAY });
  }

  function advance(override?: string) {
    interacted.current = true;
    if (sending || done) return;
    const value = (override ?? draft).trim();
    if (!isValid(step, value)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setFailed(false);
    setAnswer(step, value);
    flyToBrief(step);
    if (index < CONTACT_STEPS.length - 1) {
      setIndex(index + 1);
      setDraft(answers[CONTACT_STEPS[index + 1]]);
      return;
    }
    void submit({ ...answers, [step]: value });
  }

  // tap one of your answers to change it: the conversation goes back to that question
  function edit(s: ContactStep) {
    if (status !== "editing") return;
    interacted.current = true;
    setShowError(false);
    setIndex(CONTACT_STEPS.indexOf(s));
    setDraft(answers[s]);
  }

  function startOver() {
    interacted.current = true;
    reset();
    setIndex(0);
    setDraft("");
    setFailed(false);
    setShowError(false);
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    advance();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // quick replies take the number keys while the field is empty
    if (chips.length && !draft && /^[1-9]$/.test(e.key) && Number(e.key) <= chips.length) {
      e.preventDefault();
      advance(chips[Number(e.key) - 1]);
      return;
    }
    if (e.currentTarget.tagName === "TEXTAREA" && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      advance();
    }
  };

  const onChange = (value: string) => {
    setDraft(value);
    if (showError) setShowError(false);
    // the dots behind lean in and glow while you type
    const r = field.current?.getBoundingClientRect();
    if (r && !reduced()) stirDots(r.left + r.width * 0.3, r.top + r.height / 2);
  };

  // a soft light follows the pointer across the glass
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    e.currentTarget.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };

  const current = String(done ? CONTACT_STEPS.length : index + 1).padStart(2, "0");
  // the header: the two names, the role under them ("names · role" in every language)
  const [who, role] = t("foundersMeta", { nameOne: PLACEHOLDER.nameOne, nameTwo: PLACEHOLDER.nameTwo }).split(" · ");
  const today = useMemo(() => {
    const s = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "day");
    return s.charAt(0).toLocaleUpperCase(locale) + s.slice(1);
  }, [locale]);
  const fieldProps = {
    id: `chat-${step}`,
    name: step,
    placeholder: t(`steps.${step}.placeholder`),
    "aria-label": t(`steps.${step}.ask`),
    "aria-describedby": showError ? `chat-hint-${step} ${errorId}` : `chat-hint-${step}`,
    "aria-invalid": showError || undefined,
    maxLength: LIMITS[step],
    value: draft,
    disabled: sending,
    onKeyDown,
  };

  return (
    <div className="convo chat" ref={root} onPointerMove={onPointerMove} data-reveal-item>
      <header className="chat-head">
        <FounderLenses
          size="sm"
          one={`${PLACEHOLDER.nameOne}, ${ta("one.role")}`}
          two={`${PLACEHOLDER.nameTwo}, ${ta("two.role")}`}
        />
        <span className="chat-who">
          <b>{who}</b>
          {role ? <span>{role}</span> : null}
        </span>
        <span className="chat-steps">
          <span className="convo-step">
            {t.rich("step", {
              current,
              total: String(CONTACT_STEPS.length).padStart(2, "0"),
              // the step number rolls over like a counter
              b: () => (
                <b className="convo-n">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.32, ease: EASE }}
                    >
                      {current}
                    </motion.span>
                  </AnimatePresence>
                </b>
              ),
            })}
          </span>
          <span className="convo-progress" aria-hidden>
            {CONTACT_STEPS.map((s, i) => (
              <i key={s} className={done || i < index ? "done" : i === index ? "on" : undefined} />
            ))}
          </span>
        </span>
      </header>

      {/* phones: what was picked in Find your fit rides along up here (its ticket lands on it) */}
      {pkg || addons.length ? (
        <div className="chat-pins" data-dock="start-compact" data-arriving={arriving || undefined}>
          {pkg ? (
            <span className="brief-chip is-pkg">
              <span className="chat-pins-label">{t("attached")}:</span> {tf(`packages.${pkg}.name`)}
              {!done ? (
                <button
                  type="button"
                  onClick={() => choosePackage(null)}
                  aria-label={`${t("removeAttachment")}: ${tf(`packages.${pkg}.name`)}`}
                >
                  <CloseIcon size={10} />
                </button>
              ) : null}
            </span>
          ) : null}
          {addons.map((a) => (
            <span key={a} className="brief-chip">
              + {tf(`addons.items.${a}`)}
              {!done ? (
                <button
                  type="button"
                  onClick={() => removeAddon(a)}
                  aria-label={`${t("removeAttachment")}: ${tf(`addons.items.${a}`)}`}
                >
                  <CloseIcon size={10} />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      {/* once sent the answers aren't buttons any more: the thread takes focus itself, so keys still scroll it */}
      <div
        className="chat-thread"
        ref={thread}
        data-lenis-prevent
        role="region"
        aria-label={t("chat.log")}
        tabIndex={done ? 0 : undefined}
      >
        <ol className="chat-list" aria-live="polite" aria-relevant="additions">
          <li className="chat-day" aria-hidden>
            {today}
          </li>
          <AnimatePresence initial={false}>
            {visible.map((item, i) =>
              item.who === "us" ? (
                <motion.li
                  key={item.id}
                  className={cn("msg us", visible[i - 1]?.who !== "us" && "is-first")}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.34, ease: EASE }}
                >
                  {visible[i - 1]?.who !== "us" ? (
                    <FounderLenses size="xs" one={PLACEHOLDER.nameOne} two={PLACEHOLDER.nameTwo} />
                  ) : null}
                  <span className="bubble">
                    <span className="bubble-text">{item.body}</span>
                    {item.hint ? (
                      <span className="bubble-hint" id={item.hintId}>
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                </motion.li>
              ) : (
                <motion.li
                  key={item.id}
                  className="msg you"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <button
                    type="button"
                    className="bubble"
                    onClick={() => edit(item.step)}
                    disabled={status !== "editing"}
                    aria-label={t("chat.edit", { answer: item.text })}
                  >
                    {item.text}
                  </button>
                </motion.li>
              ),
            )}
            {typing ? (
              <motion.li
                key="typing"
                className="msg us is-typing"
                aria-hidden
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.2 }}
              >
                <span className="bubble">
                  <i />
                  <i />
                  <i />
                </span>
              </motion.li>
            ) : null}
          </AnimatePresence>
        </ol>
      </div>

      {done ? (
        <div className="chat-done">
          <button type="button" className="chat-again" onClick={startOver}>
            {t("startOver")}
          </button>
        </div>
      ) : (
        <form className="chat-compose" onSubmit={onSubmit} noValidate>
          {chips.length ? (
            <div className="chat-quick">
              {chips.map((c, i) => (
                <button key={c} type="button" onClick={() => advance(c)} disabled={sending}>
                  <span className="chat-key" aria-hidden>
                    {i + 1}
                  </span>
                  {c}
                </button>
              ))}
            </div>
          ) : null}
          {showError ? (
            <p id={errorId} className="chat-error" role="alert">
              {t(`steps.${step}.error`)}
            </p>
          ) : null}
          {failed ? (
            <p className="chat-error" role="alert">
              {t("failed")}
            </p>
          ) : null}
          <div className="chat-field">
            {step === "project" ? (
              <textarea ref={field} rows={1} {...fieldProps} onChange={(e) => onChange(e.target.value)} />
            ) : (
              <input
                ref={field}
                type={step === "email" ? "email" : "text"}
                inputMode={step === "email" ? "email" : "text"}
                autoComplete={step === "name" ? "given-name" : step === "email" ? "email" : "off"}
                {...fieldProps}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
            <button type="submit" className="chat-send btn-ember" disabled={sending}>
              <span>{sending ? t("sending") : index === CONTACT_STEPS.length - 1 ? t("send") : t("next")}</span>
              <span className="kbd" aria-hidden>
                ↵
              </span>
            </button>
          </div>
          {/* honeypot: hidden from people, tempting to bots */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="absolute -left-[9999px] h-px w-px opacity-0"
            aria-hidden
          />
        </form>
      )}
    </div>
  );
}
