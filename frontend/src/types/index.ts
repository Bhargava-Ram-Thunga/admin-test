import type { LucideIcon } from "lucide-react";

export interface User {
  email: string;
  name: string;
  role: string;
  regionId: string;
  avatarUrl: string;
  password?: string;
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
