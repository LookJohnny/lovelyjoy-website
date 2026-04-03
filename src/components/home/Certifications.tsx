"use client";

import { useLocale } from "next-intl";
import { Shield, Award, CheckCircle } from "lucide-react";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";

const certifications = [
  { name: "BSCI", icon: Shield, descEn: "Social Compliance", descZh: "商业社会合规" },
  { name: "ISO 9001", icon: Award, descEn: "Quality Management", descZh: "质量管理体系" },
  { name: "CE", icon: CheckCircle, descEn: "European Safety", descZh: "欧洲安全认证" },
  { name: "ASTM F963", icon: Shield, descEn: "US Toy Safety", descZh: "美国玩具安全" },
  { name: "EN 71", icon: CheckCircle, descEn: "EU Toy Safety", descZh: "欧盟玩具安全" },
  { name: "GB 6675", icon: Award, descEn: "China Toy Safety", descZh: "中国玩具安全" },
];

export default function Certifications() {
  const locale = useLocale();
  const isZh = locale === "zh";

  return (
    <section className="border-y border-brown/5 bg-white py-12">
      <Container>
        <ScrollReveal>
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-brown/40">
            {isZh ? "品质认证" : "Certifications"}
          </p>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6 md:gap-6">
            {certifications.map((cert) => {
              const Icon = cert.icon;
              return (
                <div
                  key={cert.name}
                  className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors hover:bg-bg-sky"
                >
                  <Icon className="h-8 w-8 text-sky-brand" />
                  <span className="text-sm font-bold text-brown">{cert.name}</span>
                  <span className="text-xs text-brown/50">
                    {isZh ? cert.descZh : cert.descEn}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
