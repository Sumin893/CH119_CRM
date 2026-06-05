import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<PlaceholderPage title="고객 관리" />} />
          <Route path="/calendar" element={<PlaceholderPage title="일정 달력" />} />
          <Route path="/finance" element={<PlaceholderPage title="매출/비용" />} />
          <Route path="/stats" element={<PlaceholderPage title="통계" />} />
          <Route path="/settings" element={<PlaceholderPage title="설정" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
