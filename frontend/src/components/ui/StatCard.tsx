import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    trend?: string;
    colorClass: string;
    iconBgClass: string;
    trendClass: string;
    className?: string;
}

export const StatCard = ({
    icon: Icon,
    value,
    label,
    trend,
    iconBgClass,
    trendClass,
    className = "",
}: StatCardProps) => (
    <div
        className={`p-5 rounded-2xl border border-gray-200 bg-[var(--color-bg-surface)] relative overflow-hidden ${className}`}
    >
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-3 rounded-xl text-white ${iconBgClass}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${trendClass}`}
                    >
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-heading)]">{value}</h3>
            <p className="text-sm font-medium text-[var(--text-muted)] mt-1">{label}</p>
        </div>
    </div>
);
