import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { parseDate, queryDateRange } from "./dateRange.js";
import { toExpenseResponse } from "./expense.mapper.js";

type Body = Record<string, unknown>;
type Query = Record<string, unknown>;

export async function listExpenses(query: Query) {
  const range = queryDateRange(query);
  const where: Prisma.ExpenseWhereInput = {
    date: { gte: range.start, lt: range.end },
  };

  if (query.category) where.category = String(query.category);
  if (query.vendor) where.vendor = { contains: String(query.vendor) };
  if (query.search) where.memo = { contains: String(query.search) };

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return expenses.map(toExpenseResponse);
}

export async function getExpense(id: number) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  return expense ? toExpenseResponse(expense) : null;
}

export async function createExpense(body: Body) {
  const amount = Number(body.amount ?? 0);
  const message = validateExpenseBody(body, amount);

  if (message) return { message };

  const expense = await prisma.expense.create({
    data: {
      date: parseDate(body.date)!,
      category: String(body.category),
      amount,
      vendor: optionalString(body.vendor),
      memo: optionalString(body.memo),
    },
  });

  return { expense: toExpenseResponse(expense) };
}

export async function updateExpense(id: number, body: Body) {
  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) return { message: "비용 내역을 찾을 수 없습니다.", status: 404 };

  const amount = Number(body.amount ?? 0);
  const message = validateExpenseBody(body, amount);
  if (message) return { message };

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      date: parseDate(body.date)!,
      category: String(body.category),
      amount,
      vendor: optionalString(body.vendor),
      memo: optionalString(body.memo),
    },
  });

  return { expense: toExpenseResponse(expense) };
}

export async function deleteExpense(id: number) {
  const current = await prisma.expense.findUnique({ where: { id } });
  if (!current) return false;

  await prisma.expense.delete({ where: { id } });
  return true;
}

function validateExpenseBody(body: Body, amount: number) {
  if (!body.date || !body.category) return "날짜와 카테고리를 입력해주세요.";
  if (!Number.isFinite(amount) || amount <= 0) return "금액은 0보다 커야 합니다.";
  return null;
}

function optionalString(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}
