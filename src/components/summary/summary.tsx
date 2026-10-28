import { ArrowDown, ArrowUp, Info, Minus, Wallet, WarningCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { BankCards } from "@/components/brand/bank-cards";
import { Icon } from "@/components/icon";
import { SummaryCard, type SummaryIcons } from "./summary-card";
import { SummarySkeleton } from "./summary-skeleton";

const ICONS: SummaryIcons = {
  wallet: <Icon glyph={Wallet} size={24} />,
  arrows: {
    up: <ArrowUp weight="bold" size={14} aria-hidden focusable={false} />,
    down: <ArrowDown weight="bold" size={14} aria-hidden focusable={false} />,
    same: <Minus weight="bold" size={14} aria-hidden focusable={false} />,
  },
  problem: <Icon glyph={WarningCircle} size={22} />,
  note: <Icon glyph={Info} size={24} />,
};

export function SpendingSummary(): ReactNode {
  return (
    <Suspense fallback={<SummarySkeleton />}>
      <SummaryCard icons={ICONS} illustration={<BankCards />} />
    </Suspense>
  );
}
