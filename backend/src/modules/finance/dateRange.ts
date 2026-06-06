type Query = Record<string, unknown>;

export function dateOnly(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDate(value: unknown) {
  const text = String(value ?? "").trim();

  return text ? new Date(`${text.slice(0, 10)}T00:00:00`) : null;
}

export function monthRange(monthText: string) {
  const [year, month] = monthText.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { start, end };
}

export function queryDateRange(query: Query) {
  if (query.month) return monthRange(String(query.month));

  const now = new Date();
  const fallback = monthRange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const start = parseDate(query.dateFrom) ?? fallback.start;
  const dateTo = parseDate(query.dateTo);
  const end = dateTo ?? fallback.end;

  if (dateTo) end.setDate(end.getDate() + 1);

  return { start, end };
}
