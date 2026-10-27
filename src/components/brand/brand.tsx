import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LOGO_PATH = "/brand/capitec-logo.svg";

interface BrandProps {
  placement: "rail" | "top-bar";
}

export function Brand({ placement }: BrandProps): ReactNode {
  const inRail = placement === "rail";

  return (
    <div className={cn("flex flex-col items-start", inRail ? "gap-2" : "gap-1.5 lg:hidden")}>
      <p className="text-wordmark font-extrabold">
        <span className="text-foreground">Cap</span>
        <span className="text-heading">Sense</span>
      </p>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        by
        <span className="rounded-6 bg-logo-patch px-1.5 py-1">
          <img src={LOGO_PATH} alt="Capitec" width={98} height={14} className={inRail ? "h-3.5 w-24.5" : "h-3 w-21"} />
        </span>
      </p>
    </div>
  );
}
