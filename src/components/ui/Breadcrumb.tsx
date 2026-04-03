import { Link } from '@/i18n/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://lovelyjoy.cn${item.href}` } : {}),
    })),
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
