import { SPEC_PERIOD_OPTIONS, periodLabel, periodOptions } from "./period-options";

describe("periodOptions", () => {
  it("uses the labels the filters endpoint sends", () => {
    const presets = [
      { label: "This week", value: "7d" },
      { label: "This month", value: "30d" },
    ];
    expect(periodOptions(presets)).toEqual(presets);
  });

  it("leaves out values the dashboard can't ask for", () => {
    const presets = [
      { label: "Last 30 days", value: "30d" },
      { label: "Last 6 months", value: "6m" },
    ];
    expect(periodOptions(presets)).toEqual([{ label: "Last 30 days", value: "30d" }]);
  });

  it.each([
    ["nothing was sent", undefined],
    ["the list is empty", []],
    ["no value is usable", [{ label: "Forever", value: "all" }]],
  ])("falls back to the four spec periods when %s", (_, presets) => {
    expect(periodOptions(presets)).toBe(SPEC_PERIOD_OPTIONS);
  });
});

describe("periodLabel", () => {
  it("uses the endpoint's label, then the spec's when the endpoint has none for that period", () => {
    expect(periodLabel([{ label: "This month", value: "30d" }], "30d")).toBe("This month");
    expect(periodLabel([{ label: "This month", value: "30d" }], "90d")).toBe("Last 90 days");
    expect(periodLabel(undefined, "1y")).toBe("Last year");
  });
});
