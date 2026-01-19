import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    trend?: string;
    colorClass: string;
    iconBgClass: string;
    trendClass: string;
}

export const StatCard = ({
    icon: Icon,
    value,
    label,
    trend,
    colorClass,
    iconBgClass,
    trendClass,
}: StatCardProps) => (
    <div
        className={`p-5 rounded-3xl shadow-md border border-white/20 relative overflow-hidden ${colorClass}`}
    >
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-3 rounded-2xl text-white ${iconBgClass}`}>
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
            <h3 className="text-3xl font-bold text-[#4D2B8C]">{value}</h3>
            <p className="text-sm font-bold text-[#4D2B8C]/70 mt-1">{label}</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#F39EB6]/10 blur-2xl"></div>
    </div>
);
