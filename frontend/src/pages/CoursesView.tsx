import { Plus, BookOpen } from "lucide-react";
import { Card } from "../components/ui/Card";
import type { User } from "../types";

interface CoursesViewProps {
  user: User;
}

export const CoursesView = ({}: CoursesViewProps) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-[#393D7E]">Course Catalog</h1>
      <button className="bg-[#393D7E] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#5459AC] transition">
        <Plus size={16} className="inline mr-2" />
        Create Course
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {["Python Masterclass", "Web Development", "Data Science"].map((c, i) => (
        <Card
          key={i}
          className="group hover:shadow-xl transition-all p-0 overflow-hidden border-none"
        >
          <div className="h-40 bg-[#393D7E] relative group-hover:bg-[#5459AC] transition-colors">
            <BookOpen
              size={48}
              className="text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-white">
              Active
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-lg text-[#393D7E] mb-1">{c}</h3>
            <p className="text-sm text-[#5459AC] mb-4">12 Modules • 45 Hours</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#393D7E]">₹ 25,000</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
