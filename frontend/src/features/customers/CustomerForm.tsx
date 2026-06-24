import { FormEvent, useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  customerStatuses,
  invoiceIssuedOptions,
  leadSourceOptions,
  paymentMethods,
  paymentStatuses,
  productCategories,
  productTypes,
} from "./customerConstants";
import { CustomerFormValues } from "./customerTypes";
import { toDateInput } from "./formatters";

type CustomerFormProps = {
  initialValues: CustomerFormValues;
  isSubmitting: boolean;
  submitText: string;
  onCancel: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
};

export function CustomerForm(props: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(props.initialValues);
  const [error, setError] = useState("");

  useEffect(() => setValues(props.initialValues), [props.initialValues]);

  const types = productTypes[values.productCategory] ?? ["기타"];

  function setField(name: keyof CustomerFormValues, value: string | number | null) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function setCategory(value: string) {
    setValues((current) => ({
      ...current,
      productCategory: value,
      productType: productTypes[value]?.[0] ?? "기타",
    }));
  }

  function setLeadSource(value: string) {
    setValues((current) => ({
      ...current,
      leadSource: value,
      referralName: isReferralLeadSource(value) ? current.referralName : "",
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!values.name || !values.phone || !values.address || !values.leadSource || !values.productType) {
      setError("필수 항목을 입력해주세요.");
      return;
    }

    if (isReferralLeadSource(values.leadSource) && !String(values.referralName ?? "").trim()) {
      setError("지인 이름을 입력해주세요.");
      return;
    }

    const normalizedValues: CustomerFormValues = {
      ...values,
      referralName: isReferralLeadSource(values.leadSource) ? values.referralName : "",
      estimateRequestDate: null,
      workEndTime: "",
      estimatePrice: null,
      finalPrice: values.finalPrice ?? values.estimatePrice,
      deposit: null,
      balance: null,
    };

    await props.onSubmit(normalizedValues).catch((err) => {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    });
  }

  function setAmount(value: number | null) {
    setValues((current) => ({
      ...current,
      estimatePrice: null,
      finalPrice: value,
      deposit: null,
      balance: null,
    }));
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <Section title="기본 정보" columns={4}>
        <Input label="이름 또는 닉네임 *" value={values.name} onChange={(v) => setField("name", v)} />
        <Input label="전화번호 *" value={values.phone} onChange={(v) => setField("phone", v)} />
        <LeadSourceField
          leadSource={values.leadSource}
          referralName={values.referralName ?? ""}
          onLeadSourceChange={setLeadSource}
          onReferralNameChange={(v) => setField("referralName", v)}
        />
        <Input label="작업주소 *" value={values.address} onChange={(v) => setField("address", v)} />
      </Section>
      <Section title="작업 정보" columns={4}>
        <OptionPicker label="의뢰 제품 *" options={productCategories} value={values.productCategory} onChange={setCategory} />
        <OptionPicker label="제품 상세 유형 *" options={types} value={values.productType} onChange={(v) => setField("productType", v)} />
        <Input label="제품 브랜드" value={values.productBrand ?? ""} onChange={(v) => setField("productBrand", v)} />
        <NumberInput label="제품 대수" value={values.productCount} onChange={(v) => setField("productCount", v)} />
        <DateInput label="작업 날짜" value={values.workDate} onChange={(v) => setField("workDate", v)} />
        <TimeSelect label="작업 시간" value={values.workStartTime ?? ""} onChange={(v) => setField("workStartTime", v)} />
        <OptionPicker label="고객 상태 *" options={customerStatuses} value={values.customerStatus} onChange={(v) => setField("customerStatus", v)} />
      </Section>
      <Section title="결제 정보">
        <NumberInput label="금액" value={values.finalPrice ?? values.estimatePrice} align="right" onChange={setAmount} />
        <OptionPicker label="결제 방식" options={["선택 안 함", ...paymentMethods]} value={values.paymentMethod || "선택 안 함"} onChange={(v) => setField("paymentMethod", v === "선택 안 함" ? "" : v)} />
        <OptionPicker label="결제 상태 *" options={paymentStatuses} value={values.paymentStatus} onChange={(v) => setField("paymentStatus", v)} />
        <OptionPicker label="계산서 발행여부" options={invoiceIssuedOptions} value={values.invoiceIssued || "아니오"} onChange={(v) => setField("invoiceIssued", v)} />
      </Section>
      <Section title="메모" columns={2}>
        <Textarea label="작업 메모" value={values.memo ?? ""} onChange={(v) => setField("memo", v)} />
        <Textarea label="특이사항" value={values.specialNote ?? ""} onChange={(v) => setField("specialNote", v)} />
      </Section>
      <Section title="재방문 정보">
        <DateInput label="재방문 예정일" value={values.revisitDate} onChange={(v) => setField("revisitDate", v)} />
      </Section>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={props.onCancel}>취소</Button>
        <Button isLoading={props.isSubmitting}>{props.submitText}</Button>
      </div>
    </form>
  );
}

function Section({ title, children, columns = 3 }: SectionProps) {
  const gridClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  }[columns];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-brand-navy">{title}</h2>
      <div className={`grid gap-4 ${gridClass}`}>{children}</div>
    </section>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
};

function Input({ label, value, onChange, type = "text", align = "left", maxLength }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input className={`h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-cyan ${align === "right" ? "text-right" : ""}`} maxLength={maxLength} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

type InputProps = {
  label: string;
  value: string;
  type?: string;
  align?: "left" | "right";
  maxLength?: number;
  onChange: (value: string) => void;
};

function NumberInput({ label, value, onChange, align }: NumberInputProps) {
  return <Input label={label} value={formatNumberInput(value)} align={align} onChange={(v) => onChange(v ? Number(v.replace(/\D/g, "")) : null)} />;
}

type NumberInputProps = {
  label: string;
  value: number | null;
  align?: "left" | "right";
  onChange: (value: number | null) => void;
};

function DateInput({ label, value, onChange }: DateInputProps) {
  return <Input label={label} type="date" value={toDateInput(value)} onChange={(v) => onChange(v || null)} />;
}

type DateInputProps = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
};

function LeadSourceField({ leadSource, referralName, onLeadSourceChange, onReferralNameChange }: LeadSourceFieldProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(96px,0.8fr)]">
      <OptionPicker label="유입 경로 *" options={leadSourceOptions} value={leadSource} onChange={onLeadSourceChange} />
      {isReferralLeadSource(leadSource) && (
        <Input
          label="지인 이름 *"
          value={referralName}
          onChange={onReferralNameChange}
        />
      )}
    </div>
  );
}

function isReferralLeadSource(leadSource: string) {
  return leadSource === "지인소개" || leadSource === "지인";
}

type LeadSourceFieldProps = {
  leadSource: string;
  referralName: string;
  onLeadSourceChange: (value: string) => void;
  onReferralNameChange: (value: string) => void;
};

function OptionPicker({ label, options, value, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  function select(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <button
        className={[
          "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-left text-sm font-semibold transition",
          isOpen ? "border-brand-cyan bg-brand-cyan/5 shadow-sm ring-4 ring-brand-cyan/10" : "border-slate-200 bg-white hover:border-brand-cyan/60",
        ].join(" ")}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 ${activeOptionTone(value)}`}>
          <Check className="h-3.5 w-3.5" />
          {value}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-lg border border-brand-cyan/30 bg-white p-2 shadow-panel">
          <div className="grid gap-2">
            {options.map((option) => {
              const active = option === value;

              return (
                <button
                  className={optionPanelClass(option, active)}
                  key={option}
                  onClick={() => select(option)}
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotTone(option, active)}`} />
                    <span className="truncate">{option}</span>
                  </span>
                  {active && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/80">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function optionPanelClass(option: string, active: boolean) {
  const base = "flex h-11 items-center justify-between rounded-lg px-3 text-sm font-semibold transition";

  if (active) return `${base} ${activeOptionTone(option)} shadow-sm`;

  return `${base} bg-slate-50 text-slate-600 hover:bg-brand-soft hover:text-brand-navy`;
}

function dotTone(option: string, active: boolean) {
  if (active) return "bg-current";

  const tones: Record<string, string> = {
    예약중: "bg-amber-400",
    "예약 확정": "bg-sky-400",
    "작업 완료": "bg-emerald-400",
    "재방문 예정": "bg-teal-400",
    취소: "bg-rose-400",
    결제전: "bg-orange-400",
    예약금결제: "bg-lime-400",
    결제완료: "bg-emerald-400",
    환불: "bg-slate-400",
    당근: "bg-orange-400",
    지인소개: "bg-pink-400",
    지인: "bg-pink-400",
    "네이버 플레이스": "bg-green-400",
    현수막: "bg-violet-400",
    명함: "bg-indigo-400",
    기타: "bg-slate-400",
  };

  return tones[option] ?? "bg-brand-cyan";
}

function activeOptionTone(option: string) {
  const tones: Record<string, string> = {
    예약중: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
    "예약 확정": "bg-sky-100 text-sky-800 ring-1 ring-sky-300",
    "작업 완료": "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    "재방문 예정": "bg-teal-100 text-teal-800 ring-1 ring-teal-300",
    취소: "bg-rose-100 text-rose-800 ring-1 ring-rose-300",
    결제전: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
    예약금결제: "bg-lime-100 text-lime-800 ring-1 ring-lime-300",
    결제완료: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    환불: "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
    당근: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
    지인소개: "bg-pink-100 text-pink-800 ring-1 ring-pink-300",
    지인: "bg-pink-100 text-pink-800 ring-1 ring-pink-300",
    "네이버 플레이스": "bg-green-100 text-green-800 ring-1 ring-green-300",
    현수막: "bg-violet-100 text-violet-800 ring-1 ring-violet-300",
    명함: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300",
    기타: "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
  };

  return tones[option] ?? "bg-white text-brand-navy ring-1 ring-brand-cyan/40";
}

type SelectProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function Textarea({ label, value, onChange }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <textarea className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-cyan" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

const hours = Array.from({ length: 13 }, (_, index) => String(index).padStart(2, "0"));
const minutes = ["00", "30"];
const meridiems = ["오전", "오후"];

function TimeSelect({ label, value, onChange }: TimeSelectProps) {
  const { meridiem, hour, minute } = parseTimeValue(value);

  function update(nextMeridiem: string, nextHour: string, nextMinute: string) {
    if (!nextMeridiem && !nextHour && !nextMinute) {
      onChange("");
      return;
    }

    onChange(toStoredTime(nextMeridiem || "오전", nextHour || "00", nextMinute || "00"));
  }

  return (
    <div className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-2">
        <TimePart label="" options={meridiems} value={meridiem} onChange={(next) => update(next, hour, minute)} />
        <TimePart label="시" options={hours} value={hour} onChange={(next) => update(meridiem, next, minute)} />
        <span className="text-sm font-semibold text-slate-400">:</span>
        <TimePart label="분" options={minutes} value={minute} onChange={(next) => update(meridiem, hour, next)} />
      </div>
    </div>
  );
}

type TimeSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function formatNumberInput(value: number | null) {
  if (value === null) return "";

  return value.toLocaleString("ko-KR");
}

function parseTimeValue(value: string) {
  const [rawHour = "", minute = ""] = value.split(":");
  const numericHour = Number(rawHour);

  if (!rawHour || Number.isNaN(numericHour)) return { meridiem: "", hour: "", minute };

  const meridiem = numericHour >= 12 ? "오후" : "오전";
  const displayHour = meridiem === "오후" && numericHour > 12 ? numericHour - 12 : numericHour;

  return {
    meridiem,
    hour: String(displayHour).padStart(2, "0"),
    minute,
  };
}

function toStoredTime(meridiem: string, hour: string, minute: string) {
  const numericHour = Number(hour);
  const storedHour = meridiem === "오후"
    ? numericHour === 12 ? 12 : numericHour + 12
    : numericHour === 12 ? 0 : numericHour;

  return `${String(storedHour).padStart(2, "0")}:${minute}`;
}

function TimePart({ label, options, value, onChange }: TimePartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = value || "--";

  function select(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className={[
          "flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition",
          isOpen ? "border-brand-cyan bg-brand-cyan/5 shadow-sm ring-4 ring-brand-cyan/10" : "border-slate-200 bg-white hover:border-brand-cyan/60",
        ].join(" ")}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="inline-flex min-w-14 items-center justify-center rounded-md bg-brand-soft px-2.5 py-1 text-brand-navy ring-1 ring-brand-cyan/30">
          {displayValue}
          <span className="ml-1 text-xs text-slate-400">{label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-lg border border-brand-cyan/30 bg-white p-2 shadow-panel">
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
            {options.map((option) => {
              const active = option === value;

              return (
                <button
                  className={[
                    "flex h-10 items-center justify-center rounded-lg text-sm font-bold transition",
                    active
                      ? "bg-brand-cyan text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-brand-soft hover:text-brand-navy",
                  ].join(" ")}
                  key={option}
                  onClick={() => select(option)}
                  type="button"
                >
                  {active && <Check className="mr-1 h-3.5 w-3.5" />}
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type TimePartProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};
