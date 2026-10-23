"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { BurgerIcon, CloseIcon } from "@/components/ui/icons";
import { PLACEHOLDER } from "@/lib/placeholders";

const SECTIONS = ["about", "services", "work", "process"] as const;

export function Nav() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="site-nav" aria-label="Primary">
        <a href="#top" className="nav-logo" aria-label={tc("logoAria")}>
          <span className="logo-mark" aria-hidden>
            ★
          </span>
          <span className="ph">{PLACEHOLDER.logo}</span>
        </a>

        <div className="nav-links">
          {SECTIONS.map((id) => (
            <a key={id} href={`#${id}`}>
              {t(id)}
            </a>
          ))}
        </div>

        <div className="nav-right">
          <div className="lang" role="group" aria-label={t("language")}>
            {routing.locales.map((code, i) => (
              <span key={code} className={code === locale ? "lang-current" : "lang-rest"}>
                {i > 0 ? (
                  <span className="dotsep lang-rest" aria-hidden>
                    ·{" "}
                  </span>
                ) : null}
                <Link
                  href="/"
                  locale={code}
                  aria-current={code === locale ? "true" : undefined}
                  lang={code}
                  title={tc(`languages.${code}`)}
                >
                  {code.toUpperCase()}
                </Link>
              </span>
            ))}
          </div>

          <a href="#contact" className="nav-cta btn-ember">
            {t("cta")}
          </a>

          <button
            type="button"
            className="nav-burger"
            aria-label={t("menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <BurgerIcon />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? <MobileMenu locale={locale} onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button, a")?.focus();
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel) return;
      // keep focus inside the sheet
      const items = panel.querySelectorAll<HTMLElement>("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      previous?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
      className="fixed inset-0 z-[100] flex flex-col bg-base/95 px-gutter pt-7 pb-10 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="flex items-center justify-between">
        <span className="nav-logo">
          <span className="logo-mark h-[30px] w-[30px] rounded-[9px] text-[10px]" aria-hidden>
            ★
          </span>
          <span className="ph">{PLACEHOLDER.logo}</span>
        </span>
        <button type="button" className="nav-burger !grid" aria-label={t("close")} onClick={onClose}>
          <CloseIcon size={16} />
        </button>
      </div>

      <motion.ul
        className="mt-14 flex flex-col gap-2"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
      >
        {SECTIONS.map((id) => (
          <motion.li
            key={id}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
            }}
          >
            <a
              href={`#${id}`}
              onClick={onClose}
              className="block py-2 font-display text-[2rem] font-semibold tracking-[-0.02em] text-cream"
            >
              {t(id)}
            </a>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-auto">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/58">
          {t("language")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {routing.locales.map((code) => (
            <Link
              key={code}
              href="/"
              locale={code}
              lang={code}
              onClick={onClose}
              aria-current={code === locale ? "true" : undefined}
              className={
                code === locale
                  ? "rounded-2xl border border-ember/50 bg-ember/10 px-4 py-3 text-[15px] font-semibold text-cream"
                  : "rounded-2xl border border-cream/12 px-4 py-3 text-[15px] font-medium text-cream/70"
              }
            >
              {tc(`languages.${code}`)}
            </Link>
          ))}
        </div>
        <a
          href="#contact"
          onClick={onClose}
          className="btn-ember mt-6 flex w-full items-center justify-center rounded-full px-6 py-4 text-[16px] font-semibold"
        >
          {t("cta")}
        </a>
      </div>
    </motion.div>
  );
}
