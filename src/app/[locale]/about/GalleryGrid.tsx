"use client";

import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface GalleryItem {
  src: string;
  label: string;
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {items.map((item, i) => (
        <ScrollReveal key={item.src} delay={i * 0.1}>
          <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={item.src}
              alt={item.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {/* Caption overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-5 pt-14">
              <p className="text-base font-semibold text-white">{item.label}</p>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
