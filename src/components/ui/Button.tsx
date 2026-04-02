"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

// ─── Variant & Size Maps ────────────────────────────────────

const variantStyles = {
  primary:
    "bg-sky-brand text-white hover:bg-sky-brand-dark shadow-md hover:shadow-lg",
  secondary:
    "bg-beige-brand text-brown hover:bg-beige-brand-dark shadow-md hover:shadow-lg",
  outline:
    "border-2 border-brown text-brown bg-transparent hover:bg-brown hover:text-white",
} as const;

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-lg",
} as const;

// ─── Types ──────────────────────────────────────────────────

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
    external?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

// ─── Shared Classes ─────────────────────────────────────────

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-out hover:translate-y-[-2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-brand disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

// ─── Component ──────────────────────────────────────────────

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(baseClasses, variantStyles[variant], sizeStyles[size], className);

  // Render as Next.js Link
  if ("href" in rest && rest.href !== undefined) {
    const { href, external, ...anchorProps } = rest as ButtonAsLink & { external?: boolean };

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  // Render as <button>
  const buttonProps = rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
