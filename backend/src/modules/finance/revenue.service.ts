import type { Customer, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { revenueSourceTypes } from "./finance.constants.js";
import { parseDate, queryDateRange } from "./dateRange.js";
import { toRevenueResponse } from "./revenue.mapper.js";

type Body = Record<string, unknown>;
type Query = Record<string, unknown>;

function amountFrom(body: Body) {
  return Number(body.amount ?? 0);
}

function requirePositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return "금액은 0보다 커야 합니다.";
  return null;
}

function revenueCategoryFromCustomer(customer: Pick<Customer, "productCategory">) {
  const map: Record<string, string> = {
    에어컨: "에어컨 청소",
    세탁기: "세탁기 청소",
    건조기: "건조기 청소",
  };

  return map[customer.productCategory] ?? "기타 수입";
}

function paymentCompleted(status: string) {
  return status === "결제완료" || status === "결제 완료";
}

function customerRevenueAmount(customer: Pick<Customer, "finalPrice" | "estimatePrice">) {
  const amount = customer.finalPrice ?? customer.estimatePrice ?? 0;

  return amount > 0 ? amount : null;
}

function customerRevenueDate(customer: Pick<Customer, "workDate">) {
  return customer.workDate ?? new Date();
}

export async function listRevenues(query: Query) {
  const range = queryDateRange(query);
  const where: Prisma.RevenueWhereInput = {
    date: { gte: range.start, lt: range.end },
  };

  if (query.category) where.category = String(query.category);
  if (query.paymentMethod) where.paymentMethod = String(query.paymentMethod);
  if (query.customerId) where.customerId = Number(query.customerId);
  if (query.search) where.memo = { contains: String(query.search) };
  if (query.customerSearch) where.customer = { name: { contains: String(query.customerSearch) } };

  const revenues = await prisma.revenue.findMany({
    where,
    include: { customer: { select: { id: true, name: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return revenues.map(toRevenueResponse);
}

export async function getRevenue(id: number) {
  const revenue = await prisma.revenue.findUnique({
    where: { id },
    include: { customer: { select: { id: true, name: true } } },
  });

  return revenue ? toRevenueResponse(revenue) : null;
}

export async function createRevenue(body: Body) {
  const amount = amountFrom(body);
  const message = validateRevenueBody(body, amount);

  if (message) return { message };

  const customerId = await resolveCustomerId(body.customerId);
  if (customerId === false) return { message: "연결할 고객을 찾을 수 없습니다." };

  const revenue = await prisma.revenue.create({
    data: {
      date: parseDate(body.date)!,
      customerId,
      category: String(body.category),
      amount,
      paymentMethod: optionalString(body.paymentMethod),
      memo: optionalString(body.memo),
      sourceType: revenueSourceTypes.manual,
    },
    include: { customer: { select: { id: true, name: true } } },
  });

  return { revenue: toRevenueResponse(revenue) };
}

export async function updateRevenue(id: number, body: Body) {
  const current = await prisma.revenue.findUnique({ where: { id } });
  if (!current) return { message: "수입 내역을 찾을 수 없습니다.", status: 404 };

  const amount = amountFrom(body);
  const message = validateRevenueBody(body, amount);
  if (message) return { message };

  const customerId = await resolveCustomerId(body.customerId);
  if (customerId === false) return { message: "연결할 고객을 찾을 수 없습니다." };

  const revenue = await prisma.revenue.update({
    where: { id },
    data: {
      date: parseDate(body.date)!,
      customerId,
      category: String(body.category),
      amount,
      paymentMethod: optionalString(body.paymentMethod),
      memo: optionalString(body.memo),
    },
    include: { customer: { select: { id: true, name: true } } },
  });

  return { revenue: toRevenueResponse(revenue) };
}

export async function deleteRevenue(id: number) {
  const current = await prisma.revenue.findUnique({ where: { id } });
  if (!current) return false;

  await prisma.revenue.delete({ where: { id } });
  return true;
}

export async function createOrUpdateRevenueFromCustomerPayment(customer: Customer) {
  if (!paymentCompleted(customer.paymentStatus)) return null;

  const amount = customerRevenueAmount(customer);
  if (!amount) return null;

  const data = {
    date: customerRevenueDate(customer),
    customerId: customer.id,
    category: revenueCategoryFromCustomer(customer),
    amount,
    paymentMethod: customer.paymentMethod,
    memo: `${customer.name} 고객 결제 완료 자동 매출 등록`,
    sourceType: revenueSourceTypes.customerPayment,
    sourceCustomerId: customer.id,
  };

  return prisma.revenue.upsert({
    where: {
      sourceType_sourceCustomerId: {
        sourceType: revenueSourceTypes.customerPayment,
        sourceCustomerId: customer.id,
      },
    },
    update: data,
    create: data,
  });
}

export async function listRevenuesByCustomer(customerId: number) {
  const revenues = await prisma.revenue.findMany({
    where: { customerId },
    include: { customer: { select: { id: true, name: true } } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return revenues.map(toRevenueResponse);
}

function validateRevenueBody(body: Body, amount: number) {
  if (!body.date || !body.category) return "날짜와 카테고리를 입력해주세요.";
  return requirePositiveAmount(amount);
}

async function resolveCustomerId(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const customerId = Number(value);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });

  return customer ? customerId : false;
}

function optionalString(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}
