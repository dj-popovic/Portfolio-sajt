import { useTranslations } from "next-intl";
import { FounderCard } from "@/components/about/FounderCard";
import { AboutStage } from "@/components/sections/AboutStage";
import { richLight } from "@/lib/rich";

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
      left={<FounderCard id="one" />}
      right={<FounderCard id="two" />}
    />
  );
}
