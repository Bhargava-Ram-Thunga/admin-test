import { useState, useMemo } from "react";
import { UserCheck, Search, Plus, X, Edit2, Trash2 } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { checkPermission } from "../utils/helpers";
import { Save } from "lucide-react";
import type { Student, Trainer, User } from "../types";

interface StudentsViewProps {
  user: User;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  trainers: Trainer[];
  setTrainers: React.Dispatch<React.SetStateAction<Trainer[]>>;
  addToast: (
    message: string,
    type?: "success" | "warning" | "error" | "neutral"
  ) => void;
}

export const StudentsView = ({
  user,
  students,
  setStudents,
  trainers,
  setTrainers,
  addToast,
}: StudentsViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("All"); // "All" | "Assigned" | "Unassigned"

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Editing / Assigning State
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

  // --- FILTERS ---
  const filteredStudents = useMemo(() => {
    let result = students.filter((s) => checkPermission(user, s.regionId));

    // Search
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Assignment Filter
    if (assignmentFilter === "Assigned") {
      result = result.filter((s) => s.mentorId);
    } else if (assignmentFilter === "Unassigned") {
      result = result.filter((s) => !s.mentorId);
    }

    return result;
  }, [students, user, searchTerm, assignmentFilter]);

  // --- CRUD HANDLERS (Existing) ---
  const handleOpenModal = (student: Student | null = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ ...student });
    } else {
      setEditingStudent(null);
      setFormData({
        name: "",
        course: "Python Basics",
        regionName: "Hyderabad",
        status: "Active",
        amount: "15000",
        paymentStatus: "Pending",
        email: "",
        mentorId: null,
        mentorName: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id ? ({ ...s, ...formData } as Student) : s
        )
      );
      addToast("Student details updated successfully", "success");
    } else {
      const newStudent = {
        ...formData,
        id: Date.now().toString(),
        regionId: user.regionId === "ALL" ? "D-01" : user.regionId,
        enrollmentDate: new Date().toISOString().split("T")[0],
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
        mentorId: null,
        mentorName: null,
      } as Student;
      setStudents((prev) => [newStudent, ...prev]);
      addToast("New student enrolled successfully", "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this student record?")
    ) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      addToast("Student record deleted", "warning");
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

    // 1. Update Student
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudentForAssignment.id
          ? { ...s, mentorId: mentor.id, mentorName: mentor.name }
          : s
      )
    );

    // 2. Update Trainer Count
    setTrainers((prev) =>
      prev.map((t) =>
        t.id === mentor.id ? { ...t, students: t.students + 1 } : t
      )
    );

    addToast(
      `Assigned ${selectedStudentForAssignment.name} to ${mentor.name}`,
      "success"
    );
    setIsAssignModalOpen(false);
  };

  const handleUnassignMentor = (student: Student) => {
    if (!student.mentorId) return;

    // 1. Update Student
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id ? { ...s, mentorId: null, mentorName: null } : s
      )
    );

    // 2. Update Trainer Count (Decrement)
    setTrainers((prev) =>
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
      const hasCapacity = t.students < (t.capacity || 30);
      return inScope && hasCapacity && t.status === "Active";
    });
  }, [trainers, user]);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">
            Students Directory
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Manage enrollments and mentor assignments
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          {/* Assignment Filter */}
          <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-2 text-[var(--text-body)]">
            <UserCheck size={16} className="text-[var(--color-primary)]" />
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-[var(--color-primary)] cursor-pointer"
            >
              <option value="All">All Students</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          {/* Search */}
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 flex items-center gap-2 text-[var(--text-muted)] flex-1 sm:flex-none">
            <Search size={16} />
            <input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-full sm:w-32 text-[var(--text-body)] placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-[var(--color-primary)] text-white p-2 px-4 rounded-xl hover:bg-[var(--color-primary)]/90 transition shadow-none border border-transparent font-bold text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </div>

      {/* --- ASSIGN MENTOR MODAL --- */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Mentor"
      >
        <div className="space-y-6">

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Student
            </p>
            <div className="flex items-center gap-3">
              <img
                src={selectedStudentForAssignment?.avatarUrl}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-bold text-[var(--text-heading)]">
                  {selectedStudentForAssignment?.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedStudentForAssignment?.course}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
              Select Mentor
            </label>
            <div className="relative">
              <UserCheck
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl outline-none font-bold text-[var(--text-heading)] appearance-none focus:border-[var(--color-primary)] transition"
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
                <p className="text-xs text-red-500 mt-2 font-bold">
                  No available mentors in this region with capacity.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleAssignMentor}
            disabled={!selectedMentorId}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-primary)]/90 transition shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Student Name
            </label>
            <input
              required
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-[var(--text-heading)] focus:border-[var(--color-primary)] transition"
              placeholder="Enter full name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Course
              </label>
              <select
                value={formData.course || ""}
                onChange={(e) =>
                  setFormData({ ...formData, course: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-[var(--text-heading)] focus:border-[var(--color-primary)] transition"
              >
                {[
                  "Python Basics",
                  "Web Dev",
                  "Data Science",
                  "Cyber Security",
                  "AI Basics",
                  "Full Stack Dev",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Region
              </label>
              <input
                value={formData.regionName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, regionName: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-[var(--text-heading)] focus:border-[var(--color-primary)] transition"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Status
              </label>
              <select
                value={formData.status || "Active"}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-[var(--text-heading)] focus:border-[var(--color-primary)] transition"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Payment
              </label>
              <select
                value={formData.paymentStatus || "Pending"}
                onChange={(e) =>
                  setFormData({ ...formData, paymentStatus: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-[var(--text-heading)] focus:border-[var(--color-primary)] transition"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Fee Amount (₹)
            </label>
            <input
              type="number"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-[var(--text-heading)] focus:border-[var(--color-primary)] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-primary)]/90 transition shadow-none mt-4 flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Record
          </button>
        </form>
      </Modal>

      {/* Table */}
      <Card className="p-0 overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Region</th>
                <th className="p-4">Course</th>
                <th className="p-4">Mentor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatarUrl}
                        className="w-10 h-10 rounded-xl bg-gray-200"
                        alt={s.name}
                      />
                      <div>
                        <p className="font-bold text-[var(--text-heading)] text-sm">
                          {s.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {s.enrollmentDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-[var(--text-body)]">
                    {s.regionName}
                  </td>
                  <td className="p-4 text-sm font-bold text-[var(--text-heading)]">
                    {s.course}
                  </td>

                  {/* MENTOR COLUMN */}
                  <td className="p-4">
                    {s.mentorId ? (
                      <div className="flex items-center gap-2 group/mentor">
                        <span className="text-xs font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-md">
                          {s.mentorName}
                        </span>
                        {/* Quick Unassign Button */}
                        <button
                          onClick={() => handleUnassignMentor(s)}
                          className="opacity-0 group-hover/mentor:opacity-100 text-[var(--color-error)] hover:text-red-700 transition-opacity"
                          title="Unassign Mentor"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAssignModal(s)}
                        className="text-xs font-bold bg-gray-100 text-[var(--text-muted)] px-3 py-1 rounded-full hover:bg-[var(--color-primary)] hover:text-white transition flex items-center gap-1"
                      >
                        Assign <Plus size={12} />
                      </button>
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
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(s)}
                        className="p-2 hover:bg-white hover:border border-gray-200 rounded-lg text-[var(--text-body)] transition"
                        title="Edit Student"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Reassign Option (if already assigned) */}
                      {s.mentorId && (
                        <button
                          onClick={() => handleOpenAssignModal(s)}
                          className="p-2 hover:bg-white hover:border border-gray-200 rounded-lg text-[var(--text-body)] transition"
                          title="Reassign Mentor"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 hover:bg-red-50 hover:border border-red-100 rounded-lg text-[var(--color-error)] transition"
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
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
