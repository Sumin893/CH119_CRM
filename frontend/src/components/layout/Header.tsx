import { LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";

export function Header() {
  const { admin, logout } = useAuth();

  return (
    <header className="hidden h-16 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
      <div>
        <p className="text-sm text-slate-500">관리자 페이지</p>
        <p className="font-semibold text-brand-navy">{admin?.name}님, 환영합니다.</p>
      </div>
      <button
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        onClick={logout}
        type="button"
      >
        <LogOut className="h-4 w-4" />
        로그아웃
      </button>
    </header>
  );
}
