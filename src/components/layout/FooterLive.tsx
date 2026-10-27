"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useScroll } from "@/components/motion/SmoothScroll";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { STUDIO_TIME_ZONE } from "@/lib/placeholders";

const timeParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: STUDIO_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// minutes since midnight on the studio's clock (a primitive, so snapshots compare cheaply)
function studioMinutes() {
  const parts = timeParts.formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function subscribeClock(onChange: () => void) {
  const id = window.setInterval(onChange, 15000);
  return () => window.clearInterval(id);
}

const noopSubscribe = () => () => {};

/** "21:14 in Novi Sad, probably still building", on the studio's clock. */
export function StudioStatus() {
  const t = useTranslations("footer");
  const moods = t.raw("moods") as string[];
  // -1 on the server: the time is only known in the browser
  const minutes = useSyncExternalStore(subscribeClock, studioMinutes, () => -1);

  const known = minutes >= 0;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const time = known ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` : "--:--";
  const mood = !known ? moods[0] : hour >= 1 && hour < 6 ? t("moodNight") : moods[minute % moods.length];

  return (
    <span className="f-status glass">
      <span className="pulse" aria-hidden />
      <span>
        {t.rich("status", {
          time,
          mood,
          b: (c) => <b>{c}</b>,
          city: (c) => <span className="city">{c}</span>,
        })}
      </span>
    </span>
  );
}

export function CopyrightYear() {
  const year = useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => 2026,
  );
  return <>{year}</>;
}

export function BackToTop({ label }: { label: string }) {
  const scroll = useScroll();
  // one long glide back up, then focus lands at the top too (keyboard users start over from the nav)
  const toTop = () =>
    scroll.scrollTo(0, {
      duration: 2.2,
      onComplete: () => document.querySelector<HTMLElement>(".nav-logo")?.focus({ preventScroll: true }),
    });
  return (
    <button className="f-top-btn glass" type="button" onClick={toTop}>
      {label}
      <span className="arr" aria-hidden>
        ↑
      </span>
    </button>
  );
}

/** Copies the studio's address, and says so for a moment. */
export function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("footer");
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return; // no clipboard (an insecure page, a denied permission): the link still mails
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button className="f-copy glass" type="button" onClick={copy} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={copied ? "done" : "copy"}
          className="f-copy-in"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
        >
          {copied ? <CheckIcon size={15} /> : <CopyIcon />}
          {copied ? t("copied") : t("copy")}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
