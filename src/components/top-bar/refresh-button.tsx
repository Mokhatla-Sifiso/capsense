"use client";

import { ArrowClockwise } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { useRefreshDashboard } from "@/lib/query/use-refresh-dashboard";

export function RefreshButton(): ReactNode {
  const { refreshing, announcement, refresh } = useRefreshDashboard();

  return (
    <>
      <button
        type="button"
        onClick={refresh}
        aria-disabled={refreshing}
        aria-label={refreshing ? "Refreshing data" : "Refresh data"}
        className="inline-flex size-11 items-center justify-center gap-2 rounded-icon-button bg-soft font-semibold text-foreground transition-colors hover:bg-track lg:w-auto lg:px-4.5"
      >
        <Icon
          glyph={ArrowClockwise}
          size={20}
          className={refreshing ? "animate-spin motion-reduce:animate-none" : undefined}
        />
        <span className="hidden lg:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
      </button>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
