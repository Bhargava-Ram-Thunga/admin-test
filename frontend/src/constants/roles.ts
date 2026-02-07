/**
 * Backend-aligned admin roles and nav visibility.
 * Source of truth: kc-backend/services/admin-service (DEFAULT_ROLES, ROLE_PERMISSIONS).
 * Backend has 8 roles: super_admin → state_admin → (city_manager, trainer_onboarding, academic, support, finance, view_only).
 */

export const BACKEND_ROLE_CODES = [
  "super_admin",
  "state_admin",
  "city_manager_admin",
  "trainer_onboarding_admin",
  "academic_admin",
  "support_admin",
  "finance_admin",
  "view_only_admin",
] as const;

export type BackendRoleCode = (typeof BACKEND_ROLE_CODES)[number];

/** Display names for backend role codes (strict 8-role hierarchy). */
export const ROLE_DISPLAY_NAMES: Record<BackendRoleCode, string> = {
  super_admin: "Super Admin",
  state_admin: "State Admin",
  city_manager_admin: "City Manager Admin",
  trainer_onboarding_admin: "Trainer Onboarding Admin",
  academic_admin: "Academic Admin",
  support_admin: "Support Admin",
  finance_admin: "Finance Admin",
  view_only_admin: "View Only Admin",
};

/** Route ids used in sidebar (must match path segments). */
export const ROUTE_IDS = [
  "dashboard",
  "students",
  "trainers",
  "analytics",
  "regions",
  "allocations",
  "sessions",
  "finance",
  "safety",
  "courses",
  "audit",
  "settings",
] as const;

export type RouteId = (typeof ROUTE_IDS)[number];

/**
 * Which route ids each backend role can see in the sidebar.
 * Aligned with backend ROLE_PERMISSIONS (view/manage per category).
 */
export const ROLE_ROUTE_ACCESS: Record<BackendRoleCode, readonly RouteId[]> = {
  super_admin: [
    "dashboard",
    "students",
    "trainers",
    "analytics",
    "regions",
    "allocations",
    "sessions",
    "finance",
    "safety",
    "courses",
    "settings",
  ],
  state_admin: [
    "dashboard",
    "students",
    "trainers",
    "analytics",
    "regions",
    "allocations",
    "sessions",
    "finance",
    "safety",
    "courses",
    "settings",
  ],
  city_manager_admin: [
    "dashboard",
    "students",
    "trainers",
    "analytics",
    "regions",
    "allocations",
    "sessions",
    "finance",
    "safety",
    "courses",
    "settings",
  ],
  trainer_onboarding_admin: ["dashboard", "trainers", "settings"],
  academic_admin: ["dashboard", "students", "analytics", "courses", "settings"],
  support_admin: ["dashboard", "sessions", "safety", "settings"],
  finance_admin: ["dashboard", "finance", "analytics", "settings"],
  view_only_admin: [
    "dashboard",
    "students",
    "trainers",
    "analytics",
    "regions",
    "allocations",
    "sessions",
    "finance",
    "safety",
    "courses",
    "settings",
  ],
};

/**
 * Returns true if the user (with backend role codes) can see the given route.
 */
export function canAccessRoute(
  roleCodes: string[],
  routeId: RouteId
): boolean {
  if (roleCodes.length === 0) return false;
  const allowed = new Set<RouteId>();
  for (const code of roleCodes) {
    const list = ROLE_ROUTE_ACCESS[code as BackendRoleCode];
    if (list) list.forEach((id) => allowed.add(id));
  }
  return allowed.has(routeId);
}

/**
 * Primary role display name from role codes (highest privilege first in hierarchy).
 */
export function primaryRoleDisplayName(roleCodes: string[]): string {
  for (const code of BACKEND_ROLE_CODES) {
    if (roleCodes.includes(code)) return ROLE_DISPLAY_NAMES[code];
  }
  return roleCodes[0] ?? "Admin";
}

/** True if the user has only view-only (or view_only among roles). Used to hide create/edit/delete. */
export function isViewOnlyAdmin(roleCodes: string[]): boolean {
  if (roleCodes.length === 0) return false;
  return roleCodes.every((c) => c === "view_only_admin");
}

/** True if the user has the given role (among possibly multiple). */
export function hasRole(roleCodes: string[], code: BackendRoleCode): boolean {
  return roleCodes.includes(code);
}

/** Map pathname (e.g. /allocations) to route id for canAccessRoute. */
export function pathToRouteId(pathname: string): RouteId | null {
  const segment = pathname.replace(/^\//, "").split("/")[0] || "dashboard";
  if (ROUTE_IDS.includes(segment as RouteId)) return segment as RouteId;
  return null;
}

/**
 * Minimum permission required to see a route (any one of these).
 * When user.permissions exists, sidebar uses this; else falls back to role-based ROLE_ROUTE_ACCESS.
 */
export const ROUTE_PERMISSIONS: Partial<Record<RouteId, string[]>> = {
  dashboard: [],
  students: ["student:manage", "student:view"],
  trainers: ["tutor:manage", "tutor:approve"],
  analytics: ["analytics:view_total_students", "analytics:view_total_tutors", "finance:view_platform_analytics"],
  // Empty = no specific permission required (role-based access still applies when permissions missing)
  regions: [],
  allocations: ["tutor:assign", "student:assign_tutor"],
  sessions: ["operations:approve_schedules", "operations:manage_classes"],
  finance: ["finance:view_financial_data", "finance:view_revenue"],
  safety: ["safety:view_all_sos", "safety:view_sos"],
  courses: ["content:view"],
  audit: ["audit:view_audit_trail"],
  settings: [],
};

/**
 * Permission-driven route access: show route if user has any of the required permissions for that route.
 * If permissions array is empty/undefined, returns false (caller should fall back to canAccessRoute by role).
 */
export function canAccessRouteByPermission(permissions: string[] | undefined, routeId: RouteId): boolean {
  if (!permissions?.length) return false;
  const required = ROUTE_PERMISSIONS[routeId];
  if (!required || required.length === 0) return true; // dashboard, settings
  return required.some((p) => permissions.includes(p));
}
