import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function ProtectedRoute() {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center">로그인 상태 확인 중...</div>;
  }

  if (!admin) return <Navigate to="/login" replace />;

  return <Outlet />;
}
