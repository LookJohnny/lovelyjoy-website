"use client";

import { useState } from "react";
import { products, type CategoryKey } from "@/data/products";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";

export default function ProductsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  return (
    <section className="bg-bg-sky py-16 md:py-24">
      <Container>
        {/* Category Filter */}
        <ScrollReveal>
          <div className="mb-10 md:mb-14">
            <CategoryFilter
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        <ScrollReveal delay={0.15}>
          <ProductGrid
            products={products}
            selectedCategory={selectedCategory}
          />
        </ScrollReveal>
      </Container>
    </section>
  );
}
