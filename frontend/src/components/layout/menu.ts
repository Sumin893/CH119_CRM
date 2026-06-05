import { BarChart3, CalendarDays, LayoutDashboard, Settings, Users, Wallet } from "lucide-react";

export const menuItems = [
  { to: "/", label: "대시보드", icon: LayoutDashboard },
  { to: "/customers", label: "고객 관리", icon: Users },
  { to: "/calendar", label: "일정 달력", icon: CalendarDays },
  { to: "/finance", label: "매출/비용", icon: Wallet },
  { to: "/stats", label: "통계", icon: BarChart3 },
  { to: "/settings", label: "설정", icon: Settings },
];
