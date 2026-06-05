import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCustomer } from "./customerApi";
import { emptyCustomerForm } from "./customerConstants";
import { CustomerForm } from "./CustomerForm";
import { CustomerFormValues } from "./customerTypes";

export function CustomerNewPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(values: CustomerFormValues) {
    setIsSubmitting(true);

    try {
      const data = await createCustomer(values);
      navigate(`/customers/${data.customer.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">고객 추가</h1>
      <CustomerForm
        initialValues={emptyCustomerForm}
        isSubmitting={isSubmitting}
        submitText="저장"
        onCancel={() => navigate("/customers")}
        onSubmit={submit}
      />
    </section>
  );
}
