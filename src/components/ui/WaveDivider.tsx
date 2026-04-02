import { cn } from "@/lib/utils";

interface WaveDividerProps {
  /** Tailwind color class for the fill, e.g. "fill-sky-brand" or "fill-bg-warm" */
  color?: string;
  /** Flip the wave vertically (for top-of-section use) */
  flip?: boolean;
  className?: string;
}

/**
 * Full-width SVG wave / smile-curve divider.
 * The shape mimics the gentle U-curve from the LovelyJoy brand mark.
 */
export default function WaveDivider({
  color = "fill-sky-brand",
  flip = false,
  className,
}: WaveDividerProps) {
  return (
    <div
      className={cn(
        "w-full leading-[0] overflow-hidden",
        flip && "rotate-180",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={cn("block h-[60px] w-full", color)}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/*
          Gentle smile / U-curve:
          Starts flat at top-left, dips into a smooth concave arc,
          then rises back up on the right -- like a smile.
        */}
        <path d="M0,0 L0,20 Q360,60 720,58 Q1080,56 1440,20 L1440,0 Z" />
      </svg>
    </div>
  );
}
