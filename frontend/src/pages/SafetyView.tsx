import { ShieldAlert, AlertTriangle } from "lucide-react";
import { MOCK_SOS } from "../data/mockData";
import { Badge } from "../components/ui/Badge";
import { checkPermission } from "../utils/helpers";
import type { User } from "../types";

interface SafetyViewProps {
  user: User;
}

export const SafetyView = ({ user }: SafetyViewProps) => {
  const alerts = MOCK_SOS.filter((a) => checkPermission(user, a.regionId));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#4D2B8C]">Safety Console</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#F39EB6] p-6 rounded-3xl shadow-lg shadow-[#F39EB6]/30 text-[#4D2B8C] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2 text-[#4D2B8C] bg-white/30 w-fit px-3 py-1 rounded-full">
              <ShieldAlert size={18} />
              <h3 className="font-bold text-sm">Critical Alerts</h3>
            </div>
            <p className="text-white text-4xl font-bold">
              {alerts.filter((a) => a.severity === "Critical").length}
            </p>
            <p className="text-white/80 text-xs font-bold mt-1">
              Requires Immediate Action
            </p>
          </div>
          <ShieldAlert
            size={100}
            className="absolute -right-4 -bottom-4 text-white/20"
          />
        </div>
      </div>
      <h3 className="font-bold text-[#4D2B8C] text-lg">Active SOS Signals</h3>
      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white p-6 rounded-3xl border border-[#4D2B8C]/5 shadow-md flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-4 rounded-2xl ${alert.severity === "Critical"
                    ? "bg-[#F39EB6] text-[#4D2B8C] animate-pulse"
                    : "bg-[#4D2B8C] text-white"
                  }`}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#4D2B8C] text-lg">
                  {alert.type}
                </h4>
                <p className="text-sm text-[#4D2B8C] font-medium">
                  {alert.location} • {alert.time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                type={alert.severity === "Critical" ? "danger" : "warning"}
                text={alert.severity}
              />
              <button className="bg-[#4D2B8C] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#F39EB6]">
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
