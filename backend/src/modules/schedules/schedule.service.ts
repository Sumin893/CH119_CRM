import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toScheduleResponse } from "./schedule.mapper.js";

type ScheduleQuery = Record<string, unknown>;

function dayRange(dateText: string) {
  const start = new Date(`${dateText}T00:00:00`);
  const end = new Date(start);

  end.setDate(start.getDate() + 1);

  return { gte: start, lt: end };
}

function monthRange(monthText: string) {
  const [year, month] = monthText.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return { gte: start, lt: end };
}

function baseWhere(): Prisma.CustomerWhereInput {
  return {
    workDate: { not: null },
    customerStatus: { not: "취소" },
  };
}

function rangeWhere(query: ScheduleQuery) {
  const where = baseWhere();

  if (query.month) where.workDate = monthRange(String(query.month));
  if (query.date) where.workDate = dayRange(String(query.date));

  return where;
}

export async function listSchedules(query: ScheduleQuery) {
  const customers = await prisma.customer.findMany({
    where: rangeWhere(query),
    orderBy: [{ workDate: "asc" }, { workStartTime: "asc" }, { createdAt: "asc" }],
  });

  return customers.map(toScheduleResponse);
}

export async function listUpcomingSchedules(days = 7) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start);

  end.setDate(start.getDate() + days);

  const customers = await prisma.customer.findMany({
    where: {
      ...baseWhere(),
      workDate: { gte: start, lt: end },
    },
    orderBy: [{ workDate: "asc" }, { workStartTime: "asc" }, { createdAt: "asc" }],
  });

  return customers.map(toScheduleResponse);
}
