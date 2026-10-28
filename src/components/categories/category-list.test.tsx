import { Tag } from "@phosphor-icons/react/ssr";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { makeQueryClient } from "@/lib/query/query-client";
import { server } from "@/test/msw";
import { specCategories } from "@/test/spec-samples";
import { CategoryList } from "./category-list";

const CATEGORIES_PATH = "*/api/customers/:customerId/spending/categories";
const [GROCERIES] = specCategories.categories;

function answerCategories(body: object) {
  server.use(http.get(CATEGORIES_PATH, () => HttpResponse.json(body)));
}

function renderList(searchParams = "") {
  const NuqsAdapter = withNuqsTestingAdapter({ searchParams });
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <NuqsAdapter>
        <CategoryList problem={null} />
      </NuqsAdapter>
    </QueryClientProvider>,
  );
}

const readable = (text: string | null) => (text ?? "").replace(/ /g, " ");
const section = () => screen.getByRole("region", { name: "Spending by category" });
const rows = async () => {
  const list = await screen.findByRole("list");
  return within(list)
    .getAllByRole("listitem")
    .map((row) => readable(row.querySelector(".sr-only")?.textContent ?? null));
};

describe("CategoryList", () => {
  it("shows placeholder rows under the heading while it loads", async () => {
    renderList();
    expect(await screen.findByRole("heading", { name: "Spending by category" })).toBeInTheDocument();
    expect(section()).toHaveAttribute("aria-busy", "true");
  });

  it("lists the sample categories largest first, each read out in one sentence, with the total", async () => {
    renderList();
    expect(await rows()).toEqual([
      "Groceries: R 1 250,30, 29,4% of spending, 15 transactions",
      "Entertainment: R 890,20, 20,9% of spending, 8 transactions",
      "Transportation: R 680,45, 16,0% of spending, 12 transactions",
      "Dining: R 520,30, 12,2% of spending, 9 transactions",
      "Utilities: R 458,70, 10,8% of spending, 3 transactions",
      "Shopping: R 450,80, 10,6% of spending, 6 transactions",
    ]);
    expect(readable(within(section()).getByText(/ total$/).textContent)).toBe("R 4 250,75 total");
    expect(within(section()).getByText("16 Aug 2024 – 16 Sep 2024")).toBeInTheDocument();
  });

  it("shows the rounded share on the ring and the exact share on the phone line, both hidden from screen readers", async () => {
    renderList();
    await rows();
    const ring = within(section()).getByText("29%");
    expect(ring.closest("[aria-hidden]")).not.toBeNull();
    expect(within(section()).getAllByText("· 29,4%", { exact: false })[0]?.closest("[aria-hidden]")).not.toBeNull();
  });

  it("shows the empty message with no rows and no total", async () => {
    answerCategories({ ...specCategories, totalAmount: 0, categories: [] });
    renderList();
    expect(await screen.findByText("No category spending in this period")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByText(/ total$/)).not.toBeInTheDocument();
  });

  it("handles one category, a zero amount, one transaction, a duplicate name and a tie", async () => {
    const row = { ...GROCERIES, color: "nope" };
    answerCategories({
      ...specCategories,
      categories: [
        { ...row, name: "Beta", amount: 10, percentage: 49.9 },
        { ...row, name: "Alpha", amount: 10, percentage: 49.9, transactionCount: 1 },
        { ...row, name: "Alpha", amount: 0, percentage: 0 },
        { ...row, name: "Rare", amount: 0.2, percentage: 0.2 },
      ],
    });
    renderList();
    expect(await rows()).toEqual([
      "Alpha: R 10,00, 49,9% of spending, 1 transaction",
      "Beta: R 10,00, 49,9% of spending, 15 transactions",
      "Rare: R 0,20, 0,2% of spending, 15 transactions",
      "Alpha: R 0,00, 0,0% of spending, 15 transactions",
    ]);
    expect(within(section()).getByText("<1%")).toBeInTheDocument();
    expect(within(section()).getByText("0%")).toBeInTheDocument();
  });

  it("shows a full ring for a single category", async () => {
    answerCategories({ ...specCategories, categories: [{ ...GROCERIES, percentage: 100 }] });
    renderList();
    await rows();
    expect(within(section()).getByText("100%")).toBeInTheDocument();
  });

  it("lists every category when there are more than six", async () => {
    const many = Array.from({ length: 8 }, (_, index) => ({ ...GROCERIES, name: `Category ${index + 1}` }));
    answerCategories({ ...specCategories, categories: many });
    renderList();
    expect(await rows()).toHaveLength(8);
  });

  it("shows the tag icon for an icon it doesn't know", async () => {
    answerCategories({ ...specCategories, categories: [{ ...GROCERIES, name: "Pets", icon: "unknown" }] });
    renderList();
    await rows();
    const { container } = render(<Tag weight="fill" />);
    const tagPath = container.querySelector("path")?.getAttribute("d");
    expect(within(section()).getByRole("listitem").querySelector("svg path")?.getAttribute("d")).toBe(tagPath);
  });

  it("names a single day once", async () => {
    answerCategories({ ...specCategories, dateRange: { startDate: "2024-09-16", endDate: "2024-09-16" } });
    renderList();
    await rows();
    expect(within(section()).getByText("16 Sep 2024")).toBeInTheDocument();
  });

  it("hides the caption but keeps the rows when the date range is missing or not a real date", async () => {
    answerCategories({ ...specCategories, dateRange: { startDate: "2024-13-01", endDate: "2024-09-16" } });
    renderList();
    expect(await rows()).toHaveLength(6);
    expect(within(section()).queryByText(/2024/)).not.toBeInTheDocument();
  });

  it("shows an error with Retry when the date range runs backwards, and Retry asks again", async () => {
    let calls = 0;
    server.use(
      http.get(CATEGORIES_PATH, () => {
        calls += 1;
        return HttpResponse.json(
          calls === 1
            ? { ...specCategories, dateRange: { startDate: "2024-09-16", endDate: "2024-08-16" } }
            : specCategories,
        );
      }),
    );
    renderList();
    expect(await screen.findByText("Couldn't load categories")).toBeInTheDocument();
    await userEvent.click(within(section()).getByRole("button", { name: "Retry" }));
    expect(await rows()).toHaveLength(6);
    expect(calls).toBe(2);
  });

  it("asks for the custom dates when they are on", async () => {
    const asked: string[] = [];
    server.use(
      http.get(CATEGORIES_PATH, ({ request }) => {
        asked.push(new URL(request.url).search);
        return HttpResponse.json(specCategories);
      }),
    );
    renderList("?startDate=2024-09-01&endDate=2024-09-16");
    await rows();
    expect(asked).toEqual(["?startDate=2024-09-01&endDate=2024-09-16"]);
  });
});
