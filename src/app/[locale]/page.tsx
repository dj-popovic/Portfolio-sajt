import { useTranslations } from "next-intl";
import { BriefProvider } from "@/components/brief/BriefProvider";
import { Nav } from "@/components/layout/Nav";
import { MotionPreferences } from "@/components/motion/MotionPreferences";
import { Reveals } from "@/components/motion/Reveals";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { OrbLayer } from "@/components/three/OrbLayer";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Fit } from "@/components/sections/Fit";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <SmoothScroll>
      <MotionPreferences>
        <BriefProvider>
          <OrbLayer />
          <a
            href="#main"
            className="sr-only z-[200] rounded-full bg-cream px-4 py-2 text-sm font-semibold text-base focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            {t("skip")}
          </a>
          <Nav />
          <main id="main">
            <Hero />
            <About />
            <Services />
            <Work />
            <Process />
            <Fit />
            <Contact />
          </main>
          <Footer />
          <Reveals />
        </BriefProvider>
      </MotionPreferences>
    </SmoothScroll>
  );
}
