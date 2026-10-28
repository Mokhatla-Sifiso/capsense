import { changeStatement } from "./change-statement";

describe("changeStatement", () => {
  it.each([
    [12.5, "up", "Up 12,5% on previous period"],
    [-3.2, "down", "Down 3,2% on previous period"],
    [0, "same", "No change on previous period"],
    [999.9, "up", "Up 999,9% on previous period"],
  ])("puts %s into words", (change, direction, text) => {
    expect(changeStatement(change)).toEqual({ direction, text });
  });

  it("says nothing when the change wasn't sent", () => {
    expect(changeStatement(undefined)).toBeNull();
  });
});
