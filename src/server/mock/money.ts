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

interface Share {
  exactTenths: number;
  tenths: number;
}

export function sharesOfTotal(amounts: readonly number[]): number[] {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (total === 0) return amounts.map(() => 0);

  const shares: Share[] = amounts.map((amount) => {
    const exactTenths = (amount / total) * 1000;
    return { exactTenths, tenths: Math.floor(exactTenths) };
  });

  const leftOver = (share: Share) => share.exactTenths - share.tenths;
  let missingTenths = 1000 - shares.reduce((sum, share) => sum + share.tenths, 0);
  const closestToNextTenth = [...shares].sort((a, b) => leftOver(b) - leftOver(a));
  for (const share of closestToNextTenth) {
    if (missingTenths === 0) break;
    share.tenths += 1;
    missingTenths -= 1;
  }

  return shares.map((share) => share.tenths / 10);
}
