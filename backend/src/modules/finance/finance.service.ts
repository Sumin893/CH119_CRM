import { prisma } from "../../config/prisma.js";
import { queryDateRange } from "./dateRange.js";

type Query = Record<string, unknown>;

export async function getFinanceSummary(query: Query) {
  const range = queryDateRange(query);
  const [revenueAgg, expenseAgg, revenueCount, expenseCount] = await Promise.all([
    prisma.revenue.aggregate({ where: { date: { gte: range.start, lt: range.end } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { date: { gte: range.start, lt: range.end } }, _sum: { amount: true } }),
    prisma.revenue.count({ where: { date: { gte: range.start, lt: range.end } } }),
    prisma.expense.count({ where: { date: { gte: range.start, lt: range.end } } }),
  ]);
  const totalRevenue = revenueAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;

  return {
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    revenueCount,
    expenseCount,
    selectedMonth: query.month ? String(query.month) : null,
  };
}

export async function getFinanceCategories(query: Query) {
  const range = queryDateRange(query);
  const [revenueGroups, expenseGroups] = await Promise.all([
    prisma.revenue.groupBy({
      by: ["category"],
      where: { date: { gte: range.start, lt: range.end } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { category: "asc" },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { date: { gte: range.start, lt: range.end } },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { category: "asc" },
    }),
  ]);

  return {
    revenueByCategory: revenueGroups.map((item) => ({
      category: item.category,
      total: item._sum.amount ?? 0,
      count: item._count.id,
    })),
    expenseByCategory: expenseGroups.map((item) => ({
      category: item.category,
      total: item._sum.amount ?? 0,
      count: item._count.id,
    })),
  };
}
