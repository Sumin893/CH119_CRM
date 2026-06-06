import type { Revenue } from "@prisma/client";
import { dateOnly } from "./dateRange.js";

type RevenueWithCustomer = Revenue & {
  customer?: { id: number; name: string } | null;
};

export function toRevenueResponse(revenue: RevenueWithCustomer) {
  return {
    id: revenue.id,
    date: dateOnly(revenue.date),
    customerId: revenue.customerId,
    customerName: revenue.customer?.name ?? null,
    category: revenue.category,
    amount: revenue.amount,
    paymentMethod: revenue.paymentMethod,
    memo: revenue.memo,
    sourceType: revenue.sourceType,
    sourceCustomerId: revenue.sourceCustomerId,
    createdAt: revenue.createdAt,
    updatedAt: revenue.updatedAt,
  };
}
