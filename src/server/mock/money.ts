export function toRands(cents: number): number {
  return cents / 100;
}

export function averageRands(totalCents: number, count: number): number {
  return count === 0 ? 0 : Math.round(totalCents / count) / 100;
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function percentOf(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 10_000) / 100;
}

export function sharesOfTotal(amounts: readonly number[]): number[] {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (total === 0) return amounts.map(() => 0);
  const exactTenths = amounts.map((amount) => (amount / total) * 1000);
  const tenths = exactTenths.map(Math.floor);
  const leftover = 1000 - tenths.reduce((sum, value) => sum + value, 0);
  const byLargestRemainder = exactTenths
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);
  byLargestRemainder.slice(0, leftover).forEach(({ index }) => {
    tenths[index] = (tenths[index] ?? 0) + 1;
  });
  return tenths.map((value) => value / 10);
}
