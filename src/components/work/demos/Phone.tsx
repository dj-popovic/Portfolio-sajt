"use client";

import { useEffect, useSyncExternalStore, type ReactNode, type RefObject } from "react";

// Shared by the two app concepts: a device frame, and the layout helpers that
// keep it beside the copy on wide windows.

export const PHONE = { w: 300, h: 640 };

const WIDE = "(min-width: 900px)";
const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia(WIDE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/** True when the demo window has room for a phone beside the story. */
export const useWideWindow = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );

/**
 * Keeps a sticky phone clear of the demo's own header: its holder sticks right under the
 * header (the holder's padding is the gap), and the phone inside scales down until all of
 * it fits in what's left of the window's scroll area, its box shrunk to match (negative
 * margins), so the holder and the column fit the phone as drawn. A transform, not CSS zoom:
 * Safari zoomed the boxes but not the text.
 */
export function useFitToWindow(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const holder = ref.current;
    const body = holder?.closest<HTMLElement>(".ww-body");
    const device = holder?.firstElementChild as HTMLElement | null | undefined;
    if (!holder || !body || !device) return;
    const reset = () => {
      holder.style.removeProperty("top");
      for (const prop of ["transform", "transform-origin", "margin-right", "margin-bottom"])
        device.style.removeProperty(prop);
    };
    if (!enabled) {
      reset();
      return;
    }
    const header = body.querySelector<HTMLElement>("header");
    const fit = () => {
      const head = header?.offsetHeight ?? 0;
      const cs = getComputedStyle(holder);
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      holder.style.setProperty("top", `${head}px`);
      const k = Math.min(1, (body.clientHeight - head - pad - 8) / PHONE.h);
      device.style.setProperty("transform-origin", "0 0");
      device.style.setProperty("transform", `scale(${k.toFixed(4)})`);
      device.style.setProperty("margin-right", `${(PHONE.w * (k - 1)).toFixed(1)}px`);
      device.style.setProperty("margin-bottom", `${(PHONE.h * (k - 1)).toFixed(1)}px`);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(body);
    if (header) ro.observe(header);
    fit();
    return () => {
      ro.disconnect();
      reset();
    };
  }, [ref, enabled]);
}

export function PhoneFrame({
  children,
  frame,
  island = "#14112A",
  screen,
}: {
  children: ReactNode;
  /** device colour */
  frame: string;
  island?: string;
  /** classes for the screen (its background) */
  screen: string;
}) {
  return (
    <div
      data-phone
      className="relative shrink-0 rounded-[50px] p-[9px] shadow-[0_60px_90px_-40px_rgba(30,20,40,.55),0_0_0_1px_rgba(255,255,255,.06)_inset]"
      style={{ width: PHONE.w, height: PHONE.h, background: frame }}
    >
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[41px] ${screen}`}>
        <div className="flex h-11 shrink-0 items-center justify-between px-7 pt-1 text-[12.5px] font-extrabold">
          <span>9:41</span>
          <span
            className="absolute top-2.5 left-1/2 z-40 h-[26px] w-[88px] -translate-x-1/2 rounded-full"
            style={{ background: island }}
          />
          <span className="flex items-center gap-1.5" aria-hidden>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
              <rect x="0" y="7" width="3" height="4" rx="1" />
              <rect x="4.3" y="5" width="3" height="6" rx="1" />
              <rect x="8.6" y="2.5" width="3" height="8.5" rx="1" />
              <rect x="12.9" y="0" width="3" height="11" rx="1" />
            </svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
              <rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="currentColor" opacity=".45" />
              <rect x="2" y="2" width="14" height="7" rx="1.6" fill="currentColor" />
              <rect x="22" y="3.5" width="1.6" height="4" rx=".8" fill="currentColor" opacity=".45" />
            </svg>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
