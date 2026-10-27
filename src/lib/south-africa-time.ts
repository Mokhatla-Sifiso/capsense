const UTC_OFFSET_HOURS = 2;

export function southAfricaHour(instant: Date): number {
  return (instant.getUTCHours() + UTC_OFFSET_HOURS) % 24;
}

export function formatSouthAfricaTime(instant: Date): string {
  const hours = String(southAfricaHour(instant)).padStart(2, "0");
  const minutes = String(instant.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
