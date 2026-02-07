import type { LucideIcon } from "lucide-react";

/** Backend admin role (from login/me). */
export type AdminRole = { code: string; name?: string };

export interface User {
  id?: string; // Admin ID from backend (for API calls that require requestedBy, etc.)
  email: string;
  name: string;
  role: string; // Display label (e.g. "Super Admin")
  regionId: string;
  avatarUrl: string;
  password?: string;
  // Backend-aligned fields (from admin-service login/me)
  roles?: AdminRole[];
  /** Permission codes from backend (e.g. tutor:approve). Drive UI actions from this, not role. */
  permissions?: string[];
  adminType?: "company" | "franchise";
  state?: string | null;
  district?: string | null;
  zone?: string | null;
  locality?: string | null;
}

export interface Student {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  course: string;
  status: "Active" | "Completed" | "Dropped" | string;
  paymentStatus: "Paid" | "Pending" | "Overdue" | string;
  amount: string;
  enrollmentDate: string;
  avatarUrl: string;
  mentorId: string | null;
  mentorName: string | null;
  email?: string;
}

export interface Trainer {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  status: "Active" | "Pending" | string;
  students: number;
  capacity: number;
  rating: number;
  avatarUrl: string;
  lastLocation?: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  children: HierarchyNode[];
}

export interface SOSAlert {
  id: string;
  type: string;
  severity: "Critical" | "High" | string;
  location: string;
  regionId: string;
  time: string;
  status: string;
}

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "warning" | "error" | "neutral" | string;
}

export interface ChartConfig {
  id: number;
  title: string;
  type: "bar" | "line" | "area" | "pie" | "donut";
  xAxisMode: "time" | "region";
  timeGranularity?: "daily" | "weekly" | "monthly" | "yearly";
  regionType?: string;
  metric: "students" | "revenue" | "teachers" | "attendance" | "growth";
  color: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}


export interface SidebarNavItem {
  icon: LucideIcon;
  label: string;
  id: string;
}

export type AllocationStatus = "Pending" | "Approved" | "Rejected" | "Active" | "Completed" | "Cancelled";

export interface Allocation {
  id: string;
  studentId: string;
  studentName: string;
  trainerId: string | null;
  trainerName: string | null;
  courseId: string;
  courseName: string;
  status: AllocationStatus;
  requestedDate: string;
  allocatedDate?: string;
  allocatedBy?: string;
  sessionCount: number;
  scheduleMode: "WEEKDAY_DAILY" | "SUNDAY_ONLY";
  timeSlot: string;
  startDate: string;
  notes?: string;
  /** When status is Rejected or auto-assign failed (from backend rejectionReason / notes). */
  failureReason?: string;
}

export type SessionStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Disputed";
export type VerificationStatus = "Passed" | "Failed" | "Pending";

export interface Session {
  id: string;
  allocationId: string;
  studentId: string;
  studentName: string;
  trainerId: string;
  trainerName: string;
  courseName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // minutes
  status: SessionStatus;
  gpsStatus: VerificationStatus;
  faceStatus: VerificationStatus;
  actualDuration?: number;
  actualStartTime?: string;
  actualEndTime?: string;
}

export type RescheduleStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface RescheduleRequest {
  id: string;
  sessionId: string;
  /** Backend only returns IDs for reschedule list. */
  studentId: string;
  trainerId: string;
  courseName: string;
  originalDate: string;
  originalTime: string;
  newDate: string;
  newTime: string;
  requestedBy: "Student" | "Trainer";
  reason: string;
  status: RescheduleStatus;
  requestedAt: string;
}

export interface AutoAssignment {
  id: string;
  studentName: string;
  courseName: string;
  assignedTrainer: string;
  assignmentDate: string;
  status: "Success" | "Failed" | "Pending";
  method: "Auto" | "Manual";
  retryCount: number;
  criteria?: {
    proximity: number;
    specialtyMatch: boolean;
  };
}
