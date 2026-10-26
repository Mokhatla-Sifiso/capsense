import type { Period } from "@/schemas/api";

export interface Merchant {
  name: string;
  description: string;
  paymentMethod: string;
}

export interface CategoryProfile {
  name: string;
  color: string;
  icon: string;
  dailyChance: number;
  minCents: number;
  maxCents: number;
  merchants: readonly Merchant[];
}

export interface Budget {
  id: string;
  category: string;
  monthlyBudgetCents: number;
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  joinDate: string;
  accountType: string;
  currency: string;
}

export interface PeriodPreset {
  value: Period;
  label: string;
  days: number;
}

export const CUSTOMER: Customer = {
  customerId: "12345",
  name: "John Doe",
  email: "john.doe@email.com",
  joinDate: "2023-01-15",
  accountType: "premium",
  currency: "ZAR",
};

export const PERIOD_PRESETS: readonly PeriodPreset[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "1y", label: "Last year", days: 365 },
];

export const BUDGETS: readonly Budget[] = [
  { id: "goal_001", category: "Entertainment", monthlyBudgetCents: 100_000 },
  { id: "goal_002", category: "Groceries", monthlyBudgetCents: 150_000 },
];

export const CATEGORIES: readonly CategoryProfile[] = [
  {
    name: "Groceries",
    color: "#FF6B6B",
    icon: "shopping-cart",
    dailyChance: 0.4,
    minCents: 3_000,
    maxCents: 18_000,
    merchants: [
      { name: "Pick n Pay", description: "Weekly groceries", paymentMethod: "Credit Card" },
      { name: "Checkers", description: "Top-up shop", paymentMethod: "Debit Card" },
      { name: "Woolworths Food", description: "Groceries", paymentMethod: "Credit Card" },
      { name: "Spar", description: "Convenience groceries", paymentMethod: "Debit Card" },
    ],
  },
  {
    name: "Entertainment",
    color: "#4ECDC4",
    icon: "film",
    dailyChance: 0.2,
    minCents: 5_000,
    maxCents: 17_000,
    merchants: [
      { name: "Netflix", description: "Monthly subscription", paymentMethod: "Debit Order" },
      { name: "Ster-Kinekor", description: "Movie tickets", paymentMethod: "Credit Card" },
      { name: "Spotify", description: "Music subscription", paymentMethod: "Debit Order" },
      { name: "Computicket", description: "Event tickets", paymentMethod: "Credit Card" },
    ],
  },
  {
    name: "Transportation",
    color: "#45B7D1",
    icon: "car",
    dailyChance: 0.37,
    minCents: 2_500,
    maxCents: 9_500,
    merchants: [
      { name: "Uber", description: "Trip", paymentMethod: "Credit Card" },
      { name: "Bolt", description: "Trip", paymentMethod: "Debit Card" },
      { name: "Engen", description: "Fuel", paymentMethod: "Debit Card" },
      { name: "Gautrain", description: "Train fare", paymentMethod: "Debit Card" },
    ],
  },
  {
    name: "Dining",
    color: "#F7DC6F",
    icon: "utensils",
    dailyChance: 0.27,
    minCents: 4_000,
    maxCents: 9_000,
    merchants: [
      { name: "Nando's", description: "Takeaway", paymentMethod: "Debit Card" },
      { name: "Mugg & Bean", description: "Breakfast", paymentMethod: "Credit Card" },
      { name: "Ocean Basket", description: "Dinner", paymentMethod: "Credit Card" },
      { name: "Kauai", description: "Lunch", paymentMethod: "Debit Card" },
    ],
  },
  {
    name: "Shopping",
    color: "#BB8FCE",
    icon: "shopping-bag",
    dailyChance: 0.17,
    minCents: 3_000,
    maxCents: 15_000,
    merchants: [
      { name: "Takealot", description: "Online order", paymentMethod: "Credit Card" },
      { name: "Mr Price", description: "Clothing", paymentMethod: "Debit Card" },
      { name: "Clicks", description: "Pharmacy and toiletries", paymentMethod: "Debit Card" },
      { name: "Woolworths", description: "Clothing and homeware", paymentMethod: "Credit Card" },
    ],
  },
  {
    name: "Utilities",
    color: "#85C1E9",
    icon: "zap",
    dailyChance: 0.1,
    minCents: 10_000,
    maxCents: 20_000,
    merchants: [
      { name: "City Power", description: "Prepaid electricity", paymentMethod: "Debit Card" },
      { name: "Vodacom", description: "Airtime and data", paymentMethod: "Debit Order" },
      { name: "Rain", description: "Home internet", paymentMethod: "Debit Order" },
    ],
  },
];
