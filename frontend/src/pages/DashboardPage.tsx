import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../features/customers/StatusBadge";
import { formatKoreanDate, toDateKey } from "../features/schedules/dateUtils";
import { fetchSchedules, fetchUpcomingSchedules } from "../features/schedules/scheduleApi";
import { Schedule } from "../features/schedules/scheduleTypes";

export function DashboardPage() {
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = toDateKey(new Date());

    Promise.all([fetchSchedules({ date: today }), fetchUpcomingSchedules(7)])
      .then(([todayData, upcomingData]) => {
        setTodaySchedules(todayData.schedules);
        setUpcomingSchedules(upcomingData.schedules);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "대시보드 일정을 불러오지 못했습니다."));
  }, []);

  const upcomingFive = useMemo(() => upcomingSchedules.slice(0, 5), [upcomingSchedules]);

  return (
    <section>
      <h1 className="text-2xl font-bold text-brand-navy">대시보드</h1>
      <p className="mt-2 text-sm text-slate-500">오늘과 이번 주 작업 일정을 확인합니다.</p>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-3 gap-5">
        <DashboardCard label="오늘 작업 일정" value={`${todaySchedules.length}건`} />
        <DashboardCard label="이번 주 작업 일정" value={`${upcomingSchedules.length}건`} />
        <DashboardCard label="이번 달 매출" value="0원" />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">다가오는 작업 일정</h2>
          <Link className="text-sm font-semibold text-brand-blue" to="/calendar">달력 보기</Link>
        </div>
        {upcomingFive.length === 0 ? <p className="text-sm text-slate-500">다가오는 작업 일정이 없습니다.</p> : null}
        <div className="space-y-3">
          {upcomingFive.map((schedule) => (
            <Link
              className="grid grid-cols-[120px_100px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:bg-brand-soft"
              key={schedule.id}
              to={`/customers/${schedule.customerId}`}
            >
              <span className="text-sm font-semibold text-brand-navy">{formatKoreanDate(schedule.workDate)}</span>
              <span className="text-sm text-slate-500">{schedule.workStartTime ?? "--:--"}</span>
              <span className="truncate text-sm text-slate-700">
                {schedule.customerName} · {schedule.productCategory} {schedule.productType}
              </span>
              <StatusBadge value={schedule.customerStatus} />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function DashboardCard({ label, value }: DashboardCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-brand-navy">{value}</p>
    </article>
  );
}

type DashboardCardProps = {
  label: string;
  value: string;
};
