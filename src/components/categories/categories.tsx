import { WarningCircle } from "@phosphor-icons/react/ssr";
import { type ReactNode, Suspense } from "react";
import { Icon } from "@/components/icon";
import { CategoryList } from "./category-list";
import { CategorySkeleton } from "./category-skeleton";

const PROBLEM = <Icon glyph={WarningCircle} size={22} />;

export function SpendingByCategory(): ReactNode {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryList problem={PROBLEM} />
    </Suspense>
  );
}
