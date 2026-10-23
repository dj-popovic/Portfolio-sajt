"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type ConceptCardProps = {
  kind: "web" | "app";
  kindLabel: string;
  value: ReactNode;
  openLabel: string;
  ariaLabel: string;
  stage?: string;
  onOpen: (origin: HTMLElement) => void;
  children: ReactNode;
};

export function ConceptCard({ kind, kindLabel, value, openLabel, ariaLabel, stage, onOpen, children }: ConceptCardProps) {
  const ref = useRef<HTMLElement>(null);

  // Touch screens have no hover: auto-play the preview while the card is in view.
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle("playing", entry.isIntersecting && entry.intersectionRatio > 0.45),
      { threshold: [0, 0.45, 0.75] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const open = () => ref.current && onOpen(ref.current);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <article
      ref={ref}
      className="concept-card"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      onClick={open}
      onKeyDown={onKey}
      data-card
    >
      <div className="media" aria-hidden>
        {kind === "web" ? (
          <div className="frame-web">
            <div className="viewport">{children}</div>
          </div>
        ) : (
          <div className="frame-phone">
            <div className="phone-stage" style={{ background: stage }} />
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">{children}</div>
            </div>
          </div>
        )}
        <div className="media-cue">
          <span>
            {openLabel}
            <ArrowUpRight />
          </span>
        </div>
      </div>
      <div className="concept-meta">
        <span className={cn("concept-kind", kind === "app" && "app")}>{kindLabel}</span>
        <p className="concept-value">{value}</p>
      </div>
    </article>
  );
}
