import { useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "warning" | "error" | string;
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300 ${type === "success"
                ? "bg-[#6DC3BB] text-white"
                : type === "warning"
                    ? "bg-[#F2AEBB] text-[#C04C63]"
                    : "bg-white text-[#393D7E]"
                }`}
        >
            {type === "success" ? (
                <CheckCircle size={18} />
            ) : (
                <AlertCircle size={18} />
            )}
            <span className="font-bold text-sm">{message}</span>
        </div>
    );
};
