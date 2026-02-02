import { ChevronDown, type LucideIcon } from "lucide-react";

interface CustomSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    icon?: LucideIcon;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    fullWidth?: boolean;
}

export const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    icon: Icon,
    disabled,
    placeholder,
    className,
    fullWidth = true,
}: CustomSelectProps) => (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""} min-w-[140px] ${className || ""}`}>
        <label
            className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${disabled ? "text-gray-300" : "text-[var(--text-muted)]"
                }`}
        >
            {label}
        </label>
        <div className="relative group">
            {Icon && (
                <Icon
                    size={14}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${disabled
                        ? "text-gray-300"
                        : "text-[var(--color-primary)]/40 group-hover:text-[var(--color-primary)]"
                        }`}
                />
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`w-full appearance-none bg-white border text-xs font-bold rounded-xl py-2.5 ${Icon ? "pl-9" : "pl-3"
                    } pr-8 outline-none transition-all cursor-pointer shadow-sm
              ${disabled
                        ? "border-gray-100 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 text-[var(--color-primary)] hover:bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
                    }`}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={14}
                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${disabled ? "text-gray-300" : "text-[var(--color-primary)]/40"
                    }`}
            />
        </div>
    </div>
);
