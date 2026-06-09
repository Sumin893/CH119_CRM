import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatMoney } from "../customers/formatters";
import { StatusBadge } from "../customers/StatusBadge";
import {
  fetchStatsCategories,
  fetchStatsCustomers,
  fetchStatsMonthly,
  fetchStatsRevisit,
  fetchStatsSummary,
} from "./statsApi";
import {
  CountGroup,
  MonthlyStats,
  MoneyGroup,
  RevisitCustomer,
  StatsCategories,
  StatsCustomer,
  StatsCustomers,
  StatsQuery,
  StatsRevisit,
  StatsSummary,
} from "./statsTypes";

const colors = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

const periodOptions = [
  { label: "이번 달", value: "thisMonth" },
  { label: "최근 3개월", value: "last3Months" },
  { label: "최근 6개월", value: "last6Months" },
  { label: "올해", value: "thisYear" },
  { label: "직접 선택", value: "custom" },
];

export function StatsPage() {
  const [period, setPeriod] = useState("thisMonth");
  const [draft, setDraft] = useState({ dateFrom: "", dateTo: "" });
  const [query, setQuery] = useState<StatsQuery>({ period: "thisMonth" });
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStats[]>([]);
  const [categories, setCategories] = useState<StatsCategories | null>(null);
  const [customers, setCustomers] = useState<StatsCustomers | null>(null);
  const [revisit, setRevisit] = useState<StatsRevisit | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const monthlyQuery = useMemo(() => {
    if (query.period === "thisYear") return { year: new Date().getFullYear() };
    if (query.period === "last3Months") return { months: 3 };

    return { months: 6 };
  }, [query.period]);

  useEffect(() => {
    setIsLoading(true);
    setError("");
    Promise.all([
      fetchStatsSummary(query),
      fetchStatsMonthly(monthlyQuery),
      fetchStatsCategories(query),
      fetchStatsCustomers(query),
      fetchStatsRevisit(),
    ])
      .then(([summaryData, monthlyData, categoryData, customerData, revisitData]) => {
        setSummary(summaryData);
        setMonthly(monthlyData.monthly);
        setCategories(categoryData);
        setCustomers(customerData);
        setRevisit(revisitData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "통계 데이터를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [query, monthlyQuery]);

  function search() {
    if (period === "custom") setQuery({ period, dateFrom: draft.dateFrom, dateTo: draft.dateTo });
    else setQuery({ period });
  }

  function reset() {
    setPeriod("thisMonth");
    setDraft({ dateFrom: "", dateTo: "" });
    setQuery({ period: "thisMonth" });
  }

  return (
    <section>
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">통계</h1>
        <p className="mt-2 text-sm text-slate-500">고객, 일정, 매출과 비용 데이터를 자동 집계합니다.</p>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[220px_160px_160px_auto_auto]">
          <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={period} onChange={(event) => setPeriod(event.target.value)}>
            {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" disabled={period !== "custom"} type="date" value={draft.dateFrom} onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })} />
          <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" disabled={period !== "custom"} type="date" value={draft.dateTo} onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })} />
          <button className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-semibold text-white" onClick={search}>조회</button>
          <button className="h-10 rounded-lg border border-slate-200 px-4 text-sm" onClick={reset}>초기화</button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {isLoading ? <p className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">통계 데이터를 불러오는 중입니다.</p> : null}

      {!isLoading && summary ? (
        <>
          <SummaryGrid summary={summary} />
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            <ChartBox title="월별 매출/비용/순이익">
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0ea5e9" name="매출" />
                  <Bar dataKey="expense" fill="#ef4444" name="비용" />
                  <Bar dataKey="netProfit" fill="#10b981" name="순이익" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
            <ChartBox title="월별 작업 건수">
              <ResponsiveContainer height={300} width="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="workCount" fill="#14b8a6" name="작업 건수" />
                  <Bar dataKey="completedWorkCount" fill="#6366f1" name="작업 완료" />
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          {categories && <CategoryCharts categories={categories} />}
          {customers && <CustomerCharts customers={customers} />}
          {customers && <CustomerLists customers={customers} />}
          {revisit && <RevisitSection revisit={revisit} />}
        </>
      ) : null}
    </section>
  );
}

function SummaryGrid({ summary }: { summary: StatsSummary }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      <SummaryCard label="총 매출" value={formatMoney(summary.totalRevenue)} tone="blue" />
      <SummaryCard label="총 비용" value={formatMoney(summary.totalExpense)} tone="red" />
      <SummaryCard label="순이익" value={formatMoney(summary.netProfit)} tone={summary.netProfit < 0 ? "red" : "green"} />
      <SummaryCard label="작업 건수" value={`${summary.workCount}건`} />
      <SummaryCard label="평균 작업 단가" value={formatMoney(summary.averageRevenuePerWork)} />
      <SummaryCard label="미결제 금액" value={formatMoney(summary.unpaidAmount)} tone="red" />
      <SummaryCard label="결제 완료 고객" value={`${summary.paidCustomerCount}명`} tone="green" />
      <SummaryCard label="미결제 고객" value={`${summary.unpaidCustomerCount}명`} tone="red" />
    </div>
  );
}

function SummaryCard({ label, value, tone = "navy" }: { label: string; tone?: string; value: string }) {
  const colors: Record<string, string> = {
    blue: "text-brand-blue",
    green: "text-emerald-600",
    navy: "text-brand-navy",
    red: "text-red-600",
  };

  return <article className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5"><p className="text-sm text-slate-500">{label}</p><p className={`mt-3 break-words text-xl font-bold sm:text-2xl ${colors[tone]}`}>{value}</p></article>;
}

function CategoryCharts({ categories }: { categories: StatsCategories }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
      <BarGroup title="수입 카테고리별 매출" data={categories.revenueByCategory} labelKey="category" valueKey="total" />
      <BarGroup title="비용 카테고리별 지출" data={categories.expenseByCategory} labelKey="category" valueKey="total" />
      <PieGroup title="결제 방식별 매출" data={categories.revenueByPaymentMethod} nameKey="paymentMethod" />
      <PieGroup title="자동/수동 등록 매출" data={categories.revenueBySourceType} nameKey="label" />
      <BarGroup title="제품별 매출" data={categories.revenueByProductCategory} labelKey="productCategory" valueKey="total" />
      <BarGroup title="제품별 작업 건수" data={categories.workCountByProductCategory} labelKey="productCategory" valueKey="count" />
    </div>
  );
}

function CustomerCharts({ customers }: { customers: StatsCustomers }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
      <BarGroup title="고객 상태별 건수" data={customers.customerStatusCounts} labelKey="label" valueKey="count" />
      <BarGroup title="결제 상태별 건수" data={customers.paymentStatusCounts} labelKey="label" valueKey="count" />
      <BarGroup title="제품 상세별 작업 건수" data={customers.workCountByProductType} labelKey="productType" valueKey="count" />
    </div>
  );
}

function BarGroup({ data, labelKey, title, valueKey }: { data: (MoneyGroup | CountGroup)[]; labelKey: string; title: string; valueKey: string }) {
  if (data.length === 0) return <EmptyBox title={title} />;

  return (
    <ChartBox title={title}>
      <ResponsiveContainer height={260} width="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={labelKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={valueKey} fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

function PieGroup({ data, nameKey, title }: { data: MoneyGroup[]; nameKey: string; title: string }) {
  if (data.length === 0) return <EmptyBox title={title} />;

  return (
    <ChartBox title={title}>
      <ResponsiveContainer height={260} width="100%">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey={nameKey} outerRadius={84}>
            {data.map((_, index) => <Cell fill={colors[index % colors.length]} key={index} />)}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

function ChartBox({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5"><h2 className="mb-4 font-bold text-brand-navy">{title}</h2>{children}</section>;
}

function EmptyBox({ title }: { title: string }) {
  return <ChartBox title={title}><p className="py-24 text-center text-sm text-slate-500">표시할 데이터가 없습니다.</p></ChartBox>;
}

function CustomerLists({ customers }: { customers: StatsCustomers }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
      <CustomerTable title="미결제 고객" customers={customers.unpaidCustomers} />
      <CustomerTable title="최근 완료 고객" customers={customers.recentCompletedCustomers} />
    </div>
  );
}

function CustomerTable({ customers, title }: { customers: StatsCustomer[]; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-bold text-brand-navy">{title}</h2>
      {customers.length === 0 ? <p className="mt-4 text-sm text-slate-500">표시할 고객이 없습니다.</p> : null}
      <div className="mt-4 space-y-2">
        {customers.map((customer) => (
          <Link className="grid grid-cols-1 gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-brand-soft sm:grid-cols-[1fr_110px_auto] sm:items-center sm:gap-3" key={customer.id} to={`/customers/${customer.id}`}>
            <span className="truncate text-sm font-semibold text-brand-navy">{customer.name} / {customer.productCategory} {customer.productType}</span>
            <span className="text-xs text-slate-500">{formatDate(customer.workDate)}</span>
            <StatusBadge value={customer.paymentStatus} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function RevisitSection({ revisit }: { revisit: StatsRevisit }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">
      <RevisitList title="재방문 지연 고객" customers={revisit.overdueRevisits} />
      <RevisitList title="이번 달 재방문" customers={revisit.thisMonthRevisits} />
      <RevisitList title="30일 이내 재방문" customers={revisit.upcomingRevisits} />
    </div>
  );
}

function RevisitList({ customers, title }: { customers: RevisitCustomer[]; title: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-bold text-brand-navy">{title}</h2>
      {customers.length === 0 ? <p className="mt-4 text-sm text-slate-500">표시할 고객이 없습니다.</p> : null}
      <div className="mt-4 space-y-2">
        {customers.slice(0, 8).map((customer) => (
          <Link className="block rounded-lg border border-slate-100 px-3 py-2 hover:bg-brand-soft" key={customer.id} to={`/customers/${customer.id}`}>
            <p className="truncate text-sm font-semibold text-brand-navy">{customer.name} / {customer.productCategory}</p>
            <p className="mt-1 text-xs text-slate-500">재방문 {formatDate(customer.revisitDate)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
