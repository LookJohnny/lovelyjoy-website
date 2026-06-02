"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMotionValue,
  useSpring,
  useInView,
  motion,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function CountUp({
  end,
  duration = 1.5,
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // `mounted` is false on the server AND on the first client render, so the SSR
  // markup — and what a non-JS crawler or a slow connection sees — always
  // contains the REAL number (`end`), never 0. The count-up animation only
  // starts after hydration. This fixes the "0% Quality Control / 0+ SKUs"
  // bug that previously shipped in the static HTML.
  const [mounted, setMounted] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const rounded = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isInView) {
      motionValue.set(end);
    }
  }, [mounted, isInView, end, motionValue]);

  return (
    <span
      ref={ref}
      className={cn("text-4xl font-bold text-sky-brand", className)}
    >
      {mounted ? (
        <motion.span>{rounded}</motion.span>
      ) : (
        // SSR / pre-hydration fallback. Matches the first client render (no
        // hydration mismatch) and exposes the real value to crawlers.
        <span>{end}</span>
      )}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
