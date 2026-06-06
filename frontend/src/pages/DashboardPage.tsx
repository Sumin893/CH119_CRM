import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, formatMoney } from "../features/customers/formatters";
import { StatusBadge } from "../features/customers/StatusBadge";
import { fetchStatsDashboard } from "../features/stats/statsApi";
import { DashboardStats } from "../features/stats/statsTypes";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatsDashboard()
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : "대시보드 일정을 불러오지 못했습니다."));
  }, []);

  const upcomingFive = useMemo(() => dashboard?.upcomingSchedules.slice(0, 5) ?? [], [dashboard]);

  return (
    <section>
      <h1 className="text-2xl font-bold text-brand-navy">대시보드</h1>
      <p className="mt-2 text-sm text-slate-500">오늘과 이번 주 작업 일정을 확인합니다.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-5 gap-5">
        <DashboardCard label="오늘 작업 일정" value={`${dashboard?.todayScheduleCount ?? 0}건`} />
        <DashboardCard label="이번 주 작업 일정" value={`${dashboard?.thisWeekScheduleCount ?? 0}건`} />
        <DashboardCard label="이번 달 매출" value={formatMoney(dashboard?.totalRevenue ?? 0)} />
        <DashboardCard label="이번 달 비용" value={formatMoney(dashboard?.totalExpense ?? 0)} />
        <DashboardCard label="이번 달 순이익" value={formatMoney(dashboard?.netProfit ?? 0)} tone={(dashboard?.netProfit ?? 0) < 0 ? "danger" : "profit"} />
        <DashboardCard label="미결제 고객" value={`${dashboard?.unpaidCustomerCount ?? 0}명`} tone="danger" />
        <DashboardCard label="미결제 금액" value={formatMoney(dashboard?.unpaidAmount ?? 0)} tone="danger" />
        <DashboardCard label="재방문 예정" value={`${dashboard?.revisitCustomerCount ?? 0}명`} />
        <DashboardCard label="결제 완료 고객" value={`${dashboard?.paidCustomerCount ?? 0}명`} tone="profit" />
        <DashboardCard label="이번 달 완료" value={`${dashboard?.thisMonthCompletedWorkCount ?? 0}건`} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-brand-navy">다가오는 작업 일정</h2>
            <Link className="text-sm font-semibold text-brand-blue" to="/calendar">달력 보기</Link>
          </div>
          {upcomingFive.length === 0 ? <p className="text-sm text-slate-500">다가오는 작업 일정이 없습니다.</p> : null}
          <div className="space-y-3">
            {upcomingFive.map((schedule) => (
              <Link
                className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-brand-soft"
                key={schedule.customerId}
                to={`/customers/${schedule.customerId}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-brand-navy">{formatDate(schedule.workDate)}</span>
                  <StatusBadge value={schedule.customerStatus} />
                </div>
                <p className="mt-2 truncate text-sm text-slate-700">
                  {schedule.workStartTime ?? "--:--"} {schedule.customerName} · {schedule.productCategory} {schedule.productType}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <DashboardList title="미결제 고객" to="/stats">
          {dashboard?.unpaidCustomers.length ? dashboard.unpaidCustomers.map((customer) => (
            <Link className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-brand-soft" key={customer.id} to={`/customers/${customer.id}`}>
              <p className="truncate text-sm font-semibold text-brand-navy">{customer.name} · {customer.productCategory} {customer.productType}</p>
              <p className="mt-1 text-xs text-slate-500">미결제 {formatMoney(customer.unpaidAmount)}</p>
            </Link>
          )) : <EmptyText text="미결제 고객이 없습니다." />}
        </DashboardList>

        <DashboardList title="재방문 예정 고객" to="/stats">
          {dashboard?.revisitCustomers.length ? dashboard.revisitCustomers.map((customer) => (
            <Link className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-brand-soft" key={customer.id} to={`/customers/${customer.id}`}>
              <p className="truncate text-sm font-semibold text-brand-navy">{customer.name} · {customer.productCategory} {customer.productType}</p>
              <p className="mt-1 text-xs text-slate-500">재방문 {formatDate(customer.revisitDate)}</p>
            </Link>
          )) : <EmptyText text="재방문 예정 고객이 없습니다." />}
        </DashboardList>
      </div>
    </section>
  );
}

function DashboardList({ children, title, to }: { children: React.ReactNode; title: string; to: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-brand-navy">{title}</h2>
        <Link className="text-sm font-semibold text-brand-blue" to={to}>통계 보기</Link>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function EmptyText({ text }: { text: string }) {
  return <p className="text-sm text-slate-500">{text}</p>;
}

function DashboardCard({ label, value, tone = "default" }: DashboardCardProps) {
  const toneClass = {
    danger: "text-red-600",
    default: "text-brand-navy",
    profit: "text-emerald-600",
  }[tone];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${toneClass}`}>{value}</p>
    </article>
  );
}

type DashboardCardProps = {
  label: string;
  value: string;
  tone?: "default" | "danger" | "profit";
};
