export type Schedule = {
  id: number;
  customerId: number;
  customerName: string;
  phoneMasked: string;
  addressSummary: string;
  productCategory: string;
  productType: string;
  productCount: number;
  workDate: string;
  workStartTime: string | null;
  workEndTime: string | null;
  customerStatus: string;
  paymentStatus: string;
  memo: string | null;
  specialNote: string | null;
};
