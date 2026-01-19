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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "../../types";
import logo from "../../assets/logo.png";

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem = ({ icon: Icon, label, id }: any) => {
    const isActive = location.pathname.includes(id);

    return (
      <button
        onClick={() => {
          navigate(`/${id}`);
          setMobileOpen(false);
        }}
        className={`flex items-center h-12 mb-1 transition-all duration-300 ease-in-out rounded-xl cursor-pointer 
          ${isExpanded ? "w-full gap-3 ml-0 pl-3" : "w-12 gap-0 ml-1 pl-2"}
          ${isActive
            ? "bg-[#F39EB6] text-white shadow-sm font-semibold"
            : "text-white/80 hover:bg-[#F39EB6]/20 hover:text-white"
          } `}
      >
        <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out shrink-0">
          <Icon size={20} />
        </div>
        <span
          className={`text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-w-40 opacity-100 ml-0" : "max-w-0 opacity-0 ml-0"
            }`}
        >
          {label}
        </span>
      </button>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <p
      className={`text-xs font-bold text-white/50 uppercase mb-3 tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out 
        ${isExpanded ? "max-w-40 opacity-100 pl-6" : "max-w-0 opacity-0 pl-0"}
      `}
    >
      {label}
    </p>
  );


  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-[#4D2B8C] text-white rounded-lg shadow-lg"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`fixed left-0 top-0 h-screen bg-[#4D2B8C] text-white z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out shadow-2xl 
                ${mobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
          } 
                ${isExpanded ? "lg:w-64" : "lg:w-20"}`}
      >

        <div className="p-6 flex items-center gap-3 transition-all duration-300 ease-in-out pl-6 shrink-0">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-lg flex-shrink-0 shadow-lg shadow-black/20"
          />
          <span
            className={`font-bold text-xl tracking-tight text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
              }`}
          >
            KodingC.
          </span>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-6 mt-6 sidebar-scrollbar min-h-0">
          <div>
            <SectionLabel label="Main Menu" />
            <NavItem icon={LayoutGrid} label="Dashboard" id="dashboard" />
            <NavItem icon={Users} label="Students" id="students" />
            <NavItem icon={GraduationCap} label="Trainers" id="trainers" />
            <NavItem icon={BarChart2} label="Analytics" id="analytics" />
          </div>
          <div>
            <SectionLabel label="Management" />
            <NavItem icon={MapPin} label="Regions" id="regions" />
            <NavItem icon={Share2} label="Allocations" id="allocations" />
            <NavItem icon={Calendar} label="Sessions" id="sessions" />
            <NavItem icon={DollarSign} label="Finance" id="finance" />
            <NavItem icon={ShieldAlert} label="Safety" id="safety" />
            <NavItem icon={BookOpen} label="Content" id="courses" />
          </div>
        </div>
        <div className="p-3 space-y-1 bg-black/10 shrink-0 pb-6">
          <NavItem icon={Settings} label="Settings" id="settings" />
          <button
            className={`flex items-center h-12 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 ease-in-out text-sm
              ${isExpanded ? "w-full gap-3 ml-0 pl-3" : "w-12 gap-0 ml-1 pl-2"}
            `}
            onClick={() => {
              import("../../utils/auth").then(({ clearSession }) => {
                clearSession();
                window.location.reload();
              });
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out shrink-0">
              <LogOut size={20} />
            </div>
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-w-40 opacity-100" : "max-w-0 opacity-0"
                }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
