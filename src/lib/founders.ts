import { PLACEHOLDER } from "@/lib/placeholders";
import type { TechId } from "@/lib/tech-icons";

// The two people behind the studio, as the About cards show them. Names,
// emails and profile links are placeholders until the owners fill them in
// (see docs/OPEN-ITEMS.md); the stacks are a first pick, edit freely.
export type FounderId = "one" | "two";

export type Founder = {
  id: FounderId;
  side: "left" | "right";
  name: string;
  email: string;
  links: { label: string; href: string }[];
  stack: TechId[];
};

export const FOUNDERS: Record<FounderId, Founder> = {
  one: {
    id: "one",
    side: "left",
    name: PLACEHOLDER.nameOne,
    email: PLACEHOLDER.emailOne,
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "GitHub", href: "#" },
    ],
    stack: [
      "react",
      "nextdotjs",
      "typescript",
      "javascript",
      "html5",
      "css",
      "tailwindcss",
      "sass",
      "greensock",
      "threedotjs",
      "vuedotjs",
      "figma",
    ],
  },
  two: {
    id: "two",
    side: "right",
    name: PLACEHOLDER.nameTwo,
    email: PLACEHOLDER.emailTwo,
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "GitHub", href: "#" },
    ],
    stack: [
      "nodedotjs",
      "python",
      "go",
      "php",
      "postgresql",
      "mysql",
      "mongodb",
      "redis",
      "docker",
      "kubernetes",
      "graphql",
      "nginx",
    ],
  },
};
