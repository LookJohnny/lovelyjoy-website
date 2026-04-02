"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Sparkle from "@/components/ui/Sparkle";
import ScrollReveal from "@/components/ui/ScrollReveal";

const sparkles = [
  { size: 18, color: "#ffffff", delay: 0, className: "absolute top-6 left-[8%]" },
  { size: 28, color: "#DDB892", delay: 0.6, className: "absolute top-10 right-[12%]" },
  { size: 16, color: "#ffffff", delay: 1.2, className: "absolute bottom-8 left-[15%]" },
  { size: 24, color: "#ffffff", delay: 0.3, className: "absolute top-[20%] left-[30%]" },
  { size: 20, color: "#DDB892", delay: 0.9, className: "absolute bottom-12 right-[20%]" },
  { size: 32, color: "#ffffff", delay: 1.5, className: "absolute top-8 right-[35%]" },
] as const;

export default function OemOdmCTA() {
  const t = useTranslations("oemOdm");

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-sky-brand to-sky-brand-dark px-6 py-16 md:px-16 md:py-24">
        {/* Floating sparkles */}
        {sparkles.map((s, i) => (
          <Sparkle
            key={i}
            size={s.size}
            color={s.color}
            delay={s.delay}
            className={s.className}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {t("cta.title")}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              {t("cta.subtitle")}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mt-8">
              <Button
                href="/contact"
                variant="secondary"
                size="lg"
                className="animate-[pulse-glow_2s_ease-in-out_infinite]"
              >
                {t("cta.button")}
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
