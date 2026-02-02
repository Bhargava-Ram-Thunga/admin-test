import { Card } from "../components/ui/Card";
import type { Student, User } from "../types";

interface FinanceViewProps {
  user: User;
  students: Student[];
}

export const FinanceView = ({ }: FinanceViewProps) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-[var(--text-heading)]">Finance & Billing</h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-0 overflow-hidden border border-gray-200 shadow-none">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-[var(--text-heading)] text-lg">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 pl-6 font-bold text-[var(--text-body)] text-sm">
                    TXN-883{i}
                  </td>
                  <td className="p-4 text-sm font-bold text-[var(--color-primary)]">
                    Student Name {i}
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-bold text-[var(--text-heading)] text-sm">₹ 15,000</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="space-y-6">
        <Card className="bg-[var(--color-primary)] text-white border-none shadow-sm">
          <p className="text-white/70 text-sm font-bold uppercase mb-1">
            Total Balance
          </p>
          <h3 className="text-3xl font-bold mb-6">₹ 48,23,900</h3>
          <button className="w-full bg-white text-[var(--color-primary)] hover:bg-white/90 transition py-3 rounded-xl font-bold text-sm">
            Withdraw Funds
          </button>
        </Card>
      </div>
      <div>
        <Card>
          <p className="font-bold mb-2">Hierarchy</p>
          <p className="text-sm text-gray-500 mb-4">Show Hierarchy</p>
          <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm shadow-none hover:bg-[var(--color-primary)]/90 transition">View Details</button>
        </Card>
      </div>
    </div>
  </div>
);
