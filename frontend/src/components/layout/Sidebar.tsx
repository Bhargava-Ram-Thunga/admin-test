import { useState } from "react";
import {
  LayoutGrid,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Settings,
  LogOut,
  MapPin,
  ShieldAlert,
  BarChart2,
  X,
  Menu,
  Share2,
  Calendar,
  FileText,
  Search,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "../../types";
import { canAccessRoute, canAccessRouteByPermission, type RouteId } from "../../constants/roles";

interface SidebarProps {
  user: User;
}

const MAIN_ITEMS: { id: RouteId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "students", label: "Students", icon: Users },
  { id: "trainers", label: "Teachers", icon: GraduationCap },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
];
const MANAGEMENT_ITEMS: { id: RouteId; label: string; icon: typeof MapPin }[] = [
  { id: "regions", label: "Regions", icon: MapPin },
  { id: "allocations", label: "Allocations", icon: Share2 },
  { id: "sessions", label: "Classes", icon: Calendar },
  { id: "finance", label: "Fees Collection", icon: DollarSign },
  { id: "safety", label: "Safety", icon: ShieldAlert },
  { id: "courses", label: "Content", icon: BookOpen },
  { id: "audit", label: "Audit log", icon: FileText },
];

export const Sidebar = ({ user }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const roleCodes = user.roles?.map((r) => r.code) ?? [];
  const permissions = user.permissions ?? [];
  const showByPermission = permissions.length > 0;
  const show = (routeId: RouteId) =>
    showByPermission
      ? canAccessRouteByPermission(permissions, routeId)
      : (roleCodes.length === 0 ? true : canAccessRoute(roleCodes, routeId));

  const NavItem = ({
    icon: Icon,
    label,
    id,
  }: {
    icon: typeof LayoutGrid;
    label: string;
    id: string;
  }) => {
    const isActive = location.pathname.includes(id);

    return (
      <button
        onClick={() => {
          navigate(`/${id}`);
          setMobileOpen(false);
        }}
        className={`flex items-center w-full gap-3 h-11 mb-1 transition-colors rounded-lg cursor-pointer pl-3
          ${isActive
            ? "bg-[#EDE7F6] text-[#5E35B1] font-semibold"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
      >
        <Icon size={20} className="shrink-0 text-current" />
        <span className="text-sm whitespace-nowrap">{label}</span>
      </button>
    );
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm
          transition-transform duration-200 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Kodingcaravan brand */}
        <div className="p-5 flex items-center gap-2 shrink-0 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-[#5E35B1] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">Kodingcaravan</span>
        </div>

        {/* Search */}
        <div className="p-3 shrink-0">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-slate-100 border border-slate-200 focus-within:ring-2 focus-within:ring-[#5E35B1]/20 focus-within:border-[#5E35B1]/40">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="search"
              placeholder="Search..."
              className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-5 sidebar-scrollbar min-h-0">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Main</p>
            {MAIN_ITEMS.filter((item) => show(item.id)).map((item) => (
              <NavItem key={item.id} icon={item.icon} label={item.label} id={item.id} />
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Management</p>
            {MANAGEMENT_ITEMS.filter((item) => show(item.id)).map((item) => (
              <NavItem key={item.id} icon={item.icon} label={item.label} id={item.id} />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1 shrink-0">
          {show("settings") && <NavItem icon={Settings} label="Settings" id="settings" />}
          <button
            className="flex items-center w-full gap-3 h-11 rounded-lg pl-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            onClick={() => {
              import("../../utils/auth").then(({ clearSession }) => {
                clearSession();
                window.location.reload();
              });
            }}
          >
            <LogOut size={20} className="shrink-0" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
