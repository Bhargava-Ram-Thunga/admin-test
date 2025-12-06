import { Users, DollarSign, TrendingUp } from "lucide-react";
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import { checkPermission } from "../utils/helpers";
import { REVENUE_DATA } from "../data/mockData";
import { THEME } from "../constants/theme";

export const DashboardView = ({ user, students }: any) => {
    const scopedStudents = students.filter((s: any) =>
        checkPermission(user, s.regionId)
    );
    const totalRev = scopedStudents.reduce(
        (acc: any, curr: any) => acc + parseInt(curr.amount.replace(/[^0-9]/g, "")),
        0
    );
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#393D7E]">Dashboard</h1>
                    <p className="text-[#5459AC] mt-1">Overview for {user.role}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    value={scopedStudents.length}
                    label="Total Students"
                    trend="+12%"
                    colorClass="bg-gradient-to-br from-white to-[#E0F2F1] border-[#6DC3BB]/20"
                    iconBgClass="bg-[#6DC3BB] shadow-lg shadow-[#6DC3BB]/40"
                    trendClass="bg-[#6DC3BB] text-white"
                />
                <StatCard
                    icon={DollarSign}
                    value={`₹ ${totalRev.toLocaleString("en-IN")}`}
                    label="Total Revenue"
                    trend="+8%"
                    colorClass="bg-gradient-to-br from-white to-[#E8EAF6] border-[#5459AC]/20"
                    iconBgClass="bg-[#5459AC] shadow-lg shadow-[#5459AC]/40"
                    trendClass="bg-[#6DC3BB] text-white"
                />
                <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-[#393D7E] to-[#5459AC] text-white relative overflow-hidden border-none shadow-xl shadow-[#393D7E]/20">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-1">Trainer Utilization</h3>
                        <p className="text-[#6DC3BB] text-sm mb-4">
                            85% of trainers are currently active in sessions.
                        </p>
                        <div className="flex gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <img
                                        key={i}
                                        src={`https://i.pravatar.cc/100?u=t${i}`}
                                        className="w-8 h-8 rounded-full border-2 border-[#393D7E]"
                                    />
                                ))}
                            </div>
                            <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm transition text-[#F2AEBB]">
                                View Details
                            </button>
                        </div>
                    </div>
                    <TrendingUp
                        size={120}
                        className="absolute -right-4 -bottom-4 text-white/5"
                    />
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-[#393D7E]">
                            Revenue Analytics
                        </h3>
                        <select className="bg-[#F5F7FA] border-none text-xs font-bold text-[#5459AC] rounded-lg py-1 px-2 outline-none cursor-pointer">
                            <option>This Week</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6DC3BB" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6DC3BB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                    formatter={(value: any) => `₹ ${value.toLocaleString("en-IN")}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6DC3BB"
                                    strokeWidth={3}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold text-lg text-[#393D7E] mb-6">
                        Student Status
                    </h3>
                    <div className="h-48 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Active", value: 65 },
                                        { name: "Dropped", value: 10 },
                                        { name: "Completed", value: 25 },
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill={THEME.teal} /> <Cell fill={THEME.pink} />{" "}
                                    <Cell fill={THEME.indigo} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-[#5459AC]">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#6DC3BB]"></div>Active
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#F2AEBB]"></div>Dropped
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[#5459AC]"></div>Done
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
