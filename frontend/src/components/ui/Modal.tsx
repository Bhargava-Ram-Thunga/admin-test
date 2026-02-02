import React from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 border border-gray-200 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-[var(--text-heading)]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F5F7FA] rounded-xl transition-colors text-[#5459AC]"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};
