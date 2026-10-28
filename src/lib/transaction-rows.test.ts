import { transactionMeta, transactionWhen, uniqueById } from "./transaction-rows";

const row = {
  id: "txn_123456",
  date: "2024-09-16T14:30:00Z",
  merchant: "Pick n Pay",
  category: "Groceries",
  amount: 245.8,
  description: "Weekly groceries",
  paymentMethod: "Credit Card",
  icon: "shopping-cart",
  categoryColor: "#FF6B6B",
};

describe("transactionWhen", () => {
  it("shows the sample in South African time", () => {
    expect(transactionWhen("2024-09-16T14:30:00Z")).toEqual({ day: "16 Sep 2024", time: "16:30" });
  });

  it("moves a late-evening UTC time to the next South African day", () => {
    expect(transactionWhen("2024-09-15T22:30:00Z")).toEqual({ day: "16 Sep 2024", time: "00:30" });
  });

  it.each(["", "bad"])("has no date for %j", (instant) => {
    expect(transactionWhen(instant)).toBeNull();
  });
});

describe("transactionMeta", () => {
  it("joins the category and payment method", () => {
    expect(transactionMeta(row)).toBe("Groceries · Credit Card");
  });

  it("leaves out an empty payment method", () => {
    expect(transactionMeta({ ...row, paymentMethod: "" })).toBe("Groceries");
  });
});

describe("uniqueById", () => {
  it("keeps the first of two rows with the same id", () => {
    const copy = { ...row, merchant: "Copy" };
    expect(uniqueById([row, copy]).map((transaction) => transaction.merchant)).toEqual(["Pick n Pay"]);
  });
});
