"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { orb, orbEvents, orbLayout, rippleAt, viewportSize, ORB } from "@/lib/orb";

const SPIN = 0.0075; // rad per px dragged sideways
const TILT = 0.0055; // rad per px dragged up/down
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The orb's hands-on side, inside the hero (the orb itself is drawn behind
 * the page): an invisible disc that takes drags, hovers, taps and keys, and
 * the "drag to spin" hint. It also writes the orb's layout into CSS so the
 * warm aura and the hint sit with it.
 */
export function OrbControls() {
  const t = useTranslations("hero.orb");
  const hit = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);

  // layout → CSS custom properties on the hero
  useEffect(() => {
    const hero = hit.current?.closest<HTMLElement>(".hero");
    if (!hero) return;
    const apply = () => {
      const view = viewportSize();
      const L = orbLayout(view.w, view.h);
      hero.style.setProperty("--orb-x", `${L.x.toFixed(1)}px`);
      hero.style.setProperty("--orb-y", `${L.y.toFixed(1)}px`);
      hero.style.setProperty("--orb-r", `${L.r.toFixed(1)}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    const el = hit.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    let id = -1;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let moved = false;

    const layout = () => {
      const view = viewportSize();
      return orbLayout(view.w, view.h);
    };
    const over = (x: number, y: number) => {
      const L = layout();
      return Math.hypot(x - L.x, y - L.y) <= L.r * 1.04;
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      id = e.pointerId;
      el.setPointerCapture(id);
      orb.dragging = true;
      orb.vyaw = 0;
      orb.vpitch = 0;
      lastX = startX = e.clientX;
      lastY = startY = e.clientY;
      lastT = startT = performance.now();
      moved = false;
    };
    const move = (e: PointerEvent) => {
      // hover: the dots part around the pointer (mouse only)
      if (e.pointerType === "mouse") {
        orb.pointer.x = e.clientX;
        orb.pointer.y = e.clientY;
        orb.pointer.over = over(e.clientX, e.clientY);
      }
      if (!orb.dragging || e.pointerId !== id) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      orb.yaw += dx * SPIN;
      orb.pitch = clamp(orb.pitch + dy * TILT, -ORB.pitchLimit, ORB.pitchLimit);
      // keep a smoothed velocity for the throw
      orb.vyaw = orb.vyaw * 0.6 + ((dx * SPIN) / dt) * 0.4;
      orb.vpitch = orb.vpitch * 0.6 + ((dy * TILT) / dt) * 0.4;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      if (!moved && Math.hypot(e.clientX - startX, e.clientY - startY) > 6) {
        moved = true;
        setTouched(true);
      }
      orbEvents.emit();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
      id = -1;
      orb.dragging = false;
      const still = performance.now() - lastT > 90;
      if (reduce || still) {
        orb.vyaw = reduce ? 0 : orb.vyaw * 0.2;
        orb.vpitch = 0;
      }
      orb.vyaw = clamp(orb.vyaw, -6, 6);
      orb.vpitch = clamp(orb.vpitch, -4, 4);
      // a tap (not a drag) sends a ripple across the surface
      if (!moved && performance.now() - startT < 400 && !reduce) rippleAt(e.clientX, e.clientY, layout());
    };
    const cancel = () => {
      id = -1;
      orb.dragging = false;
    };
    const leave = () => {
      orb.pointer.over = false;
    };

    const key = (e: KeyboardEvent) => {
      const step = reduce ? 0.3 : 0;
      const impulse = 2.4;
      switch (e.key) {
        case "ArrowLeft":
          if (reduce) orb.yaw -= step;
          else orb.vyaw -= impulse;
          break;
        case "ArrowRight":
          if (reduce) orb.yaw += step;
          else orb.vyaw += impulse;
          break;
        case "ArrowUp":
          if (reduce) orb.pitch = clamp(orb.pitch - step, -ORB.pitchLimit, ORB.pitchLimit);
          else orb.vpitch -= impulse * 0.7;
          break;
        case "ArrowDown":
          if (reduce) orb.pitch = clamp(orb.pitch + step, -ORB.pitchLimit, ORB.pitchLimit);
          else orb.vpitch += impulse * 0.7;
          break;
        case "Enter":
        case " ": {
          if (reduce) return;
          const L = layout();
          rippleAt(L.x - L.r * 0.25, L.y - L.r * 0.25, L);
          break;
        }
        default:
          return;
      }
      e.preventDefault();
      setTouched(true);
      orbEvents.emit();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("keydown", key);
      orb.dragging = false;
      orb.pointer.over = false;
    };
  }, []);

  return (
    <>
      <div ref={hit} className="orb-hit" role="img" tabIndex={0} aria-label={t("label")} aria-describedby="orb-help" />
      <p id="orb-help" className="sr-only">
        {t("help")}
      </p>
      <div className="orb-hint" aria-hidden data-hero="hint">
        <span className={cn("orb-hint-pill", touched && "is-done")}>
          <span className="dot" />
          {t("hint")}
        </span>
      </div>
    </>
  );
}
