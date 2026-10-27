"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { useBrief } from "@/components/brief/BriefProvider";
import { tiltLeave, tiltMove } from "@/lib/tilt";
import { ADDONS, type PackageKey } from "@/lib/brief";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

// Package card shell: the server renders its content, this adds the pointer tilt.
export function PackageCard(props: ComponentProps<"article">) {
  return <article {...props} onPointerMove={(e) => tiltMove(e, 3)} onPointerLeave={tiltLeave} />;
}

// Package button: remembers the choice, then the anchor scrolls to Contact. The add-ons
// picked below show on it as "+2", so it's clear they come along.
export function PackageButton({ pkg, children }: { pkg: PackageKey; children: ReactNode }) {
  const { choosePackage, addons } = useBrief();
  return (
    <a className="pkg-btn" href="#contact" onClick={() => choosePackage(pkg)} data-package={pkg}>
      {children}
      <AnimatePresence initial={false}>
        {addons.length ? (
          <motion.span
            key="more"
            className="pkg-more"
            aria-hidden
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", bounce: 0.45, duration: 0.4 }}
          >
            +{addons.length}
          </motion.span>
        ) : null}
      </AnimatePresence>
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
