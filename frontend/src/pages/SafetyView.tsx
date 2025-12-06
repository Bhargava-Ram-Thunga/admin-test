import { ShieldAlert, AlertTriangle } from "lucide-react";
import { MOCK_SOS } from "../data/mockData";
import { Badge } from "../components/ui/Badge";
import { checkPermission } from "../utils/helpers";

export const SafetyView = ({ user }: any) => {
    const alerts = MOCK_SOS.filter((a) => checkPermission(user, a.regionId));
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#393D7E]">Safety Console</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#F2AEBB] p-6 rounded-3xl shadow-lg shadow-[#F2AEBB]/30 text-[#393D7E] relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2 text-[#C04C63] bg-white/30 w-fit px-3 py-1 rounded-full">
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
            <h3 className="font-bold text-[#393D7E] text-lg">Active SOS Signals</h3>
            <div className="grid gap-4">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="bg-white p-6 rounded-3xl border border-[#393D7E]/5 shadow-md flex flex-col md:flex-row justify-between items-center gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`p-4 rounded-2xl ${alert.severity === "Critical"
                                        ? "bg-[#F2AEBB] text-[#C04C63] animate-pulse"
                                        : "bg-[#6DC3BB] text-white"
                                    }`}
                            >
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#393D7E] text-lg">
                                    {alert.type}
                                </h4>
                                <p className="text-sm text-[#5459AC] font-medium">
                                    {alert.location} • {alert.time}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge
                                type={alert.severity === "Critical" ? "danger" : "warning"}
                                text={alert.severity}
                            />
                            <button className="bg-[#393D7E] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#5459AC]">
                                Acknowledge
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
