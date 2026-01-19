import { ChevronDown, type LucideIcon } from "lucide-react";

interface CustomSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    icon?: LucideIcon;
    disabled?: boolean;
    placeholder?: string;
}

export const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    icon: Icon,
    disabled,
    placeholder,
}: CustomSelectProps) => (
    <div className="flex flex-col gap-1 w-full min-w-[140px]">
        <label
            className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${disabled ? "text-gray-300" : "text-[#4D2B8C]/50"
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
                        : "text-[#4D2B8C]/40 group-hover:text-[#F39EB6]"
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
                        : "border-[#4D2B8C]/10 text-[#4D2B8C] hover:bg-[#F5F7FA] focus:ring-2 focus:ring-[#F39EB6]"
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
                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${disabled ? "text-gray-300" : "text-[#4D2B8C]/40"
                    }`}
            />
        </div>
    </div>
);
