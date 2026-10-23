"use client";

import type { ReactNode } from "react";
import { tiltLeave, tiltMove } from "@/lib/tilt";

type ServiceCardProps = {
  num: string;
  title: string;
  desc: string;
  tags: string[];
  icon: ReactNode;
};

export function ServiceCard({ num, title, desc, tags, icon }: ServiceCardProps) {
  // cursor-following ember glow (the ::before radial gradient) + a slight tilt toward the cursor
  return (
    <article
      className="svc-card"
      onPointerMove={(e) => tiltMove(e, 5)}
      onPointerLeave={tiltLeave}
      data-card
      data-reveal-item
    >
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
