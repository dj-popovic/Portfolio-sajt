"use client";

import type { PointerEvent, ReactNode } from "react";

type ServiceCardProps = {
  num: string;
  title: string;
  desc: string;
  tags: string[];
  icon: ReactNode;
};

export function ServiceCard({ num, title, desc, tags, icon }: ServiceCardProps) {
  // cursor-following ember glow (drives the ::before radial gradient)
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <article className="svc-card" onPointerMove={onMove} data-card>
      <div className="svc-top">
        <span className="svc-num">{num}</span>
        <span className="svc-icon" aria-hidden>
          {icon}
        </span>
      </div>
      <h3>{title}</h3>
      <p className="desc">{desc}</p>
      <div className="svc-tags">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
