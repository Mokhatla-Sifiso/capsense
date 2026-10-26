export type Random = () => number;

export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function pick<T>(random: Random, options: readonly T[]): T {
  const choice = options[Math.floor(random() * options.length)];
  if (choice === undefined) throw new Error("pick needs at least one option");
  return choice;
}

export function between(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}
