export type Revenue = {
  id: number;
  date: string;
  customerId: number | null;
  customerName: string | null;
  category: string;
  amount: number;
  paymentMethod: string | null;
  memo: string | null;
  sourceType: string;
};

export type Expense = {
  id: number;
  date: string;
  category: string;
  amount: number;
  vendor: string | null;
  memo: string | null;
};

export type FinanceSummary = {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  revenueCount: number;
  expenseCount: number;
};

export type CategorySummary = {
  category: string;
  total: number;
  count: number;
};
