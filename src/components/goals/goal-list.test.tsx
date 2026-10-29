import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { makeQueryClient } from "@/lib/query/query-client";
import type { Goal } from "@/schemas/api";
import { server } from "@/test/msw";
import { specGoals } from "@/test/spec-samples";
import { GoalList } from "./goal-list";

const GOALS_PATH = "*/api/customers/:customerId/goals";
const ICONS = {
  success: <span data-testid="success-icon" />,
  warning: <span data-testid="warning-icon" />,
  over: <span data-testid="over-icon" />,
  noBudget: <span data-testid="no-budget-icon" />,
  problem: null,
};
const [entertainment, groceries] = specGoals.goals as [Goal, Goal];

const readable = (text: string | null | undefined) => (text ?? "").replace(/\s/g, " ");
const goal = (changes: Partial<Goal>): Goal => ({ ...entertainment, ...changes });
const cards = () => screen.findAllByRole("article");
const card = async (name: string) => {
  const all = await cards();
  const found = all.find((article) => within(article).queryByRole("heading", { name }));
  if (!found) throw new Error(`no goal ${name}`);
  return found;
};
const lines = (article: HTMLElement) => [...article.querySelectorAll("p")].map((line) => readable(line.textContent));

function answerGoals(goals: object[]) {
  server.use(http.get(GOALS_PATH, () => HttpResponse.json({ goals })));
}

function renderGoals() {
  const client = makeQueryClient();
  render(
    <QueryClientProvider client={client}>
      <GoalList monthDays={30} icons={ICONS} />
    </QueryClientProvider>,
  );
  return client;
}

describe("GoalList", () => {
  it("shows placeholders under the heading while it loads", async () => {
    renderGoals();
    expect(await screen.findByRole("heading", { name: "Spending goals" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Spending goals" })).toHaveAttribute("aria-busy", "true");
  });

  it("shows each goal in the order returned, with its ring, status, amounts, projection and pace", async () => {
    renderGoals();
    expect((await cards()).map((article) => within(article).getByRole("heading").textContent)).toEqual([
      "Entertainment",
      "Groceries",
    ]);
    expect(readable(screen.getByText(/^This month/).textContent)).toBe("This month · 12 days left");
    const first = await card("Entertainment");
    const ring = within(first).getByRole("progressbar", { name: "Entertainment" });
    expect(ring).toHaveAttribute("aria-valuenow", "65.03");
    expect(readable(ring.getAttribute("aria-valuetext"))).toBe("65,0% used");
    expect(lines(first)).toEqual([
      "On track",
      "R 650,30 of R 1 000,00",
      "Projected R 1 083,83 of R 1 000,00",
      "On pace to exceed by R 83,83",
    ]);
    expect(within(first).getByTestId("success-icon")).toBeInTheDocument();
    expect(first.querySelector(".stroke-primary")).not.toBeNull();
  });

  it("shows a warning goal with an amber ring, Close to limit and its icon", async () => {
    renderGoals();
    const second = await card("Groceries");
    expect(lines(second)[0]).toBe("Close to limit");
    expect(within(second).getByTestId("warning-icon")).toBeInTheDocument();
    expect(second.querySelector(".stroke-warning-ring")).not.toBeNull();
    expect(readable(within(second).getByRole("progressbar").getAttribute("aria-valuetext"))).toBe("96,7% used");
    expect(within(second).getByText("97%")).toBeInTheDocument();
  });

  it("shows R 1 600 of R 1 500 as over budget by R 100,00, with a full ring that keeps its colour", async () => {
    answerGoals([goal({ monthlyBudget: 1500, currentSpent: 1600, percentageUsed: 106.67, status: "on_track" })]);
    renderGoals();
    const over = await card("Entertainment");
    expect(lines(over)).toContain("Over budget by R 100,00");
    expect(lines(over).some((line) => line.startsWith("On pace"))).toBe(false);
    expect(within(over).getByTestId("over-icon")).toBeInTheDocument();
    expect(within(over).getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    expect(within(over).getByText("107%")).toBeInTheDocument();
    expect(over.querySelector(".stroke-primary")).not.toBeNull();
  });

  it("is not over budget when spent equals the budget", async () => {
    answerGoals([goal({ monthlyBudget: 1500, currentSpent: 1500, percentageUsed: 100, daysRemaining: 0 })]);
    renderGoals();
    expect(lines(await card("Entertainment")).some((line) => line.startsWith("Over budget"))).toBe(false);
  });

  it("says it is too early to project on day 0", async () => {
    answerGoals([goal({ currentSpent: 0, percentageUsed: 0, daysRemaining: 30 })]);
    renderGoals();
    expect(lines(await card("Entertainment"))).toEqual(["On track", "R 0,00 of R 1 000,00", "Too early to project"]);
  });

  it("shows a goal without a budget as its spend and No budget set, with no ring or projection", async () => {
    answerGoals([goal({ category: "Groceries", monthlyBudget: 0, currentSpent: 1450.8, percentageUsed: 0 })]);
    renderGoals();
    const plain = await card("Groceries");
    expect(lines(plain)).toEqual(["On track", "R 1 450,80", "No budget set"]);
    expect(within(plain).queryByRole("progressbar")).not.toBeInTheDocument();
    expect(within(plain).getByTestId("no-budget-icon")).toBeInTheDocument();
  });

  it("shows an unlisted status in plain words without an icon, and no status line when it is missing", async () => {
    const { status: _status, ...withoutStatus } = groceries;
    answerGoals([goal({ status: "over_budget" }), withoutStatus]);
    renderGoals();
    const unlisted = await card("Entertainment");
    expect(lines(unlisted)[0]).toBe("Over budget");
    expect(within(unlisted).queryByTestId("success-icon")).not.toBeInTheDocument();
    expect(lines(await card("Groceries"))[0]).toBe("R 1 450,80 of R 1 500,00");
  });

  it("gives each goal its own days left when they differ", async () => {
    answerGoals([goal({ daysRemaining: 1 }), { ...groceries, daysRemaining: 0 }]);
    renderGoals();
    expect(lines(await card("Entertainment"))).toContain("1 day left");
    expect(lines(await card("Groceries"))).toContain("Last day");
    expect(screen.getByText("This month")).toBeInTheDocument();
  });

  it("shows every goal, including 25 of them and a repeated id", async () => {
    answerGoals(Array.from({ length: 25 }, (_, index) => goal({ id: index < 2 ? "goal_same" : `goal_${index}` })));
    renderGoals();
    expect(await cards()).toHaveLength(25);
  });

  it("shows the empty message without a caption when there are no goals", async () => {
    answerGoals([]);
    renderGoals();
    expect(await screen.findByText("No spending goals yet")).toBeInTheDocument();
    expect(screen.queryByText(/^This month/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows an error with Retry, and Retry asks again", async () => {
    let calls = 0;
    server.use(
      http.get(GOALS_PATH, () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(specGoals);
      }),
    );
    renderGoals();
    expect(await screen.findByText("Couldn't load goals")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await cards()).toHaveLength(2);
    expect(calls).toBe(2);
  });
});

describe("refresh failure", () => {
  it("keeps the earlier goals when a refresh fails, and Retry asks for them again", async () => {
    const client = renderGoals();
    await screen.findAllByRole("article");
    let calls = 0;
    server.use(
      http.get(GOALS_PATH, () => {
        calls += 1;
        return calls === 1 ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(specGoals);
      }),
    );
    await act(() => client.refetchQueries());
    expect(await screen.findByText("Couldn't refresh goals. Showing earlier data.")).toBeInTheDocument();
    expect(screen.getAllByRole("article")[0]).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.queryByText(/^Couldn't refresh/)).not.toBeInTheDocument());
    expect(calls).toBe(2);
  });
});
