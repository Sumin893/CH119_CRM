import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./features/auth/LoginPage";
import { CustomerDetailPage } from "./features/customers/CustomerDetailPage";
import { CustomerEditPage } from "./features/customers/CustomerEditPage";
import { CustomerListPage } from "./features/customers/CustomerListPage";
import { CustomerNewPage } from "./features/customers/CustomerNewPage";
import { CalendarPage } from "./features/schedules/CalendarPage";
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
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/new" element={<CustomerNewPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/finance" element={<PlaceholderPage title="매출/비용" />} />
          <Route path="/stats" element={<PlaceholderPage title="통계" />} />
          <Route path="/settings" element={<PlaceholderPage title="설정" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
