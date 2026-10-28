import { formatPercent } from "./format";

export type Direction = "up" | "down" | "same";

export interface ChangeStatement {
  direction: Direction;
  text: string;
}

export function changeStatement(change: number | undefined): ChangeStatement | null {
  if (change === undefined) return null;
  if (change === 0) return { direction: "same", text: "No change on previous period" };
  const direction = change > 0 ? "up" : "down";
  const word = direction === "up" ? "Up" : "Down";
  return { direction, text: `${word} ${formatPercent(Math.abs(change))} on previous period` };
}
