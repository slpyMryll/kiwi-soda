import { CheckCircle2, Receipt, Clock } from "lucide-react";

export function ProjectBudgetHistory({ updates, isGuest }: { updates?: any[], isGuest: boolean }) {
  if (!updates || updates.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1B4332] mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" /> Budget Audit Trail
      </h2>
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.25 before:h-full before:w-0.5 before:bg-gray-100">
        {updates.map((log: any) => (
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
                <div className="flex justify-between items-center w-full">
                  <p className="text-xs text-gray-500 font-medium">Updated by: <span className="font-semibold text-gray-700">{log.updatedBy}</span></p>
                  <time className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{log.date}</time>
                </div>
              </div>
              
              <div className="mt-2 text-[10px] font-bold text-gray-400 flex flex-wrap items-center gap-2">
                <span>₱{log.oldTotal.toLocaleString()}</span><span>➔</span>
                <span className={log.status === 'Adjusted' ? 'text-gray-400' : 'text-[#1B4332]'}>₱{log.newTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}