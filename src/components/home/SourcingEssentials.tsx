import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Package, Clock, Factory, Boxes, ShieldCheck, MapPin } from "lucide-react";
import { getSourcingCopy } from "@/data/sourcing-i18n";

// B2B "first 15 seconds" panel: the sourcing facts a wholesale/OEM buyer needs
// before they will send an RFQ. Values mirror the business-confirmed figures
// already published in /public/llms.txt and are localized to all 14 locales
// (see src/data/sourcing-i18n.ts).
// TODO(business): re-confirm the MOQ floor, monthly capacity and lead times
// before treating any of these as contractual commitments.

const ICONS = [Package, Clock, Factory, Boxes, ShieldCheck, MapPin];

export default function SourcingEssentials({ locale }: { locale: string }) {
  const t = getSourcingCopy(locale);

  return (
    <section
      className="bg-bg-sky py-14 md:py-20"
      aria-labelledby="sourcing-essentials-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="sourcing-essentials-heading"
            className="text-2xl font-bold text-brown md:text-3xl"
          >
            {t.headline}
          </h2>
          <p className="mt-3 text-brown/70">{t.subheadline}</p>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.cards.map((card, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={card.label}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm"
              >
                <span className="inline-flex shrink-0 rounded-xl bg-sky-brand/10 p-3">
                  <Icon className="h-5 w-5 text-sky-brand" strokeWidth={1.8} />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-brown/50">
                    {card.label}
                  </dt>
                  <dd className="mt-1 font-medium text-brown">{card.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/contact" variant="primary" size="lg">
            {t.ctaSample}
          </Button>
          <Button href="/oem-odm" variant="outline" size="lg">
            {t.ctaQuote}
          </Button>
        </div>
      </Container>
    </section>
  );
}
