import type { Icon as Glyph } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface IconProps {
  glyph: Glyph;
  size?: number;
  className?: string;
}

export function Icon({ glyph: Glyph, size = 20, className }: IconProps): ReactNode {
  return <Glyph weight="fill" size={size} className={className} aria-hidden focusable={false} />;
}
