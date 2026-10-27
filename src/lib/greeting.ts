import type { Profile } from "@/schemas/api";
import { formatDay } from "./format";
import { southAfricaHour } from "./south-africa-time";

export type DayPart = "morning" | "afternoon" | "evening";

const SINGLE_INITIAL = /^\p{L}\.?$/u;

export function dayPartAt(instant: Date): DayPart {
  const hour = southAfricaHour(instant);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

export function firstName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed === "") return null;
  const [first = trimmed] = trimmed.split(/\s+/);
  return SINGLE_INITIAL.test(first) ? trimmed : first;
}

export function greetingText(dayPart: DayPart, name: string | null): string {
  return name ? `Good ${dayPart}, ${name}` : `Good ${dayPart}`;
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function profileSummary(profile: Profile, today: string): string {
  const parts = [profile.name.trim(), titleCase(profile.accountType.trim())];
  if (profile.joinDate <= today) parts.push(`Customer since ${formatDay(profile.joinDate)}`);
  return parts.filter((part) => part !== "").join(" · ");
}
