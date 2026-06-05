type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section>
      <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
      <div className="mt-6 rounded-lg border border-dashed border-brand-cyan/50 bg-white p-10 text-center">
        <p className="font-semibold text-brand-navy">준비 중입니다.</p>
        <p className="mt-2 text-sm text-slate-500">다음 개발 단계에서 실제 기능을 추가할 예정입니다.</p>
      </div>
    </section>
  );
}
