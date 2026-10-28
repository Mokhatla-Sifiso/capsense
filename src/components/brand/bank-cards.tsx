import type { ReactNode } from "react";

const CARD = "absolute h-15 w-24 rounded-8";

export function BankCards(): ReactNode {
  return (
    <div aria-hidden className="pointer-events-none absolute top-21 right-0 hidden h-20 w-40 md:block">
      <div className={`${CARD} top-1 -right-3 -rotate-12 bg-bank-card-back`} />
      <div
        className={`${CARD} top-0 right-6 flex -rotate-6 flex-col border border-spend-line bg-bank-card-front p-1.5`}
      >
        <span className="flex h-3.5 w-13 items-center rounded-[3px] bg-bank-card-patch px-1">
          <img src="/brand/capitec-logo.svg" alt="" className="h-2 w-full" />
        </span>
        <span className="mt-1.5 h-3 w-4 rounded-[3px] bg-bank-card-chip" />
        <span className="mt-auto text-axis leading-none tracking-widest text-spend-muted">•••• 4821</span>
      </div>
    </div>
  );
}
