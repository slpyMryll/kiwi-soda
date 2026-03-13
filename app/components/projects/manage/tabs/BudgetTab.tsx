"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Receipt,
  Clock,
  Loader2,
  Edit2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addExpense, updateProjectBudget } from "@/lib/actions/project-details";

export function BudgetTab({ project }: any) {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const remaining = project.totalBudget - project.spentBudget;
  const expenses =
    project.budgetUpdates?.filter(
      (u: any) => !u.isInitial && u.amountChange > 0,
    ) || [];

  const lastEditor = project.budgetUpdates?.[0]?.updatedBy || "Manager";

  const handleAddExpense = async (formData: FormData) => {
    setIsLoading(true);
    const res = await addExpense(project.id, project.spentBudget, formData);
    setIsLoading(false);
    if (res.error) alert(res.error);
    else setIsExpenseOpen(false);
  };

  const handleBudgetUpdate = async (formData: FormData) => {
    setIsLoading(true);
    const res = await updateProjectBudget(
      project.id,
      project.totalBudget,
      formData,
    );
    setIsLoading(false);
    if (res.error) alert(res.error);
    else setIsBudgetEditOpen(false);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-bold text-gray-600">
            Total Budget Allocation
          </h3>
          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
            Approved
          </span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-bold text-[#1B4332]">
            ₱{project.totalBudget.toLocaleString()}
          </span>

          <Dialog open={isBudgetEditOpen} onOpenChange={setIsBudgetEditOpen}>
            <DialogTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adjust Total Budget</DialogTitle>
              </DialogHeader>
              <form action={handleBudgetUpdate} className="space-y-4 mt-4">
                <p className="text-xs text-orange-600 font-medium bg-orange-50 p-3 rounded-lg border border-orange-100">
                  ⚠️ Adjusting the total budget will be recorded in the public
                  audit trail.
                </p>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    New Total Budget (₱)
                  </label>
                  <input
                    name="totalBudget"
                    type="number"
                    defaultValue={project.totalBudget}
                    required
                    min="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl disabled:opacity-70 transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Adjustment"
                  )}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-gray-400 font-medium italic">
          Last modified: {new Date(project.updated_at).toLocaleString()} by{" "}
          {lastEditor}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 uppercase">
            Total Allocated
          </p>
          <p className="text-2xl font-bold text-gray-700">
            ₱{project.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 uppercase">
            Budget Used
          </p>
          <p className="text-2xl font-bold text-red-500">
            ₱{project.spentBudget.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1 uppercase">
            Remaining
          </p>
          <p className="text-2xl font-bold text-green-500">
            ₱{remaining.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-900">Expense Breakdown</h3>
          <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Record New Expense</DialogTitle>
              </DialogHeader>
              <form action={handleAddExpense} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Amount (₱)
                  </label>
                  <input
                    name="amount"
                    type="number"
                    required
                    min="1"
                    max={remaining}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">
                    Description
                  </label>
                  <input
                    name="description"
                    required
                    placeholder="Description of expense"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl disabled:opacity-70 transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Record Expense"
                  )}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-gray-500 text-center">
                    No expenses recorded yet.
                  </td>
                </tr>
              )}
              {expenses.map((exp: any) => (
                <tr key={exp.id} className="text-gray-900 font-medium">
                  <td className="py-4">{exp.category}</td>
                  <td className="py-4 font-bold text-red-500">
                    ₱{exp.amountChange.toLocaleString()}
                  </td>
                  <td className="py-4 text-gray-500 font-normal">
                    {exp.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Budget Audit Trail
        </h3>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:h-full before:w-0.5 before:bg-gray-100">
          {project.budgetUpdates?.map((log: any) => (
            <div key={log.id} className="relative flex items-start gap-6 group">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full border-2 border-white ${log.isInitial ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"} shrink-0 shadow-sm z-10`}
              >
                {log.isInitial ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Receipt className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm text-gray-900">
                    {log.updatedBy}
                  </h4>
                  <time className="text-[10px] text-gray-400 font-medium">
                    {log.date}
                  </time>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {log.description}
                </p>
                <div className="mt-2 text-[10px] font-bold text-gray-400 flex items-center gap-2">
                  <span>₱{log.oldTotal.toLocaleString()}</span>
                  <span>➔</span>
                  <span className="text-[#1B4332]">
                    ₱{log.newTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
