import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { getSession, setSession, getAccessToken } from "../../utils/auth";
import { useState, useEffect } from "react";
import type { User } from "../../types";
import { primaryRoleDisplayName, canAccessRoute, canAccessRouteByPermission, pathToRouteId, isViewOnlyAdmin } from "../../constants/roles";
import { getData } from "../../api/client";
import { ADMIN_API } from "../../api/client";

export type AuthContextType = {
  user: User;
};

export const ProtectedLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserFromSession = () => {
    const sessionUser = getSession();
    if (sessionUser) setUser(sessionUser);
  };

  useEffect(() => {
    const sessionUser = getSession();
    if (sessionUser) {
      const hasRoles = sessionUser.roles && sessionUser.roles.length > 0;
      if (getAccessToken() && !hasRoles) {
        getData<{
          id: string;
          email: string;
          fullName: string | null;
          adminType?: "company" | "franchise";
          state?: string | null;
          district?: string | null;
          zone?: string | null;
          locality?: string | null;
          roles?: { code: string; name?: string }[];
          permissions?: string[];
        }>(`${ADMIN_API}/auth/me`)
          .then((admin) => {
            const roleCodes = admin.roles?.map((r) => r.code) ?? [];
            const updated: User = {
              ...sessionUser,
              id: admin.id,
              name: admin.fullName ?? admin.email,
              role: primaryRoleDisplayName(roleCodes),
              regionId: admin.state ?? sessionUser.regionId,
              roles: admin.roles,
              permissions: admin.permissions,
              adminType: admin.adminType,
              state: admin.state,
              district: admin.district,
              zone: admin.zone,
              locality: admin.locality,
            };
            setSession(updated);
            setUser(updated);
          })
          .catch(() => setUser(sessionUser))
          .finally(() => setIsLoading(false));
      } else {
        setUser(sessionUser);
        setIsLoading(false);
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const onProfileUpdated = () => refreshUserFromSession();
    window.addEventListener("admin-profile-updated", onProfileUpdated);
    return () => window.removeEventListener("admin-profile-updated", onProfileUpdated);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleCodes = user.roles?.map((r) => r.code) ?? [];
  const permissions = user.permissions ?? [];
  const routeId = pathToRouteId(location.pathname);
  const canAccessByRole = routeId === null || roleCodes.length === 0 || canAccessRoute(roleCodes, routeId);
  const canAccessByPermission = permissions.length === 0 || routeId === null || canAccessRouteByPermission(permissions, routeId);
  const canAccess = canAccessByRole && canAccessByPermission;
  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <TopHeader user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ user } satisfies AuthContextType} />
        </main>
      </div>
    </div>
  );
};
