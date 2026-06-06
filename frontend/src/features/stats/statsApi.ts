import { api } from "../../api/http";
import {
  DashboardStats,
  StatsCategories,
  StatsCustomers,
  StatsQuery,
  StatsRevisit,
  StatsSummary,
  MonthlyStats,
} from "./statsTypes";

type Query = StatsQuery & Record<string, string | number | undefined>;

function qs(query: Query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });

  return params.toString();
}

function path(base: string, query: Query = {}) {
  const queryString = qs(query);

  return `${base}${queryString ? `?${queryString}` : ""}`;
}

export function fetchStatsSummary(query: Query) {
  return api<StatsSummary>(path("/api/stats/summary", query));
}

export function fetchStatsMonthly(query: Query) {
  return api<{ monthly: MonthlyStats[] }>(path("/api/stats/monthly", query));
}

export function fetchStatsCategories(query: Query) {
  return api<StatsCategories>(path("/api/stats/categories", query));
}

export function fetchStatsCustomers(query: Query) {
  return api<StatsCustomers>(path("/api/stats/customers", query));
}

export function fetchStatsRevisit() {
  return api<StatsRevisit>("/api/stats/revisit");
}

export function fetchStatsDashboard() {
  return api<DashboardStats>("/api/stats/dashboard");
}
