
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  MonitorPlay,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Types ---
interface User {
  name: string;
  role: string;
  avatarUrl?: string;
}

interface DashboardViewProps {
  user: User;
}

// --- Constants & Data ---
const COLORS = {
  Primary: "#6D5DFB", // Updated to match new Primary
  LightPurpleBG: "#F3F4FF",
  Green: "#22C55E",
  Red: "#EF4444",
  Orange: "#F59E0B",
  Blue: "#06B6D4", // Using Cyan as Info
  Teal: "#06B6D4", // Using Cyan
  TextDark: "#111827",
  TextMuted: "#9CA3AF",
  CardBG: "#FFFFFF",
  PageBG: "#F9FAFB",
  Border: "#E5E7EB",
};

const KPI_DATA = [
  {
    title: "Enrolled Courses",
    value: "500",
    fromLastMonth: "518%",
    isPositive: true,
    icon: BookOpen,
    iconColor: COLORS.Primary, // Purple
    bgStart: "bg-purple-100",
  },
  {
    title: "Total Students",
    value: "3,570",
    fromLastMonth: "55.9%",
    isPositive: true,
    icon: Users,
    iconColor: COLORS.Green,
    bgStart: "bg-green-100",
  },
  {
    title: "Total Courses",
    value: "30",
    fromLastMonth: "56.8%",
    isPositive: true,
    icon: MonitorPlay,
    iconColor: COLORS.Orange,
    bgStart: "bg-orange-100",
  },
  {
    title: "Total Earnings",
    value: "$50,000",
    fromLastMonth: "43.9%",
    isPositive: false,
    icon: Wallet,
    iconColor: COLORS.Teal,
    bgStart: "bg-teal-100",
  },
];

const REVENUE_DATA = [
  { name: "Jan", total: 120, collected: 80 },
  { name: "Feb", total: 150, collected: 100 },
  { name: "Mar", total: 180, collected: 120 },
  { name: "Apr", total: 220, collected: 150 },
  { name: "May", total: 250, collected: 180 },
  { name: "Jun", total: 300, collected: 200 },
  { name: "Jul", total: 450, collected: 250 },
  { name: "Aug", total: 320, collected: 210 },
  { name: "Sep", total: 280, collected: 190 },
  { name: "Oct", total: 310, collected: 220 },
  { name: "Nov", total: 350, collected: 240 },
  { name: "Dec", total: 200, collected: 150 },
];

const TODAY_CLASSES = [
  { title: "Emergency leave", date: "10/10/25", status: "Pending", statusColor: COLORS.Orange },
  { title: "Medical Leave", date: "11/12/25", status: "Pending", statusColor: COLORS.Orange },
  { title: "Now Well", date: "10/10/24", status: "Accepted", statusColor: COLORS.Green },
  { title: "Medical Leave", date: "10/10/24", status: "Pending", statusColor: COLORS.Orange },
  { title: "Now Well", date: "10/10/24", status: "Accepted", statusColor: COLORS.Green },
];

const NOTICE_BOARD = [
  { name: "Admin", text: "Lorem Ipsum is simply dummy text...", date: "25 Jan 2026", avatar: "https://i.pravatar.cc/150?u=admin" },
  { name: "Kathryn Murphy", text: "Lorem Ipsum is simply dummy text...", date: "25 Jan 2026", avatar: "https://i.pravatar.cc/150?u=kathryn" },
  { name: "John Doe", text: "Lorem Ipsum is simply dummy text...", date: "25 Jan 2026", avatar: "https://i.pravatar.cc/150?u=john" },
];

const UPCOMING_EVENTS = [
  { time: "09:00 - 09:45 AM", title: "Marketing Strategy Kickoff", sub: "Lead by Robert Fox" },
  { time: "11:15 - 12:00 AM", title: "Product Design Brainstorm", sub: "Lead by Leslie Alexander" },
  { time: "02:00 - 03:00 AM", title: "Client Feedback Review", sub: "Lead by Courtney Henry" },
  { time: "04:15 - 05:00 PM", title: "Sprint Planning", sub: "Lead by John" },
];

const LEAVE_REQUESTS = [
  { name: "Darlene Robertson", role: "English Teacher", days: "3 Days", date: "Apply on: 10 April", avatar: "https://i.pravatar.cc/150?u=darlene" },
  { name: "Esther Howard", role: "Mathematics Teacher", days: "2 Days", date: "Apply on: 10 April", avatar: "https://i.pravatar.cc/150?u=esther" },
  { name: "Kristin Watson", role: "History Teacher", days: "3 Days", date: "Apply on: 10 April", avatar: "https://i.pravatar.cc/150?u=kristin" },
  { name: "Leslie Alexander", role: "English Teacher", days: "2 Days", date: "Apply on: 10 April", avatar: "https://i.pravatar.cc/150?u=leslie" },
  { name: "Darlene Robertson", role: "English Teacher", days: "2 Days", date: "Apply on: 10 April", avatar: "https://i.pravatar.cc/150?u=darlene2" },
  { name: "Jenny Watson", role: "English Teacher", days: "3 Days", date: "Apply on: 10 April", avatar: "https://i.pravatar.cc/150?u=jenny" },
];

const CALENDAR_DAYS = [
  // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  // Assuming Jan 2026 starts on Thursday
  { day: "", date: null }, { day: "", date: null }, { day: "", date: null }, { day: "", date: null },
  { day: "1", date: 1 }, { day: "2", date: 2 }, { day: "3", date: 3 },
  { day: "4", date: 4 }, { day: "5", date: 5 }, { day: "6", date: 6 }, { day: "7", date: 7 }, { day: "8", date: 8 }, { day: "9", date: 9 }, { day: "10", date: 10 },
  { day: "11", date: 11, selected: true }, // Screenshot shows 11 selected
  { day: "12", date: 12 }, { day: "13", date: 13 }, { day: "14", date: 14 }, { day: "15", date: 15 }, { day: "16", date: 16 }, { day: "17", date: 17 },
  { day: "18", date: 18 }, { day: "19", date: 19 }, { day: "20", date: 20 }, { day: "21", date: 21 }, { day: "22", date: 22 }, { day: "23", date: 23 }, { day: "24", date: 24 },
  { day: "25", date: 25 }, { day: "26", date: 26 }, { day: "27", date: 27 }, { day: "28", date: 28 }, { day: "29", date: 29 }, { day: "30", date: 30 }, { day: "31", date: 31 },
];


export const DashboardView = ({ user: _user }: DashboardViewProps) => {
  return (
    <div className="p-4 md:p-6 bg-[var(--color-bg-app)] min-h-screen font-sans text-[var(--text-body)]">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">School -&gt; Manage your school, track attendance, expense, and net worth.</p>
      </div>

      {/* Main 12-Column Grid Container */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">

        {/* --- ROW 1: KPI CARDS --- */}
        {KPI_DATA.map((kpi, index) => (
          <div key={index} className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-[14px] p-5 border border-gray-200 flex justify-between items-start h-full">
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-bold mb-2">{kpi.value}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">From last month:</span>
                <span className={`px-1.5 py-0.5 rounded ${kpi.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} font-semibold`}>
                  {kpi.fromLastMonth} {kpi.isPositive ? '▲' : '▼'}
                </span>
              </div>
            </div>
            <div className={`p-2 rounded-full text-white`} style={{ backgroundColor: kpi.iconColor }}>
              <kpi.icon size={24} />
            </div>
          </div>
        ))}

        {/* --- ROW 2: Revenue (50%) | Today's Class (25%) | Notice Board (25%) --- */}

        {/* Revenue Statistics Chart (50% width -> col-span-6) */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[14px] p-5 border border-gray-200 flex flex-col h-[320px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Revenue Statistics</h3>
              <h2 className="text-3xl font-bold mt-1">$27,200</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.Primary }}></span>
                <span className="text-gray-500">Total Fee: $500</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-purple-200"></span>
                <span className="text-gray-500">Collected Fee: $300</span>
              </div>
              <button className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                This year <ChevronLeft className="w-3 h-3 rotate-[-90deg]" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000}K`}
                />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="total" fill={COLORS.Primary} radius={[4, 4, 4, 4]} barSize={12} />
                <Bar dataKey="collected" fill="#E0E7FF" radius={[4, 4, 4, 4]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Class (25% width -> col-span-3) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-[14px] p-5 border border-gray-200 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Today's Class</h3>
            <button className="text-xs text-gray-400 flex items-center gap-1">This year <ChevronLeft className="w-3 h-3 rotate-[-90deg]" /></button>
          </div>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
            {TODAY_CLASSES.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400">Date: {item.date}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium border
                   ${item.status === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}
                 `}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notice Board (25% width -> col-span-3) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-[14px] p-5 border border-gray-200 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Notice Board</h3>
            <MoreVertical size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {NOTICE_BOARD.map((notice, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-1">
                  <img src={notice.avatar} alt={notice.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-semibold text-gray-800">{notice.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-snug mb-1">{notice.text}</p>
                <p className="text-[10px] text-gray-400">{notice.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- ROW 3: Calendar (50%) | Upcoming Events (25%) | Leave Requests (25%) --- */}

        {/* Calendar (50% width -> col-span-6) */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[14px] p-5 border border-gray-200 h-[320px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Calendar</h3>
          </div>
          <div className="flex items-center justify-between bg-[#F2F1FF] p-2 rounded-lg mb-2">
            <button className="p-1 hover:bg-white rounded-md transition text-gray-500"><ChevronLeft size={16} /></button>
            <span className="font-bold text-[#6C63FF] text-sm">January 2026</span>
            <button className="p-1 hover:bg-white rounded-md transition text-gray-500"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 text-center gap-y-2 flex-1 items-center">
            {['Sa', 'Su', 'Mo', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <div key={day} className="text-xs font-bold text-gray-400">{day}</div>
            ))}
            {CALENDAR_DAYS.map((item, idx) => (
              <div key={idx} className="flex justify-center">
                {item.date ? (
                  <button className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition
                    ${item.selected ? 'bg-[#6C63FF] text-white shadow-lg shadow-purple-200' : 'text-gray-600 hover:bg-gray-50'}
                  `}>
                    {item.date}
                  </button>
                ) : <span></span>}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events (25% width -> col-span-3) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-[14px] p-5 border border-gray-200 flex flex-col h-[320px]">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
            {UPCOMING_EVENTS.map((event, idx) => (
              <div key={idx} className="relative pl-3 border-l-2 border-[#6C63FF]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#6C63FF] mb-0.5">{event.time}</p>
                    <h4 className="text-sm font-semibold text-gray-800 leading-tight">{event.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{event.sub}</p>
                  </div>
                  <button className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests (25% width -> col-span-3) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white rounded-[14px] p-5 border border-gray-200 flex flex-col h-[320px]">
          <h3 className="text-lg font-semibold mb-4">Leave Requests</h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
            {LEAVE_REQUESTS.map((req, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <img src={req.avatar} alt={req.name} className="w-8 h-8 rounded-full" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{req.name}</h4>
                  <p className="text-xs text-gray-400">{req.role}</p>
                  <div className="flex justify-between items-center mt-1 w-full gap-2">
                    <span className="text-[10px] font-semibold text-gray-600">{req.days}</span>
                    <span className="text-[9px] text-gray-400 whitespace-nowrap">{req.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
