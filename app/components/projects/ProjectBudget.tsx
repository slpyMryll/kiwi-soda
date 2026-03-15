interface ProjectBudgetProps {
  totalBudget: number;
  spentBudget: number;
}

export function ProjectBudget({ totalBudget, spentBudget }: ProjectBudgetProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#1B4332] mb-4">Budget Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <div>
          <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Total Budget</p>
              <p className="text-xl font-bold text-gray-900">₱{totalBudget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Amount Spent</p>
              <p className="text-xl font-bold text-[#FFB703]">₱{spentBudget.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm font-medium text-gray-700">
            <div className="flex justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <span className="flex items-center gap-3"><div className="w-3 h-3 bg-[#1B4332] rounded-sm"/> Venue & Equipment</span> 
              <span className="text-gray-500">₱1,500</span>
            </div>
            <div className="flex justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <span className="flex items-center gap-3"><div className="w-3 h-3 bg-[#FFB703] rounded-sm"/> Marketing</span> 
              <span className="text-gray-500">₱600</span>
            </div>
            <div className="flex justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <span className="flex items-center gap-3"><div className="w-3 h-3 bg-[#52B788] rounded-sm"/> Catering</span> 
              <span className="text-gray-500">₱950</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-48 h-48 rounded-full border-32 border-[#1B4332] border-r-[#FFB703] border-b-[#FFB703] border-l-[#52B788]" />
        </div>
      </div>
    </section>
  );
}