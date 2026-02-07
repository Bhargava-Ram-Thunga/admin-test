/** Courses: BACKEND_API_MAPPING — Course-service GET /api/v1/courses. */
import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/Card";
import type { User } from "../types";
import { getData } from "../api/client";

interface CourseRow {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  status?: string;
  [key: string]: unknown;
}

interface CoursesResponse {
  courses?: CourseRow[];
  data?: CourseRow[];
  total?: number;
  page?: number;
  limit?: number;
}

interface CoursesViewProps {
  user: User;
}

export const CoursesView = ({ user: _user }: CoursesViewProps) => {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getData<CoursesResponse>("/api/v1/courses?limit=50");
      const list = Array.isArray(data?.courses) ? data.courses : Array.isArray(data?.data) ? data.data : [];
      setCourses(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Course API not available");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#4D2B8C]">Course Catalog</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCourses()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-[#4D2B8C]/20 rounded-xl text-[#4D2B8C] hover:bg-[#4D2B8C]/5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="bg-[#4D2B8C] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#F39EB6] transition flex items-center gap-2">
            <Plus size={16} />
            Create Course
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchCourses()} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      {loading && courses.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px] text-[#4D2B8C]">
          <RefreshCw size={28} className="animate-spin" /> Loading courses…
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-[#4D2B8C]/10 rounded-3xl">
          <BookOpen size={48} className="mx-auto text-[#4D2B8C]/30 mb-3" />
          <p className="text-[#4D2B8C] font-medium">No courses yet.</p>
          <p className="text-sm text-gray-500 mt-1">Course catalog loads from course service when API is available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Card key={c.id} className="group hover:shadow-xl transition-all p-0 overflow-hidden border border-[#4D2B8C]/10">
              <div className="h-40 bg-[#4D2B8C] relative group-hover:bg-[#F39EB6] transition-colors">
                <BookOpen size={48} className="text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white">
                  {c.status ?? "Active"}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-[#4D2B8C] mb-1">{c.title ?? c.name ?? c.id}</h3>
                <p className="text-sm text-[#4D2B8C]/80 mb-4 line-clamp-2">{c.description ?? "—"}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#4D2B8C]">
                    {c.price != null ? `₹ ${Number(c.price).toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
