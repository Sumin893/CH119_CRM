import type { Expense } from "@prisma/client";
import { dateOnly } from "./dateRange.js";

export function toExpenseResponse(expense: Expense) {
  return {
    ...expense,
    date: dateOnly(expense.date),
  };
}
