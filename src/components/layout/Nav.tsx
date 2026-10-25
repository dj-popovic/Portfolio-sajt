"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScroll } from "@/components/motion/SmoothScroll";
import { LangMenu } from "@/components/layout/LangMenu";
import { ScrollTrigger } from "@/lib/gsap";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { BurgerIcon, CloseIcon } from "@/components/ui/icons";
import { overlay } from "@/lib/overlay";
import { PLACEHOLDER } from "@/lib/placeholders";

const SECTIONS = ["about", "services", "work", "process"] as const;
type Section = (typeof SECTIONS)[number];

/** The section under the middle of the screen (the pinned About included), or null in the hero and after Process. */
function useActiveSection() {
  const [active, setActive] = useState<Section | null>(null);
  useEffect(() => {
    let raf = 0;
    const spy = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let current: Section | null = null;
      for (const id of SECTIONS) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top <= line && r.bottom > line) current = id;
      }
      setActive(current);
    };
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: () => {
        if (!raf) raf = requestAnimationFrame(spy);
      },
    });
    spy();
    return () => {
      cancelAnimationFrame(raf);
      st.kill();
    };
  }, []);
  return active;
}

export function Nav() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <>
      <nav className="site-nav" aria-label={t("primary")} data-hero="nav">
        <a href="#top" className="nav-logo glass" aria-label={tc("logoAria")}>
          <span className="logo-mark" aria-hidden>
            ★
          </span>
          <span className="ph">{PLACEHOLDER.logo}</span>
        </a>

        <div className="nav-links glass">
          {SECTIONS.map((id) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {active === id ? (
                <motion.span
                  layoutId="nav-thumb"
                  className="nav-thumb"
                  aria-hidden
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              ) : null}
              <span className="label">{t(id)}</span>
            </a>
          ))}
        </div>

        <div className="nav-right">
          <LangMenu locale={locale} className="nav-lang" />

          <a href="#contact" className="nav-cta btn-ember">
            {t("cta")}
          </a>

          <button
            type="button"
            className="nav-burger glass"
            aria-label={t("menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <BurgerIcon />
          </button>
        </div>
      </nav>

      <AnimatePresence>{open ? <MobileMenu locale={locale} onClose={closeMenu} /> : null}</AnimatePresence>
    </>
  );
}

function MobileMenu({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const panelRef = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button, a")?.focus();
    scroll.lock();
    // the sheet covers the page: the orb and the other renderers behind it rest
    overlay.push();

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
      overlay.pop();
      scroll.unlock();
      previous?.focus();
    };
  }, [onClose, scroll]);

  return (
    <motion.div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
      className="fixed inset-0 z-[100] flex flex-col bg-base/95 px-[clamp(16px,3vw,40px)] pt-4 pb-10 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="flex items-center justify-between">
        <span className="nav-logo glass">
          <span className="logo-mark" aria-hidden>
            ★
          </span>
          <span className="ph">{PLACEHOLDER.logo}</span>
        </span>
        <button type="button" className="nav-burger glass !grid" aria-label={t("close")} onClick={onClose}>
          <CloseIcon size={16} />
        </button>
      </div>

      <motion.ul
        className="mt-14 flex flex-col gap-2 px-2"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
      >
        {SECTIONS.map((id) => (
          <motion.li
            key={id}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
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

      <div className="mt-auto px-2">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/58">{t("language")}</p>
        <div className="grid grid-cols-2 gap-2">
          {routing.locales.map((code) => (
            <Link
              key={code}
              href="/"
              locale={code}
              lang={code}
              prefetch={false}
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
