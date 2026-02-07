import { useState, useMemo, useEffect, useCallback } from "react";
import { Activity, Plus, RefreshCw, CheckCircle, XCircle, UserPlus, Ban, ShieldCheck, FileText } from "lucide-react";
import { Card } from "../components/ui/Card";
import { TrainerDetailModal } from "../components/modals/TrainerDetailModal";
import { checkPermission, getMaxCapacityFromRating } from "../utils/helpers";
import type { Trainer, User } from "../types";
import { getData, postData, ADMIN_API } from "../api/client";
import type { TrainerApiRow, TrainerApprovalApiRow } from "../api/types";
import { hasPermission, TRAINER_APPROVE, TRAINER_REJECT, BLOCK_TUTOR } from "../constants/permissions";

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

interface TrainersViewProps {
  user: User;
  addToast: (
    message: string,
    type?: "success" | "warning" | "error" | "neutral"
  ) => void;
}

export const TrainersView = ({
  user,
  addToast,
}: TrainersViewProps) => {
  const [activeTab, setActiveTab] = useState<"trainers" | "applications">("trainers");
  const [trainers, setTrainersLocal] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  // Trainer applications (pending approvals)
  const [applications, setApplications] = useState<TrainerApprovalApiRow[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [blockedTrainerIds, setBlockedTrainerIds] = useState<Set<string>>(new Set());
  const [blockActionId, setBlockActionId] = useState<string | null>(null);
  const [selectedTrainerIdForDetail, setSelectedTrainerIdForDetail] = useState<string | null>(null);
  const [isTrainerDetailModalOpen, setIsTrainerDetailModalOpen] = useState(false);

  const fetchBlockedTrainerIds = useCallback(async () => {
    const res = await getData<{ entityIds: string[] }>(`${ADMIN_API}/blocked-ids?entityType=trainer`).catch(() => ({ entityIds: [] }));
    setBlockedTrainerIds(new Set(res?.entityIds ?? []));
  }, []);

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    const path = `${ADMIN_API}/trainers/approvals?status=pending&limit=100&includeProfile=true`;
    const data = await getData<TrainerApprovalApiRow[]>(path).catch((e) => {
      setApplicationsError(e instanceof Error ? e.message : "Failed to load applications");
      return [];
    });
    setApplications(Array.isArray(data) ? data : []);
    setApplicationsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "applications") fetchApplications();
  }, [activeTab, fetchApplications]);

  useEffect(() => {
    fetchBlockedTrainerIds();
  }, [fetchBlockedTrainerIds]);

  const canApprove = hasPermission(user, TRAINER_APPROVE);
  const canReject = hasPermission(user, TRAINER_REJECT);
  const canBlock = hasPermission(user, BLOCK_TUTOR);

  const handleBlockTrainer = async (trainerId: string) => {
    if (!canBlock) return;
    setBlockActionId(trainerId);
    try {
      await postData(`${ADMIN_API}/trainers/${trainerId}/block`, { reason: "Blocked by admin" });
      addToast("Trainer blocked.", "warning");
      await fetchBlockedTrainerIds();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Block failed", "error");
    } finally {
      setBlockActionId(null);
    }
  };

  const handleUnblockTrainer = async (trainerId: string) => {
    if (!canBlock) return;
    setBlockActionId(trainerId);
    try {
      await postData(`${ADMIN_API}/trainers/${trainerId}/unblock`, {});
      addToast("Trainer unblocked.", "success");
      await fetchBlockedTrainerIds();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Unblock failed", "error");
    } finally {
      setBlockActionId(null);
    }
  };

  const handleApprove = async (trainerId: string) => {
    if (!canApprove) return;
    setActionId(trainerId);
    try {
      await postData(`${ADMIN_API}/trainers/approvals/${trainerId}/approve`, {});
      addToast("Trainer application approved.", "success");
      await fetchApplications();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Approve failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (trainerId: string) => {
    if (!canReject) return;
    const reason = window.prompt("Rejection reason (optional):")?.trim() || "Rejected by admin";
    setActionId(trainerId);
    try {
      await postData(`${ADMIN_API}/trainers/approvals/${trainerId}/reject`, { reason });
      addToast("Trainer application rejected.", "warning");
      await fetchApplications();
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Reject failed", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleOpenApplicationDetail = (trainerId: string) => {
    setSelectedTrainerIdForDetail(trainerId);
    setIsTrainerDetailModalOpen(true);
  };

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

  const filteredTrainers = useMemo(() => {
    let result = trainers.filter((t) => !user.regionId || user.regionId === "ALL" || checkPermission(user, t.regionId));
    if (filter === "Free") {
      result = result.filter((t) => {
        const count = t.students ?? 0;
        const capacity = t.capacity || 4;
        return t.status === "Active" && count < capacity;
      });
    } else if (filter === "Fully Booked") {
      result = result.filter((t) => {
        const count = t.students ?? 0;
        const capacity = t.capacity || 4;
        return count >= capacity;
      });
    }
    return result;
  }, [trainers, user, filter]);

  return (
    <div className="space-y-6">
      {error && activeTab === "trainers" && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchTrainers()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      {applicationsError && activeTab === "applications" && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{applicationsError}</span>
          <button onClick={() => fetchApplications()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4D2B8C]">
            Trainer Management
          </h1>
          <p className="text-sm text-[#4D2B8C]">
            {activeTab === "trainers" ? "Monitor workload and capacity" : "Review and approve trainer applications"}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#4D2B8C]/10 shadow-sm">
            <button
              onClick={() => setActiveTab("trainers")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "trainers" ? "bg-[#4D2B8C] text-white shadow" : "text-[#4D2B8C] hover:bg-[#4D2B8C]/10"}`}
            >
              All Trainers
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${activeTab === "applications" ? "bg-[#4D2B8C] text-white shadow" : "text-[#4D2B8C] hover:bg-[#4D2B8C]/10"}`}
            >
              <UserPlus size={16} />
              Applications
              {applications.length > 0 && (
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{applications.length}</span>
              )}
            </button>
          </div>
          {activeTab === "trainers" && (
            <>
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
              <button className="bg-[#4D2B8C] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#F39EB6] transition shadow-lg shadow-[#4D2B8C]/20">
                <Plus size={16} /> Add Trainer
              </button>
            </>
          )}
          {activeTab === "applications" && (
            <button
              onClick={() => fetchApplications()}
              className="flex items-center gap-2 px-3 py-2 border border-[#4D2B8C]/20 rounded-xl text-[#4D2B8C] hover:bg-[#4D2B8C]/5"
              title="Refresh"
            >
              <RefreshCw size={16} className={applicationsLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {activeTab === "applications" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {applicationsLoading && applications.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px] text-[#4D2B8C]">
              <RefreshCw size={28} className="animate-spin" /> Loading applications…
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-[#4D2B8C] border-2 border-dashed border-[#4D2B8C]/10 rounded-2xl mx-4 mb-4">
              <UserPlus size={40} className="mx-auto text-[#4D2B8C]/50 mb-3" />
              <p className="font-medium">No pending trainer applications.</p>
              <p className="text-sm text-gray-500 mt-1">New applications will appear here for approval.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => {
                    const name = app.profile?.fullName ?? app.username ?? app.email ?? app.id;
                    const isActing = actionId === app.id;
                    return (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#4D2B8C]">{name}</div>
                          {app.username && app.username !== name && (
                            <div className="text-xs text-gray-500">@{app.username}</div>
                          )}
                          {blockedTrainerIds.has(app.id) && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              <Ban size={12} /> Blocked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {app.email && <div>{app.email}</div>}
                          {app.phone && <div>{app.phone}</div>}
                          {!app.email && !app.phone && "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenApplicationDetail(app.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-[#4D2B8C] border border-[#4D2B8C]/20 hover:bg-[#4D2B8C]/5"
                            >
                              <FileText size={14} />
                              Details
                            </button>
                            {canApprove && (
                              <button
                                onClick={() => handleApprove(app.id)}
                                disabled={!!actionId}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#4D2B8C] text-white hover:bg-[#4D2B8C]/90 disabled:opacity-50"
                              >
                                {isActing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                Approve
                              </button>
                            )}
                            {canReject && (
                              <button
                                onClick={() => handleReject(app.id)}
                                disabled={!!actionId}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                              >
                                {isActing ? null : <XCircle size={14} />}
                                Reject
                              </button>
                            )}
                            {canBlock && (
                              blockedTrainerIds.has(app.id) ? (
                                <button
                                  onClick={() => handleUnblockTrainer(app.id)}
                                  disabled={!!blockActionId}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 disabled:opacity-50"
                                >
                                  {blockActionId === app.id ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBlockTrainer(app.id)}
                                  disabled={!!blockActionId}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50"
                                >
                                  {blockActionId === app.id ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />}
                                  Block
                                </button>
                              )
                            )}
                            {!canApprove && !canReject && !canBlock && <span className="text-xs text-gray-500">No permission</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "trainers" && loading && trainers.length === 0 && (
        <div className="flex items-center justify-center min-h-[120px] text-[#4D2B8C]">
          <RefreshCw size={24} className="animate-spin" /> Loading trainers…
        </div>
      )}

      {activeTab === "trainers" && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((t) => {
          const assignedCount = t.students ?? 0;
          const capacity = t.capacity || 4;
          const isFull = assignedCount >= capacity;
          const percentage = (assignedCount / capacity) * 100;

          return (
            <Card
              key={t.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedTrainerIdForDetail(t.id);
                setIsTrainerDetailModalOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedTrainerIdForDetail(t.id);
                  setIsTrainerDetailModalOpen(true);
                }
              }}
              className="flex flex-col items-center text-center relative group hover:shadow-xl transition-all cursor-pointer"
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

              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {blockedTrainerIds.has(t.id) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Ban size={12} /> Blocked
                  </span>
                )}
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
              {canBlock && (
                <div
                  className="w-full pt-2 border-t border-[#F5F7FA]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {blockedTrainerIds.has(t.id) ? (
                    <button
                      type="button"
                      onClick={() => handleUnblockTrainer(t.id)}
                      disabled={!!blockActionId}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                      {blockActionId === t.id ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                      Unblock
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBlockTrainer(t.id)}
                      disabled={!!blockActionId}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                      {blockActionId === t.id ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />}
                      Block
                    </button>
                  )}
                </div>
              )}

              {/* Capacity Bar (students, rating-based 4–8) */}
              <div className="w-full pt-4 border-t border-[#F5F7FA]">
                <div className="flex justify-between text-xs font-bold text-[#4D2B8C] mb-2">
                  <span title="Max students by rating (4–8)">Capacity</span>
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
      )}
      <TrainerDetailModal
        trainerId={selectedTrainerIdForDetail}
        isOpen={isTrainerDetailModalOpen}
        onClose={() => {
          setIsTrainerDetailModalOpen(false);
          setSelectedTrainerIdForDetail(null);
        }}
      />
    </div>
  );
};
