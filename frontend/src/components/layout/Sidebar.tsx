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
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const Sidebar = ({ user }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Fix: Using pl-[30px] to center the 20px icon in the 80px (w-20) collapsed sidebar
    // (80px - 20px) / 2 = 30px padding on each side
    const NavItem = ({ icon: Icon, label, id }: any) => {
        const isActive = location.pathname.includes(id);

        return (
            <button
                onClick={() => {
                    navigate(`/${id}`);
                    setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-4 py-3 mb-1 transition-all rounded-xl cursor-pointer pl-[18px] ${isActive
                    ? "bg-[#6DC3BB] text-white shadow-md"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                    } `}
            >
                <div className="transition-all min-w-[20px]">
                    <Icon size={20} className="min-w-[20px]" />
                </div>
                <span
                    className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100 ml-0" : "w-0 opacity-0 -ml-4"
                        }`}
                >
                    {label}
                </span>
            </button>
        );
    };

    const SectionLabel = ({ label }: { label: string }) => (
        <p
            className={`text-xs font-bold text-white/40 uppercase mb-4 tracking-wider pl-[18px] whitespace-nowrap transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100" : "opacity-0"
                }`}
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
                    className="p-2 bg-[#393D7E] text-white rounded-lg shadow-lg"
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
                className={`fixed left-0 top-0 h-screen bg-[#393D7E] text-white z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl 
                ${mobileOpen
                        ? "translate-x-0 w-64"
                        : "-translate-x-full lg:translate-x-0"
                    } 
                ${isExpanded ? "lg:w-64" : "lg:w-20"}`}
            >
                <div
                    className="p-6 flex items-center gap-3 transition-all pl-6"
                >
                    <div className="w-8 h-8 bg-gradient-to-tr from-[#6DC3BB] to-[#5459AC] rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold shadow-lg shadow-[#6DC3BB]/30">
                        K
                    </div>
                    <span
                        className={`font-bold text-xl tracking-tight text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                            }`}
                    >
                        KodingC.
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-8 mt-4 no-scrollbar">
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
                        <NavItem icon={DollarSign} label="Finance" id="finance" />
                        <NavItem icon={ShieldAlert} label="Safety" id="safety" />
                        <NavItem icon={BookOpen} label="Content" id="courses" />
                    </div>
                </div>
                <div className="p-3 space-y-1 mb-4">
                    <NavItem icon={Settings} label="Settings" id="settings" />
                    <button
                        className={`w-full flex items-center gap-4 py-3 text-[#F2AEBB] hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium pl-[18px]`}
                        onClick={() => {
                            import("../../utils/auth").then(({ clearSession }) => {
                                clearSession();
                                window.location.reload();
                            });
                        }}
                    >
                        <LogOut size={20} className="min-w-[20px]" />
                        <span
                            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
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
