import { Card } from "../components/ui/Card";
import type { Student, User } from "../types";

interface FinanceViewProps {
  user: User;
  students: Student[];
}

export const FinanceView = ({}: FinanceViewProps) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-[#393D7E]">Finance & Billing</h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-0 overflow-hidden border-none shadow-xl">
        <div className="p-6 border-b border-[#F5F7FA] bg-[#393D7E]">
          <h3 className="font-bold text-white text-lg">Recent Transactions</h3>
        </div>
        <table className="w-full">
          <tbody className="divide-y divide-[#F5F7FA]">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-[#F5F7FA]">
                <td className="p-4 pl-6 font-bold text-[#393D7E] text-sm">
                  TXN-883{i}
                </td>
                <td className="p-4 text-sm font-bold text-[#5459AC]">
                  Student Name {i}
                </td>
                <td className="p-4 text-right">
                  <p className="font-bold text-[#393D7E] text-sm">₹ 15,000</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-[#393D7E] to-[#5459AC] text-white border-none shadow-xl">
          <p className="text-[#6DC3BB] text-sm font-bold uppercase mb-1">
            Total Balance
          </p>
          <h3 className="text-3xl font-bold mb-6">₹ 48,23,900</h3>
          <button className="w-full bg-[#6DC3BB] text-white hover:bg-white hover:text-[#393D7E] transition py-3 rounded-xl font-bold text-sm">
            Withdraw Funds
          </button>
        </Card>
      </div>
    </div>
  </div>
);
