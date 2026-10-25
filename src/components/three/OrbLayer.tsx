"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Orb2D } from "@/components/canvas/Orb2D";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { orb } from "@/lib/orb";
import { overlay } from "@/lib/overlay";
import { cn } from "@/lib/cn";

const OrbScene = dynamic(() => import("./OrbScene"), { ssr: false });

type Mode = "pending" | "webgl" | "canvas" | "still";

let cachedMode: Mode | null = null;
function detectMode(): Mode {
  if (cachedMode) return cachedMode;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  cachedMode = reduce ? "still" : webgl ? "webgl" : "canvas";
  return cachedMode;
}
const noopSubscribe = () => () => {};

export const useOrbMode = () => useSyncExternalStore(noopSubscribe, detectMode, () => "pending" as Mode);

// same split as the About stage: the pinned tile on big screens, the opening panel on small ones
const STAGE = "(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)";
const PANEL =
  "(prefers-reduced-motion: no-preference) and (max-width: 900px), (prefers-reduced-motion: no-preference) and (max-height: 699px)";

/**
 * The orb's fixed layer behind the page. In the hero it is a sphere you can
 * spin; scrolling unravels it into a thread of dots that runs into the ★ tile
 * where About begins (or the top of the About panel on small screens). The
 * tile glows, the panel bursts open in sparks, and then the layer sleeps.
 */
export function OrbLayer() {
  const mode = useOrbMode();
  const layer = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [awake, setAwake] = useState(true);
  const covered = useSyncExternalStore(overlay.subscribe, overlay.isOpen, () => false);

  useGSAP(
    () => {
      if (mode !== "webgl") return;
      const about = document.querySelector<HTMLElement>("#about");
      const tile = about?.querySelector<HTMLElement>(".about-tile");
      if (!about) return;

      const follow = (end: string, awakeUntil: string, aim: NonNullable<typeof orb.aim>) => {
        orb.aim = aim;
        let sleep = 0;
        const morph = ScrollTrigger.create({
          trigger: about,
          start: 0,
          end,
          onUpdate: (self) => {
            orb.morph = self.progress;
            layer.current?.style.setProperty("--orb-morph", self.progress.toFixed(3));
          },
        });
        // awake through the tile's glow and the burst as the panel opens
        const wake = ScrollTrigger.create({
          trigger: about,
          start: 0,
          end: awakeUntil,
          onLeave: () => {
            window.clearTimeout(sleep);
            sleep = window.setTimeout(() => setAwake(false), 1600);
          },
          onEnterBack: () => {
            window.clearTimeout(sleep);
            setAwake(true);
          },
        });
        return () => {
          window.clearTimeout(sleep);
          morph.kill();
          wake.kill();
          orb.aim = null;
        };
      };

      const mm = gsap.matchMedia();
      mm.add(STAGE, () => follow("top top", "top -45%", { el: tile ?? about, edge: tile ? "center" : "top" }));
      mm.add(PANEL, () => follow("top 40%", "top 10%", { el: about, edge: "top" }));
      return () => mm.revert();
    },
    { dependencies: [mode] },
  );

  // lets CSS hand the hero's vignette over to the fixed layer
  useEffect(() => {
    if (mode !== "pending") document.documentElement.dataset.orb = mode;
  }, [mode]);

  if (mode !== "webgl") return null;

  const count = window.innerWidth < 760 ? 9500 : 17000;
  return (
    <div ref={layer} className={cn("orb-layer", ready && "is-ready", !awake && "is-asleep")} aria-hidden>
      <OrbScene count={count} active={awake && !covered} onReady={() => setReady(true)} />
    </div>
  );
}

/** Hero-local orb when there is no WebGL layer: animated without WebGL, a still frame under reduced motion. */
export function HeroOrbFallback() {
  const mode = useOrbMode();
  if (mode === "canvas") return <Orb2D className="hero-canvas" live />;
  if (mode === "still") return <Orb2D className="hero-canvas" live={false} />;
  return null;
}
