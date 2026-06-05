import type { Customer } from "@prisma/client";
import { decryptText } from "../../utils/crypto.js";

function dateKey(value: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 8) return phone;

  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function addressSummary(address: string) {
  return address.split(/\s+/).slice(0, 3).join(" ");
}

export function toScheduleResponse(customer: Customer) {
  const phone = decryptText(customer.phoneEncrypted);
  const address = decryptText(customer.addressEncrypted);

  return {
    id: customer.id,
    customerId: customer.id,
    customerName: customer.name,
    phoneMasked: maskPhone(phone),
    addressSummary: addressSummary(address),
    productCategory: customer.productCategory,
    productType: customer.productType,
    productCount: customer.productCount,
    workDate: dateKey(customer.workDate),
    workStartTime: customer.workStartTime,
    workEndTime: customer.workEndTime,
    customerStatus: customer.customerStatus,
    paymentStatus: customer.paymentStatus,
    memo: customer.memo,
    specialNote: customer.specialNote,
  };
}
