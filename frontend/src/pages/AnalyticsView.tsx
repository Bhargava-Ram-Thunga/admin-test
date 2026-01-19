import { useState } from "react";
import { Plus } from "lucide-react";
import AnalyticsCard from "../components/dashboard/AnalyticsCard";
import { THEME, CHART_COLORS } from "../constants/theme";
import type { ChartConfig, Student, Trainer, User } from "../types";

interface AnalyticsViewProps {
  user: User;
  students: Student[];
  trainers: Trainer[];
}

export const AnalyticsView = ({ }: AnalyticsViewProps) => {
  // Note: props user, students, trainers are passed but unused in the original code,
  // so we keep the interface but destructure safely to avoid unused warnings or linter errors if strict.
  // In original code: const AnalyticsView = () => { ... } so it ignored props entirely.
  // We match that behavior.

  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: 1,
      title: "Enrollment Trends",
      type: "area",
      xAxisMode: "time",
      timeGranularity: "monthly",
      regionType: "State",
      metric: "students",
      color: THEME.colors.primary.navy,
    },
    {
      id: 2,
      title: "Regional Revenue",
      type: "bar",
      xAxisMode: "region",
      timeGranularity: "monthly",
      regionType: "District",
      metric: "revenue",
      color: THEME.colors.primary.teal,
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
      } as ChartConfig,
      ...charts,
    ]);
  };
  const removeChart = (id: number) =>
    setCharts(charts.filter((c) => c.id !== id));
  const updateChart = (id: number, updates: Partial<ChartConfig>) =>
    setCharts(
      charts.map((c) =>
        c.id === id ? ({ ...c, ...updates } as ChartConfig) : c
      )
    );
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl border border-[#4D2B8C]/10 shadow-lg shadow-[#4D2B8C]/5 gap-8">
        <div>
          <h1 className="text-3xl font-bold text-[#4D2B8C]">
            Analytics Workspace
          </h1>
          <p className="text-[#4D2B8C] text-base mt-2">
            Create, compare, and analyze multiple datasets dynamically.
          </p>
        </div>
        <button
          onClick={addChart}
          className="bg-[#4D2B8C] text-white px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 hover:bg-[#F39EB6] transition shadow-lg shadow-[#4D2B8C]/20"
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
            className="h-[480px] border-2 border-dashed border-[#4D2B8C]/20 rounded-3xl flex flex-col items-center justify-center text-[#4D2B8C] cursor-pointer hover:border-[#F39EB6] hover:bg-white transition-all bg-white/50"
          >
            <div className="p-4 bg-[#F39EB6]/20 rounded-full mb-4">
              <Plus size={32} className="text-[#4D2B8C]" />
            </div>
            <h3 className="font-bold text-lg text-[#4D2B8C]">
              Add your first graph
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};
