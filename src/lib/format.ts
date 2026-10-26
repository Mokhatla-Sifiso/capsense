const LOCALE = "en-ZA";
const HOME_CURRENCY = "ZAR";
const NO_BREAK_SPACE = " ";
const ANY_SPACE = /\s/g;

const countFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const percentFormat = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const currencyFormats = new Map<string, Intl.NumberFormat>();

function keepOnOneLine(text: string): string {
  return text.replace(ANY_SPACE, NO_BREAK_SPACE);
}

function currencyFormat(currency: string): Intl.NumberFormat {
  const cached = currencyFormats.get(currency);
  if (cached) return cached;
  const format = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    currencyDisplay: currency === HOME_CURRENCY ? "symbol" : "code",
  });
  currencyFormats.set(currency, format);
  return format;
}

export function formatCurrency(amount: number, currency: string): string {
  return keepOnOneLine(currencyFormat(currency).format(amount));
}

export function formatCount(value: number): string {
  return keepOnOneLine(countFormat.format(value));
}

export function formatPercent(value: number): string {
  return keepOnOneLine(percentFormat.format(value / 100));
}
