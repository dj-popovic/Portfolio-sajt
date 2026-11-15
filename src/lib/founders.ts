import { PLACEHOLDER } from "@/lib/placeholders";
import type { TechId } from "@/lib/tech-icons";

// The two people behind the studio, as the About cards show them: one is Đorđe (frontend
// and design), two is Relja (backend). Their names are in the message files
// (`about.people.*.name`); the email domain and the profile links are placeholders until
// the owners fill them in (see docs/OPEN-ITEMS.md); the stacks are a first pick, edit freely.
export type FounderId = "one" | "two";

export type Founder = {
  id: FounderId;
  side: "left" | "right";
  email: string;
  links: { label: string; href: string }[];
  stack: TechId[];
};

export const FOUNDERS: Record<FounderId, Founder> = {
  one: {
    id: "one",
    side: "left",
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
