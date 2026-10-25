"use client";

import type { CSSProperties, ReactNode } from "react";
import { ServiceGlyph, type ServiceKey } from "@/components/services/ServiceGlyph";
import { pointerLight } from "@/lib/tilt";

type ServiceCardProps = {
  kind: ServiceKey;
  index: number;
  num: string;
  title: string;
  desc: string;
  tags: string[];
  icon: ReactNode;
};

/**
 * One service as a pane of liquid glass: the copy on one side, its symbol in
 * ember dots on the other. In the deck (ServicesDeck) the panes stack and the
 * covered ones dim (`.svc-shade`); a light follows the pointer across the glass.
 */
export function ServiceCard({ kind, index, num, title, desc, tags, icon }: ServiceCardProps) {
  return (
    <article className="svc-card" style={{ "--i": index } as CSSProperties} onPointerMove={pointerLight}>
      <div className="svc-body">
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
      </div>
      <ServiceGlyph kind={kind} />
      <span className="svc-glare" aria-hidden />
      <span className="svc-shade" aria-hidden />
    </article>
  );
}
