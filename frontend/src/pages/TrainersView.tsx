import { useState, useMemo } from "react";
import { Activity, Plus } from "lucide-react";
import { Card } from "../components/ui/Card";
import { checkPermission } from "../utils/helpers";
import type { Student, Trainer, User } from "../types";

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
  trainers,
  students,
}: TrainersViewProps) => {
  const [filter, setFilter] = useState("All"); // "All" | "Free" | "Fully Booked"

  // Derive data logic
  const getAssignedCount = (trainerId: string) => {
    return students.filter(
      (s) => s.mentorId === trainerId && s.status === "Active"
    ).length;
  };

  const filteredTrainers = useMemo(() => {
    // 1. Scope Permission
    let result = trainers.filter((t) => checkPermission(user, t.regionId));

    // 2. Capacity Filter
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-heading)]">
            Trainer Management
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Monitor workload and capacity
          </p>
        </div>

        <div className="flex gap-2">
          {/* Capacity Filter */}
          <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 flex items-center gap-2 text-[var(--text-body)] shadow-sm">
            <Activity size={16} className="text-[var(--color-primary)]" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold text-[var(--color-primary)] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Free">Free Slots</option>
              <option value="Fully Booked">Fully Booked</option>
            </select>
          </div>

          <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[var(--color-primary)]/90 transition shadow-none border border-transparent">
            <Plus size={16} /> Add Trainer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((t) => {
          const assignedCount = getAssignedCount(t.id);
          const capacity = t.capacity || 30;
          const isFull = assignedCount >= capacity;
          const percentage = (assignedCount / capacity) * 100;

          return (
            <Card
              key={t.id}
              className="flex flex-col items-center text-center relative group hover:border-[var(--color-primary)] transition-all"
            >
              <div className="relative mb-4">
                <img
                  src={t.avatarUrl}
                  className="w-20 h-20 rounded-full border-4 border-gray-50"
                  alt={t.name}
                />
                <div
                  className={`absolute bottom-0 right-0 w-5 h-5 border-4 border-white rounded-full ${t.status === "Active" ? "bg-[var(--color-success)]" : "bg-gray-300"
                    }`}
                ></div>
              </div>

              <h3 className="font-bold text-[var(--text-heading)] text-lg">{t.name}</h3>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-4">
                {t.regionName}
              </p>

              <div className="flex gap-2 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${isFull
                    ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20"
                    : "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20"
                    }`}
                >
                  {isFull ? "Fully Booked" : "Free Slots"}
                </span>
                <span className="bg-gray-50 text-[var(--text-body)] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  ★ {t.rating}
                </span>
              </div>

              {/* Capacity Bar */}
              <div className="w-full pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-2">
                  <span>Capacity</span>
                  <span>
                    {assignedCount} / {capacity}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[var(--color-warning)]" : "bg-[var(--color-primary)]"
                      }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          );
        })}
        {filteredTrainers.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--color-primary)]/10 rounded-3xl">
            No trainers found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
