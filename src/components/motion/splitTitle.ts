import { SplitText } from "@/lib/gsap";

/**
 * Split a heading into words for a blur-in, keeping gradient ("glow") words
 * intact: once split, each word gets its own slice of the parent's gradient
 * (background-clip:text breaks when children are transformed separately).
 * Call `revert()` when the animation ends to restore the original markup.
 */
export function splitTitle(el: HTMLElement) {
  const split = SplitText.create(el, { type: "words", wordsClass: "rv-word", aria: "auto" });

  el.querySelectorAll<HTMLElement>(".glow-fire").forEach((glow) => {
    const box = glow.getBoundingClientRect();
    const image = getComputedStyle(glow).backgroundImage;
    glow.querySelectorAll<HTMLElement>(".rv-word").forEach((word) => {
      const r = word.getBoundingClientRect();
      word.style.backgroundImage = image;
      word.style.backgroundSize = `${box.width}px ${box.height}px`;
      word.style.backgroundPosition = `${box.left - r.left}px ${box.top - r.top}px`;
      word.style.backgroundRepeat = "no-repeat";
      word.style.setProperty("-webkit-background-clip", "text");
      word.style.backgroundClip = "text";
      word.style.color = "transparent";
    });
    glow.style.backgroundImage = "none";
  });

  return split;
}
