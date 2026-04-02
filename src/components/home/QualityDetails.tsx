"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";

const details = [
  { src: "/images/details/hangtag.jpeg", label: "品牌吊牌 / Brand Tags" },
  { src: "/images/details/label.jpeg", label: "品质标签 / Quality Labels" },
  {
    src: "/images/details/hangtag-full.jpeg",
    label: "包装设计 / Packaging Design",
  },
  { src: "/images/store/store-wide.jpeg", label: "品牌门店 / Brand Store" },
  { src: "/images/details/bag.jpeg", label: "品牌手提袋 / Shopping Bag" },
  { src: "/images/details/cup.jpeg", label: "品牌周边 / Brand Merchandise" },
];

export default function QualityDetails() {
  const locale = useLocale();
  const heading = locale === "zh" ? "品牌品质" : "Brand Quality";

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <ScrollReveal>
          <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-brown/50">
            {heading}
          </p>
        </ScrollReveal>
      </Container>

      <ScrollReveal>
        <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {details.map((item, i) => (
            <div
              key={i}
              className="group relative aspect-video min-w-[300px] flex-shrink-0 snap-center overflow-hidden rounded-2xl md:min-w-[400px]"
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 80vw, 400px"
              />

              {/* Gradient overlay with label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-5 pb-5 pt-12">
                <p className="text-sm font-semibold text-white md:text-base">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
