"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, CheckCircle2, Receipt, Clock, Loader2, Edit2, RotateCcw, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addExpense, updateProjectBudget, approveExpense, rejectExpense, adjustExpense } from "@/lib/actions/project-details";
import { createClient } from "@/lib/supabase/client";

const formatLog = (log: any) => {
  if (!log) return null;
  const reason = log.budget_change_reason || "";
  const parts = reason.split(":");
  return {
    id: log.id,
    date: log.changed_at ? new Date(log.changed_at).toLocaleString() : new Date().toLocaleString(),
    amountChange: (log.new_amount || 0) - (log.old_amount || 0),
    category: parts.length > 1 ? parts[0] : "General",
    description: parts.length > 1 ? parts.slice(1).join(":").trim() : reason,
    updatedBy: log.profiles?.full_name || "System",
    oldTotal: log.old_amount || 0,
    newTotal: log.new_amount || 0,
    isInitial: log.is_initial || false,
    status: log.status || 'Approved',
  };
};

export function BudgetTab({ project }: any) {
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  
  const [actionModal, setActionModal] = useState<{type: 'approve' | 'reject' | 'reverse', id: string} | null>(null);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [spentBudget, setSpentBudget] = useState(project.spentBudget);
  const [totalBudget, setTotalBudget] = useState(project.totalBudget);
  const [budgetUpdates, setBudgetUpdates] = useState(project.budgetUpdates || []);

  const fetchLatestData = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select(`
        total_budget, 
        spent_budget,
        budget_logs ( id, budget_change_reason, changed_at, new_amount, old_amount, is_initial, status, profiles:changed_by ( full_name ) )
      `)
      .eq('id', project.id)
      .single();
      
    if (!error && data) {
      setTotalBudget(Number(data.total_budget || 0));
      setSpentBudget(Number(data.spent_budget || 0));
      const formattedLogs = (data.budget_logs || [])
        .map(formatLog)
        .filter(Boolean)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setBudgetUpdates(formattedLogs);
    }
  }, [project.id]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('budget-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_logs', filter: `project_id=eq.${project.id}` }, () => {
         fetchLatestData(); 
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, [project.id, fetchLatestData]);

  useEffect(() => {
    setSpentBudget(project.spentBudget);
    setTotalBudget(project.totalBudget);
    setBudgetUpdates(project.budgetUpdates || []);
  }, [project.spentBudget, project.totalBudget, project.budgetUpdates]);

  const remaining = totalBudget - spentBudget;
  
  const expenses = budgetUpdates.filter((u: any) => 
    !u.isInitial && u.amountChange !== 0 && (u.status === 'Approved' || u.status === 'Adjusted') &&
    !u.description.includes('Total Budget') && !u.category?.includes('Total Budget') &&
    !u.category?.includes('Correction') && !u.description.includes('Correction')
  );
  
  const pendingExpenses = budgetUpdates.filter((u: any) => u.status === 'Pending');
  const lastEditor = budgetUpdates[0]?.updatedBy || "Manager";

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); setFormError("");
    const formData = new FormData(e.currentTarget);
    const res = await addExpense(project.id, formData);
    setIsLoading(false);
    if (res?.error) setFormError(res.error);
    else {
      if (res.log) {
        const newLog = formatLog(res.log);
        if (newLog) {
          setBudgetUpdates((prev: any) => [newLog, ...prev].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          if (newLog.status === 'Approved') setSpentBudget(newLog.newTotal);
        }
      }
      setIsExpenseOpen(false);
    }
  };

  const handleBudgetUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); setFormError("");
    const formData = new FormData(e.currentTarget);
    const res = await updateProjectBudget(project.id, totalBudget, formData);
    setIsLoading(false);
    if (res?.error) setFormError(res.error);
    else {
      if (res.log) {
        const newLog = formatLog(res.log);
        if (newLog) {
          setBudgetUpdates((prev: any) => [newLog, ...prev].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          if (newLog.status === 'Approved') setTotalBudget(newLog.newTotal);
        }
      }
      setIsBudgetEditOpen(false);
    }
  };

  const executeAction = async () => {
    if (!actionModal) return;
    setIsLoading(true); setFormError("");
    const logId = actionModal.id;

    let res: any;
    if (actionModal.type === 'approve') {
      res = await approveExpense(logId, project.id);
      if (res?.success && res.log) {
        const logTarget = formatLog(res.log);
        if (logTarget?.category.includes('Total Budget') || logTarget?.description.includes('Total Budget')) setTotalBudget(logTarget.newTotal);
        else setSpentBudget(logTarget!.newTotal);
        setBudgetUpdates((prev: any) => prev.map((u: any) => u.id === logId ? logTarget : u));
      }
    } 
    else if (actionModal.type === 'reject') {
      res = await rejectExpense(logId, project.id);
      if (res?.success && res.log) {
        setBudgetUpdates((prev: any) => prev.map((u: any) => u.id === logId ? formatLog(res.log) : u));
      }
    } 
    else if (actionModal.type === 'reverse') {
      res = await adjustExpense(logId, project.id);
      if (res?.success) {
        setBudgetUpdates((prev: any) => {
          const updatedOld = prev.map((u: any) => u.id === logId ? formatLog(res.updatedOldLog) : u);
          const newCorrection = formatLog(res.newLog);
          return newCorrection ? [newCorrection, ...updatedOld].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : updatedOld;
        });
        
        if (res.isTotalBudget) {
          setTotalBudget(res.newTotal);
        } else {
          setSpentBudget(res.newSpent);
        }
      }
    }

    setIsLoading(false);
    if (res?.error) setFormError(res.error);
    else setActionModal(null);
  };

  return (
    <div className="bg-white p-5 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-8">
      
      {project.isManager && pendingExpenses.length > 0 && (
        <div className="bg-orange-50 p-4 sm:p-5 rounded-2xl border border-orange-200 shadow-sm transition-all">
          <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Pending Expense Approvals ({pendingExpenses.length})
          </h4>
          <div className="flex flex-col gap-2">
            {pendingExpenses.map((exp: any) => (
              <div key={exp.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-xl border border-orange-100 shadow-sm gap-3">
                <div>
                  {exp.description.includes('Total Budget') ? (
                    <p className="text-sm font-bold text-gray-900">{exp.updatedBy} requested Total Budget change to <span className="text-blue-600">₱{exp.newTotal.toLocaleString()}</span></p>
                  ) : (
                    <p className="text-sm font-bold text-gray-900">{exp.updatedBy} requested <span className="text-red-600">₱{exp.amountChange.toLocaleString()}</span></p>
                  )}
                  <p className="text-xs text-gray-500 font-medium">{exp.category}: {exp.description}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setActionModal({ type: 'approve', id: exp.id })} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 bg-[#E6F4EA] text-[#1B4332] rounded-lg text-xs font-bold hover:bg-green-100 transition-colors disabled:opacity-50">Approve</button>
                  <button onClick={() => setActionModal({ type: 'reject', id: exp.id })} disabled={isLoading} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!actionModal} onOpenChange={(open) => { if(!open) { setActionModal(null); setFormError(""); } }}>
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader><DialogTitle>
            {actionModal?.type === 'approve' ? "Approve Request" : actionModal?.type === 'reject' ? "Reject Request" : "Reverse Entry"}
          </DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            {formError && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">{formError}</div>}
            <p className="text-sm text-gray-600">
              {actionModal?.type === 'approve' && "Are you sure you want to approve this request? It will permanently alter the project's official budget."}
              {actionModal?.type === 'reject' && "Are you sure you want to reject this request? It will be marked as rejected in the audit trail."}
              {actionModal?.type === 'reverse' && "Are you sure you want to reverse this entry? This action will permanently void the original log and create a Correction record."}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setActionModal(null); setFormError(""); }} disabled={isLoading} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={executeAction} disabled={isLoading} className={`flex-1 py-2.5 text-white font-semibold rounded-xl flex items-center justify-center ${actionModal?.type === 'approve' ? 'bg-[#1B4332] hover:bg-green-900' : 'bg-red-600 hover:bg-red-700'}`}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h3 className="text-sm font-bold text-gray-600">Total Budget Allocation</h3>
          <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">Approved</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-2xl sm:text-3xl font-bold text-[#1B4332] break-all">₱{totalBudget.toLocaleString()}</span>

          <Dialog open={isBudgetEditOpen} onOpenChange={(open) => { setIsBudgetEditOpen(open); setFormError(""); }}>
            <DialogTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors p-1"><Edit2 className="w-5 h-5" /></button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw]">
              <DialogHeader><DialogTitle>{project.isManager ? "Adjust Total Budget" : "Request Budget Adjustment"}</DialogTitle></DialogHeader>
              <form onSubmit={handleBudgetUpdate} className="space-y-4 mt-4">
                <p className="text-xs text-orange-600 font-medium bg-orange-50 p-3 rounded-lg border border-orange-100">
                  ⚠️ {project.isManager ? "Adjusting the total budget will be recorded in the public audit trail." : "Your request will be submitted to the Project Manager for approval."}
                </p>
                {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">New Total Budget (₱)</label>
                  <input name="totalBudget" type="number" defaultValue={totalBudget} required min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl flex items-center justify-center">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (project.isManager ? "Confirm Adjustment" : "Submit Request")}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-gray-400 font-medium italic">Last modified: {new Date(project.updated_at).toLocaleString()} by {lastEditor}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1 uppercase">Total Allocated</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-700 break-all">₱{totalBudget.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1 uppercase">Budget Used</p>
          <p className="text-xl sm:text-2xl font-bold text-red-500 break-all">₱{spentBudget.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm flex flex-col justify-center sm:col-span-2 lg:col-span-1">
          <p className="text-[11px] sm:text-xs font-bold text-gray-500 mb-1 uppercase">Remaining</p>
          <p className="text-xl sm:text-2xl font-bold text-green-500 break-all">₱{remaining.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-sm font-bold text-gray-900">Expense Breakdown</h3>
          <Dialog open={isExpenseOpen} onOpenChange={(open) => { setIsExpenseOpen(open); setFormError(""); }}>
            <DialogTrigger asChild>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-green-900 text-white px-4 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-4 h-4" /> {project.isManager ? "Record Expense" : "Request Expense"}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{project.isManager ? "Record New Expense" : "Request Expense Approval"}</DialogTitle></DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
                {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{formError}</div>}
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
                  <select name="category" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]">
                    <option value="Venue">Venue</option><option value="Catering">Catering</option><option value="Marketing">Marketing</option><option value="Equipment">Equipment</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Amount (₱)</label>
                  <input name="amount" type="number" required min="1" max={remaining} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Description</label>
                  <input name="description" required placeholder="Description of expense" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4332]" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-[#1B4332] text-white font-bold py-3 rounded-xl flex items-center justify-center">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (project.isManager ? "Record Expense" : "Submit for Approval")}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="w-full overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full text-sm text-left min-w-125">
            <thead className="text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="pb-3 font-semibold px-2">Category</th>
                <th className="pb-3 font-semibold px-2">Amount</th>
                <th className="pb-3 font-semibold px-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-gray-500 text-center">No approved expenses recorded yet.</td></tr>
              )}
              {expenses.map((exp: any) => (
                <tr key={exp.id} className={`text-gray-900 font-medium ${exp.status === 'Adjusted' ? 'opacity-50' : ''}`}>
                  <td className="py-4 px-2">
                    {exp.category}
                    {exp.status === 'Adjusted' && <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Voided</span>}
                  </td>
                  <td className="py-4 px-2 font-bold text-red-500">₱{exp.amountChange.toLocaleString()}</td>
                  <td className="py-4 px-2 text-gray-500 font-normal">
                    {exp.status === 'Adjusted' ? <><span className="text-red-500 font-bold mr-1">[Voided Entry]</span><span className="line-through">{exp.description}</span></> : exp.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Budget Audit Trail
        </h3>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.25 before:h-full before:w-0.5 before:bg-gray-100">
          {budgetUpdates?.map((log: any) => {
            
            const isReversible = !log.category?.includes('Correction') && !log.description.includes('Correction');

            return (
              <div key={log.id} className={`relative flex items-start gap-4 sm:gap-6 group ${log.status === 'Adjusted' || log.status === 'Rejected' ? 'opacity-50' : ''}`}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 border-white ${log.isInitial ? "bg-blue-100 text-blue-600" : log.status === 'Adjusted' ? "bg-gray-200 text-gray-500" : log.status === 'Rejected' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"} shrink-0 shadow-sm z-10`}>
                  {log.isInitial ? <CheckCircle2 className="w-4 h-4" /> : <Receipt className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                  
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-sm ${log.status === 'Adjusted' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {log.category !== 'General' ? `${log.category}: ` : ''}{log.description}
                      </h4>
                      {log.status === 'Adjusted' && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">Voided</span>}
                      {log.status === 'Pending' && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">Pending</span>}
                      {log.status === 'Rejected' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Rejected</span>}
                    </div>
                    <div className="flex justify-between items-center w-full mt-1 border-t border-gray-50 pt-2">
                      <p className="text-[11px] text-gray-500 font-medium">Updated by: <span className="font-semibold text-gray-700">{log.updatedBy}</span></p>
                      <time className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{log.date}</time>
                    </div>
                  </div>
                  
                  <div className="mt-1 text-[10px] font-bold text-gray-400 flex flex-wrap items-center gap-2 bg-gray-50 px-2 py-1 rounded-md w-max">
                    <span>₱{log.oldTotal.toLocaleString()}</span><span>➔</span>
                    <span className={log.status === 'Adjusted' ? 'text-gray-400' : 'text-[#1B4332]'}>₱{log.newTotal.toLocaleString()}</span>
                  </div>

                  {project.isManager && log.status === 'Approved' && !log.isInitial && isReversible && (
                    <button onClick={() => setActionModal({type: 'reverse', id: log.id})} disabled={isLoading} className="mt-3 text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50">
                      <RotateCcw className="w-3 h-3" /> Reverse / Correct Entry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}