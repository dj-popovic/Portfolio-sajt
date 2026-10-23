"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
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

/** "21:14 in Novi Sad — probably still building", on the studio's clock. */
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
    <span className="f-status">
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
  return (
    <button className="f-top-btn" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      {label}
      <span className="arr" aria-hidden>
        ↑
      </span>
    </button>
  );
}
