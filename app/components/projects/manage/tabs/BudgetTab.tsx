import { useState } from "react";
import { Plus, CheckCircle2, Receipt, Clock, Loader2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addExpense } from "@/lib/actions/project-details";
export function BudgetTab({ project }: any) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const remaining = project.totalBudget - project.spentBudget;
  const expenses = project.budgetUpdates.filter((u: any) => !u.isInitial && u.amountChange > 0);

  const handleAddExpense = async (formData: FormData) => {
    setIsLoading(true);
    await addExpense(project.id, project.spentBudget, formData);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Budget Editor & Tracker</h2>
        <p className="text-sm text-gray-500 mt-1">{project.title}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">Total Allocated</p>
          <p className="text-2xl font-bold text-gray-700">₱{project.totalBudget.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">Budget Used</p>
          <p className="text-2xl font-bold text-red-500">₱{project.spentBudget.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">Remaining</p>
          <p className="text-2xl font-bold text-green-500">₱{remaining.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-900">Expense Breakdown</h3>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Record New Expense</DialogTitle></DialogHeader>
              <form action={handleAddExpense} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                  <select name="category" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]">
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Amount (₱)</label>
                  <input name="amount" type="number" required min="1" max={remaining} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                  <p className="text-[10px] text-gray-400 mt-1">Remaining budget: ₱{remaining.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Description</label>
                  <input name="description" required placeholder="What was this for?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl flex justify-center disabled:opacity-70">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Record Expense"}
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
              {expenses.length === 0 && <tr><td colSpan={3} className="py-4 text-gray-500">No expenses recorded yet.</td></tr>}
              {expenses.map((exp: any) => (
                <tr key={exp.id} className="text-gray-900 font-medium">
                  <td className="py-4">{exp.category}</td>
                  <td className="py-4">₱{exp.amountChange.toLocaleString()}</td>
                  <td className="py-4 text-gray-500 font-normal">{exp.description}</td>
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
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
          
          {project.budgetUpdates.map((log: any) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 border-white ${log.isInitial ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}>
                {log.isInitial ? <CheckCircle2 className="w-4 h-4" /> : <Receipt className="w-3.5 h-3.5" />}
              </div>
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-gray-900">{log.isInitial ? "Budget Allocated" : "Expense Recorded"}</h4>
                  <time className="text-[10px] text-gray-400 font-medium">{log.date}</time>
                </div>
                <p className="text-xs text-gray-500">{log.isInitial ? "Initial allocation" : `₱${log.amountChange.toLocaleString()} for ${log.category}`}</p>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}