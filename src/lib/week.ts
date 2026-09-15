/** Woche beginnt Montag, passend zu Postgres' date_trunc('week', ...). */
export function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sonntag
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatWeekLabel(weekStartIso: string): string {
  const start = new Date(weekStartIso + "T00:00:00");
  const end = addWeeks(start, 1);
  end.setDate(end.getDate() - 1);
  const fmt = (d: Date) =>
    d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  return `${fmt(start)}–${fmt(end)}`;
}

export function currentWeekStartIso(): string {
  return toIsoDate(mondayOf(new Date()));
}

export function nextWeekStartIso(): string {
  return toIsoDate(mondayOf(addWeeks(new Date(), 1)));
}
