"use client";

import { CheckCircle2, PhilippinePeso, BarChart3, TrendingUp } from "lucide-react";

export function TransparencyClient({ stats, termName }: any) {
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-green-600 mb-4" />
          <p className="text-sm font-bold text-gray-500">Project Completion</p>
          <h3 className="text-3xl font-black text-gray-900">{completionRate.toFixed(0)}%</h3>
          <p className="text-xs text-gray-400 mt-1">{stats.completed} of {stats.total} projects finalized</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <PhilippinePeso className="w-8 h-8 text-blue-600 mb-4" />
          <p className="text-sm font-bold text-gray-500">Funds Transferred</p>
          <h3 className="text-3xl font-black text-gray-900">₱{stats.totalSpent.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-1">Total expenses logged this term</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <BarChart3 className="w-8 h-8 text-orange-600 mb-4" />
          <p className="text-sm font-bold text-gray-500">Impact Score</p>
          <h3 className="text-3xl font-black text-gray-900">High</h3>
          <p className="text-xs text-gray-400 mt-1">Real-time data synchronization enabled</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Organizational Commitment</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            The {termName || "current"} Visayas State University Supreme Student Council (VSU-USSC) is committed to 100% transparency. This hub provides a direct window into our project lifecycles and financial allocations.
          </p>
        </div>
        <TrendingUp className="absolute -bottom-10 -right-10 w-48 h-48 text-gray-50 opacity-50" />
      </div>
    </div>
  );
}