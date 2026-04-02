"use client";

import { useTranslations } from "next-intl";
import {
  MessageSquare,
  Palette,
  CheckCircle,
  Package,
  Factory,
  Search,
  Truck,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const stepIcons = [
  MessageSquare,
  Palette,
  CheckCircle,
  Package,
  Factory,
  Search,
  Truck,
];

export default function OemOdmTimeline() {
  const t = useTranslations("oemOdm");

  return (
    <>
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Central vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-sky-brand" />

          <div className="space-y-12">
            {stepIcons.map((Icon, index) => {
              const isLeft = index % 2 === 0;

              return (
                <ScrollReveal
                  key={index}
                  direction={isLeft ? "left" : "right"}
                  delay={index * 0.1}
                >
                  <div className="relative flex items-center">
                    {/* Left card */}
                    {isLeft ? (
                      <div className="w-[calc(50%-2rem)] pr-8">
                        <TimelineCard
                          icon={Icon}
                          stepNumber={index + 1}
                          title={t(`steps.${index}.title`)}
                          description={t(`steps.${index}.description`)}
                        />
                      </div>
                    ) : (
                      <div className="w-[calc(50%-2rem)]" />
                    )}

                    {/* Center node */}
                    <div className="absolute left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-sky-brand text-lg font-bold text-white shadow-md">
                      {index + 1}
                    </div>

                    {/* Right card */}
                    {!isLeft ? (
                      <div className="ml-auto w-[calc(50%-2rem)] pl-8">
                        <TimelineCard
                          icon={Icon}
                          stepNumber={index + 1}
                          title={t(`steps.${index}.title`)}
                          description={t(`steps.${index}.description`)}
                        />
                      </div>
                    ) : (
                      <div className="w-[calc(50%-2rem)]" />
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden">
        <div className="relative border-l-2 border-sky-brand pl-8">
          <div className="space-y-8">
            {stepIcons.map((Icon, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 0.08}>
                <div className="relative">
                  {/* Node on the left border */}
                  <div className="absolute -left-[3.5rem] top-0 flex h-12 w-12 items-center justify-center rounded-full bg-sky-brand text-lg font-bold text-white shadow-md">
                    {index + 1}
                  </div>

                  <TimelineCard
                    icon={Icon}
                    stepNumber={index + 1}
                    title={t(`steps.${index}.title`)}
                    description={t(`steps.${index}.description`)}
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TimelineCard({
  icon: Icon,
  stepNumber,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  stepNumber: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-brand/10 text-sky-brand">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-semibold text-sky-brand">
          Step {stepNumber}
        </span>
      </div>
      <h3 className="text-lg font-bold text-brown">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-brown-light">
        {description}
      </p>
    </div>
  );
}
