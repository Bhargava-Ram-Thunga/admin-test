import { Bell, Globe, ChevronDown } from "lucide-react";
import type { User } from "../../types";

interface TopHeaderProps {
  user: User;
}

export const TopHeader = ({ user }: TopHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-4 h-14 px-6 bg-white border-b border-slate-200 shadow-sm">
      <button
        type="button"
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
      </button>
      <button
        type="button"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
        aria-label="Language"
      >
        <Globe size={18} />
        <span>En</span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>
      <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
          <p className="text-xs text-slate-500 leading-tight">{user.role}</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg p-1 pr-2 hover:bg-slate-100 transition-colors"
          aria-label="Profile menu"
        >
          <img
            src={`https://i.pravatar.cc/150?u=${user.email}`}
            alt=""
            className="w-9 h-9 rounded-full border-2 border-slate-200 object-cover"
          />
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
};
