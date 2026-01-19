import { useState } from "react";
import {
    Search,
    Filter,
    Calendar,
    Clock,
    MapPin,
    Camera,
    MoreVertical,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { MOCK_SESSIONS, MOCK_RESCHEDULES } from "../data/mockData";
import type { Session, RescheduleRequest, VerificationStatus } from "../types";

interface SessionsViewProps {
    user: any;
}

export const SessionsView = ({ user }: SessionsViewProps) => {
    const [activeTab, setActiveTab] = useState<"all" | "reschedule" | "calendar" | "analytics">("all");
    const [searchTerm, setSearchTerm] = useState("");

    const sessions = MOCK_SESSIONS as unknown as Session[];
    const reschedules = MOCK_RESCHEDULES as unknown as RescheduleRequest[];

    const filteredSessions = sessions.filter(item => {
        const matchesSearch =
            item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.trainerName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const filteredReschedules = reschedules.filter(item => {
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Scheduled": return "bg-[#4D2B8C]/10 text-[#4D2B8C]";
            case "In Progress": return "bg-yellow-100 text-yellow-800";
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Disputed": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getVerificationIcon = (status: VerificationStatus) => {
        switch (status) {
            case "Passed": return <CheckCircle size={16} className="text-green-500" />;
            case "Failed": return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sessions Management</h1>
                    <p className="text-gray-500">Monitor and manage tutoring sessions</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm overflow-x-auto">
                {[
                    { id: "all", label: "All Sessions" },
                    { id: "reschedule", label: "Reschedule Requests" },
                    { id: "calendar", label: "Calendar View" },
                    { id: "analytics", label: "Session Analytics" }
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

            {activeTab === "all" && (
                <>
                    {/* Filters & Search */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by student, trainer..."
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date/Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#4D2B8C]">
                                                {session.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                {session.studentName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {session.trainerName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{session.scheduledDate}</span>
                                                    <span className="text-xs text-gray-400">{session.scheduledTime} ({session.duration}m)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-xs text-gray-500" title={`GPS: ${session.gpsStatus}`}>
                                                        <MapPin size={14} /> {getVerificationIcon(session.gpsStatus)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500" title={`Face: ${session.faceStatus}`}>
                                                        <Camera size={14} /> {getVerificationIcon(session.faceStatus)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredSessions.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                                No sessions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "reschedule" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Reschedule Requests</h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Request ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Session</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requester</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Old Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">New Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReschedules.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 text-sm font-medium">{req.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.sessionId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.requestedBy}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.originalDate} <br /><span className="text-xs">{req.originalTime}</span></td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#4D2B8C]">{req.newDate} <br /><span className="text-xs">{req.newTime}</span></td>
                                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{req.reason}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">{req.status}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[#4D2B8C] hover:text-[#F39EB6] text-sm font-medium mr-3">Approve</button>
                                        <button className="text-red-500 hover:text-red-700 text-sm font-medium">Reject</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredReschedules.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                        No reschedule requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {(activeTab === "calendar" || activeTab === "analytics") && (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">This view is under construction</h3>
                    <p className="text-gray-400">Coming soon in the next update.</p>
                </div>
            )}

        </div>
    );
};
