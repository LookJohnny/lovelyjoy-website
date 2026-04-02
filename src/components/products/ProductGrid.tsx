"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ProductItem, CategoryKey } from "@/data/products";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: ProductItem[];
  selectedCategory: CategoryKey;
}

export default function ProductGrid({
  products,
  selectedCategory,
}: ProductGridProps) {
  const filtered =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
