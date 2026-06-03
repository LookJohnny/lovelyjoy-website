import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildAlternates, SITE, ORG_ID } from "@/lib/seo";
import { authors, getAuthorBySlug } from "@/data/authors";
import { posts } from "@/data/posts";
import { Link } from "@/i18n/navigation";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const author of authors) {
      params.push({ locale, slug: author.slug });
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
  const author = getAuthorBySlug(slug);
  if (!author) return {};
  const isZh = locale === "zh";
  return {
    title: isZh ? `${author.name} | 爱儿采 LovelyJoy` : `${author.name} | LovelyJoy`,
    description: isZh ? author.bioZh : author.bioEn,
    alternates: buildAlternates(locale, `/authors/${slug}`),
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });
  const url = `${SITE.url}/${locale}/authors/${slug}`;

  // ProfilePage describing the author entity. `type` mirrors the author data
  // (Person once a real human is supplied, Organization until then).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": author.type,
      "@id": `${url}#author`,
      name: author.name,
      jobTitle: isZh ? author.roleZh : author.roleEn,
      description: isZh ? author.bioZh : author.bioEn,
      url,
      knowsAbout: isZh ? author.expertiseZh : author.expertiseEn,
      ...(author.image ? { image: `${SITE.url}${author.image}` } : {}),
      ...(author.sameAs.length ? { sameAs: author.sameAs } : {}),
      worksFor: { "@id": ORG_ID },
    },
  };

  const authored = posts; // all posts currently attributed to the default author

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container>
        <Breadcrumb
          locale={locale}
          currentPath={`/authors/${slug}`}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "作者" : "Authors" },
            { label: author.name },
          ]}
        />
      </Container>

      <section className="py-12 md:py-16 bg-white">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-5">
              {author.image ? (
                <Image src={author.image} alt={author.name} width={88} height={88} className="rounded-full object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-brand/15 text-2xl font-bold text-sky-brand">
                  {author.name.charAt(0)}
                </span>
              )}
              <div>
                <h1 className="text-2xl font-bold text-brown md:text-3xl">{author.name}</h1>
                <p className="text-brown/60">{isZh ? author.roleZh : author.roleEn}</p>
              </div>
            </div>

            <p className="mt-6 text-base leading-relaxed text-brown/80">{isZh ? author.bioZh : author.bioEn}</p>

            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brown/50">{isZh ? "专长领域" : "Areas of Expertise"}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(isZh ? author.expertiseZh : author.expertiseEn).map((e) => (
                  <span key={e} className="rounded-full bg-bg-sky px-4 py-1.5 text-sm text-brown">{e}</span>
                ))}
              </div>
            </div>

            {authored.length > 0 && (
              <div className="mt-10 border-t border-brown/10 pt-8">
                <h2 className="text-lg font-bold text-brown">{isZh ? "文章" : "Articles"}</h2>
                <ul className="mt-4 space-y-3">
                  {authored.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="font-medium text-sky-brand hover:underline">
                        {isZh ? p.titleCn : p.titleEn}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
