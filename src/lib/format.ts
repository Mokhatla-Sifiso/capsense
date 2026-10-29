const LOCALE = "en-ZA";
const HOME_CURRENCY = "ZAR";
const NO_BREAK_SPACE = " ";
const ANY_SPACE = /\s/g;
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

export function formatDay(isoDay: string): string {
  const day = Number(isoDay.slice(8, 10));
  const month = SHORT_MONTHS[Number(isoDay.slice(5, 7)) - 1];
  const year = isoDay.slice(0, 4);
  return `${day} ${month} ${year}`;
}

export function formatLongDay(isoDay: string): string {
  const day = Number(isoDay.slice(8, 10));
  const month = MONTHS[Number(isoDay.slice(5, 7)) - 1];
  const year = isoDay.slice(0, 4);
  const weekday = WEEKDAYS[new Date(`${isoDay}T00:00:00Z`).getUTCDay()];
  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatWholeCurrency(amount: number, currency: string): string {
  const format = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency,
    currencyDisplay: currency === HOME_CURRENCY ? "symbol" : "code",
    maximumFractionDigits: 0,
  });
  return keepOnOneLine(format.format(amount));
}

export function formatMonth(isoMonth: string): string {
  return `${MONTHS[Number(isoMonth.slice(5, 7)) - 1]} ${isoMonth.slice(0, 4)}`;
}

export function formatShortMonth(isoMonth: string, withYear: boolean): string {
  const month = SHORT_MONTHS[Number(isoMonth.slice(5, 7)) - 1];
  return withYear ? `${month} ${isoMonth.slice(2, 4)}` : `${month}`;
}
