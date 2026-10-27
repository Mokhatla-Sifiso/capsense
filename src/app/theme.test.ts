import { readFileSync } from "node:fs";

type Mode = "light" | "dark";

interface ColourPair {
  light: string;
  dark: string;
}

const both = (hex: string): ColourPair => ({ light: hex, dark: hex });

const SPEC_COLOURS: Record<string, ColourPair> = {
  frame: { light: "#ffffff", dark: "#0f1216" },
  window: { light: "#f4f6fa", dark: "#12161c" },
  card: { light: "#ffffff", dark: "#1a1f27" },
  row: { light: "#f7f7f7", dark: "#222833" },
  soft: { light: "#eef2f9", dark: "#252b35" },
  foreground: { light: "#3a3a3a", dark: "#f2f2f2" },
  "muted-foreground": { light: "#666666", dark: "#a9b0ba" },
  heading: { light: "#0033a0", dark: "#9db8ff" },
  border: { light: "#ededed", dark: "#2a303a" },
  primary: { light: "#2259d0", dark: "#7ea6f7" },
  "primary-foreground": { light: "#ffffff", dark: "#0b1220" },
  ring: { light: "#2f70ef", dark: "#7ea6f7" },
  input: { light: "#767676", dark: "#7d8794" },
  track: { light: "#e6e9f0", dark: "#2c323c" },
  spend: { light: "#0033a0", dark: "#1e3f96" },
  "spend-fg": both("#ffffff"),
  "spend-muted": both("#c9d6f2"),
  "spend-subtle": both("#d6e0f5"),
  "spend-line": { light: "#2b52b3", dark: "#3a5bb0" },
  "spend-blob-1": { light: "#0a3daa", dark: "#2449a3" },
  "spend-blob-2": { light: "#1448b5", dark: "#2a52b0" },
  "on-spend-button-bg": both("#ffffff"),
  "on-spend-button-fg": both("#0033a0"),
  bar: { light: "#6e8fe0", dark: "#5c73a3" },
  "bar-selected": { light: "#0033a0", dark: "#7ea6f7" },
  "bar-selected-fg": { light: "#ffffff", dark: "#0b1220" },
  "tooltip-bg": { light: "#0033a0", dark: "#f2f2f2" },
  "tooltip-fg": { light: "#ffffff", dark: "#0b1220" },
  selected: { light: "#e8effd", dark: "#243049" },
  skeleton: { light: "#e9edf3", dark: "#252b35" },
  "success-text": { light: "#166534", dark: "#4ade80" },
  "warning-text": { light: "#92400e", dark: "#fbbf24" },
  "warning-ring": { light: "#b45309", dark: "#fbbf24" },
  "warning-surface": { light: "#fbf0e1", dark: "#2a2416" },
  "danger-text": { light: "#b91c1c", dark: "#fca5a5" },
  "danger-border": { light: "#f3c7c7", dark: "#5b2a2a" },
  "chip-glyph": both("#ffffff"),
  "category-groceries": both("#cc5656"),
  "category-entertainment": both("#348983"),
  "category-transportation": both("#328699"),
  "category-dining": both("#8a7b3e"),
  "category-shopping": both("#926fa0"),
  "category-utilities": both("#59819b"),
  "category-neutral": both("#768190"),
};

const TEXT = 4.5;
const GRAPHIC = 3;
const CATEGORIES = ["groceries", "entertainment", "transportation", "dining", "shopping", "utilities", "neutral"];

const READABLE_PAIRS: [string, string, number][] = [
  ["foreground", "frame", TEXT],
  ["foreground", "window", TEXT],
  ["foreground", "card", TEXT],
  ["foreground", "row", TEXT],
  ["foreground", "selected", TEXT],
  ["muted-foreground", "frame", TEXT],
  ["muted-foreground", "window", TEXT],
  ["muted-foreground", "card", TEXT],
  ["muted-foreground", "row", TEXT],
  ["muted-foreground", "selected", TEXT],
  ["heading", "soft", TEXT],
  ["heading", "card", TEXT],
  ["primary", "card", TEXT],
  ["primary", "window", TEXT],
  ["primary-foreground", "primary", TEXT],
  ["spend-fg", "spend", TEXT],
  ["spend-muted", "spend", TEXT],
  ["spend-subtle", "spend", TEXT],
  ["on-spend-button-fg", "on-spend-button-bg", TEXT],
  ["tooltip-fg", "tooltip-bg", TEXT],
  ["bar-selected-fg", "bar-selected", TEXT],
  ["success-text", "card", TEXT],
  ["success-text", "row", TEXT],
  ["warning-text", "card", TEXT],
  ["warning-text", "warning-surface", TEXT],
  ["danger-text", "card", TEXT],
  ["ring", "card", GRAPHIC],
  ["ring", "window", GRAPHIC],
  ["input", "card", GRAPHIC],
  ["bar", "card", GRAPHIC],
  ["bar-selected", "card", GRAPHIC],
  ["primary", "row", GRAPHIC],
  ["primary", "track", GRAPHIC],
  ["warning-ring", "track", GRAPHIC],
];

for (const category of CATEGORIES) {
  READABLE_PAIRS.push(["chip-glyph", `category-${category}`, GRAPHIC]);
  READABLE_PAIRS.push([`category-${category}`, "card", GRAPHIC]);
  READABLE_PAIRS.push([`category-${category}`, "row", GRAPHIC]);
}

function luminance(hex: string): number {
  const channel = (start: number): number => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(first: string, second: string): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function colourIn(name: string, mode: Mode): string {
  const colour = SPEC_COLOURS[name];
  if (!colour) throw new Error(`No spec colour called ${name}`);
  return colour[mode];
}

const css = readFileSync("src/app/globals.css", "utf8");

describe("theme colours match the design spec (docs/design/tokens.md)", () => {
  it.each(Object.entries(SPEC_COLOURS))("%s", (name, { light, dark }) => {
    const value = light === dark ? light : `light-dark(${light}, ${dark})`;
    expect(css).toContain(`--color-${name}: ${value};`);
  });
});

describe.each(["light", "dark"] as const)("in %s mode, text and graphics stay readable", (mode) => {
  it.each(READABLE_PAIRS)("%s on %s reaches %d to 1", (front, back, minimum) => {
    expect(contrast(colourIn(front, mode), colourIn(back, mode))).toBeGreaterThanOrEqual(minimum);
  });
});
