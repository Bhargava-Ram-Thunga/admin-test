import { useState } from "react";
import { X, RefreshCw } from "lucide-react";

interface ReallocationModalProps {
    allocation: any;
    onClose: () => void;
    onConfirm: (data: any) => void;
}

export const ReallocationModal = ({ allocation, onClose, onConfirm }: ReallocationModalProps) => {
    const [newTrainerId, setNewTrainerId] = useState("");
    const [reason, setReason] = useState("Scheduling Conflict");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({ allocationId: allocation.id, newTrainerId, reason });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-[var(--text-heading)]">Reallocate Trainer</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-[var(--text-muted)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-[var(--color-primary)]/5 p-4 rounded-xl border border-[var(--color-primary)]/10 mb-4">
                        <p className="text-sm text-[var(--color-primary)] mb-1">Current Assignment</p>
                        <div className="flex justify-between items-center font-medium">
                            <span>{allocation.trainerName || "Unassigned"}</span>
                            <span className="text-[var(--text-muted)]">→</span>
                            <span>{allocation.studentName}</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">New Trainer</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] transition"
                            value={newTrainerId}
                            onChange={(e) => setNewTrainerId(e.target.value)}
                            required
                        >
                            <option value="">Select New Trainer</option>
                            <option value="T001">Vikram Malhotra</option>
                            <option value="T002">Sneha Gupta</option>
                            <option value="T003">Rajesh Koothrappali</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Reason for Change</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] transition"
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
                            className="flex-1 py-3 text-[var(--text-muted)] font-bold hover:bg-gray-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-[var(--color-primary)]/90 transition shadow-none border border-transparent flex items-center justify-center gap-2"
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
