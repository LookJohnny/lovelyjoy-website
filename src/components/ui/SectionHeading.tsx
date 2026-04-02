import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}

export default function SectionHeading({
  title,
  subtitle,
  className,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className,
      )}
    >
      <h2 className="text-3xl font-bold text-brown md:text-4xl">{title}</h2>

      {/* Decorative sky-blue line */}
      <div
        className={cn(
          "mt-4 h-1 w-16 rounded-full bg-sky-brand",
          align === "center" && "mx-auto",
        )}
      />

      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg text-brown-light md:text-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
