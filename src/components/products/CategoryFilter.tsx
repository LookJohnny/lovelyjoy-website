"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { categoryKeys, type CategoryKey } from "@/data/products";

interface CategoryFilterProps {
  selected: CategoryKey;
  onChange: (category: CategoryKey) => void;
}

export default function CategoryFilter({
  selected,
  onChange,
}: CategoryFilterProps) {
  const t = useTranslations("products.categories");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll the active tab into view on mount & change
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeRef.current;
      const scrollLeft =
        button.offsetLeft -
        container.offsetWidth / 2 +
        button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 py-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:px-0"
    >
      {categoryKeys.map((key) => {
        const isActive = key === selected;
        return (
          <button
            key={key}
            ref={isActive ? activeRef : undefined}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer",
              isActive
                ? "bg-sky-brand text-white shadow-md"
                : "border border-brown/20 bg-white text-brown hover:border-sky-brand/40 hover:text-sky-brand",
            )}
          >
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}
