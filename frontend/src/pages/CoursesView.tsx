import { Plus, BookOpen } from "lucide-react";
import { Card } from "../components/ui/Card";
import type { User } from "../types";

interface CoursesViewProps {
  user: User;
}

export const CoursesView = ({ }: CoursesViewProps) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-[var(--text-heading)]">Course Catalog</h1>
      <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[var(--color-primary)]/90 transition shadow-none border border-transparent">
        <Plus size={16} className="inline mr-2" />
        Create Course
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {["Python Masterclass", "Web Development", "Data Science"].map((c, i) => (
        <Card
          key={i}
          className="group hover:border-[var(--color-primary)]/30 transition-all p-0 overflow-hidden border border-gray-200 shadow-none"
        >
          <div className="h-40 bg-[var(--color-primary)]/5 relative group-hover:bg-[var(--color-primary)]/10 transition-colors">
            <BookOpen
              size={48}
              className="text-[var(--color-primary)]/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            <div className="absolute top-4 right-4 bg-white/60 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-[var(--text-heading)]">
              Active
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-bold text-lg text-[var(--text-heading)] mb-1">{c}</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">12 Modules • 45 Hours</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--text-body)]">₹ 25,000</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);
