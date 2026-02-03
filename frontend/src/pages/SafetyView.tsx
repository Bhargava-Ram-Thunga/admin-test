import { useState, useEffect, useCallback } from "react";
import { ShieldAlert, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import type { User } from "../types";
import { getData } from "../api/client";
import { ADMIN_API } from "../api/client";
import type { SafetyIncidentApiRow } from "../api/types";

interface SafetyViewProps {
  user: User;
}

export const SafetyView = ({ user }: SafetyViewProps) => {
  const [incidents, setIncidents] = useState<SafetyIncidentApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getData<{ incidents: SafetyIncidentApiRow[]; total: number; page: number; limit: number; totalPages: number }>(
      `${ADMIN_API}/safety/incidents/all?limit=100`
    ).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load incidents");
      return { incidents: [], total: 0, page: 1, limit: 100, totalPages: 0 };
    });
    setIncidents(Array.isArray(res?.incidents) ? res.incidents : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const alerts = incidents;
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchIncidents()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#4D2B8C]">Safety Console</h1>
        <button onClick={() => fetchIncidents()} className="flex items-center gap-2 px-3 py-2 border border-[#4D2B8C]/20 rounded-xl text-[#4D2B8C] hover:bg-[#4D2B8C]/5" title="Refresh">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
      {loading && incidents.length === 0 && (
        <div className="flex items-center justify-center min-h-[120px] text-[#4D2B8C]">
          <RefreshCw size={24} className="animate-spin" /> Loading incidents…
        </div>
      )}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#F39EB6] p-6 rounded-3xl shadow-lg shadow-[#F39EB6]/30 text-[#4D2B8C] relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-[#4D2B8C] bg-white/30 w-fit px-3 py-1 rounded-full">
                  <ShieldAlert size={18} />
                  <h3 className="font-bold text-sm">Critical Alerts</h3>
                </div>
                <p className="text-white text-4xl font-bold">
                  {alerts.filter((a) => a.severity === "critical").length}
                </p>
                <p className="text-white/80 text-xs font-bold mt-1">
                  Requires Immediate Action
                </p>
              </div>
              <ShieldAlert size={100} className="absolute -right-4 -bottom-4 text-white/20" />
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
                    className={`p-4 rounded-2xl ${alert.severity === "critical"
                        ? "bg-[#F39EB6] text-[#4D2B8C] animate-pulse"
                        : "bg-[#4D2B8C] text-white"
                      }`}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#4D2B8C] text-lg">{alert.type}</h4>
                    <p className="text-sm text-[#4D2B8C] font-medium">
                      {alert.location?.address ?? `${alert.location?.latitude ?? ""}, ${alert.location?.longitude ?? ""}`} • {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ""}
                    </p>
                    {alert.description && <p className="text-xs text-gray-500 mt-1">{alert.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    type={alert.severity === "critical" ? "danger" : "warning"}
                    text={alert.severity}
                  />
                  {/* Acknowledge: no backend API in scan — UI only */}
                  <button className="bg-[#4D2B8C] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#F39EB6]">
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
          {alerts.length === 0 && !error && (
            <p className="text-gray-500 text-center py-8">No safety incidents.</p>
          )}
        </>
      )}
    </div>
  );
};
