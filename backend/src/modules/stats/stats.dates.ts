type Query = Record<string, unknown>;

export type StatsRange = {
  dateFrom: string;
  dateTo: string;
  endExclusive: Date;
  period: string;
  start: Date;
};

export function dateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function monthKey(value: Date | string) {
  return dateKey(value).slice(0, 7);
}

export function startOfDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function addDays(value: Date, days: number) {
  const date = new Date(value);

  date.setDate(date.getDate() + days);

  return date;
}

export function parseDay(value: unknown) {
  const text = String(value ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;

  return new Date(`${text}T00:00:00`);
}

export function statsRange(query: Query): StatsRange {
  const period = String(query.period ?? "thisMonth");
  const now = new Date();
  let start = new Date(now.getFullYear(), now.getMonth(), 1);
  let endExclusive = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  let activePeriod = period;

  if (period === "last3Months") start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  if (period === "last6Months") start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  if (period === "thisYear") {
    start = new Date(now.getFullYear(), 0, 1);
    endExclusive = new Date(now.getFullYear() + 1, 0, 1);
  }

  if (period === "custom") {
    const customStart = parseDay(query.dateFrom);
    const customEnd = parseDay(query.dateTo);

    if (customStart && customEnd) {
      start = customStart;
      endExclusive = addDays(customEnd, 1);
    } else {
      activePeriod = "thisMonth";
    }
  }

  return {
    dateFrom: dateKey(start),
    dateTo: dateKey(addDays(endExclusive, -1)),
    endExclusive,
    period: activePeriod,
    start,
  };
}

export function recentMonths(count: number) {
  const now = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - count + index + 1, 1);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

export function yearMonths(year: number) {
  return Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
}
