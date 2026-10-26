import { addDays, dayOfMonth, daysBetween, daysInMonth, isWithin, monthsBetween, startOfMonth } from "./calendar";

describe("calendar", () => {
  it("adds and subtracts days across month and year ends", () => {
    expect(addDays("2024-09-16", -29)).toBe("2024-08-18");
    expect(addDays("2023-12-31", 1)).toBe("2024-01-01");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("counts the days between two dates", () => {
    expect(daysBetween("2024-09-10", "2024-09-16")).toBe(6);
  });

  it("knows month lengths, including leap years", () => {
    expect(daysInMonth("2024-09-16")).toBe(30);
    expect(daysInMonth("2024-02-10")).toBe(29);
    expect(daysInMonth("2023-02-10")).toBe(28);
  });

  it("finds the first day and the day number of a month", () => {
    expect(startOfMonth("2024-09-16")).toBe("2024-09-01");
    expect(dayOfMonth("2024-09-16")).toBe(16);
  });

  it("lists every month between two dates", () => {
    expect(monthsBetween("2023-11-15", "2024-02-03")).toEqual(["2023-11", "2023-12", "2024-01", "2024-02"]);
  });

  it("includes both ends of a window", () => {
    const window = { start: "2024-09-10", end: "2024-09-16" };
    expect(isWithin("2024-09-10", window)).toBe(true);
    expect(isWithin("2024-09-16", window)).toBe(true);
    expect(isWithin("2024-09-17", window)).toBe(false);
  });
});
