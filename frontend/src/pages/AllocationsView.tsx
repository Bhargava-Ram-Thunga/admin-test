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
    GraduationCap
} from "lucide-react";
import { MOCK_ALLOCATIONS } from "../data/mockData";
import type { Allocation } from "../types";

interface AllocationsViewProps {
    user: any;
}

export const AllocationsView = ({ user }: AllocationsViewProps) => {
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "auto" | "history">("all");
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const allocations = MOCK_ALLOCATIONS as unknown as Allocation[];

    // Simple filter logic
    const filteredAllocations = allocations.filter(item => {
        if (activeTab === "pending" && item.status !== "Pending") return false;
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

    const AllocationDetail = ({ allocation, onClose }: { allocation: Allocation; onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
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
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p><span className="text-gray-500">Name:</span> {allocation.studentName}</p>
                                <p><span className="text-gray-500">ID:</span> {allocation.studentId}</p>
                            </div>
                        </div>

                        {/* Trainer Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <GraduationCap size={20} className="text-[#F39EB6]" /> Trainer Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                {allocation.trainerId ? (
                                    <>
                                        <p><span className="text-gray-500">Name:</span> {allocation.trainerName}</p>
                                        <p><span className="text-gray-500">ID:</span> {allocation.trainerId}</p>
                                    </>
                                ) : (
                                    <p className="text-yellow-600 italic">No trainer assigned yet</p>
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

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                        {allocation.status === 'Pending' && (
                            <>
                                <button className="px-6 py-2 bg-[#4D2B8C] text-white rounded-lg hover:bg-[#4D2B8C]/90 font-medium">
                                    Approve & Assign
                                </button>
                                <button className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                                    Reject
                                </button>
                            </>
                        )}
                        {allocation.status === 'Active' && (
                            <button className="px-6 py-2 bg-[#F39EB6]/10 text-[#4D2B8C] rounded-lg hover:bg-[#F39EB6]/20 font-medium flex items-center gap-2">
                                <RefreshCw size={18} /> Reallocate Trainer
                            </button>
                        )}
                        <button onClick={() => { }} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                            Cancel Allocation
                        </button>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4D2B8C] text-white rounded-lg hover:bg-[#4D2B8C]/90 transition-colors">
                    <Plus size={20} />
                    Create Allocation
                </button>
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
                                        <button className="p-2 text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={18} />
                                        </button>
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
        </div>
    );
};
