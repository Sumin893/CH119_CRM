export function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR").format(new Date(value)).replace(/\s/g, "");
}

export function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-";

  return `${value.toLocaleString("ko-KR")}원`;
}

export function toDateInput(value?: string | null) {
  if (!value) return "";

  return value.slice(0, 10);
}

export function compact(value?: string | number | null) {
  return value === null || value === undefined || value === "" ? "-" : value;
}
