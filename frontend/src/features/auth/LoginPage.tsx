import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { useAuth } from "./useAuth";

export function LoginPage() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (admin) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-soft px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-panel sm:p-8">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-cyan/10">
            <Sparkles className="h-6 w-6 text-brand-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">HomeClean119 CRM</h1>
          <p className="mt-2 text-sm text-slate-500">관리자 계정으로 로그인해주세요.</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <TextField label="아이디" value={email} onChange={setEmail} />
          <TextField label="비밀번호" type="password" value={password} onChange={setPassword} />
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Button full isLoading={isSubmitting}>로그인</Button>
        </form>
      </section>
    </main>
  );
}
