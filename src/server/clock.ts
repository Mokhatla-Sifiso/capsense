export const NOW_HEADER = "x-mock-now";

export function requestInstant(headers: Headers, overrideAllowed: boolean): Date {
  const override = overrideAllowed ? headers.get(NOW_HEADER) : null;
  const instant = override ? new Date(override) : new Date();
  return Number.isNaN(instant.getTime()) ? new Date() : instant;
}
