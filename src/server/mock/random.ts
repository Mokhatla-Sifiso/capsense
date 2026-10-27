export type Random = () => number;

const MULTIPLIER = 1_664_525;
const INCREMENT = 1_013_904_223;
const MODULUS = 2 ** 32;

export function seededRandom(seed: number): Random {
  let state = seed;
  return () => {
    state = (state * MULTIPLIER + INCREMENT) % MODULUS;
    return state / MODULUS;
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
