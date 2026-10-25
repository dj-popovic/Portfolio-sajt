"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Language dropdown: the current code on a glass button, each language in its own name inside. */
export function LangMenu({ locale, className }: { locale: Locale; className?: string }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const items = () => Array.from(root.current?.querySelectorAll<HTMLAnchorElement>("[data-lang-item]") ?? []);
  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  // outside click or focus leaving the menu closes it
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close(true);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    if (!open) {
      setOpen(true);
      // focus lands once the list has rendered
      requestAnimationFrame(() => (e.key === "ArrowUp" ? items().at(-1) : items()[0])?.focus());
      return;
    }
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? list.length - 1
          : (i + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
    list[next]?.focus();
  };

  return (
    <div ref={root} className={cn("lang-menu", className)} onKeyDown={onKeyDown}>
      <button
        ref={button}
        type="button"
        className="lang-btn glass"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("languageCurrent", { name: tc(`languages.${locale}`) })}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span className="code">{locale.toUpperCase()}</span>
        <ChevronDownIcon className="chev" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            className="lang-list glass"
            aria-label={t("language")}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: EASE } }}
            exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12, ease: EASE } }}
            style={{ transformOrigin: "top right" }}
          >
            {routing.locales.map((code) => (
              <li key={code}>
                {/* no prefetch: opening the menu would fetch and parse three whole pages
                    while it animates (a switch is rare; it can fetch on click) */}
                <Link
                  href="/"
                  locale={code}
                  lang={code}
                  prefetch={false}
                  data-lang-item
                  aria-current={code === locale ? "true" : undefined}
                  onClick={() => close()}
                >
                  <span className="nm">{tc(`languages.${code}`)}</span>
                  <span className="code">{code.toUpperCase()}</span>
                  <span className="tick" aria-hidden>
                    {code === locale ? <CheckIcon /> : null}
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
