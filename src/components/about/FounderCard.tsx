"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { FounderDialog } from "@/components/about/FounderDialog";
import { IconSphere } from "@/components/about/IconSphere";
import { PlusIcon } from "@/components/ui/icons";
import { FOUNDERS, type FounderId } from "@/lib/founders";
import { tiltLeave, tiltMove } from "@/lib/tilt";
import { cn } from "@/lib/cn";

/**
 * One of the two people, as a dark 3D card: their tools turning on a sphere,
 * the name and role in front, a light that follows the pointer. The whole
 * card is a button that opens the full profile.
 */
export function FounderCard({ id }: { id: FounderId }) {
  const t = useTranslations("about");
  const founder = FOUNDERS[id];
  const role = t(`people.${id}.role`);
  const card = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const closed = useCallback(() => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={cn("founder", `founder-${founder.side}`)}>
      <article
        ref={card}
        className={cn("fcard", open && "is-open")}
        data-sphere-host
        onPointerMove={(e) => tiltMove(e, 8)}
        onPointerLeave={tiltLeave}
      >
        <div className="fcard-shell" aria-hidden />
        <span className="fcard-sheen" aria-hidden />
        <IconSphere stack={founder.stack} className="fcard-sphere" />
        <div className="fcard-meta">
          <h3 className="fcard-name">{founder.name}</h3>
          <p className="fcard-role">{role}</p>
        </div>
        <span className="fcard-plus" aria-hidden>
          <PlusIcon />
        </span>
        <button
          ref={button}
          type="button"
          className="fcard-btn"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t("card.open", { name: founder.name, role })}
          onClick={() => setOpen(true)}
        />
      </article>
      {open ? <FounderDialog founder={founder} origin={card} onClosed={closed} /> : null}
    </div>
  );
}
