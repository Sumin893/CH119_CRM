import { api } from "../../api/http";
import { Customer, CustomerFormValues } from "./customerTypes";

export type CustomerFilters = {
  search?: string;
  productCategory?: string;
  customerStatus?: string;
  paymentStatus?: string;
  workDateFrom?: string;
  workDateTo?: string;
  revisitOnly?: boolean;
};

function queryString(filters: CustomerFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });

  return params.toString();
}

export function fetchCustomers(filters: CustomerFilters) {
  const query = queryString(filters);

  return api<{ customers: Customer[] }>(`/api/customers${query ? `?${query}` : ""}`);
}

export function fetchCustomer(id: string) {
  return api<{ customer: Customer }>(`/api/customers/${id}`);
}

export function createCustomer(data: CustomerFormValues) {
  return api<{ customer: Customer }>("/api/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCustomer(id: string, data: CustomerFormValues) {
  return api<{ customer: Customer }>(`/api/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCustomer(id: number | string) {
  return api<{ message: string }>(`/api/customers/${id}`, { method: "DELETE" });
}
