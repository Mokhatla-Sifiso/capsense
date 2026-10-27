import { specProfile } from "@/test/spec-samples";
import { dayPartAt, firstName, greetingText, profileSummary } from "./greeting";

describe("dayPartAt uses South African time, whatever the device's time zone", () => {
  it.each([
    ["2024-09-16T02:59:59Z", "evening"],
    ["2024-09-16T03:00:00Z", "morning"],
    ["2024-09-16T07:15:00Z", "morning"],
    ["2024-09-16T09:59:59Z", "morning"],
    ["2024-09-16T10:00:00Z", "afternoon"],
    ["2024-09-16T15:59:59Z", "afternoon"],
    ["2024-09-16T16:00:00Z", "evening"],
    ["2024-09-16T21:59:59Z", "evening"],
    ["2024-09-16T22:00:00Z", "evening"],
  ])("%s is %s", (instant, expected) => {
    expect(dayPartAt(new Date(instant))).toBe(expected);
  });
});

describe("firstName", () => {
  it.each([
    ["John Doe", "John"],
    ["  John   Doe  ", "John"],
    ["John", "John"],
    ["J. Doe", "J. Doe"],
    ["J Doe", "J Doe"],
    ["", null],
    ["   ", null],
  ])("%j gives %j", (name, expected) => {
    expect(firstName(name)).toBe(expected);
  });
});

describe("greetingText", () => {
  it("adds the name after a comma, or leaves the comma out when there is no name", () => {
    expect(greetingText("morning", "John")).toBe("Good morning, John");
    expect(greetingText("evening", null)).toBe("Good evening");
  });
});

describe("profileSummary", () => {
  const today = "2024-09-16";

  it("reads name · account type · customer since", () => {
    expect(profileSummary(specProfile, today)).toBe("John Doe · Premium · Customer since 15 Jan 2023");
  });

  it("writes any account type as a word", () => {
    expect(profileSummary({ ...specProfile, accountType: "GOLD" }, today)).toContain("Gold");
  });

  it("hides a join date in the future", () => {
    expect(profileSummary({ ...specProfile, joinDate: "2099-01-01" }, today)).toBe("John Doe · Premium");
  });

  it("leaves out an empty name", () => {
    expect(profileSummary({ ...specProfile, name: " " }, today)).toBe("Premium · Customer since 15 Jan 2023");
  });

  it("never includes the customer ID, email or lifetime spend", () => {
    const summary = profileSummary(specProfile, today);
    expect(summary).not.toContain("12345");
    expect(summary).not.toContain("john.doe@email.com");
    expect(summary).not.toContain("15420");
  });
});
