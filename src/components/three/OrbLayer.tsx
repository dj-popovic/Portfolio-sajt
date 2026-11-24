"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Orb2D } from "@/components/canvas/Orb2D";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_PANEL, ABOUT_STAGE, orb, ORB, orbLayout, viewportSize } from "@/lib/orb";
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

/**
 * The orb's fixed layer behind the page. In the hero it is a sphere you can
 * spin; scrolling unravels it into a thread of dots that runs into the klin tile
 * where About begins. The tile glows, the panel bursts open in sparks, and
 * then the layer sleeps. Phones: it scrolls away with the hero, receding and
 * fading (scrollAway below).
 */
export function OrbLayer() {
  const mode = useOrbMode();
  const layer = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [awake, setAwake] = useState(true);
  // phones: the orb has faded out as the hero scrolled away (it stops drawing)
  const [faded, setFaded] = useState(false);
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

      // phones (and windows with little height): no thread into About, there's no room for
      // it to read in one column. The layer lies on the page instead of being fixed over it,
      // so it scrolls away with the hero in step with the finger (a fixed layer moved by
      // script trails a frame behind), and the orb shrinks back and fades as it goes. Faded,
      // it stops drawing; once the hero is gone, the layer sleeps
      const scrollAway = () => {
        const el = layer.current;
        if (!el) return;
        const root = document.documentElement;
        const hero = document.querySelector<HTMLElement>("#top") ?? about;
        orb.aim = null;
        orb.morph = 0;
        orb.scrolls = true;
        el.dataset.scrolls = "";
        root.dataset.orbScrolls = "";
        // the layer is the hero's first screen, or taller if the glow behind the orb reaches
        // further (a phone held sideways): its cut-off edge would scroll up the screen as a line.
        // The orb shrinks about its own centre
        const place = () => {
          const view = viewportSize();
          const L = orbLayout(view.w, view.h);
          el.style.height = `${Math.ceil(Math.max(view.h, L.y + L.r * ORB.glowReach + 8))}px`;
          el.style.setProperty("--orb-cx", `${L.x.toFixed(1)}px`);
          el.style.setProperty("--orb-cy", `${L.y.toFixed(1)}px`);
        };
        place();
        window.addEventListener("resize", place);
        const fade = (p: number) => {
          el.style.setProperty("--orb-exit", p.toFixed(3));
          // on its way out the orb holds still (OrbScene): drawn every frame while it shrank
          // and faded, it cost a phone a third of the frames there
          orb.hold = p > 0.02;
          setFaded(p >= 1);
        };
        // half a screen of scrolling: by then the orb's centre has left the top of the screen
        const exit = ScrollTrigger.create({
          start: 0,
          end: () => window.innerHeight * 0.5,
          onUpdate: (self) => fade(self.progress),
          onRefresh: (self) => fade(self.progress),
        });
        let sleep = 0;
        const rest = (gone: boolean) => {
          window.clearTimeout(sleep);
          if (gone) sleep = window.setTimeout(() => setAwake(false), 400);
          else setAwake(true);
        };
        const wake = ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          onLeave: () => rest(true),
          onEnterBack: () => rest(false),
          onRefresh: (self) => rest(self.progress >= 1),
        });
        return () => {
          window.clearTimeout(sleep);
          window.removeEventListener("resize", place);
          exit.kill();
          wake.kill();
          orb.scrolls = false;
          orb.hold = false;
          delete el.dataset.scrolls;
          delete root.dataset.orbScrolls;
          for (const prop of ["height", "--orb-cx", "--orb-cy", "--orb-exit"]) el.style.removeProperty(prop);
          setFaded(false);
          setAwake(true);
        };
      };

      const mm = gsap.matchMedia();
      // the About stage's split (lib/orb): the pinned tile with room for it, the scroll-away without
      mm.add(ABOUT_STAGE, () => follow("top top", "top -45%", { el: tile ?? about, edge: tile ? "center" : "top" }));
      mm.add(ABOUT_PANEL, scrollAway);
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
      <div className="orb-stage">
        <OrbScene count={count} active={awake && !covered && !faded} onReady={() => setReady(true)} />
      </div>
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
