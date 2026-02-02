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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-top-2 duration-300 ${type === "success"
                ? "bg-[var(--color-success)] text-white"
                : type === "warning"
                    ? "bg-[var(--color-warning)] text-white"
                    : type === "error"
                        ? "bg-[var(--color-error)] text-white"
                        : "bg-white text-[var(--text-body)]"
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
