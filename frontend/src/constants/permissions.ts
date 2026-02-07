/**
 * Backend permission codes. Source of truth: kc-backend/services/admin-service/constants/permissions.ts
 * UI MUST use permissions, not roles: if (permissions.includes('tutor:approve')) show Approve button.
 */

/** Trainer application: approve/reject (Trainer Applications screen) */
export const TRAINER_APPROVE = "tutor:approve";
export const TRAINER_REJECT = "tutor:reject";

/** Allocation: create, approve, reject, update (reallocate), cancel */
export const ALLOCATION_CREATE = "tutor:assign"; // or allocation create
export const ALLOCATION_REALLOCATE = "tutor:assign";
export const ALLOCATION_APPROVE_REJECT = "tutor:assign";

/** Session reschedule: approve/reject reschedule requests */
export const SESSION_RESCHEDULE = "operations:approve_schedules";
/** Create sessions for allocation (allocation detail) */
export const MANAGE_CLASSES = "operations:manage_classes";

/** Safety: view / manage incidents */
export const SAFETY_VIEW = "safety:view_all_sos";
/** Safety: update incident status (Acknowledge / Resolve) — backend requires this for PUT */
export const SAFETY_HANDLE_COMPLAINTS = "operations:handle_complaints";

/** Finance: view financial data */
export const FINANCE_VIEW = "finance:view_financial_data";

/** Block / unblock trainer (admin panel) */
export const BLOCK_TUTOR = "tutor:block";
/** Block / unblock student (admin panel) */
export const BLOCK_STUDENT = "student:block";

export type UserLike = {
  permissions?: string[];
  role?: string | null;
  roles?: { code?: string | null }[] | null;
};

const SUPER_ADMIN_CODE = "super_admin";

const isSuperAdmin = (user: UserLike | null | undefined): boolean => {
  if (!user) return false;
  if (typeof user.role === "string" && user.role.toLowerCase().includes("super admin")) {
    return true;
  }
  if (Array.isArray(user.roles)) {
    return user.roles.some(
      (r) => typeof r?.code === "string" && r.code.toLowerCase() === SUPER_ADMIN_CODE
    );
  }
  return false;
};

/**
 * Check if user has a permission. Use this for all action buttons and route visibility.
 * NO role checks: if (hasPermission(user, TRAINER_APPROVE)) show Approve.
 */
export function hasPermission(user: UserLike | null | undefined, code: string): boolean {
  if (isSuperAdmin(user)) return true;
  const perms = user?.permissions;
  if (!perms || !Array.isArray(perms)) return false;
  return perms.includes(code);
}

/**
 * Check if user has any of the given permissions.
 */
export function hasAnyPermission(user: UserLike | null | undefined, codes: string[]): boolean {
  if (isSuperAdmin(user)) return true;
  return codes.some((code) => hasPermission(user, code));
}
