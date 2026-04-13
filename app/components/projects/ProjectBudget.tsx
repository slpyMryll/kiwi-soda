"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ProjectBudgetProps {
  totalBudget: number;
  spentBudget: number;
  updates?: any[];
}

export function ProjectBudget({ totalBudget, spentBudget, updates = [] }: ProjectBudgetProps) {
  
  const breakdown = useMemo(() => {
    const categories: Record<string, number> = {};

    const validExpenses = updates.filter((u: any) => 
      !u.isInitial && u.amountChange !== 0 && (u.status === 'Approved' || u.status === 'Adjusted') &&
      !u.description.includes('Total Budget') && !u.category?.includes('Total Budget') &&
      !u.category?.includes('Correction') && !u.description.includes('Correction')
    );

    validExpenses.forEach((log: any) => {
      if (log.status === 'Approved') {
        const cat = log.category && log.category !== "General" ? log.category : "Uncategorized";
        const amount = Math.abs(log.amountChange);
        categories[cat] = (categories[cat] || 0) + amount;
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [updates]);

  const HEX_COLORS = ["#1B4332", "#FFB703", "#52B788", "#FF8500", "#2D6A4F", "#023047", "#8ECAE6", "#219EBC", "#FB8500"];
  const BG_COLORS = ["bg-[#1B4332]", "bg-[#FFB703]", "bg-[#52B788]", "bg-[#FF8500]", "bg-[#2D6A4F]", "bg-[#023047]", "bg-[#8ECAE6]", "bg-[#219EBC]", "bg-[#FB8500]"];

  let gradientString = "#f3f4f6";
  if (breakdown.length > 0) {
    let currentPercent = 0;
    const totalAmount = breakdown.reduce((acc, item) => acc + item.value, 0) || 1;
    
    const gradientParts = breakdown.map((item, index) => {
      const start = currentPercent;
      currentPercent += (item.value / totalAmount) * 100;
      const end = currentPercent;
      return `${HEX_COLORS[index % HEX_COLORS.length]} ${start}% ${end}%`;
    });
    
    gradientString = `conic-gradient(${gradientParts.join(", ")})`;
  }

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
            {breakdown.length > 0 ? (
              breakdown.map((item, index) => (
                <div key={item.name} className="flex justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <span className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-sm", BG_COLORS[index % BG_COLORS.length])}/> 
                    {item.name}
                  </span> 
                  <span className="text-gray-500">₱{item.value.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="flex justify-center bg-white p-4 rounded-xl border border-dashed border-gray-200">
                <span className="text-gray-400 text-xs italic">No expenses categorized yet.</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <div 
            className="w-48 h-48 rounded-full shadow-inner" 
            style={{ background: gradientString }}
          />
        </div>
      </div>
    </section>
  );
}