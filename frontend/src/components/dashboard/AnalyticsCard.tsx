import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Activity,
  X,
  BarChart2,
  Calendar,
  MapPin,
  Layers,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Card } from "../ui/Card";
import { CustomSelect } from "../ui/CustomSelect";
import { CHART_COLORS } from "../../constants/theme";
import { generateAnalyticsData } from "../../utils/helpers";
import type { ChartConfig, ChartDataPoint } from "../../types";

interface AnalyticsCardProps {
  config: ChartConfig;
  onUpdate: (id: number, updates: Partial<ChartConfig>) => void;
  onRemove: (id: number) => void;
}

const AnalyticsCard = ({ config, onUpdate, onRemove }: AnalyticsCardProps) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData(generateAnalyticsData(config));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [
    config.type,
    config.xAxisMode,
    config.timeGranularity,
    config.regionType,
    config.metric,
  ]);

  const renderChart = () => {
    if (loading)
      return (
        <div className="h-full w-full flex flex-col items-center justify-center text-[#5459AC]/50 gap-2">
          <RefreshCw className="animate-spin" size={24} />
          <span className="text-xs font-bold">Updating Data...</span>
        </div>
      );
    if (data.length === 0)
      return (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
          No data available
        </div>
      );
    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (config.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#5459AC" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#5459AC" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={3}
                dot={{ r: 4, fill: config.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#5459AC" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#5459AC" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                cursor={{ fill: "#F8F9FA" }}
              />
              <Bar dataKey="value" fill={config.color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient
                  id={`grad${config.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={config.color}
                    stopOpacity={0.3}
                  />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#5459AC" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#5459AC" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={3}
                fill={`url(#grad${config.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={config.type === "donut" ? 60 : 0}
                outerRadius={80}
                paddingAngle={config.type === "donut" ? 5 : 0}
                dataKey="value"
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", color: "#393D7E" }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col h-[480px] group relative overflow-visible transition-all hover:shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F2AEBB] rounded-xl text-white shadow-md shadow-[#F2AEBB]/40">
            <Activity size={18} />
          </div>
          <input
            value={config.title}
            onChange={(e) => onUpdate(config.id, { title: e.target.value })}
            className="font-bold text-[#393D7E] bg-transparent border-b border-transparent hover:border-[#F2AEBB] outline-none focus:border-[#5459AC] w-full max-w-[200px] transition-all"
          />
        </div>
        <button
          onClick={() => onRemove(config.id)}
          className="text-[#393D7E]/30 hover:text-[#F2AEBB] p-2 rounded-lg transition-all"
        >
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-[#F5F7FA] rounded-2xl border border-[#393D7E]/5">
        <CustomSelect
          label="Graph Type"
          value={config.type}
          onChange={(val) =>
            onUpdate(config.id, { type: val as ChartConfig["type"] })
          }
          options={["bar", "line", "area", "pie", "donut"]}
          icon={BarChart2}
        />
        <CustomSelect
          label="X-Axis Mode"
          value={config.xAxisMode}
          onChange={(val) =>
            onUpdate(config.id, { xAxisMode: val as ChartConfig["xAxisMode"] })
          }
          options={["time", "region"]}
          icon={config.xAxisMode === "time" ? Calendar : MapPin}
        />
        {config.xAxisMode === "time" ? (
          <CustomSelect
            label="Granularity"
            value={config.timeGranularity || "monthly"}
            onChange={(val) =>
              onUpdate(config.id, {
                timeGranularity: val as ChartConfig["timeGranularity"],
              })
            }
            options={["daily", "weekly", "monthly", "yearly"]}
          />
        ) : (
          <CustomSelect
            label="Region Level"
            value={config.regionType || ""}
            onChange={(val) => onUpdate(config.id, { regionType: val })}
            options={[
              "State",
              "District",
              "Division",
              "Constituency",
              "Mandal",
            ]}
            icon={Layers}
          />
        )}
        <CustomSelect
          label="Metric"
          value={config.metric}
          onChange={(val) =>
            onUpdate(config.id, { metric: val as ChartConfig["metric"] })
          }
          options={["students", "revenue", "teachers", "attendance", "growth"]}
          icon={TrendingUp}
        />
      </div>
      <div className="flex-1 min-h-0 relative w-full">{renderChart()}</div>
    </Card>
  );
};

export default AnalyticsCard;
