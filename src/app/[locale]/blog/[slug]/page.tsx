import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { posts } from "@/data/posts";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ShareButtons from "@/components/ui/ShareButtons";
import { ArrowRight } from "lucide-react";

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  const isZh = locale === "zh";
  const title = isZh ? post.titleCn : post.titleEn;
  const description = isZh ? post.excerptCn : post.excerptEn;

  return {
    title: isZh
      ? `${title} | 爱儿采 LovelyJoy 博客`
      : `${title} | LovelyJoy Blog`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.image, width: 1200, height: 630 }],
    },
  };
}

function ArticleJsonLd({
  post,
  locale,
}: {
  post: (typeof posts)[number];
  locale: string;
}) {
  const isZh = locale === "zh";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isZh ? post.titleCn : post.titleEn,
    description: isZh ? post.excerptCn : post.excerptEn,
    image: `https://lovelyjoy.cn${post.image}`,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "LovelyJoy 爱儿采",
      url: "https://lovelyjoy.cn",
    },
    publisher: {
      "@type": "Organization",
      name: "LovelyJoy 爱儿采",
      url: "https://lovelyjoy.cn",
      logo: {
        "@type": "ImageObject",
        url: "https://lovelyjoy.cn/images/brand/logo-color.jpeg",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const isZh = locale === "zh";
  const nav = await getTranslations("nav");
  const tBlog = await getTranslations("blog");

  const title = isZh ? post.titleCn : post.titleEn;
  const content = isZh ? post.contentCn : post.contentEn;
  const formattedDate = new Date(post.date).toLocaleDateString(
    isZh ? "zh-CN" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  // Get related posts (different from current)
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <ArticleJsonLd post={post} locale={locale} />

      {/* Breadcrumb */}
      <section className="bg-bg-sky pt-6">
        <Container>
          <Breadcrumb
            items={[
              { label: nav("home"), href: "/" },
              { label: tBlog("title"), href: "/blog" },
              { label: title },
            ]}
          />
        </Container>
      </section>

      {/* Hero Image */}
      <section className="bg-bg-sky pb-8">
        <Container>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl">
            <div className="relative aspect-[16/9]">
              <Image
                src={post.image}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Article Content */}
      <section className="bg-white py-12 md:py-16">
        <Container>
          <article className="mx-auto max-w-3xl">
            <header className="mb-8">
              <time className="text-sm text-brown/50">{formattedDate}</time>
              <h1 className="mt-2 text-3xl font-bold text-brown md:text-4xl">
                {title}
              </h1>
            </header>

            <div
              className="prose prose-lg max-w-none prose-headings:text-brown prose-h2:mt-10 prose-h2:text-2xl prose-p:text-brown/70 prose-p:leading-relaxed prose-li:text-brown/70 prose-strong:text-brown prose-ul:my-4 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Share Buttons */}
            <div className="mt-12 border-t border-brown/10 pt-8">
              <ShareButtons title={title} />
            </div>
          </article>
        </Container>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="bg-bg-sky py-12 md:py-16">
          <Container>
            <h2 className="mb-8 text-center text-2xl font-bold text-brown">
              {isZh ? "相关文章" : "Related Posts"}
            </h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {related.map((item) => {
                const itemTitle = isZh ? item.titleCn : item.titleEn;
                const itemExcerpt = isZh ? item.excerptCn : item.excerptEn;

                return (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-brown/10 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={itemTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-brown group-hover:text-sky-brand transition-colors duration-200">
                        {itemTitle}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-brown/60">
                        {itemExcerpt}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-brand">
                        {tBlog("readMore")}{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
