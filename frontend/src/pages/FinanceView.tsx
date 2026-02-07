/** Finance: real-time data from payment-service GET /transactions and admin revenue-summary. */
import { useState, useEffect, useCallback } from "react";
import { Card } from "../components/ui/Card";
import { RefreshCw, DollarSign } from "lucide-react";
import type { User } from "../types";
import { getData } from "../api/client";
import { ADMIN_API } from "../api/client";

interface FinanceViewProps {
  user: User;
}

/** Payment record from GET /api/v1/payments/transactions (payment-service). */
interface PaymentRecord {
  id: string;
  studentId: string;
  amountCents: number;
  currency?: string;
  status: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface RevenueByCourse {
  courseId: string;
  courseName: string;
  revenue: number;
}

interface RevenueByCity {
  cityId?: string;
  cityName: string;
  revenue: number;
}

interface RevenueSummary {
  totalRevenue: number;
  completedCount: number;
  byCourse: RevenueByCourse[];
  byCity: RevenueByCity[];
}

export const FinanceView = ({ user: _user }: FinanceViewProps) => {
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use admin proxy so transactions come through same auth as revenue-summary
      const [txRes, summaryRes, coursesRes] = await Promise.allSettled([
        getData<PaymentRecord[]>(`${ADMIN_API}/finance/transactions?limit=200`),
        getData<RevenueSummary>(`${ADMIN_API}/finance/revenue-summary`).catch(() => null),
        getData<{ courses?: unknown[]; total?: number }>("/api/courses?limit=500").catch(() => ({ courses: [], total: 0 })),
      ]);

      const list = txRes.status === "fulfilled" && Array.isArray(txRes.value) ? txRes.value : [];
      setTransactions(list);
      if (summaryRes.status === "fulfilled" && summaryRes.value)
        setRevenueSummary(summaryRes.value);
      else
        setRevenueSummary(null);
      if (coursesRes.status === "fulfilled" && coursesRes.value != null) {
        const v = coursesRes.value as { total?: number; courses?: unknown[] };
        setCourseCount(typeof v.total === "number" ? v.total : Array.isArray(v.courses) ? v.courses.length : null);
      } else setCourseCount(null);
      if (txRes.status === "rejected" && !list.length) {
        setError(
          "Payment service not connected. Set PAYMENT_SERVICE_URL for admin-service and run payment-service to see transactions and revenue."
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment API not configured or unavailable");
      setTransactions([]);
      setRevenueSummary(null);
      setCourseCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const succeeded = transactions.filter((tx) => tx.status === "succeeded");
  const totalRevenue =
    revenueSummary?.totalRevenue ??
    succeeded.reduce((sum, tx) => sum + (Number(tx.amountCents) || 0) / 100, 0);
  const completedCount = revenueSummary?.completedCount ?? succeeded.length;
  const byCourse = revenueSummary?.byCourse ?? [];
  const byCity = revenueSummary?.byCity ?? [];

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const purchasesThisMonth = succeeded.filter((tx) => {
    const d = tx.createdAt ? new Date(tx.createdAt) : null;
    return d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const revenueThisMonth = purchasesThisMonth.reduce((s, tx) => s + (Number(tx.amountCents) || 0) / 100, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#4D2B8C]">Finance & Billing</h1>
        <button
          onClick={() => fetchFinance()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 border border-[#5E35B1]/30 rounded-xl text-[#5E35B1] hover:bg-[#EDE7F6]/50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-[#5E35B1]" : ""} />
          Refresh
        </button>
      </div>
      {error && (
        <div className="bg-[#EDE7F6]/80 border border-[#5E35B1]/20 text-[#5E35B1] px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button onClick={() => fetchFinance()} className="px-3 py-1 bg-white/80 hover:bg-white rounded-lg text-sm font-medium text-[#5E35B1] border border-[#5E35B1]/30">Retry</button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`lg:col-span-2 p-0 overflow-hidden border border-[#4D2B8C]/10 shadow-lg ${loading ? "min-h-[280px]" : ""}`}>
          <div className="p-6 border-b border-[#F5F7FA] bg-[#4D2B8C]">
            <h3 className="font-bold text-white text-lg">Recent Transactions</h3>
          </div>
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <div className="loading-violet-skeleton rounded-xl h-8 w-3/4 max-w-xs" />
              <div className="loading-violet-skeleton rounded-xl h-8 w-1/2 max-w-[200px]" />
              <div className="loading-violet-skeleton rounded-xl h-8 w-2/3 max-w-[180px]" />
              <p className="text-[#5E35B1]/80 text-sm font-medium">Loading…</p>
            </div>
          ) : transactions.length > 0 ? (
            <table className="w-full">
              <tbody className="divide-y divide-[#F5F7FA]">
                {transactions.slice(0, 20).map((tx, i) => (
                  <tr key={tx.id ?? i} className="hover:bg-[#F5F7FA]">
                    <td className="p-4 pl-6 font-bold text-[#4D2B8C] text-sm">{tx.id ?? `TXN-${i + 1}`}</td>
                    <td className="p-4 text-sm text-[#4D2B8C]">{String(tx.status ?? "—")}</td>
                    <td className="p-4 text-right font-bold text-[#4D2B8C]">
                      {tx.amountCents != null ? `₹ ${(Number(tx.amountCents) / 100).toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <DollarSign size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="font-medium">No transactions yet.</p>
              <p className="text-sm mt-1">
                Connect payment-service and set PAYMENT_SERVICE_URL for admin-service to see revenue and transactions here.
              </p>
            </div>
          )}
        </Card>
        <div className="space-y-6">
          <Card className={`border-none shadow-xl p-6 ${loading ? "loading-violet" : "bg-gradient-to-br from-[#4D2B8C] to-[#6B3A9E]"} text-white min-h-[180px]`}>
            {loading ? (
              <div className="space-y-3">
                <div className="loading-violet-skeleton rounded h-4 w-24 bg-white/20" />
                <div className="loading-violet-skeleton rounded h-6 w-32 bg-white/20" />
                <div className="loading-violet-skeleton rounded h-4 w-28 bg-white/20" />
              </div>
            ) : (
              <>
                <p className="text-[#F39EB6] text-sm font-bold uppercase mb-2">Overview</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Total revenue</span>
                    <span className="font-bold text-lg">
                      ₹ {Number(totalRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Completed transactions</span>
                    <span className="font-bold">{completedCount}</span>
                  </div>
                </div>
                {transactions.length === 0 && (
                  <p className="text-white/70 text-sm mt-3">Connect payment-service to see live transactions and revenue.</p>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Purchases this month */}
      <Card className="p-0 overflow-hidden border border-[#4D2B8C]/10 shadow-lg">
        <div className="p-4 border-b border-[#F5F7FA] bg-[#4D2B8C]">
          <h3 className="font-bold text-white">Students who purchased course this month</h3>
          <p className="text-white/80 text-sm mt-0.5">
            {loading ? "Loading…" : `${purchasesThisMonth.length} purchase(s) · ₹ ${revenueThisMonth.toLocaleString()} revenue`}
          </p>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-violet-skeleton rounded-lg h-12 w-full" />
              ))}
            </div>
          ) : purchasesThisMonth.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-medium">Student ID</th>
                  <th className="pb-2 font-medium">Amount (₹)</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchasesThisMonth.map((tx, i) => (
                  <tr key={tx.id ?? i}>
                    <td className="py-2 font-medium text-[#4D2B8C]">{tx.studentId ?? "—"}</td>
                    <td className="py-2 font-bold text-[#4D2B8C]">
                      {tx.amountCents != null ? (Number(tx.amountCents) / 100).toLocaleString() : "—"}
                    </td>
                    <td className="py-2 text-slate-600">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-sm">
              No course purchases this month yet. Connect payment-service to see student purchases and revenue.
            </p>
          )}
        </div>
      </Card>

      {/* Course-wise & City-wise revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`p-0 overflow-hidden border border-[#4D2B8C]/10 shadow-lg ${loading ? "" : ""}`}>
          <div className="p-4 border-b border-[#F5F7FA] bg-[#4D2B8C]">
            <h3 className="font-bold text-white">Revenue by course</h3>
            <p className="text-white/80 text-sm mt-0.5">
              {loading ? "Loading…" : courseCount != null ? `${courseCount} course(s) in database` : "—"}
            </p>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="loading-violet-skeleton rounded h-8 w-full" />
                ))}
              </div>
            ) : byCourse.length > 0 ? (
              <ul className="space-y-2">
                {byCourse.map((c) => (
                  <li key={c.courseId} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-[#4D2B8C]">{c.courseName || c.courseId}</span>
                    <span className="font-bold text-[#4D2B8C]">₹ {Number(c.revenue).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Course-wise revenue appears when allocations and payments are linked.</p>
            )}
          </div>
        </Card>
        <Card className="p-0 overflow-hidden border border-[#4D2B8C]/10 shadow-lg">
          <div className="p-4 border-b border-[#F5F7FA] bg-[#4D2B8C]">
            <h3 className="font-bold text-white">Revenue by city / region</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="loading-violet-skeleton rounded h-8 w-full" />
                ))}
              </div>
            ) : byCity.length > 0 ? (
              <ul className="space-y-2">
                {byCity.map((c, i) => (
                  <li key={c.cityId ?? i} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-[#4D2B8C]">{c.cityName}</span>
                    <span className="font-bold text-[#4D2B8C]">₹ {Number(c.revenue).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">City-wise revenue appears when region data is available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
