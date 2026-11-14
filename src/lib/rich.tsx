import type { ReactNode } from "react";

type Chunks = ReactNode;

// Tag renderers for next-intl rich messages: <glow>, <b>, <br></br>
// The highlighted words: lime on the dark (the hero too), a lime marker on paper.
export const richHero = {
  glow: (chunks: Chunks) => <span className="glow">{chunks}</span>,
  b: (chunks: Chunks) => <b>{chunks}</b>,
  br: () => <br />,
};

export const richDark = {
  glow: (chunks: Chunks) => <span className="glow">{chunks}</span>,
  b: (chunks: Chunks) => <b>{chunks}</b>,
  br: () => <br />,
};

export const richLight = {
  glow: (chunks: Chunks) => <span className="glow-light">{chunks}</span>,
  b: (chunks: Chunks) => <b>{chunks}</b>,
  br: () => <br />,
};
