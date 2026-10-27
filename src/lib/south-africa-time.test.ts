import { formatSouthAfricaTime, southAfricaHour } from "./south-africa-time";

describe("South African time", () => {
  it.each([
    ["2024-09-16T07:15:00Z", 9, "09:15"],
    ["2024-09-16T14:05:00Z", 16, "16:05"],
    ["2024-09-16T21:59:00Z", 23, "23:59"],
    ["2024-09-16T22:00:00Z", 0, "00:00"],
  ])("%s is %i o'clock, shown as %s", (instant, hour, shown) => {
    expect(southAfricaHour(new Date(instant))).toBe(hour);
    expect(formatSouthAfricaTime(new Date(instant))).toBe(shown);
  });
});
