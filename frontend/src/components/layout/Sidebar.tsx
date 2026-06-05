import { NavLink } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { menuItems } from "./menu";

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-cyan/10">
          <Sparkles className="h-5 w-5 text-brand-cyan" />
        </div>
        <div>
          <p className="text-lg font-bold text-brand-navy">HomeClean119</p>
          <p className="text-xs text-slate-500">Cleaning CRM</p>
        </div>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              [
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
                isActive ? "bg-brand-cyan/10 text-brand-navy" : "text-slate-600 hover:bg-slate-50",
              ].join(" ")
            }
            key={item.to}
            to={item.to}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
