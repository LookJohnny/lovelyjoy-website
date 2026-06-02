import { Link } from '@/i18n/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  locale?: string;
  // Canonical path of the current page (e.g. "/products/spring-duck"). When
  // supplied, the terminal (non-linked) breadcrumb still emits a self-referencing
  // `item` URL, which Google recommends for a complete BreadcrumbList.
  currentPath?: string;
}

export default function Breadcrumb({ items, locale, currentPath }: BreadcrumbProps) {
  const base = `https://lovelyjoy.cn/${locale ?? 'zh'}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const href = item.href ?? (isLast ? currentPath : undefined);
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(href ? { item: `${base}${href}` } : {}),
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="py-3">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-brown/70">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-brown/40" aria-hidden="true">
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-brown transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-brown/50">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
