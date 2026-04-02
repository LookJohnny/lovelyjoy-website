"use client";

import { useLocale } from "next-intl";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";

const BRANDS = [
  { name: "Disney", color: "#1A6FC4" },
  { name: "Walmart", color: "#0071CE" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Target", color: "#CC0000" },
  { name: "Miniso", color: "#E60012" },
  { name: "Pop Mart", color: "#FFD700" },
  { name: "Costco", color: "#005DAA" },
  { name: "IKEA", color: "#0058A3" },
  { name: "Hasbro", color: "#D42D2D" },
  { name: "Mattel", color: "#E62C68" },
];

function LogoCard({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-white px-8 py-4 shadow-sm transition-all duration-300 grayscale hover:scale-105 hover:grayscale-0"
      style={{ "--brand-color": color } as React.CSSProperties}
    >
      <span
        className="whitespace-nowrap text-lg font-bold tracking-wide text-gray-400 transition-colors duration-300"
        style={{ color: "inherit" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = color)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "")
        }
      >
        {name}
      </span>
    </div>
  );
}

export default function ClientLogos() {
  const locale = useLocale();
  const heading =
    locale === "zh" ? "全球品牌信赖之选" : "Trusted by Brands Worldwide";

  // Duplicate the list for seamless infinite scroll
  const row1 = [...BRANDS, ...BRANDS];
  const row2 = [...BRANDS.slice().reverse(), ...BRANDS.slice().reverse()];

  return (
    <section className="bg-bg-sky py-16 md:py-20">
      <Container>
        <ScrollReveal>
          <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-brown/50">
            {heading}
          </p>
        </ScrollReveal>
      </Container>

      {/* Marquee rows - hover pauses animation */}
      <div className="group space-y-6 overflow-hidden">
        {/* Row 1: scrolls left */}
        <div
          className="flex gap-8 group-hover:[animation-play-state:paused]"
          style={{
            animation: "marquee 30s linear infinite",
            width: "max-content",
          }}
        >
          {row1.map((brand, i) => (
            <LogoCard key={`r1-${i}`} name={brand.name} color={brand.color} />
          ))}
        </div>

        {/* Row 2: scrolls right */}
        <div
          className="flex gap-8 group-hover:[animation-play-state:paused]"
          style={{
            animation: "marquee-reverse 30s linear infinite",
            width: "max-content",
          }}
        >
          {row2.map((brand, i) => (
            <LogoCard key={`r2-${i}`} name={brand.name} color={brand.color} />
          ))}
        </div>
      </div>
    </section>
  );
}
