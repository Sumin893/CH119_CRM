export const productCategories = ["에어컨", "세탁기", "건조기", "기타"];

export const productTypes: Record<string, string[]> = {
  에어컨: ["벽걸이", "스탠드", "시스템에어컨", "2in1", "천장형 1way", "천장형 4way", "기타"],
  세탁기: ["통돌이", "드럼", "빌트인", "기타"],
  건조기: ["일반 건조기", "의류건조기", "기타"],
  기타: ["기타"],
};

export const paymentMethods = ["현금", "계좌이체", "카드", "지역화폐", "기타"];

export const paymentStatuses = ["결제전", "예약금결제", "결제완료", "환불"];

export const invoiceIssuedOptions = ["예", "아니오"];

export const customerStatuses = ["예약중", "예약 확정", "작업 완료", "재방문 예정", "취소"];

export const emptyCustomerForm = {
  name: "",
  phone: "",
  address: "",
  productCategory: "에어컨",
  productType: "벽걸이",
  productBrand: "",
  productCount: 1,
  estimateRequestDate: null,
  workDate: null,
  workStartTime: "",
  workEndTime: "",
  estimatePrice: null,
  finalPrice: null,
  deposit: null,
  balance: null,
  paymentMethod: "",
  paymentStatus: "결제전",
  invoiceIssued: "아니오",
  customerStatus: "예약중",
  memo: "",
  specialNote: "",
  revisitDate: null,
};
