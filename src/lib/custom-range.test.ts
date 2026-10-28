import { rangeProblem } from "./custom-range";

const TODAY = "2024-09-16";

describe("rangeProblem", () => {
  it.each([
    ["2024-09-01", "2024-09-10", null],
    ["2024-09-16", "2024-09-16", null],
    ["2023-09-17", "2024-09-16", null],
    ["2023-09-16", "2024-09-16", "Choose a range of 366 days or fewer"],
    ["2024-09-10", "2024-09-01", "Start date must be on or before end date"],
    ["2024-09-01", "", "Enter both a start and an end date"],
    ["", "2024-09-10", "Enter both a start and an end date"],
    ["2024-09-01", "2024-09-17", "Dates can't be after 16 Sep 2024"],
    ["2024-09-20", "2024-09-10", "Dates can't be after 16 Sep 2024"],
  ])("%s to %s → %s", (from, to, expected) => {
    expect(rangeProblem(from, to, TODAY)).toBe(expected);
  });
});
