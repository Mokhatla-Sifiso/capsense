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

function keepOnOneLine(text: string): string {
  return text.replace(ANY_SPACE, NO_BREAK_SPACE);
}

const randFormat = new Intl.NumberFormat(LOCALE, { style: "currency", currency: HOME_CURRENCY });

export function formatCurrency(amount: number, currency: string): string {
  const format =
    currency === HOME_CURRENCY
      ? randFormat
      : new Intl.NumberFormat(LOCALE, { style: "currency", currency, currencyDisplay: "code" });
  return keepOnOneLine(format.format(amount));
}

export function formatCount(value: number): string {
  return keepOnOneLine(countFormat.format(value));
}

export function formatPercent(value: number): string {
  return keepOnOneLine(percentFormat.format(value / 100));
}
