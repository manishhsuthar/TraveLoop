import { format, parseISO } from "date-fns";

export function formatDisplayDate(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return format(date, "dd/MM/yyyy");
}

export function isDateWithinRange(value: string, min: string, max: string): boolean {
  return value >= min && value <= max;
}
