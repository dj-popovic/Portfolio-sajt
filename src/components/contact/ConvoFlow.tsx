"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { BackIcon, CloseIcon } from "@/components/ui/icons";
import { CONTACT_ENDPOINT, EMAIL_PATTERN, LIMITS, type ContactPayload, type ContactResponse } from "@/lib/contact";

const STEPS = ["name", "project", "timeline", "email"] as const;
type StepKey = (typeof STEPS)[number];
type Status = "editing" | "sending" | "done";

const EASE = [0.25, 1, 0.5, 1] as const;

function isValid(step: StepKey, value: string) {
  const v = value.trim();
  if (step === "email") return EMAIL_PATTERN.test(v);
  if (step === "project") return v.length >= 3;
  if (step === "timeline") return v.length >= 2;
  return v.length >= 1;
}

export function ConvoFlow() {
  const t = useTranslations("contact");
  const tf = useTranslations("fit");
  const locale = useLocale();
  const { pkg, addons, choosePackage, removeAddon, reset } = useBrief();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<StepKey, string>>({ name: "", project: "", timeline: "", email: "" });
  const [status, setStatus] = useState<Status>("editing");
  const [showError, setShowError] = useState(false);
  const [failed, setFailed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const interacted = useRef(false);

  const step = STEPS[index];
  const value = answers[step];
  const last = index === STEPS.length - 1;
  const chips = step === "timeline" ? (t.raw("steps.timeline.chips") as string[]) : [];

  // move focus with the conversation, but never on first paint
  useEffect(() => {
    if (interacted.current && status === "editing") inputRef.current?.focus({ preventScroll: true });
  }, [index, status]);

  function setValue(v: string) {
    setAnswers((a) => ({ ...a, [step]: v }));
    if (showError) setShowError(false);
  }

  async function submit(final: Record<StepKey, string>) {
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

  function advance(override?: string) {
    interacted.current = true;
    const current = override ?? value;
    if (override !== undefined) setAnswers((a) => ({ ...a, [step]: override }));
    if (!isValid(step, current)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (!last) {
      setIndex((i) => i + 1);
      return;
    }
    void submit({ ...answers, [step]: current });
  }

  function back() {
    interacted.current = true;
    setShowError(false);
    setFailed(false);
    if (status === "done") {
      setAnswers({ name: "", project: "", timeline: "", email: "" });
      reset();
      setStatus("editing");
      setIndex(0);
      return;
    }
    setIndex((i) => Math.max(0, i - 1));
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    advance();
  };

  const done = status === "done";
  const errorId = `convo-err-${step}`;

  return (
    <form className="convo" id="convo" onSubmit={onSubmit} noValidate aria-live="polite" data-reveal-item>
      <div className="convo-head">
        <span className="convo-step">
          {t.rich("step", {
            current: String(done ? STEPS.length : index + 1).padStart(2, "0"),
            total: String(STEPS.length).padStart(2, "0"),
            b: (c) => <b>{c}</b>,
          })}
        </span>
        <div className="convo-progress" aria-hidden>
          {STEPS.map((s, i) => (
            <i key={s} className={done || i < index ? "done" : i === index ? "on" : undefined} />
          ))}
        </div>
      </div>

      {(pkg || addons.length > 0) && !done ? (
        <div className="relative z-[1] -mt-2 mb-6 flex flex-wrap items-center gap-2" data-attachments>
          {pkg ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-ember/45 bg-ember/10 py-1.5 pr-1.5 pl-3 text-[12.5px] font-medium text-cream">
              <span className="text-cream/60">{t("attached")}:</span> {tf(`packages.${pkg}.name`)}
              <button
                type="button"
                onClick={() => choosePackage(null)}
                className="grid size-5 place-items-center rounded-full text-cream/60 transition-colors hover:bg-cream/10 hover:text-cream"
                aria-label={`${t("removeAttachment")}: ${tf(`packages.${pkg}.name`)}`}
              >
                <CloseIcon size={11} />
              </button>
            </span>
          ) : null}
          {addons.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/6 py-1.5 pr-1.5 pl-3 text-[12.5px] font-medium text-cream/80"
            >
              + {tf(`addons.items.${a}`)}
              <button
                type="button"
                onClick={() => removeAddon(a)}
                className="grid size-5 place-items-center rounded-full text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
                aria-label={`${t("removeAttachment")}: ${tf(`addons.items.${a}`)}`}
              >
                <CloseIcon size={11} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="convo-body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={done ? "done" : step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            // the old question leaves fast, so the next one is there within ~0.4s
            exit={{ opacity: 0, y: -6, transition: { duration: 0.14, ease: EASE } }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <span className="convo-q">
              <span className="qdot" aria-hidden />
              <span>{done ? t("done.q") : t(`steps.${step}.q`)}</span>
            </span>
            <h3 className="convo-ask">{done ? t("done.ask") : t(`steps.${step}.ask`)}</h3>
            <p className="convo-hint">{done ? t("done.hint") : t(`steps.${step}.hint`)}</p>

            {!done ? (
              <>
                <div className="convo-field">
                  <input
                    ref={inputRef}
                    id={`convo-${step}`}
                    name={step}
                    type={step === "email" ? "email" : "text"}
                    inputMode={step === "email" ? "email" : "text"}
                    autoComplete={step === "name" ? "given-name" : step === "email" ? "email" : "off"}
                    placeholder={t(`steps.${step}.placeholder`)}
                    aria-label={t(`steps.${step}.ask`)}
                    aria-invalid={showError || undefined}
                    aria-describedby={showError ? errorId : undefined}
                    maxLength={LIMITS[step]}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={status === "sending"}
                  />
                  <span className="underglow" aria-hidden />
                </div>
                {showError ? (
                  <p id={errorId} className="mt-3 text-[13.5px] text-amber" role="alert">
                    {t(`steps.${step}.error`)}
                  </p>
                ) : null}
                {chips.length ? (
                  <div className="convo-chips">
                    {chips.map((c) => (
                      <button key={c} type="button" aria-pressed={value === c} onClick={() => advance(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                ) : null}
                {failed ? (
                  <p className="mt-4 text-[13.5px] text-amber" role="alert">
                    {t("failed")}
                  </p>
                ) : null}
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
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

      <div className="convo-foot">
        <button type="button" className="convo-back" onClick={back} disabled={!done && index === 0}>
          {!done ? <BackIcon /> : null}
          {done ? t("startOver") : t("back")}
        </button>
        {!done ? (
          <button type="submit" className="convo-next btn-ember" disabled={status === "sending"}>
            <span>{status === "sending" ? t("sending") : last ? t("send") : t("next")}</span>
            <span className="kbd" aria-hidden>
              ↵
            </span>
          </button>
        ) : null}
      </div>
    </form>
  );
}
