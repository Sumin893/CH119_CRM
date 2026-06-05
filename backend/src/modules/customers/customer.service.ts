import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { encryptText, hashPhone, normalizePhone } from "../../utils/crypto.js";
import { toCustomerResponse } from "./customer.mapper.js";
import { toOptionalDate, toOptionalNumber, toOptionalString } from "./customer.validators.js";

type CustomerBody = Record<string, unknown>;
type CustomerQuery = Record<string, unknown>;

function encryptedFields(body: CustomerBody) {
  const phone = String(body.phone ?? "");
  const normalizedPhone = normalizePhone(phone);

  return {
    phoneEncrypted: encryptText(phone),
    phoneHash: hashPhone(normalizedPhone),
    addressEncrypted: encryptText(String(body.address ?? "")),
  };
}

function baseData(body: CustomerBody) {
  return {
    name: String(body.name ?? "").trim(),
    productCategory: String(body.productCategory ?? ""),
    productType: String(body.productType ?? ""),
    productBrand: toOptionalString(body.productBrand),
    productCount: toOptionalNumber(body.productCount) ?? 1,
    estimateRequestDate: toOptionalDate(body.estimateRequestDate),
    workDate: toOptionalDate(body.workDate),
    workStartTime: toOptionalString(body.workStartTime),
    workEndTime: toOptionalString(body.workEndTime),
    estimatePrice: toOptionalNumber(body.estimatePrice),
    finalPrice: toOptionalNumber(body.finalPrice),
    deposit: toOptionalNumber(body.deposit),
    balance: toOptionalNumber(body.balance),
    paymentMethod: toOptionalString(body.paymentMethod),
    paymentStatus: String(body.paymentStatus ?? ""),
    customerStatus: String(body.customerStatus ?? ""),
    memo: toOptionalString(body.memo),
    specialNote: toOptionalString(body.specialNote),
    revisitDate: toOptionalDate(body.revisitDate),
  };
}

function dateRange(query: CustomerQuery) {
  const range: Prisma.DateTimeNullableFilter = {};

  if (query.workDateFrom) range.gte = new Date(`${query.workDateFrom}T00:00:00`);
  if (query.workDateTo) range.lte = new Date(`${query.workDateTo}T23:59:59`);

  return Object.keys(range).length ? range : undefined;
}

function buildWhere(query: CustomerQuery) {
  const where: Prisma.CustomerWhereInput = {};
  const workDate = dateRange(query);

  if (query.productCategory) where.productCategory = String(query.productCategory);
  if (query.customerStatus) where.customerStatus = String(query.customerStatus);
  if (query.paymentStatus) where.paymentStatus = String(query.paymentStatus);
  if (query.revisitOnly === "true") where.revisitDate = { not: null };
  if (workDate) where.workDate = workDate;

  return where;
}

function sortOrder(query: CustomerQuery) {
  if (query.sort === "workDate") {
    return [{ workDate: "desc" as const }, { createdAt: "desc" as const }];
  }

  return [{ createdAt: "desc" as const }];
}

export async function listCustomers(query: CustomerQuery) {
  const search = String(query.search ?? "").trim();
  const normalized = normalizePhone(search);
  const customers = await prisma.customer.findMany({
    where: buildWhere(query),
    orderBy: sortOrder(query),
  });

  if (!search) return customers.map(toCustomerResponse);

  const phoneHash = normalized.length >= 8 ? hashPhone(normalized) : null;

  return customers
    .filter((customer) => {
      const address = toCustomerResponse(customer).address;

      return customer.name.includes(search) || address.includes(search) || customer.phoneHash === phoneHash;
    })
    .map(toCustomerResponse);
}

export async function getCustomer(id: number) {
  const customer = await prisma.customer.findUnique({ where: { id } });

  return customer ? toCustomerResponse(customer) : null;
}

export async function createCustomer(body: CustomerBody) {
  const customer = await prisma.customer.create({
    data: {
      ...baseData(body),
      ...encryptedFields(body),
    },
  });

  return toCustomerResponse(customer);
}

export async function updateCustomer(id: number, body: CustomerBody) {
  const current = await prisma.customer.findUnique({ where: { id } });

  if (!current) return null;

  const data: Prisma.CustomerUpdateInput = baseData(body);

  if (body.phone !== undefined) {
    const encrypted = encryptedFields(body);

    Object.assign(data, {
      phoneEncrypted: encrypted.phoneEncrypted,
      phoneHash: encrypted.phoneHash,
    });
  }

  if (body.address !== undefined) {
    data.addressEncrypted = encryptText(String(body.address ?? ""));
  }

  const customer = await prisma.customer.update({ where: { id }, data });

  return toCustomerResponse(customer);
}

export async function deleteCustomer(id: number) {
  const current = await prisma.customer.findUnique({ where: { id } });

  if (!current) return false;

  await prisma.customer.delete({ where: { id } });

  return true;
}
