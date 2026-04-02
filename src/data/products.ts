// ─── Product Data ───────────────────────────────────────────

export type ProductCategory = "plush" | "pillow" | "keychain" | "gift" | "ip";

export interface ProductItem {
  id: string;
  name: string;
  nameCn: string;
  image: string;
  category: ProductCategory;
}

export const products: ProductItem[] = [
  {
    id: "strawberry-bear",
    name: "Strawberry Bear",
    nameCn: "草莓熊",
    image: "/images/products/strawberry-bear.jpeg",
    category: "ip",
  },
  {
    id: "white-goose",
    name: "White Goose",
    nameCn: "大白鹅",
    image: "/images/products/white-goose.jpeg",
    category: "plush",
  },
  {
    id: "penguin",
    name: "Baby Penguin",
    nameCn: "小企鹅",
    image: "/images/products/penguin.jpeg",
    category: "plush",
  },
  {
    id: "animals-trio",
    name: "Animal Trio",
    nameCn: "动物三人组",
    image: "/images/products/animals-trio.jpeg",
    category: "plush",
  },
  {
    id: "collection",
    name: "Character Collection",
    nameCn: "换装系列",
    image: "/images/products/collection.jpeg",
    category: "gift",
  },
];

export const categoryKeys = [
  "all",
  "plush",
  "pillow",
  "keychain",
  "gift",
  "ip",
] as const;

export type CategoryKey = (typeof categoryKeys)[number];
