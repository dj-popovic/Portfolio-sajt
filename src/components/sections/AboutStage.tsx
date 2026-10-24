"use client";

import { useRef, useState, type ReactNode } from "react";
import { setInset, tileClip } from "@/components/motion/clip";
import { finishSweep, prepareSweep } from "@/components/motion/sweep";
import CountUp from "@/components/reactbits/CountUp";
import { ScrollReveal, type ScrollRevealHandle } from "@/components/reactbits/ScrollReveal";
import { gsap, useGSAP } from "@/lib/gsap";

type Stat = { n: number; label: string };

type AboutStageProps = {
  title: ReactNode;
  body: string;
  stats: Stat[];
  photoLeft: ReactNode;
  photoRight: ReactNode;
};

const TILE = 88; // px — the ember tile the panel grows out of
// resting offsets of the two photo cards in the design (desktop)
const PHOTO_Y = [-34, 40];

/**
 * About — the reel's signature move, adapted: the ember ★ tile grows into
 * the light panel (pinned, scroll-scrubbed), the story reveals inside it,
 * then the panel folds back into the tile as "What we offer" arrives.
 */
export function AboutStage({ title, body, stats, photoLeft, photoRight }: AboutStageProps) {
  const root = useRef<HTMLElement>(null);
  const bodyApi = useRef<ScrollRevealHandle>(null);
  const [statsPlay, setStatsPlay] = useState(false);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const [tile] = q(".about-tile");
      const [glow] = q(".about-glow");
      const [heading] = q(".about-center h2");
      const [divider] = q(".about-divider");
      const [bodyText] = q(".about-center p");
      const [statsRow] = q(".about-stats");
      const photos = q(".photo");

      const mm = gsap.matchMedia();

      // ---------- desktop: pinned signature sequence ----------
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)", () => {
        const panel = { open: 0 };
        const paint = () => tileClip(section, panel.open, TILE);
        paint();
        prepareSweep(heading);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=230%",
            pin: true,
            scrub: 0.6,
            onRefresh: paint,
          },
        });

        tl.to(panel, { open: 1, duration: 0.28, onUpdate: paint }, 0)
          .fromTo(tile, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.55, duration: 0.08 }, 0.01)
          .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, 0.16)
          .fromTo(
            photos,
            { y: (i) => PHOTO_Y[i] + 150, rotation: (i) => (i === 0 ? -14 : 14), autoAlpha: 0 },
            {
              y: (i) => PHOTO_Y[i],
              rotation: (i) => (i === 0 ? -3 : 3),
              autoAlpha: 1,
              duration: 0.2,
              ease: "power3.out",
              stagger: 0.04,
            },
            0.22,
          )
          .to(heading, { "--rv": 1, filter: "blur(0px)", y: 0, duration: 0.16, ease: "power1.out" }, 0.26)
          .to(
            { p: 0 },
            {
              p: 1,
              duration: 0.3,
              onUpdate() {
                bodyApi.current?.render(this.targets()[0].p);
              },
            },
            0.34,
          )
          .fromTo(divider, { scaleX: 0 }, { scaleX: 1, duration: 0.08, ease: "power2.out" }, 0.58)
          .call(() => setStatsPlay(true), [], 0.6)
          // hold, then fold back into the tile
          .to(panel, { open: 0, duration: 0.15, onUpdate: paint }, 0.84)
          .to(tile, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.94);

        return () => {
          section.style.clipPath = "";
          finishSweep(heading);
        };
      });

      // ---------- small screens: the panel opens and closes as it passes ----------
      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 900px), (prefers-reduced-motion: no-preference) and (max-height: 699px)",
        () => {
          gsap.set(tile, { autoAlpha: 0 });
          const state = { enter: 1, leave: 0 };
          const paint = () => {
            const c = Math.max(state.enter, state.leave);
            setInset(section, 0, c * 6, c * 40, "%");
          };
          paint();
          gsap.to(state, {
            enter: 0,
            ease: "none",
            onUpdate: paint,
            scrollTrigger: { trigger: section, start: "top bottom", end: "top 35%", scrub: 0.4 },
          });
          gsap.to(state, {
            leave: 1,
            ease: "none",
            onUpdate: paint,
            scrollTrigger: { trigger: section, start: "bottom 70%", end: "bottom top", scrub: 0.4 },
          });

          prepareSweep(heading);
          gsap.to(heading, {
            "--rv": 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: heading, start: "top 85%", once: true },
            onComplete: () => finishSweep(heading),
          });
          gsap.fromTo(
            photos,
            { y: 60, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "power3.out",
              stagger: 0.1,
              clearProps: "y",
              scrollTrigger: { trigger: section, start: "top 70%", once: true },
            },
          );
          const words = { p: 0 };
          gsap.to(words, {
            p: 1,
            ease: "none",
            onUpdate: () => bodyApi.current?.render(words.p),
            scrollTrigger: { trigger: bodyText, start: "top 90%", end: "bottom 55%", scrub: true },
          });
          gsap.timeline({
            scrollTrigger: { trigger: statsRow, start: "top 92%", once: true, onEnter: () => setStatsPlay(true) },
          });

          return () => {
            section.style.clipPath = "";
            finishSweep(heading);
          };
        },
      );

      // ---------- reduced motion: everything simply there ----------
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(tile, { autoAlpha: 0 });
        setStatsPlay(true);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="about" id="about" data-screen-label="About" data-manual-reveal>
      <div className="about-glow" aria-hidden />
      <div className="about-tile logo-mark" aria-hidden>
        ★
      </div>
      <div className="about-wrap">
        {photoLeft}
        <div className="about-center">
          <h2>{title}</h2>
          <ScrollReveal ref={bodyApi} mode="external" baseOpacity={0.14} blurStrength={4} stagger={0.045}>
            {body}
          </ScrollReveal>
          <div className="about-divider" aria-hidden />
          <div className="about-stats">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="n">
                  <CountUp from={0} to={s.n} startWhen={statsPlay} duration={1.4} mode="roll" trigger="load" />
                </div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {photoRight}
      </div>
    </section>
  );
}
