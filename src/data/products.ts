// ─── Product Data ───────────────────────────────────────────

export type ProductCategory = "plush" | "pillow" | "keychain" | "gift" | "ip";

export interface ProductItem {
  id: string;
  name: string;
  nameCn: string;
  image: string;
  category: ProductCategory;
  descriptionEn: string;
  descriptionCn: string;
  material: string;
  sizes: string;
}

export const products: ProductItem[] = [
  {
    id: "spring-duck",
    name: "Spring Duck",
    nameCn: "春游鸭",
    image: "/images/products/spring-duck.png",
    category: "plush",
    descriptionEn: "An adorable plush duck wearing a yellow beret and striped bandana, perfect for spring outings. Crafted with premium soft fabric for a huggable companion.",
    descriptionCn: "可爱的春游鸭毛绒玩具，戴着黄色贝雷帽和条纹围巾，采用优质柔软面料，是温暖可爱的陪伴伙伴。",
    material: "Crystal Super Soft / PP Cotton",
    sizes: "25cm / 35cm / 50cm",
  },
  {
    id: "sitting-dog",
    name: "Sitting Puppy",
    nameCn: "蹲姿小狗",
    image: "/images/products/sitting-dog.png",
    category: "plush",
    descriptionEn: "A fluffy curly-haired puppy in a charming sitting pose with a pink bow and sun hat. Ultra-soft plush material that feels like cuddling a real puppy.",
    descriptionCn: "卷毛蹲姿小狗毛绒玩具，戴粉色蝴蝶结和遮阳帽，超柔触感如同拥抱真正的小狗。",
    material: "Long Pile Plush / PP Cotton",
    sizes: "28cm / 40cm",
  },
  {
    id: "cat-neck-pillow",
    name: "Cat Neck Pillow Series",
    nameCn: "猫咪U型枕系列",
    image: "/images/products/cat-neck-pillow.png",
    category: "pillow",
    descriptionEn: "Cute cat-shaped U-shaped neck pillows in three adorable designs. Perfect for travel and napping, providing comfortable neck support with kawaii style.",
    descriptionCn: "猫咪造型U型枕系列，三款可爱花色，旅行午休必备，兼具舒适支撑和萌趣外观。",
    material: "Spandex / Memory Foam",
    sizes: "30cm × 28cm",
  },
  {
    id: "bean-bag-series",
    name: "Soft Bean Bag Series",
    nameCn: "软萌豆袋系列",
    image: "/images/products/bean-bag-series.png",
    category: "plush",
    descriptionEn: "A collection of round, squishy bean bag plush toys featuring a dinosaur, bunny, and kitten. Palm-sized companions with irresistibly soft texture.",
    descriptionCn: "软萌豆袋系列毛绒玩具，包含恐龙、兔子、猫咪造型，圆滚滚的手掌大小，触感极其柔软。",
    material: "Minky Fabric / PP Cotton + Beads",
    sizes: "12cm / 18cm",
  },
  {
    id: "piggy-series",
    name: "Piggy Series",
    nameCn: "小猪系列",
    image: "/images/products/piggy-series.png",
    category: "plush",
    descriptionEn: "A delightful collection of pink piggy plush toys in various outfits and costumes. Each piggy has a unique personality with interchangeable accessories.",
    descriptionCn: "粉色小猪系列毛绒玩具，多款造型可选，每只小猪都有独特的服饰和配件，可爱又治愈。",
    material: "Crystal Super Soft / PP Cotton",
    sizes: "20cm / 30cm / 45cm",
  },
  {
    id: "white-goose",
    name: "White Goose",
    nameCn: "大白鹅",
    image: "/images/products/white-goose.jpeg",
    category: "plush",
    descriptionEn: "An elegant white goose plush toy with a graceful long neck and soft feather-like texture. A unique and eye-catching design that stands out.",
    descriptionCn: "优雅的大白鹅毛绒玩具，修长的脖颈和仿羽毛柔软触感，造型独特引人注目。",
    material: "Crystal Super Soft / PP Cotton",
    sizes: "35cm / 50cm / 75cm",
  },
  {
    id: "penguin",
    name: "Baby Penguin",
    nameCn: "小企鹅",
    image: "/images/products/penguin.jpeg",
    category: "plush",
    descriptionEn: "A cute baby penguin plush toy with a cozy hat and scarf. Designed with attention to detail for maximum cuteness and cuddlability.",
    descriptionCn: "可爱的小企鹅毛绒玩具，戴着温暖的帽子和围巾，细节精致，萌趣十足。",
    material: "Crystal Super Soft / PP Cotton",
    sizes: "25cm / 35cm / 50cm",
  },
  {
    id: "animals-trio",
    name: "Animal Trio",
    nameCn: "动物三人组",
    image: "/images/products/animals-trio.jpeg",
    category: "plush",
    descriptionEn: "A charming trio of animal friends featuring a koala, lamb, and puppy. Collectible set with matching style, perfect as gifts.",
    descriptionCn: "可爱的动物三人组毛绒玩具，包含考拉、小羊和小狗，风格统一适合收藏和送礼。",
    material: "Crystal Super Soft / PP Cotton",
    sizes: "25cm / 35cm",
  },
  {
    id: "collection",
    name: "Character Collection",
    nameCn: "换装系列",
    image: "/images/products/collection.jpeg",
    category: "gift",
    descriptionEn: "Customizable character plush toys with interchangeable outfits. Perfect for brand collaborations and promotional gifts with endless personalization options.",
    descriptionCn: "可换装角色毛绒玩具系列，支持自由搭配服饰，非常适合品牌联名和促销礼品定制。",
    material: "Crystal Super Soft / PP Cotton",
    sizes: "20cm / 30cm",
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
