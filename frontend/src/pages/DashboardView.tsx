// Dashboard View Component

import { useState, useMemo } from "react";
import {
  Users,
  MonitorPlay,
  Calendar as CalendarIcon,
  BookOpen,
  MapPin,
  TrendingUp
} from "lucide-react";
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
  Legend,
} from "recharts";
import { StatCard } from "../components/ui/StatCard";
import { Card } from "../components/ui/Card";
import {
  INITIAL_STUDENTS,
  MOCK_TRAINERS,
  MOCK_SESSIONS,
  MOCK_CALENDAR_SESSIONS,
  MOCK_GROWTH_DATA,
  MOCK_REGION_LEVELS_DATA,
  INITIAL_USERS
} from "../data/mockData";
import { THEME } from "../constants/theme";
import type { User, Student } from "../types";

interface DashboardViewProps {
  user: User;
  students: Student[];
}

export const DashboardView = ({ user }: DashboardViewProps) => { // Removed unused students prop to fix lint
  // --- 1. KPI Summary Cards Logic ---
  const kpiData = useMemo(() => {
    // Unique courses count
    const courses = new Set(INITIAL_STUDENTS.map(s => s.course)).size;
    return [
      {
        label: "Total Students",
        value: INITIAL_STUDENTS.length,
        icon: Users,
        trend: "+12%",
        colorClass: "bg-white border-[#F39EB6]/20 shadow-lg shadow-[#4D2B8C]/5",
        iconBgClass: "bg-[#4D2B8C] shadow-lg shadow-[#4D2B8C]/30 text-white",
        trendClass: "bg-[#F39EB6]/20 text-[#4D2B8C]",
      },
      {
        label: "Total Instructors",
        value: MOCK_TRAINERS.length,
        icon: MonitorPlay, // Using MonitorPlay as proxy for Instructor/Session related
        trend: "+5%",
        colorClass: "bg-white border-[#F39EB6]/20 shadow-lg shadow-[#4D2B8C]/5",
        iconBgClass: "bg-[#F39EB6] shadow-lg shadow-[#F39EB6]/30 text-white",
        trendClass: "bg-[#F39EB6]/20 text-[#4D2B8C]",
      },
      {
        label: "Total Sessions",
        value: MOCK_SESSIONS.length,
        icon: CalendarIcon,
        trend: "+8%",
        colorClass: "bg-white border-[#F39EB6]/20 shadow-lg shadow-[#4D2B8C]/5",
        iconBgClass: "bg-[#F39EB6] shadow-lg shadow-[#F39EB6]/30 text-white",
        trendClass: "bg-[#F39EB6]/20 text-[#4D2B8C]",
      },
      {
        label: "Total Courses",
        value: courses,
        icon: BookOpen,
        trend: "+2%",
        colorClass: "bg-white border-[#F39EB6]/20 shadow-lg shadow-[#4D2B8C]/5",
        iconBgClass: "bg-[#F39EB6] shadow-lg shadow-[#F39EB6]/30 text-white",
        trendClass: "bg-[#F39EB6]/20 text-[#4D2B8C]",
      },
    ];
  }, []);

  // --- 2. Sessions Calendar Logic ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const selectedDateSessions = useMemo(() => {
    return MOCK_CALENDAR_SESSIONS.filter(
      (session) =>
        session.date.getDate() === selectedDate.getDate() &&
        session.date.getMonth() === selectedDate.getMonth() &&
        session.date.getFullYear() === selectedDate.getFullYear()
    );
  }, [selectedDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const hasSession = (date: Date) => {
    return MOCK_CALENDAR_SESSIONS.some(s => isSameDay(s.date, date));
  }

  // --- 3. Growth Line Chart Logic ---
  const [growthMetric, setGrowthMetric] = useState<"students" | "instructors">("students");
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");

  const chartData = useMemo(() => {
    return MOCK_GROWTH_DATA[timeRange];
  }, [timeRange]);

  // --- 4. Region Distribution Logic ---
  const [hierarchyLevel, setHierarchyLevel] = useState("District");
  const [regionMetric, setRegionMetric] = useState<"students" | "sessions">("students");

  // Filter functionality to be added later or just mocked for now
  const regionData = useMemo(() => {
    // Return specific mock data for the selected level, default to empty array if not found
    // Using defensive copy with slice() to avoid mutating original
    const data = MOCK_REGION_LEVELS_DATA[hierarchyLevel] || [];
    return [...data].sort((a, b) => b[regionMetric] - a[regionMetric]);
  }, [hierarchyLevel, regionMetric]);



  return (
    <div className="space-y-8 pb-10">

      {/* 1. KPI Summary Cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi, idx) => (
            <StatCard
              key={idx}
              icon={kpi.icon}
              value={kpi.value}
              label={kpi.label}
              trend={kpi.trend}
              colorClass={kpi.colorClass}
              iconBgClass={kpi.iconBgClass}
              trendClass={kpi.trendClass}
            />
          ))}
        </div>
      </section>

      {/* 2. Sessions Calendar + Detail Table */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-lg text-[#4D2B8C] mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Session Calendar
          </h3>
          {/* Simple Custom Calendar Grid */}
          <div className="bg-[#F0F7FF] rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-1 hover:bg-[#4D2B8C]/10 rounded">&lt;</button>
              <span className="font-bold text-[#4D2B8C]">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-1 hover:bg-[#4D2B8C]/10 rounded">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="font-medium text-[#4D2B8C]/60 text-xs py-2">{d}</div>
              ))}
              {/* Padding for start of month - simplified for demo */}
              {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10"></div>
              ))}
              {daysInMonth.map((date, i) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const hasEvent = hasSession(date);

                return (
                  <button
                    key={i}
                    onClick={() => handleDateClick(date)}
                    className={`
                                    h-10 rounded-lg flex flex-col items-center justify-center transition border
                                    ${isSelected ? 'bg-[#4D2B8C] text-white border-[#4D2B8C]' : 'bg-white hover:bg-white/80 border-transparent'}
                                    ${isToday && !isSelected ? 'border-[#F39EB6] text-[#4D2B8C] font-bold' : ''}
                                `}
                  >
                    <span>{date.getDate()}</span>
                    {hasEvent && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-[#F39EB6]' : 'bg-[#4D2B8C]'}`}></div>}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Detail Table Side Panel */}
        <Card className="h-full flex flex-col">
          <h3 className="font-bold text-lg text-[#4D2B8C] mb-4">
            Session Details <span className="text-sm font-normal text-gray-500">({selectedDate.toLocaleDateString()})</span>
          </h3>
          <div className="flex-1 overflow-auto">
            {selectedDateSessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>No sessions on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateSessions.map(session => (
                  <div key={session.id} className="p-3 bg-[#F0F7FF] rounded-lg border border-[#4D2B8C]/10 hover:border-[#4D2B8C]/30 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#4D2B8C] text-sm">{session.courseName}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${session.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        session.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="w-3 h-3 text-[#4D2B8C]/70" /> {session.trainerName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-[#4D2B8C]/70" /> {session.studentName}
                      </div>
                      <div className="flex items-center gap-2 text-[#4D2B8C] font-medium mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F39EB6]"></div> {session.time} ({session.duration}m)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* 3. Growth Line Chart */}
      <section>
        <Card>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h3 className="font-bold text-lg text-[#4D2B8C] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Growth Analytics
              </h3>
              <p className="text-xs text-gray-500">Track students and instructors joining over time</p>
            </div>
            <div className="flex gap-4">
              {/* Metric Toggle */}
              <div className="bg-[#F0F7FF] p-1 rounded-lg flex gap-1">
                <button
                  onClick={() => setGrowthMetric("students")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${growthMetric === 'students' ? 'bg-[#4D2B8C] text-white shadow-md' : 'text-[#4D2B8C]/60 hover:text-[#4D2B8C]'}`}
                >
                  Students
                </button>
                <button
                  onClick={() => setGrowthMetric("instructors")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${growthMetric === 'instructors' ? 'bg-[#4D2B8C] text-white shadow-md' : 'text-[#4D2B8C]/60 hover:text-[#4D2B8C]'}`}
                >
                  Instructors
                </button>
              </div>
              {/* Time Range Toggle */}
              <div className="bg-[#F0F7FF] p-1 rounded-lg flex gap-1">
                {(['daily', 'weekly', 'monthly'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition ${timeRange === range ? 'bg-[#F39EB6] text-white shadow-md' : 'text-[#4D2B8C]/60 hover:text-[#4D2B8C]'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#4D2B8C', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey={growthMetric}
                  stroke="#4D2B8C"
                  strokeWidth={3}
                  dot={{ fill: '#4D2B8C', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#F39EB6', stroke: '#fff' }}
                  name={growthMetric === 'students' ? "Students Joined" : "Instructors Joined"}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* 4. Region / Hierarchy Distribution Bar Graph */}
      <section>
        <Card>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h3 className="font-bold text-lg text-[#4D2B8C] flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Regional Distribution
              </h3>
              <p className="text-xs text-gray-500">Distribution by hierarchy level</p>
            </div>
            <div className="flex gap-4">
              <select
                value={hierarchyLevel}
                onChange={(e) => setHierarchyLevel(e.target.value)}
                className="bg-[#F0F7FF] border-none text-xs font-bold text-[#4D2B8C] rounded-lg py-2 px-3 outline-none cursor-pointer"
              >
                <option value="State">State Level</option>
                <option value="District">District Level</option>
                <option value="Division">Division Level</option>
                <option value="Constituency">Constituency Level</option>
                <option value="Mandal">Mandal Level</option>
                <option value="Village">Village Level</option>
              </select>

              <select
                value={regionMetric}
                onChange={(e) => setRegionMetric(e.target.value as any)}
                className="bg-[#F0F7FF] border-none text-xs font-bold text-[#4D2B8C] rounded-lg py-2 px-3 outline-none cursor-pointer"
              >
                <option value="students">Number of Students</option>
                <option value="sessions">Number of Sessions</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4D2B8C', fontSize: 12, fontWeight: 500 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#F0F7FF' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar
                  dataKey={regionMetric}
                  fill="#4D2B8C"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  name={regionMetric === 'students' ? "Student Count" : "Session Count"}
                >
                  {/* Gradient or pattern could be applied here */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

    </div>
  );
};
