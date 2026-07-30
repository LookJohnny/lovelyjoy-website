import type { Metadata } from 'next';
import { Quicksand, Noto_Sans_SC } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { buildAlternates, htmlLang, isIndexableLocale } from '@/lib/seo';

// Pre-render a static shell for every locale at build time. Combined with
// `setRequestLocale` below (and on each page), this lets Vercel serve locale
// pages from the edge cache instead of rendering them dynamically on every hit.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LeadAttributionCapture from '@/components/analytics/LeadAttribution';
import '../globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const shouldIndex = isIndexableLocale(locale);

  return {
    metadataBase: new URL('https://lovelyjoy.cn'),
    title: t('title'),
    description: t('description'),
    icons: { icon: '/favicon.ico' },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? 'en_US' : 'zh_CN',
      images: [{ url: '/images/hero/hero-bear.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/images/hero/hero-bear.jpg'],
    },
    alternates: buildAlternates(locale, ''),
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      other: {
        'baidu-site-verification': 'codeva-uvzVItlWsi',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Opt this request into static rendering (must run before any i18n read).
  setRequestLocale(locale);

  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <html
      lang={htmlLang(locale)}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${quicksand.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LeadAttributionCapture />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
