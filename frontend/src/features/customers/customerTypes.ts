export type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string;
  productCategory: string;
  productType: string;
  productBrand: string | null;
  productCount: number;
  estimateRequestDate: string | null;
  workDate: string | null;
  workStartTime: string | null;
  workEndTime: string | null;
  estimatePrice: number | null;
  finalPrice: number | null;
  deposit: number | null;
  balance: number | null;
  paymentMethod: string | null;
  paymentStatus: string;
  customerStatus: string;
  memo: string | null;
  specialNote: string | null;
  revisitDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFormValues = Omit<Customer, "id" | "createdAt" | "updatedAt">;
