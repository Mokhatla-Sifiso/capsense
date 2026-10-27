import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

interface ThemePair {
  light: string;
  dark: string;
}

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const css = read("./globals.css");
const spec = read("../../docs/design/tokens.md");

function themeColours(source: string): Map<string, ThemePair> {
  const colours = new Map<string, ThemePair>();
  const declaration = /--color-([a-z0-9-]+):\s*(?:light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)|(#[0-9a-f]{6}));/g;
  for (const [, name, light, dark, both] of source.matchAll(declaration)) {
    colours.set(`--${name}`, { light: light ?? both ?? "", dark: dark ?? both ?? "" });
  }
  return colours;
}

function section(number: number): string[] {
  const start = spec.indexOf(`## ${number}.`);
  const end = spec.indexOf(`## ${number + 1}.`);
  return spec
    .slice(start, end)
    .split("\n")
    .filter((line) => line.startsWith("| `--"));
}

const cells = (line: string) => line.split("|").map((cell) => cell.trim());
const hexes = (cell: string) => [...cell.matchAll(/#[0-9a-f]{6}/gi)].map(([hex]) => hex.toLowerCase());

function tokenNames(cell: string): string[] {
  const [first = "", ...rest] = [...cell.matchAll(/`(-{1,2}[a-z0-9-]+)`/g)].map(([, name = ""]) => name);
  const stem = first.slice(0, first.lastIndexOf("-"));
  return [first, ...rest.map((name) => (name.startsWith("--") ? name : `${stem}${name}`))];
}

function specColours(): Map<string, ThemePair> {
  const colours = new Map<string, ThemePair>();
  for (const line of section(1)) {
    const [, token = "", , lightCell = "", darkCell = ""] = cells(line);
    const names = tokenNames(token);
    const light = hexes(lightCell);
    const dark = darkCell === "Same" ? light : hexes(darkCell);
    if (light.length !== names.length || dark.length !== names.length) continue;
    names.forEach((name, index) => colours.set(name, { light: light[index] ?? "", dark: dark[index] ?? "" }));
  }
  for (const line of section(2)) {
    const [, token = "", , , derived = ""] = cells(line);
    const [name = ""] = tokenNames(token);
    const [value = ""] = hexes(derived);
    colours.set(name, { light: value, dark: value });
  }
  return colours;
}

function luminance(hex: string): number {
  const channel = (start: number) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(first: string, second: string): number {
  const [one, two] = [luminance(first), luminance(second)] as const;
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

const theme = themeColours(css);
const TEXT = 4.5;
const GRAPHIC = 3;
const CATEGORIES = ["groceries", "entertainment", "transportation", "dining", "shopping", "utilities", "neutral"];

const pairs: [string, string, number][] = [
  ...["frame", "window", "card", "row", "selected"].flatMap((background): [string, string, number][] => [
    ["foreground", background, TEXT],
    ["muted-foreground", background, TEXT],
  ]),
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
  ...CATEGORIES.flatMap((category): [string, string, number][] => [
    ["chip-glyph", `category-${category}`, GRAPHIC],
    [`category-${category}`, "card", GRAPHIC],
    [`category-${category}`, "row", GRAPHIC],
  ]),
];

describe("theme colours match the approved design tokens", () => {
  const expected = [...specColours()];

  it("reads every colour token from the spec", () => {
    expect(expected).toHaveLength(44);
  });

  it.each(expected)("%s", (name, values) => {
    expect(theme.get(name)).toEqual(values);
  });
});

describe.each(["light", "dark"] as const)("in %s mode, text and graphics stay readable", (mode) => {
  it.each(pairs)("%s on %s reaches %d to 1", (foreground, background, minimum) => {
    const front = theme.get(`--${foreground}`);
    const back = theme.get(`--${background}`);
    if (!front || !back) throw new Error(`Missing colour ${foreground} or ${background}`);
    expect(contrast(front[mode], back[mode])).toBeGreaterThanOrEqual(minimum);
  });
});
