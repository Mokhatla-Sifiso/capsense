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
  edge: "start" | "end" | null;
  hidden: readonly number[];
}

const GAP = 4;
const CENTRED: Fit = { edge: null, hidden: [] };
const ALIGN = { start: "justify-start", end: "justify-end" } as const;

function sameFit(a: Fit, b: Fit): boolean {
  return a.edge === b.edge && a.hidden.join() === b.hidden.join();
}

function fitPill(row: HTMLElement, selectedIndex: number): Fit {
  const cells = [...row.children];
  const cell = cells[selectedIndex]?.getBoundingClientRect();
  const pill = cells[selectedIndex]?.firstElementChild?.getBoundingClientRect();
  if (!cell || !pill || pill.width === 0) return CENTRED;
  const wide = pill.width > cell.width;
  const edge = wide && selectedIndex === 0 ? "start" : wide && selectedIndex === cells.length - 1 ? "end" : null;
  const left =
    edge === "start" ? cell.left : edge === "end" ? cell.right - pill.width : cell.left + (cell.width - pill.width) / 2;
  const right = left + pill.width;
  const hidden = cells.flatMap((other, index) => {
    const label = index === selectedIndex ? undefined : other.firstElementChild?.getBoundingClientRect();
    return label && label.width > 0 && label.right + GAP > left && label.left - GAP < right ? [index] : [];
  });
  return { edge, hidden };
}

export function MonthLabels({ slots, selectedIndex, every, width }: MonthLabelsProps): ReactNode {
  const row = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<Fit>(CENTRED);

  useLayoutEffect(() => {
    if (!row.current) return;
    const next = fitPill(row.current, selectedIndex);
    setFit((current) => (sameFit(current, next) ? current : next));
  }, [slots, selectedIndex, every, width]);

  return (
    <div ref={row} aria-hidden className="mt-2 flex">
      {slots.map((slot, index) => {
        const label = formatShortMonth(slot.month, showsYear(slots, index));
        if (index === selectedIndex) {
          return (
            <span key={slot.month} className={`flex min-w-0 flex-1 ${fit.edge ? ALIGN[fit.edge] : "justify-center"}`}>
              <span className="rounded-pill bg-bar-selected px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-bar-selected-fg">
                {label}
              </span>
            </span>
          );
        }
        const shown = index % every === 0 && Math.abs(index - selectedIndex) >= every;
        return (
          <span key={slot.month} className="flex min-w-0 flex-1 justify-center">
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
