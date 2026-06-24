import { customerStatuses, leadSourceOptions, normalizePaymentStatus, paymentStatuses, productCategories } from "./customer.constants.js";

const requiredFields = [
  "name",
  "phone",
  "address",
  "leadSource",
  "productCategory",
  "productType",
  "customerStatus",
  "paymentStatus",
];

export function validateRequired(body: Record<string, unknown>) {
  const missing = requiredFields.find((field) => !String(body[field] ?? "").trim());

  if (missing) return "필수 항목을 입력해주세요.";

  if (!productCategories.includes(String(body.productCategory))) {
    return "의뢰 제품 값이 올바르지 않습니다.";
  }

  if (!leadSourceOptions.includes(String(body.leadSource))) {
    return "유입 경로 값이 올바르지 않습니다.";
  }

  if (isReferralLeadSource(String(body.leadSource)) && !String(body.referralName ?? "").trim()) {
    return "지인 이름을 입력해주세요.";
  }

  if (!customerStatuses.includes(String(body.customerStatus))) {
    return "고객 상태 값이 올바르지 않습니다.";
  }

  if (!paymentStatuses.includes(normalizePaymentStatus(String(body.paymentStatus)))) {
    return "결제 상태 값이 올바르지 않습니다.";
  }

  return null;
}

export function isReferralLeadSource(leadSource: string) {
  return leadSource === "지인소개" || leadSource === "지인";
}

export function toOptionalString(value: unknown) {
  const text = String(value ?? "").trim();

  return text ? text : null;
}

export function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export function toOptionalDate(value: unknown) {
  const text = String(value ?? "").trim();

  if (!text) return null;

  const date = text.includes("T") ? new Date(text) : new Date(`${text}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}
