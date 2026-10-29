"use client";

import { useQuery } from "@tanstack/react-query";
import { type KeyboardEvent, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { transactionsLabel } from "@/lib/category-rows";
import { formatCurrency, formatMonth, formatShortMonth, formatWholeCurrency } from "@/lib/format";
import { dashboardQueries } from "@/lib/query/dashboard-queries";
import { type MonthSlot, labelEvery, monthSlots, niceMax, showsYear } from "@/lib/trend-chart";
import { useElementWidth } from "@/lib/use-element-width";
import { useDashboardParams } from "@/lib/url-state/use-dashboard-params";
import type { MonthlyTrend } from "@/schemas/api";
import { BUBBLE_SPACE, PLOT_HEIGHT, TREND_CARD, TrendBars, TrendsHeading } from "./trend-skeleton";

interface TrendChartProps {
  problem: ReactNode;
}

interface ChartProps {
  slots: readonly MonthSlot[];
  selected: string;
  currency: string;
  onSelect: (month: string) => void;
}

const CHART_HEIGHT = BUBBLE_SPACE + PLOT_HEIGHT;
const CAPSULE_WIDTH = 26;
const BUBBLE_HEIGHT = 52;
const BUBBLE_PADDING = 12;
const NOTHING = "—";

function columnName(trend: MonthlyTrend, currency: string): string {
  const average =
    trend.transactionCount === 0 ? "no average" : `average ${formatCurrency(trend.averageTransaction, currency)}`;
  return `${formatMonth(trend.month)}: ${formatCurrency(trend.totalSpent, currency)}, ${transactionsLabel(trend.transactionCount)}, ${average}`;
}

function Bubble({
  trend,
  center,
  width,
  top,
  currency,
}: {
  trend: MonthlyTrend;
  center: number;
  width: number;
  top: number;
  currency: string;
}): ReactNode {
  const label = useRef<SVGTextElement>(null);
  const value = useRef<SVGTextElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const amount = formatCurrency(trend.totalSpent, currency);

  useLayoutEffect(() => {
    const measure = (text: SVGTextElement | null): number =>
      typeof text?.getComputedTextLength === "function" ? text.getComputedTextLength() : 0;
    setTextWidth(Math.max(measure(label.current), measure(value.current)));
  }, [trend.month, amount]);

  const bubbleWidth = (textWidth || amount.length * 9) + BUBBLE_PADDING * 2;
  const x = Math.min(Math.max(center - bubbleWidth / 2, 0), Math.max(width - bubbleWidth, 0));
  const y = Math.max(top - BUBBLE_HEIGHT - 8, 0);

  return (
    <g aria-hidden>
      <rect x={x} y={y} width={bubbleWidth} height={BUBBLE_HEIGHT} rx={12} className="fill-tooltip-bg" />
      <text ref={label} x={x + BUBBLE_PADDING} y={y + 20} className="fill-tooltip-fg text-xs font-semibold">
        {formatMonth(trend.month)}
      </text>
      <text ref={value} x={x + BUBBLE_PADDING} y={y + 40} className="fill-tooltip-fg text-[0.9375rem] font-bold">
        {amount}
      </text>
    </g>
  );
}

function Chart({ slots, selected, currency, onSelect }: ChartProps): ReactNode {
  const [plot, width] = useElementWidth<HTMLDivElement>();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const trends = slots.flatMap((slot) => (slot.trend ? [slot.trend] : []));
  const top = niceMax(Math.max(...trends.map((trend) => trend.totalSpent)));
  const cell = slots.length > 0 ? width / slots.length : 0;
  const capsule = Math.min(CAPSULE_WIDTH, cell * 0.6);
  const every = labelEvery(slots.length, width);
  const selectedIndex = slots.findIndex((slot) => slot.month === selected);

  function capsuleHeight(trend: MonthlyTrend): number {
    return Math.max(capsule, (trend.totalSpent / top) * PLOT_HEIGHT);
  }

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const available = slots.flatMap((slot, at) => (slot.trend ? [at] : []));
    const position = available.indexOf(index);
    const targets: Record<string, number | undefined> = {
      ArrowLeft: available[position - 1],
      ArrowRight: available[position + 1],
      Home: available[0],
      End: available.at(-1),
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const target = targets[event.key];
    const slot = target === undefined ? undefined : slots[target];
    if (target === undefined || !slot) return;
    onSelect(slot.month);
    buttons.current[target]?.focus();
  }

  const selectedTrend = slots[selectedIndex]?.trend;

  return (
    <div className="mt-6 md:pl-14">
      <div ref={plot} className="relative h-64">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-50">
          {[
            { position: "top-0", value: top },
            { position: "top-1/2", value: top / 2 },
            { position: "bottom-0", value: 0 },
          ].map(({ position, value }) => (
            <div key={position} className={`absolute inset-x-0 ${position} border-t border-dashed border-border`}>
              <span className="absolute -left-14 hidden w-12 -translate-y-1/2 text-right text-axis text-muted-foreground md:block">
                {formatWholeCurrency(value, currency)}
              </span>
            </div>
          ))}
        </div>
        {width > 0 && (
          <svg aria-hidden width={width} height={CHART_HEIGHT} className="absolute inset-0 overflow-visible">
            {slots.map((slot, index) =>
              slot.trend ? (
                <rect
                  key={slot.month}
                  x={index * cell + (cell - capsule) / 2}
                  y={CHART_HEIGHT - capsuleHeight(slot.trend)}
                  width={capsule}
                  height={capsuleHeight(slot.trend)}
                  rx={capsule / 2}
                  className={index === selectedIndex ? "fill-bar-selected" : "fill-bar"}
                />
              ) : null,
            )}
            {selectedTrend && (
              <Bubble
                trend={selectedTrend}
                center={(selectedIndex + 0.5) * cell}
                width={width}
                top={CHART_HEIGHT - capsuleHeight(selectedTrend)}
                currency={currency}
              />
            )}
          </svg>
        )}
        <div role="group" aria-label="Monthly spending chart" className="absolute inset-0 flex">
          {slots.map((slot, index) =>
            slot.trend ? (
              <button
                key={slot.month}
                ref={(element) => {
                  buttons.current[index] = element;
                }}
                type="button"
                aria-pressed={index === selectedIndex}
                aria-label={columnName(slot.trend, currency)}
                tabIndex={index === selectedIndex ? 0 : -1}
                onClick={() => onSelect(slot.month)}
                onMouseEnter={() => onSelect(slot.month)}
                onKeyDown={(event) => move(event, index)}
                className="h-full min-w-0 flex-1 cursor-pointer rounded-12"
              />
            ) : (
              <span key={slot.month} className="flex-1" />
            ),
          )}
        </div>
      </div>
      <div aria-hidden className="mt-2 flex">
        {slots.map((slot, index) => (
          <span key={slot.month} className="flex min-w-0 flex-1 justify-center">
            {index === selectedIndex ? (
              <span className="rounded-pill bg-bar-selected px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-bar-selected-fg">
                {formatShortMonth(slot.month, showsYear(slots, index))}
              </span>
            ) : (
              index % every === 0 &&
              Math.abs(index - selectedIndex) >= every && (
                <span className="py-0.5 text-xs font-semibold whitespace-nowrap text-muted-foreground">
                  {formatShortMonth(slot.month, showsYear(slots, index))}
                </span>
              )
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TrendChart({ problem }: TrendChartProps): ReactNode {
  const [params] = useDashboardParams();
  const trends = useQuery(dashboardQueries.trends(params.months));
  const profile = useQuery(dashboardQueries.profile());
  const [chosen, setChosen] = useState<string | null>(null);

  function body(): ReactNode {
    if (trends.isPending || profile.isPending) return <TrendBars />;
    if (!trends.data || !profile.data) {
      const retry = (): void => {
        void trends.refetch();
        if (profile.isError) void profile.refetch();
      };
      return (
        <div className="mt-card-gap flex items-center gap-3 rounded-panel border border-danger-border p-4 md:p-5">
          <span className="text-danger-text">{problem}</span>
          <p className="flex-1 font-semibold text-danger-text">Couldn&apos;t load trends</p>
          <button
            type="button"
            onClick={retry}
            className="min-h-11 rounded-pill border border-primary px-5 font-semibold text-primary"
          >
            Retry
          </button>
        </div>
      );
    }
    const slots = monthSlots(trends.data.trends);
    const months = slots.flatMap((slot) => (slot.trend ? [slot.trend] : []));
    const latest = months.at(-1);
    if (!latest) return <p className="mt-card-gap text-muted-foreground">No monthly spending to show</p>;
    const selected = months.find((trend) => trend.month === chosen) ?? latest;
    const currency = profile.data.currency;
    const average = selected.transactionCount === 0 ? NOTHING : formatCurrency(selected.averageTransaction, currency);

    return (
      <>
        <Chart slots={slots} selected={selected.month} currency={currency} onSelect={setChosen} />
        <p className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-icon-button bg-row px-3.5 py-3 text-control">
          <span className="font-bold">{formatMonth(selected.month)}</span>
          <span className="text-muted-foreground">
            {transactionsLabel(selected.transactionCount)} · avg {average}
          </span>
        </p>
      </>
    );
  }

  return (
    <section
      aria-labelledby="trends-heading"
      aria-busy={trends.isPending || profile.isPending || undefined}
      className={TREND_CARD}
    >
      <TrendsHeading />
      {body()}
    </section>
  );
}
