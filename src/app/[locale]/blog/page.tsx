import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { posts } from "@/data/posts";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        zh: '/zh/blog',
        en: '/en/blog',
        'x-default': '/en/blog',
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const t = await getTranslations("blog");
  const nav = await getTranslations("nav");

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-bg-warm to-white py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-brown md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-brown/70">{t("subtitle")}</p>
          </div>
        </Container>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: t("title") },
          ]}
        />
      </Container>

      {/* Blog Grid */}
      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {sortedPosts.map((post) => {
              const title = isZh ? post.titleCn : post.titleEn;
              const excerpt = isZh ? post.excerptCn : post.excerptEn;
              const formattedDate = new Date(post.date).toLocaleDateString(
                isZh ? "zh-CN" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              );

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl border border-brown/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6">
                    <time className="text-sm text-brown/50">{formattedDate}</time>
                    <h2 className="mt-2 text-xl font-bold text-brown group-hover:text-sky-brand transition-colors duration-200">
                      {title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-brown/60">
                      {excerpt}
                    </p>
                    <span className="mt-4 inline-block text-sm font-semibold text-sky-brand">
                      {t("readMore")} &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
