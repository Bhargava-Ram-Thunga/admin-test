import { useState } from "react";
import { Plus } from "lucide-react";
import AnalyticsCard from "../components/dashboard/AnalyticsCard";
import { THEME, CHART_COLORS } from "../constants/theme";

export const AnalyticsView = () => {
    const [charts, setCharts] = useState([
        {
            id: 1,
            title: "Enrollment Trends",
            type: "area",
            xAxisMode: "time",
            timeGranularity: "monthly",
            regionType: "State",
            metric: "students",
            color: THEME.navy,
        },
        {
            id: 2,
            title: "Regional Revenue",
            type: "bar",
            xAxisMode: "region",
            timeGranularity: "monthly",
            regionType: "District",
            metric: "revenue",
            color: THEME.teal,
        },
    ]);
    const addChart = () => {
        const newId = Date.now();
        const randomColor = CHART_COLORS[charts.length % CHART_COLORS.length];
        setCharts([
            {
                id: newId,
                title: "New Analysis",
                type: "bar",
                xAxisMode: "time",
                timeGranularity: "monthly",
                regionType: "State",
                metric: "students",
                color: randomColor,
            } as any,
            ...charts,
        ]);
    };
    const removeChart = (id: any) => setCharts(charts.filter((c) => c.id !== id));
    const updateChart = (id: any, updates: any) =>
        setCharts(charts.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-[#393D7E]/10 shadow-lg shadow-[#393D7E]/5 gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#393D7E]">
                        Analytics Workspace
                    </h1>
                    <p className="text-[#5459AC] text-base mt-2">
                        Create, compare, and analyze multiple datasets dynamically.
                    </p>
                </div>
                <button
                    onClick={addChart}
                    className="bg-[#393D7E] text-white px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 hover:bg-[#5459AC] transition shadow-lg shadow-[#393D7E]/20"
                >
                    <Plus size={20} /> Add Comparison Graph
                </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {charts.map((chart) => (
                    <AnalyticsCard
                        key={chart.id}
                        config={chart}
                        onUpdate={updateChart}
                        onRemove={removeChart}
                    />
                ))}
                {charts.length === 0 && (
                    <div
                        onClick={addChart}
                        className="h-[480px] border-2 border-dashed border-[#393D7E]/20 rounded-3xl flex flex-col items-center justify-center text-[#5459AC] cursor-pointer hover:border-[#6DC3BB] hover:bg-white transition-all bg-white/50"
                    >
                        <div className="p-4 bg-[#F2AEBB]/20 rounded-full mb-4">
                            <Plus size={32} className="text-[#393D7E]" />
                        </div>
                        <h3 className="font-bold text-lg text-[#393D7E]">
                            Add your first graph
                        </h3>
                    </div>
                )}
            </div>
        </div>
    );
};
