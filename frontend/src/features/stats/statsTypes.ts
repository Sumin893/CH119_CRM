export type StatsQuery = {
  dateFrom?: string;
  dateTo?: string;
  period?: string;
};

export type StatsSummary = {
  averageRevenuePerWork: number;
  completedWorkCount: number;
  dateFrom: string;
  dateTo: string;
  expenseCount: number;
  netProfit: number;
  paidCustomerCount: number;
  period: string;
  revenueCount: number;
  totalExpense: number;
  totalRevenue: number;
  unpaidAmount: number;
  unpaidCustomerCount: number;
  workCount: number;
};

export type MonthlyStats = {
  completedWorkCount: number;
  expense: number;
  month: string;
  netProfit: number;
  revenue: number;
  workCount: number;
};

export type MoneyGroup = {
  category?: string;
  count: number;
  label?: string;
  paymentMethod?: string;
  productCategory?: string;
  sourceType?: string;
  total: number;
};

export type CountGroup = {
  count: number;
  label?: string;
  productCategory?: string;
  productType?: string;
};

export type StatsCustomer = {
  customerStatus: string;
  deposit: number | null;
  estimatePrice: number | null;
  finalPrice: number | null;
  id: number;
  name: string;
  paymentStatus: string;
  productCategory: string;
  productType: string;
  unpaidAmount: number;
  workDate: string | null;
};

export type RevisitCustomer = {
  customerStatus: string;
  id: number;
  name: string;
  paymentStatus: string;
  productCategory: string;
  productType: string;
  revisitDate: string | null;
  workDate: string | null;
};

export type StatsCategories = {
  expenseByCategory: MoneyGroup[];
  revenueByCategory: MoneyGroup[];
  revenueByPaymentMethod: MoneyGroup[];
  revenueByProductCategory: MoneyGroup[];
  revenueBySourceType: MoneyGroup[];
  workCountByProductCategory: CountGroup[];
};

export type StatsCustomers = {
  customerStatusCounts: CountGroup[];
  paymentStatusCounts: CountGroup[];
  recentCompletedCustomers: StatsCustomer[];
  unpaidCustomers: StatsCustomer[];
  workCountByProductType: CountGroup[];
};

export type StatsRevisit = {
  overdueRevisits: RevisitCustomer[];
  thisMonthRevisits: RevisitCustomer[];
  upcomingRevisits: RevisitCustomer[];
};

export type DashboardStats = StatsSummary & {
  revisitCustomerCount: number;
  revisitCustomers: RevisitCustomer[];
  thisMonthCompletedWorkCount: number;
  thisWeekScheduleCount: number;
  todayScheduleCount: number;
  unpaidCustomers: StatsCustomer[];
  upcomingSchedules: {
    customerId: number;
    customerName: string;
    customerStatus: string;
    productCategory: string;
    productCount: number;
    productType: string;
    workDate: string | null;
    workStartTime: string | null;
  }[];
};
