import { useState } from "react";
import { X, Save } from "lucide-react";
import { THEME } from "../../constants/theme";

interface CreateAllocationModalProps {
    onClose: () => void;
    onSave: (data: any) => void;
}

export const CreateAllocationModal = ({ onClose, onSave }: CreateAllocationModalProps) => {
    const [formData, setFormData] = useState({
        studentId: "",
        trainerId: "",
        courseId: "",
        scheduleMode: "WEEKDAY_DAILY",
        startDate: "",
        timeSlot: "10:00 AM",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, validation would happen here
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-[#4D2B8C]">New Allocation</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Student</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                required
                            >
                                <option value="">Select Student</option>
                                <option value="S001">Rahul Sharma</option>
                                <option value="S002">Priya Patel</option>
                                <option value="S003">Amit Singh</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Course</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                required
                            >
                                <option value="">Select Course</option>
                                <option value="C001">Mathematics 101</option>
                                <option value="C002">Science Foundation</option>
                                <option value="C003">English Literature</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Trainer (Optional)</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                            value={formData.trainerId}
                            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                        >
                            <option value="">Auto-Assign (Based on availability)</option>
                            <option value="T001">Vikram Malhotra</option>
                            <option value="T002">Sneha Gupta</option>
                            <option value="T003">Rajesh Koothrappali</option>
                        </select>
                        <p className="text-xs text-gray-400">If left blank, system will attempt auto-assignment.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                            <input
                                type="date"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Time Slot</label>
                            <select
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                                value={formData.timeSlot}
                                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                            >
                                <option>09:00 AM</option>
                                <option>10:00 AM</option>
                                <option>11:00 AM</option>
                                <option>02:00 PM</option>
                                <option>04:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Frequency</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer has-[:checked]:border-[#4D2B8C] has-[:checked]:bg-[#4D2B8C]/5 transition">
                                <input
                                    type="radio"
                                    name="scheduleMode"
                                    value="WEEKDAY_DAILY"
                                    checked={formData.scheduleMode === "WEEKDAY_DAILY"}
                                    onChange={(e) => setFormData({ ...formData, scheduleMode: e.target.value })}
                                    className="text-[#4D2B8C] focus:ring-[#4D2B8C]"
                                />
                                <span className="text-sm font-medium">Weekday Daily</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl flex-1 cursor-pointer has-[:checked]:border-[#4D2B8C] has-[:checked]:bg-[#4D2B8C]/5 transition">
                                <input
                                    type="radio"
                                    name="scheduleMode"
                                    value="SUNDAY_ONLY"
                                    checked={formData.scheduleMode === "SUNDAY_ONLY"}
                                    onChange={(e) => setFormData({ ...formData, scheduleMode: e.target.value })}
                                    className="text-[#4D2B8C] focus:ring-[#4D2B8C]"
                                />
                                <span className="text-sm font-medium">Sunday Only</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-[#4D2B8C] text-white font-bold rounded-xl hover:bg-[#3d2270] transition shadow-lg shadow-[#4D2B8C]/20 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Create Allocation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
