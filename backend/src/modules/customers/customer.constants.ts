export const productCategories = ["에어컨", "세탁기", "건조기", "기타"];

export const paymentStatuses = ["결제전", "예약금결제", "결제완료", "환불"];

const paymentStatusAliases: Record<string, string> = {
  미결제: "결제전",
  "예약금 결제": "예약금결제",
  "결제 완료": "결제완료",
};

export function normalizePaymentStatus(status: string) {
  return paymentStatusAliases[status] ?? status;
}

export const customerStatuses = ["예약중", "예약 확정", "작업 완료", "재방문 예정", "취소"];

export const leadSourceOptions = ["당근", "지인소개", "네이버 플레이스", "현수막", "명함", "지인", "기타"];

export function normalizeLeadSource(leadSource: unknown) {
  return String(leadSource ?? "").trim();
}
