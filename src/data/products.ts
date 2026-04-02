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
    id: "spring-duck",
    name: "Spring Duck",
    nameCn: "春游鸭",
    image: "/images/products/spring-duck.png",
    category: "plush",
  },
  {
    id: "sitting-dog",
    name: "Sitting Puppy",
    nameCn: "蹲姿小狗",
    image: "/images/products/sitting-dog.png",
    category: "plush",
  },
  {
    id: "cat-neck-pillow",
    name: "Cat Neck Pillow Series",
    nameCn: "猫咪U型枕系列",
    image: "/images/products/cat-neck-pillow.png",
    category: "pillow",
  },
  {
    id: "bean-bag-series",
    name: "Soft Bean Bag Series",
    nameCn: "软萌豆袋系列",
    image: "/images/products/bean-bag-series.png",
    category: "plush",
  },
  {
    id: "piggy-series",
    name: "Piggy Series",
    nameCn: "小猪系列",
    image: "/images/products/piggy-series.png",
    category: "plush",
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
