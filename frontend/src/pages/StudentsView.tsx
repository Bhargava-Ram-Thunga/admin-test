import { useState, useMemo, useEffect, useCallback } from "react";
import { UserCheck, Search, Plus, X, Edit2, Trash2, RefreshCw, Ban, ShieldCheck } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { checkPermission, getMaxCapacityFromRating } from "../utils/helpers";
import { Save } from "lucide-react";
import type { Student, Trainer, User } from "../types";
import { getData, postData, putData, ADMIN_API } from "../api/client";
import type { AllocationApiRow, StudentApiRow, TrainerApiRow } from "../api/types";

/** Payment record from GET /api/v1/payments/student/:studentId (payment-service). */
interface PaymentRecord {
  id?: string;
  studentId?: string;
  amountCents?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}
import { isViewOnlyAdmin } from "../constants/roles";
import { hasPermission, BLOCK_STUDENT } from "../constants/permissions";

function mapTrainerRow(row: TrainerApiRow): Trainer {
  return {
    id: row.trainerId,
    name: row.fullName ?? row.trainerId,
    regionId: row.state ?? "",
    regionName: row.city ?? row.state ?? "",
    status: row.verified ? "Active" : "Pending",
    students: row.activeStudents ?? 0,
    capacity: getMaxCapacityFromRating(row.ratingAverage),
    rating: row.ratingAverage ?? 0,
    avatarUrl: `https://i.pravatar.cc/150?u=${row.trainerId}`,
  };
}

interface StudentEnrichment {
  trainerId: string;
  trainerName: string;
  courseName: string;
  hasAllocation: boolean;
}

function mapStudentRow(row: StudentApiRow, enrichment?: StudentEnrichment | null): Student {
  return {
    id: row.studentId,
    name: row.fullName ?? row.studentId,
    email: row.email ?? "",
    regionId: "",
    regionName: "",
    course: enrichment?.courseName ?? "",
    status: "Active",
    paymentStatus: enrichment?.hasAllocation ? "Paid" : "Pending",
    amount: "",
    enrollmentDate: row.createdAt?.slice(0, 10) ?? "",
    avatarUrl: row.avatarUrl ?? `https://i.pravatar.cc/150?u=${row.studentId}`,
    mentorId: enrichment?.trainerId ?? null,
    mentorName: enrichment?.trainerName ?? null,
  };
}

interface StudentsViewProps {
  user: User;
  addToast: (
    message: string,
    type?: "success" | "warning" | "error" | "neutral"
  ) => void;
}

export const StudentsView = ({
  user,
  addToast,
}: StudentsViewProps) => {
  const roleCodes = user.roles?.map((r) => r.code) ?? [];
  const viewOnly = isViewOnlyAdmin(roleCodes);
  const [students, setStudentsLocal] = useState<Student[]>([]);
  const [trainers, setTrainersLocal] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("All");
  const [blockedStudentIds, setBlockedStudentIds] = useState<Set<string>>(new Set());
  const [blockActionId, setBlockActionId] = useState<string | null>(null);

  const fetchBlockedStudentIds = useCallback(async () => {
    const res = await getData<{ entityIds: string[] }>(`${ADMIN_API}/blocked-ids?entityType=student`).catch(() => ({ entityIds: [] }));
    setBlockedStudentIds(new Set(res?.entityIds ?? []));
  }, []);

  const fetchTrainers = useCallback(async () => {
    const res = await getData<{ data: TrainerApiRow[]; total: number }>("/api/v1/trainers?limit=200").catch(() => ({ data: [], total: 0 }));
    setTrainersLocal(Array.isArray(res?.data) ? res.data.map(mapTrainerRow) : []);
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("limit", "500");
    if (searchTerm) params.set("search", searchTerm);
    const q = params.toString();
    const path = `/api/v1/students${q ? `?${q}` : ""}`;
    const [studentsRes, allocationsRes] = await Promise.all([
      getData<{ data: StudentApiRow[]; total: number; page: number; limit: number }>(path).catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load students");
        return { data: [], total: 0, page: 1, limit: 100 };
      }),
      getData<AllocationApiRow[]>(`${ADMIN_API}/allocations?limit=500`).catch(() => [] as AllocationApiRow[]),
    ]);
    const rows = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
    const allocations = Array.isArray(allocationsRes) ? allocationsRes : [];
    const enrichmentByStudent = new Map<
      string,
      { trainerId: string; trainerName: string; courseName: string; hasAllocation: boolean }
    >();
    for (const a of allocations) {
      if ((a.status === "approved" || a.status === "active") && a.studentId && a.trainerId) {
        if (!enrichmentByStudent.has(a.studentId)) {
          const courseName = a.course?.title ?? a.courseId ?? "—";
          enrichmentByStudent.set(a.studentId, {
            trainerId: a.trainerId,
            trainerName: a.trainer?.fullName ?? "—",
            courseName,
            hasAllocation: true,
          });
        }
      }
    }
    setStudentsLocal(
      rows.map((row) => {
        const enrichment = enrichmentByStudent.get(row.studentId);
        return mapStudentRow(row, enrichment ?? null);
      })
    );
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);
  useEffect(() => {
    fetchBlockedStudentIds();
  }, [fetchBlockedStudentIds]);

  const canBlock = hasPermission(user, BLOCK_STUDENT);
  const handleBlockStudent = async (studentId: string) => {
    if (!canBlock) return;
    setBlockActionId(studentId);
    try {
      await postData(`${ADMIN_API}/students/${studentId}/block`, { reason: "Blocked by admin" });
      addToast("Student blocked.", "warning");
      await fetchBlockedStudentIds();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Block failed", "error");
    } finally {
      setBlockActionId(null);
    }
  };
  const handleUnblockStudent = async (studentId: string) => {
    if (!canBlock) return;
    setBlockActionId(studentId);
    try {
      await postData(`${ADMIN_API}/students/${studentId}/unblock`, {});
      addToast("Student unblocked.", "success");
      await fetchBlockedStudentIds();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Unblock failed", "error");
    } finally {
      setBlockActionId(null);
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] =
    useState<Student | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState("");

  const [formData, setFormData] = useState<Partial<Student>>({
    name: "",
    course: "",
    regionName: "",
    status: "Active",
    amount: "",
    paymentStatus: "Pending",
    email: "",
    mentorId: null,
    mentorName: null,
  });
  const [profileExtra, setProfileExtra] = useState<Record<string, unknown> | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    let result = students.filter((s) => !user.regionId || user.regionId === "ALL" || checkPermission(user, s.regionId));
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.course && s.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (assignmentFilter === "Assigned") result = result.filter((s) => s.mentorId);
    else if (assignmentFilter === "Unassigned") result = result.filter((s) => !s.mentorId);
    return result;
  }, [students, user, searchTerm, assignmentFilter]);

  // --- CRUD HANDLERS (Existing) ---
  const handleOpenModal = (student: Student | null = null) => {
    setProfileExtra(null);
    if (student) {
      setEditingStudent(student);
      setFormData({ ...student, amount: student.amount || "" });
      setIsModalOpen(true);
      setFeeLoading(true);
      Promise.all([
        getData<PaymentRecord[]>(`/api/v1/payments/student/${student.id}`).catch(() => []),
        getData<{ extra?: Record<string, unknown>; address?: string | null }>(
          `/api/v1/students/${student.id}/profile`
        ).catch(() => null),
      ])
        .then(([payments, profile]) => {
          const list = Array.isArray(payments) ? payments : [];
          const succeededTotal = list
            .filter((p) => p.status === "succeeded")
            .reduce((sum, p) => sum + (Number(p.amountCents) || 0), 0);
          const amountFromPayments = succeededTotal > 0 ? String(Math.round(succeededTotal / 100)) : "";
          const amountFromProfile =
            profile?.extra && typeof profile.extra.feeAmountPaid === "number"
              ? String(profile.extra.feeAmountPaid)
              : profile?.extra && typeof profile.extra.feeAmountPaid === "string"
                ? profile.extra.feeAmountPaid
                : "";
          setFormData((prev) => ({
            ...prev,
            amount: amountFromPayments || amountFromProfile || "",
            regionName: prev?.regionName || profile?.address || "",
          }));
          setProfileExtra(profile?.extra ?? null);
        })
        .catch(() => {})
        .finally(() => setFeeLoading(false));
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        course: "Python Basics",
        regionName: "Hyderabad",
        status: "Active",
        amount: "",
        paymentStatus: "Pending",
        email: "",
        mentorId: null,
        mentorName: null,
      });
      setIsModalOpen(true);
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setSaving(true);
      try {
        const feeNum = formData.amount?.trim() ? Number(formData.amount.trim()) : null;
        const hasValidFee = feeNum != null && !Number.isNaN(feeNum);
        const extra = {
          ...(typeof profileExtra === "object" && profileExtra !== null ? profileExtra : {}),
          feeAmountPaid: hasValidFee ? feeNum : null,
        };
        await putData(`/api/v1/students/${editingStudent.id}/profile`, {
          fullName: formData.name?.trim() || null,
          address: formData.regionName?.trim() || null,
          extra,
        });
        setStudentsLocal((prev) =>
          prev.map((s) =>
            s.id === editingStudent.id ? ({ ...s, ...formData } as Student) : s
          )
        );
        addToast("Student profile updated successfully", "success");
        setIsModalOpen(false);
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Failed to update profile", "error");
      } finally {
        setSaving(false);
      }
    } else {
      addToast("No backend API for creating students. Use student app or backend admin.", "neutral");
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm("Are you sure you want to remove this student from the list? (No backend delete API)")
    ) {
      setStudentsLocal((prev) => prev.filter((s) => s.id !== id));
      addToast("Student removed from list", "warning");
    }
  };

  // --- ASSIGNMENT LOGIC (New) ---

  const handleOpenAssignModal = (student: Student) => {
    setSelectedStudentForAssignment(student);
    setSelectedMentorId(""); // Reset selection
    setIsAssignModalOpen(true);
  };

  const handleAssignMentor = () => {
    if (!selectedMentorId || !selectedStudentForAssignment) return;
    const mentor = trainers.find((t) => t.id === selectedMentorId);
    if (!mentor) return;
    setStudentsLocal((prev) =>
      prev.map((s) =>
        s.id === selectedStudentForAssignment.id
          ? { ...s, mentorId: mentor.id, mentorName: mentor.name }
          : s
      )
    );
    setTrainersLocal((prev) =>
      prev.map((t) =>
        t.id === mentor.id ? { ...t, students: t.students + 1 } : t
      )
    );
    addToast(`Assigned ${selectedStudentForAssignment.name} to ${mentor.name}`, "success");
    setIsAssignModalOpen(false);
  };

  const handleUnassignMentor = (student: Student) => {
    if (!student.mentorId) return;
    setStudentsLocal((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, mentorId: null, mentorName: null } : s
      )
    );
    setTrainersLocal((prev) =>
      prev.map((t) =>
        t.id === student.mentorId
          ? { ...t, students: Math.max(0, t.students - 1) }
          : t
      )
    );
    addToast(`Unassigned mentor from ${student.name}`, "neutral");
  };

  // Filter available mentors for the dropdown
  const availableMentors = useMemo(() => {
    return trainers.filter((t) => {
      // Must be in scope
      const inScope = checkPermission(user, t.regionId);
      // Must have capacity (assuming logic: current students < capacity)
      // Note: In a real app, calculate 'students' from the actual student list length
      const hasCapacity = t.students < (t.capacity || 4);
      return inScope && hasCapacity && t.status === "Active";
    });
  }, [trainers, user]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchStudents()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4D2B8C]">
            Students Directory
          </h1>
          <p className="text-sm text-[#4D2B8C]">
            Manage enrollments and mentor assignments
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => fetchStudents()}
            className="flex items-center gap-2 px-3 py-2 border border-[#4D2B8C]/20 rounded-xl text-[#4D2B8C] hover:bg-[#4D2B8C]/5"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="bg-white px-3 py-2 rounded-xl border border-[#4D2B8C]/10 flex items-center gap-2 text-[#4D2B8C] shadow-sm">
            <UserCheck size={16} />
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-[#4D2B8C] cursor-pointer"
            >
              <option value="All">All Students</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-[#4D2B8C]/10 flex items-center gap-2 text-[#4D2B8C] shadow-sm flex-1 sm:flex-none">
            <Search size={16} />
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
              className="bg-transparent outline-none text-sm w-full sm:w-32 text-[#4D2B8C] placeholder-[#4D2B8C]/50"
            />
          </div>
          {!viewOnly && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-[#4D2B8C] text-white p-2 px-4 rounded-xl hover:bg-[#F39EB6] transition shadow-lg shadow-[#4D2B8C]/20 font-bold text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Student (local)</span>
            </button>
          )}
        </div>
      </div>
      {loading && students.length === 0 && (
        <div className="flex items-center justify-center min-h-[120px] text-[#4D2B8C]">
          <RefreshCw size={24} className="animate-spin" /> Loading students…
        </div>
      )}

      {/* --- ASSIGN MENTOR MODAL --- */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Mentor"
      >
        <div className="space-y-6">
          <div className="bg-[#F5F7FA] p-4 rounded-xl border border-[#4D2B8C]/5">
            <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-1">
              Student
            </p>
            <div className="flex items-center gap-3">
              <img
                src={selectedStudentForAssignment?.avatarUrl}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-bold text-[#4D2B8C]">
                  {selectedStudentForAssignment?.name}
                </p>
                <p className="text-xs text-[#4D2B8C]">
                  {selectedStudentForAssignment?.course}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-2">
              Select Mentor
            </label>
            <div className="relative">
              <UserCheck
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D2B8C]"
              />
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full pl-10 p-3 bg-white border border-[#4D2B8C]/10 rounded-xl outline-none font-bold text-[#4D2B8C] appearance-none"
              >
                <option value="" disabled>
                  Choose a mentor...
                </option>
                {availableMentors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} • {t.students}/{t.capacity} Students
                  </option>
                ))}
              </select>
              {availableMentors.length === 0 && (
                <p className="text-xs text-red-400 mt-2 font-bold">
                  No available mentors in this region with capacity.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleAssignMentor}
            disabled={!selectedMentorId}
            className="w-full bg-[#4D2B8C] text-white py-3 rounded-xl font-bold hover:bg-[#F39EB6] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Assignment
          </button>
        </div>
      </Modal>

      {/* --- EDIT STUDENT MODAL (Existing) --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Edit Student" : "New Enrollment"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-1">
              Student Name
            </label>
            <input
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C] focus:ring-2 focus:ring-[#F39EB6]/20 transition"
              placeholder="Enter full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-1">
                Course
              </label>
              <div className="w-full p-3 bg-[#F5F7FA]/60 rounded-xl font-bold text-[#4D2B8C] border border-[#4D2B8C]/10">
                {formData.course || "—"}
              </div>
              <p className="text-[10px] text-[#4D2B8C]/60 mt-0.5">From allocation</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-1">
                Region / Address
              </label>
              <input
                value={formData.regionName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, regionName: e.target.value })
                }
                className="w-full p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C] focus:ring-2 focus:ring-[#F39EB6]/20"
                placeholder="Saved to profile"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-1">
                Status
              </label>
              <select
                value={formData.status || "Active"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C]"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>
              <p className="text-[10px] text-[#4D2B8C]/60 mt-0.5">Local only</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-1">
                Payment
              </label>
              <div className="w-full p-3 bg-[#F5F7FA]/60 rounded-xl font-bold text-[#4D2B8C] border border-[#4D2B8C]/10">
                {formData.paymentStatus || "Pending"}
              </div>
              <p className="text-[10px] text-[#4D2B8C]/60 mt-0.5">From allocation</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#4D2B8C] uppercase mb-1">
              Fee Amount (₹)
            </label>
            {feeLoading ? (
              <div className="w-full p-3 bg-[#F5F7FA]/60 rounded-xl font-bold text-[#4D2B8C]/70 border border-[#4D2B8C]/10">
                Loading…
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                value={formData.amount ?? ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#4D2B8C] focus:ring-2 focus:ring-[#F39EB6]/20 border border-[#4D2B8C]/10"
                placeholder="—"
              />
            )}
            <p className="text-[10px] text-[#4D2B8C]/60 mt-0.5">From purchase record; editable and saved to profile if missing</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#4D2B8C] text-white py-3 rounded-xl font-bold hover:bg-[#F39EB6] transition shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Save Record
          </button>
        </form>
      </Modal>

      {/* Table */}
      <Card className="p-0 overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#4D2B8C]">
              <tr className="text-left text-xs font-bold text-white uppercase tracking-wider">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Region</th>
                <th className="p-4">Course</th>
                <th className="p-4">Mentor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F7FA]">
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#F5F7FA] transition-colors group"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatarUrl}
                        className="w-10 h-10 rounded-xl bg-gray-200"
                        alt={s.name}
                      />
                      <div>
                        <p className="font-bold text-[#4D2B8C] text-sm">
                          {s.name}
                        </p>
                        <p className="text-xs text-[#4D2B8C]">
                          {s.enrollmentDate}
                        </p>
                        {blockedStudentIds.has(s.id) && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            <Ban size={12} /> Blocked
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-[#4D2B8C]">
                    {s.regionName}
                  </td>
                  <td className="p-4 text-sm font-bold text-[#4D2B8C]">
                    {s.course}
                  </td>

                  {/* MENTOR COLUMN */}
                  <td className="p-4">
                    {s.mentorId ? (
                      <div className="flex items-center gap-2 group/mentor">
                        <span className="text-xs font-bold bg-[#4D2B8C]/10 text-[#4D2B8C] px-2 py-1 rounded-md">
                          {s.mentorName}
                        </span>
                        {!viewOnly && (
                          <button
                            onClick={() => handleUnassignMentor(s)}
                            className="opacity-0 group-hover/mentor:opacity-100 text-[#F39EB6] hover:text-red-500 transition-opacity"
                            title="Unassign Mentor"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      !viewOnly && (
                        <button
                          onClick={() => handleOpenAssignModal(s)}
                          className="text-xs font-bold bg-[#4D2B8C]/10 text-[#4D2B8C] px-3 py-1 rounded-full hover:bg-[#4D2B8C] hover:text-white transition flex items-center gap-1"
                        >
                          Assign <Plus size={12} />
                        </button>
                      )
                    )}
                  </td>

                  <td className="p-4">
                    <Badge
                      type={
                        s.status === "Active"
                          ? "success"
                          : s.status === "Dropped"
                            ? "warning"
                            : "neutral"
                      }
                      text={s.status}
                    />
                  </td>
                  <td className="p-4">
                    <Badge
                      type={s.paymentStatus === "Paid" ? "success" : "warning"}
                      text={s.paymentStatus}
                    />
                  </td>
                  <td className="p-4 text-right pr-6">
                    {!viewOnly && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                        {canBlock && (
                          blockedStudentIds.has(s.id) ? (
                            <button
                              onClick={() => handleUnblockStudent(s.id)}
                              disabled={!!blockActionId}
                              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                              title="Unblock"
                            >
                              {blockActionId === s.id ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockStudent(s.id)}
                              disabled={!!blockActionId}
                              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                              title="Block"
                            >
                              {blockActionId === s.id ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />}
                              Block
                            </button>
                          )
                        )}
                        <button
                          onClick={() => handleOpenModal(s)}
                          className="p-2 hover:bg-white hover:shadow-md rounded-lg text-[#4D2B8C] hover:text-[#4D2B8C]/80 transition"
                          title="Edit Student"
                        >
                          <Edit2 size={16} />
                        </button>
                        {s.mentorId && (
                          <button
                            onClick={() => handleOpenAssignModal(s)}
                            className="p-2 hover:bg-white hover:shadow-md rounded-lg text-[#4D2B8C] hover:text-[#4D2B8C]/80 transition"
                            title="Reassign Mentor"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 hover:bg-red-50 hover:shadow-md rounded-lg text-[#F39EB6] hover:text-red-500 transition"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#4D2B8C]">
                    No students found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
