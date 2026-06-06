import { api } from "../../api/http";
import { Customer } from "../customers/customerTypes";
import { CategorySummary, Expense, FinanceSummary, Revenue } from "./financeTypes";

type Query = Record<string, string | number | null | undefined>;

function qs(query: Query) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });

  return params.toString();
}

export function fetchRevenues(query: Query = {}) {
  const queryString = qs(query);
  return api<{ revenues: Revenue[] }>(`/api/revenues${queryString ? `?${queryString}` : ""}`);
}

export function saveRevenue(data: Partial<Revenue> & { date: string; category: string; amount: number }) {
  const path = data.id ? `/api/revenues/${data.id}` : "/api/revenues";
  return api<{ revenue: Revenue }>(path, { method: data.id ? "PUT" : "POST", body: JSON.stringify(data) });
}

export function deleteRevenue(id: number) {
  return api<{ message: string }>(`/api/revenues/${id}`, { method: "DELETE" });
}

export function fetchExpenses(query: Query = {}) {
  const queryString = qs(query);
  return api<{ expenses: Expense[] }>(`/api/expenses${queryString ? `?${queryString}` : ""}`);
}

export function saveExpense(data: Partial<Expense> & { date: string; category: string; amount: number }) {
  const path = data.id ? `/api/expenses/${data.id}` : "/api/expenses";
  return api<{ expense: Expense }>(path, { method: data.id ? "PUT" : "POST", body: JSON.stringify(data) });
}

export function deleteExpense(id: number) {
  return api<{ message: string }>(`/api/expenses/${id}`, { method: "DELETE" });
}

export function fetchFinanceSummary(query: Query = {}) {
  const queryString = qs(query);
  return api<FinanceSummary>(`/api/finance/summary${queryString ? `?${queryString}` : ""}`);
}

export function fetchFinanceCategories(query: Query = {}) {
  const queryString = qs(query);
  return api<{ revenueByCategory: CategorySummary[]; expenseByCategory: CategorySummary[] }>(
    `/api/finance/categories${queryString ? `?${queryString}` : ""}`,
  );
}

export function fetchCustomerOptions() {
  return api<{ customers: Customer[] }>("/api/customers");
}
