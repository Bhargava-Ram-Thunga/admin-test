import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { getSession } from "../../utils/auth";
import { useState, useEffect } from "react";
import type { User } from "../../types";
import { Search, Menu } from "lucide-react"; // Added Menu icon

export type AuthContextType = {
  user: User;
  isSidebarExpanded: boolean;
};

export const ProtectedLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sidebar State: lifted up to manage content margins
  // Default to false (80px) as per requirements
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    const sessionUser = getSession();
    setUser(sessionUser);
    setIsLoading(false);

    // Initial check for screen size to set default state
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsSidebarExpanded(false); // Default collapsed on Tablet/Mobile
      }
    };

    // Run once on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#6D5DFB]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] font-sans text-[var(--text-body)]">
      <Sidebar
        user={user}
        isExpanded={isSidebarExpanded}
        toggleExpanded={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      {/* Main Content with Dynamic Margin */}
      <main
        className={`flex-1 overflow-y-auto w-full transition-all duration-300 ease-in-out`}
        style={{
          marginLeft: isSidebarExpanded
            ? (window.innerWidth >= 768 ? '260px' : '0px')
            : (window.innerWidth >= 768 ? '80px' : '0px')
        }}
      >
        {/* Global Header */}
        <header className="sticky top-0 z-30 bg-[var(--app-bg)] px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Mobile Sidebar Toggle */}
          <button
            className="md:hidden p-2 text-[var(--text-muted)] hover:bg-gray-100 rounded-lg absolute left-4 top-4 z-40"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          >
            <Menu size={24} />
          </button>

          {/* Left: Search (Hidden on mobile usually, but kept for consistency) */}
          <div className="hidden md:block w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white border border-transparent focus:border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 shadow-sm"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-[var(--text-main)] text-xs mb-0.5">{user.name}</p>
                <p className="text-[var(--text-muted)] text-[10px]">{user.role}</p>
              </div>
              <div className="relative">
                <img
                  src={`https://i.pravatar.cc/150?u=${user.email}`}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  alt="Profile"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-6 pb-6">
          <Outlet context={{ user, isSidebarExpanded } satisfies AuthContextType} />
        </div>
      </main>
    </div>
  );
};
