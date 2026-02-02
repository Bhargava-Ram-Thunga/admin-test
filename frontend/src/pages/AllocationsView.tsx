import { useState } from "react";
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
import { MOCK_ALLOCATIONS } from "../data/mockData";
import { CreateAllocationModal } from "../components/modals/CreateAllocationModal";
import { ReallocationModal } from "../components/modals/ReallocationModal";
import { AutoAssignmentConfigModal } from "../components/modals/AutoAssignmentConfigModal";
import type { Allocation } from "../types";

interface AllocationsViewProps {
    user: any;
}

export const AllocationsView = ({ user: _user }: AllocationsViewProps) => {
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "auto" | "history">("all");
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isReallocateModalOpen, setIsReallocateModalOpen] = useState(false);
    const [isAutoConfigModalOpen, setIsAutoConfigModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Mock local state to allow UI updates
    const [allocations, setAllocations] = useState<Allocation[]>(MOCK_ALLOCATIONS as unknown as Allocation[]);

    // Simple filter logic
    const filteredAllocations = allocations.filter(item => {
        if (activeTab === "pending" && item.status !== "Pending") return false;
        // In a real app, 'auto' and 'history' would filter by specific fields. 
        // For now, we simulate 'Auto' showing items allocated by System.
        if (activeTab === "auto" && item.allocatedBy !== "System") return false;

        const matchesSearch =
            item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.trainerName && item.trainerName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20";
            case "Approved": return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20";
            case "Active": return "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20";
            case "Rejected": return "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20";
            case "Completed": return "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20";
            case "Cancelled": return "bg-gray-100 text-[var(--text-muted)] border border-gray-200";
            default: return "bg-gray-100 text-[var(--text-muted)] border border-gray-200";
        }
    };

    // MOCK HANDLERS
    const handleCreateAllocation = (data: any) => {
        console.log("Creating allocation:", data);
        // TODO: Enable API integration when backend is connected
        /*
        api.post('/allocations', data).then(res => {
            setAllocations([res.data, ...allocations]);
        });
        */

        // Mock UI update
        const newAllocation: Allocation = {
            id: `AL-${Date.now()}`,
            studentId: data.studentId,
            studentName: data.studentId === 'S001' ? 'Rahul Sharma' : 'New Student',
            trainerId: data.trainerId || null,
            trainerName: data.trainerId === 'T001' ? 'Vikram Malhotra' : null,
            courseId: data.courseId,
            courseName: 'Mathematics 101',
            status: 'Pending',
            requestedDate: new Date().toLocaleDateString(),
            sessionCount: 20,
            scheduleMode: data.scheduleMode,
            timeSlot: data.timeSlot,
            startDate: data.startDate
        };
        setAllocations([newAllocation, ...allocations]);
    };

    const handleReallocate = (data: any) => {
        console.log("Reallocating:", data);
        // TODO: Enable API integration when backend is connected
        /*
        api.post(`/allocations/${data.allocationId}/reallocate`, data);
        */

        // Mock UI update
        const updated = allocations.map(a =>
            a.id === data.allocationId
                ? { ...a, trainerId: data.newTrainerId, trainerName: 'New Trainer (Mock)', notes: `Reallocated: ${data.reason}` }
                : a
        );
        setAllocations(updated);

        // Also update selected allocation if open
        if (selectedAllocation?.id === data.allocationId) {
            setSelectedAllocation(prev => prev ? { ...prev, trainerId: data.newTrainerId, trainerName: 'New Trainer (Mock)' } : null);
        }
    };

    const handleStatusChange = (id: string, newStatus: any) => {
        console.log(`Changing status of ${id} to ${newStatus}`);
        // TODO: Enable API integration when backend is connected
        /*
        api.patch(`/allocations/${id}/status`, { status: newStatus });
        */

        const updated = allocations.map(a => a.id === id ? { ...a, status: newStatus } : a);
        setAllocations(updated);
        if (selectedAllocation?.id === id) {
            setSelectedAllocation(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const handleRetryAutoAssign = (id: string) => {
        console.log(`Retrying auto-assign for ${id}`);
        // TODO: Enable API integration when backend is connected
        alert("System is retrying assignment based on proximity and subject match...");
    };

    const AllocationDetail = ({ allocation, onClose }: { allocation: Allocation; onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-none border-gray-200 border w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
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
                                <User size={20} className="text-[var(--color-primary)]" /> Student Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                                <p><span className="text-gray-500">Name:</span> {allocation.studentName}</p>
                                <p><span className="text-gray-500">ID:</span> {allocation.studentId}</p>
                            </div>
                        </div>

                        {/* Trainer Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <GraduationCap size={20} className="text-[var(--color-warning)]" /> Trainer Details
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
                                            className="text-sm text-[var(--color-primary)] font-bold hover:underline self-start"
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
                                        <div className={`w-3 h-3 rounded-full ${status === 'Completed' ? 'bg-[var(--color-success)]' :
                                            status === 'Scheduled' ? 'bg-[var(--color-info)]' : 'bg-gray-300'
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
                                    className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 font-medium shadow-none"
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
                                className="px-6 py-2 bg-[var(--color-warning)]/10 text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-warning)]/20 font-medium flex items-center gap-2"
                            >
                                <RefreshCw size={18} /> Reallocate Trainer
                            </button>
                        )}
                        {allocation.status !== 'Cancelled' && allocation.status !== 'Rejected' && (
                            <button
                                onClick={() => handleStatusChange(allocation.id, 'Cancelled')}
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Allocation Management</h1>
                    <p className="text-gray-500">Manage trainer-student allocations</p>
                </div>
                <div className="flex gap-2">
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
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors shadow-none"
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
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/10 shadow-none"
                            : "text-[var(--text-muted)] hover:bg-gray-50 hover:text-[var(--text-body)]"
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
                    <table className="w-full min-w-[1000px]">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-primary)]">
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
                                                onClick={(e) => { e.stopPropagation(); handleRetryAutoAssign(allocation.id); }}
                                                className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-full"
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
