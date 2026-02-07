import { useState } from "react";
import { X, RefreshCw } from "lucide-react";

interface ReallocationModalProps {
    allocation: { id: string; studentName: string; trainerName?: string | null };
    onClose: () => void;
    onConfirm: (data: { allocationId: string; newTrainerId: string; reason: string }) => void;
    /** List of trainers for dropdown (same as CreateAllocationModal). */
    trainers?: { id: string; name: string }[];
}

export const ReallocationModal = ({ allocation, onClose, onConfirm, trainers = [] }: ReallocationModalProps) => {
    const [newTrainerId, setNewTrainerId] = useState("");
    const [reason, setReason] = useState("Scheduling Conflict");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ allocationId: allocation.id, newTrainerId, reason });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Reallocate Trainer</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                        <p className="text-sm text-blue-800 mb-1">Current Assignment</p>
                        <div className="flex justify-between items-center font-medium">
                            <span>{allocation.trainerName || "Unassigned"}</span>
                            <span className="text-blue-600">→</span>
                            <span>{allocation.studentName}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">New Trainer</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                            value={newTrainerId}
                            onChange={(e) => setNewTrainerId(e.target.value)}
                            required
                        >
                            <option value="">Select New Trainer</option>
                            {trainers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                            {trainers.length === 0 && <option value="" disabled>No trainers loaded</option>}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Reason for Change</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#4D2B8C] transition"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option>Scheduling Conflict</option>
                            <option>Trainer Unavailable</option>
                            <option>Student Request</option>
                            <option>Performance Issue</option>
                            <option>Other</option>
                        </select>
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
                            <RefreshCw size={18} />
                            Confirm Change
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
