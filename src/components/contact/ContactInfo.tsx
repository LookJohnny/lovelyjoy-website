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

      {/* Google Maps embed */}
      <ScrollReveal direction="right" delay={0.2}>
        <div className="overflow-hidden rounded-2xl">
          <iframe
            src="https://maps.google.com/maps?q=%E6%B5%99%E6%B1%9F%E7%9C%81%E4%B9%89%E4%B9%8C%E5%B8%82%E5%BB%BF%E4%B8%89%E9%87%8C%E6%80%9D%E6%BA%90%E8%B7%AF8%E5%8F%B7&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height={256}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="LovelyJoy Factory Location"
          />
        </div>
      </ScrollReveal>
    </div>
  );
}
