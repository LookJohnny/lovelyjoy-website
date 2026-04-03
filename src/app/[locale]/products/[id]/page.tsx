import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { products } from "@/data/products";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import ShareButtons from "@/components/ui/ShareButtons";
import { Package, Ruler, Palette, ArrowRight } from "lucide-react";

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const product of products) {
      params.push({ locale, id: product.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};

  const isZh = locale === "zh";
  const name = isZh ? product.nameCn : product.name;
  const desc = isZh ? product.descriptionCn : product.descriptionEn;

  return {
    title: isZh
      ? `${name} - 毛绒玩具 | 爱儿采 LovelyJoy`
      : `${name} - Plush Toy | LovelyJoy`,
    description: desc,
    alternates: {
      canonical: `/${locale}/products/${id}`,
      languages: {
        zh: `/zh/products/${id}`,
        en: `/en/products/${id}`,
        'x-default': `/en/products/${id}`,
      },
    },
    openGraph: {
      title: name,
      description: desc,
      images: [{ url: `https://lovelyjoy.cn${product.image}`, width: 1200, height: 630 }],
    },
  };
}

function ProductJsonLd({ product, locale }: { product: (typeof products)[number]; locale: string }) {
  const isZh = locale === "zh";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: isZh ? product.nameCn : product.name,
    description: isZh ? product.descriptionCn : product.descriptionEn,
    image: `https://lovelyjoy.cn${product.image}`,
    brand: { "@type": "Brand", name: "LovelyJoy" },
    manufacturer: {
      "@type": "Organization",
      name: "LovelyJoy 爱儿采",
      url: "https://lovelyjoy.cn",
    },
    material: product.material,
    category: product.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const isZh = locale === "zh";
  const t = await getTranslations("nav");
  const tProducts = await getTranslations("products");

  const name = isZh ? product.nameCn : product.name;
  const description = isZh ? product.descriptionCn : product.descriptionEn;

  // Get related products (same category, exclude current)
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <>
      <ProductJsonLd product={product} locale={locale} />

      {/* Breadcrumb */}
      <section className="bg-bg-sky pt-6">
        <Container>
          <Breadcrumb
            locale={locale}
            items={[
              { label: t("home"), href: "/" },
              { label: t("products"), href: "/products" },
              { label: name },
            ]}
          />
        </Container>
      </section>

      {/* Product Detail */}
      <section className="bg-bg-sky pb-16 pt-8 md:pb-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            {/* Image */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={`${name} - LovelyJoy ${isZh ? "毛绒玩具" : "plush toy"}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-brown md:text-4xl">
                {name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-brown/70">
                {description}
              </p>

              {/* Specs */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-sky-brand" />
                  <span className="text-sm text-brown/60">
                    {isZh ? "材质" : "Material"}
                  </span>
                  <span className="font-medium text-brown">
                    {product.material}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-sky-brand" />
                  <span className="text-sm text-brown/60">
                    {isZh ? "尺寸" : "Sizes"}
                  </span>
                  <span className="font-medium text-brown">
                    {product.sizes}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-sky-brand" />
                  <span className="text-sm text-brown/60">
                    {isZh ? "定制" : "Custom"}
                  </span>
                  <span className="font-medium text-brown">
                    {isZh
                      ? "支持颜色、尺寸、Logo 定制"
                      : "Colors, sizes & logo customizable"}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/contact" variant="primary" size="lg">
                  {tProducts("inquireButton")}
                </Button>
                <Button href="/oem-odm" variant="outline" size="lg">
                  {isZh ? "了解 OEM/ODM" : "OEM/ODM Services"}
                </Button>
              </div>

              {/* Share */}
              <div className="mt-6">
                <ShareButtons title={name} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-white py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold text-brown">
              {isZh ? "相关产品" : "Related Products"}
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="group overflow-hidden rounded-2xl bg-bg-sky shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={item.image}
                      alt={isZh ? item.nameCn : item.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-semibold text-brown">
                      {isZh ? item.nameCn : item.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-sky-brand" />
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
