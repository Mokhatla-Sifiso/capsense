import { formatCount, formatPercent } from "@/lib/format";
import type { Goal } from "@/schemas/api";

export type StatusTone = "success" | "warning" | "muted";

export interface StatusLine {
  tone: StatusTone;
  words: string;
}

export type Projection = { kind: "early" } | { kind: "projected"; amount: number };

export type PaceLine = { kind: "over" | "pace"; by: number };

const KNOWN_STATUSES: Record<string, StatusLine> = {
  on_track: { tone: "success", words: "On track" },
  warning: { tone: "warning", words: "Close to limit" },
};

function toCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function goalStatus(status: string | undefined): StatusLine | null {
  if (status === undefined) return null;
  const known = KNOWN_STATUSES[status];
  if (known) return known;
  const words = status.replaceAll("_", " ").trim().toLowerCase();
  if (!words) return null;
  return { tone: "muted", words: words.charAt(0).toUpperCase() + words.slice(1) };
}

export function daysLeft(daysRemaining: number): string {
  if (daysRemaining < 0) return "—";
  if (daysRemaining === 0) return "Last day";
  return `${formatCount(daysRemaining)} ${daysRemaining === 1 ? "day" : "days"} left`;
}

export function sharedDaysLeft(goals: readonly Goal[]): string | null {
  const days = new Set(goals.map((goal) => goal.daysRemaining));
  const [only] = days;
  return days.size === 1 && only !== undefined ? daysLeft(only) : null;
}

export function daysInMonth(isoDay: string): number {
  const year = Number(isoDay.slice(0, 4));
  const month = Number(isoDay.slice(5, 7));
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function projection(goal: Goal, monthDays: number): Projection | null {
  if (goal.monthlyBudget <= 0 || goal.daysRemaining < 0 || goal.daysRemaining > monthDays) return null;
  const elapsed = monthDays - goal.daysRemaining;
  if (elapsed === 0) return { kind: "early" };
  return { kind: "projected", amount: toCents((goal.currentSpent / elapsed) * monthDays) };
}

export function paceLine(goal: Goal, projected: Projection | null): PaceLine | null {
  if (goal.monthlyBudget <= 0) return null;
  if (goal.currentSpent > goal.monthlyBudget)
    return { kind: "over", by: toCents(goal.currentSpent - goal.monthlyBudget) };
  if (projected?.kind === "projected" && projected.amount > goal.monthlyBudget) {
    return { kind: "pace", by: toCents(projected.amount - goal.monthlyBudget) };
  }
  return null;
}

export function ringFill(percentageUsed: number): number {
  return Math.min(Math.max(percentageUsed, 0), 100);
}

export function ringCentre(percentageUsed: number): string {
  return `${formatCount(Math.round(percentageUsed))}%`;
}

export function usedValue(percentageUsed: number): string {
  return `${formatPercent(percentageUsed)} used`;
}
