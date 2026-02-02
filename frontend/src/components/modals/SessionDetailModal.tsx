import { X, MapPin, Camera, User, BookOpen, Clock, CalendarDays } from "lucide-react";
import type { Session } from "../../types";

interface SessionDetailModalProps {
    session: Session;
    onClose: () => void;
    onReschedule: () => void;
}

export const SessionDetailModal = ({ session, onClose, onReschedule }: SessionDetailModalProps) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="relative h-32 bg-[var(--color-primary)]">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute -bottom-8 left-8 flex items-end">
                        <div className="bg-white p-2 rounded-2xl shadow-lg">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-400">
                                {session.studentName.charAt(0)}
                            </div>
                        </div>
                        <div className="mb-8 ml-4 text-white">
                            <h2 className="text-2xl font-bold">{session.studentName}</h2>
                            <p className="opacity-80 text-sm">Session ID: {session.id}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-12 px-8 pb-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
                            <div className="flex items-center gap-2 font-semibold text-[var(--text-body)]">
                                <BookOpen size={18} className="text-[var(--color-primary)]" />
                                {session.courseName}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Trainer</p>
                            <div className="flex items-center gap-2 font-semibold text-[var(--text-body)]">
                                <User size={18} className="text-[var(--color-primary)]" />
                                {session.trainerName}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-1">Session Schedule</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-2"><CalendarDays size={16} /> {session.scheduledDate}</span>
                                    <span className="flex items-center gap-2"><Clock size={16} /> {session.scheduledTime} ({session.duration} min)</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${session.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                session.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {session.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin size={16} className={session.gpsStatus === 'Passed' ? "text-green-500" : "text-gray-400"} />
                                    <span className="text-sm font-bold text-gray-700">GPS Verification</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {session.gpsStatus === 'Passed' ? 'Location verified within 50m' : 'Pending verification'}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Camera size={16} className={session.faceStatus === 'Passed' ? "text-green-500" : "text-gray-400"} />
                                    <span className="text-sm font-bold text-gray-700">Face Match</span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {session.faceStatus === 'Passed' ? 'Identity verified successfully' : 'Pending verification'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onReschedule}
                            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-[var(--text-body)] hover:bg-gray-50 transition"
                        >
                            Reschedule Session
                        </button>
                        <button className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary)]/90 transition shadow-none border border-transparent">
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
