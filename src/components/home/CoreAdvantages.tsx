"use client";

import { useTranslations } from "next-intl";
import { Calendar, Lightbulb, Shield, Truck } from "lucide-react";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CountUp from "@/components/ui/CountUp";

const icons = [Calendar, Lightbulb, Shield, Truck];

export default function CoreAdvantages() {
  const t = useTranslations("home");

  const items = [0, 1, 2, 3].map((i) => ({
    title: t(`advantages.items.${i}.title`),
    description: t(`advantages.items.${i}.description`),
    number: Number(t(`advantages.items.${i}.number`)),
    suffix: t(`advantages.items.${i}.suffix`),
  }));

  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = icons[i];
            return (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-lg">
                  <div className="mb-5 inline-flex rounded-2xl bg-sky-brand/10 p-4">
                    <Icon className="h-7 w-7 text-sky-brand" strokeWidth={1.8} />
                  </div>

                  <div className="mb-3">
                    <CountUp end={item.number} suffix={item.suffix} />
                  </div>

                  <h3 className="text-lg font-semibold text-brown">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-brown/70">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
