import { NOW_HEADER, requestInstant } from "./clock";

const withNow = (value: string) => new Headers({ [NOW_HEADER]: value });

describe("requestInstant", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the real clock by default", () => {
    vi.useFakeTimers({ now: new Date("2024-09-16T07:15:00Z") });
    expect(requestInstant(new Headers(), false).toISOString()).toBe("2024-09-16T07:15:00.000Z");
  });

  it("ignores the test header when the test switch is off", () => {
    vi.useFakeTimers({ now: new Date("2024-09-16T07:15:00Z") });
    expect(requestInstant(withNow("2024-09-16T15:00:00Z"), false).toISOString()).toBe("2024-09-16T07:15:00.000Z");
  });

  it("uses the test header when the test switch is on", () => {
    expect(requestInstant(withNow("2024-09-16T09:59:30Z"), true).toISOString()).toBe("2024-09-16T09:59:30.000Z");
  });

  it("falls back to the real clock when the test header isn't a date", () => {
    vi.useFakeTimers({ now: new Date("2024-09-16T07:15:00Z") });
    expect(requestInstant(withNow("soon"), true).toISOString()).toBe("2024-09-16T07:15:00.000Z");
  });
});
