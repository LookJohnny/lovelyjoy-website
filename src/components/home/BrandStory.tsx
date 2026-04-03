"use client";

import Image from "next/image";
import { Heart, Sparkles, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const VALUE_ICONS = [Heart, Sparkles, Palette] as const;

const VALUE_COLORS = [
  "text-rose-400 bg-rose-50",
  "text-amber-400 bg-amber-50",
  "text-sky-brand bg-bg-sky",
] as const;

export default function BrandStory() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden">
      {/* Parallax background */}
      <div className="relative min-h-[600px] lg:min-h-[700px]">
        {/* Fixed background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url(/images/brand/brand-cover.jpeg)" }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 py-16 md:py-24">
          <Container>
            <div className="mx-auto max-w-5xl rounded-3xl bg-white/85 p-8 shadow-2xl backdrop-blur-md md:p-12 lg:p-16">
              {/* Two-column layout */}
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Left: Values diagram */}
                <ScrollReveal direction="left">
                  <div className="flex flex-col items-center gap-6">
                    <h3 className="text-xl font-bold text-brown">
                      {t("brandStory.valuesTitle")}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-4">
                      {VALUE_ICONS.map((Icon, i) => (
                        <div
                          key={i}
                          className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-brown text-white md:h-32 md:w-32"
                        >
                          <Icon className="mb-1 h-5 w-5" />
                          <span className="text-center text-sm font-semibold leading-tight px-2">
                            {t(`brandStory.values.${i}.title`)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-brown/60">
                      {t("brandStory.valuesSubtitle")}
                    </p>
                  </div>
                </ScrollReveal>

                {/* Right: Brand story text */}
                <ScrollReveal direction="right" delay={0.2}>
                  <div>
                    <h2 className="text-3xl font-bold text-brown md:text-4xl">
                      {t("brandStory.title")}
                    </h2>
                    <div className="mt-2 h-1 w-16 rounded-full bg-sky-brand" />
                    <p className="mt-6 text-base leading-relaxed text-brown/80 md:text-lg">
                      {t("brandStory.description")}
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Value cards */}
              <div className="mt-12 grid gap-6 sm:grid-cols-3 md:mt-16">
                {VALUE_ICONS.map((Icon, i) => (
                  <ScrollReveal key={i} delay={0.15 * (i + 1)}>
                    <div className="group flex flex-col items-center rounded-2xl bg-bg-warm/60 p-6 text-center transition-all duration-300 hover:bg-bg-warm hover:shadow-lg md:p-8">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110",
                          VALUE_COLORS[i]
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-brown">
                        {t(`brandStory.values.${i}.title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-brown/70">
                        {t(`brandStory.values.${i}.description`)}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
