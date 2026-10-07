import Image from "next/image";
import type { CSSProperties } from "react";
import { MASCOT_IMAGE } from "@/lib/brand-assets";

export function BrandMascot({
  size = 160,
  portrait = false,
  alt = "",
  className = "",
  priority = false,
  sizes,
}: {
  size?: number;
  portrait?: boolean;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <span
      className={`brand-mascot ${portrait ? "mascot-portrait" : ""} ${className}`}
      style={{ "--mascot-size": `${size}px` } as CSSProperties}
    >
      <Image
        src={MASCOT_IMAGE}
        alt={alt}
        fill
        sizes={sizes || `${size}px`}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
      />
    </span>
  );
}
