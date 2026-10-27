"use client";

import { useEffect } from "react";

// keys that move around the page or press things: a keyboard user at work
const NAV_KEYS = new Set([
  "Tab",
  "Enter",
  " ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

/**
 * Marks how the page is being used on <html data-input="pointer|keyboard">.
 * Browsers draw a focus ring when a script moves focus after any key press,
 * so closing a window with Esc after opening it by mouse ringed the card it
 * hands focus back to (and the next click passed the ring on). Esc alone
 * doesn't count as keyboard use; the rule in sections.css hides rings while
 * the pointer is in charge, and the next Tab brings them back.
 */
export function InputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => (root.dataset.input = "pointer");
    const key = (e: KeyboardEvent) => {
      if (NAV_KEYS.has(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) root.dataset.input = "keyboard";
    };
    window.addEventListener("pointerdown", pointer, { capture: true, passive: true });
    window.addEventListener("keydown", key, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", pointer, { capture: true });
      window.removeEventListener("keydown", key, { capture: true });
      delete root.dataset.input;
    };
  }, []);
  return null;
}
