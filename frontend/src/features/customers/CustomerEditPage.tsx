import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCustomer, updateCustomer } from "./customerApi";
import { CustomerForm } from "./CustomerForm";
import { CustomerFormValues } from "./customerTypes";

export function CustomerEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState<CustomerFormValues | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomer(id)
      .then((data) => setValues(data.customer))
      .catch((err) => setError(err instanceof Error ? err.message : "고객 정보를 불러오지 못했습니다."));
  }, [id]);

  async function submit(nextValues: CustomerFormValues) {
    setIsSubmitting(true);

    try {
      const data = await updateCustomer(id, nextValues);
      navigate(`/customers/${data.customer.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  if (!values) return <p className="text-sm text-slate-500">고객 정보를 불러오는 중입니다.</p>;

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">고객 수정</h1>
      <CustomerForm
        initialValues={values}
        isSubmitting={isSubmitting}
        submitText="수정 저장"
        onCancel={() => navigate(`/customers/${id}`)}
        onSubmit={submit}
      />
    </section>
  );
}
