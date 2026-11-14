import { SplitText } from "@/lib/gsap";

/**
 * Split a heading into words for a blur-in (the hero's title). The highlighted
 * words are a solid colour, so the split words simply inherit it.
 * Call `revert()` when the animation ends to restore the original markup.
 */
export function splitTitle(el: HTMLElement) {
  return SplitText.create(el, { type: "words", wordsClass: "rv-word", aria: "auto" });
}
