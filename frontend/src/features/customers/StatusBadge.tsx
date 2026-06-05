type StatusBadgeProps = {
  value: string;
  tone?: "cyan" | "mint" | "slate";
};

const statusTones: Record<string, string> = {
  예약중: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "예약 확정": "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  "작업 완료": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "재방문 예정": "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  취소: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  결제전: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  예약금결제: "bg-lime-50 text-lime-700 ring-1 ring-lime-200",
  결제완료: "bg-brand-mint/15 text-emerald-700 ring-1 ring-emerald-200",
  환불: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const tones = {
  cyan: "bg-brand-cyan/10 text-brand-navy",
  mint: "bg-brand-mint/15 text-emerald-700",
  slate: "bg-slate-100 text-slate-600",
};

export function StatusBadge({ value, tone = "slate" }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTones[value] ?? tones[tone]}`}>
      {value}
    </span>
  );
}
