import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { getSession } from "../../utils/auth";
import { useState, useEffect } from "react";
import type { User } from "../../types";

export type AuthContextType = {
  user: User;
};

export const ProtectedLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUser = getSession();
    setUser(sessionUser);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#393D7E]">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-sans text-slate-800">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 lg:ml-20">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#393D7E]">
              Welcome, {user.name}
            </h2>
            <p className="text-[#5459AC] text-sm">{user.role}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-[#393D7E] text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <img
              src={`https://i.pravatar.cc/150?u=${user.email}`}
              className="w-10 h-10 rounded-xl border-2 border-[#393D7E]"
              alt="Profile"
            />
          </div>
        </header>
        <Outlet context={{ user } satisfies AuthContextType} />
      </main>
    </div>
  );
};
