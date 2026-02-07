import { useState, useEffect, useCallback } from "react";
import { ShieldAlert, AlertTriangle, RefreshCw, X } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import type { User } from "../types";
import { getData, putData, ADMIN_API } from "../api/client";
import type { SafetyIncidentApiRow } from "../api/types";
import { hasPermission, SAFETY_HANDLE_COMPLAINTS } from "../constants/permissions";

interface SafetyViewProps {
  user: User;
}

export const SafetyView = ({ user }: SafetyViewProps) => {
  const canUpdateStatus = hasPermission(user, SAFETY_HANDLE_COMPLAINTS);
  const [incidents, setIncidents] = useState<SafetyIncidentApiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status: string; type: string; severity: string }>({
    status: "",
    type: "",
    severity: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SafetyIncidentApiRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("type", filters.type);
    if (filters.severity) params.set("severity", filters.severity);
    const q = params.toString();
    const res = await getData<{ incidents: SafetyIncidentApiRow[]; total: number; page: number; limit: number; totalPages: number }>(
      `${ADMIN_API}/safety/incidents/all${q ? `?${q}` : ""}`
    ).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to load incidents");
      return { incidents: [], total: 0, page: 1, limit: 100, totalPages: 0 };
    });
    setIncidents(Array.isArray(res?.incidents) ? res.incidents : []);
    setLoading(false);
  }, [filters.status, filters.type, filters.severity]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    getData<SafetyIncidentApiRow>(`${ADMIN_API}/safety/incidents/${selectedId}`)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [selectedId]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdateError(null);
    setUpdatingId(id);
    try {
      await putData(`${ADMIN_API}/safety/incidents/${id}`, { status });
      await fetchIncidents();
      if (selectedId === id) setSelectedId(null);
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const alerts = incidents;
  return (
    <div className="space-y-6">
      {updateError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{updateError}</span>
          <button onClick={() => setUpdateError(null)} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-sm font-medium">Dismiss</button>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchIncidents()} className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium">Retry</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#4D2B8C]">Safety Console</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="p-2 border border-[#4D2B8C]/20 rounded-xl text-sm text-[#4D2B8C] bg-white"
          >
            <option value="">All status</option>
            <option value="reported">Reported</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="p-2 border border-[#4D2B8C]/20 rounded-xl text-sm text-[#4D2B8C] bg-white"
          >
            <option value="">All types</option>
            <option value="emergency">Emergency</option>
            <option value="safety">Safety</option>
            <option value="medical">Medical</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
            className="p-2 border border-[#4D2B8C]/20 rounded-xl text-sm text-[#4D2B8C] bg-white"
          >
            <option value="">All severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button onClick={() => fetchIncidents()} className="flex items-center gap-2 px-3 py-2 border border-[#4D2B8C]/20 rounded-xl text-[#4D2B8C] hover:bg-[#4D2B8C]/5" title="Refresh">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
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
                <p className="text-white/80 text-xs font-bold mt-1">Requires Immediate Action</p>
              </div>
              <ShieldAlert size={100} className="absolute -right-4 -bottom-4 text-white/20" />
            </div>
          </div>
          <h3 className="font-bold text-[#4D2B8C] text-lg">Incidents</h3>
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white p-6 rounded-3xl border border-[#4D2B8C]/5 shadow-md flex flex-col md:flex-row justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4 flex-1 cursor-pointer min-w-0" onClick={() => setSelectedId(alert.id)}>
                  <div className={`p-4 rounded-2xl shrink-0 ${alert.severity === "critical" ? "bg-[#F39EB6] text-[#4D2B8C] animate-pulse" : "bg-[#4D2B8C] text-white"}`}>
                    <AlertTriangle size={24} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#4D2B8C] text-lg">{alert.type}</h4>
                    <p className="text-sm text-[#4D2B8C] font-medium">
                      {alert.location?.address ?? `${alert.location?.latitude ?? ""}, ${alert.location?.longitude ?? ""}`} • {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ""}
                    </p>
                    {alert.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{alert.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge type={alert.severity === "critical" ? "danger" : "warning"} text={alert.severity} />
                  <span className="text-xs font-medium text-gray-500 uppercase">{alert.status}</span>
                  {canUpdateStatus && alert.status === "reported" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(alert.id, "acknowledged"); }}
                      disabled={!!updatingId}
                      className="bg-[#4D2B8C] text-white px-4 py-2 rounded-xl font-bold text-sm shadow hover:bg-[#F39EB6] disabled:opacity-50"
                    >
                      {updatingId === alert.id ? <RefreshCw size={14} className="animate-spin inline" /> : "Acknowledge"}
                    </button>
                  )}
                  {canUpdateStatus && alert.status !== "resolved" && alert.status !== "closed" && alert.status !== "reported" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(alert.id, "resolved"); }}
                      disabled={!!updatingId}
                      className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === alert.id ? <RefreshCw size={14} className="animate-spin inline" /> : "Resolve"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {alerts.length === 0 && !error && <p className="text-gray-500 text-center py-8">No safety incidents.</p>}
        </>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedId(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#4D2B8C]">Incident details</h3>
              <button onClick={() => setSelectedId(null)} className="p-2 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            {detail ? (
              <div className="space-y-3 text-sm">
                <p><span className="font-bold text-[#4D2B8C]">Type:</span> {detail.type}</p>
                <p><span className="font-bold text-[#4D2B8C]">Severity:</span> {detail.severity}</p>
                <p><span className="font-bold text-[#4D2B8C]">Status:</span> {detail.status}</p>
                <p><span className="font-bold text-[#4D2B8C]">User:</span> {detail.userId} ({detail.userRole})</p>
                <p><span className="font-bold text-[#4D2B8C]">Description:</span> {detail.description}</p>
                <p><span className="font-bold text-[#4D2B8C]">Location:</span> {detail.location?.address ?? `${detail.location?.latitude}, ${detail.location?.longitude}`}</p>
                <p><span className="font-bold text-[#4D2B8C]">Reported:</span> {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "—"}</p>
                <div className="pt-4 flex gap-2">
                  {canUpdateStatus && detail.status === "reported" && (
                    <button onClick={() => handleUpdateStatus(detail.id, "acknowledged")} disabled={!!updatingId} className="bg-[#4D2B8C] text-white px-4 py-2 rounded-xl text-sm font-medium">Acknowledge</button>
                  )}
                  {canUpdateStatus && detail.status !== "resolved" && detail.status !== "closed" && (
                    <button onClick={() => handleUpdateStatus(detail.id, "resolved")} disabled={!!updatingId} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium">Mark resolved</button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
