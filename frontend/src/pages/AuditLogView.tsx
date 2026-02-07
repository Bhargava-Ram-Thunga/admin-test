/** Audit log: list of admin write actions. Requires audit:view_audit_trail. */
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, FileText } from "lucide-react";
import { Card } from "../components/ui/Card";
import type { User } from "../types";
import { getData, ADMIN_API } from "../api/client";

export type AuditLogRow = {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  adminEmail: string | null;
  adminName: string | null;
};

interface AuditLogViewProps {
  user: User;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export const AuditLogView = ({ user }: AuditLogViewProps) => {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getData<AuditLogRow[]>(
        `${ADMIN_API}/audit-log?limit=200&offset=0`
      );
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit log");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#4D2B8C] flex items-center gap-2">
          <FileText size={28} />
          Audit log
        </h1>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#4D2B8C] text-white rounded-xl text-sm font-medium hover:bg-[#3d2269] disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <Card>
        {error && (
          <div className="p-4 mb-4 bg-amber-50 text-amber-800 rounded-xl text-sm">
            {error}
          </div>
        )}
        {loading && logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading audit log…</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No audit entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5F7FA] text-left text-[#4D2B8C] font-bold">
                  <th className="p-3">Time</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity type</th>
                  <th className="p-3">Entity ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F5F7FA]/50 hover:bg-[#F5F7FA]/50"
                  >
                    <td className="p-3 text-gray-700 whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="p-3 text-gray-700">
                      {row.adminName || row.adminEmail || row.adminId || "—"}
                    </td>
                    <td className="p-3 text-gray-700">{row.action}</td>
                    <td className="p-3 text-gray-700">{row.entityType}</td>
                    <td className="p-3 text-gray-500 font-mono text-xs truncate max-w-48">
                      {row.entityId ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
