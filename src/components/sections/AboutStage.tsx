"use client";

import { useRef, useState, type ReactNode } from "react";
import { setInset, tileClip } from "@/components/motion/clip";
import { finishSweep, prepareSweep } from "@/components/motion/sweep";
import CountUp from "@/components/reactbits/CountUp";
import { ScrollReveal, type ScrollRevealHandle } from "@/components/reactbits/ScrollReveal";
import { gsap, useGSAP } from "@/lib/gsap";
import { orb } from "@/lib/orb";

type Stat = { n: number; label: string };

type AboutStageProps = {
  title: ReactNode;
  body: string;
  stats: Stat[];
  left: ReactNode;
  right: ReactNode;
};

const TILE = 88; // px — the ember tile the panel grows out of
// resting offsets of the two founder cards in the design (desktop)
const CARD_Y = [-30, 36];

/**
 * About — the reel's signature move, adapted: the ember ★ tile the hero's
 * thread ran into bursts open into the light panel (pinned, scroll-scrubbed;
 * it starts hot and cools to paper while the orb layer throws sparks off its
 * edge), the story and the two founder cards come in, then the panel folds
 * back into the tile as "What we offer" arrives.
 */
export function AboutStage({ title, body, stats, left, right }: AboutStageProps) {
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
      const [heat] = q(".about-heat");
      const [heading] = q(".about-center h2");
      const [bodyText] = q(".about-center p");
      const [statsRow] = q(".about-stats");
      const cards = q(".founder");

      const mm = gsap.matchMedia();

      // ---------- desktop: pinned signature sequence ----------
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)", () => {
        const panel = { open: 0 };
        const paint = () => {
          const inset = tileClip(section, panel.open, TILE);
          // the orb layer draws the glow and the sparks along this edge
          const b = section.getBoundingClientRect();
          Object.assign(orb.panel, {
            open: panel.open,
            x: b.left + inset.x,
            y: b.top + inset.y,
            w: b.width - inset.x * 2,
            h: b.height - inset.y * 2,
            r: inset.r,
            stage: true,
            live: true,
          });
        };
        paint();
        prepareSweep(heading);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 0.5,
            onRefresh: paint,
          },
        });

        tl.to(panel, { open: 1, duration: 0.2, onUpdate: paint }, 0)
          .fromTo(tile, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.55, duration: 0.05 }, 0.005)
          // the panel opens hot and cools to paper
          .fromTo(heat, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.17, ease: "power1.in" }, 0.03)
          .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, 0.12)
          .fromTo(
            cards,
            { y: (i) => CARD_Y[i] + 150, rotation: (i) => (i === 0 ? -14 : 14), autoAlpha: 0 },
            {
              y: (i) => CARD_Y[i],
              rotation: (i) => (i === 0 ? -3 : 3),
              autoAlpha: 1,
              duration: 0.16,
              ease: "power3.out",
              stagger: 0.03,
            },
            0.13,
          )
          .to(heading, { "--rv": 1, filter: "blur(0px)", y: 0, duration: 0.12, ease: "power1.out" }, 0.16)
          .to(
            { p: 0 },
            {
              p: 1,
              duration: 0.2,
              onUpdate() {
                bodyApi.current?.render(this.targets()[0].p);
              },
            },
            0.2,
          )
          .fromTo(statsRow, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.4)
          .call(() => setStatsPlay(true), [], 0.42)
          // hold, then fold back into the tile (warming up again on the way)
          .to(panel, { open: 0, duration: 0.13, onUpdate: paint }, 0.84)
          .to(heat, { autoAlpha: 1, duration: 0.09, ease: "power1.in" }, 0.86)
          .to(tile, { autoAlpha: 1, scale: 1, duration: 0.04 }, 0.93);

        return () => {
          section.style.clipPath = "";
          orb.panel.live = false;
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
            const b = section.getBoundingClientRect();
            const x = b.width * c * 0.06;
            Object.assign(orb.panel, {
              open: 1 - c,
              x: b.left + x,
              y: b.top,
              w: b.width - x * 2,
              h: b.height,
              r: c * 40,
              stage: false,
              live: true,
            });
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
            cards,
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
            orb.panel.live = false;
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
      <div className="about-heat" aria-hidden />
      <div className="about-tile logo-mark" aria-hidden>
        ★
      </div>
      {/* the story first (heading order, reading order); grid areas put the cards either side */}
      <div className="about-wrap">
        <div className="about-center">
          <h2>{title}</h2>
          <ScrollReveal ref={bodyApi} mode="external" baseOpacity={0.14} blurStrength={4} stagger={0.045}>
            {body}
          </ScrollReveal>
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
        {left}
        {right}
      </div>
    </section>
  );
}
