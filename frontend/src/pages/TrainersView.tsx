import { useState, useMemo, useEffect, useCallback } from "react";
import { Activity, Plus, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/Card";
import { checkPermission } from "../utils/helpers";
import type { Student, Trainer, User } from "../types";
import { getData } from "../api/client";
import type { TrainerApiRow } from "../api/types";

function mapTrainerRow(row: TrainerApiRow): Trainer {
  return {
    id: row.trainerId,
    name: row.fullName ?? row.trainerId,
    regionId: row.state ?? "",
    regionName: row.city ?? row.state ?? "",
    status: row.verified ? "Active" : "Pending",
    students: row.activeStudents ?? 0,
    capacity: 30,
    rating: row.ratingAverage ?? 0,
    avatarUrl: `https://i.pravatar.cc/150?u=${row.trainerId}`,
  };
}

interface TrainersViewProps {
  user: User;
  trainers: Trainer[];
  students: Student[];
  setTrainers: React.Dispatch<React.SetStateAction<Trainer[]>>;
  addToast: (
    message: string,
    type?: "success" | "warning" | "error" | "neutral"
  ) => void;
}

export const TrainersView = ({
  user,
  trainers: trainersProp,
  students,
}: TrainersViewProps) => {
  const [trainers, setTrainersLocal] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("limit", "100");
    const q = params.toString();
    const path = `/api/v1/trainers${q ? `?${q}` : ""}`;
    const res = await getData<{ data: TrainerApiRow[]; total: number; page: number; limit: number }>(path).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load trainers");
      return { data: [], total: 0, page: 1, limit: 100 };
    });
    setTrainersLocal(Array.isArray(res?.data) ? res.data.map(mapTrainerRow) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const getAssignedCount = (trainerId: string) => {
    return students.filter(
      (s) => s.mentorId === trainerId && s.status === "Active"
    ).length;
  };

  const filteredTrainers = useMemo(() => {
    let result = trainers.filter((t) => !user.regionId || user.regionId === "ALL" || checkPermission(user, t.regionId));
    if (filter === "Free") {
      result = result.filter((t) => {
        const count = getAssignedCount(t.id);
        const capacity = t.capacity || 30;
        return t.status === "Active" && count < capacity;
      });
    } else if (filter === "Fully Booked") {
      result = result.filter((t) => {
        const count = getAssignedCount(t.id);
        const capacity = t.capacity || 30;
        return count >= capacity;
      });
    }
    return result;
  }, [trainers, students, user, filter]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchTrainers()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4D2B8C]">
            Trainer Management
          </h1>
          <p className="text-sm text-[#4D2B8C]">
            Monitor workload and capacity
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchTrainers()}
            className="flex items-center gap-2 px-3 py-2 border border-[#4D2B8C]/20 rounded-xl text-[#4D2B8C] hover:bg-[#4D2B8C]/5"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <div className="bg-white px-3 py-2 rounded-xl border border-[#4D2B8C]/10 flex items-center gap-2 text-[#4D2B8C] shadow-sm">
            <Activity size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-[#4D2B8C] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Free">Free Slots</option>
              <option value="Fully Booked">Fully Booked</option>
            </select>
          </div>
          {/* Add Trainer: backend uses trainer approvals (GET /api/v1/admin/trainers/approvals); no direct create API */}
          <button className="bg-[#4D2B8C] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#F39EB6] transition shadow-lg shadow-[#4D2B8C]/20">
            <Plus size={16} /> Add Trainer
          </button>
        </div>
      </div>
      {loading && trainers.length === 0 && (
        <div className="flex items-center justify-center min-h-[120px] text-[#4D2B8C]">
          <RefreshCw size={24} className="animate-spin" /> Loading trainers…
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((t) => {
          const assignedCount = getAssignedCount(t.id);
          const capacity = t.capacity || 30;
          const isFull = assignedCount >= capacity;
          const percentage = (assignedCount / capacity) * 100;

          return (
            <Card
              key={t.id}
              className="flex flex-col items-center text-center relative group hover:shadow-xl transition-all"
            >
              <div className="relative mb-4">
                <img
                  src={t.avatarUrl}
                  className="w-20 h-20 rounded-full border-4 border-[#F5F7FA]"
                  alt={t.name}
                />
                <div
                  className={`absolute bottom-0 right-0 w-5 h-5 border-4 border-white rounded-full ${t.status === "Active" ? "bg-[#4D2B8C]" : "bg-gray-300"
                    }`}
                ></div>
              </div>

              <h3 className="font-bold text-[#4D2B8C] text-lg">{t.name}</h3>
              <p className="text-xs font-bold text-[#4D2B8C] uppercase mb-4">
                {t.regionName}
              </p>

              <div className="flex gap-2 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${isFull
                      ? "bg-[#F39EB6]/10 text-[#4D2B8C] border-[#F39EB6]/20"
                      : "bg-[#4D2B8C]/10 text-[#4D2B8C] border-[#4D2B8C]/20"
                    }`}
                >
                  {isFull ? "Fully Booked" : "Free Slots"}
                </span>
                <span className="bg-[#F5F7FA] text-[#4D2B8C] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  ★ {t.rating}
                </span>
              </div>

              {/* Capacity Bar */}
              <div className="w-full pt-4 border-t border-[#F5F7FA]">
                <div className="flex justify-between text-xs font-bold text-[#4D2B8C] mb-2">
                  <span>Capacity</span>
                  <span>
                    {assignedCount} / {capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#F5F7FA] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[#F39EB6]" : "bg-[#4D2B8C]"
                      }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredTrainers.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#4D2B8C] border-2 border-dashed border-[#4D2B8C]/10 rounded-3xl">
            No trainers found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
