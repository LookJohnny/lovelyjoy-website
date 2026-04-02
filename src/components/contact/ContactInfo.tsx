"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ContactInfo() {
  const t = useTranslations("contact");

  const infoItems = [
    {
      icon: Mail,
      label: "Email",
      value: t("info.email"),
      href: `mailto:${t("info.email")}`,
    },
    {
      icon: Phone,
      label: t("form.phone"),
      value: t("info.phone"),
      href: `tel:${t("info.phone").replace(/\s/g, "")}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: t("info.whatsapp"),
      href: `https://wa.me/${t("info.whatsapp").replace(/[^0-9]/g, "")}`,
    },
    {
      icon: MapPin,
      label: t("info.addressLabel"),
      value: t("info.address"),
      href: `https://maps.google.com/?q=${encodeURIComponent(t("info.address"))}`,
    },
    {
      icon: MapPin,
      label: t("info.storeAddressLabel"),
      value: t("info.storeAddress"),
      href: `https://maps.google.com/?q=${encodeURIComponent(t("info.storeAddress"))}`,
    },
    {
      icon: Clock,
      label: t("info.workingHoursLabel"),
      value: t("info.workingHours"),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <ScrollReveal direction="right" delay={0.1}>
        <div className="space-y-6">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            const cardContent = (
              <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-brand/10 text-sky-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brown-light">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-medium text-brown">{item.value}</p>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <a
                  key={index}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="block"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={index}>{cardContent}</div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Map placeholder */}
      <ScrollReveal direction="right" delay={0.2}>
        <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-200">
          <div className="text-center">
            <MapPin className="mx-auto h-8 w-8 text-brown-light" />
            <p className="mt-2 text-sm text-brown-light">Map</p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
