import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LOGO_PATH = "/brand/capitec-logo.svg";

interface BrandProps {
  placement: "rail" | "top-bar";
}

export function Brand({ placement }: BrandProps): ReactNode {
  const inRail = placement === "rail";

  return (
    <div
      className={cn(
        "flex flex-col items-start",
        inRail ? "gap-2" : "gap-1 md:flex-row md:items-center md:gap-4 lg:hidden",
      )}
    >
      <span className="rounded-8 bg-logo-patch px-2 py-1.25">
        <img
          src={LOGO_PATH}
          alt="Capitec"
          width={112}
          height={16}
          className={inRail ? "h-4 w-28" : "h-3 w-21 md:h-4.5 md:w-31.5"}
        />
      </span>
      {!inRail && <span aria-hidden className="hidden h-7 w-px bg-border md:block" />}
      <p className="text-wordmark font-bold">
        <span className="text-foreground">Cap</span>
        <span className="text-heading">Sense</span>
      </p>
    </div>
  );
}
