"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";

const showcaseItems = [
  {
    src: "/images/store/store-wide.jpeg",
    labelZh: "品牌旗舰店",
    labelEn: "Flagship Store",
  },
  {
    src: "/images/store/factory.jpeg",
    labelZh: "生产基地",
    labelEn: "Manufacturing Base",
  },
];

export default function StoreShowcase() {
  const locale = useLocale();

  return (
    <section className="bg-bg-warm py-16 md:py-24">
      <Container>
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {showcaseItems.map((item, i) => (
            <ScrollReveal
              key={i}
              direction={i === 0 ? "left" : "right"}
              delay={i * 0.15}
            >
              <div className="group">
                <div className="overflow-hidden rounded-3xl">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={item.src}
                      alt={
                        locale === "zh"
                          ? item.labelZh
                          : item.labelEn
                      }
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-brown/70">
                  {locale === "zh" ? item.labelZh : item.labelEn}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
