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
  Share2,
  Calendar,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { User } from "../../types";
import logo from "../../assets/logo.png";


interface SidebarProps {
  user: User;
  isExpanded: boolean;
  toggleExpanded: () => void; // Kept for mobile/generic usage compatibility if needed, but primary logic is hover
}

export const Sidebar = ({ isExpanded, toggleExpanded }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hover handlers logic wrapper
  const handleMouseEnter = () => {
    // Desktop only (>=1200px): Expand on hover
    if (!isExpanded && window.innerWidth >= 1200) {
      toggleExpanded();
    }
  };

  const handleMouseLeave = () => {
    // Desktop only (>=1200px): Collapse on leave
    if (isExpanded && window.innerWidth >= 1200) {
      toggleExpanded();
    }
  };

  const NavItem = ({ icon: Icon, label, id }: any) => {
    const isActive = location.pathname.includes(id);

    return (
      <button
        onClick={() => {
          navigate(`/${id}`);
          if (isExpanded && window.innerWidth < 768) {
            toggleExpanded();
          }
        }}
        className={`flex items-center h-12 mb-1 transition-all duration-300 ease-in-out rounded-xl cursor-pointer relative group overflow-hidden
          ${isExpanded ? "w-full gap-3 ml-0 pl-3" : "w-12 gap-0 ml-1 pl-2"}
          ${isActive
            ? "bg-[#F3F4FF] text-[var(--color-primary)]"
            : "text-[var(--text-muted)] hover:bg-gray-50 hover:text-[var(--color-primary)]"
          } `}
      >
        {/* Active Indicator Bar (Left) */}
        {
          isActive && (
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--color-primary)] rounded-r-lg"></div>
          )
        }

        <div className={`flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out shrink-0`}>
          <Icon size={20} />
        </div>

        {/* Text Label with Smooth Fade/Delay */}
        <span
          className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out origin-left
            ${isExpanded ? "max-w-[200px] opacity-100 ml-0 delay-75" : "max-w-0 opacity-0 ml-0 delay-0"}
          `}
        >
          {label}
        </span>
      </button >
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <p
      className={`text-xs font-bold text-[var(--text-muted)]/70 uppercase mb-3 tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out origin-left
        ${isExpanded ? "max-w-40 opacity-100 pl-6 delay-75" : "max-w-0 opacity-0 pl-0 delay-0"}
      `}
    >
      {label}
    </p>
  );


  return (
    <>
      {/* Mobile Toggle Trigger (Hamburger) is now in ProtectedLayout Header for better layout control, 
          but we keep local state sync in mind if needed. 
          Actually, the requirements say 'Start hidden, open as overlay'. 
          The Trigger should be in the Header. Sidebar just needs to receive 'mobileOpen' prop or similar?
          Wait, ProtectedLayout manages 'mobileOpen' via 'isSidebarExpanded'? 
          No, ProtectedLayout currently passed 'isExpanded' props.
          Let's assume 'toggleExpanded' on Mobile means 'Open/Close Drawer'.
          And on Desktop/Tablet it means 'Expand/Collapse'.
      */}

      {/* Overlay Backdrop for Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleExpanded}
      />

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-0 top-0 h-screen bg-[var(--color-bg-surface)] border-r border-gray-100 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
                ${/* Width Logic */ ""}
                ${isExpanded
            ? "w-[260px] translate-x-0 shadow-2xl"
            : "w-[80px] -translate-x-full md:translate-x-0 md:w-[80px]"
          }
        `}
      >

        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 transition-all duration-300 ease-in-out pl-5 shrink-0 relative overflow-hidden h-[80px]">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-lg flex-shrink-0"
          />
          <span
            className={`font-bold text-xl tracking-tight text-[var(--text-heading)] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out origin-left
              ${isExpanded ? "max-w-[200px] opacity-100 delay-75" : "max-w-0 opacity-0 delay-0"}
            `}
          >
            KC Admin
          </span>

          {/* Note: Toggle Button REMOVED as per requirements */}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-6 mt-2 sidebar-scrollbar min-h-0">
          <div>
            <SectionLabel label="Menu" />
            <NavItem icon={LayoutGrid} label="Dashboard" id="dashboard" />
            <NavItem icon={Users} label="Students" id="students" />
            <NavItem icon={GraduationCap} label="Teachers" id="trainers" />
            <NavItem icon={BarChart2} label="Analytics" id="analytics" />
          </div>
          <div>
            <SectionLabel label="Management" />
            <NavItem icon={MapPin} label="Regions" id="regions" />
            <NavItem icon={Share2} label="Allocations" id="allocations" />
            <NavItem icon={Calendar} label="Sessions" id="sessions" />
            <NavItem icon={DollarSign} label="Fees Collection" id="finance" />
            <NavItem icon={ShieldAlert} label="Safety" id="safety" />
            <NavItem icon={BookOpen} label="Library" id="courses" />
          </div>
        </div>
        <div className="p-3 space-y-1 bg-white shrink-0 pb-6 border-t border-gray-50">
          {/* Bottom items */}
          <NavItem icon={Settings} label="Settings" id="settings" />

          <button
            className={`flex items-center h-12 text-[var(--text-muted)] hover:text-[#EF4444] hover:bg-red-50 rounded-xl transition-all duration-300 ease-in-out text-sm group overflow-hidden
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
              className={`whitespace-nowrap overflow-hidden font-medium transition-all duration-300 ease-in-out origin-left
                ${isExpanded ? "max-w-[200px] opacity-100 delay-75" : "max-w-0 opacity-0 delay-0"}
              `}
            >
              Log Out
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
