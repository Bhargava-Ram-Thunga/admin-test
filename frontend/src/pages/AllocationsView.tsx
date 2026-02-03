import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    X,
    AlertCircle,
    User,
    RefreshCw,
    Plus,
    GraduationCap,
    Settings,
    RotateCcw
} from "lucide-react";
import { CreateAllocationModal } from "../components/modals/CreateAllocationModal";
import { ReallocationModal } from "../components/modals/ReallocationModal";
import { AutoAssignmentConfigModal } from "../components/modals/AutoAssignmentConfigModal";
import type { Allocation } from "../types";
import { api, getData, postData, putData, ADMIN_API } from "../api/client";
import type { AllocationApiRow } from "../api/types";

function mapAllocationRow(row: AllocationApiRow): Allocation {
    const status = row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase() : "Pending";
    const meta = row.metadata || {};
    return {
        id: row.id,
        studentId: row.studentId,
        studentName: row.student?.fullName ?? row.studentId,
        trainerId: row.trainerId ?? null,
        trainerName: row.trainer?.fullName ?? null,
        courseId: row.courseId ?? "",
        courseName: row.course?.title ?? (row.courseId ? "—" : "—"),
        status: status as Allocation["status"],
        requestedDate: row.requestedAt ? new Date(row.requestedAt).toLocaleDateString() : "",
        allocatedDate: row.allocatedAt ? new Date(row.allocatedAt).toLocaleDateString() : undefined,
        allocatedBy: row.allocatedBy ?? undefined,
        sessionCount: typeof row.sessionCount === "number" ? row.sessionCount : 0,
        scheduleMode: (row.scheduleType?.toLowerCase().includes("sunday") ? "SUNDAY_ONLY" : "WEEKDAY_DAILY") as Allocation["scheduleMode"],
        timeSlot: (meta.timeSlot as string) ?? "—",
        startDate: (meta.startDate as string) ?? (row.requestedAt ? new Date(row.requestedAt).toISOString().slice(0, 10) : "—"),
        notes: row.notes ?? undefined,
    };
}

interface AllocationsViewProps {
    user: { id?: string };
}

export const AllocationsView = ({ user }: AllocationsViewProps) => {
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "auto" | "history">("all");
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);
    const [isAutoConfigModalOpen, setIsAutoConfigModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllocations = useCallback(async () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set("limit", "200");
        if (activeTab === "pending") params.set("status", "pending");
        const q = params.toString();
        const path = `${ADMIN_API}/allocations${q ? `?${q}` : ""}`;
        const data = await getData<AllocationApiRow[]>(path).catch((e) => {
            setError(e instanceof Error ? e.message : "Failed to load allocations");
            return [];
        });
        setAllocations(Array.isArray(data) ? data.map(mapAllocationRow) : []);
        setLoading(false);
    }, [activeTab]);

    useEffect(() => {
        fetchAllocations();
    }, [fetchAllocations]);

    const filteredAllocations = allocations.filter(item => {
        if (activeTab === "pending" && item.status !== "Pending") return false;
        if (activeTab === "auto" && item.allocatedBy !== "System") return false;

        const matchesSearch =
            item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.trainerName && item.trainerName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-800";
            case "Approved": return "bg-[#4D2B8C]/10 text-[#4D2B8C]";
            case "Active": return "bg-green-100 text-green-800";
            case "Rejected": return "bg-red-100 text-red-800";
            case "Completed": return "bg-[#F39EB6]/10 text-[#4D2B8C]";
            case "Cancelled": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleCreateAllocation = async (data: { studentId: string; trainerId?: string | null; courseId?: string | null; notes?: string; scheduleMode?: string; timeSlot?: string; startDate?: string }) => {
        const adminId = user?.id;
        if (!adminId) {
            setError("Session missing admin ID. Please sign in again.");
            return;
        }
        const created = await postData<AllocationApiRow>(`${ADMIN_API}/allocations`, {
            studentId: data.studentId,
            trainerId: data.trainerId ?? null,
            courseId: data.courseId ?? null,
            requestedBy: adminId,
            notes: data.notes ?? null,
        });
        setAllocations((prev) => [mapAllocationRow(created), ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleReallocate = async (data: { allocationId: string; newTrainerId: string; reason: string }) => {
        await putData<AllocationApiRow>(`${ADMIN_API}/allocations/${data.allocationId}`, {
            trainerId: data.newTrainerId,
            notes: data.reason,
        });
        await fetchAllocations();
        setIsReallocateModalOpen(false);
        if (selectedAllocation?.id === data.allocationId) setSelectedAllocation(null);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (newStatus === "Approved") await postData(`${ADMIN_API}/allocations/${id}/approve`, {});
        else if (newStatus === "Rejected") await postData(`${ADMIN_API}/allocations/${id}/reject`, { rejectionReason: "Rejected by admin" });
        await fetchAllocations();
        if (selectedAllocation?.id === id) setSelectedAllocation((prev) => (prev ? { ...prev, status: newStatus as Allocation["status"] } : null));
    };

    const handleCancelAllocation = async (id: string) => {
        await postData(`${ADMIN_API}/allocations/${id}/cancel`, {});
        await fetchAllocations();
        if (selectedAllocation?.id === id) setIsDetailOpen(false);
    };

    const handleRetryAutoAssign = async (allocation: Allocation) => {
        await postData(`${ADMIN_API}/allocations/retry-auto-assign`, { studentId: allocation.studentId, courseId: allocation.courseId }).catch(() => {});
        await fetchAllocations();
    };

    const AllocationDetail = ({ allocation, onClose }: { allocation: Allocation; onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Allocation Details</h2>
                        <p className="text-sm text-gray-500">ID: {allocation.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${getStatusColor(allocation.status)} bg-opacity-20`}>
                        <AlertCircle size={24} />
                        <div>
                            <p className="font-bold">Status: {allocation.status}</p>
                            <p className="text-sm opacity-80">Last updated: {allocation.allocatedDate || allocation.requestedDate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Student Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User size={20} className="text-[#4D2B8C]" /> Student Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                                <p><span className="text-gray-500">Name:</span> {allocation.studentName}</p>
                                <p><span className="text-gray-500">ID:</span> {allocation.studentId}</p>
                            </div>
                        </div>

                        {/* Trainer Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <GraduationCap size={20} className="text-[#F39EB6]" /> Trainer Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                                {allocation.trainerId ? (
                                    <>
                                        <p><span className="text-gray-500">Name:</span> {allocation.trainerName}</p>
                                        <p><span className="text-gray-500">ID:</span> {allocation.trainerId}</p>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-yellow-600 italic">No trainer assigned yet</p>
                                        <button
                                            onClick={() => setIsReallocateModalOpen(true)}
                                            className="text-sm text-[#4D2B8C] font-bold hover:underline self-start"
                                        >
                                            Assign Manually
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Course</p>
                            <p className="font-medium">{allocation.courseName}</p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Schedule Mode</p>
                            <p className="font-medium">{allocation.scheduleMode}</p>
                        </div>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Session Count</p>
                            <p className="font-medium">{allocation.sessionCount}</p>
                        </div>
                    </div>

                    {/* NEW: Session Timeline */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            Session Timeline (Mock)
                        </h3>
                        <div className="flex gap-2 overflow-x-auto pb-4">
                            {Array.from({ length: 10 }).map((_, i) => {
                                const status = i < 4 ? "Completed" : i === 4 ? "Scheduled" : "Pending";
                                return (
                                    <div key={i} className="min-w-[100px] bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center gap-1">
                                        <span className="text-xs font-bold text-gray-500">Session {i + 1}</span>
                                        <div className={`w-3 h-3 rounded-full ${status === 'Completed' ? 'bg-green-500' :
                                                status === 'Scheduled' ? 'bg-blue-500' : 'bg-gray-300'
                                            }`} />
                                        <span className="text-[10px] text-gray-400">{new Date(new Date().setDate(new Date().getDate() + i)).toLocaleDateString().slice(0, 5)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                        {allocation.status === 'Pending' && (
                            <>
                                <button
                                    onClick={() => handleStatusChange(allocation.id, 'Approved')}
                                    className="px-6 py-2 bg-[#4D2B8C] text-white rounded-lg hover:bg-[#4D2B8C]/90 font-medium shadow-lg shadow-[#4D2B8C]/20"
                                >
                                    Approve & Assign
                                </button>
                                <button
                                    onClick={() => handleStatusChange(allocation.id, 'Rejected')}
                                    className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        {allocation.status === 'Active' && (
                            <button
                                onClick={() => setIsReallocateModalOpen(true)}
                                className="px-6 py-2 bg-[#F39EB6]/10 text-[#4D2B8C] rounded-lg hover:bg-[#F39EB6]/20 font-medium flex items-center gap-2"
                            >
                                <RefreshCw size={18} /> Reallocate Trainer
                            </button>
                        )}
                        {allocation.status !== 'Cancelled' && allocation.status !== 'Rejected' && (
                            <button
                                onClick={() => handleCancelAllocation(allocation.id)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel Allocation
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );

    if (loading && allocations.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-gray-500 flex items-center gap-2">
                    <RefreshCw size={24} className="animate-spin" />
                    Loading allocations…
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => fetchAllocations()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Allocation Management</h1>
                    <p className="text-gray-500">Manage trainer-student allocations</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchAllocations()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    {activeTab === 'auto' && (
                        <button
                            onClick={() => setIsAutoConfigModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Settings size={20} />
                            Config
                        </button>
                    )}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4D2B8C] text-white rounded-lg hover:bg-[#4D2B8C]/90 transition-colors shadow-lg shadow-[#4D2B8C]/20"
                    >
                        <Plus size={20} />
                        Create Allocation
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm overflow-x-auto">
                {[
                    { id: "all", label: "All Allocations" },
                    { id: "pending", label: "Pending Approvals" },
                    { id: "auto", label: "Auto-Assignments" },
                    { id: "history", label: "Reallocation History" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                            ? "bg-[#4D2B8C]/5 text-[#4D2B8C] shadow-sm"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by student, trainer or course..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    <Filter size={20} />
                    <span>Filters</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Allocation ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAllocations.map((allocation) => (
                                <tr
                                    key={allocation.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setSelectedAllocation(allocation);
                                        setIsDetailOpen(true);
                                    }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#4D2B8C]">
                                        {allocation.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        {allocation.studentName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {allocation.trainerName || <span className="text-gray-400 italic">Unassigned</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {allocation.courseName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(allocation.status)}`}>
                                            {allocation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {allocation.allocatedDate || allocation.requestedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {activeTab === 'auto' && allocation.status === 'Pending' ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRetryAutoAssign(allocation); }}
                                                className="p-2 text-[#4D2B8C] hover:bg-[#4D2B8C]/10 rounded-full"
                                                title="Retry Auto-Assign"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                        ) : (
                                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                                <MoreVertical size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {filteredAllocations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        No allocations found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isDetailOpen && selectedAllocation && (
                <AllocationDetail allocation={selectedAllocation} onClose={() => setIsDetailOpen(false)} />
            )}

            {isCreateModalOpen && (
                <CreateAllocationModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateAllocation}
                />
            )}

            {isReallocateModalOpen && selectedAllocation && (
                <ReallocationModal
                    allocation={selectedAllocation}
                    onClose={() => setIsReallocateModalOpen(false)}
                    onConfirm={handleReallocate}
                />
            )}

            {isAutoConfigModalOpen && (
                <AutoAssignmentConfigModal
                    onClose={() => setIsAutoConfigModalOpen(false)}
                    onSave={(config) => console.log("Config saved", config)}
                />
            )}
        </div>
    );
};
