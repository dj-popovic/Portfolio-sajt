"use client";

import type { ComponentProps, ReactNode } from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { tiltLeave, tiltMove } from "@/lib/tilt";
import { ADDONS, type PackageKey } from "@/lib/brief";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

// Package card shell: the server renders its content, this adds the pointer tilt.
export function PackageCard(props: ComponentProps<"article">) {
  return <article {...props} onPointerMove={(e) => tiltMove(e, 4)} onPointerLeave={tiltLeave} />;
}

// Package button: remembers the choice, then the anchor scrolls to Contact.
export function PackageButton({ pkg, children }: { pkg: PackageKey; children: ReactNode }) {
  const { choosePackage } = useBrief();
  return (
    <a className="pkg-btn" href="#contact" onClick={() => choosePackage(pkg)} data-package={pkg}>
      {children}
    </a>
  );
}

export function AddonChips({ labels }: { labels: Record<(typeof ADDONS)[number], string> }) {
  const { addons, toggleAddon } = useBrief();
  return (
    <div className="addon-chips">
      {ADDONS.map((key) => {
        const on = addons.includes(key);
        return (
          <button
            key={key}
            type="button"
            className="chip"
            aria-pressed={on}
            onClick={() => toggleAddon(key)}
            data-addon={key}
          >
            <span className="ico" aria-hidden>
              <PlusIcon className="x-add" />
              <CheckIcon className="x-on" size={11} />
            </span>
            {labels[key]}
          </button>
        );
      })}
    </div>
  );
}
