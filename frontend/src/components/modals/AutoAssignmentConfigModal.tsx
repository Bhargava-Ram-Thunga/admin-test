import { useState } from "react";
import { X, Save, Settings } from "lucide-react";

interface AutoAssignmentConfigModalProps {
    onClose: () => void;
    onSave: (config: any) => void;
}

export const AutoAssignmentConfigModal = ({ onClose, onSave }: AutoAssignmentConfigModalProps) => {
    const [config, setConfig] = useState({
        proximityRadius: 5,
        maxStudentsPerTrainer: 20,
        prioritizeSubjectMatch: true,
        prioritizeExperience: false,
        autoRetryFailed: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(config);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg text-[var(--color-primary)]">
                            <Settings size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--text-heading)]">Auto-Assignment Logic</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-[var(--text-muted)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-bold text-[var(--text-body)]">Proximity Radius (km)</label>
                                <span className="text-sm font-bold text-[var(--color-primary)]">{config.proximityRadius} km</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={config.proximityRadius}
                                onChange={(e) => setConfig({ ...config, proximityRadius: parseInt(e.target.value) })}
                                className="w-full accent-[var(--color-primary)]"
                            />
                            <p className="text-xs text-[var(--text-muted)] mt-1">Maximum distance between student and trainer.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Max Students/Trainer</label>
                                <input
                                    type="number"
                                    value={config.maxStudentsPerTrainer}
                                    onChange={(e) => setConfig({ ...config, maxStudentsPerTrainer: parseInt(e.target.value) })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={config.prioritizeSubjectMatch}
                                    onChange={(e) => setConfig({ ...config, prioritizeSubjectMatch: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <div>
                                    <p className="font-bold text-[var(--text-body)] group-hover:text-[var(--color-primary)] transition">Prioritize Subject Specialization</p>
                                    <p className="text-xs text-[var(--text-muted)]">Match trainers with specific domain expertise first.</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={config.prioritizeExperience}
                                    onChange={(e) => setConfig({ ...config, prioritizeExperience: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <div>
                                    <p className="font-bold text-[var(--text-body)] group-hover:text-[var(--color-primary)] transition">Prioritize Senior Trainers</p>
                                    <p className="text-xs text-[var(--text-muted)]">Assign higher rated trainers first.</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={config.autoRetryFailed}
                                    onChange={(e) => setConfig({ ...config, autoRetryFailed: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <div>
                                    <p className="font-bold text-[var(--text-body)] group-hover:text-[var(--color-primary)] transition">Auto-Retry Failed Assignments</p>
                                    <p className="text-xs text-[var(--text-muted)]">System will retry once every 24 hours.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100">
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
                            <Save size={18} />
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
