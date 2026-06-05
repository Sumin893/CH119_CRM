import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { deleteCustomer, fetchCustomer } from "./customerApi";
import { Customer } from "./customerTypes";
import { compact, formatDate, formatMoney } from "./formatters";
import { StatusBadge } from "./StatusBadge";

export function CustomerDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    fetchCustomer(id)
      .then((data) => setCustomer(data.customer))
      .catch((err) => setError(err instanceof Error ? err.message : "고객 정보를 불러오지 못했습니다."));
  }, [id]);

  async function confirmDelete() {
    await deleteCustomer(id);
    navigate("/customers");
  }

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  if (!customer) return <p className="text-sm text-slate-500">고객 정보를 불러오는 중입니다.</p>;

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">{customer.name}</h1>
        <div className="flex gap-2">
          <Link className="rounded-lg border border-slate-200 px-4 py-2 text-sm" to="/customers">목록으로</Link>
          <Link className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white" to={`/customers/${id}/edit`}>수정</Link>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => setIsConfirmOpen(true)}>삭제</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <InfoCard title="기본 정보" items={[["이름", customer.name], ["전화번호", customer.phone], ["주소", customer.address]]} />
        <InfoCard title="작업 정보" items={[
          ["의뢰 제품", customer.productCategory],
          ["제품 상세", customer.productType],
          ["브랜드", customer.productBrand],
          ["대수", `${customer.productCount}대`],
          ["견적 요청일", formatDate(customer.estimateRequestDate)],
          ["작업 날짜", formatDate(customer.workDate)],
          ["작업 시간", `${compact(customer.workStartTime)} ~ ${compact(customer.workEndTime)}`],
          ["고객 상태", <StatusBadge value={customer.customerStatus} />],
        ]} />
        <InfoCard title="결제 정보" items={[
          ["견적 가격", formatMoney(customer.estimatePrice)],
          ["최종 결제 금액", formatMoney(customer.finalPrice)],
          ["예약금", formatMoney(customer.deposit)],
          ["잔금", formatMoney(customer.balance)],
          ["결제 방식", customer.paymentMethod],
          ["결제 상태", <StatusBadge value={customer.paymentStatus} />],
        ]} />
        <InfoCard title="메모" items={[["작업 메모", customer.memo], ["특이사항", customer.specialNote]]} />
        <InfoCard title="재방문 정보" items={[["재방문 예정일", formatDate(customer.revisitDate)]]} />
      </div>
      {isConfirmOpen && (
        <ConfirmModal
          title="고객 삭제"
          message={`${customer.name} 고객 정보를 삭제하시겠습니까?`}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

type InfoItem = [string, React.ReactNode];

function InfoCard({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 font-bold text-brand-navy">{title}</h2>
      <dl className="space-y-3">
        {items.map(([label, value]) => (
          <div className="grid grid-cols-[110px_1fr] gap-4 text-sm" key={label}>
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-slate-800">{compact(value as string)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
