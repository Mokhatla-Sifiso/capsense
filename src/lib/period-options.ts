import { PERIODS, type Period } from "@/schemas/api";

export interface PeriodOption {
  value: Period;
  label: string;
}

interface Preset {
  label: string;
  value: string;
}

export const SPEC_PERIOD_OPTIONS: readonly PeriodOption[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

export function isPeriod(value: string): value is Period {
  return PERIODS.some((period) => period === value);
}

export function periodOptions(presets: readonly Preset[] = []): readonly PeriodOption[] {
  const known = presets.filter((preset): preset is PeriodOption => isPeriod(preset.value));
  return known.length > 0 ? known : SPEC_PERIOD_OPTIONS;
}
