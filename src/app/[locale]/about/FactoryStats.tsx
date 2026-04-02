"use client";

import Container from "@/components/ui/Container";
import CountUp from "@/components/ui/CountUp";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface FactoryStatsProps {
  labels: string[];
}

const stats = [
  { end: 20000, suffix: "+", unit: "sqm" },
  { end: 300, suffix: "+", unit: "workers" },
  { end: 500000, suffix: "+", unit: "pcs/mo" },
  { end: 30, suffix: "+", unit: "countries" },
];

export default function FactoryStats({ labels }: FactoryStatsProps) {
  return (
    <section className="bg-sky-brand py-16 md:py-20">
      <Container>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.unit} delay={i * 0.1}>
              <div className="text-center">
                <CountUp
                  end={stat.end}
                  suffix={stat.suffix}
                  className="text-4xl md:text-5xl font-bold text-white"
                />
                <p className="mt-3 text-sm md:text-base font-medium text-white/80">
                  {labels[i]}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
