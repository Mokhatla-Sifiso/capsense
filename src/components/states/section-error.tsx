import type { ReactNode } from "react";

interface SectionErrorProps {
  block: string;
  icon: ReactNode;
  onRetry: () => void;
  className?: string;
}

export function SectionError({ block, icon, onRetry, className }: SectionErrorProps): ReactNode {
  return (
    <div className={`flex items-center gap-3 rounded-panel border border-danger-border p-4 md:p-5 ${className ?? ""}`}>
      <span className="text-danger-text">{icon}</span>
      <p className="flex-1 font-semibold text-danger-text">Couldn&apos;t load {block}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-pill border border-primary px-5 font-semibold text-primary"
      >
        Retry
      </button>
    </div>
  );
}
