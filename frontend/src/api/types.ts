/**
 * Types matching backend API responses. Do not invent fields — only what backend returns.
 */

/** Allocation list item from GET /api/v1/admin/allocations (enriched) */
export interface AllocationApiRow {
  id: string;
  studentId: string;
  trainerId: string | null;
  courseId: string | null;
  requestedBy: string;
  requestedAt: string;
  status: string;
  allocatedBy: string | null;
  allocatedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; fullName: string | null; avatarUrl?: string | null } | null;
  trainer?: { id: string; fullName: string | null; avatarUrl?: string | null } | null;
  course?: { id: string; title: string | null } | null;
  classType?: string;
  scheduleType?: string | null;
  sessionCount?: number | null;
}

/** Reschedule row from GET /api/v1/admin/reschedule */
export interface RescheduleApiRow {
  id: string;
  sessionId: string;
  allocationId: string;
  studentId: string;
  trainerId: string;
  requestedBy: string;
  requestType: "student" | "trainer";
  originalDate: string;
  originalTime: string;
  newDate: string;
  newTime: string;
  reason: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** Student list item from GET /api/v1/students (student-service) */
export interface StudentApiRow {
  studentId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  progressCount: string;
  pendingReschedules: string;
}

/** Trainer list item from GET /api/v1/trainers (trainer-service) */
export interface TrainerApiRow {
  trainerId: string;
  fullName: string | null;
  bio: string | null;
  specialties: string[] | null;
  ratingAverage: number | null;
  totalReviews: number | null;
  verified: boolean;
  yearsOfExperience: number | null;
  hourlyRate: number | null;
  activeStudents: number;
  completedSessions: number;
  city: string | null;
  state: string | null;
  country: string | null;
  available: boolean;
}

/** Trainer approval list item from GET /api/v1/admin/trainers/approvals */
export interface TrainerApprovalApiRow {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  approvalStatus: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: { fullName: string | null; avatarUrl?: string | null } | null;
}

/** Trainer approval detail from GET /api/v1/admin/trainers/approvals/:trainerId (full application as entered) */
export interface TrainerApprovalDetailApi {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  approvalStatus: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: { fullName: string | null; avatarUrl?: string | null; expertise?: string | null; experienceYears?: number | null; extra?: Record<string, unknown> } | null;
  application?: {
    id?: string;
    applicationStage?: string;
    education?: string | null;
    applicationGender?: string;
    addressText?: string | null;
    pincode?: string | null;
    dateOfBirth?: string | null;
    preferredCity?: string | null;
    cityId?: string | null;
    zoneId?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    reviewStatus?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: string | null;
    reviewNotes?: string | null;
    consentInfoCorrect?: boolean | null;
    consentBackgroundVerification?: boolean | null;
    consentTravelToStudents?: boolean | null;
    submittedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    [key: string]: unknown;
  } | null;
  documents?: Array<{
    documentType?: string;
    fileUrl?: string | null;
    fileName?: string | null;
    verificationStatus?: string | null;
    [key: string]: unknown;
  }>;
  availability?: Array<{ slotStart?: string; slotEnd?: string; employmentType?: string; [key: string]: unknown }>;
  courses?: Array<{
    courseName?: string | null;
    courseCode?: string | null;
    courseDescription?: string | null;
    preferenceOrder?: number;
    courseCategory?: string | null;
    [key: string]: unknown;
  }>;
  skills?: Array<{ skillName?: string | null; skillCategory?: string | null; [key: string]: unknown }>;
  addresses?: Array<{
    id?: string;
    addressText?: string | null;
    pincode?: string | null;
    district?: string | null;
    state?: string | null;
    country?: string | null;
    cityId?: string | null;
    isPrimary?: boolean | null;
    isVerified?: boolean | null;
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    verificationNotes?: string | null;
    [key: string]: unknown;
  }>;
  baseLocations?: Array<{
    id?: string;
    latitude?: number | null;
    longitude?: number | null;
    source?: string | null;
    confidenceScore?: number | null;
    geocodedAt?: string | null;
    geocodedBy?: string | null;
    addressId?: string | null;
    [key: string]: unknown;
  }>;
}

/** Safety incident from GET /api/v1/admin/safety/incidents/all */
export interface SafetyIncidentApiRow {
  id: string;
  userId: string;
  userRole: string;
  type: string;
  description: string;
  location: { latitude: number; longitude: number; address?: string };
  severity: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Demand analytics (course or all courses) */
export interface DemandAnalyticsApi {
  courseId?: string;
  waitlistCount?: number;
  purchaseBlockedCount?: number;
  byCity?: Array<{ cityId: string; count: number }>;
  courses?: Array<{ courseId: string; waitlistCount: number; purchaseBlockedCount: number }>;
}
