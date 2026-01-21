import { useState, useMemo } from "react";
import {
    Search,
    Filter,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Camera,
    MoreVertical,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    AlertTriangle
} from "lucide-react";
import { MOCK_SESSIONS, MOCK_RESCHEDULES, MOCK_CALENDAR_SESSIONS } from "../data/mockData";
import { SessionDetailModal } from "../components/modals/SessionDetailModal";
import type { Session, RescheduleRequest, VerificationStatus } from "../types";

interface SessionsViewProps {
    user: any;
}

export const SessionsView = ({ user: _user }: SessionsViewProps) => {
    const [activeTab, setActiveTab] = useState<"all" | "reschedule" | "calendar" | "analytics">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Mock State
    const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS as unknown as Session[]);
    const [reschedules, setReschedules] = useState<RescheduleRequest[]>(MOCK_RESCHEDULES as unknown as RescheduleRequest[]);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarFilter, setCalendarFilter] = useState({ trainer: "", status: "" });
    // Local state for calendar sessions to support drag-and-drop updates
    const [calendarSessions, setCalendarSessions] = useState(MOCK_CALENDAR_SESSIONS);

    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => i + 1);
    };

    // Helper to get day of week for 1st of month (0=Sun, 6=Sat)
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const filteredSessions = sessions.filter(item => {
        const matchesSearch =
            item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.trainerName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Scheduled": return "bg-[#4D2B8C]/10 text-[#4D2B8C] border-[#4D2B8C]/20";
            case "In Progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Completed": return "bg-green-100 text-green-800 border-green-200";
            case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
            case "Disputed": return "bg-orange-100 text-orange-800 border-orange-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getVerificationIcon = (status: VerificationStatus) => {
        switch (status) {
            case "Passed": return <CheckCircle size={16} className="text-green-500" />;
            case "Failed": return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    // HANDLERS
    const handleRescheduleAction = (id: string, action: 'Approved' | 'Rejected') => {
        console.log(`Reschedule request ${id} ${action}`);
        // TODO: Enable API integration
        /*
        api.post(`/reschedules/${id}/${action.toLowerCase()}`);
        */
        const updated = reschedules.map(r => r.id === id ? { ...r, status: action } : r);
        setReschedules(updated);
    };

    const handleSessionReschedule = () => {
        if (selectedSession) {
            const updated = sessions.map(s => s.id === selectedSession.id ? { ...s, status: "Cancelled" as "Cancelled" } : s);
            setSessions(updated);
        }
        alert("Session rescheduled (Mock: Status set to Cancelled)");
        setIsDetailOpen(false);
    };

    // CALENDAR COMPONENT
    const CalendarView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const emptySlots = Array.from({ length: firstDay }, (_, i) => i);

        // Filter Calendar Sessions
        const currentMonthSessions = useMemo(() => {
            return calendarSessions.filter(s => {
                const sDate = new Date(s.date);
                return sDate.getMonth() === currentDate.getMonth() &&
                    sDate.getFullYear() === currentDate.getFullYear() &&
                    (calendarFilter.trainer === "" || s.trainerName.includes(calendarFilter.trainer)) &&
                    (calendarFilter.status === "" || s.status === calendarFilter.status);
            });
        }, [currentDate, calendarFilter]);

        // Mock Conflict Detection (Simple: same time & trainer)
        const hasConflict = (session: any, daySessions: any[]) => {
            return daySessions.some(s => s.id !== session.id && s.trainerId === session.trainerId && s.time === session.time);
        };

        const handleDragStart = (e: React.DragEvent, sessionId: string) => {
            e.dataTransfer.setData("sessionId", sessionId);
        };

        const handleDrop = (e: React.DragEvent, day: number) => {
            e.preventDefault();
            const sessionId = e.dataTransfer.getData("sessionId");
            // Create a ISO-like or parseable date string for consistency, though toDateString works.
            // Using a standard format helps if we were sending to API, but here local string is fine.
            // Using a standard format helps if we were sending to API, but here local string is fine.
            const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

            // Find the session to get more details for the confirm message or just use ID
            const sessionToMove = calendarSessions.find(s => s.id === sessionId);

            if (confirm(`Move session for ${sessionToMove?.studentName || sessionId} to ${targetDate.toLocaleDateString()}?`)) {
                const updatedSessions = calendarSessions.map(session => {
                    if (session.id === sessionId) {
                        // Update the date - Must be Date object per Mock Data type
                        return { ...session, date: targetDate };
                    }
                    return session;
                });
                setCalendarSessions(updatedSessions);
            }
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
        };

        return (
            <div className="space-y-4 animate-in fade-in duration-300">
                {/* Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-gray-700 w-32 text-center select-none">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-md transition"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select
                            className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#4D2B8C]"
                            value={calendarFilter.trainer}
                            onChange={(e) => setCalendarFilter({ ...calendarFilter, trainer: e.target.value })}
                        >
                            <option value="">All Trainers</option>
                            <option value="Ravi">Ravi Teja</option>
                            <option value="Lakshmi">Lakshmi Narayan</option>
                            <option value="Vikram">Vikram Raju</option>
                        </select>
                        <select
                            className="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[#4D2B8C]"
                            value={calendarFilter.status}
                            onChange={(e) => setCalendarFilter({ ...calendarFilter, status: e.target.value })}
                        >
                            <option value="">All Statuses</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-7 gap-4 text-center mb-4 pb-4 border-b border-gray-100">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="font-bold text-gray-400 text-xs uppercase tracking-wider">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty Slots for Start of Month */}
                        {emptySlots.map(i => <div key={`empty-${i}`} className="h-32 bg-gray-50/30 rounded-lg" />)}

                        {/* Days */}
                        {daysInMonth.map(day => {
                            const daySessions = currentMonthSessions.filter(s => new Date(s.date).getDate() === day);
                            const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

                            return (
                                <div
                                    key={day}
                                    className={`h-32 p-2 border rounded-lg transition-all relative group overflow-y-auto ${isToday ? 'border-[#4D2B8C] bg-[#4D2B8C]/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                >
                                    <span className={`text-sm font-bold absolute top-2 right-2 ${isToday ? 'text-[#4D2B8C] bg-white w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : 'text-gray-400'}`}>
                                        {day}
                                    </span>

                                    <div className="mt-6 space-y-1.5">
                                        {daySessions.map(s => {
                                            const conflict = hasConflict(s, daySessions);
                                            return (
                                                <div
                                                    key={s.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, s.id)}
                                                    onClick={() => {
                                                        // Convert calendar session to full session shape if needed
                                                        // For now, we mock it enough to open modal
                                                        const fullSessionMock = {
                                                            ...s,
                                                            id: s.id,
                                                            scheduledDate: new Date(s.date).toLocaleDateString(),
                                                            scheduledTime: s.time,
                                                            gpsStatus: 'Pending',
                                                            faceStatus: 'Pending',
                                                            allocationId: 'MOCK'
                                                        } as unknown as Session;
                                                        setSelectedSession(fullSessionMock);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className={`p-1.5 rounded text-[10px] font-medium border cursor-grab active:cursor-grabbing hover:shadow-md transition flex items-center gap-1 ${getStatusColor(s.status)} ${conflict ? 'ring-1 ring-red-400' : ''}`}
                                                    title={`${s.time} - ${s.trainerName} with ${s.studentName} (${s.status})`}
                                                >
                                                    {conflict && <AlertTriangle size={10} className="text-red-500 shrink-0" />}
                                                    <div className="truncate">
                                                        <span className="font-bold">{s.time}</span> {s.studentName}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Hover Add (Visual) */}
                                    <div className="absolute inset-0 bg-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        {daySessions.length === 0 && <span className="text-xs text-gray-400">+ Add</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
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
                                        <tr
                                            key={session.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setSelectedSession(session);
                                                setIsDetailOpen(true);
                                            }}
                                        >
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
                            {reschedules.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 text-sm font-medium">{req.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.sessionId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.requestedBy}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.originalDate} <br /><span className="text-xs">{req.originalTime}</span></td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#4D2B8C]">{req.newDate} <br /><span className="text-xs">{req.newTime}</span></td>
                                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{req.reason}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{req.status}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleRescheduleAction(req.id, 'Approved')}
                                                    className="text-[#4D2B8C] hover:text-[#F39EB6] text-sm font-medium mr-3"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRescheduleAction(req.id, 'Rejected')}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {reschedules.length === 0 && (
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

            {activeTab === "calendar" && <CalendarView />}

            {activeTab === "analytics" && (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">Analytics View</h3>
                    <p className="text-gray-400">Detailed session analytics coming soon.</p>
                </div>
            )}

            {isDetailOpen && selectedSession && (
                <SessionDetailModal
                    session={selectedSession}
                    onClose={() => setIsDetailOpen(false)}
                    onReschedule={handleSessionReschedule}
                />
            )}
        </div>
    );
};
