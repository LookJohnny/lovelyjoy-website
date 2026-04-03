"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const FAQ_COUNT = 6;

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-brown/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-semibold text-brown md:text-lg">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-brown/40 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm leading-relaxed text-brown/70 md:text-base">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const t = useTranslations("faq");

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`items.${i}.q`),
    answer: t(`items.${i}.a`),
  }));

  return (
    <section className="bg-bg-warm py-16 md:py-24">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-2 text-center text-3xl font-bold text-brown md:text-4xl">
              {t("title")}
            </h2>
            <p className="mb-10 text-center text-brown/60">
              {t("subtitle")}
            </p>
            <div className="rounded-2xl bg-white px-6 py-2 shadow-sm md:px-8">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
