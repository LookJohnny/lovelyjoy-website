"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const products = [
  {
    name: "Spring Duck",
    nameCn: "春游鸭",
    image: "/images/products/spring-duck.png",
    category: "Plush",
  },
  {
    name: "Sitting Puppy",
    nameCn: "蹲姿小狗",
    image: "/images/products/sitting-dog.png",
    category: "Plush",
  },
  {
    name: "Cat Neck Pillow Series",
    nameCn: "猫咪U型枕系列",
    image: "/images/products/cat-neck-pillow.png",
    category: "Pillow",
  },
  {
    name: "Soft Bean Bag Series",
    nameCn: "软萌豆袋系列",
    image: "/images/products/bean-bag-series.png",
    category: "Plush",
  },
  {
    name: "Piggy Series",
    nameCn: "小猪系列",
    image: "/images/products/piggy-series.png",
    category: "Plush",
  },
  {
    name: "White Goose",
    nameCn: "大白鹅",
    image: "/images/products/white-goose.jpeg",
    category: "Animals",
  },
  {
    name: "Baby Penguin",
    nameCn: "小企鹅",
    image: "/images/products/penguin.jpeg",
    category: "Cute",
  },
  {
    name: "Animal Trio",
    nameCn: "动物三人组",
    image: "/images/products/animals-trio.jpeg",
    category: "Classic",
  },
  {
    name: "Character Collection",
    nameCn: "换装系列",
    image: "/images/products/collection.jpeg",
    category: "Series",
  },
];

function ProductCard({
  product,
  locale,
}: {
  product: (typeof products)[number];
  locale: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * 3;
      const rotateX = ((centerY - y) / centerY) * 3;
      setTilt({ rotateX, rotateY });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const displayName = locale === "zh" ? product.nameCn : product.name;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group cursor-pointer select-none"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
    >
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-[0_8px_30px_rgba(142,202,230,0.3)]">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Name overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-4 pt-10">
            <h3 className="text-lg font-semibold text-white">{displayName}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  const t = useTranslations("home");
  const locale = useLocale();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    loop: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

  return (
    <section className="bg-bg-sky py-20 md:py-28">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title={t("products.title")}
            subtitle={t("products.subtitle")}
          />
        </ScrollReveal>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation arrows */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(
              "absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2.5 shadow-md transition-all hover:bg-sky-brand hover:text-white md:block",
              !canScrollPrev && "cursor-not-allowed opacity-30",
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(
              "absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2.5 shadow-md transition-all hover:bg-sky-brand hover:text-white md:block",
              !canScrollNext && "cursor-not-allowed opacity-30",
            )}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Slides viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="-ml-4 flex">
              {products.map((product, i) => (
                <div
                  key={i}
                  className="min-w-0 flex-[0_0_80%] pl-4 sm:flex-[0_0_48%] lg:flex-[0_0_25%]"
                >
                  <ScrollReveal delay={i * 0.08}>
                    <ProductCard product={product} locale={locale} />
                  </ScrollReveal>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          {scrollSnaps.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollTo(i)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    i === selectedIndex
                      ? "w-8 bg-sky-brand"
                      : "w-2.5 bg-sky-brand/30 hover:bg-sky-brand/50",
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All button */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <Button href="/products" variant="primary" size="md">
              {t("products.viewAll")}
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
