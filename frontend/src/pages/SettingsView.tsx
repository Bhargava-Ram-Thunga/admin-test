import { Card } from "../components/ui/Card";
import type { User } from "../types";

interface SettingsViewProps {
  user: User;
}

export const SettingsView = ({ user }: SettingsViewProps) => (
  <div className="space-y-6 max-w-4xl">
    <h1 className="text-2xl font-bold text-[#393D7E]">Settings</h1>
    <Card>
      <h3 className="font-bold text-lg text-[#393D7E] mb-6 border-b border-[#F5F7FA] pb-4">
        Profile Settings
      </h3>
      <div className="flex items-start gap-6">
        <img
          src={user.avatarUrl}
          className="w-24 h-24 rounded-3xl border-4 border-[#F5F7FA] shadow-sm"
        />
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#5459AC] uppercase ml-1">
                Full Name
              </label>
              <input
                defaultValue={user.name}
                className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#393D7E]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#5459AC] uppercase ml-1">
                Email
              </label>
              <input
                defaultValue={user.email}
                className="w-full mt-1 p-3 bg-[#F5F7FA] rounded-xl outline-none font-bold text-[#393D7E]"
                disabled
              />
            </div>
          </div>
          <button className="bg-[#393D7E] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#5459AC] transition">
            Save Changes
          </button>
        </div>
      </div>
    </Card>
    <Card>
      <h3 className="font-bold text-lg text-[#393D7E] mb-6 border-b border-[#F5F7FA] pb-4">
        Admin Access Control
      </h3>
      <div className="bg-[#F5F7FA] p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-[#5459AC] uppercase ml-1">
            Invitee Email
          </label>
          <input
            placeholder="colleague@koding.com"
            className="w-full mt-1 p-3 bg-white border border-[#393D7E]/10 rounded-xl outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="text-xs font-bold text-[#5459AC] uppercase ml-1">
            Role
          </label>
          <select className="w-full mt-1 p-3 bg-white border border-[#393D7E]/10 rounded-xl outline-none text-[#5459AC]">
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
          </select>
        </div>
        <button className="w-full md:w-auto bg-[#6DC3BB] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5459AC] transition shadow-lg">
          Send Invite
        </button>
      </div>
    </Card>
  </div>
);
