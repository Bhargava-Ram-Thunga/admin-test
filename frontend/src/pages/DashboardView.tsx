/** Dashboard: Kodingcaravan admin — stats, revenue chart, today's class, notice board, calendar, events, leave requests. */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  DollarSign,
  Share2,
  UserPlus,
  Calendar,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../components/ui/Card";
import type { User } from "../types";
import { getData } from "../api/client";
import { ADMIN_API } from "../api/client";
import type { DemandAnalyticsApi } from "../api/types";

interface DashboardViewProps {
  user: User;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const DashboardView = ({ user }: DashboardViewProps) => {
  const [studentTotal, setStudentTotal] = useState<number | null>(null);
  const [trainerTotal, setTrainerTotal] = useState<number | null>(null);
  const [demandData, setDemandData] = useState<DemandAnalyticsApi | null>(null);
  const [allocationPending, setAllocationPending] = useState<number | null>(null);
  const [allocationActive, setAllocationActive] = useState<number | null>(null);
  const [pendingTrainerApps, setPendingTrainerApps] = useState<number | null>(null);
  const [pendingReschedules, setPendingReschedules] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<{ amountCents?: number; status?: string; createdAt?: string }[]>([]);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        studentsRes,
        trainersRes,
        analyticsRes,
        allocationsRes,
        approvalsRes,
        reschedulesRes,
        txRes,
        revenueRes,
        coursesRes,
      ] = await Promise.allSettled([
        getData<{ data: unknown[]; total: number }>("/api/v1/students?limit=1"),
        getData<{ data: unknown[]; total: number }>("/api/v1/trainers?limit=1"),
        getData<DemandAnalyticsApi>(`${ADMIN_API}/demand/analytics`),
        getData<{ id: string; status: string }[]>(`${ADMIN_API}/allocations?limit=500`),
        getData<unknown[]>(`${ADMIN_API}/trainers/approvals?status=pending&limit=500`),
        getData<unknown[]>(`${ADMIN_API}/reschedule?status=pending&limit=500`),
        getData<{ amountCents?: number; status?: string; createdAt?: string }[]>(`${ADMIN_API}/finance/transactions?limit=500`).catch(() => []),
        getData<{ totalRevenue?: number }>(`${ADMIN_API}/finance/revenue-summary`).catch(() => null),
        getData<{ courses?: unknown[]; total?: number }>("/api/courses?limit=500").catch(() => ({ courses: [], total: 0 })),
      ]);

      if (studentsRes.status === "fulfilled" && studentsRes.value?.total != null)
        setStudentTotal(studentsRes.value.total);
      if (trainersRes.status === "fulfilled" && trainersRes.value?.total != null)
        setTrainerTotal(trainersRes.value.total);
      if (analyticsRes.status === "fulfilled" && analyticsRes.value) setDemandData(analyticsRes.value);
      if (allocationsRes.status === "fulfilled" && Array.isArray(allocationsRes.value)) {
        const list = allocationsRes.value;
        setAllocationPending(list.filter((a) => a.status === "pending").length);
        setAllocationActive(
          list.filter((a) => a.status === "active" || a.status === "approved").length
        );
      }
      if (approvalsRes.status === "fulfilled" && Array.isArray(approvalsRes.value))
        setPendingTrainerApps(approvalsRes.value.length);
      if (reschedulesRes.status === "fulfilled" && Array.isArray(reschedulesRes.value))
        setPendingReschedules(reschedulesRes.value.length);
      if (txRes.status === "fulfilled" && Array.isArray(txRes.value)) setTransactions(txRes.value);
      else setTransactions([]);
      if (revenueRes.status === "fulfilled" && revenueRes.value?.totalRevenue != null)
        setTotalRevenue(revenueRes.value.totalRevenue);
      else {
        const list = txRes.status === "fulfilled" && Array.isArray(txRes.value) ? txRes.value : [];
        const sum = list
          .filter((t) => t.status === "succeeded")
          .reduce((s, t) => s + (Number(t.amountCents) || 0) / 100, 0);
        setTotalRevenue(list.length ? sum : null);
      }
      if (coursesRes.status === "fulfilled" && coursesRes.value != null) {
        const total = (coursesRes.value as { total?: number }).total;
        const courses = (coursesRes.value as { courses?: unknown[] }).courses;
        setCourseCount(typeof total === "number" ? total : Array.isArray(courses) ? courses.length : null);
      } else setCourseCount(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Revenue bar chart: real monthly revenue from transactions (group by month)
  const revenueChartData = (() => {
    const succeeded = transactions.filter((t) => t.status === "succeeded");
    const byMonth = new Map<string, number>();
    MONTHS.forEach((name, i) => byMonth.set(name, 0));
    const now = new Date();
    const currentYear = now.getFullYear();
    for (const t of succeeded) {
      const dateStr = t.createdAt;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      if (d.getFullYear() !== currentYear) continue;
      const name = MONTHS[d.getMonth()];
      const amount = (Number(t.amountCents) || 0) / 100;
      byMonth.set(name, (byMonth.get(name) || 0) + amount);
    }
    return MONTHS.map((name) => ({ name, value: byMonth.get(name) || 0 }));
  })();

  const enrolledCourses = allocationActive ?? 0;
  const totalCourses = courseCount ?? demandData?.courses?.length ?? 0;

  const todayClassItems = [
    { type: "Emergency leave", date: "10/10/25", status: "Pending" as const },
    { type: "Medical Leave", date: "10/10/25", status: "Pending" as const },
    { type: "Now Well", date: "09/10/25", status: "Accepted" as const },
    { type: "Medical Leave", date: "08/10/25", status: "Pending" as const },
    { type: "Now Well", date: "07/10/25", status: "Accepted" as const },
  ];

  const noticeItems = [
    { name: "Admin", text: "Lorem Ipsum is simply dummy text of the printing and typesetting.", date: "25 Jan 2026", avatar: "A" },
    { name: "Kathryn Murphy", text: "Lorem Ipsum is simply dummy text of the printing and typesetting.", date: "25 Jan 2026", avatar: "K" },
    { name: "John Doe", text: "Lorem Ipsum is simply dummy text of the printing and typesetting.", date: "24 Jan 2026", avatar: "J" },
  ];

  const upcomingEvents = [
    { time: "09:00 - 09:45 AM", title: "Marketing Strategy Kickoff", lead: "Lead by Robert Fox" },
    { time: "10:00 - 10:30 AM", title: "Product Review", lead: "Lead by Jane Smith" },
    { time: "02:00 - 03:00 PM", title: "Team Sync", lead: "Lead by Mike Johnson" },
  ];

  const leaveRequests = [
    { name: "Darlene Robertson", role: "English Teacher", days: "3 Days", applyDate: "Apply on 10 April", avatar: "D" },
    { name: "Jane Cooper", role: "Math Teacher", days: "1 Day", applyDate: "Apply on 12 April", avatar: "J" },
  ];

  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = new Date();
  const isToday = (d: number) =>
    today.getDate() === d && today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = (firstDay + 6) % 7;

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          School → Manage your school, track attendance, expense, and net worth.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="relative overflow-hidden border border-slate-200 shadow-sm">
                <div className="loading-violet-skeleton rounded-xl h-24 w-full" />
              </Card>
            ))}
          </>
        ) : (
          <>
        <Card className="relative overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Enrolled Courses</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{enrolledCourses}</p>
              <p className="text-xs text-slate-500 mt-2">From last month:</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> 518%
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#EDE7F6] text-[#5E35B1]">
              <BookOpen size={22} />
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {studentTotal != null ? studentTotal.toLocaleString() : "—"}
              </p>
              <p className="text-xs text-slate-500 mt-2">From last month:</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> 55.9%
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
              <Users size={22} />
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Courses</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{totalCourses}</p>
              <p className="text-xs text-slate-500 mt-2">From last month:</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={12} /> 56.8%
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
              <BookOpen size={22} />
            </div>
          </div>
        </Card>
        <Card className="relative overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Earnings</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                ₹ {(totalRevenue ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-2">Revenue from payment service</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
              <DollarSign size={22} />
            </div>
          </div>
        </Card>
          </>
        )}
      </div>

      {/* Row: Revenue Statistics | Today's Class | Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`lg:col-span-1 border border-slate-200 shadow-sm ${loading ? "" : "bg-white"}`}>
          {loading ? (
            <div className="loading-violet-skeleton rounded-xl h-48 w-full" />
          ) : (
          <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Revenue Statistics</h3>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
            >
              This year <ChevronDown size={16} />
            </button>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ₹ {(totalRevenue ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Revenue from succeeded payments (real-time)
          </p>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `₹ ${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(value: number) => [`₹ ${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="value" fill="#94a3b8" radius={[4, 4, 0, 0]}>
                  {revenueChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.name === "Jul" ? "#5E35B1" : "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          </>
          )}
        </Card>

        <Card className="lg:col-span-1 bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Today&apos;s Class</h3>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
            >
              This year <ChevronDown size={16} />
            </button>
          </div>
          <ul className="space-y-3">
            {todayClassItems.map((item, i) => (
              <li key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-slate-800">{item.type}</p>
                  <p className="text-slate-500 text-xs">Date: {item.date}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.status === "Accepted"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-1 bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Notice Board</h3>
            <button
              type="button"
              className="p-1 rounded text-slate-400 hover:text-slate-600"
              aria-label="Options"
            >
              <MoreVertical size={18} />
            </button>
          </div>
          <ul className="space-y-4">
            {noticeItems.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {item.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{item.text}</p>
                  <p className="text-slate-400 text-xs mt-1">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Row: Calendar | Upcoming Events | Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 bg-white border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth - 1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-slate-800">
              {MONTHS[calendarMonth]} {calendarYear}
            </span>
            <button
              type="button"
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              onClick={() => setCalendarDate(new Date(calendarYear, calendarMonth + 1))}
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
            {["Sa", "Su", "Mo", "Tue", "Wed", "Thu", "Fri"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <span key={`b-${i}`} />
            ))}
            {calendarDays.map((d) => (
              <button
                key={d}
                type="button"
                className={`aspect-square rounded-full text-sm font-medium transition-colors ${
                  isToday(d)
                    ? "bg-[#5E35B1] text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1 bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Upcoming Events</h3>
          <ul className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <li key={i} className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{event.time}</p>
                  <p className="font-medium text-slate-800 text-sm mt-0.5">{event.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{event.lead}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-[#5E35B1] hover:underline"
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-1 bg-white border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Leave Requests</h3>
          <ul className="space-y-4">
            {leaveRequests.map((person, i) => (
              <li key={i} className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 shrink-0">
                  {person.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-sm">{person.name}</p>
                  <p className="text-slate-500 text-xs">{person.role}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{person.days}</p>
                  <p className="text-slate-400 text-xs">{person.applyDate}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Quick action links (pending work) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/trainers"
          className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/80 transition text-amber-900"
        >
          <div className="p-2 rounded-lg bg-amber-200">
            <UserPlus size={24} className="text-amber-800" />
          </div>
          <div>
            <p className="font-bold text-amber-900">Pending trainer applications</p>
            <p className="text-2xl font-bold text-amber-800">{pendingTrainerApps ?? "—"}</p>
          </div>
        </Link>
        <Link
          to="/allocations"
          className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/80 transition text-amber-900"
        >
          <div className="p-2 rounded-lg bg-amber-200">
            <Share2 size={24} className="text-amber-800" />
          </div>
          <div>
            <p className="font-bold text-amber-900">Pending allocations</p>
            <p className="text-2xl font-bold text-amber-800">{allocationPending ?? "—"}</p>
          </div>
        </Link>
        <Link
          to="/sessions"
          className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100/80 transition text-amber-900"
        >
          <div className="p-2 rounded-lg bg-amber-200">
            <Calendar size={24} className="text-amber-800" />
          </div>
          <div>
            <p className="font-bold text-amber-900">Pending reschedules</p>
            <p className="text-2xl font-bold text-amber-800">{pendingReschedules ?? "—"}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
