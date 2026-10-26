import { between, pick, seededRandom } from "./random";

describe("seeded random numbers", () => {
  it("repeats the same sequence for the same seed", () => {
    const first = seededRandom(7);
    const second = seededRandom(7);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("stays inside the requested range", () => {
    const random = seededRandom(1);
    const values = Array.from({ length: 500 }, () => between(random, 3, 5));
    expect(Math.min(...values)).toBe(3);
    expect(Math.max(...values)).toBe(5);
  });

  it("picks from the options given and refuses an empty list", () => {
    const random = seededRandom(1);
    expect(["a", "b"]).toContain(pick(random, ["a", "b"]));
    expect(() => pick(random, [])).toThrow();
  });
});
