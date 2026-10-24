import { useTranslations } from "next-intl";
import { AboutStage } from "@/components/sections/AboutStage";
import { ImageIcon } from "@/components/ui/icons";
import { PLACEHOLDER } from "@/lib/placeholders";
import { richLight } from "@/lib/rich";

function FounderPhoto({
  side,
  alt,
  name,
  role,
}: {
  side: "left" | "right";
  alt: string;
  name: string;
  role: React.ReactNode;
}) {
  return (
    <figure className={`photo photo-${side}`}>
      {/* TODO(photos): founder portrait — see docs/OPEN-ITEMS.md */}
      <div className="photo-slot" role="img" aria-label={alt}>
        <ImageIcon />
        <span>{alt}</span>
      </div>
      <figcaption>
        <span className="nm">{name}</span>
        <span className="rl">{role}</span>
      </figcaption>
    </figure>
  );
}

export function About() {
  const t = useTranslations("about");

  return (
    <AboutStage
      title={t.rich("title", richLight)}
      body={t("body")}
      stats={[
        { n: 2, label: t("stats.founders") },
        { n: 4, label: t("stats.disciplines") },
        { n: 1, label: t("stats.team") },
      ]}
      photoLeft={
        <FounderPhoto side="left" alt={t("photo1")} name={PLACEHOLDER.nameOne} role={t.rich("role1", richLight)} />
      }
      photoRight={
        <FounderPhoto side="right" alt={t("photo2")} name={PLACEHOLDER.nameTwo} role={t.rich("role2", richLight)} />
      }
    />
  );
}
