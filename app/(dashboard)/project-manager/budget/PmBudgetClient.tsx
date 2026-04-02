"use client";

import { useState } from "react";
import { 
  Search, LayoutGrid, List as ListIcon, Wallet, 
  ArrowUpRight, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProjectBudget {
  id: string;
  title: string;
  totalBudget: number;
  spentBudget: number;
  imageUrl?: string;
  status: string;
  deadline?: string;
}

export function PmBudgetClient({ initialProjects }: { initialProjects: ProjectBudget[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = initialProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPHP = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getBudgetStatus = (spent: number, total: number) => {
    const ratio = total > 0 ? spent / total : 0;
    if (ratio > 1) return { label: "Over Budget", color: "text-red-600 bg-red-50", bar: "bg-red-500" };
    if (ratio > 0.85) return { label: "Critical", color: "text-orange-600 bg-orange-50", bar: "bg-orange-500" };
    return { label: "On Track", color: "text-green-600 bg-green-50", bar: "bg-green-500" };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] min-h-screen flex flex-col gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#153B44] tracking-tight">Budget Monitoring</h1>
          <p className="text-sm sm:text-[15px] text-gray-500 mt-1">Consolidated oversight of funding across all managed projects.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search project titles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#153B44]/20 shadow-sm"
            />
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-full sm:w-auto justify-center">
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center", viewMode === "list" ? "bg-gray-100 text-[#153B44] shadow-sm" : "text-gray-400")}>
              <ListIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-md transition-all flex-1 sm:flex-none flex justify-center", viewMode === "grid" ? "bg-gray-100 text-[#153B44] shadow-sm" : "text-gray-400")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => {
            const status = getBudgetStatus(project.spentBudget, project.totalBudget);
            const percentage = project.totalBudget > 0 ? Math.min((project.spentBudget / project.totalBudget) * 100, 100) : 0;

            return (
              <div key={project.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-[#153B44]/30 hover:shadow-md transition-all flex flex-col gap-4 group">
                <div className="flex justify-between items-start">
                  <div className="bg-gray-50 group-hover:bg-[#153B44]/5 p-2.5 rounded-xl transition-colors">
                    <Wallet className="w-5 h-5 text-gray-500 group-hover:text-[#153B44] transition-colors" />
                  </div>
                  <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider", status.color)}>
                    {status.label}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-[#153B44] transition-colors">{project.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Remaining: {formatPHP(project.totalBudget - project.spentBudget)}</p>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Spend Progress</span>
                    <span className="text-gray-900">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-500", status.bar)} style={{ width: `${percentage}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 mt-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Allocated</p>
                    <p className="text-sm font-bold text-gray-900">{formatPHP(project.totalBudget)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Utilized</p>
                    <p className="text-sm font-bold text-gray-900">{formatPHP(project.spentBudget)}</p>
                  </div>
                </div>

                <Link 
                  href={`/project-manager/projects/${project.id}?tab=Budget`}
                  className="w-full py-2.5 mt-auto rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-[#153B44] hover:text-white hover:border-[#153B44] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Manage Details <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredProjects.map((project) => {
            const status = getBudgetStatus(project.spentBudget, project.totalBudget);
            return (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-[#153B44]/20 transition-colors">
                
                <div className="px-4 md:px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-bold text-[#153B44] text-base truncate">{project.title}</h3>
                  <Link 
                    href={`/project-manager/projects/${project.id}?tab=Budget`}
                    className="text-xs font-bold text-white bg-[#153B44] hover:bg-[#1B4B57] px-4 py-2 rounded-lg flex items-center justify-center sm:justify-start gap-2 transition-colors w-full sm:w-fit shadow-sm"
                  >
                    Manage Budget <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="w-full">
                  <table className="w-full block md:table">
                    
                    <thead className="hidden md:table-header-group bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <tr className="md:table-row">
                        <th className="px-6 py-4 text-left">Total Allocation</th>
                        <th className="px-6 py-4 text-left">Amount Spent</th>
                        <th className="px-6 py-4 text-left">Balance</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    
                    <tbody className="block md:table-row-group divide-y divide-gray-100 md:divide-gray-50">
                      <tr className="block md:table-row text-sm font-medium text-gray-700 hover:bg-gray-50/50 transition-colors">
                        
                        <td className="block md:table-cell px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:items-start border-b md:border-none border-gray-50">
                          <span className="md:hidden text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Allocation</span>
                          <span className="text-gray-900 font-semibold">{formatPHP(project.totalBudget)}</span>
                        </td>
                        
                        <td className="block md:table-cell px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:items-start border-b md:border-none border-gray-50">
                          <span className="md:hidden text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount Spent</span>
                          <span className="text-gray-900 font-semibold">{formatPHP(project.spentBudget)}</span>
                        </td>
                        
                        <td className="block md:table-cell px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:items-start border-b md:border-none border-gray-50">
                          <span className="md:hidden text-[11px] font-bold text-gray-400 uppercase tracking-wider">Balance</span>
                          <span className="text-gray-900 font-semibold">{formatPHP(project.totalBudget - project.spentBudget)}</span>
                        </td>
                        
                        <td className="block md:table-cell px-4 py-3 md:px-6 md:py-4 flex justify-between items-center md:text-right">
                          <span className="md:hidden text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                          <span className={cn("px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wide", status.color)}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm mt-4">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Projects Found</h3>
          <p className="text-sm text-gray-500 font-medium text-center max-w-sm">
            {searchQuery ? "We couldn't find any projects matching your search." : "You are not currently managing any projects."}
          </p>
        </div>
      )}
    </div>
  );
}