const cards = [
  { label: "오늘 예약", value: "0건" },
  { label: "이번 달 매출", value: "0원" },
  { label: "신규 고객", value: "0명" },
];

export function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold text-brand-navy">대시보드</h1>
      <p className="mt-2 text-sm text-slate-500">다음 단계에서 예약, 고객, 매출 현황을 연결합니다.</p>
      <div className="mt-6 grid grid-cols-3 gap-5">
        {cards.map((card) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={card.label}>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-brand-navy">{card.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
