const DAY_MS = 86_400_000;

export interface DateWindow {
  start: string;
  end: string;
}

function toTime(day: string): number {
  return Date.parse(`${day}T00:00:00Z`);
}

function toDay(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

export function addDays(day: string, amount: number): string {
  return toDay(toTime(day) + amount * DAY_MS);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toTime(to) - toTime(from)) / DAY_MS);
}

export function startOfMonth(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

export function dayOfMonth(day: string): number {
  return Number(day.slice(8, 10));
}

export function daysInMonth(day: string): number {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function monthsBetween(from: string, to: string): string[] {
  const months: string[] = [];
  for (let day = startOfMonth(from); day <= to; day = addDays(day, daysInMonth(day))) {
    months.push(day.slice(0, 7));
  }
  return months;
}

export function isWithin(day: string, window: DateWindow): boolean {
  return day >= window.start && day <= window.end;
}
