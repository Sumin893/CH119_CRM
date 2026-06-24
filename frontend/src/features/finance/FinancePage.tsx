import { FormEvent, useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { formatMoney } from "../customers/formatters";
import { Customer } from "../customers/customerTypes";
import { expenseCategories, paymentMethods, revenueCategories } from "./financeConstants";
import {
  deleteExpense,
  deleteRevenue,
  fetchCustomerOptions,
  fetchExpenses,
  fetchFinanceCategories,
  fetchFinanceSummary,
  fetchRevenues,
  saveExpense,
  saveRevenue,
} from "./financeApi";
import { CategorySummary, Expense, FinanceSummary, Revenue } from "./financeTypes";

type Tab = "revenues" | "expenses";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function FinancePage() {
  const [tab, setTab] = useState<Tab>("revenues");
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [categories, setCategories] = useState<{ revenueByCategory: CategorySummary[]; expenseByCategory: CategorySummary[] }>({
    revenueByCategory: [],
    expenseByCategory: [],
  });
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; item: Revenue | Expense } | null>(null);
  const [revenueCategory, setRevenueCategory] = useState("");
  const [revenuePaymentMethod, setRevenuePaymentMethod] = useState("");
  const [revenueSearch, setRevenueSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [error, setError] = useState("");

  const query = useMemo(() => ({ month }), [month]);

  function reload() {
    setError("");
    Promise.all([
      fetchFinanceSummary(query),
      fetchFinanceCategories(query),
      fetchRevenues({ ...query, category: revenueCategory, paymentMethod: revenuePaymentMethod, search: revenueSearch }),
      fetchExpenses({ ...query, category: expenseCategory, search: expenseSearch }),
      fetchCustomerOptions(),
    ])
      .then(([summaryData, categoryData, revenueData, expenseData, customerData]) => {
        setSummary(summaryData);
        setCategories(categoryData);
        setRevenues(revenueData.revenues);
        setExpenses(expenseData.expenses);
        setCustomers(customerData.customers);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "매출/비용 데이터를 불러오지 못했습니다."));
  }

  useEffect(reload, [query, revenueCategory, revenuePaymentMethod, revenueSearch, expenseCategory, expenseSearch]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    if (deleteTarget.type === "revenues") await deleteRevenue(deleteTarget.item.id);
    if (deleteTarget.type === "expenses") await deleteExpense(deleteTarget.item.id);
    setDeleteTarget(null);
    reload();
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">매출/비용 관리</h1>
          <p className="mt-2 text-sm text-slate-500">월별 수입, 비용, 순이익을 관리합니다.</p>
        </div>
        <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
        <SummaryCard label="총 수입" value={summary?.totalRevenue ?? 0} tone="revenue" />
        <SummaryCard label="총 비용" value={summary?.totalExpense ?? 0} tone="expense" />
        <SummaryCard label="순이익" value={summary?.netProfit ?? 0} tone={(summary?.netProfit ?? 0) < 0 ? "expense" : "profit"} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        <CategoryBox title="수입 카테고리별 합계" items={categories.revenueByCategory} />
        <CategoryBox title="비용 카테고리별 합계" items={categories.expenseByCategory} />
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <TabButton active={tab === "revenues"} onClick={() => setTab("revenues")}>수입 내역</TabButton>
            <TabButton active={tab === "expenses"} onClick={() => setTab("expenses")}>비용 내역</TabButton>
          </div>
          <button
            className="hidden rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white sm:block"
            onClick={() => (tab === "revenues" ? setEditingRevenue(emptyRevenue(month)) : setEditingExpense(emptyExpense(month)))}
          >
            {tab === "revenues" ? "수입 추가" : "비용 추가"}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {tab === "revenues" ? (
            <>
              <Select label="카테고리" value={revenueCategory} onChange={setRevenueCategory} options={["", ...revenueCategories]} labels={{ "": "전체" }} />
              <Select label="결제 방식" value={revenuePaymentMethod} onChange={setRevenuePaymentMethod} options={["", ...paymentMethods]} labels={{ "": "전체" }} />
              <Input label="검색" value={revenueSearch} onChange={setRevenueSearch} />
              <button className="mt-7 h-10 rounded-lg border border-slate-200 text-sm" onClick={() => { setRevenueCategory(""); setRevenuePaymentMethod(""); setRevenueSearch(""); }}>필터 초기화</button>
            </>
          ) : (
            <>
              <Select label="카테고리" value={expenseCategory} onChange={setExpenseCategory} options={["", ...expenseCategories]} labels={{ "": "전체" }} />
              <Input label="검색" value={expenseSearch} onChange={setExpenseSearch} />
              <button className="mt-7 h-10 rounded-lg border border-slate-200 text-sm" onClick={() => { setExpenseCategory(""); setExpenseSearch(""); }}>필터 초기화</button>
            </>
          )}
        </div>
        {tab === "revenues" ? (
          <RevenueTable revenues={revenues} onDelete={(item) => setDeleteTarget({ type: "revenues", item })} onEdit={setEditingRevenue} />
        ) : (
          <ExpenseTable expenses={expenses} onDelete={(item) => setDeleteTarget({ type: "expenses", item })} onEdit={setEditingExpense} />
        )}
      </div>
      {editingRevenue && <RevenueModal customers={customers} revenue={editingRevenue} onClose={() => setEditingRevenue(null)} onSaved={() => { setEditingRevenue(null); reload(); }} />}
      {editingExpense && <ExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onSaved={() => { setEditingExpense(null); reload(); }} />}
      {deleteTarget && (
        <ConfirmModal
          title="내역 삭제"
          message={deleteTarget.type === "revenues" && (deleteTarget.item as Revenue).sourceType === "CUSTOMER_PAYMENT" ? "고객 결제 완료로 자동 생성된 수입입니다. 삭제하시겠습니까?" : "선택한 내역을 삭제하시겠습니까?"}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  const color = tone === "expense" ? "text-red-600" : tone === "profit" ? "text-emerald-600" : "text-brand-navy";
  return <article className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5"><p className="text-sm text-slate-500">{label}</p><p className={`mt-3 break-words text-xl font-bold sm:text-2xl ${color}`}>{formatMoney(value)}</p></article>;
}

function CategoryBox({ title, items }: { title: string; items: CategorySummary[] }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-bold text-brand-navy">{title}</h2><div className="mt-4 space-y-2">{items.length === 0 ? <p className="text-sm text-slate-500">데이터가 없습니다.</p> : items.map((item) => <div className="flex justify-between text-sm" key={item.category}><span>{item.category} ({item.count})</span><strong>{formatMoney(item.total)}</strong></div>)}</div></article>;
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${active ? "bg-brand-cyan/10 text-brand-navy" : "text-slate-500"}`} onClick={onClick}>{children}</button>;
}

function RevenueTable({ revenues, onEdit, onDelete }: { revenues: Revenue[]; onEdit: (item: Revenue) => void; onDelete: (item: Revenue) => void }) {
  return <><div className="hidden overflow-x-auto md:block"><table className="min-w-[920px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><Th>날짜</Th><Th>카테고리</Th><Th>고객명</Th><Th align="right">금액</Th><Th>결제 방식</Th><Th>등록 방식</Th><Th>메모</Th><Th>관리</Th></tr></thead><tbody>{revenues.map((item) => <tr className="border-t border-slate-100" key={item.id}><Td>{item.date.replace(/-/g, ".")}</Td><Td>{item.category}</Td><Td>{item.customerName ?? "-"}</Td><Td align="right">{formatMoney(item.amount)}</Td><Td>{item.paymentMethod ?? "-"}</Td><Td>{item.sourceType === "CUSTOMER_PAYMENT" ? "자동" : "수동"}</Td><Td>{item.memo ?? "-"}</Td><Td><ActionButtons onDelete={() => onDelete(item)} onEdit={() => onEdit(item)} /></Td></tr>)}</tbody></table></div><div className="md:hidden">{revenues.map((item) => <FinanceListCard key={item.id} title={item.customerName ?? item.category} subtitle={`${item.date.replace(/-/g, ".")} · ${item.category}`} amount={formatMoney(item.amount)} meta={`${item.paymentMethod ?? "-"} · ${item.sourceType === "CUSTOMER_PAYMENT" ? "자동" : "수동"}`} memo={item.memo} />)}</div></>;
}

function ExpenseTable({ expenses, onEdit, onDelete }: { expenses: Expense[]; onEdit: (item: Expense) => void; onDelete: (item: Expense) => void }) {
  return <><div className="hidden overflow-x-auto md:block"><table className="min-w-[720px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><Th>날짜</Th><Th>카테고리</Th><Th align="right">금액</Th><Th>거래처/구매처</Th><Th>메모</Th><Th>관리</Th></tr></thead><tbody>{expenses.map((item) => <tr className="border-t border-slate-100" key={item.id}><Td>{item.date.replace(/-/g, ".")}</Td><Td>{item.category}</Td><Td align="right">{formatMoney(item.amount)}</Td><Td>{item.vendor ?? "-"}</Td><Td>{item.memo ?? "-"}</Td><Td><ActionButtons onDelete={() => onDelete(item)} onEdit={() => onEdit(item)} /></Td></tr>)}</tbody></table></div><div className="md:hidden">{expenses.map((item) => <FinanceListCard key={item.id} title={item.category} subtitle={`${item.date.replace(/-/g, ".")} · ${item.vendor ?? "-"}`} amount={formatMoney(item.amount)} meta="비용" memo={item.memo} />)}</div></>;
}

function FinanceListCard({ amount, memo, meta, subtitle, title }: { amount: string; memo?: string | null; meta: string; subtitle: string; title: string }) {
  return <article className="border-b border-slate-100 p-4 last:border-b-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-brand-navy">{title}</p><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div><strong className="shrink-0 text-right text-brand-navy">{amount}</strong></div><p className="mt-3 text-sm text-slate-600">{meta}</p>{memo ? <p className="mt-2 line-clamp-2 text-sm text-slate-500">{memo}</p> : null}</article>;
}

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <div className="flex gap-2"><button className="text-brand-blue" onClick={onEdit}>수정</button><button className="text-red-600" onClick={onDelete}>삭제</button></div>;
}

function Th({ align = "left", children }: { align?: "left" | "right"; children: React.ReactNode }) { return <th className={`px-4 py-3 ${align === "right" ? "text-right" : ""}`}>{children}</th>; }
function Td({ align = "left", children }: { align?: "left" | "right"; children: React.ReactNode }) { return <td className={`px-4 py-3 text-slate-700 ${align === "right" ? "text-right" : ""}`}>{children}</td>; }

function emptyRevenue(month: string): Revenue { return { id: 0, date: `${month}-01`, customerId: null, customerName: null, category: "에어컨 청소", amount: 0, paymentMethod: "계좌이체", memo: "", sourceType: "MANUAL" }; }
function emptyExpense(month: string): Expense { return { id: 0, date: `${month}-01`, category: "세제/소모품", amount: 0, vendor: "", memo: "" }; }

function RevenueModal({ revenue, customers, onClose, onSaved }: { revenue: Revenue; customers: Customer[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(revenue);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); try { await saveRevenue({ ...form, amount: Number(form.amount), customerId: form.customerId || null }); onSaved(); } catch (err) { setError(err instanceof Error ? err.message : "저장에 실패했습니다."); } }
  return <Modal title="수입 내역" error={error} onClose={onClose} onSubmit={submit}><Input label="날짜" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><Select label="고객" value={String(form.customerId ?? "")} onChange={(v) => setForm({ ...form, customerId: v ? Number(v) : null })} options={["", ...customers.map((c) => String(c.id))]} labels={{ "": "연결 없음", ...Object.fromEntries(customers.map((c) => [String(c.id), `${c.name} / ${c.productCategory} / ${c.workDate?.slice(0, 10) ?? "-"}`])) }} /><Select label="카테고리" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={revenueCategories} /><MoneyInput label="금액" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} /><Select label="결제 방식" value={form.paymentMethod ?? ""} onChange={(v) => setForm({ ...form, paymentMethod: v })} options={["", ...paymentMethods]} labels={{ "": "선택 안 함" }} /><Input label="메모" value={form.memo ?? ""} onChange={(v) => setForm({ ...form, memo: v })} /></Modal>;
}

function ExpenseModal({ expense, onClose, onSaved }: { expense: Expense; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(expense);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); try { await saveExpense({ ...form, amount: Number(form.amount) }); onSaved(); } catch (err) { setError(err instanceof Error ? err.message : "저장에 실패했습니다."); } }
  return <Modal title="비용 내역" error={error} onClose={onClose} onSubmit={submit}><Input label="날짜" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} /><Select label="카테고리" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={expenseCategories} /><MoneyInput label="금액" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} /><Input label="거래처/구매처" value={form.vendor ?? ""} onChange={(v) => setForm({ ...form, vendor: v })} /><Input label="메모" value={form.memo ?? ""} onChange={(v) => setForm({ ...form, memo: v })} /></Modal>;
}

function Modal({ title, error, children, onClose, onSubmit }: { title: string; error: string; children: React.ReactNode; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-900/35 px-4 py-6"><form className="w-full max-w-lg rounded-lg bg-white p-5 shadow-panel sm:p-6" onSubmit={onSubmit}><h2 className="text-lg font-bold text-brand-navy">{title}</h2>{error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div><div className="mt-6 flex justify-end gap-2"><button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={onClose} type="button">취소</button><button className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">저장</button></div></form></div>;
}

function MoneyInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Input label={label} align="right" value={formatNumberInput(value)} onChange={(v) => onChange(Number(v.replace(/\D/g, "")))} />;
}

function formatNumberInput(value: number) {
  if (!value) return "";

  return value.toLocaleString("ko-KR");
}

function Input({ align = "left", label, value, onChange, type = "text" }: { align?: "left" | "right"; label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span><input className={`h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-cyan ${align === "right" ? "text-right" : ""}`} type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Select({ label, value, options, labels = {}, onChange }: { label: string; value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span><select className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-cyan" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>;
}
