import type { Customer, Expense, Revenue } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { addDays, dateKey, monthKey, recentMonths, startOfDay, statsRange, yearMonths } from "./stats.dates.js";

type Query = Record<string, unknown>;

const canceledStatus = "취소";
const completedStatuses = ["작업 완료", "결제완료", "결제 완료"];
const paidStatuses = ["결제완료", "결제 완료"];
const unpaidStatuses = ["결제전", "미결제", "예약금결제", "예약금 결제", "부분 결제"];

function amount(value: number | null | undefined) {
  return value ?? 0;
}

function unpaidAmount(customer: Pick<Customer, "deposit" | "estimatePrice" | "finalPrice">) {
  const total = amount(customer.finalPrice) || amount(customer.estimatePrice);

  return Math.max(total - amount(customer.deposit), 0);
}

function byDateRange(range: ReturnType<typeof statsRange>) {
  return { gte: range.start, lt: range.endExclusive };
}

function countMap<T extends string | null>(items: T[]) {
  const map = new Map<string, number>();

  items.forEach((item) => map.set(item || "미지정", (map.get(item || "미지정") ?? 0) + 1));

  return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
}

function moneyMap<T extends string | null>(items: { amount: number; key: T }[]) {
  const map = new Map<string, { count: number; total: number }>();

  items.forEach((item) => {
    const key = item.key || "미지정";
    const current = map.get(key) ?? { count: 0, total: 0 };

    map.set(key, { count: current.count + 1, total: current.total + amount(item.amount) });
  });

  return Array.from(map.entries()).map(([label, value]) => ({ label, ...value }));
}

function smallCustomer(customer: Customer) {
  return {
    id: customer.id,
    name: customer.name,
    productCategory: customer.productCategory,
    productType: customer.productType,
    workDate: customer.workDate ? dateKey(customer.workDate) : null,
    estimatePrice: customer.estimatePrice,
    finalPrice: customer.finalPrice,
    deposit: customer.deposit,
    unpaidAmount: unpaidAmount(customer),
    paymentStatus: customer.paymentStatus,
    customerStatus: customer.customerStatus,
  };
}

function revisitCustomer(customer: Customer) {
  return {
    id: customer.id,
    name: customer.name,
    productCategory: customer.productCategory,
    productType: customer.productType,
    workDate: customer.workDate ? dateKey(customer.workDate) : null,
    revisitDate: customer.revisitDate ? dateKey(customer.revisitDate) : null,
    customerStatus: customer.customerStatus,
    paymentStatus: customer.paymentStatus,
  };
}

function scheduleCustomer(customer: Customer) {
  return {
    customerId: customer.id,
    customerName: customer.name,
    productCategory: customer.productCategory,
    productType: customer.productType,
    productCount: customer.productCount,
    workDate: customer.workDate ? dateKey(customer.workDate) : null,
    workStartTime: customer.workStartTime,
    customerStatus: customer.customerStatus,
  };
}

export async function getStatsSummary(query: Query) {
  const range = statsRange(query);
  const where = byDateRange(range);
  const [revenueAgg, expenseAgg, customers, revenueCount, expenseCount] = await Promise.all([
    prisma.revenue.aggregate({ where: { date: where }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { date: where }, _sum: { amount: true } }),
    prisma.customer.findMany({ where: { workDate: where } }),
    prisma.revenue.count({ where: { date: where } }),
    prisma.expense.count({ where: { date: where } }),
  ]);
  const activeCustomers = customers.filter((customer) => customer.customerStatus !== canceledStatus);
  const totalRevenue = revenueAgg._sum.amount ?? 0;
  const totalExpense = expenseAgg._sum.amount ?? 0;
  const unpaidCustomers = activeCustomers.filter((customer) => unpaidStatuses.includes(customer.paymentStatus));

  return {
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
    workCount: activeCustomers.length,
    completedWorkCount: activeCustomers.filter((customer) => completedStatuses.includes(customer.customerStatus)).length,
    averageRevenuePerWork: activeCustomers.length ? Math.round(totalRevenue / activeCustomers.length) : 0,
    unpaidCustomerCount: unpaidCustomers.length,
    unpaidAmount: unpaidCustomers.reduce((sum, customer) => sum + unpaidAmount(customer), 0),
    paidCustomerCount: activeCustomers.filter((customer) => paidStatuses.includes(customer.paymentStatus)).length,
    revenueCount,
    expenseCount,
    period: range.period,
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  };
}

export async function getStatsMonthly(query: Query) {
  const months = query.year ? yearMonths(Number(query.year)) : recentMonths(Number(query.months ?? 6));
  const start = new Date(`${months[0]}-01T00:00:00`);
  const last = months[months.length - 1];
  const [year, month] = last.split("-").map(Number);
  const end = new Date(year, month, 1);
  const [revenues, expenses, customers] = await Promise.all([
    prisma.revenue.findMany({ where: { date: { gte: start, lt: end } } }),
    prisma.expense.findMany({ where: { date: { gte: start, lt: end } } }),
    prisma.customer.findMany({ where: { workDate: { gte: start, lt: end } } }),
  ]);

  return {
    monthly: months.map((month) => {
      const revenue = revenues.filter((item) => monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0);
      const expense = expenses.filter((item) => monthKey(item.date) === month).reduce((sum, item) => sum + item.amount, 0);
      const works = customers.filter((item) => item.workDate && monthKey(item.workDate) === month && item.customerStatus !== canceledStatus);

      return {
        month,
        revenue,
        expense,
        netProfit: revenue - expense,
        workCount: works.length,
        completedWorkCount: works.filter((item) => completedStatuses.includes(item.customerStatus)).length,
      };
    }),
  };
}

export async function getStatsCategories(query: Query) {
  const range = statsRange(query);
  const where = byDateRange(range);
  const [revenues, expenses, customers] = await Promise.all([
    prisma.revenue.findMany({ where: { date: where }, include: { customer: true } }),
    prisma.expense.findMany({ where: { date: where } }),
    prisma.customer.findMany({ where: { workDate: where, customerStatus: { not: canceledStatus } } }),
  ]);

  return {
    revenueByCategory: moneyMap(revenues.map((item) => ({ amount: item.amount, key: item.category }))).map(({ label, ...rest }) => ({ category: label, ...rest })),
    expenseByCategory: moneyMap(expenses.map((item) => ({ amount: item.amount, key: item.category }))).map(({ label, ...rest }) => ({ category: label, ...rest })),
    revenueByPaymentMethod: moneyMap(revenues.map((item) => ({ amount: item.amount, key: item.paymentMethod }))).map(({ label, ...rest }) => ({ paymentMethod: label, ...rest })),
    revenueBySourceType: moneyMap(revenues.map((item) => ({ amount: item.amount, key: item.sourceType || "MANUAL" }))).map(({ label, ...rest }) => ({
      sourceType: label,
      label: label === "CUSTOMER_PAYMENT" ? "자동 등록" : "수동 등록",
      ...rest,
    })),
    revenueByProductCategory: moneyMap(revenues.map((item) => ({ amount: item.amount, key: item.customer?.productCategory ?? item.category }))).map(({ label, ...rest }) => ({
      productCategory: label,
      ...rest,
    })),
    workCountByProductCategory: countMap(customers.map((item) => item.productCategory)).map(({ label, count }) => ({ productCategory: label, count })),
  };
}

export async function getStatsCustomers(query: Query) {
  const range = statsRange(query);
  const where = byDateRange(range);
  const customers = await prisma.customer.findMany({
    where: { workDate: where },
    orderBy: [{ workDate: "desc" }, { createdAt: "desc" }],
  });
  const activeCustomers = customers.filter((item) => item.customerStatus !== canceledStatus);
  const unpaidCustomers = activeCustomers.filter((item) => unpaidStatuses.includes(item.paymentStatus));
  const recentCompletedCustomers = activeCustomers.filter((item) => completedStatuses.includes(item.customerStatus)).slice(0, 10);

  return {
    customerStatusCounts: countMap(activeCustomers.map((item) => item.customerStatus)),
    paymentStatusCounts: countMap(activeCustomers.map((item) => item.paymentStatus)),
    workCountByProductType: countMap(activeCustomers.map((item) => item.productType)).map(({ label, count }) => ({ productType: label, count })),
    unpaidCustomers: unpaidCustomers.slice(0, 10).map(smallCustomer),
    recentCompletedCustomers: recentCompletedCustomers.map(smallCustomer),
  };
}

export async function getStatsRevisit() {
  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextThirty = addDays(today, 30);
  const baseWhere = { revisitDate: { not: null }, customerStatus: { not: canceledStatus } };
  const [overdue, thisMonth, upcoming] = await Promise.all([
    prisma.customer.findMany({ where: { ...baseWhere, revisitDate: { lt: today } }, orderBy: { revisitDate: "asc" } }),
    prisma.customer.findMany({ where: { ...baseWhere, revisitDate: { gte: monthStart, lt: nextMonth } }, orderBy: { revisitDate: "asc" } }),
    prisma.customer.findMany({ where: { ...baseWhere, revisitDate: { gte: tomorrow, lt: nextThirty } }, orderBy: { revisitDate: "asc" } }),
  ]);

  return {
    overdueRevisits: overdue.map(revisitCustomer),
    thisMonthRevisits: thisMonth.map(revisitCustomer),
    upcomingRevisits: upcoming.map(revisitCustomer),
  };
}

export async function getStatsDashboard() {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [finance, allMonthCustomers, todayWorks, weekWorks, upcomingWorks, revisits] = await Promise.all([
    getStatsSummary({ period: "thisMonth" }),
    prisma.customer.findMany({ where: { workDate: { gte: monthStart, lt: monthEnd }, customerStatus: { not: canceledStatus } } }),
    prisma.customer.count({ where: { workDate: { gte: today, lt: tomorrow }, customerStatus: { not: canceledStatus } } }),
    prisma.customer.count({ where: { workDate: { gte: today, lt: weekEnd }, customerStatus: { not: canceledStatus } } }),
    prisma.customer.findMany({ where: { workDate: { gte: today, lt: weekEnd }, customerStatus: { not: canceledStatus } }, orderBy: [{ workDate: "asc" }, { workStartTime: "asc" }], take: 5 }),
    getStatsRevisit(),
  ]);
  const unpaid = allMonthCustomers.filter((item) => unpaidStatuses.includes(item.paymentStatus));

  return {
    ...finance,
    todayScheduleCount: todayWorks,
    thisWeekScheduleCount: weekWorks,
    revisitCustomerCount: revisits.upcomingRevisits.length + revisits.thisMonthRevisits.length,
    thisMonthCompletedWorkCount: allMonthCustomers.filter((item) => completedStatuses.includes(item.customerStatus)).length,
    upcomingSchedules: upcomingWorks.map(scheduleCustomer),
    unpaidCustomers: unpaid.slice(0, 5).map(smallCustomer),
    revisitCustomers: [...revisits.overdueRevisits, ...revisits.thisMonthRevisits, ...revisits.upcomingRevisits].slice(0, 5),
  };
}
