"use client";

import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface DetailItem {
  src: string;
  label: string;
}

interface BrandDetailsGalleryProps {
  items: DetailItem[];
}

export default function BrandDetailsGallery({
  items,
}: BrandDetailsGalleryProps) {
  return (
    <ScrollReveal>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
        {items.map((item) => (
          <div
            key={item.src}
            className="group relative aspect-video min-w-[300px] flex-shrink-0 snap-center overflow-hidden rounded-2xl md:min-w-[400px]"
          >
            <Image
              src={item.src}
              alt={item.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 80vw, 400px"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-5 pb-5 pt-12">
              <p className="text-sm font-semibold text-white md:text-base">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
