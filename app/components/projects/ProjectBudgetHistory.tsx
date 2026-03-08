import { TrendingUp, TrendingDown, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectBudgetUpdate } from "@/types/projects";

interface ProjectBudgetHistoryProps {
  updates?: ProjectBudgetUpdate[];
  isGuest?: boolean;
}

export function ProjectBudgetHistory({ updates = [], isGuest = false }: ProjectBudgetHistoryProps) {
  const router = useRouter();

  if (isGuest) {
    return (
      <section>
        <h2 className="text-lg font-bold text-[#1B4332] mb-6">Budget Update History</h2>
        <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Detailed History Locked</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Please login to view the complete budget update timeline, including specific transaction amounts and authorizing personnel.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-[#1B4332] hover:bg-green-900 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            Login to View History
          </button>
        </div>
      </section>
    );
  }

  if (!updates || updates.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-[#1B4332] mb-6">Budget Update History</h2>
      
      <div className="relative border-l-2 border-gray-200 ml-4 space-y-6 pb-4">
        {updates.map((update) => {
          const isPositive = update.amountChange > 0;
          
          return (
            <div key={update.id} className="relative pl-8">
              <div className={`absolute -left-4.25 top-4 ${update.isInitial ? 'bg-[#E2E8F0]' : (isPositive ? 'bg-[#52B788]' : 'bg-red-500')} w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm`}>
                {!update.isInitial && (
                  isPositive ? <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} /> : <TrendingDown className="w-4 h-4 text-white" strokeWidth={2.5} />
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400">{update.date}</span> 
                  {!update.isInitial && (
                    <span className={`text-xs font-bold ${isPositive ? 'text-[#52B788]' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}₱{update.amountChange.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <p className="text-sm font-semibold text-gray-800 mb-2">{update.description}</p>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Updated by {update.updatedBy}</span>
                  <span>₱{update.oldTotal.toLocaleString()} ➔ ₱{update.newTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}