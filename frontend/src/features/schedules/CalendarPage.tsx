import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { StatusBadge } from "../customers/StatusBadge";
import { fetchSchedules } from "./scheduleApi";
import { Schedule } from "./scheduleTypes";
import { buildCalendarDays, formatKoreanDate, monthTitle, toDateKey, toMonthKey } from "./dateUtils";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarPage() {
  const navigate = useNavigate();
  const todayKey = toDateKey(new Date());
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const monthKey = toMonthKey(monthDate);

  useEffect(() => {
    setIsLoading(true);
    fetchSchedules({ month: monthKey })
      .then((data) => setSchedules(data.schedules))
      .catch((err) => setError(err instanceof Error ? err.message : "일정을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [monthKey]);

  const grouped = useMemo(() => {
    return schedules.reduce<Record<string, Schedule[]>>((acc, schedule) => {
      acc[schedule.workDate] = [...(acc[schedule.workDate] ?? []), schedule];
      return acc;
    }, {});
  }, [schedules]);

  const selectedSchedules = grouped[selectedDate] ?? [];

  function moveMonth(amount: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function goToday() {
    const today = new Date();
    setMonthDate(today);
    setSelectedDate(toDateKey(today));
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">일정 달력</h1>
          <p className="mt-2 text-sm text-slate-500">고객 작업 날짜를 기준으로 월간 일정을 확인합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm" onClick={goToday}>이번 달</button>
          <IconButton onClick={() => moveMonth(-1)}><ChevronLeft className="h-4 w-4" /></IconButton>
          <p className="min-w-32 text-center text-lg font-bold text-brand-navy">{monthTitle(monthDate)}</p>
          <IconButton onClick={() => moveMonth(1)}><ChevronRight className="h-4 w-4" /></IconButton>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_360px] gap-5">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {weekdays.map((day) => <div className="px-3 py-3 text-center text-sm font-bold text-slate-500" key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {buildCalendarDays(monthDate).map((date) => {
              const key = toDateKey(date);
              const daySchedules = grouped[key] ?? [];
              const isCurrentMonth = date.getMonth() === monthDate.getMonth();
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;

              return (
                <button
                  className={[
                    "min-h-36 border-b border-r border-slate-100 p-2 text-left align-top transition hover:bg-brand-soft",
                    !isCurrentMonth ? "bg-slate-50/70 text-slate-300" : "bg-white",
                    isSelected ? "ring-2 ring-inset ring-brand-cyan" : "",
                  ].join(" ")}
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  type="button"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? "bg-brand-blue text-white" : ""}`}>
                      {date.getDate()}
                    </span>
                    {daySchedules.length > 0 && <span className="text-xs font-semibold text-brand-cyan">{daySchedules.length}건</span>}
                  </div>
                  <div className="space-y-1">
                    {daySchedules.slice(0, 3).map((schedule) => (
                      <div
                        className="truncate rounded-md bg-brand-cyan/10 px-2 py-1 text-xs font-medium text-brand-navy"
                        key={schedule.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/customers/${schedule.customerId}`);
                        }}
                      >
                        {schedule.workStartTime ?? "--:--"} {schedule.customerName} / {schedule.productCategory}
                      </div>
                    ))}
                    {daySchedules.length > 3 && <p className="text-xs font-semibold text-slate-500">+{daySchedules.length - 3}개 더보기</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <SelectedSchedulePanel date={selectedDate} isLoading={isLoading} schedules={selectedSchedules} />
      </div>
    </section>
  );
}

function SelectedSchedulePanel({ date, isLoading, schedules }: PanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-brand-cyan" />
        <h2 className="font-bold text-brand-navy">{formatKoreanDate(date)} 작업 목록</h2>
      </div>
      {isLoading ? <p className="text-sm text-slate-500">일정을 불러오는 중입니다.</p> : null}
      {!isLoading && schedules.length === 0 ? <p className="text-sm text-slate-500">등록된 작업 일정이 없습니다.</p> : null}
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <article className="rounded-lg border border-slate-200 p-4" key={schedule.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-brand-navy">{schedule.workStartTime ?? "--:--"} {schedule.customerName}</p>
                <p className="mt-1 text-xs text-slate-500">{schedule.phoneMasked} · {schedule.addressSummary}</p>
              </div>
              <StatusBadge value={schedule.customerStatus} />
            </div>
            <p className="mt-3 text-sm text-slate-700">{schedule.productCategory} {schedule.productType} {schedule.productCount}대</p>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadge value={schedule.paymentStatus} />
              <Link className="text-sm font-semibold text-brand-blue" to={`/customers/${schedule.customerId}`}>상세 보기</Link>
            </div>
            {schedule.memo && <p className="mt-3 line-clamp-2 text-xs text-slate-500">{schedule.memo}</p>}
          </article>
        ))}
      </div>
    </aside>
  );
}

type PanelProps = {
  date: string;
  isLoading: boolean;
  schedules: Schedule[];
};

function IconButton({ children, onClick }: IconButtonProps) {
  return <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white" onClick={onClick}>{children}</button>;
}

type IconButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};
