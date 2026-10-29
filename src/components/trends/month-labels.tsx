"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { formatShortMonth } from "@/lib/format";
import { type MonthSlot, showsYear } from "@/lib/trend-chart";

interface MonthLabelsProps {
  slots: readonly MonthSlot[];
  selectedIndex: number;
  every: number;
  width: number;
}

interface Fit {
  first: boolean;
  last: boolean;
  hidden: readonly number[];
}

interface Span {
  left: number;
  right: number;
}

const GAP = 4;
const CENTRED: Fit = { first: false, last: false, hidden: [] };

function sameFit(a: Fit, b: Fit): boolean {
  return a.first === b.first && a.last === b.last && a.hidden.join() === b.hidden.join();
}

function fitLabels(row: HTMLElement, selectedIndex: number): Fit {
  const boxes = [...row.children].map((cell) => ({
    cell: cell.getBoundingClientRect(),
    width: cell.firstElementChild?.getBoundingClientRect().width ?? 0,
  }));
  const lastIndex = boxes.length - 1;
  const overflows = (index: number): boolean => {
    const box = boxes[index];
    return box !== undefined && box.width > box.cell.width;
  };
  const first = overflows(0);
  const last = overflows(lastIndex);
  const span = (index: number): Span | null => {
    const box = boxes[index];
    if (!box || box.width === 0) return null;
    const left =
      index === 0 && first
        ? box.cell.left
        : index === lastIndex && last
          ? box.cell.right - box.width
          : box.cell.left + (box.cell.width - box.width) / 2;
    return { left, right: left + box.width };
  };
  const pill = span(selectedIndex);
  if (!pill) return { first, last, hidden: [] };
  const hidden = boxes.flatMap((_, index) => {
    const label = index === selectedIndex ? null : span(index);
    return label && label.right + GAP > pill.left && label.left - GAP < pill.right ? [index] : [];
  });
  return { first, last, hidden };
}

export function MonthLabels({ slots, selectedIndex, every, width }: MonthLabelsProps): ReactNode {
  const row = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>(CENTRED);

  useLayoutEffect(() => {
    if (!row.current) return;
    const next = fitLabels(row.current, selectedIndex);
    setFit((current) => (sameFit(current, next) ? current : next));
  }, [slots, selectedIndex, every, width]);

  return (
    <div ref={row} aria-hidden className="mt-2 flex">
      {slots.map((slot, index) => {
        const label = formatShortMonth(slot.month, showsYear(slots, index));
        const align =
          index === 0 && fit.first
            ? "justify-start"
            : index === slots.length - 1 && fit.last
              ? "justify-end"
              : "justify-center";
        if (index === selectedIndex) {
          return (
            <span key={slot.month} className={`flex min-w-0 flex-1 ${align}`}>
              <span className="rounded-pill bg-bar-selected px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-bar-selected-fg">
                {label}
              </span>
            </span>
          );
        }
        const shown = index % every === 0 && Math.abs(index - selectedIndex) >= every;
        return (
          <span key={slot.month} className={`flex min-w-0 flex-1 ${align}`}>
            {shown && (
              <span
                className={`py-0.5 text-xs font-semibold whitespace-nowrap text-muted-foreground ${fit.hidden.includes(index) ? "invisible" : ""}`}
              >
                {label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
