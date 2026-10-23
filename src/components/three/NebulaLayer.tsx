"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Nebula2D } from "@/components/canvas/Nebula2D";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { nebula, NEBULA_INTENSITY } from "@/lib/nebula-store";
import { cn } from "@/lib/cn";

const NebulaScene = dynamic(() => import("./NebulaScene"), { ssr: false });

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

/**
 * The fixed 3D field behind the page. Full nebula in the hero; once the hero
 * scrolls away the camera pushes into it and it lingers as a soft ember glow
 * behind the dark sections, then goes quiet before Contact.
 */
export function NebulaLayer() {
  const mode = useSyncExternalStore(noopSubscribe, detectMode, () => "pending" as Mode);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  // scroll → camera push + per-section glow intensity
  useGSAP(
    () => {
      if (mode !== "webgl") return;
      const hero = document.querySelector<HTMLElement>("#top");
      const contact = document.querySelector<HTMLElement>("#contact");
      if (!hero || !contact) return;

      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          nebula.hero = self.progress;
        },
      });

      // bright behind the About tile, settling into a soft glow as "What we offer" arrives
      const services = document.querySelector<HTMLElement>("#services");
      if (services) {
        ScrollTrigger.create({
          trigger: services,
          start: "top bottom",
          end: "top 25%",
          onUpdate: (self) => {
            nebula.intensity = NEBULA_INTENSITY.hero + (NEBULA_INTENSITY.glow - NEBULA_INTENSITY.hero) * self.progress;
          },
        });
      }

      let sleepTimer = 0;
      ScrollTrigger.create({
        trigger: contact,
        start: "top 70%",
        end: "max",
        onEnter: () => {
          nebula.intensity = NEBULA_INTENSITY.off;
          window.clearTimeout(sleepTimer);
          sleepTimer = window.setTimeout(() => setActive(false), 1600);
        },
        onLeaveBack: () => {
          window.clearTimeout(sleepTimer);
          setActive(true);
          nebula.intensity = NEBULA_INTENSITY.glow;
        },
      });
      return () => window.clearTimeout(sleepTimer);
    },
    { dependencies: [mode] },
  );

  // lets CSS hand the hero's vignette over to the fixed layer
  useEffect(() => {
    if (mode !== "pending") document.documentElement.dataset.nebula = mode;
  }, [mode]);

  // pointer → normalised coords; only "active" while over the hero
  useEffect(() => {
    if (mode !== "webgl") return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      nebula.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      nebula.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      nebula.pointer.active = window.scrollY < window.innerHeight * 0.8;
    };
    const onLeave = () => {
      nebula.pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [mode]);

  if (mode === "pending") return null;

  if (mode !== "webgl") {
    // fallback lives inside the hero only
    return null;
  }

  const count = window.innerWidth < 760 ? 9000 : 22000;
  return (
    <div className={cn("nebula-layer", ready && "is-ready")} aria-hidden>
      <NebulaScene count={count} active={active} onReady={() => setReady(true)} />
    </div>
  );
}

/** Hero-local fallback: the design's 2D nebula when WebGL is off, a still frame for reduced motion. */
export function HeroFallbackNebula() {
  const mode = useSyncExternalStore(noopSubscribe, detectMode, () => "pending" as Mode);
  if (mode === "canvas") return <Nebula2D className="hero-canvas" />;
  if (mode === "still") return <Nebula2D className="hero-canvas" animate={false} />;
  return null;
}
