import { NavLink, Outlet } from "react-router-dom";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Header } from "./Header";
import { menuItems } from "./menu";
import { Sidebar } from "./Sidebar";

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuItems = menuItems.filter((item) => item.to !== "/settings");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-cyan/10">
              <Sparkles className="h-5 w-5 text-brand-cyan" />
            </div>
            <p className="truncate text-base font-bold text-brand-navy">HomeClean119</p>
          </div>
          <button
            aria-label="메뉴 열기"
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-brand-navy"
            onClick={() => setIsMobileMenuOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <Header />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
          />
          <aside className="relative h-full w-[min(82vw,320px)] bg-white px-4 py-5 shadow-panel">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-cyan/10">
                  <Sparkles className="h-5 w-5 text-brand-cyan" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-brand-navy">HomeClean119</p>
                  <p className="text-xs text-slate-500">Cleaning CRM</p>
                </div>
              </div>
              <button
                aria-label="메뉴 닫기"
                className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200"
                onClick={() => setIsMobileMenuOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {mobileMenuItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    [
                      "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold",
                      isActive ? "bg-brand-cyan/10 text-brand-navy" : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")
                  }
                  key={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  to={item.to}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
