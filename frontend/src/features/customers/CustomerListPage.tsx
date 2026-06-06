import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RotateCcw } from "lucide-react";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { customerStatuses, paymentStatuses, productCategories } from "./customerConstants";
import { CustomerFilters, deleteCustomer, fetchCustomers } from "./customerApi";
import { Customer } from "./customerTypes";
import { compact, formatDate, formatMoney } from "./formatters";
import { StatusBadge } from "./StatusBadge";

const emptyFilters: CustomerFilters = {};

export function CustomerListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CustomerFilters>(emptyFilters);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchCustomers(filters)
      .then((data) => setCustomers(data.customers))
      .catch((err) => setError(err instanceof Error ? err.message : "목록 조회에 실패했습니다."))
      .finally(() => setIsLoading(false));
  }, [filters]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    await deleteCustomer(deleteTarget.id);
    setDeleteTarget(null);
    navigate("/customers");
    setFilters({ ...filters });
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">고객 관리</h1>
          <p className="mt-2 text-sm text-slate-500">고객 정보와 작업, 결제 상태를 관리합니다.</p>
        </div>
        <Link className="flex h-10 items-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-semibold text-white" to="/customers/new">
          <Plus className="h-4 w-4" />
          고객 추가
        </Link>
      </div>

      <FilterPanel filters={filters} onChange={setFilters} />

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {isLoading ? <StateText text="고객 목록을 불러오는 중입니다." /> : null}
        {!isLoading && customers.length === 0 ? <StateText text="등록된 고객이 없습니다." /> : null}
        {!isLoading && customers.length > 0 ? (
          <table className="min-w-[1280px] table-fixed text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <Th>고객명</Th>
                <Th>전화번호</Th>
                <Th>주소 일부</Th>
                <Th>의뢰 제품</Th>
                <Th>제품 상세</Th>
                <Th>작업 날짜</Th>
                <Th>견적 금액</Th>
                <Th>최종 금액</Th>
                <Th>결제 상태</Th>
                <Th>고객 상태</Th>
                <Th>관리</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr className="cursor-pointer hover:bg-slate-50/70" key={customer.id} onClick={() => navigate(`/customers/${customer.id}`)}>
                  <Td>{customer.name}</Td>
                  <Td>{customer.phone}</Td>
                  <Td><span className="block truncate">{customer.address}</span></Td>
                  <Td>{customer.productCategory}</Td>
                  <Td>{customer.productType}</Td>
                  <Td>{formatDate(customer.workDate)}</Td>
                  <Td>{formatMoney(customer.estimatePrice)}</Td>
                  <Td>{formatMoney(customer.finalPrice)}</Td>
                  <Td><StatusBadge value={customer.paymentStatus} /></Td>
                  <Td><StatusBadge value={customer.customerStatus} /></Td>
                  <Td>
                    <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                      <Link className="text-brand-blue" to={`/customers/${customer.id}`}>상세</Link>
                      <Link className="text-slate-600" to={`/customers/${customer.id}/edit`}>수정</Link>
                      <button className="text-red-600" onClick={() => setDeleteTarget(customer)}>삭제</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="고객 삭제"
          message={`${deleteTarget.name} 고객 정보를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

function FilterPanel({ filters, onChange }: FilterPanelProps) {
  function setFilter(name: keyof CustomerFilters, value: string | boolean) {
    onChange({ ...filters, [name]: value || undefined });
  }

  return (
    <div className="mt-6 grid grid-cols-6 gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <input className="col-span-2 h-10 rounded-lg border border-slate-200 px-3 text-sm" placeholder="이름, 전화번호, 주소 검색" value={filters.search ?? ""} onChange={(e) => setFilter("search", e.target.value)} />
      <Select value={filters.productCategory ?? ""} options={["", ...productCategories]} onChange={(v) => setFilter("productCategory", v)} />
      <Select value={filters.customerStatus ?? ""} options={["", ...customerStatuses]} onChange={(v) => setFilter("customerStatus", v)} />
      <Select value={filters.paymentStatus ?? ""} options={["", ...paymentStatuses]} onChange={(v) => setFilter("paymentStatus", v)} />
      <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm" onClick={() => onChange(emptyFilters)}>
        <RotateCcw className="h-4 w-4" />
        초기화
      </button>
      <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" type="date" value={filters.workDateFrom ?? ""} onChange={(e) => setFilter("workDateFrom", e.target.value)} />
      <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" type="date" value={filters.workDateTo ?? ""} onChange={(e) => setFilter("workDateTo", e.target.value)} />
      <label className="col-span-2 flex h-10 items-center gap-2 text-sm text-slate-600">
        <input checked={Boolean(filters.revisitOnly)} type="checkbox" onChange={(e) => setFilter("revisitOnly", e.target.checked)} />
        재방문 예정 고객만 보기
      </label>
    </div>
  );
}

type FilterPanelProps = {
  filters: CustomerFilters;
  onChange: (filters: CustomerFilters) => void;
};

function Select({ options, value, onChange }: SelectProps) {
  return (
    <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option || "전체"}</option>)}
    </select>
  );
}

type SelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function StateText({ text }: { text: string }) {
  return <div className="p-10 text-center text-sm text-slate-500">{text}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-3">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-4 align-middle text-slate-700">{compact(children as string)}</td>;
}
