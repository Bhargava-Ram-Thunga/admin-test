/** Regions: Backend GET /api/v1/admin/states and GET /api/v1/admin/cities?state=. No deeper hierarchy. */
import { useState, useEffect, useCallback } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import type { User, Student, Trainer } from "../types";
import { getData } from "../api/client";
import { ADMIN_API } from "../api/client";
import type { StudentApiRow, TrainerApiRow } from "../api/types";
import { getMaxCapacityFromRating } from "../utils/helpers";

function mapStudent(s: StudentApiRow): Student {
  return {
    id: s.studentId,
    name: s.fullName ?? s.studentId,
    email: s.email ?? "",
    regionId: "",
    regionName: "",
    course: "",
    status: "Active",
    paymentStatus: "Pending",
    amount: "",
    enrollmentDate: s.createdAt?.slice(0, 10) ?? "",
    avatarUrl: s.avatarUrl ?? `https://i.pravatar.cc/150?u=${s.studentId}`,
    mentorId: null,
    mentorName: null,
  };
}

function mapTrainer(t: TrainerApiRow): Trainer {
  return {
    id: t.trainerId,
    name: t.fullName ?? t.trainerId,
    regionId: t.state ?? "",
    regionName: t.city ?? t.state ?? "",
    status: t.verified ? "Active" : "Pending",
    students: t.activeStudents ?? 0,
    capacity: getMaxCapacityFromRating(t.ratingAverage),
    rating: t.ratingAverage ?? 0,
    avatarUrl: `https://i.pravatar.cc/150?u=${t.trainerId}`,
  };
}

interface RegionsViewProps {
  user: User;
}

export const RegionsView = ({ user: _user }: RegionsViewProps) => {
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string; stateId?: string }[]>([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"students" | "teachers">("students");

  const fetchStates = useCallback(async () => {
    const data = await getData<{ id: string; name: string }[]>(`${ADMIN_API}/states`).catch(() => []);
    setStates(Array.isArray(data) ? data : []);
  }, []);

  const fetchCities = useCallback(async (state: string) => {
    if (!state) {
      setCities([]);
      return;
    }
    const data = await getData<{ id: string; name: string }[]>(`${ADMIN_API}/cities?state=${encodeURIComponent(state)}`).catch(() => []);
    setCities(Array.isArray(data) ? data.map((c) => ({ ...c, stateId: state })) : []);
  }, []);

  const fetchStudentsAndTrainers = useCallback(async () => {
    setLoading(true);
    const [studentsRes, trainersRes] = await Promise.allSettled([
      getData<{ data: StudentApiRow[]; total: number }>("/api/v1/students?limit=500"),
      getData<{ data: TrainerApiRow[]; total: number }>("/api/v1/trainers?limit=500"),
    ]);
    if (studentsRes.status === "fulfilled" && studentsRes.value?.data)
      setStudents(studentsRes.value.data.map(mapStudent));
    if (trainersRes.status === "fulfilled" && trainersRes.value?.data)
      setTrainers(trainersRes.value.data.map(mapTrainer));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStates();
    fetchStudentsAndTrainers();
  }, [fetchStates, fetchStudentsAndTrainers]);

  useEffect(() => {
    if (selectedStateId) fetchCities(selectedStateId);
    else setCities([]);
  }, [selectedStateId, fetchCities]);

  useEffect(() => {
    setSelectedCityId("");
  }, [selectedStateId]);

  const filteredStudents = selectedCityId || selectedStateId
    ? students.filter((s) => {
        const t = trainers.find((x) => x.id === s.mentorId);
        if (selectedCityId) return t?.regionName === selectedCityId || t?.regionId === selectedCityId;
        if (selectedStateId) return t?.regionId === selectedStateId;
        return true;
      })
    : students;
  const filteredTeachers = selectedCityId || selectedStateId
    ? trainers.filter((t) => {
        if (selectedCityId) return t.regionName === selectedCityId || t.regionId === selectedCityId;
        if (selectedStateId) return t.regionId === selectedStateId;
        return true;
      })
    : trainers;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#4D2B8C]">Regional Data Explorer</h1>
        <button
          onClick={() => { fetchStates(); fetchStudentsAndTrainers(); }}
          disabled={loading}
          className="p-2 rounded-xl border border-[#4D2B8C]/20 text-[#4D2B8C] hover:bg-[#4D2B8C]/5 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#4D2B8C]/5 flex flex-col md:flex-row items-center gap-6 justify-between flex-wrap">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-wider pl-1 text-[#4D2B8C]/50">State</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D2B8C]/40" />
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#4D2B8C]/10 rounded-xl text-xs font-bold text-[#4D2B8C] outline-none appearance-none"
              >
                <option value="">All states</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-bold uppercase tracking-wider pl-1 text-[#4D2B8C]/50">City</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D2B8C]/40" />
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#4D2B8C]/10 rounded-xl text-xs font-bold text-[#4D2B8C] outline-none appearance-none disabled:opacity-50"
                disabled={!selectedStateId || cities.length === 0}
              >
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex bg-[#F5F7FA] p-1 rounded-xl">
          <button
            onClick={() => setViewMode("students")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "students" ? "bg-[#4D2B8C] text-white shadow-md" : "text-[#4D2B8C] hover:text-[#4D2B8C]/80"}`}
          >
            Students ({filteredStudents.length})
          </button>
          <button
            onClick={() => setViewMode("teachers")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "teachers" ? "bg-[#4D2B8C] text-white shadow-md" : "text-[#4D2B8C] hover:text-[#4D2B8C]/80"}`}
          >
            Teachers ({filteredTeachers.length})
          </button>
        </div>
      </div>

      {loading && students.length === 0 && trainers.length === 0 ? (
        <div className="py-20 text-center text-[#4D2B8C]">
          <RefreshCw size={32} className="animate-spin inline-block mb-2" />
          <p>Loading regions and data…</p>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden shadow-xl border-none">
          {viewMode === "students" ? (
            <table className="w-full">
              <thead className="bg-[#4D2B8C] text-white">
                <tr className="text-left text-xs font-bold uppercase">
                  <th className="p-4 pl-6">Student Name</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Enrollment</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F7FA]">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F5F7FA]">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={s.avatarUrl} alt="" className="w-8 h-8 rounded-lg" />
                      <span className="font-bold text-[#4D2B8C] text-sm">{s.name}</span>
                    </td>
                    <td className="p-4 text-sm text-[#4D2B8C]">{s.course || "—"}</td>
                    <td className="p-4 text-sm text-[#4D2B8C]/70">{s.enrollmentDate}</td>
                    <td className="p-4">
                      <Badge type={s.status === "Active" ? "success" : "neutral"} text={s.status} />
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-sm text-slate-400">No students in this region.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-[#4D2B8C] text-white">
                <tr className="text-left text-xs font-bold uppercase">
                  <th className="p-4 pl-6">Trainer Name</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F7FA]">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F5F7FA]">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <img src={t.avatarUrl} alt="" className="w-8 h-8 rounded-lg" />
                      <p className="font-bold text-[#4D2B8C] text-sm">{t.name}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-[#4D2B8C]">{t.students}</td>
                    <td className="p-4 text-sm text-[#F39EB6] font-bold">★ {t.rating}</td>
                    <td className="p-4">
                      <Badge type={t.status === "Active" ? "success" : "warning"} text={t.status} />
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-sm text-slate-400">No trainers in this region.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
};
