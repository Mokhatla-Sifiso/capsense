import type { Goal } from "@/schemas/api";
import { specGoals } from "@/test/spec-samples";
import {
  daysInMonth,
  daysLeft,
  goalStatus,
  paceLine,
  projection,
  ringCentre,
  ringFill,
  sharedDaysLeft,
  usedValue,
} from "./goal-cards";

const readable = (text: string) => text.replace(/ /g, " ");
const [entertainment, groceries] = specGoals.goals as [Goal, Goal];
const goal = (changes: Partial<Goal>): Goal => ({ ...entertainment, ...changes });

describe("goalStatus", () => {
  it.each([
    ["on_track", { tone: "success", words: "On track" }],
    ["warning", { tone: "warning", words: "Close to limit" }],
    ["over_budget", { tone: "muted", words: "Over budget" }],
    ["PAUSED", { tone: "muted", words: "Paused" }],
  ])("shows %s as given, in words", (status, line) => {
    expect(goalStatus(status)).toEqual(line);
  });

  it.each([undefined, "", " _ "])("has no status line for %j", (status) => {
    expect(goalStatus(status)).toBeNull();
  });
});

describe("daysLeft", () => {
  it.each([
    [12, "12 days left"],
    [1, "1 day left"],
    [0, "Last day"],
    [-1, "—"],
  ])("reads %i as %s", (days, words) => {
    expect(daysLeft(days)).toBe(words);
  });
});

describe("sharedDaysLeft", () => {
  it("gives the days left when every goal has the same", () => {
    expect(sharedDaysLeft(specGoals.goals)).toBe("12 days left");
  });

  it("gives nothing when the goals differ, so each goal shows its own", () => {
    expect(sharedDaysLeft([entertainment, { ...groceries, daysRemaining: 3 }])).toBeNull();
  });
});

describe("daysInMonth", () => {
  it.each([
    ["2024-09-16", 30],
    ["2024-08-01", 31],
    ["2024-02-10", 29],
    ["2023-02-10", 28],
  ])("counts the days in the month of %s", (day, days) => {
    expect(daysInMonth(day)).toBe(days);
  });
});

describe("projection", () => {
  it("projects R 650,30 with 12 of 30 days left to R 1 083,83", () => {
    expect(projection(entertainment, 30)).toEqual({ kind: "projected", amount: 1083.83 });
  });

  it("projects R 650,30 with 12 of 31 days left to R 1 061,02 (TC-078)", () => {
    expect(projection(entertainment, 31)).toEqual({ kind: "projected", amount: 1061.02 });
  });

  it("is too early to project on day 0, without dividing by zero", () => {
    expect(projection(goal({ daysRemaining: 30 }), 30)).toEqual({ kind: "early" });
  });

  it("projects R 0,00 when nothing is spent yet", () => {
    expect(projection(goal({ currentSpent: 0 }), 30)).toEqual({ kind: "projected", amount: 0 });
  });

  it.each([
    ["more days left than the month has", { daysRemaining: 35 }],
    ["negative days left", { daysRemaining: -1 }],
    ["no budget", { monthlyBudget: 0 }],
  ])("has no projection with %s", (_case, changes) => {
    expect(projection(goal(changes), 30)).toBeNull();
  });
});

describe("paceLine", () => {
  it("is on pace to exceed by R 83,83 when the projection passes the budget", () => {
    expect(paceLine(entertainment, projection(entertainment, 30))).toEqual({ kind: "pace", by: 83.83 });
  });

  it("is over budget by R 100,00 when R 1 600 is spent of R 1 500", () => {
    const over = goal({ currentSpent: 1600, monthlyBudget: 1500 });
    expect(paceLine(over, projection(over, 30))).toEqual({ kind: "over", by: 100 });
  });

  it("is not over budget when spent equals the budget", () => {
    const level = goal({ currentSpent: 1500, monthlyBudget: 1500, daysRemaining: 0 });
    expect(paceLine(level, projection(level, 30))).toBeNull();
  });

  it("has no line when the projection stays within budget", () => {
    const steady = goal({ currentSpent: 100 });
    expect(paceLine(steady, projection(steady, 30))).toBeNull();
  });

  it("has no line without a budget", () => {
    expect(paceLine(goal({ monthlyBudget: 0 }), null)).toBeNull();
  });
});

describe("ring values", () => {
  it.each([
    [65.03, 65.03, "65%", "65,0% used"],
    [96.72, 96.72, "97%", "96,7% used"],
    [106.67, 100, "107%", "106,7% used"],
    [0, 0, "0%", "0,0% used"],
  ])("shows %s per cent as a fill of %s, %s in the centre and %s", (percent, fill, centre, used) => {
    expect(ringFill(percent)).toBe(fill);
    expect(ringCentre(percent)).toBe(centre);
    expect(readable(usedValue(percent))).toBe(used);
  });
});
