"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SLIDES = [
  { image: "/images/hero/hero-bear.png", href: "/about" },
  { image: "/images/hero/hero-heart.png", href: "/contact" },
  { image: "/images/hero/hero-family.png", href: "/products" },
];

const AUTOPLAY_INTERVAL = 8000;

export default function HeroCarousel() {
  const t = useTranslations("home");
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, current]);

  const slide = SLIDES[current];
  const title = t(`hero.slides.${current}.title`);
  const subtitle = t(`hero.slides.${current}.subtitle`);
  const cta = t(`hero.slides.${current}.cta`);

  // Split title into words for stagger animation (word-by-word to prevent mid-word breaks)
  const words = title.split(/(\s+)/).filter(Boolean);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slide images with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Ken Burns animated image */}
          <div
            className="absolute inset-0"
            style={{
              animation: "ken-burns 8s ease-out forwards",
            }}
          >
            <Image
              src={slide.image}
              alt={title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={current === 0}
              quality={85}
            />
          </div>

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Text overlay */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="flex max-w-4xl flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Title with character stagger */}
            <h1
              className="text-4xl font-bold text-white md:text-5xl lg:text-6xl"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={`${current}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.12,
                    ease: "easeOut",
                  }}
                  className="inline-block whitespace-pre"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.5,
                delay: words.length * 0.12 + 0.3,
                ease: "easeOut",
              }}
              className="mt-4 text-lg text-white/90 md:mt-6 md:text-xl"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
            >
              {subtitle}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.5,
                delay: words.length * 0.12 + 0.5,
                ease: "easeOut",
              }}
              className="mt-6 md:mt-8"
            >
              <Button href={slide.href} size="lg" variant="primary">
                {cta}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-20 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-24">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-500 cursor-pointer",
              i === current
                ? "w-8 bg-sky-brand"
                : "w-2 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 md:bottom-10"
        style={{ animation: "bounce-down 2s ease-in-out infinite" }}
      >
        <ChevronDown className="h-8 w-8 text-white/70" />
      </div>
    </section>
  );
}
